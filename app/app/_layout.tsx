import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { ConnectionProvider } from "../contexts/ConnectionContext";
import { useProjectSync } from "../hooks/useProjectSync";
import "../global.css";

const queryClient = new QueryClient();

function AppContent() {
  useProjectSync();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
