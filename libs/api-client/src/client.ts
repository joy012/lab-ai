import type { SDKResult, SDKError, ClientConfig, RequestFn } from "./types";

export function createRequestFn(config: ClientConfig): RequestFn {
  return async <T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string>;
      query?: Record<string, unknown>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
      contentType?: string;
    },
  ): Promise<SDKResult<T>> => {
    let url = path;

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    if (options?.query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            searchParams.append(key, String(item));
          }
        } else {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const fullUrl = config.baseUrl.replace(/\/$/, "") + url;

    let baseHeaders: Record<string, string> = {};
    if (config.headers) {
      if (typeof config.headers === "function") {
        baseHeaders = await config.headers();
      } else {
        baseHeaders = config.headers;
      }
    }

    const allHeaders: Record<string, string> = {
      ...baseHeaders,
      ...options?.headers,
    };

    let init: RequestInit = {
      method,
      headers: allHeaders,
      signal: options?.signal,
    };

    if (options?.body !== undefined) {
      if (options.body instanceof FormData) {
        init.body = options.body;
      } else {
        init.body = JSON.stringify(options.body);
        allHeaders["Content-Type"] = "application/json";
        init.headers = allHeaders;
      }
    }

    if (config.onRequest) {
      init = await config.onRequest(fullUrl, init);
    }

    try {
      const response = await fetch(fullUrl, init);

      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text().catch(() => undefined);
        }
        console.error(`[API ${method} ${path}] ${response.status}`, errorBody);
        return {
          data: null,
          error: {
            status: response.status,
            message: (errorBody as any)?.message || response.statusText,
            body: errorBody,
          },
        };
      }

      if (response.status === 204) {
        return { data: undefined as T, error: null };
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await response.json()) as T;
        return { data, error: null };
      }

      const text = (await response.text()) as unknown as T;
      return { data: text, error: null };
    } catch (err: any) {
      // Don't log abort errors — they're normal (React Query cancellation)
      const isAbort =
        err.name === "AbortError" ||
        (err.message || "").toLowerCase().includes("abort");
      if (!isAbort) {
        console.error(`[API ${method} ${path}]`, err.message || err);
      }
      return {
        data: null,
        error: {
          status: 0,
          message: isAbort ? "Request cancelled" : err.message || "Network error",
        },
      };
    }
  };
}
