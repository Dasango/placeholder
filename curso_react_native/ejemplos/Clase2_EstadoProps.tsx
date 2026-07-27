import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';

// 1. Definimos un Componente Reutilizable (Hijo)
// Este componente recibe propiedades (props) para mostrar una estadística.
// TypeScript nos ayuda a definir el tipo de las props que esperamos.
interface StatItemProps {
  label: string;
  valor: number | string;
}

function StatItem({ label, valor }: StatItemProps) {
  return (
    <View className="items-center px-4">
      {/* Mostramos el valor recibido por props */}
      <Text className="text-xl font-bold text-white">{valor}</Text>
      {/* Mostramos la etiqueta recibida por props */}
      <Text className="text-xs text-gray-400 uppercase tracking-wider mt-1">{label}</Text>
    </View>
  );
}

export default function Clase2EstadoProps() {
  // 2. Definimos los Estados (useState)
  // Estado para saber si estamos siguiendo al usuario (boolean)
  const [siguiendo, setSiguiendo] = useState(false);
  
  // Estado para el contador de likes (number)
  const [likes, setLikes] = useState(128);

  // Función para manejar el botón de seguir
  const handleFollowPress = () => {
    // Alterneamos el valor booleano
    setSiguiendo(!siguiendo);
  };

  // Función para incrementar los likes
  const handleLikePress = () => {
    // Incrementamos el contador usando la función actualizadora
    setLikes(prevLikes => prevLikes + 1);
  };

  return (
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-12">
      
      {/* Cabecera */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 2: Estado y Props
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Interactividad con useState y componentes con props
        </Text>
      </View>

      {/* Tarjeta de Perfil de Ejemplo */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden mb-12">
        {/* Banner superior decorativo */}
        <View className="h-24 bg-emerald-500" />

        {/* Contenido de la Tarjeta */}
        <View className="px-6 pb-6 items-center">
          
          {/* Avatar con margen negativo para sobresalir sobre el banner */}
          <Image 
            source={{ uri: 'https://avatar.iran.liara.run/public/girl' }} 
            className="w-20 h-20 rounded-full border-4 border-[#161b22] -mt-10 mb-3 bg-gray-800"
          />

          {/* Información del Usuario */}
          <Text className="text-xl font-bold text-white">María Dev</Text>
          <Text className="text-sm text-gray-400 mb-4">React Native Developer</Text>

          {/* 3. Renderizamos los Componentes Hijos (StatItem) pasando las Props */}
          <View className="flex-row justify-center border-t border-b border-gray-800 py-4 w-full mb-6">
            <StatItem label="Likes" valor={likes} />
            <View className="w-[1px] bg-gray-800 h-full" />
            <StatItem label="Proyectos" valor={8} />
            <View className="w-[1px] bg-gray-800 h-full" />
            <StatItem label="Seguidores" valor={siguiendo ? "1.5K" : "1.4K"} />
          </View>

          {/* Botones de Acción */}
          <View className="flex-row gap-3 w-full">
            
            {/* Botón de Seguir (Estilo dinámico basado en el estado) */}
            <TouchableOpacity 
              onPress={handleFollowPress}
              className={`flex-1 py-3 rounded-xl items-center justify-center border ${
                siguiendo 
                  ? 'bg-transparent border-gray-700' 
                  : 'bg-emerald-500 border-emerald-500'
              }`}
            >
              <Text className={`font-semibold ${siguiendo ? 'text-gray-300' : 'text-black'}`}>
                {siguiendo ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>

            {/* Botón de Like (Corazón) */}
            <TouchableOpacity 
              onPress={handleLikePress}
              className="px-4 bg-[#21262d] border border-gray-700 rounded-xl items-center justify-center active:scale-95"
            >
              <Text className="text-lg">❤️</Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>

    </ScrollView>
  );
}
