import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, RefreshCw, Home } from "lucide-react-native";
import { useRouter } from "expo-router";
import { haptics } from "../../utils/haptics";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorScreen({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showHomeButton = true,
}: ErrorScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertTriangle size={48} color="#dc2626" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttons}>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              haptics.light();
              onRetry();
            }}
          >
            <RefreshCw size={18} color="#fff" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
        {showHomeButton && (
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              haptics.light();
              router.replace("/");
            }}
          >
            <Home size={18} color="#2563eb" />
            <Text style={styles.homeText}>Go Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  buttons: {
    gap: 12,
    alignItems: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  homeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
});
