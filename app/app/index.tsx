import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { N8N_URL } from "../config";
import { useAppStore, Project } from "../store";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Page() {
  const router = useRouter();

  const { projects, addProject, deleteProject } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Create Project
  const handleCreateProject = () => {
    const nameTrim = newProjectName.trim();
    if (!nameTrim) return;

    const newProj: Project = {
      id: "project_" + Math.random().toString(36).substr(2, 9),
      name: nameTrim,
      createdAt: new Date().toLocaleDateString(),
    };

    addProject(newProj);

    setNewProjectName("");
    setIsCreateOpen(false);

    // Auto-navigate to the new project
    router.push({
      pathname: "/project/[id]",
      params: { id: newProj.id, name: newProj.name },
    });
  };

  // Delete Project
  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      "Confirmación",
      `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esto borrará permanentemente sus documentos de la base de datos y localmente su historial de chat.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Intentar borrar los documentos vectorizados de la base de datos en n8n
              const response = await fetch(
                `${N8N_URL}/webhook/delete-project`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ projectId }),
                },
              );

              if (!response.ok) {
                console.warn(
                  `Error al intentar borrar documentos en n8n: ${response.status}`,
                );
              }
            } catch (error) {
              console.error(
                "Error al conectar con n8n para eliminar documentos:",
                error,
              );
            }

            // Eliminar el proyecto de forma local
            deleteProject(projectId);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Button
        className="bg-blue-500"
        onPress={() =>
          router.push({
            pathname: "/project/[id]",
            params: { id: "test", name: "Proyecto de prueba" },
          })
        }
      >
        <Text className="text-white">Ir a proyecto</Text>
      </Button>
    </SafeAreaView>
  );
}
