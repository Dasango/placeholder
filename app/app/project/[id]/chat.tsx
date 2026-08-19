import React, { useRef } from "react";
import { View, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProjectChat } from "../../../hooks/useProjectChat";

import { ChatToolbar } from "../../../components/ChatToolbar";
import { ChatMessageBubble } from "../../../components/ChatMessageBubble";
import { ChatInputBar } from "../../../components/ChatInputBar";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AlertDialog } from "../../../components/AlertDialog";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Bot } from "lucide-react-native";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    chatHistory,
    isBackendOnline,
    sending,
    isConfirmOpen,
    setIsConfirmOpen,
    isAlertOpen,
    setIsAlertOpen,
    alertInfo,
    handleSendMessage,
    handleClearPress,
    confirmClear,
  } = useProjectChat(id);

  const chatScrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
      className="flex-1 bg-white dark:bg-zinc-950"
    >
      <View className="flex-1">
        {chatHistory.length > 0 && (
          <ChatToolbar
            onClear={handleClearPress}
            isConnected={isBackendOnline}
          />
        )}

        <ScrollView
          ref={chatScrollRef}
          className="flex-1"
          contentContainerClassName="p-4 gap-4 pb-6"
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16 gap-3">
              <Icon as={Bot} className="text-zinc-400 size-12" />
              <Text className="text-zinc-900 dark:text-zinc-50 text-lg font-semibold">
                Hello! Ask your questions
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-center text-sm px-8">
                Ask about the information contained in this notebook's indexed documents.
              </Text>
            </View>
          ) : (
            chatHistory.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))
          )}

          {sending && (
            <View className="flex-row items-center gap-3 pl-1 py-2">
              <ActivityIndicator size="small" color="#71717a" />
              <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                The agent is searching for answers...
              </Text>
            </View>
          )}
        </ScrollView>

        <ChatInputBar
          onSend={handleSendMessage}
          disabled={sending}
          isConnected={isBackendOnline}
        />
      </View>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Clear Conversation"
        description="Are you sure you want to delete this notebook's chat history? This action cannot be undone."
        onConfirm={confirmClear}
        confirmText="Clear"
        variant="destructive"
      />

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title={alertInfo.title}
        description={alertInfo.description}
      />
    </KeyboardAvoidingView>
  );
}
