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
import { Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/auth.store";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";
import { useTheme } from "../../src/theme/ThemeContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { mutate: login, isPending } = authService.useLogin({
    onSuccess: (data: any) => {
      toast.success("Welcome back!", "Signed in successfully");
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
    onError: (error: Error) => {
      toast.error("Login Failed", error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      toast.error("Missing Fields", "Please enter your email and password.");
      return;
    }
    haptics.light();
    login({ body: { email, password } });
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
        <View style={{ alignItems: "center", marginBottom: 40 }}>
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
            Sign In
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Access your lab reports and AI-powered health insights.
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
              placeholder="Enter your password"
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
            onPress={handleLogin}
            disabled={isPending}
          >
            <Text style={{ color: colors.surface, fontSize: 16, fontWeight: "600" }}>
              {isPending ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/forgot-password" style={{ alignSelf: "center", marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              Forgot password?
            </Text>
          </Link>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/register">
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
