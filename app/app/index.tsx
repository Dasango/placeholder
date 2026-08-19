import React, { useState } from "react";
import { View, ScrollView, TextInput, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore, Project } from "../store";
import { useAppTheme } from "../hooks/useAppTheme";
import { useConnectionCheck, useDeleteProjectFiles } from "../services/queries";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Plus, Trash2, BookOpen, AlertCircle, WifiOff } from "lucide-react-native";

export default function Page() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  // Zustand State
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  // Connection Check Query
  const { data: isConnected, isLoading: isCheckingConnection } = useConnectionCheck();

  // Backend Project Deletion Mutation
  const deleteProjectFilesMutation = useDeleteProjectFiles();

  // Dialog State
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) {
      Alert.alert("Error", "El nombre del proyecto no puede estar vacío.");
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      createdAt: new Date().toLocaleDateString(),
    };

    addProject(newProject);
    setNewProjectName("");
    setIsDialogOpen(false);
  };

  const handleDeleteProject = (projectId: string, name: string) => {
    Alert.alert(
      "Eliminar Proyecto",
      `¿Estás seguro de que quieres eliminar el proyecto "${name}"? Esto borrará todos sus documentos y chat asociados, tanto en la app como en la base de datos vectorial del RAG.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // Delete locally in Zustand
            deleteProject(projectId);
            // Delete vector embeddings in n8n/Postgres
            try {
              await deleteProjectFilesMutation.mutateAsync(projectId);
            } catch (error) {
              console.error("Failed to delete project vector files in backend:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        
        {/* Connection Status Alert */}
        {isConnected === false && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderRadius: 8,
              backgroundColor: isDark ? "#2c1c1d" : "#fef2f2",
              borderColor: isDark ? "#7f1d1d" : "#fca5a5",
              borderWidth: 1,
            }}
          >
            <Icon as={WifiOff} style={{ color: isDark ? "#f87171" : "#dc2626" }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: isDark ? "#f87171" : "#dc2626" }}>
                Sin conexión
              </Text>
              <Text variant="small" style={{ color: isDark ? "#fca5a5" : "#7f1d1d" }}>
                No se pudo conectar al servidor RAG. Verifica que n8n esté activo.
              </Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, borderBottomWidth: 0, paddingBottom: 0 }}>
              Cuadernos
            </Text>
            <Text variant="muted" style={{ color: colors.mutedForeground }}>
              Tus documentos indexados y chats RAG
            </Text>
          </View>

          {/* New Project Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" style={{ backgroundColor: colors.primary, borderRadius: 9999 }}>
                <Icon as={Plus} style={{ color: colors.primaryForeground }} />
              </Button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: colors.background, borderColor: colors.border }}>
              <DialogHeader>
                <DialogTitle style={{ color: colors.foreground }}>Nuevo Cuaderno</DialogTitle>
                <DialogDescription style={{ color: colors.mutedForeground }}>
                  Crea un nuevo proyecto/cuaderno independiente para tus documentos.
                </DialogDescription>
              </DialogHeader>

              <View style={{ marginVertical: 12 }}>
                <TextInput
                  placeholder="Nombre del cuaderno..."
                  placeholderTextColor={colors.mutedForeground}
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  style={{
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  autoFocus
                />
              </View>

              <DialogFooter style={{ flexDirection: "row", justifyContent: "end", gap: 12 }}>
                <DialogClose asChild>
                  <Button variant="outline" style={{ borderColor: colors.border }}>
                    <Text style={{ color: colors.foreground }}>Cancelar</Text>
                  </Button>
                </DialogClose>
                <Button 
                  onPress={handleCreateProject}
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text style={{ color: colors.primaryForeground }}>Crear</Text>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </View>

        {/* Projects List */}
        <View style={{ gap: 16 }}>
          {projects.length === 0 ? (
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader style={{ alignItems: "center", paddingVertical: 32 }}>
                <Icon as={BookOpen} size={48} style={{ color: colors.mutedForeground, marginBottom: 12 }} />
                <CardTitle style={{ color: colors.foreground }}>No hay cuadernos</CardTitle>
                <CardDescription style={{ color: colors.mutedForeground, textAlign: "center" }}>
                  Crea tu primer cuaderno usando el botón + para empezar a indexar documentos.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() =>
                  router.push({
                    pathname: "/project/[id]",
                    params: { id: project.id, name: project.name },
                  })
                }
                activeOpacity={0.7}
              >
                <Card style={{ backgroundColor: colors.card, borderColor: colors.border, position: "relative" }}>
                  <CardHeader style={{ paddingRight: 60 }}>
                    <CardTitle style={{ color: colors.foreground }}>{project.name}</CardTitle>
                    <CardDescription style={{ color: colors.mutedForeground }}>
                      Creado el {project.createdAt}
                    </CardDescription>
                  </CardHeader>
                  <TouchableOpacity
                    onPress={() => handleDeleteProject(project.id, project.name)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 24,
                      padding: 8,
                    }}
                  >
                    <Icon as={Trash2} size={18} style={{ color: "#ef4444" }} />
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}