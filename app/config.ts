import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolves the N8N backend URL.
 * 
 * 1. Checks if `process.env.EXPO_PUBLIC_N8N_URL` is defined (typically for production/deployments).
 * 2. If not defined, falls back to the dynamic host IP from Expo CLI (for local development on physical devices).
 * 3. As a final fallback, uses platform-specific localhost equivalents (10.0.2.2 for Android emulator, localhost for others).
 */
const resolveN8nUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_N8N_URL;
  if (envUrl) {
    return envUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5678`;
  }

  return Platform.select({
    android: "http://10.0.2.2:5678",
    default: "http://localhost:5678",
  }) || "http://localhost:5678";
};

export const N8N_URL = resolveN8nUrl();
