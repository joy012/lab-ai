import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LogOut, User, Shield, ChevronRight, Trash2 } from "lucide-react-native";
import { useAuthStore } from "../../src/store/auth.store";
import { authService } from "../../src/services/auth.service";
import { AppHeader } from "../../src/components/common/AppHeader";
import { useTheme } from "../../src/theme/ThemeContext";
import { haptics } from "../../src/utils/haptics";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { colors } = useTheme();

  const { mutate: deleteAccount, isPending: isDeleting } =
    authService.useDeleteAccount({
      onSuccess: () => {
        logout();
      },
      onError: (error: Error) => {
        Alert.alert("Error", error.message || "Failed to delete account.");
      },
    });

  const handleLogout = () => {
    haptics.warning();
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    haptics.warning();
    Alert.alert(
      "Delete Account?",
      "This will permanently delete your account, all lab reports, and health data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => deleteAccount({}),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surface,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primaryLight,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <User size={32} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>
            {user?.name || "User"}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </Text>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 8,
              marginTop: 8,
              backgroundColor:
                user?.role === "DOCTOR" ? colors.primaryLight : colors.successLight,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: user?.role === "DOCTOR" ? colors.primary : colors.success,
              }}
            >
              {user?.role || "PATIENT"}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            marginBottom: 16,
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
            <Shield size={18} color={colors.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
              Account
            </Text>
          </View>
          <MenuItem
            label="Email Verified"
            value={user?.emailVerified ? "Yes" : "No"}
            colors={colors}
          />
          <MenuItem
            label="Role"
            value={user?.role || "PATIENT"}
            colors={colors}
          />
        </View>

        <View style={{ gap: 12, marginHorizontal: 16 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textSecondary }}>
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: colors.dangerLight,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.danger,
              opacity: isDeleting ? 0.6 : 1,
            }}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <Trash2 size={20} color={colors.danger} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.danger }}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({
  label,
  value,
  onPress,
  colors,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={{ fontSize: 15, color: colors.text }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {value && (
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{value}</Text>
        )}
        {onPress && <ChevronRight size={18} color={colors.textTertiary} />}
      </View>
    </TouchableOpacity>
  );
}
