import type {
  RequestFn,
  HealthProfileResponse,
  UpdateHealthProfileRequest,
} from "../types";

export interface HealthProfileController {
  get(options?: { signal?: AbortSignal }): ReturnType<RequestFn>;
  update(options: {
    body: UpdateHealthProfileRequest;
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
}

export function createHealthProfileController(
  request: RequestFn,
): HealthProfileController {
  return {
    get: (options) =>
      request<HealthProfileResponse>("GET", "/v1/health-profile", {
        signal: options?.signal,
      }),

    update: (options) =>
      request<HealthProfileResponse>("PUT", "/v1/health-profile", {
        body: options.body,
        signal: options.signal,
      }),
  };
}
