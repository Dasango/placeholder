# Clase 11: Framer Motion / Reanimated (Animaciones de Nivel Premium) 💫🎬

En la Web, las animaciones fluidas y las transiciones dinámicas son gobernadas por CSS o librerías épicas como **Framer Motion**. En el mundo móvil nativo, sin embargo, el rendimiento de las animaciones es crítico: los dispositivos tienen recursos limitados y las animaciones que corren en el hilo de JavaScript (JS Thread) a menudo sufren caídas de frames impactantes cuando el procesador está ocupado cargando datos o renderizando pantallas.

Hoy aprenderemos a utilizar **React Native Reanimated** (la librería estándar de facto de la industria, que comparte principios declarativos muy similares a Framer Motion) para ejecutar animaciones fluidas a 60/120 FPS directamente en el hilo de UI (UI Thread).

---

## 📖 Conceptos Clave

### 1. El Hilo JS vs. El Hilo de UI (Worklets) 🧵

El motor de React Native ejecuta tu lógica de JS en un hilo dedicado. Si intentas animar algo haciendo re-renders continuos de React (por ejemplo, con `useState`), el JS Thread se satura y la animación se ve pausada ("laggeada").
**Reanimated** soluciona esto introduciendo **Worklets**: pequeñas funciones de JavaScript que se compilan y se ejecutan directamente en el hilo de UI nativo. Esto garantiza animaciones fluidas incluso si el hilo de JS está completamente bloqueado por una consulta pesada a una base de datos o API.

### 2. Valores Compartidos (`useSharedValue`)

Un `useSharedValue` es un contenedor para un valor reactivo que vive en el hilo de UI. Es muy similar a un `useRef`, pero reactivo y optimizado para animaciones.

- **No provoca re-renders**: Cambiar un shared value no fuerza al componente de React a volver a ejecutarse.
- **Acceso**: Se accede y modifica usando la propiedad `.value`.

```typescript
import { useSharedValue } from "react-native-reanimated";

const escala = useSharedValue(1); // Valor inicial

const presionar = () => {
  escala.value = 1.5; // El hilo de UI detecta el cambio instantáneamente
};
```

### 3. Estilos Animados (`useAnimatedStyle`)

Para conectar nuestros `sharedValues` con los estilos de un componente nativo, usamos el hook `useAnimatedStyle`. Este hook asocia de forma declarativa cómo cambian las propiedades visuales a partir de los valores compartidos.

```typescript
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const escala = useSharedValue(1);

const estiloAnimado = useAnimatedStyle(() => {
  return {
    transform: [{ scale: escala.value }],
  };
});

// Nota el uso de Animated.View en lugar de View normal
<Animated.View style={estiloAnimado} className="w-20 h-20 bg-blue-500" />
```

### 4. Funciones de Animación Temporal

Reanimated provee helpers para transicionar un valor suavemente en lugar de cambiarlo de golpe:

- `withTiming(destino, config)`: Animación basada en curvas de tiempo (Bézier). Ideal para opacidades o movimientos lineales simples.
- `withSpring(destino, config)`: Animación basada en **física de resorte** (masa, rigidez, fricción). Aporta un look sumamente orgánico y premium ("bouncy").
- `withRepeat(animacion, repeticiones, invertir)`: Repite una animación un número de veces o infinitamente (`-1`).
- `withSequence(...animaciones)`: Ejecuta una serie de animaciones una tras otra.

```typescript
import { withSpring, withTiming } from "react-native-reanimated";

escala.value = withSpring(1.5); // Efecto elástico hasta 1.5
opacidad.value = withTiming(0, { duration: 500 }); // Desvanece en 500ms
```

### 5. Animaciones de Diseño Automático (Layout Animations) 🪄

Uno de los superpoderes de Reanimated es la capacidad de animar la entrada (`entering`), salida (`exiting`) y el reacomodo (`layout`) de elementos en pantalla de forma 100% declarativa, sin configurar estados manuales. Esto es increíblemente útil para listas dinámicas (`FlatList`).

```typescript
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';

<Animated.View
  entering={FadeInUp.duration(400)}
  exiting={FadeOutDown}
  layout={Layout.springify()} // Anima el movimiento de otros elementos al eliminarse este
>
  <Text>¡Me animo solo al aparecer y desaparecer!</Text>
</Animated.View>
```

---

## 💡 El Gotcha de Reanimated: Componentes Nativos Animados y la Propiedad `.value` ⚠️

### 1. El Olvido del Componente Animado

Si intentas aplicar un estilo devuelto por `useAnimatedStyle` a un componente nativo normal como `<View>` o `<Text>`, la aplicación lanzará un error crítico o simplemente ignorará la animación.

- **Incorrecto**: `<View style={estiloAnimado} />`
- **Correcto**: `<Animated.View style={estiloAnimado} />`

### 2. Olvidar escribir `.value`

A diferencia de los estados normales de React o variables de JS, un shared value **siempre** requiere leer o escribir sobre su propiedad `.value`.

- **Incorrecto**: `opacidad = 0.5;` o `if (opacidad === 1)`
- **Correcto**: `opacidad.value = 0.5;` o `if (opacidad.value === 1)`

### 3. La barrera del Hilo de UI (Worklets)

Las funciones dentro de `useAnimatedStyle` o `useDerivedValue` son **worklets**. Se ejecutan en el Hilo de UI. Si intentas llamar a una función normal de tu código JS dentro de ellas sin que sea un worklet, obtendrás un error indicando que la función no puede ser ejecutada en el UI Thread.

- **Solución**: Mantén los hooks de animación puramente dedicados a retornar estilos basados en shared values. Si necesitas ejecutar código JS después de una animación, usa los callbacks de finalización que proveen las funciones de animación:
  ```typescript
  opacidad.value = withTiming(0, {}, (finished) => {
    if (finished) {
      // Este callback corre de forma segura
    }
  });
  ```

---

## 🏆 El Reto de la Clase 11: Lista de Usuarios Interactiva y Animada 👥✨

Tu misión es transformar la pantalla de [usuarios.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/usuarios.tsx) en una experiencia visual fluida y premium aprovechando las capacidades de `react-native-reanimated`

### Requerimientos del Reto:

1.  **Animación de Entrada de las Tarjetas** 🎴:
    - Convierte el contenedor de las tarjetas (`Card`) de usuario dentro del `FlatList` de `usuarios.tsx` en un `<Animated.View>`.
    - Aplica una animación de entrada suave (`entering`) al aparecer por primera vez.
2.  **Animación de Reacomodo al Filtrar** 🔍:
    - Cuando escribas en la barra de búsqueda para filtrar usuarios, los elementos que quedan deben reacomodarse de forma suave en lugar de dar un salto brusco.
    - _Pistas_: Utiliza la propiedad `layout={Layout.springify()}` en el contenedor animado de la tarjeta.
3.  **Tarjetas con Efecto de Presión Elástica (Spring Press)** 👆:
    - Envuelve cada tarjeta en un componente interactivo (`TouchableOpacity` o `Pressable`).
    - Utiliza un `sharedValue` (por ejemplo, `scale = useSharedValue(1)`) y los hooks `useAnimatedStyle` para que, cuando el usuario mantenga presionada la tarjeta, esta reduzca su tamaño suavemente (ej. `scale.value = 0.95`) y regrese a su tamaño original al soltarla usando `withSpring`.

---

## 🎯 Mini Concepto Extra - Reto Obligatorio (Layout Condicional y Gotcha de KeyExtractor) 🎭💥

Para dominar el control de hilos y renderizados optimizados, debes cumplir los siguientes dos requisitos técnicos:

**1. Layout de Entrada Intercalado (Izquierda / Derecha):**
La animación de entrada de las tarjetas debe variar dependiendo de la posición de los datos:

- Si el usuario tiene un **ID impar**: La tarjeta debe entrar deslizándose desde la izquierda (ej. `SlideInLeft.duration(300)`).
- Si el usuario tiene un **ID par**: La tarjeta debe entrar deslizándose desde la derecha (ej. `SlideInRight.duration(300)`).

**2. Resolver el Gotcha de Re-Render y Filtros:**
Al filtrar la lista usando el `TextInput` de búsqueda, React Native destruye y recrea algunos nodos del DOM virtual. Si no manejas bien el identificador único del elemento:

- Cada vez que escribas una letra en la barra de búsqueda, la animación de entrada (`entering`) podría volverse a disparar para todas las tarjetas visibles, lo cual arruina la experiencia de usuario.
- **Tu objetivo obligatorio** es lograr que las tarjetas ya visibles permanezcan estables y solo se animen en reacomodo (`layout`), mientras que las nuevas tarjetas que entren debido al filtro ejecuten su respectiva animación de entrada. Para ello, asegúrate de que el `keyExtractor` del `FlatList` utilice de manera estricta `String(item.id)` y no el índice del mapeo de la lista.

_¡Manos a la obra! Recuerda que no puedo escribirte la solución directa, pero estaré aquí para guiarte en cada paso del proceso._
