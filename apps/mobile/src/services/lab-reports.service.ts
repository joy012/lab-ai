import { queryClient } from "../utils/queryClient";
import { makeMutation, makeQuery } from "../utils/queryUtils";
import { labReportsCtrl, omitCommons } from "../lib/api-client";

// ============ Keys ============
export const labReportServiceKeys = {
  base: "LAB_REPORT",
  list: (params?: Record<string, unknown>) => [
    labReportServiceKeys.base,
    "list",
    params ? omitCommons(params) : {},
  ],
  detail: (params: { params: { id: string } }) => [
    labReportServiceKeys.base,
    "detail",
    params.params.id,
  ],
  trends: (testName: string) => [labReportServiceKeys.base, "trends", testName],
  compare: (reportA: string, reportB: string) => [
    labReportServiceKeys.base,
    "compare",
    reportA,
    reportB,
  ],
};

// ============ Invalidation ============
export const invalidateLabReportQueries = {
  all: () =>
    queryClient.invalidateQueries({ queryKey: [labReportServiceKeys.base] }),
  list: () =>
    queryClient.invalidateQueries({
      queryKey: [labReportServiceKeys.base, "list"],
    }),
};

// ============ Queries ============
const useLabReports = makeQuery({
  queryFunction: labReportsCtrl.list,
  queryKeyFactory: (p: any) => labReportServiceKeys.list(p),
});

const useLabReport = makeQuery({
  queryFunction: labReportsCtrl.getById,
  queryKeyFactory: (p: any) => labReportServiceKeys.detail(p),
});

const useLabReportTrends = makeQuery({
  queryFunction: labReportsCtrl.getTrends,
  queryKeyFactory: (p: any) => labReportServiceKeys.trends(p?.query?.test),
});

const useCompareReports = makeQuery({
  queryFunction: labReportsCtrl.compare,
  queryKeyFactory: (p: any) =>
    labReportServiceKeys.compare(p?.query?.reportA, p?.query?.reportB),
});

// ============ Mutations ============
const useUploadLabReport = makeMutation({
  mutationFunction: labReportsCtrl.upload,
  onSuccess: () => invalidateLabReportQueries.all(),
});

const useDeleteLabReport = makeMutation({
  mutationFunction: labReportsCtrl.delete,
  onSuccess: () => invalidateLabReportQueries.all(),
});

const useRerunReport = makeMutation({
  mutationFunction: labReportsCtrl.rerun,
  onSuccess: () => invalidateLabReportQueries.all(),
});

// ============ Export ============
export const labReportsService = {
  useLabReports,
  useLabReport,
  useLabReportTrends,
  useCompareReports,
  useUploadLabReport,
  useDeleteLabReport,
  useRerunReport,
};
