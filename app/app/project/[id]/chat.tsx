import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppStore, ChatMessage } from "../../../store";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { useSendChatMessage } from "../../../services/queries";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Send, Trash2, Bot, User, Trash } from "lucide-react-native";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  // Zustand State Management for Chat History
  const chatsByProject = useAppStore((state) => state.chatsByProject);
  const setChats = useAppStore((state) => state.setChats);
  const chatHistory = (id ? chatsByProject[id] : []) || [];

  const [userInput, setUserInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const chatScrollRef = useRef<ScrollView>(null);

  // Keyboard adjustment for Android
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Isolated React Query Hook for sending chat messages
  const chatMutation = useSendChatMessage();

  const handleSendMessage = () => {
    const text = userInput.trim();
    if (!text || chatMutation.isPending || !id) return;

    setUserInput("");

    // 1. Add user message locally
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newHistory = [...chatHistory, userMsg];
    setChats(id, newHistory);
    scrollToBottom();

    // 2. Query the RAG Agent backend
    chatMutation.mutate(
      { message: text, projectId: id },
      {
        onSuccess: (data) => {
          let replyContent = "";
          
          if (Array.isArray(data) && data[0]) {
            replyContent = data[0].output || data[0].text || JSON.stringify(data[0]);
          } else if (data && typeof data === "object") {
            replyContent = data.output || data.text || JSON.stringify(data);
          } else if (typeof data === "string") {
            replyContent = data;
          } else {
            replyContent = "No se pudo interpretar la respuesta del servidor RAG.";
          }

          const assistantMsg: ChatMessage = {
            id: Math.random().toString(36).substring(2, 11),
            role: "assistant",
            content: replyContent.trim(),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setChats(id, [...newHistory, assistantMsg]);
          scrollToBottom();
        },
        onError: (err: any) => {
          console.error("Chat error:", err);
          const errorMsg: ChatMessage = {
            id: Math.random().toString(36).substring(2, 11),
            role: "assistant",
            content: `⚠️ Error de red: No se pudo conectar al RAG.\nDetalles: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setChats(id, [...newHistory, errorMsg]);
          scrollToBottom();
        },
      }
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      "Confirmación",
      "¿Quieres borrar el historial de chat de este cuaderno?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            if (id) {
              setChats(id, []);
            }
          },
        },
      ]
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
    >
      <View
        style={{
          flex: 1,
          paddingBottom: Platform.OS === "android" ? keyboardHeight : 0,
        }}
      >
        {/* Quick Toolbar */}
        {chatHistory.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={handleClearChat}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              activeOpacity={0.7}
            >
              <Icon as={Trash} size={14} style={{ color: "#ef4444" }} />
              <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "500" }}>
                Limpiar Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conversation List */}
        <ScrollView
          ref={chatScrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
          onContentSizeChange={scrollToBottom}
        >
          {chatHistory.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64, gap: 12 }}>
              <Icon as={Bot} size={48} style={{ color: colors.mutedForeground }} />
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>
                ¡Hola! Haz tus consultas
              </Text>
              <Text style={{ color: colors.mutedForeground, textAlign: "center", maxW: 250, fontSize: 14 }}>
                Pregunta sobre la información contenida en los documentos indexados de este cuaderno.
              </Text>
            </View>
          ) : (
            chatHistory.map((message) => {
              const isUser = message.role === "user";
              return (
                <View
                  key={message.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  {!isUser && (
                    <View
                      style={{
                        padding: 6,
                        borderRadius: 9999,
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                    >
                      <Icon as={Bot} size={16} style={{ color: colors.foreground }} />
                    </View>
                  )}

                  <View
                    style={{
                      maxWidth: "75%",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderTopRightRadius: isUser ? 2 : 12,
                      borderTopLeftRadius: isUser ? 12 : 2,
                      backgroundColor: isUser ? colors.primary : colors.card,
                      borderColor: colors.border,
                      borderWidth: isUser ? 0 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: isUser ? colors.primaryForeground : colors.foreground,
                        fontSize: 15,
                        lineHeight: 20,
                      }}
                    >
                      {message.content}
                    </Text>
                    <Text
                      style={{
                        color: isUser ? colors.primaryForeground + "B0" : colors.mutedForeground,
                        fontSize: 10,
                        alignSelf: "flex-end",
                        marginTop: 4,
                      }}
                    >
                      {message.timestamp}
                    </Text>
                  </View>

                  {isUser && (
                    <View
                      style={{
                        padding: 6,
                        borderRadius: 9999,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Icon as={User} size={16} style={{ color: colors.primaryForeground }} />
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* AI Thinking loader */}
          {chatMutation.isPending && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 4 }}>
              <ActivityIndicator size="small" color={colors.foreground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                El agente está buscando respuestas...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            gap: 12,
          }}
        >
          <TextInput
            placeholder="Haz una pregunta sobre tus documentos..."
            placeholderTextColor={colors.mutedForeground}
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={handleSendMessage}
            style={{
              flex: 1,
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              maxHeight: 100,
            }}
            disabled={chatMutation.isPending}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!userInput.trim() || chatMutation.isPending}
            style={{
              padding: 10,
              borderRadius: 9999,
              backgroundColor: userInput.trim() && !chatMutation.isPending ? colors.primary : colors.card,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Icon
              as={Send}
              size={18}
              style={{
                color: userInput.trim() && !chatMutation.isPending ? colors.primaryForeground : colors.mutedForeground,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
