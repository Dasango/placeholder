import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useProjects } from "../hooks/useProjects";

// Compound Components & Modals
import { ConnectionBanner } from "../components/ConnectionBanner";
import { NewProjectDialog } from "../components/NewProjectDialog";
import { ProjectCard } from "../components/ProjectCard";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { AlertDialog } from "../components/AlertDialog";

// UI Primitives & Icons
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Plus, Sun, Moon, BookOpen } from "lucide-react-native";

export default function Page() {
  const router = useRouter();

  // NativeWind Theme
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Business logic hook (No Zustand/queries inside app/app/)
  const {
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
  } = useProjects();

  // Dialog State
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <View className="flex-1 relative">
        <ScrollView
          contentContainerClassName="p-6 pb-28 gap-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Connection Status Banner */}
          <ConnectionBanner />

          {/* Header */}
          <View className="flex-row justify-between items-center mt-2">
            <View>
              <Text className="text-zinc-900 dark:text-zinc-50 text-2xl font-bold">
                Cuadernos
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Tus documentos indexados y chats RAG
              </Text>
            </View>

            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              className="p-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              activeOpacity={0.7}
            >
              <Icon
                as={isDark ? Sun : Moon}
                className="text-zinc-900 dark:text-zinc-50 size-5"
              />
            </TouchableOpacity>
          </View>

          {/* Projects List */}
          <View className="gap-2">
            {projects.length === 0 ? (
              <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <CardHeader className="items-center py-8 gap-3">
                  <Icon as={BookOpen} className="text-zinc-400 size-12" />
                  <CardTitle className="text-zinc-900 dark:text-zinc-50 text-base font-semibold">
                    No hay cuadernos
                  </CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                    {isBackendOnline
                      ? "Crea tu primer cuaderno usando el botón + al fondo de la pantalla."
                      : "No hay conexión con el servidor RAG. Restablece la conexión para empezar."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isConnected={isBackendOnline}
                  onPress={() =>
                    router.push({
                      pathname: "/project/[id]",
                      params: { id: project.id, name: project.name },
                    })
                  }
                  onDelete={handleDeletePress}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Centered Bottom "+" Button */}
        {isBackendOnline && (
          <View className="absolute bottom-6 left-0 right-0 items-center z-50">
            <Button
              onPress={() => setIsNewProjectOpen(true)}
              className="h-14 w-14 rounded-full items-center justify-center bg-zinc-900 dark:bg-zinc-50 shadow-lg active:bg-zinc-800 dark:active:bg-zinc-200"
            >
              <Icon as={Plus} className="text-white dark:text-zinc-950 size-6" />
            </Button>
          </View>
        )}

        {/* Compound Dialog to Create Project */}
        <NewProjectDialog
          open={isNewProjectOpen}
          onOpenChange={setIsNewProjectOpen}
          onCreate={handleAddNewProject}
        />

        {/* Reusable Dialogs replacing Native Alerts */}
        <ConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Eliminar Proyecto"
          description={`¿Estás seguro de que quieres eliminar el proyecto "${projectToDelete?.name}"? Esto borrará todos sus documentos y chat asociados localmente y en el RAG.`}
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
    </SafeAreaView>
  );
}