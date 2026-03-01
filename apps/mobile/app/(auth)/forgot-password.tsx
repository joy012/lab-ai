import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { KeyRound, ArrowLeft } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";
import { useTheme } from "../../src/theme/ThemeContext";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");

  const { mutate: forgotPassword, isPending } = authService.useForgotPassword({
    onSuccess: () => {
      toast.success("Code Sent", "Check your email for the 6-digit reset code.");
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email },
      });
    },
    onError: (error: Error) => {
      toast.error("Request Failed", error.message);
    },
  });

  const handleSend = () => {
    if (!email.trim()) {
      toast.error("Email Required", "Please enter your email address.");
      return;
    }
    haptics.light();
    forgotPassword({ body: { email } });
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        padding: 24,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: colors.surfaceSecondary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primaryLight,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            marginBottom: 16,
          }}
        >
          <KeyRound size={28} color={colors.primary} />
        </View>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Forgot Password?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 21,
            marginBottom: 24,
          }}
        >
          No worries. Enter your email and we'll send you a 6-digit code to
          reset your password.
        </Text>

        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: colors.textSecondary,
            marginBottom: 6,
          }}
        >
          Email
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 14,
            fontSize: 16,
            marginBottom: 16,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          }}
          placeholder="Enter your email address"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.primary,
              borderRadius: 10,
              padding: 16,
              alignItems: "center",
            },
            isPending && { opacity: 0.6 },
          ]}
          onPress={handleSend}
          disabled={isPending || !email.trim()}
        >
          <Text style={{ color: colors.surface, fontSize: 16, fontWeight: "600" }}>
            {isPending ? "Sending..." : "Send Reset Code"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Remember your password?{" "}
          <Text
            style={{ color: colors.primary, fontWeight: "600" }}
            onPress={() => router.replace("/(auth)/login")}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
