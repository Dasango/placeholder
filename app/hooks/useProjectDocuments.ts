import { useState } from "react";
import { useAppStore, UploadedDocument } from "../store";
import { useDeleteDocument } from "../services/queries";
import { useConnection } from "../contexts/ConnectionContext";

export function useProjectDocuments(projectId: string | undefined) {
  const documentsByProject = useAppStore((state) => state.documentsByProject);
  const setDocuments = useAppStore((state) => state.setDocuments);
  const uploadedDocs = (projectId ? documentsByProject[projectId] : []) || [];

  const { isOnline } = useConnection();
  const isBackendOnline = isOnline;

  const deleteMutation = useDeleteDocument();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleUploadSuccess = (newDoc: UploadedDocument) => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't upload documents without a connection to the server."
      );
      return;
    }

    if (!projectId) return;
    const updatedDocs = [newDoc, ...uploadedDocs];
    setDocuments(projectId, updatedDocs);
  };

  const handleDeletePress = (docId: string, docName: string) => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't delete vectorized documents without a connection to the server."
      );
      return;
    }
    setDocToDelete({ id: docId, name: docName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't delete vectorized documents without a connection to the server."
      );
      return;
    }

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
