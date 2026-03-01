import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Mail, ArrowLeft } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/auth.store";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";
import { useTheme } from "../../src/theme/ThemeContext";

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { mutate: verifyEmail, isPending } = authService.useVerifyEmail({
    onSuccess: (data: any) => {
      toast.success("Email Verified", "Welcome to LabAI!");
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
    onError: (error: Error) => {
      toast.error("Verification Failed", error.message);
      haptics.error();
    },
  });

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, "");
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("Invalid Code", "Please enter the full 6-digit code.");
      return;
    }
    haptics.light();
    verifyEmail({ body: { token: fullCode } });
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
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primaryLight,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            marginBottom: 16,
          }}
        >
          <Mail size={32} color={colors.primary} />
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
          Check your email
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 21,
            marginBottom: 28,
          }}
        >
          We sent a 6-digit verification code to{"\n"}
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            {email || "your email"}
          </Text>
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                {
                  width: 46,
                  height: 54,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderRadius: 10,
                  fontSize: 22,
                  fontWeight: "700",
                  textAlign: "center",
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                },
                digit
                  ? {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight,
                    }
                  : null,
              ]}
              value={digit}
              onChangeText={(v) => handleCodeChange(v, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              selectTextOnFocus
              placeholderTextColor={colors.textTertiary}
            />
          ))}
        </View>

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
          onPress={handleVerify}
          disabled={isPending}
        >
          <Text
            style={{
              color: colors.surface,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {isPending ? "Verifying..." : "Verify Email"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 13,
            color: colors.textTertiary,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Didn't receive the code? Check your spam folder or wait a minute and
          try again.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
