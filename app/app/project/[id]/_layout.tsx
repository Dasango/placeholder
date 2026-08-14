import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export default function ProjectLayout() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [projectName, setProjectName] = useState(name || "Detalle del Proyecto");

  useEffect(() => {
    if (!name && id) {
      AsyncStorage.getItem("@rag_projects").then((stored) => {
        if (stored) {
          try {
            const projs: Project[] = JSON.parse(stored);
            const current = projs.find((p) => p.id === id);
            if (current) {
              setProjectName(current.name);
            }
          } catch (e) {
            console.error("Error parsing projects in layout", e);
          }
        }
      });
    } else if (name) {
      setProjectName(name);
    }
  }, [id, name]);

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      {/* Header Bar */}
      <View className="px-6 py-4 flex-row items-center bg-slate-800/60 border-b border-slate-700/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 mr-3 rounded-lg bg-slate-700/30 active:bg-slate-700/60"
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {projectName}
          </Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            NotebookLM RAG Local
          </Text>
        </View>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1e293b", // slate-800
            borderTopColor: "rgba(51, 65, 85, 0.5)", // slate-700/50
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
            paddingTop: 8,
            height: Platform.OS === "ios" ? 88 : 64,
          },
          tabBarActiveTintColor: "#818cf8", // indigo-400
          tabBarInactiveTintColor: "#64748b", // slate-500
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Documentos",
            tabBarIcon: ({ color }) => (
              <Feather name="file-text" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbubbles-outline" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
