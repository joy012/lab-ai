import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  Apple,
  Activity,
  Globe,
  ChevronLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { labReportsService } from "@/services/lab-reports.service";

export const Route = createFileRoute("/_app/reports/$id")({
  component: ReportDetailPage,
});

type LabValue = {
  test: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
};

function ReportDetailPage() {
  const { id } = Route.useParams();
  const [language, setLanguage] = useState<"en" | "bn">("en");

  const { data: report, isLoading } = labReportsService.useLabReport(
    { params: { id } },
    { enabled: !!id },
  );

  const { mutate: deleteReport } = labReportsService.useDeleteLabReport({
    onSuccess: () => {
      toast.success("Report deleted");
      window.history.back();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const r = report as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!r) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    );
  }

  if (r.status === "PROCESSING") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <h2 className="text-lg font-semibold">Analyzing your report...</h2>
        <p className="text-muted-foreground">
          AI is extracting values and generating interpretation
        </p>
      </div>
    );
  }

  if (r.status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <AlertTriangle className="h-12 w-12 text-red-600" />
        <h2 className="text-lg font-semibold text-red-600">Analysis Failed</h2>
        <p className="text-muted-foreground">
          {r.errorMessage || "Unknown error"}
        </p>
      </div>
    );
  }

  const values: LabValue[] = r.values || [];
  const recs = r.recommendations as any;
  const criticalValues = values.filter((v) => v.status === "critical");
  const abnormalValues = values.filter(
    (v) => v.status === "high" || v.status === "low",
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{r.title || "Lab Report"}</h1>
            <p className="text-sm text-muted-foreground">
              Uploaded {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this report?")) {
              deleteReport({ params: { id } });
            }
          }}
          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Risk Score */}
      {r.riskScore != null && (
        <div className="bg-white rounded-xl border p-8 mb-6 flex items-center gap-8">
          <div
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${
              r.riskScore > 70
                ? "border-red-500"
                : r.riskScore > 30
                  ? "border-amber-500"
                  : "border-green-500"
            }`}
          >
            <span
              className={`text-3xl font-extrabold ${
                r.riskScore > 70
                  ? "text-red-600"
                  : r.riskScore > 30
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {r.riskScore}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Risk Score
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">
              {r.riskScore > 70
                ? "High risk — consult your doctor"
                : r.riskScore > 30
                  ? "Moderate risk — monitor closely"
                  : "Low risk — looking good!"}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">
                {values.length} tests · {abnormalValues.length} abnormal ·{" "}
                {criticalValues.length} critical
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalValues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-600">Critical Values</h3>
          </div>
          {criticalValues.map((v, i) => (
            <p key={i} className="text-red-800 text-sm mb-1">
              {v.test}: {v.value} {v.unit} (Ref: {v.referenceRange})
            </p>
          ))}
        </div>
      )}

      {/* AI Interpretation */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">AI Interpretation</h3>
          </div>
          {r.summaryBn && (
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "বাংলা" : "English"}
            </button>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {language === "bn" && r.summaryBn ? r.summaryBn : r.summary}
        </p>
      </div>

      {/* Lab Values */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">
            Lab Values ({values.length})
          </h3>
        </div>
        <div className="divide-y">
          {values.map((v, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{v.test}</p>
                <p className="text-xs text-muted-foreground">
                  Ref: {v.referenceRange}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold ${
                    v.status === "critical"
                      ? "text-red-600"
                      : v.status === "high"
                        ? "text-amber-600"
                        : v.status === "low"
                          ? "text-primary"
                          : "text-green-600"
                  }`}
                >
                  {v.value} {v.unit}
                </span>
                <StatusIcon status={v.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recs && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Apple className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-lg">Recommendations</h3>
          </div>
          <div className="space-y-4">
            {recs.diet?.length > 0 && (
              <RecGroup
                title="Diet"
                items={recs.diet}
                color="text-green-700"
                bg="bg-green-50"
              />
            )}
            {recs.lifestyle?.length > 0 && (
              <RecGroup
                title="Lifestyle"
                items={recs.lifestyle}
                color="text-primary"
                bg="bg-primary/5"
              />
            )}
            {recs.followUp?.length > 0 && (
              <RecGroup
                title="Follow-up"
                items={recs.followUp}
                color="text-amber-700"
                bg="bg-amber-50"
              />
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white rounded-xl border p-6">
        <div className="divide-y">
          {r.labName && <MetaRow label="Lab" value={r.labName} />}
          {r.reportDate && (
            <MetaRow
              label="Report Date"
              value={new Date(r.reportDate).toLocaleDateString()}
            />
          )}
          <MetaRow
            label="Uploaded"
            value={new Date(r.createdAt).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "high" || status === "critical")
    return (
      <ArrowUp
        className={`h-4 w-4 ${status === "critical" ? "text-red-600" : "text-amber-600"}`}
      />
    );
  if (status === "low") return <ArrowDown className="h-4 w-4 text-primary" />;
  return <CheckCircle className="h-4 w-4 text-green-600" />;
}

function RecGroup({
  title,
  items,
  color,
  bg,
}: {
  title: string;
  items: string[];
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <h4 className={`font-semibold text-sm mb-2 ${color}`}>{title}</h4>
      {items.map((item: string, i: number) => (
        <p key={i} className="text-sm text-muted-foreground mb-1">
          • {item}
        </p>
      ))}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
