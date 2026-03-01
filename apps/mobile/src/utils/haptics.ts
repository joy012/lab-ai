import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isSupported = Platform.OS === "ios" || Platform.OS === "android";

export const haptics = {
  /** Light tap - button presses, selections */
  light: () => {
    if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Medium tap - toggles, card presses */
  medium: () => {
    if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Heavy tap - destructive actions, errors */
  heavy: () => {
    if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /** Success feedback - upload complete, login success */
  success: () => {
    if (isSupported)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Error feedback - validation errors, failures */
  error: () => {
    if (isSupported)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /** Warning feedback - critical values, alerts */
  warning: () => {
    if (isSupported)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /** Selection changed - tab switch, picker */
  selection: () => {
    if (isSupported) Haptics.selectionAsync();
  },
};
