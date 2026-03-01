import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sun, Moon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuthStore } from "../../store/auth.store";

export function AppHeader() {
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.logo, { color: colors.primary }]}>LabAI</Text>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={toggle}
          style={[styles.themeToggle, { backgroundColor: colors.surfaceSecondary }]}
        >
          {isDark ? (
            <Sun size={18} color={colors.warning} />
          ) : (
            <Moon size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={[styles.avatar, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
