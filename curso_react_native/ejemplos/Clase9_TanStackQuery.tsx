import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';

// --- CONFIGURACIÓN LOCAL DE REACT QUERY ---
// Normalmente esto se configura globalmente en app/_layout.tsx,
// pero lo creamos aquí para que el ejemplo sea completamente autocontenido.
const queryClient = new QueryClient();

interface PostData {
  id: number;
  title: string;
  body: string;
}

// --- COMPONENTE PRINCIPAL DE LA CLASE ---
function Clase9_Ejemplo() {
  const queryClient = useQueryClient();
  const [postIdFilter, setPostIdFilter] = useState<number | null>(null);

  // --- useQuery: Consume la API de JSONPlaceholder ---
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<PostData[]>({
    queryKey: ['posts', postIdFilter],
    queryFn: async () => {
      console.log(`📡 Fetching posts from API... (Filter: ${postIdFilter})`);
      
      // Simulamos un leve delay de red de 1000ms
      await new Promise(resolve => setTimeout(resolve, 1000));

      const url = postIdFilter 
        ? `https://jsonplaceholder.typicode.com/posts?userId=${postIdFilter}`
        : 'https://jsonplaceholder.typicode.com/posts';

      const respuesta = await fetch(url);
      if (!respuesta.ok) {
        throw new Error('Error al conectar con el servidor');
      }
      return respuesta.json();
    },
    // Configuración de caché: considera los datos "frescos" por 10 segundos.
    // Durante este tiempo, re-renderizar o volver a entrar a la pantalla NO disparará una nueva petición.
    staleTime: 1000 * 10, 
  });

  // Función para invalidar la caché manualmente y forzar una recarga en segundo plano
  const invalidarCache = () => {
    console.log("🧹 Invalidando la caché de ['posts']...");
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <View className="flex-1 bg-[#0d1117] p-6 pt-12">
      {/* Cabecera */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 9: TanStack Query 📡
        </Text>
        <Text className="text-gray-400 text-center mt-1">
          Manejo de estado asíncrono y caché inteligente
        </Text>
      </View>

      {/* Controles del Query */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 mb-4">
        <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-2">
          🎛️ Controles del Store y Caché
        </Text>
        <Text className="text-gray-300 text-xs mb-3">
          Prueba filtrar por autor. React Query recordará la caché para cada combinación de claves en `queryKey`.
        </Text>

        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity 
            onPress={() => setPostIdFilter(null)}
            className={`px-3 py-2 rounded-lg flex-1 ${postIdFilter === null ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            <Text className="text-white text-center text-xs font-bold">Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPostIdFilter(1)}
            className={`px-3 py-2 rounded-lg flex-1 ${postIdFilter === 1 ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            <Text className="text-white text-center text-xs font-bold">Autor 1</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPostIdFilter(2)}
            className={`px-3 py-2 rounded-lg flex-1 ${postIdFilter === 2 ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            <Text className="text-white text-center text-xs font-bold">Autor 2</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={invalidarCache}
          className="bg-gray-700 py-2.5 rounded-lg border border-gray-600"
        >
          <Text className="text-white text-center text-xs font-semibold">
            🧹 Invalidar Caché (`invalidateQueries`)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listado o Estados */}
      <View className="flex-1 bg-[#161b22] border border-gray-800 rounded-2xl p-4 overflow-hidden">
        {isLoading ? (
          // 1. ESTADO DE CARGA INICIAL
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-400 mt-4 text-sm">Cargando publicaciones por primera vez...</Text>
          </View>
        ) : isError ? (
          // 2. ESTADO DE ERROR
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500 font-bold text-lg mb-2">⚠️ Error</Text>
            <Text className="text-gray-400 text-center text-xs mb-4">{(error as Error)?.message}</Text>
            <TouchableOpacity onPress={() => refetch()} className="bg-emerald-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-bold text-xs">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 3. RENDERIZADO DE LA LISTA
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="border-b border-gray-800 py-3">
                <Text className="text-emerald-400 font-semibold text-xs mb-1">ID: {item.id}</Text>
                <Text className="text-white font-bold text-sm mb-1">{item.title}</Text>
                <Text className="text-gray-400 text-xs leading-relaxed" numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
            )}
            // Pull-to-refresh
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#10b981"
                colors={["#10b981"]}
              />
            }
            ListEmptyComponent={
              <Text className="text-gray-500 text-center py-8">No hay publicaciones.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

// Wrapper para inyectar el QueryClientProvider
export default function Clase9_TanStackQuery() {
  return (
    <QueryClientProvider client={queryClient}>
      <Clase9_Ejemplo />
    </QueryClientProvider>
  );
}
