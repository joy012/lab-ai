import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserResponse } from "@labai/api-client";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: UserResponse) => void;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setUser: (user) => set({ user }),
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "labai-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
