import { useState } from "react";
import { useAppStore, ChatMessage } from "../store";
import { useSendChatMessage } from "../services/queries";
import { useConnection } from "../contexts/ConnectionContext";

export function useProjectChat(projectId: string | undefined) {
  // Zustand State Management
  const chatsByProject = useAppStore((state) => state.chatsByProject);
  const setChats = useAppStore((state) => state.setChats);
  const chatHistory = (projectId ? chatsByProject[projectId] : []) || [];

  // Global Connection Context
  const { isOnline } = useConnection();
  const isBackendOnline = isOnline;

  // React Query Mutation to send chat message
  const chatMutation = useSendChatMessage();

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleSendMessage = (text: string) => {
    if (!isOnline) {
      triggerAlert(
        "Servidor Desconectado",
        "No se pueden enviar mensajes de chat sin conexión al servidor."
      );
      return;
    }

    if (!projectId) return;

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
    setChats(projectId, newHistory);

    // 2. Query RAG agent backend (Only executes if online)
    chatMutation.mutate(
      { message: text, projectId },
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

          setChats(projectId, [...newHistory, assistantMsg]);
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
          setChats(projectId, [...newHistory, errorMsg]);
        },
      }
    );
  };

  const handleClearPress = () => {
    if (!isOnline) {
      triggerAlert(
        "Acción Deshabilitada",
        "No se puede limpiar el historial de chat si el servidor está fuera de línea."
      );
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmClear = () => {
    if (!isOnline) {
      triggerAlert(
        "Acción Deshabilitada",
        "No se puede limpiar el historial de chat si el servidor está fuera de línea."
      );
      return;
    }
    if (projectId) {
      setChats(projectId, []);
    }
  };

  return {
    chatHistory,
    isBackendOnline,
    sending: chatMutation.isPending,
    isConfirmOpen,
    setIsConfirmOpen,
    isAlertOpen,
    setIsAlertOpen,
    alertInfo,
    triggerAlert,
    handleSendMessage,
    handleClearPress,
    confirmClear,
  };
}
