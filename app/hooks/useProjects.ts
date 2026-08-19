import { useState } from "react";
import { useAppStore, Project } from "../store";
import { useConnectionCheck, useDeleteProjectFiles } from "../services/queries";

export function useProjects() {
  // Zustand State
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  // Connection status query
  const { data: isConnected } = useConnectionCheck();
  const isBackendOnline = isConnected !== false;

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
    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      createdAt: new Date().toLocaleDateString(),
    };
    addProject(newProject);
  };

  const handleDeletePress = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    const { id: projectId } = projectToDelete;

    // 1. Delete locally in Zustand
    deleteProject(projectId);

    // 2. Delete database vector files in n8n
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
