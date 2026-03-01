import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  Camera,
} from "lucide-react-native";
import { useAuthStore } from "../../src/store/auth.store";
import { labReportsService } from "../../src/services/lab-reports.service";
import { getSocket } from "../../src/lib/socket";
import { DashboardSkeleton } from "../../src/components/common/DashboardSkeleton";
import { AppHeader } from "../../src/components/common/AppHeader";
import { useTheme } from "../../src/theme/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [processingReports, setProcessingReports] = useState<
    Record<string, number>
  >({});

  const { data, refetch, isLoading } = labReportsService.useLabReports(
    { query: { page: 1, limit: 5 } },
    { enabled: true },
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <DashboardSkeleton />;

  const reports = (data as any)?.data ?? [];
  const totalReports = (data as any)?.meta?.total ?? 0;

  const completedReports = reports.filter((r: any) => r.status === "COMPLETED");
  const latestReport = completedReports[0];
  const criticalCount = completedReports.filter(
    (r: any) => r.riskScore && r.riskScore > 70,
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Hello, {user?.name || "User"}
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}
          >
            Here's your health overview
          </Text>
        </View>

        <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 10 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 16,
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.primaryLight,
            }}
          >
            <FileText size={24} color={colors.primary} />
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
              {totalReports}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Total Reports
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 16,
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.successLight,
            }}
          >
            <Activity size={24} color={colors.success} />
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
              {completedReports.length}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Analyzed
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 16,
              alignItems: "center",
              gap: 6,
              backgroundColor:
                criticalCount > 0 ? colors.dangerLight : colors.surfaceSecondary,
            }}
          >
            <AlertTriangle
              size={24}
              color={criticalCount > 0 ? colors.danger : colors.textTertiary}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: criticalCount > 0 ? colors.danger : colors.text,
              }}
            >
              {criticalCount}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Critical
            </Text>
          </View>
        </View>

        {Object.keys(processingReports).length > 0 && (
          <View
            style={{
              margin: 16,
              padding: 16,
              backgroundColor: colors.primaryLight,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Processing Reports...
            </Text>
            {Object.entries(processingReports).map(([id, progress]) => (
              <View
                key={id}
                style={{
                  height: 6,
                  backgroundColor: colors.border,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: colors.primary,
                    borderRadius: 3,
                    width: `${progress}%`,
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {latestReport && (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Latest Report
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 18,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
              onPress={() => router.push(`/report/${latestReport.id}`)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                    flex: 1,
                  }}
                >
                  {latestReport.title || "Lab Report"}
                </Text>
                {latestReport.riskScore != null && (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor:
                        latestReport.riskScore > 70
                          ? colors.dangerLight
                          : latestReport.riskScore > 30
                            ? colors.warningLight
                            : colors.successLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          latestReport.riskScore > 70
                            ? colors.danger
                            : latestReport.riskScore > 30
                              ? colors.warning
                              : colors.success,
                      }}
                    >
                      Risk: {latestReport.riskScore}/100
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 8,
                }}
                numberOfLines={2}
              >
                {latestReport.summary
                  ? latestReport.summary.substring(0, 120) + "..."
                  : "Processing..."}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: "500",
                  marginTop: 12,
                }}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 20,
                alignItems: "center",
                gap: 8,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
              onPress={() => router.push("/(tabs)/upload")}
            >
              <Camera size={28} color={colors.primary} />
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: colors.text }}
              >
                Upload Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 20,
                alignItems: "center",
                gap: 8,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
              onPress={() => router.push("/(tabs)/reports")}
            >
              <TrendingUp size={28} color={colors.primary} />
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: colors.text }}
              >
                View Trends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
