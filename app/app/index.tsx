import { useState, useEffect, useRef } from "react";
import { Text, View, FlatList } from "react-native";

interface GitHubEvent {
  id: string;
  type: string;
  repo?: { name: string };
  actor?: { login: string };
  created_at: string;
}

export default function Index() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.100.50:3001");

    ws.current.onopen = () => setIsConnected(true);

    ws.current.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setEvents((prevEvents) => [parsedData, ...prevEvents]);
      } catch (error) {
        console.error("Error parseando JSON:", error);
      }
    };

    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const renderItem = ({ item }: { item: GitHubEvent }) => {
    const emoji = item.type === "PushEvent" ? "🔨" : "📦";

    return (
      <View className="bg-[#161b22] p-4 mx-3 mt-3 rounded-md border border-[#30363d]">
        <Text className="text-[#c9d1d9] text-base font-bold mb-1">
          {emoji} {item.repo?.name || "Repositorio desconocido"}
        </Text>
        <Text className="text-[#8b949e] text-sm">
          Actor: {item.actor?.login || "Desconocido"}
        </Text>
        <Text className="text-[#8b949e] text-sm">
          Fecha: {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0d1117] pt-12">
      {/* Indicador de conexión superior */}
      <View className="flex-row items-center p-4 border-b border-[#30363d] bg-[#010409]">
        <View
          className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? "bg-[#238636]" : "bg-[#da3633]"
          }`}
        />
        <Text className="text-[#c9d1d9] font-bold">
          {isConnected ? "Conectado" : "Desconectado"}
        </Text>
      </View>

      {/* Renderizado de los eventos */}
      <FlatList
        data={events}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}
      />
    </View>
  );
}