import {
  createRequestFn,
  createAuthPublicController,
  createAuthPrivateController,
  createLabReportsController,
  createHealthProfileController,
  omitCommons,
} from "@labai/api-client";
import type { RequestFn } from "@labai/api-client";
import { useAuthStore } from "../store/auth.store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export const globalStoreBridge = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setAccessToken: (token: string) =>
    useAuthStore.getState().setAccessToken(token),
  onLogout: () => useAuthStore.getState().logout(),
};

// ---------- Token Refresh ----------
let refreshPromise: Promise<string | null> | null = null;

const publicRequestFunction = createRequestFn({
  baseUrl: API_URL,
});

async function doRefresh(): Promise<string | null> {
  const rt = globalStoreBridge.getRefreshToken();
  if (!rt) return null;

  try {
    const res = await publicRequestFunction<{
      accessToken: string;
      refreshToken: string;
    }>("POST", "/v1/auth/refresh-token", {
      body: { refreshToken: rt },
    });

    if (res.error || !res.data) {
      globalStoreBridge.onLogout();
      return null;
    }

    // Store new tokens (keep existing user)
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setAuth({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        user: currentUser,
      });
    }

    return res.data.accessToken;
  } catch {
    globalStoreBridge.onLogout();
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------- Auth Request Function ----------
const baseAuthRequest = createRequestFn({
  baseUrl: API_URL,
  async onRequest(_url, init) {
    const accessToken = globalStoreBridge.getAccessToken();
    if (!accessToken) return init;

    // Use plain object (not Headers class) to avoid interfering with
    // React Native's auto Content-Type detection for FormData uploads
    const existing =
      init.headers &&
      typeof init.headers === "object" &&
      !(init.headers instanceof Headers)
        ? (init.headers as Record<string, string>)
        : {};

    return {
      ...init,
      headers: {
        ...existing,
        Authorization: `Bearer ${accessToken}`,
      },
    };
  },
});

// Wrapped request that auto-refreshes expired tokens on 401
export const globalAuthRequestFunction = (<T>(
  method: string,
  path: string,
  options?: Parameters<RequestFn>[2],
) => {
  return baseAuthRequest<T>(method, path, options).then(async (result) => {
    if (result.error?.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the original request (onRequest will pick up the new token)
        return baseAuthRequest<T>(method, path, options);
      }
      // Refresh failed — user is logged out
    }
    return result;
  });
}) as RequestFn;

// ---------- Controller Instances ----------
export const authPublicCtrl = createAuthPublicController(publicRequestFunction);
export const authPrivateCtrl = createAuthPrivateController(
  globalAuthRequestFunction,
);
export const labReportsCtrl = createLabReportsController(
  globalAuthRequestFunction,
);
export const healthProfileCtrl = createHealthProfileController(
  globalAuthRequestFunction,
);

export { omitCommons };
