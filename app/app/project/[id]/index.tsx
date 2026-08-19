import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams } from "expo-router";
import { useAppStore, UploadedDocument } from "../../../store";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { useUploadDocument, useDeleteDocument } from "../../../services/queries";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Upload, Trash2, FileText, CheckCircle, Info } from "lucide-react-native";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  // Zustand state management for local document metadata listing
  const documentsByProject = useAppStore((state) => state.documentsByProject);
  const setDocuments = useAppStore((state) => state.setDocuments);
  const uploadedDocs = (id ? documentsByProject[id] : []) || [];

  // Local selection state
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Isolated React Query Hooks
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // File Picker
  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/csv", "text/plain"],
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

  // Upload trigger
  const handleUploadDocument = () => {
    if (!selectedFile || !id) return;

    const fileToUpload = {
      uri: selectedFile.uri,
      name: selectedFile.name,
      mimeType: selectedFile.mimeType || "application/pdf",
    };

    uploadMutation.mutate(
      { file: fileToUpload, projectId: id },
      {
        onSuccess: () => {
          const newDoc: UploadedDocument = {
            id: Math.random().toString(36).substring(2, 11),
            name: selectedFile.name,
            size: selectedFile.size || 0,
            timestamp: new Date().toLocaleString(),
          };

          const updatedDocs = [newDoc, ...uploadedDocs];
          setDocuments(id, updatedDocs);
          setSelectedFile(null);
          Alert.alert("Éxito", "¡El archivo ha sido indexado en el RAG correctamente!");
        },
        onError: (err: any) => {
          Alert.alert(
            "Fallo de conexión",
            `No se pudo subir o indexar el documento.\n\nDetalles: ${err.message}`
          );
        },
      }
    );
  };

  // Delete individual document
  const handleDeleteDoc = (docId: string, docName: string) => {
    if (!id) return;

    Alert.alert(
      "Confirmación",
      `¿Estás seguro de que quieres eliminar el documento "${docName}"? Esto lo borrará de la base de datos de n8n y de la app.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // Delete from vector store
            deleteMutation.mutate(
              { projectId: id, documentName: docName },
              {
                onSuccess: () => {
                  // Delete locally in Zustand
                  setDocuments(
                    id,
                    uploadedDocs.filter((d) => d.id !== docId)
                  );
                },
                onError: (err: any) => {
                  console.warn("Could not delete from n8n vector store, deleting locally anyway:", err);
                  // Ensure local deletion even if n8n endpoint fails
                  setDocuments(
                    id,
                    uploadedDocs.filter((d) => d.id !== docId)
                  );
                },
              }
            );
          },
        },
      ]
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        
        {/* Upload Card */}
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardHeader>
            <CardTitle style={{ color: colors.foreground }}>Agregar Documento</CardTitle>
            <CardDescription style={{ color: colors.mutedForeground }}>
              Sube archivos PDF, TXT o CSV para indexarlos en el cuaderno.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 16 }}>
            {/* File Selector */}
            <TouchableOpacity
              onPress={handleSelectDocument}
              style={{
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.border,
                borderRadius: 8,
                padding: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background,
                gap: 8,
              }}
              activeOpacity={0.7}
            >
              <Icon as={Upload} size={28} style={{ color: colors.mutedForeground }} />
              <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                {selectedFile ? selectedFile.name : "Seleccionar Archivo"}
              </Text>
              {selectedFile && (
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  {formatBytes(selectedFile.size || 0)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Actions */}
            {selectedFile && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button
                  variant="outline"
                  onPress={() => setSelectedFile(null)}
                  style={{ flex: 1, borderColor: colors.border }}
                  disabled={uploadMutation.isPending}
                >
                  <Text style={{ color: colors.foreground }}>Cancelar</Text>
                </Button>
                <Button
                  onPress={handleUploadDocument}
                  style={{ flex: 1, backgroundColor: colors.primary }}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <Text style={{ color: colors.primaryForeground }}>Indexar</Text>
                  )}
                </Button>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginLeft: 4 }}>
            Documentos Indexados ({uploadedDocs.length})
          </Text>

          {uploadedDocs.length === 0 ? (
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardContent style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
                <Icon as={Info} size={24} style={{ color: colors.mutedForeground }} />
                <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
                  Aún no has agregado ningún documento en este cuaderno.
                </Text>
              </CardContent>
            </Card>
          ) : (
            uploadedDocs.map((doc) => (
              <View
                key={doc.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  <Icon as={FileText} style={{ color: colors.mutedForeground }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.foreground, fontWeight: "500" }}
                    >
                      {doc.name}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                      {formatBytes(doc.size)} • {doc.timestamp}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteDoc(doc.id, doc.name)}
                  style={{ padding: 8 }}
                  disabled={deleteMutation.isPending}
                >
                  <Icon as={Trash2} size={18} style={{ color: "#ef4444" }} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
