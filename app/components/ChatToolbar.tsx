import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Trash2 } from "lucide-react-native";

interface ChatToolbarProps {
  onClear: () => void;
  isConnected: boolean;
}

export function ChatToolbar({ onClear, isConnected }: ChatToolbarProps) {
  return (
    <View className="flex-row justify-end px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <TouchableOpacity
        onPress={onClear}
        disabled={!isConnected}
        className={`flex-row items-center gap-1.5 ${!isConnected ? "opacity-35" : ""}`}
        activeOpacity={0.7}
      >
        <Icon as={Trash2} className="text-red-500 size-3.5" />
        <Text className="text-red-500 text-xs font-semibold">
          Clear Chat
        </Text>
      </TouchableOpacity>
    </View>
  );
}
