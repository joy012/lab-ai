import { View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Home, FileText, Upload } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/auth.store";
import { useTheme } from "../../src/theme/ThemeContext";
import { haptics } from "../../src/utils/haptics";

export default function TabLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenListeners={{
        tabPress: () => haptics.selection(),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused
                  ? colors.primary
                  : colors.surfaceSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <Upload size={20} color={focused ? "#fff" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
