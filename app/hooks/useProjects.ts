import { useState } from "react";
import { useAppStore, Project } from "../store";
import { useDeleteProjectFiles } from "../services/queries";
import { useConnection } from "../contexts/ConnectionContext";

export function useProjects() {
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  const { isOnline } = useConnection();
  const isBackendOnline = isOnline;

  const deleteProjectFilesMutation = useDeleteProjectFiles();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", description: "" });

  const triggerAlert = (title: string, description: string) => {
    setAlertInfo({ title, description });
    setIsAlertOpen(true);
  };

  const handleAddNewProject = (name: string) => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't create notebooks without a connection to the server. Please start the n8n backend."
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
        "Server Disconnected",
        "You can't delete notebooks without a connection to the RAG server."
      );
      return;
    }
    setProjectToDelete({ id: projectId, name: projectName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!isOnline) {
      triggerAlert(
        "Server Disconnected",
        "You can't delete files from the vector database without a connection to the server."
      );
      return;
    }

    if (!projectToDelete) return;
    const { id: projectId } = projectToDelete;

    deleteProject(projectId);

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
