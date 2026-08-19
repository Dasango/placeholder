import React from "react";
import { View } from "react-native";
import { useConnection } from "../contexts/ConnectionContext";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { WifiOff } from "lucide-react-native";

export function ConnectionBanner() {
  const { isOnline } = useConnection();

  if (isOnline) return null;

  return (
    <View className="flex-row items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
      <Icon as={WifiOff} className="text-red-600 dark:text-red-400 size-5" />
      <View className="flex-1">
        <Text className="font-semibold text-red-600 dark:text-red-400">
          No connection
        </Text>
        <Text variant="small" className="text-red-700 dark:text-red-300">
          Could not connect to the RAG server. Make sure n8n is running.
        </Text>
      </View>
    </View>
  );
}
