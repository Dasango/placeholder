import React from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { useUserStore } from "../app/store/userStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export type ThemeName = "dark" | "light";

export interface Theme {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceAlt: string;
  divider: string;
  border: string;
  borderSoft: string;
  text: string;
  textMuted: string;
  textSoft: string;
  textDark: string;
  color: string;
  colorMuted: string;
  placeholder: string;
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    surfaceMuted: "#21262d",
    surfaceAlt: "#30363d",
    divider: "#30363d",
    border: "border-gray-800",
    borderSoft: "border-white/5",
    text: "text-white",
    textMuted: "text-gray-400",
    textSoft: "text-gray-300",
    textDark: "text-gray-900",
    color: "#ffffff",
    colorMuted: "#9ca3af",
    placeholder: "#6e7681",
  },
  light: {
    background: "#f6f8fa",
    surface: "#ffffff",
    surfaceMuted: "#eaeef2",
    surfaceAlt: "#e5e7eb",
    divider: "#d0d7de",
    border: "border-gray-200",
    borderSoft: "border-black/10",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    textSoft: "text-gray-600",
    textDark: "text-black",
    color: "#111827",
    colorMuted: "#6b7280",
    placeholder: "#9ca3af",
  },
};

export function useTheme(): Theme {
  const isDarkMode = useUserStore((state) => state.isDarkMode);
  return themes[isDarkMode ? "dark" : "light"];
}

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, className = "", style }: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      className={`flex-1 ${className}`}
      style={[{ backgroundColor: theme.background }, style]}
    >
      {children}
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  entering?: React.ComponentProps<typeof Animated.View>["entering"];
  exiting?: React.ComponentProps<typeof Animated.View>["exiting"];
}

export function Card({
  children,
  className = "",
  style,
  entering,
  exiting,
}: CardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedBoxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.95;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.2}
    >
      <Animated.View
        entering={entering}
        exiting={exiting}
        className={`border ${theme.border} ${className}`}
        style={[{ backgroundColor: theme.surface }, style, animatedBoxStyle]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
