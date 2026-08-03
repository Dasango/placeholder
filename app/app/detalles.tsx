import { Stack, useLocalSearchParams, router } from "expo-router";
import { Image, Text, TextInput, View, TouchableOpacity } from "react-native";
import { DetalleModel, DetalleRouteParams } from ".";
import { useUserStore } from "./store/userStore";
import { Button } from "../components/Button";
import { Card, Screen, useTheme } from "../components/Screen";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

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

  const { profileImage, username, isDarkMode, toggleTheme, setUsername } =
    useUserStore();
  const theme = useTheme();

  // Estado local para el input
  const [inputValue, setInputValue] = useState(username);

  const perfil: DetalleModel = {
    nombre: routeParams.nombre || "",
    rol: routeParams.rol || "",
    tiempoActivo: Number(routeParams.tiempoActivo) || 0,
    siguiendo: routeParams.siguiendo === "true",
    likes: Number(routeParams.likes) || 0,
  };

  // Función para manejar el submit
  const handleSubmit = () => {
    if (inputValue.trim()) {
      setUsername(inputValue.trim());
    }
  };

  return (
    <>
      {/* ✅ Usando username del store en lugar de perfil.nombre */}
      <Stack.Screen options={{ title: `Perfil de ${username}` }} />
      <Screen className="flex-1 px-6 pt-16 items-center">
        <View className="w-28 h-28 rounded-full border-4 border-emerald-500 overflow-hidden mb-5">
          <Image source={{ uri: profileImage }} className="w-full h-full" />
        </View>

        {/* ✅ Usando username del store en lugar de perfil.nombre */}
        <Text className={`text-2xl font-bold ${theme.text}`}>{username}</Text>
        <Text className={`text-base mt-1 ${theme.textMuted}`}>
          {perfil.rol}
        </Text>

        {/* Input con flechita - CORREGIDO */}
        <View
          className={`flex-row items-center rounded-xl w-full border ${theme.border} mb-4`}
          style={{ backgroundColor: theme.surfaceAlt }}
        >
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Cambiar nombre de usuario..."
            // ✅ Usando theme.placeholder (hexadecimal) en lugar de theme.textMuted (clase CSS)
            placeholderTextColor={theme.placeholder}
            className="flex-1 px-4 py-3"
            // ✅ Usando theme.color (hexadecimal) en lugar de theme.text (clase CSS)
            style={{
              color: theme.color,
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
          />
          <TouchableOpacity onPress={handleSubmit} className="pr-4 py-3">
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              // ✅ Cambia de color según si hay texto o no
              color={inputValue.trim() ? "#10b981" : theme.placeholder}
            />
          </TouchableOpacity>
        </View>

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

        {/* Botones */}
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
