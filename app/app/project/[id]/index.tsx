import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams } from "expo-router";
import { N8N_URL } from "../../../config";

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  timestamp: string;
}

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Document Upload State
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  // Load project-specific documents on startup
  useEffect(() => {
    if (!id) return;

    async function loadDocuments() {
      try {
        const storedDocs = await AsyncStorage.getItem(
          `@rag_project_docs_${id}`,
        );
        if (storedDocs) {
          setUploadedDocs(JSON.parse(storedDocs));
        }
      } catch (e) {
        console.error("Error loading project documents", e);
      }
    }
    loadDocuments();
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

      const endpoint = `${N8N_URL}/webhook/upload-pdf`;
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
      Alert.alert(
        "Éxito",
        "¡El archivo ha sido indexado en el proyecto correctamente!",
      );
    } catch (e: any) {
      console.error("Upload error", e);
      Alert.alert(
        "Fallo de conexión",
        `No se pudo conectar al backend en ${N8N_URL}.\n\nDetalles: ${e.message}\n\nAsegúrate de que n8n esté corriendo y que tu dispositivo esté en la misma red.`,
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
      ],
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <View className="flex-1 bg-slate-900 px-6 pt-4">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Text className="text-slate-400 text-sm mb-4 leading-relaxed">
            Carga documentos exclusivos para este proyecto. La base de datos los
            vectorizará de forma aislada, garantizando la privacidad del
            contenido.
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
                  <Text
                    className="text-white font-semibold text-sm"
                    numberOfLines={1}
                  >
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
                  <Text className="text-white font-semibold">
                    Procesando y Subiendo...
                  </Text>
                </>
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text className="text-white font-semibold">
                    Cargar al Proyecto
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Uploaded Documents List */}
          <View className="mt-8 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-base">
                Documentos del Proyecto
              </Text>
              {uploadedDocs.length > 0 && (
                <TouchableOpacity onPress={handleClearDocsList}>
                  <Text className="text-slate-400 text-xs font-semibold">
                    Limpiar lista
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {uploadedDocs.length === 0 ? (
              <View className="py-8 justify-center items-center bg-slate-800/10 rounded-xl border border-slate-800">
                <Feather name="folder" size={32} color="#475569" />
                <Text className="text-slate-500 text-sm mt-2">
                  No hay documentos indexados
                </Text>
              </View>
            ) : (
              uploadedDocs.map((doc) => (
                <View
                  key={doc.id}
                  className="flex-row items-center justify-between p-3.5 bg-slate-800/40 rounded-xl mb-2.5 border border-slate-800"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <Feather
                      name="file"
                      size={18}
                      color="#94a3b8"
                      className="mr-2.5"
                    />
                    <View className="flex-1">
                      <Text
                        className="text-slate-200 text-sm font-medium"
                        numberOfLines={1}
                      >
                        {doc.name}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">
                        {formatBytes(doc.size)} • {doc.timestamp}
                      </Text>
                    </View>
                  </View>
                  <View className="px-2 py-0.5 bg-emerald-950 rounded-full border border-emerald-900">
                    <Text className="text-emerald-400 text-[10px] font-semibold">
                      Aislado
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
  );
}
