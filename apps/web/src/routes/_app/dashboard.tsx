import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Activity,
  AlertTriangle,
  TrendingUp,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { labReportsService } from "@/services/lab-reports.service";
import { getSocket } from "@/lib/socket";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [processingReports, setProcessingReports] = useState<
    Record<string, number>
  >({});

  const { data, refetch } = labReportsService.useLabReports(
    { query: { page: 1, limit: 5 } },
    { enabled: true },
  );

  const reports = (data as any)?.data ?? [];
  const meta = (data as any)?.meta;
  const totalReports = meta?.total ?? 0;
  const completedReports = reports.filter((r: any) => r.status === "COMPLETED");
  const criticalCount = completedReports.filter(
    (r: any) => r.riskScore && r.riskScore > 70,
  ).length;
  const latestReport = completedReports[0];

  useEffect(() => {
    const socket = getSocket();

    socket.on("lab-report:processing", (data: any) => {
      setProcessingReports((prev) => ({
        ...prev,
        [data.reportId]: data.progress,
      }));
    });

    socket.on("lab-report:completed", () => {
      refetch();
      setProcessingReports({});
    });

    socket.on("lab-report:failed", () => {
      refetch();
      setProcessingReports({});
    });

    return () => {
      socket.off("lab-report:processing");
      socket.off("lab-report:completed");
      socket.off("lab-report:failed");
    };
  }, [refetch]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hello, {user?.name || "User"}</h1>
        <p className="text-muted-foreground mt-1">Your health dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<FileText className="h-6 w-6 text-primary" />}
          value={totalReports}
          label="Total Reports"
          bg="bg-primary/5"
        />
        <StatCard
          icon={<Activity className="h-6 w-6 text-green-600" />}
          value={completedReports.length}
          label="Analyzed"
          bg="bg-green-50"
        />
        <StatCard
          icon={
            <AlertTriangle
              className="h-6 w-6"
              style={{ color: criticalCount > 0 ? "#dc2626" : "#94a3b8" }}
            />
          }
          value={criticalCount}
          label="Critical"
          bg={criticalCount > 0 ? "bg-red-50" : "bg-slate-50"}
        />
      </div>

      {/* Processing */}
      {Object.keys(processingReports).length > 0 && (
        <div className="bg-primary/5 rounded-xl p-5 mb-8 border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="font-semibold text-primary">
              Processing Reports...
            </span>
          </div>
          {Object.entries(processingReports).map(([id, progress]) => (
            <div
              key={id}
              className="h-2 bg-primary/10 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Report */}
        {latestReport && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Latest Report</h2>
            <Link
              to="/reports/$id"
              params={{ id: latestReport.id }}
              className="block bg-white rounded-xl p-6 border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">
                  {latestReport.title || "Lab Report"}
                </h3>
                {latestReport.riskScore != null && (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      latestReport.riskScore > 70
                        ? "bg-red-50 text-red-600"
                        : latestReport.riskScore > 30
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    Risk: {latestReport.riskScore}/100
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {latestReport.summary
                  ? latestReport.summary.substring(0, 150) + "..."
                  : "Processing..."}
              </p>
              <span className="text-primary text-sm font-medium mt-3 inline-block">
                View Details →
              </span>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/upload"
              className="bg-white rounded-xl p-6 border text-center hover:shadow-md transition-shadow"
            >
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <span className="font-medium">Upload Report</span>
            </Link>
            <Link
              to="/reports"
              className="bg-white rounded-xl p-6 border text-center hover:shadow-md transition-shadow"
            >
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <span className="font-medium">View All Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-6 flex items-center gap-4`}>
      {icon}
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
