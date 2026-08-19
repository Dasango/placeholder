import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../../store";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { Text } from "@/components/ui/text";

export default function ProjectLayout() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const projects = useAppStore((state) => state.projects);

  const currentProject = projects.find((p) => p.id === id);
  const projectName = name || currentProject?.name || "Detalle del Proyecto";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      {/* Shared Header with Back Button */}
      <View className="flex-row items-center px-5 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950">
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="mr-4 p-1 rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">
          {projectName}
        </Text>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.foreground,
          tabBarInactiveTintColor: colors.mutedForeground,
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
