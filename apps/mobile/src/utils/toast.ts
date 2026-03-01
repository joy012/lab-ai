import { alert as burntAlert, toast as burntToast } from "burnt";
import { haptics } from "./haptics";

export const toast = {
  /** Show success toast with haptic */
  success: (title: string, message?: string) => {
    haptics.success();
    burntToast({
      title,
      message,
      preset: "done",
      haptic: "success",
      duration: 3,
    });
  },

  /** Show error toast with haptic */
  error: (title: string, message?: string) => {
    haptics.error();
    burntToast({
      title,
      message,
      preset: "error",
      haptic: "error",
      duration: 4,
    });
  },

  /** Show info toast */
  info: (title: string, message?: string) => {
    haptics.light();
    burntToast({
      title,
      message,
      preset: "done",
      haptic: "none",
      duration: 3,
    });
  },

  /** Show a native alert dialog (blocking) */
  alert: (title: string, message?: string) => {
    haptics.warning();
    burntAlert({
      title,
      message: message ?? undefined,
      preset: "error",
      duration: 5,
    });
  },
};
