# Clase 8: Zustand (Estado Global Moderno) 🐻

Hasta ahora hemos manejado el estado local utilizando el hook `useState` y pasándolo mediante `props` (prop-drilling) o navegando con parámetros en la URL de Expo Router. Sin embargo, cuando la aplicación crece y múltiples pantallas o componentes necesitan compartir y actualizar la misma información (como el perfil de un usuario, el tema visual, o un carrito de compras), el estado local se vuelve insuficiente.

Hoy aprenderemos **Zustand**, la librería de manejo de estado global más popular, rápida y minimalista en el ecosistema moderno de React y React Native.

---

## 📖 Conceptos Clave

### 1. ¿Por qué Zustand? (vs Redux / Context API)
*   **React Context**: Es excelente para datos que cambian poco (como el idioma o el tema), pero no está optimizado para actualizaciones frecuentes. Si el valor del Context cambia, todos los componentes que lo consumen se vuelven a renderizar, lo que afecta el rendimiento.
*   **Redux**: Es potente pero requiere una inmensa cantidad de código repetitivo (boilerplate) como Actions, Reducers, Action Creators, Types y Providers.
*   **Zustand**: Define el estado global en una única función simple (un "store"). No requiere envolver tu aplicación en ningún `<Provider>` y proporciona hooks listos para usarse de inmediato.

### 2. Creación de un Store
Un store de Zustand se crea con la función `create` y define tanto el estado (variables) como las acciones (funciones que modifican ese estado).

```typescript
import { create } from 'zustand';

interface ContadorState {
  contador: number;
  incrementar: () => void;
  resetear: () => void;
}

export const useContadorStore = create<ContadorState>((set) => ({
  contador: 0,
  incrementar: () => set((state) => ({ contador: state.contador + 1 })),
  resetear: () => set({ contador: 0 }),
}));
```

---

## 💡 El Gotcha de Zustand: Re-renders Innecesarios y Selectores ⚠️

Un error extremadamente común al usar Zustand es importar todo el store en un componente de la siguiente manera:

```typescript
// ❌ MAL: Causa re-renders si CUALQUIER elemento del store cambia
const estado = useContadorStore();
console.log(estado.contador);
```

Si haces esto, tu componente se volverá a renderizar cada vez que cambie *cualquier* variable en el store, incluso si ese componente específico no la utiliza.

### 🛠️ La Solución (Uso de Selectores):
Debes extraer únicamente el fragmento de estado o la acción que necesitas mediante una función selectora:

```typescript
//  BIEN: Solo re-renderiza cuando 'contador' cambia
const contador = useContadorStore((state) => state.contador);
const incrementar = useContadorStore((state) => state.incrementar);
```

---

## 🏆 El Reto de la Clase 8: Store Global de Preferencias y Tema de la App

Tu misión es implementar un **Store Global** que guarde las preferencias del usuario (nombre de usuario, foto de perfil y modo de color claro/oscuro) y que sea consumido y actualizado desde múltiples pantallas.

### Requerimientos del Reto:

1.  **Instalar Zustand**:
    *   Ejecuta `npm install zustand` dentro de la carpeta `app`.
2.  **Crear el Store de Preferencias**:
    *   Crea un archivo `app/store/userStore.ts`.
    *   Define una interfaz con las propiedades: `username` (string), `profileImage` (string), `isDarkMode` (boolean), y las acciones para actualizar cada una (ej. `setUsername`, `toggleTheme`).
3.  **Consumir el Estado en las Pantallas**:
    *   **En la pantalla de Inicio (`index.tsx`)**: Muestra el nombre del usuario y su foto de perfil directamente desde el store de Zustand en la tarjeta de perfil.
    *   **En la pantalla de Detalles o Configuración**: Añade inputs para cambiar el nombre de usuario y un switch/botón para alternar el modo oscuro (`isDarkMode`).
4.  **Sincronizar el Tema Visual**:
    *   Usa el estado `isDarkMode` del store para aplicar dinámicamente colores de fondo claro u oscuro a la interfaz de la aplicación de manera global.

---

## 🎯 Mini Concepto Extra - Reto Obligatorio (Persistencia Local) 💾

Para asegurar que los datos del usuario no se pierdan cuando cierre y vuelva a abrir la aplicación:
1.  Utiliza el middleware `persist` integrado de Zustand junto con un adaptador de almacenamiento para React Native.
2.  Dado que `@react-native-async-storage/async-storage` es el estándar en React Native, impórtalo e intégralo en el middleware de Zustand.
3.  **Gotcha de Hidratación**: Ten en cuenta que en entornos híbridos o con Expo Router, la lectura desde el almacenamiento es asíncrona. Asegúrate de que tu aplicación maneje correctamente el estado inicial antes de que el store termine de hidratarse del almacenamiento local.
