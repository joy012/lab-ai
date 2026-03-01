import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  Apple,
  Activity,
  Globe,
  RefreshCw,
  Download,
  RotateCcw,
  HeartPulse,
} from "lucide-react-native";
import { labReportsService } from "../../src/services/lab-reports.service";
import { ReportDetailSkeleton } from "../../src/components/common/ReportDetailSkeleton";
import { ProcessingAnimation } from "../../src/components/lab-report/ProcessingAnimation";
import { ImageLightbox } from "../../src/components/common/ImageLightbox";
import { getSocket } from "../../src/lib/socket";
import { useTheme } from "../../src/theme/ThemeContext";
import { haptics } from "../../src/utils/haptics";
import { toast } from "../../src/utils/toast";
import { generateAndSharePdf } from "../../src/utils/generateReportPdf";

type LabValue = {
  test: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
};

const STATUS_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  low: 2,
  normal: 3,
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: report, isLoading, refetch } = labReportsService.useLabReport(
    { params: { id: id! } },
    { enabled: !!id },
  );

  const r = report as any;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { mutate: rerunUpload, isPending: isRerunPending } =
    labReportsService.useRerunReport({
      onSuccess: () => {
        toast.success("Re-running", "AI is re-analyzing your report.");
        refetch();
      },
      onError: (error: Error) => {
        toast.error("Re-run Failed", error.message);
      },
    });

  // Socket listeners for this report
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();

    const onProcessing = (data: any) => {
      if (data.reportId === id) {
        setProgress(data.progress || 0);
        if (data.message) setProgressMessage(data.message);
      }
    };
    const onCompleted = (data: any) => {
      if (data.reportId === id) {
        setProgress(100);
        refetch();
      }
    };
    const onFailed = (data: any) => {
      if (data.reportId === id) {
        refetch();
      }
    };

    socket.on("lab-report:processing", onProcessing);
    socket.on("lab-report:completed", onCompleted);
    socket.on("lab-report:failed", onFailed);

    return () => {
      socket.off("lab-report:processing", onProcessing);
      socket.off("lab-report:completed", onCompleted);
      socket.off("lab-report:failed", onFailed);
    };
  }, [id, refetch]);

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (!r) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Report not found
        </Text>
      </View>
    );
  }

  if (r.status === "PROCESSING" || r.status === "PENDING") {
    return <ProcessingAnimation progress={progress} message={progressMessage} />;
  }

  if (r.status === "FAILED") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.dangerLight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={36} color={colors.danger} />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Analysis Failed
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 21,
            marginBottom: 8,
          }}
        >
          {r.errorMessage || "Something went wrong while analyzing your report. Please try again."}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          This usually happens when the AI service is busy. Re-running often fixes it.
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              opacity: isRerunPending ? 0.6 : 1,
            }}
            onPress={() => {
              haptics.medium();
              rerunUpload({ params: { id: id! } });
            }}
            disabled={isRerunPending}
          >
            {isRerunPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RotateCcw size={18} color="#fff" />
            )}
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {isRerunPending ? "Re-running..." : "Re-run AI"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.surface,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.border,
            }}
            onPress={() => {
              haptics.light();
              refetch();
            }}
          >
            <RefreshCw size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: "600" }}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const values: LabValue[] = r.values || [];
  const recs = r.recommendations as any;
  const diagnosis: string[] = r.diagnosis || [];
  const diagnosisBn: string[] = r.diagnosisBn || [];
  const diagnosisStatus: string = r.diagnosisStatus || "all_clear";

  // Sort values: critical -> high -> low -> normal
  const sortedValues = [...values].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3),
  );
  const anomalyCount = values.filter((v) => v.status !== "normal").length;

  const reportImages =
    r.imageUrls?.length > 0 ? r.imageUrls : r.imageUrl ? [r.imageUrl] : [];

  const getRiskColor = (score: number) =>
    score > 70 ? colors.danger : score > 30 ? colors.warning : colors.success;

  const getDiagnosisColor = () => {
    if (diagnosisStatus === "serious") return colors.danger;
    if (diagnosisStatus === "moderate") return colors.warning;
    if (diagnosisStatus === "mild") return colors.warning;
    return colors.success;
  };

  const getDiagnosisBgColor = () => {
    if (diagnosisStatus === "serious") return colors.dangerLight;
    if (diagnosisStatus === "moderate") return colors.warningLight;
    if (diagnosisStatus === "mild") return colors.warningLight;
    return colors.successLight;
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      haptics.medium();
      await generateAndSharePdf({
        title: r.title,
        summary: r.summary,
        summaryBn: r.summaryBn,
        riskScore: r.riskScore,
        values: r.values,
        recommendations: r.recommendations,
        labName: r.labName,
        reportDate: r.reportDate,
        createdAt: r.createdAt,
      });
    } catch (err: any) {
      toast.error("PDF Error", err.message || "Could not generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const LanguageToggle = () =>
    (r.summaryBn || diagnosisBn.length > 0) ? (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.primaryLight,
        }}
        onPress={() => {
          haptics.selection();
          setLanguage(language === "en" ? "bn" : "en");
        }}
      >
        <Globe size={14} color={colors.primary} />
        <Text
          style={{
            fontSize: 12,
            color: colors.primary,
            fontWeight: "600",
          }}
        >
          {language === "en" ? "\u09AC\u09BE\u0982\u09B2\u09BE" : "English"}
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 1. Report Image(s) — tappable for lightbox */}
      {reportImages.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setLightboxIndex(0);
            setLightboxVisible(true);
          }}
        >
          <Image
            source={{ uri: reportImages[0] }}
            style={{ width: "100%", height: 200, resizeMode: "cover" }}
          />
          {reportImages.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                1/{reportImages.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* 2. Risk Score */}
      {r.riskScore != null && (
        <View
          style={{
            alignItems: "center",
            padding: 24,
            backgroundColor: colors.surface,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 4,
              borderColor: getRiskColor(r.riskScore),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: getRiskColor(r.riskScore),
              }}
            >
              {r.riskScore}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textTertiary,
                fontWeight: "600",
              }}
            >
              Risk Score
            </Text>
          </View>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}
          >
            {r.riskScore > 70
              ? "High risk \u2014 consult your doctor"
              : r.riskScore > 30
                ? "Moderate risk \u2014 monitor closely"
                : "Low risk \u2014 looking good!"}
          </Text>
        </View>
      )}

      {/* 3. Diagnosis — ALWAYS shown */}
      <View
        style={{
          backgroundColor: getDiagnosisBgColor(),
          margin: 16,
          marginBottom: 0,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: getDiagnosisColor(),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: diagnosis.length > 0 ? 10 : 0,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {diagnosisStatus === "all_clear" ? (
              <CheckCircle size={20} color={colors.success} />
            ) : diagnosisStatus === "serious" ? (
              <AlertTriangle size={20} color={colors.danger} />
            ) : (
              <HeartPulse size={20} color={getDiagnosisColor()} />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: getDiagnosisColor(),
              }}
            >
              {diagnosisStatus === "all_clear"
                ? language === "bn"
                  ? "\u09B8\u09AC \u09A0\u09BF\u0995 \u0986\u099B\u09C7"
                  : "All Clear"
                : language === "bn"
                  ? "\u09B0\u09CB\u0997 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC"
                  : "Diagnosis"}
            </Text>
          </View>
          <LanguageToggle />
        </View>

        {diagnosisStatus === "all_clear" && diagnosis.length === 0 ? (
          <Text
            style={{
              fontSize: 14,
              color: colors.success,
              lineHeight: 20,
              marginTop: 4,
            }}
          >
            {language === "bn"
              ? "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F\u09C7 \u0995\u09CB\u09A8\u09CB \u0989\u09B2\u09CD\u09B2\u09C7\u0996\u09AF\u09CB\u0997\u09CD\u09AF \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964"
              : "No significant issues found in your report."}
          </Text>
        ) : (
          <View>
            {(language === "bn" && diagnosisBn.length > 0
              ? diagnosisBn
              : diagnosis
            ).map((item, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 14,
                  color: getDiagnosisColor(),
                  marginBottom: 4,
                  lineHeight: 20,
                }}
              >
                {"\u2022"} {item}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 4. Lab Values — anomalies first */}
      <View
        style={{
          backgroundColor: colors.surface,
          margin: 16,
          marginBottom: 0,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Activity size={18} color={colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            Lab Values ({values.length})
          </Text>
          {anomalyCount > 0 && (
            <View
              style={{
                backgroundColor: colors.dangerLight,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: colors.danger }}
              >
                {anomalyCount} abnormal
              </Text>
            </View>
          )}
        </View>
        {sortedValues.map((v, i) => {
          const valueColor =
            v.status === "critical"
              ? colors.danger
              : v.status === "high"
                ? colors.warning
                : v.status === "low"
                  ? colors.info
                  : colors.success;
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: i < sortedValues.length - 1 ? 1 : 0,
                borderBottomColor: colors.borderLight,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: colors.text }}
                >
                  {v.test}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    marginTop: 2,
                  }}
                >
                  Ref: {v.referenceRange}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: valueColor }}
                >
                  {v.value} {v.unit}
                </Text>
                <StatusIcon status={v.status} colors={colors} />
              </View>
            </View>
          );
        })}
      </View>

      {/* 5. AI Interpretation */}
      <View
        style={{
          backgroundColor: colors.surface,
          margin: 16,
          marginBottom: 0,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Stethoscope size={18} color={colors.primary} />
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              AI Interpretation
            </Text>
          </View>
          <LanguageToggle />
        </View>
        <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 24 }}>
          {language === "bn" && r.summaryBn ? r.summaryBn : r.summary}
        </Text>
      </View>

      {/* 6. Recommendations */}
      {recs && (
        <View
          style={{
            backgroundColor: colors.surface,
            margin: 16,
            marginBottom: 0,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Apple size={18} color={colors.success} />
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              Recommendations
            </Text>
          </View>

          {recs.followUp?.length > 0 && (
            <RecGroup
              title="Follow-up"
              items={recs.followUp}
              color={colors.warning}
              bg={colors.warningLight}
              textColor={colors.textSecondary}
            />
          )}
          {recs.diet?.length > 0 && (
            <RecGroup
              title="Diet"
              items={recs.diet}
              color={colors.success}
              bg={colors.successLight}
              textColor={colors.textSecondary}
            />
          )}
          {recs.lifestyle?.length > 0 && (
            <RecGroup
              title="Lifestyle"
              items={recs.lifestyle}
              color={colors.primary}
              bg={colors.primaryLight}
              textColor={colors.textSecondary}
            />
          )}
        </View>
      )}

      {/* 7. Meta Info */}
      <View
        style={{
          backgroundColor: colors.surface,
          margin: 16,
          borderRadius: 14,
          padding: 16,
        }}
      >
        {r.labName && (
          <MetaItem label="Lab" value={r.labName} colors={colors} />
        )}
        {r.reportDate && (
          <MetaItem
            label="Report Date"
            value={new Date(r.reportDate).toLocaleDateString()}
            colors={colors}
          />
        )}
        <MetaItem
          label="Uploaded"
          value={new Date(r.createdAt).toLocaleDateString()}
          colors={colors}
        />
      </View>

      {/* 8. Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          margin: 16,
          marginTop: 8,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            opacity: isGeneratingPdf ? 0.6 : 1,
          }}
          onPress={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Download size={18} color="#fff" />
          )}
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.surface,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            opacity: isRerunPending ? 0.6 : 1,
          }}
          onPress={() => {
            haptics.medium();
            rerunUpload({ params: { id: id! } });
          }}
          disabled={isRerunPending}
        >
          {isRerunPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RotateCcw size={18} color={colors.primary} />
          )}
          <Text
            style={{
              color: colors.primary,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {isRerunPending ? "Re-running..." : "Re-run AI"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      {/* Image Lightbox */}
      <ImageLightbox
        images={reportImages}
        visible={lightboxVisible}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxVisible(false)}
      />
    </ScrollView>
  );
}

function StatusIcon({ status, colors }: { status: string; colors: any }) {
  if (status === "high" || status === "critical")
    return (
      <ArrowUp
        size={16}
        color={status === "critical" ? colors.danger : colors.warning}
      />
    );
  if (status === "low") return <ArrowDown size={16} color={colors.info} />;
  return <CheckCircle size={16} color={colors.success} />;
}

function RecGroup({
  title,
  items,
  color,
  bg,
  textColor,
}: {
  title: string;
  items: string[];
  color: string;
  bg: string;
  textColor: string;
}) {
  return (
    <View style={{ borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: bg }}>
      <Text style={{ fontSize: 13, fontWeight: "700", marginBottom: 6, color }}>
        {title}
      </Text>
      {items.map((item: string, i: number) => (
        <Text
          key={i}
          style={{
            fontSize: 13,
            color: textColor,
            marginBottom: 3,
            lineHeight: 20,
          }}
        >
          {"\u2022"} {item}
        </Text>
      ))}
    </View>
  );
}

function MetaItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
