import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

// Tipo para simular datos recibidos de una API
interface ConsejoData {
  id: number;
  texto: string;
}

export default function Clase3CicloVida() {
  // --- Estados ---
  const [segundos, setSegundos] = useState(0);
  const [consejo, setConsejo] = useState<ConsejoData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescar, setRefrescar] = useState(0);

  // --- useEffect #1: Efecto de Montaje y Cleanup (Temporizador) ---
  // Este efecto se ejecuta una sola vez al montarse el componente ([])
  // y limpia el intervalo al desmontarse para evitar fugas de memoria (memory leaks).
  useEffect(() => {
    console.log('🔌 [Efecto 1] Componente montado. Iniciando temporizador...');
    
    const intervalo = setInterval(() => {
      // Usamos la función actualizadora (prev => prev + 1) para evitar stale closures
      setSegundos((prev) => prev + 1);
    }, 1000);

    // Función de limpieza (cleanup). Se ejecuta cuando el componente se desmonta.
    return () => {
      console.log('🔌 [Efecto 1] Componente se va a desmontar. Limpiando temporizador...');
      clearInterval(intervalo);
    };
  }, []); // Array de dependencias vacío = solo al montar/desmontar

  // --- useEffect #2: Efecto con Dependencias (Simulación de API) ---
  // Este efecto se ejecuta al montar Y cada vez que el valor de 'refrescar' cambia.
  useEffect(() => {
    let activo = true; // Flag para evitar actualizar el estado si el componente se desmonta durante la petición
    
    const cargarConsejoDelDia = async () => {
      setCargando(true);
      console.log(`📡 [Efecto 2] Simulando petición API... (Refrescar count: ${refrescar})`);
      
      try {
        // Simulamos un retraso de red de 1.5 segundos
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const consejos = [
          { id: 1, texto: "Escribe componentes pequeños y enfocados en una sola tarea." },
          { id: 2, texto: "Evita mutar directamente el estado; usa siempre la función actualizadora." },
          { id: 3, texto: "Limpia siempre tus timers, event listeners y WebSockets en la función de retorno de useEffect." },
          { id: 4, texto: "Usa React.memo o useMemo solo cuando tengas problemas reales de rendimiento." },
          { id: 5, texto: "TypeScript y React Native son la combinación perfecta para interfaces robustas." }
        ];
        
        const consejoAleatorio = consejos[Math.floor(Math.random() * consejos.length)];
        
        if (activo) {
          setConsejo(consejoAleatorio);
          setCargando(false);
        }
      } catch (error) {
        console.error("Error cargando el consejo:", error);
      }
    };

    cargarConsejoDelDia();

    // Limpieza: si el usuario navega a otra pantalla o refresca rápido, cancelamos la actualización del estado
    return () => {
      console.log('🔌 [Efecto 2] Limpieza de efecto de API. Cancelando petición anterior...');
      activo = false;
    };
  }, [refrescar]); // Se ejecuta cada vez que cambia 'refrescar'

  return (
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-12">
      {/* Cabecera */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white text-center">
          Clase 3: Ciclo de Vida y useEffect
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Manejo de efectos secundarios, timers y peticiones asíncronas
        </Text>
      </View>

      {/* Card 1: Temporizador de Permanencia (Efecto de Montaje) */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-6">
        <Text className="text-emerald-500 font-semibold text-xs uppercase tracking-wider mb-2">
          ⏱️ Temporizador de Permanencia
        </Text>
        <Text className="text-gray-300 mb-4 text-sm">
          Este contador se incrementa cada segundo. Si sales de esta pantalla, el intervalo se destruye automáticamente gracias a la función de limpieza (cleanup).
        </Text>
        <View className="bg-[#0d1117] border border-gray-800 p-4 rounded-xl items-center">
          <Text className="text-gray-400 text-xs uppercase mb-1">Tiempo Activo</Text>
          <Text className="text-3xl font-bold text-white">{segundos} segundos</Text>
        </View>
      </View>

      {/* Card 2: Consejo del Desarrollador (Simulación de API) */}
      <View className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-12">
        <Text className="text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
          💡 Consejo del Día (Simulación API)
        </Text>
        <Text className="text-gray-300 mb-4 text-sm">
          Este bloque realiza una petición asíncrona simulada al cargar. Puedes forzar un nuevo renderizado del efecto cambiando la dependencia.
        </Text>

        <View className="bg-[#0d1117] border border-gray-800 p-6 rounded-xl min-h-[100px] justify-center items-center mb-4">
          {cargando ? (
            <View className="items-center">
              <ActivityIndicator size="small" color="#6366f1" />
              <Text className="text-gray-500 text-xs mt-2">Conectando con el servidor...</Text>
            </View>
          ) : (
            <View>
              <Text className="text-white text-center italic text-base leading-relaxed">
                "{consejo?.texto}"
              </Text>
              <Text className="text-gray-500 text-right text-xs mt-3">
                Consejo #{consejo?.id}
              </Text>
            </View>
          )}
        </View>

        {/* Botón para cambiar la dependencia y forzar la ejecución del useEffect */}
        <TouchableOpacity 
          onPress={() => setRefrescar((prev) => prev + 1)}
          disabled={cargando}
          className={`py-3 rounded-xl items-center justify-center border ${
            cargando 
              ? 'bg-transparent border-gray-800' 
              : 'bg-indigo-600 border-indigo-600 active:scale-95'
          }`}
        >
          <Text className={`font-semibold ${cargando ? 'text-gray-600' : 'text-white'}`}>
            {cargando ? 'Obteniendo consejo...' : 'Obtener Otro Consejo 🔄'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
