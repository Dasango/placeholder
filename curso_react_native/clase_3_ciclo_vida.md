# Clase 3: Ciclo de Vida y Efectos (`useEffect`)

En la clase anterior aprendiste a gestionar el estado interno con `useState` y a pasar datos entre componentes mediante `props`. Hoy daremos un paso gigante: aprenderemos cómo conectar nuestros componentes con el "mundo exterior" (timers, suscripciones de eventos, peticiones HTTP) y controlar qué pasa en momentos clave de su ciclo de vida.

---

## 📖 Conceptos Clave

### 1. El Ciclo de Vida en Componentes Funcionales
En el pasado, React usaba clases con métodos complejos como `componentDidMount`, `componentDidUpdate` y `componentWillUnmount`. Hoy, en los componentes funcionales modernos, controlamos todo esto con un solo Hook unificado: **`useEffect`**.

`useEffect` le dice a React que tu componente necesita realizar una acción (o "efecto secundario") después de renderizarse en pantalla.

### 2. Anatomía de `useEffect`
La estructura básica de `useEffect` es la siguiente:

```tsx
import React, { useEffect } from 'react';

useEffect(() => {
  // 1. Aquí escribes tu "efecto secundario"
  console.log("El componente se ha renderizado");

  return () => {
    // 2. Aquí escribes la "función de limpieza" (cleanup)
    console.log("Limpieza del efecto");
  };
}, [/* 3. Array de dependencias */]);
```

El comportamiento de `useEffect` cambia drásticamente según lo que pongas en su **Array de Dependencias**:

| Array de Dependencias | ¿Cuándo se ejecuta el efecto? | ¿Para qué sirve? |
| :--- | :--- | :--- |
| **Ausente** (no poner corchetes) | En **cada** renderizado del componente. | Rápido debugging (evitar en producción para tareas costosas). |
| **Vacío** `[]` | Solo **una vez**, después del primer renderizado (Montaje). | Cargar datos de una API al iniciar la pantalla, configurar listeners, suscripciones. |
| **Con variables** `[estado, prop]` | En el montaje, y **cada vez** que cambie cualquiera de esas variables. | Reactivar búsquedas cuando el usuario escribe en un buscador, sincronizar estados. |

---

## 🧹 La Función de Limpieza (Cleanup)

Cuando creas temporizadores (`setInterval`, `setTimeout`), te suscribes a eventos del sistema, o abres conexiones en tiempo real (WebSockets), estas conexiones siguen consumiendo memoria del teléfono incluso si el usuario cambia de pantalla.

Para evitar esto (lo que llamamos fugas de memoria o **Memory Leaks**), React nos permite retornar una **función de limpieza** al final de `useEffect`:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    console.log("Mensaje después de 3 segundos");
  }, 3000);

  // Limpieza: se ejecuta cuando el componente se desmonta o antes de ejecutar el efecto de nuevo
  return () => {
    clearTimeout(timer);
  };
}, []);
```

---

## 💡 Mini Concepto Extra: El Gotcha del "Stale Closure" (Estado Atrapado)

Este es uno de los errores más comunes y frustrantes al usar `useEffect` con temporizadores. Analiza este código:

```tsx
const [contador, setContador] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    // ¡GOTCHA! Aquí 'contador' siempre vale 0 (el valor del montaje)
    setContador(contador + 1); 
  }, 1000);

  return () => clearInterval(interval);
}, []); // Array vacío
```

**¿Por qué no pasa de 1?**
Porque el callback de `setInterval` fue creado una sola vez en el montaje de la pantalla. En ese instante, `contador` valía `0`. El intervalo queda "atrapado" con la foto (closure) de esa variable en el momento inicial y sigue haciendo `setContador(0 + 1)` perpetuamente.

### 🛠️ Las 2 Soluciones a este Gotcha:

1.  **Usar la función actualizadora (Recomendado)**:
    Si tu estado nuevo depende del anterior, pásale una función callback a la actualizadora. Así React siempre le inyectará el valor más fresco del estado:
    ```tsx
    setContador(prevContador => prevContador + 1);
    ```
2.  **Agregar el estado a las dependencias**:
    Si agregas `[contador]` al array, el efecto se destruirá y se volverá a crear con el nuevo valor en cada incremento. (Nota: para timers esto puede ser ineficiente si no es necesario, pero es útil para otros efectos).

---

## 🏆 El Reto de la Clase 3: Implementar un Contador de Permanencia en Pepe

Tu misión es ir a tu tarjeta de Pepe en [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) y añadir un sistema que cuente cuántos segundos lleva el usuario visualizando su perfil.

### Requerimientos:
1.  **Estado para el Tiempo**:
    *   Crea una variable de estado llamada `tiempoActivo` inicializada en `0`.
2.  **useEffect con Timer**:
    *   Implementa un `useEffect` que configure un intervalo (`setInterval`) que sume `1` a `tiempoActivo` cada segundo (1000 ms).
    *   **Obligatorio**: Debes retornar la función de limpieza correspondiente con `clearInterval` para evitar que el timer se duplique o siga corriendo en segundo plano.
    *   **Evita el Stale Closure**: Asegúrate de usar la técnica correcta explicada arriba para que el contador no se quede atascado en `1`.
3.  **UI Premium**:
    *   Muestra el tiempo activo en la tarjeta de perfil con un diseño elegante. Por ejemplo: una pequeña insignia que diga `⏱️ Activo: X seg` o `Tiempo en pantalla: Xs`.
    *   Usa clases de Tailwind/NativeWind para que combine con el diseño oscuro de Pepe (por ejemplo, texto verde menta o gris claro con un fondo sutil).

---

## 🔗 Código de Ejemplo

Para guiarte en el uso práctico del ciclo de vida y peticiones simuladas, hemos creado un ejemplo completo y funcional en:
[curso_react_native/ejemplos/Clase3_CicloVida.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase3_CicloVida.tsx)
