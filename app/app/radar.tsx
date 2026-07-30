import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";

// Definición de la estructura de un evento de GitHub procesado por n8n
interface GithubEvent {
  id: string;
  event: "star" | "issue" | "push" | "pull_request" | string;
  repo: string;
  actor: string;
  timestamp: number;
}

export default function Clase7WebhooksEjemplo() {
  // --- Estados de Conexión y Datos ---
  const [estadoConexion, setEstadoConexion] = useState<
    "CONECTANDO" | "CONECTADO" | "DESCONECTADO"
  >("DESCONECTADO");
  const [eventos, setEventos] = useState<GithubEvent[]>([]);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>("todos");

  // Dirección del WebSocket (en producción se usa variables de entorno)
  // IMPORTANTE: En Android Emulator usar 10.0.2.2 en lugar de localhost
  const wsUrl = "ws://10.0.2.2:3001";
  const socketRef = useRef<WebSocket | null>(null);

  // --- Conectar al WebSocket Relay ---
  const conectar = () => {
    if (socketRef.current) return;

    setEstadoConexion("CONECTANDO");
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
  // Calculamos los contadores usando useMemo para optimizar rendimiento ante re-renders
  const metricas = useMemo(() => {
    return eventos.reduce(
      (acumulador, current) => {
        if (current.event === "star") acumulador.stars += 1;
        else if (current.event === "issue") acumulador.issues += 1;
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

  // --- Mapeo Visual Dinámico (Gotcha de Emojis y Colores) ---
  const obtenerConfiguracionEvento = (tipo: string) => {
    switch (tipo) {
      case "star":
        return {
          emoji: "⭐",
          titulo: "New Star!",
          color: "#fbbf24",
          bg: "#2d2206",
        };
      case "issue":
        return {
          emoji: "🐛",
          titulo: "New Issue",
          color: "#ef4444",
          bg: "#2d0606",
        };
      case "push":
        return {
          emoji: "🚀",
          titulo: "New Commit",
          color: "#3b82f6",
          bg: "#061c2d",
        };
      case "pull_request":
        return {
          emoji: "🔀",
          titulo: "Pull Request",
          color: "#10b981",
          bg: "#062d18",
        };
      default:
        return {
          emoji: "❓",
          titulo: "Evento GitHub",
          color: "#9ca3af",
          bg: "#1f2937",
        };
    }
  };

  // --- Renderizado de Items ---
  const renderItem = ({ item }: { item: GithubEvent }) => {
    const config = obtenerConfiguracionEvento(item.event);
    const fechaFormat = new Date(item.timestamp).toLocaleTimeString();

    return (
      <View
        style={[
          styles.card,
          { borderColor: config.color, backgroundColor: config.bg },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{config.emoji}</Text>
          <Text style={[styles.cardTitle, { color: config.color }]}>
            {config.titulo}
          </Text>
          <Text style={styles.cardTime}>{fechaFormat}</Text>
        </View>
        <Text style={styles.cardDetails}>
          <Text style={styles.boldText}>{item.actor}</Text> actuó en el
          repositorio <Text style={styles.boldText}>{item.repo}</Text>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header y Conexión */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GitHub Live Radar</Text>
        <View style={styles.estadoContainer}>
          <View
            style={[
              styles.estadoDot,
              {
                backgroundColor:
                  estadoConexion === "CONECTADO"
                    ? "#10b981"
                    : estadoConexion === "CONECTANDO"
                      ? "#fbbf24"
                      : "#ef4444",
              },
            ]}
          />
          <Text style={styles.estadoText}>{estadoConexion}</Text>
        </View>
      </View>

      {/* Panel de Métricas */}
      <View style={styles.metricasPanel}>
        <Text style={styles.metricasLabel}>Métricas de Sesión:</Text>
        <View style={styles.metricasList}>
          <Text style={styles.metricaText}>⭐ {metricas.stars}</Text>
          <Text style={styles.metricaText}>🐛 {metricas.issues}</Text>
          <Text style={styles.metricaText}>🚀 {metricas.commits}</Text>
          <Text style={styles.metricaText}>❓ {metricas.otros}</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtroContainer}>
        {["todos", "star", "issue", "push"].map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[
              styles.filtroBtn,
              filtroSeleccionado === filtro && styles.filtroBtnActivo,
            ]}
            onPress={() => setFiltroSeleccionado(filtro)}
          >
            <Text
              style={[
                styles.filtroBtnText,
                filtroSeleccionado === filtro && styles.filtroBtnTextActivo,
              ]}
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
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {estadoConexion === "CONECTANDO" ? (
              <ActivityIndicator size="large" color="#10b981" />
            ) : (
              <Text style={styles.emptyText}>
                Esperando eventos de GitHub...
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117", // Color oscuro de GitHub
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c9d1d9",
  },
  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  estadoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  estadoText: {
    fontSize: 12,
    color: "#8b949e",
    fontWeight: "600",
  },
  metricasPanel: {
    backgroundColor: "#161b22",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#21262d",
  },
  metricasLabel: {
    color: "#8b949e",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },
  metricasList: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  metricaText: {
    color: "#c9d1d9",
    fontSize: 14,
    fontWeight: "bold",
  },
  filtroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtroBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
  },
  filtroBtnActivo: {
    backgroundColor: "#21262d",
    borderColor: "#8b949e",
  },
  filtroBtnText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  filtroBtnTextActivo: {
    color: "#c9d1d9",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
  },
  cardTime: {
    fontSize: 12,
    color: "#8b949e",
  },
  cardDetails: {
    color: "#c9d1d9",
    fontSize: 13,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#8b949e",
    fontSize: 14,
  },
});
