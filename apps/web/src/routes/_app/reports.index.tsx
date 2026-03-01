import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { labReportsService } from "@/services/lab-reports.service";

export const Route = createFileRoute("/_app/reports/")({
  component: ReportsListPage,
});

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: any; label: string }
> = {
  PENDING: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Clock,
    label: "Pending",
  },
  PROCESSING: {
    color: "text-primary",
    bg: "bg-primary/5",
    icon: Loader2,
    label: "Processing",
  },
  COMPLETED: {
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
    label: "Completed",
  },
  FAILED: {
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
    label: "Failed",
  },
};

function ReportsListPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = labReportsService.useLabReports(
    { query: { page, limit: 20 } },
    { enabled: true },
  );

  const reports = (data as any)?.data ?? [];
  const meta = (data as any)?.meta;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lab Reports</h1>
          <p className="text-muted-foreground mt-1">
            {meta?.total ?? 0} total reports
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Upload New
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            No reports yet
          </h2>
          <p className="text-muted-foreground mt-1">
            Upload your first lab report to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => {
            const status =
              STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = status.icon;

            return (
              <Link
                key={report.id}
                to="/reports/$id"
                params={{ id: report.id }}
                className="flex items-center gap-4 bg-white rounded-xl p-5 border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {report.title || "Lab Report"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded mt-1 ${status.bg} ${status.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {report.riskScore != null &&
                    report.status === "COMPLETED" && (
                      <div className="flex items-center gap-1">
                        {report.riskScore > 70 && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-lg font-bold ${
                            report.riskScore > 70
                              ? "text-red-600"
                              : report.riskScore > 30
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {report.riskScore}
                        </span>
                      </div>
                    )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-accent"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-accent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
