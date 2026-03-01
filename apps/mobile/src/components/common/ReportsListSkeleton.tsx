import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";

export function ReportsListSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width={44} height={44} borderRadius={12} />
          <View style={styles.info}>
            <Skeleton width={150} height={15} />
            <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
            <Skeleton
              width={70}
              height={18}
              borderRadius={6}
              style={{ marginTop: 8 }}
            />
          </View>
          <View style={styles.right}>
            <Skeleton width={30} height={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  info: { flex: 1, marginLeft: 12 },
  right: { alignItems: "center" },
});
