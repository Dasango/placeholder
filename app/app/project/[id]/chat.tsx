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
                ¡Hola! Haz tus consultas
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-center text-sm px-8">
                Pregunta sobre la información contenida en los documentos indexados de este cuaderno.
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
                El agente está buscando respuestas...
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
        title="Limpiar Conversación"
        description="¿Estás seguro de que quieres borrar el historial de chat de este cuaderno? Esta acción no se puede deshacer."
        onConfirm={confirmClear}
        confirmText="Borrar"
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
