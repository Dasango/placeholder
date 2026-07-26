import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image
} from 'react-native';

export default function Clase1Basicos() {
  
  // Función del ejemplo
  const handlePressEjemplo = () => {
    Alert.alert("¡Botón Presionado!", "Has presionado el botón del ejemplo.");
  };

  const handlePressEjercicio = () => {
    Alert.alert("Mensaje enviado", "Tu mensaje ha sido enviado.");
  };


  return (
    <ScrollView className="flex-1 bg-[#252525] p-6 pt-12">
      
      {/* ========================================== */}
      {/* 📖 EJEMPLO DE LA CLASE                    */}
      {/* ========================================== */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 1: Componentes y Estilos
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Mira este ejemplo como referencia para tu ejercicio
        </Text>
      </View>

      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 mb-6">
        <Text className="text-xl font-semibold text-emerald-400 mb-2">
          Tarjeta Informativa (Ejemplo)
        </Text>
        
        <Text className="text-gray-300 leading-relaxed mb-4">
          Este bloque es un contenedor (View) que actúa como tarjeta. Tiene bordes redondeados y fondo grisáceo.
        </Text>

        <Text className="text-sm font-medium text-gray-400 mb-2">Escribe algo aquí:</Text>
        <TextInput 
          placeholder="Escribe tu nota aquí..."
          placeholderTextColor="#6e7681"
          className="bg-[#0d1117] border border-gray-800 text-white rounded-lg px-4 py-3 mb-4"
        />

        <TouchableOpacity 
          onPress={handlePressEjemplo}
          className="bg-emerald-500 rounded-lg py-3 items-center justify-center"
        >
          <Text className="text-black font-semibold text-base">
            Presióname (TouchableOpacity)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================= */}
      {/* 📍 ESPACIO PARA TU EJERCICIO (TARJETA DE PERFIL)       */}
      {/* ======================================================= */}
      <View className="mt-6 mb-12 border-t-2 border-dashed border-gray-700 pt-8">
        <Text className="text-gray-400 text-center text-sm font-semibold tracking-wider uppercase mb-6">
          ▼ TU EJERCICIO DEBE IR DEBAJO DE ESTA LÍNEA ▼
        </Text>
        
        {/* 📍 INICIA TU CÓDIGO AQUÍ (Escribe tu Tarjeta de Perfil de Usuario aquí) */}
        
        <View className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
          <View className="h-8 bg-emerald-500 rounded-t-xl rounded-b-none"/>
            <View className="p-5 mb-6">
              <View className="flex-row items-center mb-1 -mt-10">
                <Image source={{ uri: 'https://i.pravatar.cc/100' }} className="w-12 h-12 rounded-full mr-4" />
              </View>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-lg font-semibold text-white">Pepe</Text>
                <Text className="text-gray-400 text-sm">-</Text>
                <Text className="text-gray-400 text-sm">Desarrollador de software</Text>
              </View>
              <Text className="text-gray-300 leading-relaxed">
                Me gusta gemini
              </Text>
              <TextInput 
              placeholder="Escribe tu mensaje aquí..."
              placeholderTextColor="#6e7681"
              className="bg-[#0d1117] border border-gray-800 text-white rounded-lg px-4 py-3 mt-4"
              />
              <TouchableOpacity className="bg-emerald-500 rounded-lg py-3 items-center justify-center mt-4" onPress={handlePressEjercicio}>
                <Text className="text-black font-semibold text-base">
                  Enviar Mensaje
                </Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}