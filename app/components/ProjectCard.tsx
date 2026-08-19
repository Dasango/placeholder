import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Project } from "../store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Trash2, BookOpen } from "lucide-react-native";

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onDelete: (id: string, name: string) => void;
  isConnected: boolean;
}

export function ProjectCard({ project, onPress, onDelete, isConnected }: ProjectCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isConnected ? 0.7 : 1}
      className={`w-full mb-3 ${!isConnected ? "opacity-60" : ""}`}
    >
      <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative">
        <CardHeader className="pr-16 flex-row items-center gap-4 py-5">
          <View className="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-lg">
            <Icon as={BookOpen} className="text-zinc-600 dark:text-zinc-400 size-6" />
          </View>
          <View className="flex-1">
            <CardTitle className="text-zinc-900 dark:text-zinc-50 font-semibold text-base">
              {project.name}
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
              Created on {project.createdAt}
            </CardDescription>
          </View>
        </CardHeader>
        <TouchableOpacity
          onPress={() => onDelete(project.id, project.name)}
          disabled={!isConnected}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-950 ${
            !isConnected ? "opacity-30" : ""
          }`}
          activeOpacity={0.6}
        >
          <Icon as={Trash2} className="text-red-500 size-5" />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
}
