import React from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProjectDocuments } from "../../../hooks/useProjectDocuments";

import { DocumentPickerCard } from "../../../components/DocumentPickerCard";
import { DocumentListItem } from "../../../components/DocumentListItem";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AlertDialog } from "../../../components/AlertDialog";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Info } from "lucide-react-native";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    uploadedDocs,
    isBackendOnline,
    isConfirmOpen,
    setIsConfirmOpen,
    docToDelete,
    isAlertOpen,
    setIsAlertOpen,
    alertInfo,
    handleUploadSuccess,
    handleDeletePress,
    confirmDelete,
  } = useProjectDocuments(id);

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <ScrollView
        contentContainerClassName="p-5 gap-5"
        showsVerticalScrollIndicator={false}
      >
        {!isBackendOnline && (
          <View className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg flex-row items-center gap-2">
            <Text className="text-amber-700 dark:text-amber-450 text-xs font-semibold">
              ⚠️ Ingesta fuera de línea. La base de datos no está disponible.
            </Text>
          </View>
        )}

        <DocumentPickerCard
          projectId={id || ""}
          isConnected={isBackendOnline}
          onSuccess={handleUploadSuccess}
        />

        <View className="gap-3">
          <Text className="text-zinc-900 dark:text-zinc-50 font-bold text-base pl-1">
            Documentos Indexados ({uploadedDocs.length})
          </Text>

          {uploadedDocs.length === 0 ? (
            <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <CardContent className="items-center py-8 gap-2">
                <Icon as={Info} className="text-zinc-400 size-6" />
                <Text className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                  Aún no has agregado ningún documento en este cuaderno.
                </Text>
              </CardContent>
            </Card>
          ) : (
            uploadedDocs.map((doc) => (
              <DocumentListItem
                key={doc.id}
                doc={doc}
                isConnected={isBackendOnline}
                onDelete={() => handleDeletePress(doc.id, doc.name)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Eliminar Documento"
        description={`¿Estás seguro de que quieres eliminar el documento "${docToDelete?.name}"? Esto lo borrará de la base de datos vectorial de n8n y de la app.`}
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        variant="destructive"
      />

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title={alertInfo.title}
        description={alertInfo.description}
      />
    </View>
  );
}
