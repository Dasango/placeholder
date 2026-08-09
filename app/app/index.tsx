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
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";

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

const STORAGE_KEYS = {
  N8N_URL: "@rag_n8n_url",
  DOCUMENTS: "@rag_uploaded_docs",
  CHAT_HISTORY: "@rag_chat_history",
};

export default function Page() {
  // Navigation Tabs: "upload" | "chat"
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");

  // Configuration
  const [n8nUrl, setN8nUrl] = useState("http://localhost:5678");
  const [tempUrl, setTempUrl] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const chatScrollRef = useRef<ScrollView>(null);

  // Load configuration and data on startup
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedUrl = await AsyncStorage.getItem(STORAGE_KEYS.N8N_URL);
        if (storedUrl) {
          setN8nUrl(storedUrl);
        } else {
          // Detect host environment
          const defaultUrl = Platform.select({
            android: "http://10.0.2.2:5678",
            default: "http://localhost:5678",
          });
          setN8nUrl(defaultUrl);
        }

        const storedDocs = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
        if (storedDocs) {
          setUploadedDocs(JSON.parse(storedDocs));
        }

        const storedChat = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        if (storedChat) {
          setChatHistory(JSON.parse(storedChat));
        }
      } catch (e) {
        console.error("Error loading stored data", e);
      }
    }
    loadStoredData();
  }, []);

  // Save changes to storage helper
  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving data for key ${key}`, e);
    }
  };

  // Configure URL
  const handleSaveConfig = async () => {
    let formattedUrl = tempUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `http://${formattedUrl}`;
    }
    setN8nUrl(formattedUrl);
    await saveToStorage(STORAGE_KEYS.N8N_URL, formattedUrl);
    setIsConfigOpen(false);
    Alert.alert("Éxito", "Configuración guardada correctamente");
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
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // React Native FormData format
      formData.append("data", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      } as any);

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
      await saveToStorage(STORAGE_KEYS.DOCUMENTS, updatedDocs);

      setSelectedFile(null);
      Alert.alert("Éxito", "¡El archivo ha sido indexado correctamente en local!");
    } catch (e: any) {
      console.error("Upload error", e);
      Alert.alert(
        "Fallo de conexión",
        `No se pudo conectar a tu n8n en ${n8nUrl}.\n\nDetalles: ${e.message}\n\nAsegúrate de que n8n esté corriendo en tu PC y que tu celular esté en la misma red Wi-Fi.`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Clear Uploaded Files list
  const handleClearDocsList = async () => {
    Alert.alert(
      "Confirmación",
      "¿Quieres limpiar la lista local de documentos? Esto no los borrará de la base de datos de tu PC, solo los quitará de la vista de la app móvil.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            setUploadedDocs([]);
            await AsyncStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
          },
        },
      ]
    );
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    const text = userInput.trim();
    if (!text || isSending) return;

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
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse n8n response robustly (handles arrays, objects, and nested fields)
      let replyContent = "";
      if (Array.isArray(data) && data[0]) {
        replyContent = data[0].output || data[0].text || JSON.stringify(data[0]);
      } else if (data && typeof data === "object") {
        replyContent = data.output || data.text || JSON.stringify(data);
      } else if (typeof data === "string") {
        replyContent = data;
      } else {
        replyContent = "No se pudo interpretar la respuesta de n8n.";
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: replyContent.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalHistory = [...newHistory, assistantMsg];
      setChatHistory(finalHistory);
      await saveToStorage(STORAGE_KEYS.CHAT_HISTORY, finalHistory);
      
    } catch (e: any) {
      console.error("Chat error", e);
      const systemErrorMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: `⚠️ Error de conexión: No se pudo contactar al servidor de RAG en ${n8nUrl}. Revisa que tu PC esté encendido y que el celular tenga acceso a la red de tu PC.`,
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
    Alert.alert("Confirmación", "¿Quieres borrar el historial de este chat?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          setChatHistory([]);
          await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        },
      },
    ]);
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
        behavior="padding"
        className="flex-1"
      >
        {/* Header bar */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-slate-800/60 border-b border-slate-700/50">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="text-white text-lg font-bold">Local RAG Node</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setTempUrl(n8nUrl);
              setIsConfigOpen(true);
            }}
            className="p-2 rounded-full bg-slate-700/60 hover:bg-slate-700"
          >
            <Feather name="settings" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Tab Selection */}
        <View className="flex-row mx-6 my-4 bg-slate-800/80 rounded-xl p-1 border border-slate-700/30">
          <TouchableOpacity
            onPress={() => setActiveTab("upload")}
            className={`flex-1 flex-row justify-center items-center py-2.5 rounded-lg gap-2 ${
              activeTab === "upload" ? "bg-indigo-600" : ""
            }`}
          >
            <Feather name="file-text" size={18} color="#fff" />
            <Text className="text-white font-semibold">Documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("chat")}
            className={`flex-1 flex-row justify-center items-center py-2.5 rounded-lg gap-2 ${
              activeTab === "chat" ? "bg-indigo-600" : ""
            }`}
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
            <Text className="text-white font-semibold">Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Tab Body */}
        {activeTab === "upload" ? (
          <ScrollView className="flex-1 px-6">
            <Text className="text-slate-400 text-sm mb-4 leading-relaxed">
              Carga tus PDFs o archivos CSV aquí. El sistema local fragmentará el texto y lo almacenará con vectores persistentes en tu base de datos de PostgreSQL.
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
                    <Text className="text-white font-semibold">Cargar a RAG Base</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Uploaded Documents List */}
            <View className="mt-8 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-bold text-base">Documentos Indexados</Text>
                {uploadedDocs.length > 0 && (
                  <TouchableOpacity onPress={handleClearDocsList}>
                    <Text className="text-slate-400 text-xs">Limpiar lista</Text>
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
                    <View className="flex-row items-center gap-1.5">
                      <View className="px-2 py-0.5 bg-emerald-950 rounded-full border border-emerald-900">
                        <Text className="text-emerald-400 text-[10px] font-semibold">Local Vector</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        ) : (
          /* CHAT VIEW */
          <View className="flex-1">
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
                    Asistente de Documentos
                  </Text>
                  <Text className="text-slate-500 text-sm text-center mt-2 leading-relaxed max-w-xs">
                    Haz preguntas sobre cualquiera de los PDFs o CSVs que hayas cargado. El agente buscará en base de datos PostgreSQL local para darte respuestas con contexto.
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
              <View className="px-4 py-1.5 flex-row justify-between items-center border-t border-slate-800 bg-slate-900">
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
                  placeholder="Pregúntale a tu PDF..."
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
        )}

        {/* Configuration settings modal */}
        <Modal
          visible={isConfigOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsConfigOpen(false)}
        >
          <View className="flex-1 bg-black/75 justify-center items-center px-6">
            <View className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">Ajustes de Red Local</Text>
                <TouchableOpacity onPress={() => setIsConfigOpen(false)}>
                  <Feather name="x" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-400 text-xs mb-4 leading-relaxed">
                Ingresa la dirección IP de tu computadora (por ejemplo, <Text className="font-semibold text-slate-300">http://192.168.1.15:5678</Text>) para conectar la app móvil con el n8n de tu PC.
              </Text>

              <Text className="text-slate-300 text-xs font-semibold mb-1.5">n8n Host URL</Text>
              <TextInput
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://192.168.1.X:5678"
                placeholderTextColor="#475569"
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm mb-6"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                onPress={handleSaveConfig}
                className="bg-indigo-600 py-3 rounded-xl justify-center items-center"
              >
                <Text className="text-white font-semibold">Guardar Configuración</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
