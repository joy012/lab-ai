import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";
import { useTheme } from "../../src/theme/ThemeContext";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  const { mutate: register, isPending } = authService.useRegister({
    onSuccess: () => {
      toast.success(
        "Account Created",
        "We sent a 6-digit code to your email.",
      );
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email },
      });
    },
    onError: (error: Error) => {
      toast.error("Registration Failed", error.message);
    },
  });

  const handleRegister = () => {
    if (!name.trim()) {
      toast.error("Name Required", "Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email Required", "Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password Mismatch", "Passwords do not match.");
      return;
    }
    haptics.light();
    register({ body: { email, password, name, role } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: colors.primary }}>
            LabAI
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            AI-powered Lab Report Interpreter
          </Text>
        </View>

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
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 6,
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Sign up to get AI-powered insights from your lab reports.
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            I am a
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor:
                  role === "PATIENT" ? colors.primary : colors.surfaceSecondary,
              }}
              onPress={() => {
                haptics.selection();
                setRole("PATIENT");
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: role === "PATIENT" ? "#fff" : colors.textSecondary,
                }}
              >
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor:
                  role === "DOCTOR" ? colors.primary : colors.surfaceSecondary,
              }}
              onPress={() => {
                haptics.selection();
                setRole("DOCTOR");
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: role === "DOCTOR" ? "#fff" : colors.textSecondary,
                }}
              >
                Doctor
              </Text>
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
            Full Name
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
            placeholder="Enter your full name"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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

          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
            }}
          >
            Password
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
              value={password}
              onChangeText={setPassword}
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
            Confirm Password
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
              placeholder="Re-enter your password"
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
            onPress={handleRegister}
            disabled={isPending}
          >
            <Text style={{ color: colors.surface, fontSize: 16, fontWeight: "600" }}>
              {isPending ? "Creating account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login">
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
