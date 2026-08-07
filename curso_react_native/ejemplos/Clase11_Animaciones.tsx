import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withRepeat,
  withSequence
} from 'react-native-reanimated';

export default function Clase11_Ejemplo() {
  // 1. Definimos los Shared Values para las animaciones
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  // 2. Definimos los estilos animados usando useAnimatedStyle
  const animatedBoxStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  // 3. Funciones de activación de animaciones
  const handlePressIn = () => {
    // Escala del botón usando física de resorte (Spring)
    scale.value = withSpring(0.9, { damping: 10, stiffness: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const triggerPulseEffect = () => {
    // Creamos un pulso rápido de opacidad y escala usando una secuencia
    opacity.value = withSequence(
      withTiming(0.4, { duration: 150 }),
      withTiming(1.0, { duration: 250 })
    );

    // Animamos la rotación 360 grados con Spring
    rotation.value = withSpring(rotation.value + 360);
  };

  const startInfinitePulse = () => {
    // Hacemos que la escala oscile infinitamente
    scale.value = withRepeat(
      withTiming(1.15, { duration: 500 }),
      -1, // -1 indica repetición infinita
      true // true invierte la animación en cada ciclo para que sea suave (reverse)
    );
  };

  const resetAnimations = () => {
    // Devolvemos todos los valores a su estado inicial
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  return (
    <View className="flex-1 bg-[#0d1117] items-center justify-center p-6">
      <Text className="text-2xl font-bold text-white mb-2 text-center">
        Clase 11: Reanimated 💫
      </Text>
      <Text className="text-gray-400 text-sm text-center mb-8">
        Animaciones ejecutadas a 60 FPS directo en el UI Thread
      </Text>

      {/* Contenedor Animado */}
      <Animated.View 
        style={[animatedBoxStyle]}
        className="w-36 h-36 bg-emerald-500 rounded-3xl items-center justify-center shadow-lg shadow-emerald-500/50 mb-10"
      >
        <Text className="text-neutral-900 font-extrabold text-lg text-center select-none">
          Worklet UI
        </Text>
      </Animated.View>

      {/* Botones de Control */}
      <View className="w-full gap-3 px-4">
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={triggerPulseEffect}
          activeOpacity={1}
          className="bg-emerald-600 py-3 rounded-xl border border-emerald-400"
        >
          <Text className="text-white text-center font-bold text-sm">
            Presionar para Escala + Giro 🔄
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={startInfinitePulse}
          className="bg-gray-800 py-3 rounded-xl border border-gray-700"
        >
          <Text className="text-white text-center font-bold text-sm">
            Iniciar Pulso Infinito 🔁
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetAnimations}
          className="bg-red-950 py-3 rounded-xl border border-red-800"
        >
          <Text className="text-red-400 text-center font-bold text-sm">
            Restablecer Valores 🧹
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
