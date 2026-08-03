import { Stack, useLocalSearchParams, router } from "expo-router";
import { Image, Text, View } from "react-native";
import { DetalleModel, DetalleRouteParams } from ".";
import { useUserStore } from "./store/userStore";
import { Button } from "../components/Button";
import { Card, Screen, useTheme } from "../components/Screen";

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();

  return (
    <View className="items-center flex-1">
      <Text className={`font-bold text-xl ${theme.text}`}>{value}</Text>
      <Text className={`text-xs mt-1 ${theme.textMuted}`}>{label}</Text>
    </View>
  );
}

export default function Detalles() {
  const routeParams = useLocalSearchParams() as unknown as DetalleRouteParams;

  const { profileImage, username, isDarkMode, toggleTheme } = useUserStore();
  const theme = useTheme();

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
      <Screen className="flex-1 px-6 pt-16 items-center">
        <View className="w-28 h-28 rounded-full border-4 border-emerald-500 overflow-hidden mb-5">
          <Image source={{ uri: profileImage }} className="w-full h-full" />
        </View>

        {/* Nombre y rol */}
        <Text className={`text-2xl font-bold ${theme.text}`}>
          {perfil.nombre}
        </Text>
        <Text className={`text-base mt-1 ${theme.textMuted}`}>
          {perfil.rol}
        </Text>

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
        <Card className="flex-row w-full rounded-xl py-5 mt-8">
          <DetailStat label="Segundos activo" value={perfil.tiempoActivo} />
          <View
            className="w-[1px]"
            style={{ backgroundColor: theme.divider }}
          />
          <DetailStat label="Likes" value={perfil.likes} />
        </Card>

        {/* Botón volver */}
        <View className="w-full mt-10 gap-2">
          <Button
            titulo={isDarkMode ? " Modo Oscuro" : "Modo Claro"}
            style={isDarkMode ? "dark" : "light"}
            onPress={toggleTheme}
          />
          <Button titulo="Volver" style="line" onPress={() => router.back()} />
        </View>
      </Screen>
    </>
  );
}
