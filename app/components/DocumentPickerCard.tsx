import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useUploadDocument } from "../services/queries";
import { UploadedDocument } from "../store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Upload } from "lucide-react-native";

interface DocumentPickerCardProps {
  projectId: string;
  isConnected: boolean;
  onSuccess: (newDoc: UploadedDocument) => void;
}

export function DocumentPickerCard({ projectId, isConnected, onSuccess }: DocumentPickerCardProps) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const uploadMutation = useUploadDocument();

  const handleSelectDocument = async () => {
    setStatus(null);
    if (!isConnected) return;

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
      setStatus({ type: "error", message: "No se pudo seleccionar el archivo." });
    }
  };

  const handleUploadDocument = () => {
    if (!selectedFile || !projectId || !isConnected) return;
    setStatus(null);

    const fileToUpload = {
      uri: selectedFile.uri,
      name: selectedFile.name,
      mimeType: selectedFile.mimeType || "application/pdf",
    };

    uploadMutation.mutate(
      { file: fileToUpload, projectId },
      {
        onSuccess: () => {
          const newDoc: UploadedDocument = {
            id: Math.random().toString(36).substring(2, 11),
            name: selectedFile.name,
            size: selectedFile.size || 0,
            timestamp: new Date().toLocaleString(),
          };
          onSuccess(newDoc);
          setSelectedFile(null);
          setStatus({
            type: "success",
            message: "¡El archivo ha sido indexado en el RAG correctamente!",
          });
        },
        onError: (err: any) => {
          setStatus({
            type: "error",
            message: `Fallo al indexar: ${err.message}`,
          });
        },
      }
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
    <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-50 font-bold">
          Agregar Documento
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
          {isConnected
            ? "Sube archivos PDF, TXT o CSV para indexarlos en el cuaderno."
            : "⚠️ Carga deshabilitada por falta de conexión al servidor RAG."}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        {/* File Selector */}
        <TouchableOpacity
          onPress={handleSelectDocument}
          disabled={!isConnected || uploadMutation.isPending}
          className={`border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 items-center justify-center bg-white dark:bg-zinc-950 gap-2 ${
            !isConnected ? "opacity-50" : ""
          }`}
          activeOpacity={0.7}
        >
          <Icon as={Upload} className="text-zinc-400 size-7" />
          <Text className="text-zinc-800 dark:text-zinc-200 font-medium text-center">
            {selectedFile ? selectedFile.name : "Seleccionar Archivo"}
          </Text>
          {selectedFile && (
            <Text className="text-zinc-500 dark:text-zinc-400 text-xs">
              {formatBytes(selectedFile.size || 0)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Local Feedback Status Message */}
        {status && (
          <View
            className={`p-3 rounded-lg border ${
              status.type === "success"
                ? "bg-green-55 border-green-200 dark:bg-green-950/20 dark:border-green-900/50"
                : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                status.type === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {status.message}
            </Text>
          </View>
        )}

        {/* Actions */}
        {selectedFile && isConnected && (
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={() => {
                setSelectedFile(null);
                setStatus(null);
              }}
              className="flex-1 border border-zinc-200 dark:border-zinc-800"
              disabled={uploadMutation.isPending}
            >
              <Text className="text-zinc-700 dark:text-zinc-300">Cancelar</Text>
            </Button>
            <Button
              onPress={handleUploadDocument}
              className="flex-1 bg-zinc-900 dark:bg-zinc-50"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white dark:text-zinc-950 font-semibold">Indexar</Text>
              )}
            </Button>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
