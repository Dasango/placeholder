import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useProjects } from "../hooks/useProjects";

import { ConnectionBanner } from "../components/ConnectionBanner";
import { NewProjectDialog } from "../components/NewProjectDialog";
import { ProjectCard } from "../components/ProjectCard";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { AlertDialog } from "../components/AlertDialog";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Plus, Sun, Moon, BookOpen } from "lucide-react-native";

export default function Page() {
  const router = useRouter();

  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
          <ConnectionBanner />

          <View className="flex-row justify-between items-center mt-2">
            <View>
              <Text className="text-zinc-900 dark:text-zinc-50 text-2xl font-bold">
                Notebooks
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Your indexed documents and RAG chats
              </Text>
            </View>

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

          <View className="gap-2">
            {projects.length === 0 ? (
              <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <CardHeader className="items-center py-8 gap-3">
                  <Icon as={BookOpen} className="text-zinc-400 size-12" />
                  <CardTitle className="text-zinc-900 dark:text-zinc-50 text-base font-semibold">
                    No notebooks yet
                  </CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                    {isBackendOnline
                      ? "Create your first notebook using the + button at the bottom of the screen."
                      : "No connection to the RAG server. Restore the connection to get started."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isConnected={isBackendOnline}
                  onPress={() => {
                    if (!isBackendOnline) {
                      triggerAlert(
                        "No Connection",
                        "The RAG server is offline. You can't access your notebooks until the connection is restored."
                      );
                      return;
                    }
                    router.push({
                      pathname: "/project/[id]",
                      params: { id: project.id, name: project.name },
                    });
                  }}
                  onDelete={handleDeletePress}
                />
              ))
            )}
          </View>
        </ScrollView>

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

        <NewProjectDialog
          open={isNewProjectOpen}
          onOpenChange={setIsNewProjectOpen}
          onCreate={handleAddNewProject}
        />

        <ConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Delete Project"
          description={`Are you sure you want to delete the project "${projectToDelete?.name}"? This will delete all of its associated documents and chats locally and in the RAG.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
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