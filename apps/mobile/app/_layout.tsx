import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../src/components/common/ErrorBoundary";
import { connectSocket, disconnectSocket } from "../src/lib/socket";
import { useAuthStore } from "../src/store/auth.store";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { queryClient } from "../src/utils/queryClient";

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (sync)
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.primary }]}>
        <Text style={styles.splashLogo}>LabAI</Text>
        <ActivityIndicator size="small" color="#fff" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="report/[id]"
          options={{
            headerShown: true,
            title: "Report Details",
            presentation: "card",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <HydrationGate>
              <AppContent />
            </HydrationGate>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});
