import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';

export default function Clase4EjemploDetalles() {
  // 1. Extraemos los parámetros de la URL
  const params = useLocalSearchParams();
  const { nombre, rol, likes, siguiendo } = params;

  // 2. IMPORTANTE: Resolver el Gotcha de Tipado
  // Convertimos las strings recibidas por URL a sus tipos reales
  const likesNumber = likes ? parseInt(likes as string, 10) : 0;
  const esSiguiendo = siguiendo === 'true'; // Si no comparamos explicitamente con 'true', siempre será true

  return (
    <>
      {/* 3. Personalización dinámica del Header de navegación */}
      <Stack.Screen
        options={{
          title: `Detalles de ${nombre || 'Usuario'}`,
          headerStyle: { backgroundColor: '#161b22' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-6">
        <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-2">
            👤 Vista Detallada de Usuario
          </Text>

          <View className="mb-4">
            <Text className="text-gray-400 text-xs uppercase">Nombre</Text>
            <Text className="text-white text-xl font-bold">{nombre || 'Desconocido'}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-xs uppercase">Rol</Text>
            <Text className="text-gray-300 text-base">{rol || 'Sin Rol'}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-xs uppercase">Likes Recibidos</Text>
            <Text className="text-white text-base font-semibold">
              {likesNumber} 👍 (parsed from string)
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-400 text-xs uppercase">Estado de Seguimiento</Text>
            <Text
              className={`text-base font-semibold ${
                esSiguiendo ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {esSiguiendo ? '✓ Lo estás siguiendo' : '✗ No lo estás siguiendo'}
            </Text>
          </View>

          {/* Botón para volver atrás */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-transparent border border-emerald-500 w-full py-3 rounded-xl items-center justify-center mb-3"
          >
            <Text className="text-emerald-500 font-bold text-base">
              🎛️ Volver al Listado
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
