import type {
  RequestFn,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  TokenResponse,
  MessageResponse,
} from "../types";

export interface AuthPublicController {
  login(options: {
    body: LoginRequest;
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  register(options: {
    body: RegisterRequest;
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  verifyEmail(options: {
    body: { token: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  forgotPassword(options: {
    body: { email: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  resetPassword(options: {
    body: { token: string; newPassword: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
  refreshToken(options: {
    body: { refreshToken: string };
    signal?: AbortSignal;
  }): ReturnType<RequestFn>;
}

export function createAuthPublicController(
  request: RequestFn,
): AuthPublicController {
  return {
    login: (options) =>
      request<LoginResponse>("POST", "/v1/auth/login", {
        body: options.body,
        signal: options.signal,
      }),

    register: (options) =>
      request<MessageResponse>("POST", "/v1/auth/register", {
        body: options.body,
        signal: options.signal,
      }),

    verifyEmail: (options) =>
      request<MessageResponse>("POST", "/v1/auth/verify-email", {
        body: options.body,
        signal: options.signal,
      }),

    forgotPassword: (options) =>
      request<MessageResponse>("POST", "/v1/auth/forgot-password", {
        body: options.body,
        signal: options.signal,
      }),

    resetPassword: (options) =>
      request<MessageResponse>("POST", "/v1/auth/reset-password", {
        body: options.body,
        signal: options.signal,
      }),

    refreshToken: (options) =>
      request<TokenResponse>("POST", "/v1/auth/refresh-token", {
        body: options.body,
        signal: options.signal,
      }),
  };
}
