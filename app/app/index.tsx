import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { UIGallery } from "@/components/ui-gallery";

export default function Page() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4">
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
      </View>
      <UIGallery />
    </SafeAreaView>
  );
}