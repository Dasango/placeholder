import { Stack, useLocalSearchParams, router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetalleModel, DetalleRouteParams } from ".";

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View className="items-center flex-1">
      <Text className="text-white font-bold text-xl">{value}</Text>
      <Text className="text-gray-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

export default function Detalles() {
  const routeParams = useLocalSearchParams() as unknown as DetalleRouteParams;

  const perfil: DetalleModel = {
    nombre: routeParams.nombre || "",
    rol: routeParams.rol || "",
    tiempoActivo: Number(routeParams.tiempoActivo) || 0,
    siguiendo: routeParams.siguiendo === "true",
    likes: Number(routeParams.likes) || 0,
  };

  return (
    <>
      <Stack.Screen options={{ title: `Perfil de ${perfil.nombre}` }} />
      <View className="flex-1 bg-[#252525] px-6 pt-16 items-center">
        <View className="w-28 h-28 rounded-full border-4 border-emerald-500 overflow-hidden mb-5">
          <Image
            source={{ uri: "https://i.pravatar.cc/200" }}
            className="w-full h-full"
          />
        </View>

        {/* Nombre y rol */}
        <Text className="text-white text-2xl font-bold">{perfil.nombre}</Text>
        <Text className="text-gray-400 text-base mt-1">{perfil.rol}</Text>

        {/* Badge de "siguiendo" */}
        <View
          className={`mt-4 px-4 py-1.5 rounded-full ${
            perfil.siguiendo
              ? "bg-[#252525] border border-emerald-500"
              : "bg-emerald-500"
          }`}
        >
          <Text
            className={
              perfil.siguiendo
                ? "text-emerald-500 font-semibold"
                : "text-black font-semibold"
            }
          >
            {perfil.siguiendo ? "Siguiendo" : "No sigues a este usuario"}
          </Text>
        </View>

        {/* Tarjeta de stats */}
        <View className="flex-row w-full bg-[#161b22] border border-gray-800 rounded-xl py-5 mt-8">
          <DetailStat label="Segundos activo" value={perfil.tiempoActivo} />
          <View className="w-[1px] bg-gray-800" />
          <DetailStat label="Likes" value={perfil.likes} />
        </View>

        {/* Botón volver */}
        <TouchableOpacity
          className="flex-row items-center gap-2 border-2 border-emerald-500 rounded-lg px-6 py-3 mt-10"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#10b981" />
          <Text className="text-emerald-500 font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
