import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// Estructura de cada mensaje en nuestro log del chat
interface Mensaje {
  id: string;
  texto: string;
  remitente: 'usuario' | 'servidor';
  fecha: Date;
}

export default function Clase6WebSockets() {
  // --- Estados ---
  const [urlSocket] = useState('wss://echo.websocket.events');
  const [estadoConexion, setEstadoConexion] = useState<'CONECTANDO' | 'CONECTADO' | 'DESCONECTADO'>('DESCONECTADO');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [textoMensaje, setTextoMensaje] = useState('');
  
  // Usamos un useRef para almacenar la referencia del WebSocket.
  // Esto evita recrear el socket en cada renderizado y permite acceder a él en cualquier función.
  const socketRef = useRef<WebSocket | null>(null);

  // --- Función para Conectar al WebSocket ---
  const conectar = () => {
    if (socketRef.current) return; // Si ya hay una instancia, no creamos otra.

    console.log('🔌 Creando nueva conexión WebSocket...');
    setEstadoConexion('CONECTANDO');
    
    // Crear instancia
    const ws = new WebSocket(urlSocket);
    socketRef.current = ws;

    // --- Definición de Eventos del Ciclo de Vida ---
    
    ws.onopen = () => {
      console.log('✅ WebSocket Conectado');
      setEstadoConexion('CONECTADO');
      
      // Enviamos un mensaje de saludo inicial
      ws.send('¡Hola! Conexión de prueba establecida.');
    };

    ws.onmessage = (event) => {
      console.log('📩 Mensaje recibido del servidor:', event.data);
      
      const nuevoMensaje: Mensaje = {
        id: Math.random().toString(),
        texto: event.data,
        remitente: 'servidor',
        fecha: new Date(),
      };

      // --- GOTCHA 2: Evitar Stale Closures usando la función actualizadora (prev => ...) ---
      setMensajes((prev) => [...prev, nuevoMensaje]);
    };

    ws.onerror = (errorEvent) => {
      console.error('❌ Error en el WebSocket:', errorEvent);
    };

    ws.onclose = (closeEvent) => {
      console.log('🔌 Conexión WebSocket cerrada:', closeEvent.code, closeEvent.reason);
      setEstadoConexion('DESCONECTADO');
      socketRef.current = null;
    };
  };

  // --- Función para Desconectar del WebSocket ---
  const desconectar = () => {
    if (socketRef.current) {
      console.log('🔌 Desconectando manualmente...');
      socketRef.current.close();
    }
  };

  // --- Efecto de Montaje y Limpieza (Gotcha 1) ---
  useEffect(() => {
    // Nos conectamos automáticamente al montar la pantalla
    conectar();

    // --- FUNCIÓN DE LIMPIEZA (CLEANUP) ---
    // Se ejecuta al desmontar el componente (cuando el usuario sale de la pantalla).
    // Previene memory leaks y conexiones fantasma en segundo plano.
    return () => {
      console.log('🧹 Limpieza: Desmontando pantalla. Cerrando conexiones...');
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []); // Array vacío = solo al montar/desmontar

  // --- Función para Enviar un Mensaje ---
  const enviarMensaje = () => {
    if (!textoMensaje.trim() || !socketRef.current || estadoConexion !== 'CONECTADO') {
      return;
    }

    const mensajeTexto = textoMensaje.trim();
    
    // Crear el mensaje local del usuario
    const nuevoMensaje: Mensaje = {
      id: Math.random().toString(),
      texto: mensajeTexto,
      remitente: 'usuario',
      fecha: new Date(),
    };

    // Agregar a la lista localmente
    setMensajes((prev) => [...prev, nuevoMensaje]);
    
    // Enviar a través de la conexión activa del socket
    socketRef.current.send(mensajeTexto);
    
    // Limpiar input
    setTextoMensaje('');
  };

  // Ayudante visual para el indicador de estado
  const obtenerColorEstado = () => {
    switch (estadoConexion) {
      case 'CONECTADO': return 'bg-emerald-500';
      case 'CONECTANDO': return 'bg-amber-500';
      case 'DESCONECTADO': return 'bg-red-500';
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0d1117]"
    >
      <View className="flex-1 p-6 pt-12">
        {/* Cabecera */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-white text-center">
            Clase 6: WebSockets ⚡
          </Text>
          <Text className="text-gray-400 text-center mt-1">
            Canales bidireccionales en tiempo real
          </Text>
        </View>

        {/* Panel de Control y Estado */}
        <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-300 text-sm font-semibold">Estado del Servidor:</Text>
            <View className="flex-row items-center">
              <View className={`w-3.5 h-3.5 rounded-full mr-2 ${obtenerColorEstado()}`} />
              <Text className="text-white font-bold text-xs uppercase tracking-wider">{estadoConexion}</Text>
            </View>
          </View>

          <Text className="text-gray-400 text-xs font-mono mb-4 break-all">
            URL: {urlSocket}
          </Text>

          <View className="flex-row justify-between gap-3">
            <TouchableOpacity 
              onPress={conectar}
              disabled={estadoConexion !== 'DESCONECTADO'}
              className={`px-4 py-2.5 rounded-lg flex-1 ${estadoConexion !== 'DESCONECTADO' ? 'bg-gray-800 opacity-50' : 'bg-emerald-600'}`}
            >
              <Text className="text-white text-center font-bold text-sm">Conectar 🔌</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={desconectar}
              disabled={estadoConexion === 'DESCONECTADO'}
              className={`px-4 py-2.5 rounded-lg flex-1 ${estadoConexion === 'DESCONECTADO' ? 'bg-gray-800 opacity-50' : 'bg-red-950 border border-red-800'}`}
            >
              <Text className="text-red-400 text-center font-bold text-sm">Desconectar 🛑</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Mensajes del Chat */}
        <View className="flex-1 bg-[#161b22] border border-gray-800 rounded-2xl p-4 mb-4">
          {estadoConexion === 'CONECTANDO' && mensajes.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="text-gray-400 text-xs mt-3">Estableciendo conexión...</Text>
            </View>
          ) : mensajes.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Text className="text-gray-500 text-center text-sm">
                No hay mensajes en esta sesión. Conéctate y envía un mensaje para probar el eco.
              </Text>
            </View>
          ) : (
            <FlatList
              data={mensajes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const esUsuario = item.remitente === 'usuario';
                return (
                  <View className={`mb-3 flex-row ${esUsuario ? 'justify-end' : 'justify-start'}`}>
                    <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      esUsuario 
                        ? 'bg-emerald-600 rounded-tr-none' 
                        : 'bg-gray-800 rounded-tl-none'
                    }`}>
                      <Text className="text-white text-sm">{item.texto}</Text>
                      <Text className="text-gray-300 text-[10px] text-right mt-1 font-mono">
                        {item.fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* Input de Envío */}
        <View className="flex-row gap-3">
          <TextInput
            value={textoMensaje}
            onChangeText={setTextoMensaje}
            placeholder={estadoConexion === 'CONECTADO' ? "Escribe un mensaje de prueba..." : "Debes estar conectado..."}
            placeholderTextColor="#6e7681"
            editable={estadoConexion === 'CONECTADO'}
            className="flex-1 bg-[#161b22] border border-gray-800 text-white rounded-xl px-4 py-3"
          />
          <TouchableOpacity 
            onPress={enviarMensaje}
            disabled={estadoConexion !== 'CONECTADO' || !textoMensaje.trim()}
            className={`justify-center items-center px-5 rounded-xl ${
              estadoConexion === 'CONECTADO' && textoMensaje.trim()
                ? 'bg-emerald-500' 
                : 'bg-gray-800 opacity-50'
            }`}
          >
            <Text className="text-black font-bold text-sm">Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
