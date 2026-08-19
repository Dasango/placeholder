import React from "react";
import { View, TouchableOpacity } from "react-native";
import { UploadedDocument } from "../store";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { FileText, Trash2 } from "lucide-react-native";

interface DocumentListItemProps {
  doc: UploadedDocument;
  onDelete: () => void;
  isConnected: boolean;
}

export function DocumentListItem({ doc, onDelete, isConnected }: DocumentListItemProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <View className="flex-row items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row items-center gap-3 flex-1">
        <Icon as={FileText} className="text-zinc-500 dark:text-zinc-400 size-5" />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-zinc-900 dark:text-zinc-50 font-medium">
            {doc.name}
          </Text>
          <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            {formatBytes(doc.size)} • {doc.timestamp}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        disabled={!isConnected}
        className={`p-2 rounded-full ${!isConnected ? "opacity-30" : ""}`}
        activeOpacity={0.6}
      >
        <Icon as={Trash2} className="text-red-500 size-4.5" />
      </TouchableOpacity>
    </View>
  );
}
