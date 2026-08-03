import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Card, Screen, useTheme } from "../components/Screen";

interface Mensaje {
  id: string;
  texto: string;
  remitente: "usuario" | "servidor";
  fecha: Date;
}

export default function Chat() {
  const [urlSocket] = useState("wss://ws.postman-echo.com/raw");
  const [estadoConexion, setEstadoConexion] = useState<
    "CONECTANDO" | "CONECTADO" | "DESCONECTADO"
  >("DESCONECTADO");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [textoMensaje, setTextoMensaje] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const socketConnectTries = useRef(0);

  // Referencias para controlar la reconexión y limpieza
  const desconexionManualRef = useRef(false);
  const reconectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conectar = () => {
    if (socketRef.current) return;

    console.log("🔌 Creando nueva conexión WebSocket...");
    setEstadoConexion("CONECTANDO");
    desconexionManualRef.current = false; // Se reinicia al intentar conectar

    const ws = new WebSocket(urlSocket);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Conectado");
      setEstadoConexion("CONECTADO");
      socketConnectTries.current = 0; // Reiniciar contador de intentos tras éxito
      ws.send("¡Hola! Conexión de prueba establecida.");
    };

    ws.onmessage = (event) => {
      console.log("📩 Mensaje recibido del servidor:", event.data);

      const nuevoMensaje: Mensaje = {
        id: Math.random().toString(),
        texto: event.data,
        remitente: "servidor",
        fecha: new Date(),
      };

      setMensajes((prev) => [...prev, nuevoMensaje]);
    };

    ws.onerror = (errorEvent) => {
      console.error("❌ Error en el WebSocket:", errorEvent);
    };

    ws.onclose = (closeEvent) => {
      console.log(
        "🔌 Conexión WebSocket cerrada:",
        closeEvent.code,
        closeEvent.reason,
      );
      setEstadoConexion("DESCONECTADO");
      socketRef.current = null;

      // Evaluar si corresponde reconexión automática
      if (!desconexionManualRef.current) {
        if (socketConnectTries.current < 3) {
          socketConnectTries.current += 1;
          console.log(
            `Intento de reconexión ${socketConnectTries.current} de 3...`,
          );

          reconectTimerRef.current = setTimeout(() => {
            conectar();
          }, 1500);
        } else {
          console.error("Se agotaron los 3 intentos. Conexión finalizada.");
        }
      }
    };
  };

  const desconectar = () => {
    console.log("Forzar desconectado manualmente...");
    desconexionManualRef.current = true; // Activar bandera de desconexión intencional

    // Limpiar cualquier temporizador pendiente
    if (reconectTimerRef.current) {
      clearTimeout(reconectTimerRef.current);
      reconectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setEstadoConexion("DESCONECTADO");
    socketConnectTries.current = 0;
  };

  useEffect(() => {
    conectar();

    return () => {
      console.log(
        "🧹 Limpieza: Desmontando pantalla. Cerrando conexiones e hilos...",
      );

      // Limpiar temporizador para evitar fugas de memoria
      if (reconectTimerRef.current) {
        clearTimeout(reconectTimerRef.current);
      }

      // Cerrar el socket previniendo que intente reconectar
      if (socketRef.current) {
        desconexionManualRef.current = true;
        socketRef.current.close();
      }
    };
  }, []);

  const enviarMensaje = () => {
    if (
      !textoMensaje.trim() ||
      !socketRef.current ||
      estadoConexion !== "CONECTADO"
    ) {
      return;
    }

    const mensajeTexto = textoMensaje.trim();

    const nuevoMensaje: Mensaje = {
      id: Math.random().toString(),
      texto: mensajeTexto,
      remitente: "usuario",
      fecha: new Date(),
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
    socketRef.current.send(mensajeTexto);
    setTextoMensaje("");
  };

  const obtenerColorEstado = () => {
    switch (estadoConexion) {
      case "CONECTADO":
        return "bg-emerald-500";
      case "CONECTANDO":
        return "bg-amber-500";
      case "DESCONECTADO":
        return "bg-red-500";
    }
  };

  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <Screen className="flex-1 p-6 pt-12">
        <Card className="rounded-2xl p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`text-sm font-semibold ${theme.textSoft}`}>
              Estado del Servidor:
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-3.5 h-3.5 rounded-full mr-2 ${obtenerColorEstado()}`}
              />
              <Text className={`font-bold text-xs uppercase tracking-wider ${theme.text}`}>
                {estadoConexion}
              </Text>
            </View>
          </View>

          <Text className={`text-xs font-mono mb-4 break-all ${theme.textMuted}`}>
            URL: {urlSocket}
          </Text>

          <View className="flex-row justify-between gap-3">
            <TouchableOpacity
              onPress={conectar}
              disabled={estadoConexion !== "DESCONECTADO"}
              className={`px-4 py-2.5 rounded-lg flex-1 ${
                estadoConexion !== "DESCONECTADO"
                  ? "bg-gray-800 opacity-50"
                  : "bg-emerald-600"
              }`}
            >
              <Text className="text-white text-center font-bold text-sm">
                Conectar 🔌
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={desconectar}
              disabled={estadoConexion === "DESCONECTADO"}
              className={`px-4 py-2.5 rounded-lg flex-1 ${
                estadoConexion === "DESCONECTADO"
                  ? "bg-gray-800 opacity-50"
                  : "bg-red-950 border border-red-800"
              }`}
            >
              <Text className="text-red-400 text-center font-bold text-sm">
                Desconectar 🛑
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="flex-1 rounded-2xl p-4 mb-4">
          {estadoConexion === "CONECTANDO" && mensajes.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className={`text-xs mt-3 ${theme.textMuted}`}>
                Estableciendo conexión...
              </Text>
            </View>
          ) : mensajes.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Text className={`text-center text-sm ${theme.textMuted}`}>
                No hay mensajes en esta sesión. Conéctate y envía un mensaje
                para probar el eco.
              </Text>
            </View>
          ) : (
            <FlatList
              data={mensajes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const esUsuario = item.remitente === "usuario";
                return (
                  <View
                    className={`mb-3 flex-row ${
                      esUsuario ? "justify-end" : "justify-start"
                    }`}
                  >
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        esUsuario
                          ? "bg-emerald-600 rounded-tr-none"
                          : "rounded-tl-none"
                      }`}
                      style={
                        esUsuario
                          ? undefined
                          : { backgroundColor: theme.surfaceAlt }
                      }
                    >
                      <Text
                        className={`text-sm ${
                          esUsuario ? "text-white" : theme.text
                        }`}
                      >
                        {item.texto}
                      </Text>
                      <Text
                        className={`text-[10px] text-right mt-1 font-mono ${
                          esUsuario ? "text-gray-200" : theme.textMuted
                        }`}
                      >
                        {item.fecha.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </Card>

        <View className="flex-row gap-3">
          <TextInput
            value={textoMensaje}
            onChangeText={setTextoMensaje}
            placeholder={
              estadoConexion === "CONECTADO"
                ? "Escribe un mensaje de prueba..."
                : "Debes estar conectado..."
            }
            placeholderTextColor={theme.placeholder}
            editable={estadoConexion === "CONECTADO"}
            className={`flex-1 border ${theme.border} text-white rounded-xl px-4 py-3`}
            style={{ backgroundColor: theme.surface, color: theme.color }}
          />
          <TouchableOpacity
            onPress={enviarMensaje}
            disabled={estadoConexion !== "CONECTADO" || !textoMensaje.trim()}
            className={`justify-center items-center px-5 rounded-xl ${
              estadoConexion === "CONECTADO" && textoMensaje.trim()
                ? "bg-emerald-500"
                : "bg-gray-800 opacity-50"
            }`}
          >
            <Text className="text-black font-bold text-sm">Enviar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
