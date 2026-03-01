import type {
  RequestFn,
  UserResponse,
  UpdateProfileRequest,
  MessageResponse,
} from "../types";

export interface AuthPrivateController {
  me(options?: { signal?: AbortSignal }): ReturnType<RequestFn>;
  updateProfile(options: {
    body: UpdateProfileRequest;
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  deleteAccount(options?: { signal?: AbortSignal }): ReturnType<RequestFn>;
}

export function createAuthPrivateController(
  request: RequestFn,
): AuthPrivateController {
  return {
    me: (options) =>
      request<UserResponse>("GET", "/v1/auth/me", {
        signal: options?.signal,
      }),

    updateProfile: (options) =>
      request<UserResponse>("PATCH", "/v1/auth/me", {
        body: options.body,
        signal: options.signal,
      }),

    deleteAccount: (options) =>
      request<MessageResponse>("DELETE", "/v1/auth/me", {
        signal: options?.signal,
      }),
  };
}
