import {
  createRequestFn,
  createAuthPublicController,
  createAuthPrivateController,
  createLabReportsController,
  createHealthProfileController,
  omitCommons,
} from "@labai/api-client";
import { useAuthStore } from "@/store/auth.store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const globalStoreBridge = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setAccessToken: (token: string) =>
    useAuthStore.getState().setAccessToken(token),
  onLogout: () => useAuthStore.getState().logout(),
};

export const globalAuthRequestFunction = createRequestFn({
  baseUrl: API_URL,
  async onRequest(_url, init) {
    const headers = new Headers(init.headers);
    const accessToken = globalStoreBridge.getAccessToken();

    if (!accessToken) {
      return init;
    }

    headers.set("Authorization", `Bearer ${accessToken}`);
    return { ...init, headers };
  },
});

export const publicRequestFunction = createRequestFn({
  baseUrl: API_URL,
});

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
