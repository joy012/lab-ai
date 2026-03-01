export * from "./types";
export * from "./client";
export * from "./controllers";

export const omitCommons = (data: Record<string, unknown>) => {
  const { signal, headers, ...rest } = data;
  return rest;
};
