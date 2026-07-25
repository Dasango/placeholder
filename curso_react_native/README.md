# Curso Completo de React Native (Desde Cero a Conexión Backend)

¡Bienvenido! Este curso está diseñado para que aprendas React Native paso a paso de la forma más sencilla y práctica posible. Como ya tienes un proyecto de Expo configurado en tu carpeta `app/`, utilizaremos esa misma estructura para que puedas probar el código real en tu emulador o dispositivo físico.

## 🚀 Método de Aprendizaje
Iremos **uno por uno**. Cada clase tendrá:
1. 📖 **Explicación teórica** simple y directa.
2. 💻 **Código de ejemplo completamente comentado** que podrás copiar directamente a tu archivo `app/app/index.tsx` para verlo funcionar inmediatamente.
3. 📝 **Un ejercicio práctico** para resolver antes de pasar al siguiente tema.

---

## 🗺️ Mapa de Ruta (Syllabus)

### 📁 Módulo 1: Fundamentos de React Native
*   **Clase 1: Componentes Básicos y Estilos** ➔ `View`, `Text`, `TextInput`, `TouchableOpacity`, scroll y layouts básicos con Tailwind CSS (NativeWind).
*   **Clase 2: Estado (`useState`) y Propiedades (`props`)** ➔ Cómo hacer que tu app sea interactiva y cómo pasar datos entre componentes.
*   **Clase 3: El ciclo de vida (`useEffect`)** ➔ Cuándo y cómo se ejecuta el código en segundo plano, ideal para cargar datos al abrir la pantalla.

### 📁 Módulo 2: Navegación y Estructura
*   **Clase 4: Navegación con Expo Router** ➔ Crear pantallas múltiples, ir de una a otra y pasar parámetros en la URL.

### 📁 Módulo 3: Conectividad y Backend (El núcleo de tu petición)
*   **Clase 5: Consumir APIs y Backends (Peticiones HTTP)** ➔ Cómo usar `fetch` para traer información de Internet, mostrarla en un `FlatList` (lista optimizada) y enviar datos a un backend (POST).
*   **Clase 6: WebSockets (Comunicación en tiempo real)** ➔ Cómo conectar tu app a servicios en tiempo real (chats, notificaciones instantáneas) de la forma más fácil con librerías nativas.
*   **Clase 7: Webhooks, Servicios de Terceros y Buenas Prácticas** ➔ Qué son los webhooks en el ecosistema móvil, cómo integrar APIs de terceros y cómo estructurar tu código para que sea ultra limpio.

### 📁 Módulo 4: Librerías "Épicas" e Imprescindibles (React y React Native)
*   **Clase 8: Zustand (Gestión de Estado Global)** ➔ Olvídate de Redux. Zustand es la forma más moderna, simple y rápida de compartir información entre cualquier pantalla de tu app sin complicarte con props.
*   **Clase 9: TanStack Query / React Query (Consumo Inteligente de APIs)** ➔ La forma profesional de llamar a APIs. Te da caché automática, refresco en tiempo real, estados de carga y manejo de errores con una sola línea de código.
*   **Clase 10: React Hook Form + Zod (Formularios y Validaciones)** ➔ Administra campos de texto de manera súper limpia. Zod te permite crear reglas de validación (ej. "el email debe ser válido y la contraseña de 8 caracteres") con código legible y rápido.
*   **Clase 11: Framer Motion (Web) / Reanimated (Mobile) (Animaciones Pro)** ➔ Cómo crear micro-animaciones y efectos visuales de nivel premium con el menor esfuerzo posible.

---

## 🛠️ Cómo Probar los Ejemplos
Para cada clase, te daré un archivo `.tsx` que guardaremos en `curso_react_native/ejemplos/`.
Para verlo en acción:
1. Copia todo el contenido del ejemplo de la clase.
2. Pégalo en tu archivo [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx).
3. Abre tu terminal en `app/` y corre `npm run start` o `npx expo start` para verlo en tu celular o simulador.

¡Comencemos con la **Clase 1**! Escribe en el chat cuando estés listo para avanzar o si tienes dudas sobre esta estructura.
