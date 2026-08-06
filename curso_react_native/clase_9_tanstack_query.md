# Clase 9: TanStack Query / React Query (Consumo de APIs Pro) 📡

En la Clase 5 aprendimos a consumir APIs usando `fetch` y `useEffect`. Aunque funciona, rápidamente nos dimos cuenta de que requiere mucho código repetitivo: manejar estados de carga (`isLoading`), de error (`error`), guardar los datos (`data`), limpiar efectos para evitar memory leaks, y lidiar con la falta de caché.

Hoy aprenderemos a usar **TanStack Query** (antes conocido como **React Query**), la librería estándar de facto en React y React Native para sincronizar el estado del servidor con nuestra aplicación de forma profesional, eficiente y automática.

---

## 📖 Conceptos Clave

### 1. ¿Por qué TanStack Query?
*   **Caché inteligente**: Guarda las respuestas de las peticiones en memoria. Si otro componente solicita los mismos datos, los muestra instantáneamente en lugar de hacer otra petición de red.
*   **Manejo automático de estados**: Nos provee variables listas como `isLoading`, `isError`, `error`, `isRefetching` y `data`.
*   **Actualización en segundo plano**: Si los datos son viejos, hace una petición silenciosa en segundo plano para actualizar la caché sin bloquear la pantalla al usuario.
*   **Reintentos automáticos (Automatic Retries)**: Si una petición falla por problemas de red, la reintenta automáticamente un número de veces configurable antes de mostrar un error.
*   **Paginación y Scroll Infinito**: Facilita la carga de datos por páginas o listas infinitas.

### 2. Configuración Inicial (El QueryClient)
Para usar la librería, necesitamos instanciar un `QueryClient` y envolver nuestra aplicación con un `QueryClientProvider` en el punto de entrada principal (`app/app/_layout.tsx` en nuestro proyecto de Expo Router).

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tus pantallas/navegación aquí */}
    </QueryClientProvider>
  );
}
```

### 3. El Hook `useQuery`
El hook principal para traer datos (operaciones GET). Requiere dos cosas fundamentales:
*   `queryKey`: Un array único que identifica la consulta (ej. `['usuarios']` o `['usuario', userId]`). React Query usa esta clave para saber de qué datos hacer caché y cuándo invalidarlos.
*   `queryFn`: Una función asíncrona que retorna una promesa (usando `fetch`, `axios`, etc.) con los datos.

```typescript
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['posts'],
  queryFn: async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!res.ok) throw new Error('Error de red');
    return res.json();
  }
});
```

---

## 💡 El Gotcha de TanStack Query en React Native: `staleTime` por defecto ⚠️

Por defecto, TanStack Query configura el parámetro `staleTime` en **0**. Esto significa que los datos se consideran "obsoletos" de manera inmediata.

**¿Qué problema causa esto en React Native?**
Cada vez que navegas entre pantallas (haciendo que el componente se desmonte y monte) o cuando el componente cambia su estado, React Query volverá a realizar una petición HTTP en segundo plano porque considera que los datos en caché ya no son válidos. Esto puede generar un tráfico de red excesivo e innecesario.

### 🛠️ La Solución:
Configurar un `staleTime` personalizado para indicarle a React Query durante cuánto tiempo (en milisegundos) debe considerar que los datos en caché son "frescos" antes de intentar volver a pedirlos.

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: obtenerPosts,
  staleTime: 1000 * 60 * 5, // 5 minutos de caché "fresca"
});
```

---

## 🏆 El Reto de la Clase 9: Lista de Publicaciones con Caché y Pull-to-Refresh

Tu misión es crear una pantalla que cargue una lista de publicaciones desde un endpoint público, implementando las mejores prácticas de experiencia de usuario en dispositivos móviles con TanStack Query.

### Requerimientos del Reto:

1.  **Instalar TanStack Query**:
    *   Ejecuta `npm install @tanstack/react-query` dentro del directorio `app`.
2.  **Configurar el Layout**:
    *   Modifica [app/app/_layout.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/_layout.tsx) para importar y envolver la app en el `QueryClientProvider`.
3.  **Consumo de API con `useQuery`**:
    *   Crea una pantalla en `app/app/usuarios.tsx` o edita la pantalla correspondiente para mostrar una lista de usuarios de la API `https://jsonplaceholder.typicode.com/users`.
    *   Utiliza `useQuery` para manejar la carga de esta lista de forma reactiva.
4.  **Experiencia de Usuario Móvil**:
    *   Muestra un indicador de carga (`ActivityIndicator`) cuando se esté cargando por primera vez.
    *   Usa un `FlatList` para renderizar la lista de usuarios.
    *   Implementa la funcionalidad **Pull-to-Refresh** conectada al método `refetch` de `useQuery`, utilizando la variable `isRefetching` para indicar el estado de refresco visual.

---

## 🎯 Mini Concepto Extra - Reto Obligatorio (Ciclo de Vida Móvil - AppState) 📱🔋

En la Web, TanStack Query detecta de manera automática cuando el usuario vuelve a enfocar la pestaña del navegador para recargar los datos obsoletos (`refetchOnWindowFocus`). En **React Native**, esto no funciona automáticamente porque no existen pestañas de navegador ni eventos de foco tradicionales.

Para resolver esto, debemos sincronizar el estado de foco de React Query con el **`AppState`** de React Native.

**Tu reto obligatorio es:**
1.  Importar `AppState` desde `react-native`.
2.  Importar `focusManager` de `@tanstack/react-query`.
3.  Implementar un efecto global (por ejemplo, en un custom hook o en el layout) que escuche los cambios de `AppState`.
4.  Cuando el estado de la aplicación cambie a `active`, debes indicarle a TanStack Query que se ha enfocado el foco utilizando `focusManager.setFocused(true)`.

Esto asegurará que si el usuario sale de tu aplicación, entra a otra app (o bloquea el celular) y luego regresa, tu app verifique automáticamente y recargue los datos en segundo plano si ya pasó el `staleTime`. ¡Esto es lo que separa a las aplicaciones mediocres de las de nivel premium!
