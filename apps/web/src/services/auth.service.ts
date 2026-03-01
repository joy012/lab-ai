import { queryClient } from "@/utils/queryClient";
import { makeMutation, makeQuery } from "@/utils/queryUtils";
import { authPublicCtrl, authPrivateCtrl } from "@/lib/api-client";

export const authServiceKeys = {
  base: "AUTH",
  me: () => ["AUTH", "me"],
};

export const invalidateAuthQueries = {
  all: () =>
    queryClient.invalidateQueries({ queryKey: [authServiceKeys.base] }),
  me: () => queryClient.invalidateQueries({ queryKey: authServiceKeys.me() }),
};

const useMe = makeQuery({
  queryFunction: authPrivateCtrl.me,
  queryKeyFactory: () => authServiceKeys.me(),
});

const useLogin = makeMutation({
  mutationFunction: authPublicCtrl.login,
});

const useRegister = makeMutation({
  mutationFunction: authPublicCtrl.register,
});

const useVerifyEmail = makeMutation({
  mutationFunction: authPublicCtrl.verifyEmail,
});

const useForgotPassword = makeMutation({
  mutationFunction: authPublicCtrl.forgotPassword,
});

const useResetPassword = makeMutation({
  mutationFunction: authPublicCtrl.resetPassword,
});

const useRefreshToken = makeMutation({
  mutationFunction: authPublicCtrl.refreshToken,
});

const useUpdateProfile = makeMutation({
  mutationFunction: authPrivateCtrl.updateProfile,
  onSuccess: () => invalidateAuthQueries.me(),
});

const useDeleteAccount = makeMutation({
  mutationFunction: authPrivateCtrl.deleteAccount,
});

export const authService = {
  useMe,
  useLogin,
  useRegister,
  useVerifyEmail,
  useForgotPassword,
  useResetPassword,
  useRefreshToken,
  useUpdateProfile,
  useDeleteAccount,
};
