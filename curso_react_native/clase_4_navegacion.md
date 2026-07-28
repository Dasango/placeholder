# Clase 4: Navegación con Expo Router 🗺️

En la clase anterior aprendiste a controlar el ciclo de vida de tus componentes y a evitar problemas de "Stale Closures" al usar timers con `useEffect`. En esta clase aprenderemos cómo estructurar una app móvil con múltiples pantallas utilizando **Expo Router**, la librería de navegación moderna recomendada por Expo.

---

## 📖 Conceptos Clave

### 1. ¿Qué es Expo Router?
A diferencia de React Navigation tradicional (donde configuras la navegación escribiendo código imperativo y registrando pantallas manualmente en un objeto), **Expo Router** utiliza un sistema de **enrutamiento basado en archivos (File-based Routing)**, similar a Next.js en la Web.

Cada archivo que creas dentro de la carpeta `/app` (o en tu caso `/app/app`) se convierte automáticamente en una pantalla (ruta) de tu aplicación móvil.

### 2. Estructura de Rutas y Layouts
Veamos un ejemplo de estructura de archivos típica:
-   `app/_layout.tsx` ➔ Define el contenedor raíz de navegación (ej: un Stack o un Tab bar) que envuelve a todas las pantallas.
-   `app/index.tsx` ➔ Es la pantalla inicial (`/`), equivalente a la ruta raíz.
-   `app/detalles.tsx` ➔ Es la pantalla `/detalles`.
-   `app/usuario/[id].tsx` ➔ Es una ruta dinámica (ej: `/usuario/123` o `/usuario/pepe`).

En tu proyecto, la navegación raíz ya está configurada en `_layout.tsx` utilizando un `<Stack />`:
```tsx
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return <Stack />;
}
```
Esto significa que cualquier pantalla nueva que agregues a tu carpeta `app/app/` heredará automáticamente la navegación de tipo Stack (pila de pantallas, donde una se apila sobre otra con una transición lateral y botón de retroceso automático).

---

## 🚀 Navegación en Acción

Hay dos formas principales de navegar entre pantallas en Expo Router:

### A. Navegación Declarativa con `<Link>`
El componente `<Link>` es la forma más limpia y recomendada para botones de navegación simples.
```tsx
import { Link } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <Link href="/detalles" asChild>
      <TouchableOpacity className="bg-emerald-500 p-3 rounded-lg">
        <Text className="text-black font-bold">Ver Detalles</Text>
      </TouchableOpacity>
    </Link>
  );
}
```
> [!NOTE]
> Usar `asChild` es fundamental cuando envuelves componentes táctiles personalizados como `TouchableOpacity`. Le dice al `Link` que inyecte su funcionalidad de click directamente en el componente hijo en lugar de crear un elemento contenedor extra.

### B. Navegación Imperativa con `router`
Ideal cuando necesitas ejecutar lógica de negocio antes de navegar (ej. validar un formulario o guardar datos).
```tsx
import { router } from 'expo-router';
import { Button } from 'react-native';

function handleLogin() {
  // Lógica de autenticación...
  router.push('/detalles');
}
```

#### Métodos principales del objeto `router`:
1.  `router.push('/ruta')` ➔ Agrega una nueva pantalla encima de la pila actual. El usuario puede volver atrás.
2.  `router.replace('/ruta')` ➔ Reemplaza la pantalla actual en el historial. Es útil para flujos como Login ➔ Dashboard, evitando que el usuario vuelva a ver la pantalla de login al pulsar atrás.
3.  `router.back()` ➔ Vuelve a la pantalla anterior en la pila.

---

## 📥 Pasar Parámetros por URL

Para enviar datos a otra pantalla, puedes pasarlos en forma de Query Parameters:

### 1. Enviar parámetros:
```tsx
router.push({
  pathname: '/detalles',
  params: { nombre: 'Pepe', rol: 'Desarrollador' }
});

// O de manera compacta usando strings:
router.push('/detalles?nombre=Pepe&rol=Desarrollador');
```

### 2. Recibir parámetros:
En la pantalla de destino, usa el Hook **`useLocalSearchParams`** para leer los datos.
```tsx
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function Detalles() {
  const { nombre, rol } = useLocalSearchParams();

  return (
    <Text className="text-white">Nombre: {nombre}, Rol: {rol}</Text>
  );
}
```

---

## 💡 Mini Concepto Extra y Gotchas Comunes ⚠️

### 1. El Gotcha de la Coerción de Tipos en Parámetros
En las URLs móviles, al igual que en la Web, **todos los parámetros que viajan por la URL se transmiten como texto (strings)**.
Si envías un número o un booleano, cuando lo recibas en `useLocalSearchParams` será un string:
```tsx
// Enviando:
router.push('/detalles?likes=42&siguiendo=true');

// Recibiendo:
const { likes, siguiendo } = useLocalSearchParams();

console.log(typeof likes);     // "string" (no number)
console.log(typeof siguiendo); // "string" (no boolean)
```

**Consecuencias de este gotcha:**
-   Si haces `likes + 1`, obtendrás `"421"` en lugar de `43`. Debes castearlo con `parseInt(likes as string, 10)`.
-   Si haces `if (siguiendo)` para mostrar un botón, **siempre dará true**, porque `"false"` es un string con texto y en JS cualquier string no vacío es evaluado como verdadero (truthy). Debes verificarlo explícitamente: `const esSiguiendo = siguiendo === 'true'`.

### 2. Personalizar la barra superior (Header) con `<Stack.Screen>`
Expo Router te permite configurar cómo se ve la barra de navegación superior directamente en el propio componente de la pantalla usando `<Stack.Screen>`:
```tsx
import { Stack } from 'expo-router';

export default function Detalles() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Detalle de Usuario",
          headerStyle: { backgroundColor: '#161b22' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      {/* Contenido de tu pantalla aquí */}
    </>
  );
}
```

---

## 🏆 El Reto de la Clase 4: Perfil Detallado de Pepe

Tu misión es crear una navegación fluida que lleve al usuario desde la pantalla principal a una pantalla de detalles elegante para el perfil de Pepe.

### Requerimientos:

1.  **Crear el archivo de destino**:
    *   Crea una pantalla nueva en tu carpeta de rutas: [app/app/detalles.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/detalles.tsx).
2.  **Configurar la navegación desde el Home**:
    *   En tu archivo principal [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx), añade un botón premium en la tarjeta de Pepe que diga **"Ver Detalles Completos ➔"**.
    *   Al presionarlo, navega a `/detalles` pasando como parámetros: `nombre`, `rol`, `tiempoActivo` (¡pásalo!), `siguiendo` y `likes`.
3.  **Implementar la pantalla de Detalles**:
    *   En `detalles.tsx`, extrae los parámetros usando `useLocalSearchParams`.
    *   **Resuelve el Gotcha de Tipos**: Convierte `likes` a entero y `siguiendo` a booleano de forma segura.
    *   **Configura el Header**: Usa `<Stack.Screen>` para poner el título de la pantalla como `"Perfil de [Nombre]"` (ej: *Perfil de Pepe*).
    *   **Diseño Premium (Dark Mode)**:
        *   Muestra toda la información de Pepe con un diseño de alta fidelidad: su avatar grande, su nombre, rol, y los segundos que estuvo activo en la pantalla anterior.
        *   Crea un botón o elemento interactivo para volver atrás usando `router.back()`.
4.  **REGLA DE CONFLICTO DE ESTADO (OPCIONAL/PRO)**:
    *   ¿Qué pasa si cambias el estado de "Siguiendo" en la pantalla de detalles? Como el estado local de la pantalla de detalles no está sincronizado con el Home, al volver atrás verás el valor antiguo. No te preocupes por sincronizarlo globalmente todavía (eso lo resolveremos en la clase de **Zustand**), pero asegúrate de que visualmente funcione y que expliques en un comentario cómo el tipado y el parsing resolvieron el gotcha de los booleanos.

---

## 🔗 Código de Ejemplo

Para guiarte en cómo estructurar una app con múltiples archivos y pasar parámetros de navegación, puedes consultar los archivos de referencia creados en la carpeta de ejemplos:
-   [curso_react_native/ejemplos/Clase4_EjemploHome.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase4_EjemploHome.tsx)
-   [curso_react_native/ejemplos/Clase4_EjemploDetalles.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase4_EjemploDetalles.tsx)
