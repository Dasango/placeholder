import React from "react";
import { View } from "react-native";
import { ChatMessage } from "../store";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Bot, User } from "lucide-react-native";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <View
      className={`flex-row gap-3 ${
        isUser ? "justify-end" : "justify-start"
      } items-start w-full`}
    >
      {!isUser && (
        <View className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <Icon as={Bot} className="text-zinc-600 dark:text-zinc-300 size-4" />
        </View>
      )}

      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-zinc-900 dark:bg-zinc-50 border-0 rounded-tr-sm"
            : "bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-tl-sm"
        }`}
      >
        <Text
          className={`text-sm leading-5 ${
            isUser
              ? "text-white dark:text-zinc-950"
              : "text-zinc-800 dark:text-zinc-100"
          }`}
        >
          {message.content}
        </Text>
        <Text
          className={`text-[9px] mt-1.5 align-self-end ${
            isUser
              ? "text-zinc-300 dark:text-zinc-600"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {message.timestamp}
        </Text>
      </View>

      {isUser && (
        <View className="p-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100">
          <Icon as={User} className="text-white dark:text-zinc-950 size-4" />
        </View>
      )}
    </View>
  );
}
