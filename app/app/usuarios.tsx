import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
// "https://jsonplaceholder.typicode.com/users-error"

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error(
          `No se pudo cargar la lista (status ${respuesta.status})`,
        );
      }

      const json: User[] = await respuesta.json();
      setUsers(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // --- Estado: Loading ---
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#252525]">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-white mt-4 text-base">
          Obteniendo usuarios...
        </Text>
      </View>
    );
  }

  // --- Estado: Error ---
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#252525] px-6">
        <View className="bg-[#3a1f1f] border border-red-500/40 rounded-2xl p-6 w-full items-center">
          <Text className="text-4xl mb-2">⚠️</Text>
          <Text className="text-red-400 font-bold text-lg mb-1">
            Algo salió mal
          </Text>
          <Text className="text-red-200 text-center text-sm mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl px-6 py-3 w-full items-center"
            onPress={() => fetchUsers()}
          >
            <Text className="text-black font-semibold text-base">
              Reintentar Petición 🔄
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Estado: Éxito ---
  return (
    <View className="flex-1 bg-[#252525] px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-4">Usuarios</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#888"
        className="bg-[#333] text-white rounded-xl px-4 py-3 mb-4"
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUsers(true)}
            tintColor="#10b981"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-base text-center">
              No se encontraron usuarios con ese nombre
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-[#333] rounded-2xl p-4 mb-3 border border-white/5">
            <Text className="text-white font-bold text-base">{item.name}</Text>
            <Text className="text-emerald-400 text-sm mb-1">
              @{item.username}
            </Text>
            <Text className="text-gray-300 text-sm">{item.email}</Text>
            <Text className="text-gray-400 text-xs mt-1">
              {item.company.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
