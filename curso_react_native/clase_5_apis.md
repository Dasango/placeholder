# Clase 5: Consumir APIs y Backend (Peticiones HTTP simples) 🌐

En la clase anterior aprendiste a crear una navegación fluida utilizando **Expo Router** y a pasar datos de una pantalla a otra resolviendo el gotcha de la coerción de tipos. Hoy conectaremos nuestra aplicación móvil con el exterior consumiendo servicios y APIs REST a través de peticiones HTTP.

---

## 📖 Conceptos Clave

### 1. ¿Cómo se consumen APIs en React Native?
Al igual que en el navegador web, en React Native contamos con la API nativa **`fetch`** globalmente disponible. No es necesario instalar librerías externas para realizar peticiones HTTP básicas, aunque en proyectos grandes es común ver `axios` o soluciones avanzadas como `TanStack Query` (que veremos en la Clase 9).

### 2. Los 3 Estados Fundamentales del Consumo de Datos
Toda petición de red es asíncrona y puede demorarse o fallar debido a problemas de conexión. Para ofrecer una experiencia de usuario premium, siempre debemos gestionar tres estados en nuestra UI:
1.  **Cargando (`loading`)**: Se muestra un spinner (`ActivityIndicator`) o un esqueleto visual mientras los datos viajan por la red.
2.  **Éxito (`data`)**: Se renderizan los datos una vez recibidos.
3.  **Error (`error`)**: Se muestra un mensaje amigable y una opción para reintentar si algo sale mal (sin conexión, error de servidor, etc.).

Estructura de estados típica:
```tsx
const [datos, setDatos] = useState<any[]>([]);
const [cargando, setCargando] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

---

## 🚀 Petición Básica con `useEffect`

Para ejecutar la petición de red inmediatamente cuando la pantalla se monta, disparamos nuestra función asíncrona dentro de un `useEffect` con un array de dependencias vacío `[]`:

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function MiComponente() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch('https://api.github.com/users/octocat');
        const json = await respuesta.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#10b981" />;
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-white">Usuario: {data?.login}</Text>
    </View>
  );
}
```

---

## 💡 Mini Conceptos Extras y Gotchas Comunes ⚠️

### Gotcha 1: `fetch` NO lanza errores en códigos de estado HTTP incorrectos (4xx, 5xx)
Este es un error clásico. Muchos desarrolladores asumen que si el servidor devuelve un error `404 Not Found` o `500 Internal Server Error`, la promesa de `fetch` se rechazará e irá al bloque `catch`. **Esto es falso.**
`fetch` solo falla a nivel de red (por ejemplo, si el dispositivo no tiene internet o el dominio no existe). Si el servidor responde con un error HTTP, la petición se resuelve correctamente.

#### 🛠️ La Solución:
Debes verificar manualmente la propiedad **`response.ok`** (que es verdadera si el código de estado está en el rango 200-299) antes de parsear los datos. Si no está ok, lanza un error manualmente para que caiga en el bloque `catch`.

```tsx
const respuesta = await fetch('https://api.example.com/data');

if (!respuesta.ok) {
  throw new Error(`Error en el servidor: ${respuesta.status}`);
}

const datos = await respuesta.json();
```

### Gotcha 2: El Mito de `localhost` en Emuladores Móviles (Android vs iOS)
Si estás desarrollando un backend en tu propia computadora (por ejemplo, en `http://localhost:3000`) e intentas hacerle una petición desde tu emulador:
-   **En Android Emulator**: El emulador es una máquina virtual aislada. Si escribes `localhost`, ¡el emulador se buscará a sí mismo! Para acceder al servidor de tu computadora anfitriona, debes usar la dirección IP de puente especial: **`http://10.0.2.2:3000`**.
-   **En iOS Simulator**: El simulador de iOS comparte la red con la Mac, por lo que `http://localhost:3000` sí funciona. Sin embargo, para que funcione en ambos y en dispositivos físicos reales, lo ideal es usar la IP local de tu máquina en la red local (ej. `http://192.168.1.50:3000`).

---

## 🏆 El Reto de la Clase 5: Buscador y Listado de Usuarios Premium

Tu reto es crear una nueva pantalla en tu aplicación para buscar y desplegar usuarios reales desde una API pública, implementando un diseño de alta calidad y resolviendo de forma segura el control de estados de red.

### Requerimientos:

1.  **Crear el archivo de destino**:
    *   Crea una pantalla nueva en tu carpeta de rutas: [app/app/usuarios.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/usuarios.tsx).
2.  **Consumo de la API**:
    *   Realiza una petición HTTP `GET` a la API de pruebas: `https://jsonplaceholder.typicode.com/users`.
    *   Carga la lista cuando la pantalla se monte.
3.  **Implementar los 3 Estados (UI Premium)**:
    *   **Loading**: Muestra un spinner (`ActivityIndicator`) centrado y un texto que diga `"Obteniendo usuarios..."`.
    *   **Error**: Simula un error (puedes cambiar momentáneamente la URL por una rota como `https://jsonplaceholder.typicode.com/users-error`) y muestra una tarjeta visual de error llamativa con un botón estilizado de **"Reintentar Petición 🔄"** que intente cargar los datos de nuevo.
    *   **Éxito**: Muestra los usuarios en una lista elegante (`FlatList` o `ScrollView`). Cada tarjeta de usuario debe incluir su nombre completo, nombre de usuario (ej: `@pepe`), correo electrónico y el nombre de la compañía donde trabaja.
4.  **Buscador en Tiempo Real (Filtro)**:
    *   Añade un `TextInput` en la parte superior para filtrar los usuarios por su **nombre** de forma interactiva a medida que el usuario escribe.
    *   Si la búsqueda no arroja resultados, muestra un mensaje amigable como `"No se encontraron usuarios con ese nombre"`.
5.  **Mini Concepto Extra - Manejo de Errores Estricto**:
    *   Asegúrate de validar `response.ok` y arrojar un error adecuado si la API falla.
    *   Añade un botón de "Refrescar" o implementa "Pull to Refresh" en la lista usando la propiedad `refreshing` y `onRefresh` del `FlatList` o `ScrollView`.
6.  **Actualizar Navegación**:
    *   Agrega un enlace o botón elegante en tu pantalla de inicio [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) que permita navegar hacia `/usuarios`.

---

## 🔗 Código de Ejemplo

Para ver cómo estructurar los estados de carga, éxito y error con un botón de reintento, consulta el archivo de referencia:
-   [curso_react_native/ejemplos/Clase5_APIs.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase5_APIs.tsx)
