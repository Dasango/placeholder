import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Screen, useTheme } from "../components/Screen";
import { useQuery } from "@tanstack/react-query";
import { useAppStateFocus } from "./store/useAppStateFocus";
import Animated, {
  SlideInLeft,
  SlideInRight,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  company: Company;
}

const API_URL = "https://jsonplaceholder.typicode.com/users";

const fetchUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error("Error al traer los datos");
  }
  return respuesta.json();
};

export default function Usuarios() {
  const theme = useTheme();
  useAppStateFocus();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    User[]
  >({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
    staleTime: 1000 * 60 * 5,
  });

  const [search, setSearch] = useState("");

  const filteredUsers = data?.filter((u) =>
    u.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // --- Estado: Loading ---
  if (isLoading) {
    return (
      <Screen className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className={`mt-4 text-base ${theme.text}`}>
          Obteniendo usuarios...
        </Text>
      </Screen>
    );
  }

  // --- Estado: Error ---
  if (isError) {
    return (
      <Screen className="flex-1 items-center justify-center px-6">
        <View className="bg-[#3a1f1f] border border-red-500/40 rounded-2xl p-6 w-full items-center">
          <Text className="text-4xl mb-2">⚠️</Text>
          <Text className="text-red-400 font-bold text-lg mb-1">
            Algo salió mal
          </Text>
          <Text className="text-red-200 text-center text-sm mb-4">
            {error?.message}
          </Text>
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl px-6 py-3 w-full items-center"
            onPress={() => refetch()}
          >
            <Text className="text-black font-semibold text-base">
              Reintentar Petición 🔄
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // --- Estado: Éxito ---
  return (
    <Screen className="flex-1 px-4 pt-16">
      <Text className={`text-2xl font-bold mb-4 ${theme.text}`}>Usuarios</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre..."
        placeholderTextColor={theme.placeholder}
        className={`rounded-xl px-4 py-3 mb-4 ${theme.text}`}
        style={{ backgroundColor: theme.surfaceAlt, color: theme.color }}
      />

      <Animated.FlatList
        layout={LinearTransition.springify()}
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#10b981"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className={`text-base text-center ${theme.textMuted}`}>
              No se encontraron usuarios con ese nombre
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            className="rounded-2xl p-4 mb-3"
            entering={
              item.id % 2 !== 0
                ? SlideInLeft.duration(300)
                : SlideInRight.duration(300)
            }
            exiting={FadeOutDown.duration(200)}
          >
            <Text className={`font-bold text-base ${theme.text}`}>
              {item.name}
            </Text>
            <Text className="text-emerald-400 text-sm mb-1">
              @{item.username}
            </Text>
            <Text className={`text-sm ${theme.textSoft}`}>{item.email}</Text>
            <Text className={`text-xs mt-1 ${theme.textMuted}`}>
              {item.company.name}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}
