import React from 'react';
// 1. Importamos los componentes básicos desde 'react-native'
import { 
  View,             // Contenedor principal (como un div en la web)
  Text,             // Para mostrar textos (cualquier texto debe ir aquí dentro)
  TextInput,        // Campo de entrada de texto (como un input text)
  TouchableOpacity, // Un botón personalizable que se vuelve translúcido al tocarlo
  ScrollView,       // Contenedor que permite hacer scroll hacia abajo si el contenido es largo
  Alert             // Api nativa para mostrar una alerta/pop-up en pantalla
} from 'react-native';

export default function Clase1Basicos() {
  
  // Función que se ejecuta cuando el usuario presiona el botón
  const handlePress = () => {
    // Alert.alert recibe ("Título de la alerta", "Mensaje de la alerta")
    Alert.alert("¡Botón Presionado!", "Has presionado el botón de ejemplo.");
  };

  return (
    // ScrollView envuelve toda la pantalla para que sea deslizable.
    // Usamos clases de Tailwind: flex-1 (todo el ancho/alto), bg-[#0d1117] (fondo oscuro), p-6 (padding), pt-12 (padding superior)
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-12">
      
      {/* 2. Sección del Título (Header) */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 1: Componentes y Estilos
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Aprende el uso de View, Text, TextInput, TouchableOpacity y Tailwind CSS
        </Text>
      </View>

      {/* 3. Contenedor tipo Tarjeta (View con fondo diferente) */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 mb-6">
        
        {/* Título de la tarjeta */}
        <Text className="text-xl font-semibold text-emerald-400 mb-2">
          Tarjeta Informativa
        </Text>
        
        {/* Texto descriptivo */}
        <Text className="text-gray-300 leading-relaxed mb-4">
          Este bloque es un contenedor (View) que actúa como tarjeta. Tiene bordes redondeados (rounded-2xl) y un color de fondo grisáceo oscuro (bg-[#161b22]).
        </Text>

        {/* 4. Campo de entrada de texto (TextInput) */}
        <Text className="text-sm font-medium text-gray-400 mb-2">Escribe algo aquí:</Text>
        <TextInput 
          placeholder="Escribe tu nota aquí..."
          placeholderTextColor="#6e7681" // Color del texto del placeholder
          className="bg-[#0d1117] border border-gray-800 text-white rounded-lg px-4 py-3 mb-4"
        />

        {/* 5. Botón interactivo (TouchableOpacity) */}
        <TouchableOpacity 
          onPress={handlePress} // Evento cuando se presiona
          className="bg-emerald-500 rounded-lg py-3 items-center justify-center"
        >
          {/* El texto dentro del botón */}
          <Text className="text-black font-semibold text-base">
            Presióname (TouchableOpacity)
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
