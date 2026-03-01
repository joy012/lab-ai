import { queryClient } from "@/utils/queryClient";
import { makeMutation, makeQuery } from "@/utils/queryUtils";
import { healthProfileCtrl } from "@/lib/api-client";

export const healthProfileServiceKeys = {
  base: "HEALTH_PROFILE",
  profile: () => ["HEALTH_PROFILE", "profile"],
};

export const invalidateHealthProfileQueries = {
  all: () =>
    queryClient.invalidateQueries({
      queryKey: [healthProfileServiceKeys.base],
    }),
};

const useHealthProfile = makeQuery({
  queryFunction: healthProfileCtrl.get,
  queryKeyFactory: () => healthProfileServiceKeys.profile(),
});

const useUpdateHealthProfile = makeMutation({
  mutationFunction: healthProfileCtrl.update,
  onSuccess: () => invalidateHealthProfileQueries.all(),
});

export const healthProfileService = {
  useHealthProfile,
  useUpdateHealthProfile,
};
