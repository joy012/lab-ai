import { View, StyleSheet } from "react-native";
import { Skeleton, SkeletonCircle } from "../ui/Skeleton";

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <SkeletonCircle size={72} />
        <Skeleton width={150} height={22} style={{ marginTop: 12 }} />
        <Skeleton width={180} height={14} style={{ marginTop: 6 }} />
        <Skeleton
          width={70}
          height={22}
          borderRadius={8}
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Health Profile */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={24} height={24} borderRadius={6} />
          <Skeleton width={120} height={16} />
        </View>
        <View style={styles.infoGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.infoItem}>
              <Skeleton width={50} height={11} />
              <Skeleton width={70} height={15} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12 }}>
          <Skeleton width={80} height={12} />
          <View style={styles.tags}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={80} height={22} borderRadius={6} />
            ))}
          </View>
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={24} height={24} borderRadius={6} />
          <Skeleton width={80} height={16} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.menuItem}>
            <Skeleton width={120} height={15} />
            <Skeleton width={50} height={15} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
    marginBottom: 16,
  },
  section: { backgroundColor: "#fff", padding: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoItem: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },
  tags: { flexDirection: "row", gap: 6, marginTop: 6 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
});
