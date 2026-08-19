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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Shared Header with Back Button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{ marginRight: 16, padding: 4 }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>
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
