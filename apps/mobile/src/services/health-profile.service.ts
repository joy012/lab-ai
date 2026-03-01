import { queryClient } from "../utils/queryClient";
import { makeMutation, makeQuery } from "../utils/queryUtils";
import { healthProfileCtrl } from "../lib/api-client";

// ============ Keys ============
export const healthProfileServiceKeys = {
  base: "HEALTH_PROFILE",
  profile: () => ["HEALTH_PROFILE", "profile"],
};

// ============ Invalidation ============
export const invalidateHealthProfileQueries = {
  all: () =>
    queryClient.invalidateQueries({
      queryKey: [healthProfileServiceKeys.base],
    }),
};

// ============ Queries ============
const useHealthProfile = makeQuery({
  queryFunction: healthProfileCtrl.get,
  queryKeyFactory: () => healthProfileServiceKeys.profile(),
});

// ============ Mutations ============
const useUpdateHealthProfile = makeMutation({
  mutationFunction: healthProfileCtrl.update,
  onSuccess: () => invalidateHealthProfileQueries.all(),
});

// ============ Export ============
export const healthProfileService = {
  useHealthProfile,
  useUpdateHealthProfile,
};
