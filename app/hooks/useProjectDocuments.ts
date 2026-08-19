import { useState } from "react";
import { useAppStore, UploadedDocument } from "../store";
import { useConnectionCheck, useDeleteDocument } from "../services/queries";

export function useProjectDocuments(projectId: string | undefined) {
  // Zustand State Management
  const documentsByProject = useAppStore((state) => state.documentsByProject);
  const setDocuments = useAppStore((state) => state.setDocuments);
  const uploadedDocs = (projectId ? documentsByProject[projectId] : []) || [];

  // Connection query check
  const { data: isConnected } = useConnectionCheck();
  const isBackendOnline = isConnected !== false;

  // React Query Mutation to delete single document in backend
  const deleteMutation = useDeleteDocument();

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string; name: string } | null>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleUploadSuccess = (newDoc: UploadedDocument) => {
    if (!projectId) return;
    const updatedDocs = [newDoc, ...uploadedDocs];
    setDocuments(projectId, updatedDocs);
  };

  const handleDeletePress = (docId: string, docName: string) => {
    if (!isBackendOnline) {
      triggerAlert(
        "Acción Deshabilitada",
        "No se pueden borrar documentos vectorizados sin conexión al servidor."
      );
      return;
    }
    setDocToDelete({ id: docId, name: docName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!projectId || !docToDelete) return;
    const { id: docId, name: docName } = docToDelete;

    deleteMutation.mutate(
      { projectId, documentName: docName },
      {
        onSuccess: () => {
          // Sync locally in Zustand
          setDocuments(
            projectId,
            uploadedDocs.filter((d) => d.id !== docId)
          );
        },
        onError: (err: any) => {
          console.warn("Server deletion failed, syncing local list anyway:", err);
          // Sync locally anyway to not block user
          setDocuments(
            projectId,
            uploadedDocs.filter((d) => d.id !== docId)
          );
        },
      }
    );

    setDocToDelete(null);
  };

  return {
    uploadedDocs,
    isBackendOnline,
    isConfirmOpen,
    setIsConfirmOpen,
    docToDelete,
    isAlertOpen,
    setIsAlertOpen,
    alertInfo,
    triggerAlert,
    handleUploadSuccess,
    handleDeletePress,
    confirmDelete,
  };
}
