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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { N8N_URL } from "../../../config";
import { useAppStore, ChatMessage } from "../../../store";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const chatsByProject = useAppStore((state) => state.chatsByProject);
  const setChats = useAppStore((state) => state.setChats);
  const chatHistory = (id ? chatsByProject[id] : []) || [];

  const [userInput, setUserInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const chatScrollRef = useRef<ScrollView>(null);

  // Send Chat Message Mutation
  const chatMutation = useMutation({
    mutationFn: async (text: string) => {
      const endpoint = `${N8N_URL}/webhook/chat`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text, projectId: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      let replyContent = "";
      if (Array.isArray(data) && data[0]) {
        replyContent = data[0].output || data[0].text || JSON.stringify(data[0]);
      } else if (data && typeof data === "object") {
        replyContent = data.output || data.text || JSON.stringify(data);
      } else if (typeof data === "string") {
        replyContent = data;
      } else {
        replyContent = "No se pudo interpretar la respuesta del servidor.";
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: replyContent.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (id) {
        const currentHistory = chatsByProject[id] || [];
        setChats(id, [...currentHistory, assistantMsg]);
      }
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: (e: any, variables) => {
      console.error("Chat error", e);
      const systemErrorMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: `⚠️ Error de conexión: No se pudo contactar al servidor en ${N8N_URL}. Revisa que n8n esté corriendo y que tu dispositivo comparta la red.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (id) {
        const currentHistory = chatsByProject[id] || [];
        setChats(id, [...currentHistory, systemErrorMsg]);
      }
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const handleSendMessage = () => {
    const text = userInput.trim();
    if (!text || chatMutation.isPending || !id) return;

    setUserInput("");

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...chatHistory, userMsg];
    setChats(id, newHistory);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);

    chatMutation.mutate(text);
  };

  // Clear Chat History
  const handleClearChat = () => {
    Alert.alert("Confirmación", "¿Quieres borrar el historial de chat de este proyecto?", [
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
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-900"
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
    >
      <View
        className="flex-1"
        style={Platform.OS === "android" ? { paddingBottom: keyboardHeight } : undefined}
      >
        <ScrollView
          ref={chatScrollRef}
          className="flex-1 px-4 py-2"
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
        >
          {chatHistory.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-6">
              <View className="p-4 bg-indigo-950/40 rounded-2xl mb-4 border border-indigo-900/30">
                <Ionicons name="chatbubble-ellipses-outline" size={42} color="#6366f1" />
              </View>
              <Text className="text-white text-base font-bold text-center">
                Chat con tus Documentos
              </Text>
              <Text className="text-slate-500 text-sm text-center mt-2 leading-relaxed max-w-xs">
                Haz preguntas sobre los documentos cargados en este proyecto. La respuesta se basará exclusivamente en su contexto.
              </Text>
            </View>
          ) : (
            chatHistory.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row mb-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <View
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600 rounded-tr-none"
                      : "bg-slate-800 border border-slate-700/50 rounded-tl-none"
                  }`}
                >
                  <Text
                    className={`text-sm leading-relaxed ${
                      msg.role === "user" ? "text-white" : "text-slate-100"
                    }`}
                  >
                    {msg.content}
                  </Text>
                  <Text
                    className={`text-[10px] mt-1 text-right ${
                      msg.role === "user" ? "text-indigo-200" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Typing indicator */}
          {chatMutation.isPending && (
            <View className="flex-row justify-start mb-4">
              <View className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3.5 flex-row items-center gap-1.5">
                <ActivityIndicator size="small" color="#6366f1" />
                <Text className="text-slate-400 text-xs">Consultando base local...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Chat Control Header */}
        {chatHistory.length > 0 && (
          <View className="px-4 py-1.5 flex-row justify-between items-center border-t border-slate-850 bg-slate-900">
            <TouchableOpacity onPress={handleClearChat} className="flex-row items-center gap-1">
              <Feather name="trash" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs">Borrar chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Box */}
        <View className="p-4 bg-slate-800/40 border-t border-slate-850">
          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 py-1.5 border border-slate-700/50">
            <TextInput
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Pregúntale al proyecto..."
              placeholderTextColor="#64748b"
              multiline
              className="flex-1 text-white text-sm py-1.5 max-h-20"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!userInput.trim() || chatMutation.isPending}
              className={`p-2 rounded-lg ${
                userInput.trim() && !chatMutation.isPending ? "bg-indigo-600" : "bg-slate-700/40"
              }`}
            >
              <Feather
                name="arrow-up"
                size={16}
                color={userInput.trim() && !chatMutation.isPending ? "#fff" : "#475569"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
