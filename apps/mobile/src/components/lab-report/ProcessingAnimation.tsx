import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Stethoscope } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";

const HELPER_TIPS = [
  "AI reads both handwritten and printed reports",
  "Using Bangladesh reference ranges",
  "Results include personalized diet advice",
  "Your data stays private and secure",
  "Supports multiple file formats",
];

function getStageText(progress: number): string {
  if (progress < 20) return "Scanning your report...";
  if (progress < 50) return "Extracting lab values...";
  if (progress < 75) return "Analyzing results...";
  if (progress < 95) return "Generating recommendations...";
  return "Almost done...";
}

interface Props {
  progress: number;
  message?: string;
}

export function ProcessingAnimation({ progress, message }: Props) {
  const { colors } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);

  // Pulsing scale animation
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  // Rotate helper tips every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % HELPER_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale.value * 1.4 }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const stageText = message || getStageText(progress);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: colors.background,
      }}
    >
      {/* Animated icon with glow */}
      <View style={{ width: 140, height: 140, alignItems: "center", justifyContent: "center" }}>
        {/* Glow ring */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary,
            },
            glowStyle,
          ]}
        />

        {/* Orbiting dots */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 120,
              height: 120,
            },
            orbitStyle,
          ]}
        >
          {[0, 90, 180, 270].map((deg, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
                opacity: 0.6 + i * 0.1,
                top: 56 + 56 * Math.sin((deg * Math.PI) / 180),
                left: 56 + 56 * Math.cos((deg * Math.PI) / 180),
              }}
            />
          ))}
        </Animated.View>

        {/* Main icon */}
        <Animated.View
          style={[
            {
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primaryLight,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            },
            pulseStyle,
          ]}
        >
          <Stethoscope size={36} color={colors.primary} />
        </Animated.View>
      </View>

      {/* Status text */}
      <Animated.Text
        entering={FadeIn.duration(400)}
        key={stageText}
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginTop: 28,
          textAlign: "center",
        }}
      >
        {stageText}
      </Animated.Text>

      {/* Progress bar */}
      <View
        style={{
          width: "100%",
          height: 6,
          backgroundColor: colors.border,
          borderRadius: 3,
          overflow: "hidden",
          marginTop: 20,
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            backgroundColor: colors.primary,
            borderRadius: 3,
            width: `${Math.max(progress, 5)}%`,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 13,
          color: colors.textTertiary,
          marginTop: 8,
        }}
      >
        {progress}% complete
      </Text>

      {/* Helper tips */}
      <View style={{ marginTop: 40, minHeight: 40, alignItems: "center" }}>
        <Animated.Text
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
          key={tipIndex}
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 20,
          }}
        >
          {HELPER_TIPS[tipIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}
