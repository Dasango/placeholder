import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type ButtonStyleType = "dark" | "light" | "line";

interface ButtonProps {
  titulo: string;
  style?: ButtonStyleType;
  onPress: () => void;
}

const styles: Record<ButtonStyleType, { container: string; text: string }> = {
  dark: {
    container: "bg-[#252525] p-3 rounded-lg border-2 border-transparent",
    text: "text-white font-bold",
  },
  light: {
    container: "bg-emerald-500 p-3 rounded-lg border-2 border-transparent",
    text: "text-black font-bold",
  },
  line: {
    container: "border-2 border-emerald-500 p-3 rounded-lg bg-transparent",
    text: "text-emerald-500 font-bold",
  },
};

function Button({ titulo, style = "dark", onPress }: ButtonProps) {
  const current = styles[style];

  return (
    <TouchableOpacity className={current.container} onPress={onPress}>
      <Text className={current.text}>{titulo}</Text>
    </TouchableOpacity>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-white font-bold text-lg">{value}</Text>
      <Text className="text-gray-400 text-sm">{label}</Text>
    </View>
  );
}

export interface DetalleRouteParams {
  nombre: string;
  rol: string;
  tiempoActivo: string;
  siguiendo: string;
  likes: string;
  [key: string]: string | string[] | undefined;
}

export interface DetalleModel {
  nombre: string;
  rol: string;
  tiempoActivo: number;
  siguiendo: boolean;
  likes: number;
}

export default function Clase1Basicos() {
  const handlePressEjercicio = () => {
    router.push("/chat");
  };

  const [tiempoActivo, setTiempoActivo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActivo((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [siguiendo, setSiguiendo] = useState(false);
  const [love, setLove] = useState(false);
  const [loveCount, setLoveCount] = useState(0);

  const handleLovePress = () => {
    setLove((prevLove) => {
      const nextLove = !prevLove;
      setLoveCount((prevCount) => (nextLove ? prevCount + 1 : prevCount - 1));
      return nextLove;
    });
  };

  const handleVerPress = (data: DetalleModel) => {
    router.push({
      pathname: "/detalles",
      params: {
        nombre: data.nombre,
        rol: data.rol,
        tiempoActivo: data.tiempoActivo.toString(),
        siguiendo: data.siguiendo.toString(),
        likes: data.likes.toString(),
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-[#252525] p-6 pt-12">
      <View className="mb-2">
        <Text className="text-3xl font-bold text-white text-center">
          Curso de React Native
        </Text>
      </View>

      <View className="mt-6 mb-12 border-t-2 border-dashed border-gray-700 pt-8">
        {/* 📍 INICIA TU CÓDIGO AQUÍ (Escribe tu Tarjeta de Perfil de Usuario aquí) */}
        <View className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
          <View className="h-8 bg-emerald-500 rounded-t-xl rounded-b-none" />
          <View className="p-5 mb-6">
            <View className="flex-row items-center mb-1 -mt-10">
              <Image
                source={{ uri: "https://i.pravatar.cc/100" }}
                className="w-12 h-12 rounded-full mr-4"
              />
            </View>
            <View className="flex-row items-baseline gap-2 my-2">
              <Text className="text-lg font-semibold text-white">Pepe</Text>
              <Text className="text-gray-400 text-sm">-</Text>
              <Text className="text-gray-400 text-sm">
                Desarrollador de software
              </Text>
            </View>
            <View className="my-2">
              <Text
                className="text-gray-400 text-sm"
                onPress={() => setTiempoActivo(0)}
              >
                Activo hace: {tiempoActivo} segundos
              </Text>
              <Text className="text-gray-300 leading-relaxed my-2">
                Me gusta gemini
              </Text>
            </View>
            <View className="flex-row items-center gap-5 my-2">
              <Button
                onPress={() => setSiguiendo(!siguiendo)}
                style={siguiendo ? "dark" : "light"}
                titulo={siguiendo ? "Siguiendo" : "Seguir"}
              />
              <Button
                onPress={() =>
                  handleVerPress({
                    nombre: "Pepe",
                    rol: "Desarrollador de software",
                    tiempoActivo: tiempoActivo,
                    siguiendo: siguiendo,
                    likes: loveCount,
                  })
                }
                style="line"
                titulo="Ver"
              />
              <Ionicons
                onPress={() => handleLovePress()}
                name={love ? "heart" : "heart-outline"}
                size={24}
                color="white"
              />
            </View>
            <View className="flex-row items-center w-full justify-around my-2">
              <StatItem label="Likes" value={loveCount} />
              <StatItem label="Seguidores" value={120} />
              <StatItem label="Siguiendo" value={80} />
            </View>

            <TouchableOpacity
              className="bg-emerald-500 rounded-lg py-3 items-center justify-center mt-4"
              onPress={handlePressEjercicio}
            >
              <Text className="text-black font-semibold text-base">
                Enviar Mensaje
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="my-2 gap-2">
          <Button
            titulo=" Ver más usuarios"
            onPress={() => router.push("/usuarios")}
            style="line"
          />
          <Button
            titulo="Github Radar"
            onPress={() => router.push("/radar")}
            style="line"
          />
        </View>
      </View>
    </ScrollView>
  );
}
