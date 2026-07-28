import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function Clase4EjemploHome() {
  const [likes, setLikes] = useState(42);
  const [siguiendo, setSiguiendo] = useState(false);

  const handleNavegar = () => {
    // Navegación imperativa enviando múltiples parámetros por la URL
    router.push({
      pathname: '/detalles',
      params: {
        nombre: 'Pepe Desarrollador',
        rol: 'Full Stack Engineer',
        likes: likes.toString(), // Debemos convertirlo a string antes de enviar
        siguiendo: siguiendo.toString(), // Debemos convertirlo a string antes de enviar
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-12">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 4: Navegación
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Pantalla de Inicio (Home)
        </Text>
      </View>

      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-6">
        <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-2">
          👤 Perfil Resumido
        </Text>
        <Text className="text-white text-xl font-bold mb-1">Pepe Desarrollador</Text>
        <Text className="text-gray-400 mb-4">Likes en el Home: {likes}</Text>

        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={() => setLikes(likes + 1)}
            className="bg-indigo-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Dar Like 👍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSiguiendo(!siguiendo)}
            className={`px-4 py-2 rounded-lg border ${
              siguiendo ? 'border-gray-700 bg-transparent' : 'bg-emerald-500'
            }`}
          >
            <Text className={siguiendo ? 'text-gray-400' : 'text-black font-semibold'}>
              {siguiendo ? 'Siguiendo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón para navegar */}
        <TouchableOpacity
          onPress={handleNavegar}
          className="bg-emerald-500 w-full py-3 rounded-xl items-center justify-center"
        >
          <Text className="text-black font-bold text-base">
            Ver Detalles Completos ➔
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
