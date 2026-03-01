import { View, StyleSheet } from "react-native";
import { Skeleton, SkeletonText } from "../ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={200} height={28} />
        <Skeleton width={160} height={14} style={{ marginTop: 6 }} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <Skeleton width={40} height={24} style={{ marginTop: 8 }} />
            <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Latest Report Card */}
      <View style={styles.section}>
        <Skeleton width={130} height={18} />
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Skeleton width={150} height={16} />
            <Skeleton width={80} height={24} borderRadius={8} />
          </View>
          <SkeletonText lines={2} style={{ marginTop: 12 }} />
          <Skeleton width={100} height={14} style={{ marginTop: 12 }} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Skeleton width={120} height={18} />
        <View style={styles.actionsRow}>
          <View style={styles.actionCard}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <Skeleton width={90} height={14} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.actionCard}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <Skeleton width={90} height={14} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingTop: 16 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  section: { padding: 16 },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
});
