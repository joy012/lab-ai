export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;

  // UI
  border: string;
  borderLight: string;
  tabBar: string;
  tabBarBorder: string;
  inputBackground: string;
  skeleton: string;
  skeletonHighlight: string;
  overlay: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",

  text: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",

  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryDark: "#1D4ED8",

  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  info: "#0284C7",
  infoLight: "#F0F9FF",

  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  inputBackground: "#F9FAFB",
  skeleton: "#E2E8F0",
  skeletonHighlight: "#F1F5F9",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "#000000",
};

export const darkColors: ThemeColors = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceSecondary: "#334155",

  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",

  primary: "#3B82F6",
  primaryLight: "#1E3A5F",
  primaryDark: "#60A5FA",

  success: "#22C55E",
  successLight: "#14532D",
  warning: "#F59E0B",
  warningLight: "#422006",
  danger: "#EF4444",
  dangerLight: "#450A0A",
  info: "#38BDF8",
  infoLight: "#0C4A6E",

  border: "#334155",
  borderLight: "#1E293B",
  tabBar: "#1E293B",
  tabBarBorder: "#334155",
  inputBackground: "#334155",
  skeleton: "#334155",
  skeletonHighlight: "#475569",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "#000000",
};
