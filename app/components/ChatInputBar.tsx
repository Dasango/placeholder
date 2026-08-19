import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Send } from "lucide-react-native";

interface ChatInputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isConnected: boolean;
}

export function ChatInputBar({ onSend, disabled, isConnected }: ChatInputBarProps) {
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    const text = userInput.trim();
    if (!text || disabled || !isConnected) return;
    onSend(text);
    setUserInput("");
  };

  const isButtonEnabled = userInput.trim().length > 0 && !disabled && isConnected;

  return (
    <View className="flex-row items-center p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-3">
      <TextInput
        placeholder={
          isConnected
            ? "Ask a question about your documents..."
            : "⚠️ Chat disabled (no connection to the server)"
        }
        placeholderTextColor="#a1a1aa"
        value={userInput}
        onChangeText={setUserInput}
        onSubmitEditing={handleSend}
        editable={isConnected && !disabled}
        className="flex-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2.5 text-[15px] max-h-[100px]"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!isButtonEnabled}
        className={`p-2.5 rounded-full items-center justify-center ${
          isButtonEnabled
            ? "bg-zinc-900 dark:bg-zinc-50"
            : "bg-zinc-100 dark:bg-zinc-900"
        }`}
        activeOpacity={0.7}
      >
        <Icon
          as={Send}
          className={`size-4.5 ${
            isButtonEnabled
              ? "text-white dark:text-zinc-950"
              : "text-zinc-400 dark:text-zinc-650"
          }`}
        />
      </TouchableOpacity>
    </View>
  );
}
