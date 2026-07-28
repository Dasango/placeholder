import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

// Interfaz para representar la estructura del Post devuelto por la API
interface PostData {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function Clase5APIs() {
  // --- Estados ---
  const [postId, setPostId] = useState<number>(1);
  const [post, setPost] = useState<PostData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- useEffect: Ejecuta la petición de red cada vez que 'postId' cambia ---
  useEffect(() => {
    let activo = true; // Bandera para evitar Memory Leaks si el componente se desmonta rápido

    const obtenerPost = async () => {
      setCargando(true);
      setError(null);
      console.log(`📡 Solicitando Post #${postId} a la API...`);

      try {
        // Simulamos un leve retraso de red de 800ms para apreciar el estado de carga (loading)
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Forzamos un error si el usuario elige el ID -1 para probar el estado de error
        const url = postId === -1 
          ? 'https://jsonplaceholder.typicode.com/posts-ruta-invalida/9999'
          : `https://jsonplaceholder.typicode.com/posts/${postId}`;

        const respuesta = await fetch(url);

        // --- GOTCHA 1: Validar si la respuesta es OK ---
        // fetch no lanza excepciones en errores HTTP (404, 500). Debemos arrojarlo manualmente.
        if (!respuesta.ok) {
          throw new Error(`Error en el servidor: Código ${respuesta.status}`);
        }

        const json: PostData = await respuesta.json();

        // Solo actualizamos el estado si el componente sigue montado
        if (activo) {
          setPost(json);
        }
      } catch (err: any) {
        console.error("❌ Error en la petición:", err.message);
        if (activo) {
          setError(err.message || 'Ocurrió un error inesperado');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    obtenerPost();

    // Función de limpieza (cleanup) para cancelar la actualización del estado si el componente se desmonta
    return () => {
      activo = false;
    };
  }, [postId]); // Se vuelve a ejecutar CADA VEZ que cambia el 'postId'

  return (
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-12">
      {/* Cabecera */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 5: Consumir APIs 🌐
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Gestión de estados asíncronos y ciclo de vida de peticiones HTTP
        </Text>
      </View>

      {/* Controladores de ID */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-6">
        <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-3">
          🎛️ Control de Peticiones
        </Text>
        <Text className="text-gray-300 text-sm mb-4">
          Usa los botones para cambiar el ID del post. Al cambiar el estado de `postId`, el `useEffect` detecta la dependencia y realiza una nueva petición de red.
        </Text>

        <View className="flex-row justify-between mb-3">
          <TouchableOpacity 
            onPress={() => setPostId(prev => Math.max(1, prev - 1))}
            disabled={postId <= 1}
            className={`px-4 py-2.5 rounded-lg flex-1 mr-2 ${postId <= 1 ? 'bg-gray-800 opacity-50' : 'bg-gray-700'}`}
          >
            <Text className="text-white text-center font-bold">◀ Anterior</Text>
          </TouchableOpacity>

          <View className="justify-center px-4 bg-gray-900 border border-gray-800 rounded-lg mr-2">
            <Text className="text-emerald-400 font-mono font-bold">Post ID: {postId}</Text>
          </View>

          <TouchableOpacity 
            onPress={() => setPostId(prev => prev + 1)}
            className="px-4 py-2.5 bg-gray-700 rounded-lg flex-1"
          >
            <Text className="text-white text-center font-bold">Siguiente ▶</Text>
          </TouchableOpacity>
        </View>

        {/* Botón para forzar un error HTTP */}
        <TouchableOpacity 
          onPress={() => setPostId(-1)}
          className="bg-red-950 border border-red-800 py-2.5 rounded-lg"
        >
          <Text className="text-red-400 text-center font-semibold">🚨 Simular Error HTTP (URL incorrecta)</Text>
        </TouchableOpacity>
      </View>

      {/* Renderizado de Estados de la Petición */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 min-h-[220px] justify-center">
        {cargando ? (
          // 1. ESTADO DE CARGA
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-400 mt-4 text-sm font-medium">Cargando publicación de la API...</Text>
          </View>
        ) : error ? (
          // 2. ESTADO DE ERROR
          <View className="items-center py-4">
            <Text className="text-red-500 font-bold text-lg mb-2">⚠️ Error de Petición</Text>
            <Text className="text-gray-400 text-center text-sm mb-4 px-2">
              {error}
            </Text>
            <TouchableOpacity 
              onPress={() => setPostId(1)}
              className="bg-red-500 px-6 py-2.5 rounded-lg"
            >
              <Text className="text-white font-bold">Volver al Post #1 🔄</Text>
            </TouchableOpacity>
          </View>
        ) : post ? (
          // 3. ESTADO DE ÉXITO (Muestra los datos)
          <View>
            <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-2">
              📄 Post Recibido Exitosamente
            </Text>
            <Text className="text-white text-xl font-bold mb-3">
              {post.title}
            </Text>
            <Text className="text-gray-400 text-sm leading-relaxed">
              {post.body}
            </Text>
            <View className="border-t border-gray-800 mt-4 pt-3 flex-row justify-between">
              <Text className="text-gray-500 text-xs font-mono">Autor ID: {post.userId}</Text>
              <Text className="text-gray-500 text-xs font-mono">ID: {post.id}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Espaciador inferior */}
      <View className="h-12" />
    </ScrollView>
  );
}
