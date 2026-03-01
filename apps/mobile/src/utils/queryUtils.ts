import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SDKResult } from "@labai/api-client";

export const makeQuery = <TParams, TResponse>({
  queryFunction,
  queryKeyFactory,
}: {
  queryFunction: (params: TParams) => Promise<SDKResult<TResponse>>;
  queryKeyFactory: (params: NoInfer<TParams>) => unknown[];
}) => {
  return (
    params: TParams,
    queryOptions?: Partial<UseQueryOptions<TResponse>>,
  ) => {
    return useQuery<TResponse>({
      queryKey: queryKeyFactory(params),
      queryFn: ({ signal }) =>
        queryFunction({ ...params, signal } as TParams).then((res) => {
          if (res.error) {
            throw new Error(res.error.message || "Request failed");
          }
          return res.data;
        }),
      ...queryOptions,
    });
  };
};

export const makeMutation = <TVariables, TResponse>({
  mutationFunction,
  onSuccess,
}: {
  mutationFunction: (vars: TVariables) => Promise<SDKResult<TResponse>>;
  onSuccess?: (vars: TVariables, res: TResponse) => void;
}) => {
  return (opts?: Partial<UseMutationOptions<TResponse, Error, TVariables>>) => {
    return useMutation<TResponse, Error, TVariables>({
      mutationFn: (vars) =>
        mutationFunction(vars).then((res) => {
          if (res.error) {
            throw new Error(res.error.message || "Request failed");
          }
          onSuccess?.(vars, res.data);
          return res.data;
        }),
      ...opts,
    });
  };
};
