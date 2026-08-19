import { useColorScheme } from "react-native";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
}

const lightColors: ThemeColors = {
  background: "#ffffff",
  foreground: "#18181b",
  card: "#f4f4f5",
  cardForeground: "#18181b",
  border: "#e4e4e7",
  primary: "#18181b",
  primaryForeground: "#ffffff",
  secondary: "#f4f4f5",
  secondaryForeground: "#18181b",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  accent: "#f4f4f5",
  accentForeground: "#18181b",
};

const darkColors: ThemeColors = {
  background: "#121212",
  foreground: "#f4f4f5",
  card: "#1e1e1e",
  cardForeground: "#f4f4f5",
  border: "#27272a",
  primary: "#fafafa",
  primaryForeground: "#18181b",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  accent: "#27272a",
  accentForeground: "#fafafa",
};

/**
 * Custom hook to manage the application's color scheme.
 * Provides the current theme mode, helper flags, and semantic color palettes
 * for both light (white backgrounds) and dark (gray backgrounds) themes.
 */
export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? "dark" : "light";
  const colors = isDark ? darkColors : lightColors;

  return {
    theme,
    isDark,
    colors,
  };
}
