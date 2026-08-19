import { useState } from "react";
import { useAppStore, ChatMessage } from "../store";
import { useSendChatMessage } from "../services/queries";
import { useConnection } from "../contexts/ConnectionContext";

export function useProjectChat(projectId: string | undefined) {
  const chatsByProject = useAppStore((state) => state.chatsByProject);
  const setChats = useAppStore((state) => state.setChats);
  const chatHistory = (projectId ? chatsByProject[projectId] : []) || [];

  const { isOnline } = useConnection();
  const isBackendOnline = isOnline;

  const chatMutation = useSendChatMessage();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleSendMessage = (text: string) => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't send chat messages without a connection to the server."
      );
      return;
    }

    if (!projectId) return;

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
            replyContent = "The RAG server's response could not be interpreted.";
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
            content: `⚠️ Network error: Could not connect to the RAG.\nDetails: ${err.message}`,
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
        "Action Disabled",
        "The chat history can't be cleared while the server is offline."
      );
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmClear = () => {
    if (!isOnline) {
      triggerAlert(
        "Action Disabled",
        "The chat history can't be cleared while the server is offline."
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
