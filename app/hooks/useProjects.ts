import { useState } from "react";
import { useAppStore, Project } from "../store";
import { useDeleteProjectFiles } from "../services/queries";
import { useConnection } from "../contexts/ConnectionContext";

export function useProjects() {
  // Zustand State
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  // Global Connection Context
  const { isOnline } = useConnection();
  const isBackendOnline = isOnline;

  // React Query Mutation to delete files in postgres/n8n
  const deleteProjectFilesMutation = useDeleteProjectFiles();

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleAddNewProject = (name: string) => {
    if (!isOnline) {
      triggerAlert(
        "Servidor Desconectado",
        "No se pueden crear cuadernos sin conexión al servidor. Por favor, levanta el backend de n8n."
      );
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      createdAt: new Date().toLocaleDateString(),
    };
    addProject(newProject);
  };

  const handleDeletePress = (projectId: string, projectName: string) => {
    if (!isOnline) {
      triggerAlert(
        "Servidor Desconectado",
        "No se pueden eliminar cuadernos sin conexión al servidor RAG."
      );
      return;
    }
    setProjectToDelete({ id: projectId, name: projectName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!isOnline) {
      triggerAlert(
        "Servidor Desconectado",
        "No se pueden eliminar archivos de la base de datos vectorial sin conexión al servidor."
      );
      return;
    }

    if (!projectToDelete) return;
    const { id: projectId } = projectToDelete;

    // 1. Delete locally in Zustand
    deleteProject(projectId);

    // 2. Delete database vector files in n8n (Only executes if online!)
    deleteProjectFilesMutation.mutate(projectId, {
      onError: (err) => {
        console.warn("Could not delete project files from backend:", err);
      },
    });

    setProjectToDelete(null);
  };

  return {
    projects,
    isBackendOnline,
    isConfirmOpen,
    setIsConfirmOpen,
    projectToDelete,
    isAlertOpen,
    setIsAlertOpen,
    alertInfo,
    triggerAlert,
    handleAddNewProject,
    handleDeletePress,
    confirmDelete,
  };
}
