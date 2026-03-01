import { View, StyleSheet, ScrollView } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "../ui/Skeleton";

export function ReportDetailSkeleton() {
  return (
    <ScrollView style={styles.container}>
      {/* Risk Score */}
      <View style={styles.riskSection}>
        <SkeletonCircle size={100} />
        <Skeleton width={200} height={14} style={{ marginTop: 12 }} />
      </View>

      {/* AI Interpretation */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={24} height={24} borderRadius={6} />
          <Skeleton width={140} height={16} />
        </View>
        <SkeletonText lines={5} />
      </View>

      {/* Lab Values */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={24} height={24} borderRadius={6} />
          <Skeleton width={120} height={16} />
        </View>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.valueRow}>
            <View>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={11} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.valueRight}>
              <Skeleton width={60} height={15} />
              <Skeleton width={16} height={16} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={24} height={24} borderRadius={6} />
          <Skeleton width={150} height={16} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.recGroup}>
            <Skeleton width={60} height={13} />
            <Skeleton width="90%" height={13} style={{ marginTop: 8 }} />
            <Skeleton width="75%" height={13} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Meta */}
      <View style={styles.metaSection}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.metaRow}>
            <Skeleton width={60} height={13} />
            <Skeleton width={100} height={13} />
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  riskSection: { alignItems: "center", padding: 24, backgroundColor: "#fff" },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  valueRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  recGroup: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  metaSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
});
