import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function ProjectDetail() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  // State
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");
  const [n8nUrl, setN8nUrl] = useState("http://localhost:5678");

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  // Auto-detect backend URL using expo hostUri
  useEffect(() => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      setN8nUrl(`http://${ip}:5678`);
    } else {
      const defaultUrl = Platform.select({
        android: "http://10.0.2.2:5678",
        default: "http://localhost:5678",
      }) || "http://localhost:5678";
      setN8nUrl(defaultUrl);
    }
  }, []);

  // Load project-specific documents and chat on startup
  useEffect(() => {
    if (!id) return;
    
    async function loadProjectData() {
      try {
        const storedDocs = await AsyncStorage.getItem(`@rag_project_docs_${id}`);
        if (storedDocs) {
          setUploadedDocs(JSON.parse(storedDocs));
        }

        const storedChat = await AsyncStorage.getItem(`@rag_project_chat_${id}`);
        if (storedChat) {
          setChatHistory(JSON.parse(storedChat));
        }
      } catch (e) {
        console.error("Error loading project-specific data", e);
      }
    }
    loadProjectData();
  }, [id]);

  // Save data to storage helper
  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving data for key ${key}`, e);
    }
  };

  // Document Picker
  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e) {
      console.error("Error picking document", e);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  // Document Upload
  const handleUploadDocument = async () => {
    if (!selectedFile || !id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("data", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      } as any);
      formData.append("projectId", id);

      const endpoint = `${n8nUrl}/webhook/upload-pdf`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // Success
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: selectedFile.name,
        size: selectedFile.size || 0,
        timestamp: new Date().toLocaleString(),
      };

      const updatedDocs = [newDoc, ...uploadedDocs];
      setUploadedDocs(updatedDocs);
      await saveToStorage(`@rag_project_docs_${id}`, updatedDocs);

      setSelectedFile(null);
      Alert.alert("Éxito", "¡El archivo ha sido indexado en el proyecto correctamente!");
    } catch (e: any) {
      console.error("Upload error", e);
      Alert.alert(
        "Fallo de conexión",
        `No se pudo conectar al backend en ${n8nUrl}.\n\nDetalles: ${e.message}\n\nAsegúrate de que n8n esté corriendo y que tu dispositivo esté en la misma red.`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Clear Uploaded Files list
  const handleClearDocsList = async () => {
    Alert.alert(
      "Confirmación",
      "¿Quieres limpiar la lista local de documentos de este proyecto? Esto no los borrará de la base de datos de n8n, solo los quitará de la vista en la app.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            setUploadedDocs([]);
            if (id) {
              await AsyncStorage.removeItem(`@rag_project_docs_${id}`);
            }
          },
        },
      ]
    );
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    const text = userInput.trim();
    if (!text || isSending || !id) return;

    setUserInput("");
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const endpoint = `${n8nUrl}/webhook/chat`;
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

      const data = await response.json();
      
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

      const finalHistory = [...newHistory, assistantMsg];
      setChatHistory(finalHistory);
      await saveToStorage(`@rag_project_chat_${id}`, finalHistory);
      
    } catch (e: any) {
      console.error("Chat error", e);
      const systemErrorMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: `⚠️ Error de conexión: No se pudo contactar al servidor en ${n8nUrl}. Revisa que n8n esté corriendo y que tu dispositivo comparta la red.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatHistory([...newHistory, systemErrorMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    Alert.alert("Confirmación", "¿Quieres borrar el historial de chat de este proyecto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          setChatHistory([]);
          if (id) {
            await AsyncStorage.removeItem(`@rag_project_chat_${id}`);
          }
        },
      },
    ]);
  };

  // Horizontal Scroll handler
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffset / screenWidth);
    setActiveTab(pageIndex === 0 ? "upload" : "chat");
  };

  // Scroll to Tab
  const navigateToTab = (tab: "upload" | "chat") => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      x: tab === "upload" ? 0 : screenWidth,
      animated: true,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header Bar */}
        <View className="px-6 py-4 flex-row items-center bg-slate-800/60 border-b border-slate-700/50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2 mr-3 rounded-lg bg-slate-700/30 active:bg-slate-700/60"
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>
              {name || "Detalle del Proyecto"}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              NotebookLM RAG Local
            </Text>
          </View>
        </View>

        {/* Tab Selection (Horizontal Swipe indicator) */}
        <View className="flex-row mx-6 my-4 bg-slate-800/80 rounded-xl p-1 border border-slate-700/30">
          <TouchableOpacity
            onPress={() => navigateToTab("upload")}
            className={`flex-1 flex-row justify-center items-center py-2.5 rounded-lg gap-2 ${
              activeTab === "upload" ? "bg-indigo-600" : ""
            }`}
          >
            <Feather name="file-text" size={18} color="#fff" />
            <Text className="text-white font-semibold">Documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToTab("chat")}
            className={`flex-1 flex-row justify-center items-center py-2.5 rounded-lg gap-2 ${
              activeTab === "chat" ? "bg-indigo-600" : ""
            }`}
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
            <Text className="text-white font-semibold">Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Navigation Layout */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {/* VISTA 1: DOCUMENTOS */}
          <View style={{ width: screenWidth }} className="flex-1 px-6">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Text className="text-slate-400 text-sm mb-4 leading-relaxed">
                Carga documentos exclusivos para este proyecto. La base de datos los vectorizará de forma aislada, garantizando la privacidad del contenido.
              </Text>

              {/* Document selector zone */}
              {!selectedFile ? (
                <TouchableOpacity
                  onPress={handleSelectDocument}
                  className="border-2 border-dashed border-slate-600 rounded-2xl py-12 px-6 justify-center items-center bg-slate-800/30"
                >
                  <Feather name="upload-cloud" size={48} color="#6366f1" />
                  <Text className="text-white font-semibold mt-4 text-base">
                    Seleccionar Documento
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    Formatos soportados: .pdf, .csv
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="p-3 bg-indigo-900/40 rounded-xl mr-3">
                      <Feather name="file" size={24} color="#818cf8" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        {formatBytes(selectedFile.size || 0)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFile(null)}
                    className="p-2 rounded-lg bg-slate-700/50"
                  >
                    <Feather name="trash-2" size={18} color="#f87171" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <TouchableOpacity
                  onPress={handleUploadDocument}
                  disabled={isUploading}
                  className="mt-4 bg-indigo-600 rounded-xl py-3 justify-center items-center flex-row gap-2"
                >
                  {isUploading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white font-semibold">Procesando y Subiendo...</Text>
                    </>
                  ) : (
                    <>
                      <Feather name="send" size={18} color="#fff" />
                      <Text className="text-white font-semibold">Cargar al Proyecto</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Uploaded Documents List */}
              <View className="mt-8 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-white font-bold text-base">Documentos del Proyecto</Text>
                  {uploadedDocs.length > 0 && (
                    <TouchableOpacity onPress={handleClearDocsList}>
                      <Text className="text-slate-400 text-xs font-semibold">Limpiar lista</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {uploadedDocs.length === 0 ? (
                  <View className="py-8 justify-center items-center bg-slate-800/10 rounded-xl border border-slate-800">
                    <Feather name="folder" size={32} color="#475569" />
                    <Text className="text-slate-500 text-sm mt-2">No hay documentos indexados</Text>
                  </View>
                ) : (
                  uploadedDocs.map((doc) => (
                    <View
                      key={doc.id}
                      className="flex-row items-center justify-between p-3.5 bg-slate-800/40 rounded-xl mb-2.5 border border-slate-800"
                    >
                      <View className="flex-row items-center flex-1 mr-3">
                        <Feather name="file" size={18} color="#94a3b8" className="mr-2.5" />
                        <View className="flex-1">
                          <Text className="text-slate-200 text-sm font-medium" numberOfLines={1}>
                            {doc.name}
                          </Text>
                          <Text className="text-slate-500 text-xs mt-0.5">
                            {formatBytes(doc.size)} • {doc.timestamp}
                          </Text>
                        </View>
                      </View>
                      <View className="px-2 py-0.5 bg-emerald-950 rounded-full border border-emerald-900">
                        <Text className="text-emerald-400 text-[10px] font-semibold">Aislado</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>

          {/* VISTA 2: CHAT */}
          <View style={{ width: screenWidth }} className="flex-1">
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
              {isSending && (
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
                  disabled={!userInput.trim() || isSending}
                  className={`p-2 rounded-lg ${
                    userInput.trim() && !isSending ? "bg-indigo-600" : "bg-slate-700/40"
                  }`}
                >
                  <Feather
                    name="arrow-up"
                    size={16}
                    color={userInput.trim() && !isSending ? "#fff" : "#475569"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
