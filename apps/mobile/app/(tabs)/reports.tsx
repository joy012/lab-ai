import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react-native";
import { labReportsService } from "../../src/services/lab-reports.service";
import { ReportsListSkeleton } from "../../src/components/common/ReportsListSkeleton";
import { AppHeader } from "../../src/components/common/AppHeader";
import { useTheme } from "../../src/theme/ThemeContext";
import { getSocket } from "../../src/lib/socket";
import { haptics } from "../../src/utils/haptics";
import { toast } from "../../src/utils/toast";

export default function ReportsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch, isLoading } = labReportsService.useLabReports(
    { query: { page, limit: 20 } },
    { enabled: true },
  );

  const { mutate: rerunReport } = labReportsService.useRerunReport({
    onSuccess: () => {
      toast.success("Re-running", "AI is re-analyzing the report.");
      refetch();
    },
    onError: (error: Error) => {
      toast.error("Re-run Failed", error.message);
    },
  });

  const reports = (data as any)?.data ?? [];
  const meta = (data as any)?.meta;

  useEffect(() => {
    const socket = getSocket();
    const handler = () => refetch();
    socket.on("lab-report:completed", handler);
    socket.on("lab-report:failed", handler);
    return () => {
      socket.off("lab-report:completed", handler);
      socket.off("lab-report:failed", handler);
    };
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    haptics.light();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusConfig = (status: string) => {
    const map: Record<string, { color: string; bg: string; icon: any; label: string }> = {
      PENDING: { color: colors.warning, bg: colors.warningLight, icon: Clock, label: "Pending" },
      PROCESSING: { color: colors.primary, bg: colors.primaryLight, icon: Clock, label: "Processing" },
      COMPLETED: { color: colors.success, bg: colors.successLight, icon: CheckCircle, label: "Completed" },
      FAILED: { color: colors.danger, bg: colors.dangerLight, icon: XCircle, label: "Failed" },
    };
    return map[status] || map.PENDING;
  };

  const renderReport = ({ item }: { item: any }) => {
    const status = getStatusConfig(item.status);
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
        onPress={() => { haptics.light(); router.push(`/report/${item.id}`); }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.primaryLight,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FileText size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
            numberOfLines={1}
          >
            {item.title || "Lab Report"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          {item.status === "COMPLETED" && item.summary && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 6,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {item.summary}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: status.bg,
              }}
            >
              <StatusIcon size={12} color={status.color} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: status.color }}>
                {status.label}
              </Text>
            </View>
            {(item.status === "COMPLETED" || item.status === "FAILED") && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: colors.primaryLight,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  haptics.light();
                  rerunReport({ params: { id: item.id } });
                }}
              >
                <RotateCcw size={11} color={colors.primary} />
                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary }}>
                  Re-run
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ alignItems: "center", gap: 4 }}>
          {item.riskScore != null && item.status === "COMPLETED" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              {item.riskScore > 70 && <AlertTriangle size={14} color={colors.danger} />}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color:
                    item.riskScore > 70
                      ? colors.danger
                      : item.riskScore > 30
                        ? colors.warning
                        : colors.success,
                }}
              >
                {item.riskScore}
              </Text>
            </View>
          )}
          <ChevronRight size={20} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ReportsListSkeleton />
          ) : (
            <View style={{ alignItems: "center", paddingTop: 80, gap: 8 }}>
              <FileText size={48} color={colors.border} />
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textSecondary }}>
                No reports yet
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                Upload your first lab report to get started
              </Text>
            </View>
          )
        }
        onEndReached={() => {
          if (meta && page < meta.totalPages) setPage((p) => p + 1);
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
