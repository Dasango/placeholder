import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  PROJECTS: "@rag_projects",
};

export default function Page() {
  const router = useRouter();

  // Configuration (auto-detected)
  const [n8nUrl, setN8nUrl] = useState("http://localhost:5678");

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Auto-detect backend URL using expo hostUri
  useEffect(() => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      setN8nUrl(`http://${ip}:5678`);
    } else {
      const defaultUrl = Platform.select({
        android: "http://10.0.2.2:5678",
        default: "http://localhost:5678",
      }) || "http://localhost:5678";
      setN8nUrl(defaultUrl);
    }
  }, []);

  // Load projects on startup
  useEffect(() => {
    async function loadProjects() {
      try {
        const storedProjects = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          // Add a default project if none exist
          const defaultProject: Project = {
            id: "default_project",
            name: "Proyecto Ejemplo",
            createdAt: new Date().toLocaleDateString(),
          };
          setProjects([defaultProject]);
          await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([defaultProject]));
        }
      } catch (e) {
        console.error("Error loading projects", e);
      }
    }
    loadProjects();
  }, []);

  // Save projects helper
  const saveProjects = async (updatedProjects: Project[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (e) {
      console.error("Error saving projects", e);
    }
  };

  // Create Project
  const handleCreateProject = async () => {
    const nameTrim = newProjectName.trim();
    if (!nameTrim) return;

    const newProj: Project = {
      id: "project_" + Math.random().toString(36).substr(2, 9),
      name: nameTrim,
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [...projects, newProj];
    await saveProjects(updated);
    
    setNewProjectName("");
    setIsCreateOpen(false);
    
    // Auto-navigate to the new project
    router.push({
      pathname: `/project/${newProj.id}`,
      params: { id: newProj.id, name: newProj.name },
    });
  };

  // Delete Project
  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      "Confirmación",
      `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esto borrará localmente su historial de chat y documentos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const updated = projects.filter((p) => p.id !== projectId);
            await saveProjects(updated);

            // Clean up project-specific storage
            await AsyncStorage.removeItem(`@rag_project_docs_${projectId}`);
            await AsyncStorage.removeItem(`@rag_project_chat_${projectId}`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-slate-800/60 border-b border-slate-700/50">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Text className="text-white text-lg font-bold">Mis Notebooks RAG</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsCreateOpen(true)}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 active:bg-indigo-700"
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text className="text-white text-sm font-semibold">Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-slate-400 text-sm mb-6 leading-relaxed">
          Crea proyectos temáticos similares a Google Notebook. Dentro de cada proyecto podrás cargar documentos independientes e iniciar conversaciones contextualizadas con la IA.
        </Text>

        {/* Projects List */}
        <View className="mb-8">
          <Text className="text-white font-bold text-base mb-4">Proyectos Disponibles</Text>

          {projects.length === 0 ? (
            <View className="py-12 justify-center items-center bg-slate-800/20 rounded-2xl border border-slate-800">
              <Feather name="book-open" size={40} color="#475569" />
              <Text className="text-slate-500 text-sm mt-3">No hay proyectos creados aún</Text>
              <TouchableOpacity
                onPress={() => setIsCreateOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 active:bg-slate-700"
              >
                <Text className="text-white text-xs font-semibold">Crear un proyecto ahora</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((proj) => (
              <TouchableOpacity
                key={proj.id}
                onPress={() =>
                  router.push({
                    pathname: `/project/${proj.id}`,
                    params: { id: proj.id, name: proj.name },
                  })
                }
                className="flex-row items-center justify-between p-4 bg-slate-800/40 rounded-2xl mb-3 border border-slate-800 active:bg-slate-800"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="p-3 bg-indigo-900/30 rounded-xl mr-3">
                    <Feather name="folder" size={20} color="#818cf8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-100 text-sm font-semibold" numberOfLines={1}>
                      {proj.name}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      Creado: {proj.createdAt}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDeleteProject(proj.id, proj.name)}
                  className="p-2.5 rounded-xl bg-slate-800/60 active:bg-red-950/40 border border-slate-700/30"
                >
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Network Status Badge (No Config Modal anymore) */}
      <View className="px-6 py-3 bg-slate-950 border-t border-slate-850 flex-row items-center justify-center gap-1.5">
        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <Text className="text-slate-500 text-[11px] font-medium">
          Conectado localmente a: {n8nUrl}
        </Text>
      </View>

      {/* Create Project Modal */}
      <Modal
        visible={isCreateOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCreateOpen(false)}
      >
        <View className="flex-1 bg-black/75 justify-center items-center px-6">
          <View className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Crear Nuevo Proyecto</Text>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 text-xs mb-4">
              Asigna un nombre descriptivo a tu notebook. Podrás cambiar o agregar documentos más tarde.
            </Text>

            <TextInput
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Nombre del notebook (ej. Tesis, Finanzas)..."
              placeholderTextColor="#475569"
              className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm mb-6"
              autoFocus
              onSubmitEditing={handleCreateProject}
            />

            <TouchableOpacity
              onPress={handleCreateProject}
              className="bg-indigo-600 py-3 rounded-xl justify-center items-center active:bg-indigo-700"
            >
              <Text className="text-white font-semibold">Crear Notebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
