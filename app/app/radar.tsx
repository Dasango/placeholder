import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Screen, useTheme } from "../components/Screen";

// Definición de la estructura de un evento de GitHub procesado por n8n
interface GithubEvent {
  id: string;
  event: "star" | "issues" | "push" | "pull_request" | string;
  repo: string;
  actor: string;
  timestamp: number;
}

// Configuración visual por tipo de evento (clases Tailwind en vez de colores sueltos)
const CONFIG_EVENTOS: Record<
  string,
  {
    emoji: string;
    titulo: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
  }
> = {
  star: {
    emoji: "⭐",
    titulo: "New Star!",
    borderClass: "border-amber-400",
    bgClass: "bg-amber-950",
    textClass: "text-amber-400",
  },
  issues: {
    emoji: "🐛",
    titulo: "New Issue",
    borderClass: "border-red-500",
    bgClass: "bg-red-950",
    textClass: "text-red-500",
  },
  push: {
    emoji: "🚀",
    titulo: "New Commit",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-950",
    textClass: "text-blue-500",
  },
  pull_request: {
    emoji: "🔀",
    titulo: "Pull Request",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-950",
    textClass: "text-emerald-500",
  },
  default: {
    emoji: "❓",
    titulo: "Evento GitHub",
    borderClass: "border-gray-400",
    bgClass: "bg-gray-800",
    textClass: "text-gray-400",
  },
};

export default function Clase7WebhooksEjemplo() {
  // --- Estados de Conexión y Datos ---
  const [estadoConexion, setEstadoConexion] = useState<
    "CONECTANDO" | "CONECTADO" | "DESCONECTADO"
  >("DESCONECTADO");
  const [eventos, setEventos] = useState<GithubEvent[]>([]);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>("todos");

  // Dirección del WebSocket (se detecta automáticamente la IP de tu PC para que funcione en celular físico)
  const getWsUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      // Extrae la IP de la URL de Metro (por ejemplo, "192.168.1.100:8081" -> "192.168.1.100")
      const ip = hostUri.split(":")[0];
      return `ws://${ip}:3001`;
    }
    // Fallback: usar 10.0.2.2 para Android Emulator
    return "ws://10.0.2.2:3001";
  };

  const wsUrl = getWsUrl();
  const socketRef = useRef<WebSocket | null>(null);

  // --- Conectar al WebSocket Relay ---
  const conectar = () => {
    if (socketRef.current) return;

    setEstadoConexion("CONECTANDO");
    console.log(`🔌 Intentando conectar a WebSocket en: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("⚡ Conectado al servidor Relay de WebSockets");
      setEstadoConexion("CONECTADO");
    };

    ws.onmessage = (messageEvent) => {
      try {
        const payload = JSON.parse(messageEvent.data);
        console.log("📦 Evento recibido del relay:", payload);

        // Validamos la estructura mínima del evento antes de agregarlo
        if (payload.event && payload.repo && payload.actor) {
          const nuevoEvento: GithubEvent = {
            id: payload.id || Math.random().toString(),
            event: payload.event,
            repo: payload.repo,
            actor: payload.actor,
            timestamp: payload.timestamp || Date.now(),
          };

          // Evitamos Stale Closures insertando al inicio de la lista
          setEventos((prev) => [nuevoEvento, ...prev]);
        }
      } catch (err) {
        console.error("⚠️ Error al decodificar mensaje del relay:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ Error de conexión:", error);
    };

    ws.onclose = () => {
      console.log("🔌 Conexión con relay cerrada");
      setEstadoConexion("DESCONECTADO");
      socketRef.current = null;
    };
  };

  // --- Ciclo de Vida: Conexión y Limpieza (Gotcha 1 de WebSockets) ---
  useEffect(() => {
    conectar();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // --- Lógica de Filtros y Métricas (Mini Concepto Extra) ---
  const metricas = useMemo(() => {
    return eventos.reduce(
      (acumulador, current) => {
        if (current.event === "star") acumulador.stars += 1;
        else if (current.event === "issues") acumulador.issues += 1;
        else if (current.event === "push") acumulador.commits += 1;
        else acumulador.otros += 1;
        return acumulador;
      },
      { stars: 0, issues: 0, commits: 0, otros: 0 },
    );
  }, [eventos]);

  // Filtrado de la lista en memoria
  const eventosFiltrados = useMemo(() => {
    if (filtroSeleccionado === "todos") return eventos;
    return eventos.filter((e) => e.event === filtroSeleccionado);
  }, [eventos, filtroSeleccionado]);

  // --- Mapeo Visual Dinámico ---
  const obtenerConfiguracionEvento = (tipo: string) =>
    CONFIG_EVENTOS[tipo] ?? CONFIG_EVENTOS.default;

  // --- Color del indicador de estado de conexión ---
  const dotClass =
    estadoConexion === "CONECTADO"
      ? "bg-emerald-500"
      : estadoConexion === "CONECTANDO"
        ? "bg-amber-400"
        : "bg-red-500";

  const theme = useTheme();

  // --- Renderizado de Items ---
  const renderItem = ({ item }: { item: GithubEvent }) => {
    const config = obtenerConfiguracionEvento(item.event);
    const fechaFormat = new Date(item.timestamp).toLocaleTimeString();

    return (
      <View
        className={`rounded-xl border p-3 mb-3 ${config.borderClass} ${config.bgClass}`}
      >
        <View className="flex-row items-center mb-1.5">
          <Text className="text-xl mr-2">{config.emoji}</Text>
          <Text className={`flex-1 text-base font-bold ${config.textClass}`}>
            {config.titulo}
          </Text>
          <Text className="text-xs text-gray-400">{fechaFormat}</Text>
        </View>
        <Text className="text-sm text-gray-200">
          <Text className="font-bold">{item.actor}</Text> actuó en el
          repositorio <Text className="font-bold">{item.repo}</Text>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Screen className="flex-1">
        {/* Header y Conexión */}
        <View className={`flex-row items-center justify-between px-4 py-3 border-b ${theme.border}`}>
          <Text className={`text-lg font-bold ${theme.text}`}>
            GitHub Live Radar
          </Text>
          <View className="flex-row items-center">
            <View className={`w-2.5 h-2.5 rounded-full mr-1.5 ${dotClass}`} />
            <Text className={`text-xs font-semibold ${theme.textSoft}`}>
              {estadoConexion}
            </Text>
          </View>
        </View>

        {/* Panel de Métricas */}
        <View className="px-4 py-3" style={{ backgroundColor: theme.surfaceMuted }}>
          <Text className={`text-xs mb-1.5 ${theme.textMuted}`}>
            Métricas de Sesión:
          </Text>
          <View className="flex-row justify-between">
            <Text className={`text-sm ${theme.textSoft}`}>⭐ {metricas.stars}</Text>
            <Text className={`text-sm ${theme.textSoft}`}>🐛 {metricas.issues}</Text>
            <Text className={`text-sm ${theme.textSoft}`}>🚀 {metricas.commits}</Text>
            <Text className={`text-sm ${theme.textSoft}`}>❓ {metricas.otros}</Text>
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row px-4 py-2.5 gap-2">
          {["todos", "star", "issues", "push"].map((filtro) => (
            <TouchableOpacity
              key={filtro}
              onPress={() => setFiltroSeleccionado(filtro)}
              className={`px-3 py-1.5 rounded-full border ${
                theme.border
              } ${
                filtroSeleccionado === filtro
                  ? "bg-emerald-500 border-emerald-500"
                  : ""
              }`}
              style={
                filtroSeleccionado === filtro
                  ? undefined
                  : { backgroundColor: theme.surface }
              }
            >
              <Text
                className={`text-xs font-semibold ${
                  filtroSeleccionado === filtro
                    ? "text-neutral-950"
                    : theme.textSoft
                }`}
              >
                {filtro.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feed Principal */}
        <FlatList
          data={eventosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              {estadoConexion === "CONECTANDO" ? (
                <ActivityIndicator size="large" color="#10b981" />
              ) : (
                <Text className={`text-sm ${theme.textMuted}`}>
                  Esperando eventos de GitHub...
                </Text>
              )}
            </View>
          }
        />
      </Screen>
    </SafeAreaView>
  );
}
