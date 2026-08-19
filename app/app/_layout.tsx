import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { ConnectionProvider } from "../contexts/ConnectionContext";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </SafeAreaProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
