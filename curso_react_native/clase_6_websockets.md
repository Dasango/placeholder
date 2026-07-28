# Clase 6: WebSockets (Comunicación en tiempo real fácil) ⚡

En la clase anterior aprendiste a consumir APIs REST de forma convencional, implementando el manejo estricto de estados (`loading`, `error`, `success`) y resolviendo el gotcha de la validación manual de respuestas HTTP en `fetch`. Hoy aprenderemos cómo crear canales de comunicación bidireccional y persistente utilizando **WebSockets**.

---

## 📖 Conceptos Clave

### 1. ¿Qué es un WebSocket y por qué usarlo?
A diferencia de las peticiones HTTP tradicionales (donde el cliente inicia una consulta y el servidor responde una sola vez), un **WebSocket** abre una conexión continua y activa. Esto permite que tanto el cliente como el servidor se envíen datos mutuamente en cualquier momento con muy baja latencia.

Es ideal para:
-   Aplicaciones de Chat.
-   Notificaciones en tiempo real.
-   Actualizaciones de datos en vivo (gráficos de bolsa, mapas de repartidores, etc.).

### 2. La API de WebSockets en React Native
React Native proporciona soporte nativo para la API estándar de **`WebSocket`**, la misma que se usa en el navegador web. No necesitas librerías externas para usar WebSockets básicos.

#### Ciclo de vida básico en JS:
```tsx
// Crear conexión
const ws = new WebSocket('wss://echo.websocket.events');

// Eventos
ws.onopen = () => console.log('Conexión abierta');
ws.onmessage = (event) => console.log('Mensaje recibido:', event.data);
ws.onerror = (error) => console.error('Error de conexión:', error.message);
ws.onclose = (event) => console.log('Conexión cerrada', event.code, event.reason);

// Enviar datos
ws.send('Hola Servidor!');

// Cerrar conexión
ws.close();
```

---

## 💡 El Gotcha de las Conexiones Fantasma 👻 y Stale Closures

Al trabajar con WebSockets en React, hay dos errores catastróficos muy comunes:

### Gotcha 1: Conexiones Huérfanas (Fugas de memoria)
Si creas una conexión WebSocket dentro de un componente y el usuario sale de esa pantalla (se desmonta el componente), la conexión WebSocket **sigue abierta en segundo plano en el teléfono**. Si el usuario vuelve a entrar a la pantalla, se creará una *segunda* conexión y así sucesivamente.
Esto consume batería, ancho de banda y hace que los listeners de mensajes se multipliquen, causando comportamientos erráticos.

#### 🛠️ La Solución:
Siempre debes cerrar la conexión en la **función de limpieza (cleanup)** del `useEffect`:

```tsx
useEffect(() => {
  const ws = new WebSocket('wss://echo.websocket.events');
  
  // ... configurar eventos ...

  return () => {
    ws.close(); // Cerramos la conexión al desmontar
  };
}, []);
```

### Gotcha 2: Stale Closures en los Mensajes
Si tienes un estado `const [mensajes, setMensajes] = useState([])` y en tu handler `ws.onmessage` intentas hacer:
```tsx
ws.onmessage = (event) => {
  setMensajes([...mensajes, event.data]); // ¡GOTCHA! mensajes siempre estará vacío o desactualizado
};
```
Como el callback de `onmessage` captura el estado inicial en el montaje, no tiene acceso a los valores actualizados de `mensajes`.

#### 🛠️ La Solución:
Utiliza la **función actualizadora** de estado para inyectar la lista más reciente:
```tsx
ws.onmessage = (event) => {
  setMensajes(prevMensajes => [...prevMensajes, event.data]);
};
```

---

## 🏆 El Reto de la Clase 6: Sala de Chat en Tiempo Real Echo

Tu misión es crear una interfaz de chat interactiva que se conecte a un servidor de WebSockets eco público (`wss://echo.websocket.events`), el cual te devuelve inmediatamente todo mensaje que le envíes.

### Requerimientos:

1.  **Crear el archivo de destino**:
    *   Crea una pantalla nueva en tu carpeta de rutas: [app/app/chat.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/chat.tsx).
2.  **Gestionar la conexión WebSocket**:
    *   Crea la conexión en un `useEffect`.
    *   Gestiona y muestra el **estado de la conexión** en la UI con colores premium:
        *   `CONECTANDO` ➔ Amarillo (ej: "Conectando al servidor...")
        *   `CONECTADO` ➔ Verde (ej: "En línea")
        *   `DESCONECTADO` ➔ Rojo (ej: "Desconectado")
    *   Asegúrate de cerrar la conexión cuando el usuario abandone la pantalla.
3.  **Enviar y Recibir Mensajes**:
    *   Crea un `TextInput` en la parte inferior para escribir el mensaje y un botón de "Enviar".
    *   El botón de Enviar debe estar deshabilitado si la conexión está cerrada o si el texto está vacío.
    *   Al recibir un mensaje del servidor, agrégalo a la lista utilizando la función actualizadora de estado para evitar *stale closures*.
4.  **Diseño Interactivo Premium**:
    *   Diferencia visualmente en la lista los mensajes enviados por el usuario de los mensajes que devuelve el servidor (ej. globos de chat a la derecha en color esmeralda para el usuario, y a la izquierda en gris/oscuro para el servidor).
    *   Añade un botón de "Desconectar / Conectar" en el header para permitir al usuario interactuar manualmente con el ciclo de vida del socket.
5.  **Actualizar la navegación**:
    *   Agrega un enlace o botón estilizado en tu pantalla de inicio [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) que navegue hacia `/chat`.

---

## 🔗 Código de Ejemplo

Para ver una guía de cómo configurar la conexión, sincronizar el estado del WebSocket en React y realizar el cleanup de forma segura, consulta:
-   [curso_react_native/ejemplos/Clase6_WebSockets.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase6_WebSockets.tsx)
