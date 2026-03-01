import type {
  RequestFn,
  LabReportResponse,
  PaginatedResponse,
  TrendAnalysis,
  CompareResult,
  MessageResponse,
} from "../types";

export interface LabReportsController {
  upload(options: {
    body: FormData;
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  rerun(options: {
    params: { id: string };
    body?: { model?: string; personaId?: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  list(options?: {
    query?: { page?: number; limit?: number; status?: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  getById(options: {
    params: { id: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  delete(options: {
    params: { id: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  getTrends(options: {
    query: { test: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  compare(options: {
    query: { reportA: string; reportB: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
}

export function createLabReportsController(
  request: RequestFn,
): LabReportsController {
  return {
    upload: (options) =>
      request<LabReportResponse>("POST", "/v1/lab-reports/upload", {
        body: options.body,
        signal: options.signal,
      }),

    rerun: (options) =>
      request<MessageResponse>(
        "POST",
        `/v1/lab-reports/${options.params.id}/rerun`,
        {
          body: options.body,
          signal: options.signal,
        },
      ),

    list: (options) =>
      request<PaginatedResponse<LabReportResponse>>("GET", "/v1/lab-reports", {
        query: options?.query as Record<string, unknown>,
        signal: options?.signal,
      }),

    getById: (options) =>
      request<LabReportResponse>(
        "GET",
        `/v1/lab-reports/${options.params.id}`,
        {
          signal: options.signal,
        },
      ),

    delete: (options) =>
      request<MessageResponse>(
        "DELETE",
        `/v1/lab-reports/${options.params.id}`,
        {
          signal: options.signal,
        },
      ),

    getTrends: (options) =>
      request<TrendAnalysis>("GET", "/v1/lab-reports/trends", {
        query: options.query as Record<string, unknown>,
        signal: options.signal,
      }),

    compare: (options) =>
      request<CompareResult>("GET", "/v1/lab-reports/compare", {
        query: options.query as Record<string, unknown>,
        signal: options.signal,
      }),
  };
}
