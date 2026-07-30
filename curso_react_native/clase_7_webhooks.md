# Clase 7: Webhooks, n8n y Conexión en Tiempo Real con GitHub ⚓

En la clase anterior aprendiste a crear una conexión WebSocket bidireccional y persistente, resolviendo los gotchas comunes de las fugas de memoria por desmontaje y los stale closures en los callbacks. Hoy daremos el paso final del módulo de conexiones integrando **Webhooks**, usando **n8n** como motor de automatización, **ngrok** para crear túneles y mostrando eventos reales de GitHub en nuestra app móvil en tiempo real.

---

## 📖 Conceptos Clave

### 1. ¿Qué es un Webhook?
A diferencia de una API REST donde tu aplicación debe preguntar repetidamente al servidor si hay nuevos datos (polling), un **Webhook** es un mecanismo de comunicación pasiva. El servidor externo (en este caso, GitHub) realiza una petición HTTP POST activa hacia una URL que tú le proporciones en el momento exacto en que ocurre un evento (por ejemplo: alguien le da una estrella a tu repositorio, abre un issue, o sube un commit).

### 2. ngrok (Túneles Locales)
GitHub vive en la nube y necesita enviar la petición HTTP POST a un servidor en internet. Como tu entorno de desarrollo corre localmente en tu computadora (`localhost`), GitHub no puede acceder a él directamente debido al NAT y los firewalls. 
**ngrok** soluciona esto creando un túnel seguro temporal desde internet hacia tu máquina local. Te proporciona una URL pública (ej: `https://abc-123.ngrok-free.app`) que redirige todo el tráfico entrante al puerto local que tú elijas.

### 3. n8n (Automatización de Flujos)
Para no tener que procesar directamente los complejos y gigantescos JSON de GitHub en nuestra app móvil, usamos **n8n** (que corre en un contenedor Docker). n8n recibirá el webhook de GitHub, extraerá solo la información esencial y la enviará con un formato limpio a nuestro servidor relay de WebSockets.

---

## 💡 El Gotcha de Docker: `host.docker.internal` 🐳

Cuando ejecutas n8n dentro de un contenedor Docker, el contenedor tiene su propia interfaz de red aislada.
Si configuras tu nodo HTTP en n8n para enviar datos a `http://localhost:3001/event` (nuestro servidor relay), la petición **fallará**. Para el contenedor, `localhost` se refiere a sí mismo, no a tu computadora anfitriona donde corre el servidor de Node.js.

### 🛠️ La Solución:
Para comunicarte desde adentro de un contenedor Docker hacia un puerto que corre en la máquina anfitriona (host), debes utilizar el dominio especial de puente de Docker:
*   En Windows y Mac: **`http://host.docker.internal:3001/event`**
*   En Linux: Dependerá de la configuración del daemon, pero generalmente se requiere mapear la IP de la puerta de enlace (`172.17.0.1`).

---

## 🏆 El Reto de la Clase 7: Radar de Actividad de GitHub en Tiempo Real

Tu misión es conectar tu repositorio de GitHub con tu aplicación de React Native a través de n8n y tu servidor relay local. Al final de esta clase, cuando hagas una acción en tu GitHub (como darle Star a tu propio repositorio), el evento debe aparecer en tu celular en menos de un segundo.

### Requerimientos del Reto:

1.  **Levantar el Entorno Local**:
    *   Levanta n8n usando Docker Compose en la raíz del proyecto.
    *   Ejecuta el servidor relay de node en la carpeta [relay](file:///C:/Users/Desk/git/multiStack/Placeholdername/relay) en el puerto `3001`.
2.  **Configurar ngrok**:
    *   Usa ngrok para exponer el puerto `5678` de n8n a internet. Copia la URL pública generada.
3.  **Configurar el Flujo en n8n**:
    *   Crea un flujo en n8n que tenga un nodo **Webhook** (de tipo POST) y un nodo **HTTP Request** (POST).
    *   Mapea los datos del webhook de GitHub al formato simplificado que espera tu relay. El payload del POST hacia el relay debe verse así:
        ```json
        {
          "event": "star", // o "issue", "push", etc.
          "repo": "nombre-del-repo",
          "actor": "usuario-github",
          "timestamp": 1722288000000
        }
        ```
    *   Exporta el flujo final a [n8n-workflow.json](file:///C:/Users/Desk/git/multiStack/Placeholdername/n8n-workflow.json).
4.  **Configurar el Webhook en GitHub**:
    *   Ve a la configuración de un repositorio tuyo de prueba en GitHub.
    *   Crea un Webhook apuntando a tu URL de ngrok (recuerda usar la URL del Webhook de n8n, típicamente finaliza en `/webhook/github-webhook`). Selecciona el formato `application/json`.
5.  **Crear la pantalla de visualización**:
    *   Crea un archivo nuevo: [app/app/radar.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/radar.tsx).
    *   Establece la conexión WebSocket con tu servidor relay (`ws://10.0.2.2:3001` si usas emulador Android, o tu IP local en red).
    *   Muestra una interfaz de feed premium con los eventos entrantes.
    *   Usa colores y estilos sofisticados (por ejemplo, fondo oscuro, tarjetas con bordes delgados de colores y bordes redondeados).
6.  **Actualizar la navegación**:
    *   Agrega un acceso directo elegante en tu pantalla de inicio [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) que redirija a `/radar`.

---

## 🎯 Mini Concepto Extra - Reto Obligatorio (Filtro y Contadores) ⚠️

Para validar que dominas el estado y renderizado condicional, debes añadir dos características adicionales a la pantalla del Radar:
1.  **Filtros de Eventos en Tiempo Real**: Añade una fila de botones o chips en la parte superior que permita filtrar la lista de eventos en pantalla por tipo: `"Todos"`, `"Estrellas"`, `"Issues"`, o `"Commits"`.
2.  **Métricas de Sesión**: Añade un pequeño panel en la parte superior que muestre el contador total acumulado de eventos recibidos de cada tipo durante la sesión activa de la app (ej: `⭐ 3 | 🐛 1 | 🚀 5`).
3.  **Gotcha del Formato de Emojis**: Asegúrate de mapear dinámicamente cada tipo de evento a un color y emoji particular. Si recibes un tipo de evento desconocido, debes mapearlo a un estado por defecto (`❓ Evento Desconocido`) sin romper la UI.

---

## 🔗 Código de Ejemplo

Para ver una guía de cómo estructurar la conexión con el servidor relay, procesar eventos entrantes y formatearlos elegantemente, consulta:
*   [curso_react_native/ejemplos/Clase7_Webhooks.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase7_Webhooks.tsx)
