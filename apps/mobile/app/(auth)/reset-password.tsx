import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";
import { useTheme } from "../../src/theme/ThemeContext";

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { mutate: resetPassword, isPending } = authService.useResetPassword({
    onSuccess: () => {
      toast.success(
        "Password Reset",
        "You can now sign in with your new password."
      );
      router.replace("/(auth)/login");
    },
    onError: (error: Error) => {
      toast.error("Reset Failed", error.message);
      haptics.error();
    },
  });

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
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

  const handleReset = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("Invalid Code", "Please enter the full 6-digit code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Password Mismatch", "Passwords do not match.");
      return;
    }
    haptics.light();
    resetPassword({ body: { token: fullCode, newPassword } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
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
            <ShieldCheck size={28} color={colors.primary} />
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
            Reset Password
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
            Enter the 6-digit code sent to{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {email || "your email"}
            </Text>{" "}
            and choose a new password.
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
            }}
          >
            Verification Code
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
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

          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
            }}
          >
            New Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              marginBottom: 16,
              backgroundColor: colors.inputBackground,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                padding: 14,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textTertiary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={{ paddingHorizontal: 14, paddingVertical: 14 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textTertiary} />
              ) : (
                <Eye size={20} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
            }}
          >
            Confirm New Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              marginBottom: 16,
              backgroundColor: colors.inputBackground,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                padding: 14,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="Re-enter your new password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={{ paddingHorizontal: 14, paddingVertical: 14 }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.textTertiary} />
              ) : (
                <Eye size={20} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              {
                backgroundColor: colors.primary,
                borderRadius: 10,
                padding: 16,
                alignItems: "center",
                marginTop: 8,
              },
              isPending && { opacity: 0.6 },
            ]}
            onPress={handleReset}
            disabled={isPending}
          >
            <Text
              style={{
                color: colors.surface,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {isPending ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
