import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../../store";

export default function ProjectLayout() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const projects = useAppStore((state) => state.projects);

  const currentProject = projects.find((p) => p.id === id);
  const projectName = name || currentProject?.name || "Detalle del Proyecto";

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarVisibilityAnimationConfig: {
            show: { animation: "timing", config: { duration: 0 } },
          },
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
