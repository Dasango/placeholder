# Clase 2: Estado (`useState`) y Propiedades (`props`)

En la clase anterior aprendiste a maquetar una interfaz usando componentes estáticos y clases de Tailwind CSS. Sin embargo, una aplicación real necesita responder a las acciones del usuario (interactividad) y ser modular (reutilizar piezas de UI). Para lograr esto en React Native, usamos **props** y **estado**.

---

## 📖 Conceptos Clave

### 1. ¿Qué son las Propiedades (`props`)?
Las `props` son parámetros de entrada que un componente padre le pasa a un componente hijo. Son **de solo lectura** (inmutables para el hijo). Permiten que un mismo componente se dibuje con datos diferentes.

Por ejemplo, si tienes un componente personalizado llamado `BotonPersonalizado`:
```tsx
// Hijo
function BotonPersonalizado(props: { titulo: string }) {
  return (
    <TouchableOpacity className="bg-emerald-500 p-3 rounded-lg">
      <Text className="text-black font-bold">{props.titulo}</Text>
    </TouchableOpacity>
  );
}

// Padre
<BotonPersonalizado titulo="Guardar Cambios" />
<BotonPersonalizado titulo="Cancelar" />
```

### 2. ¿Qué es el Estado (`useState`)?
El **estado** es la memoria interna de un componente. A diferencia de las variables normales, cuando el valor de una variable de estado cambia, React Native automáticamente **vuelve a dibujar (renderizar)** el componente en la pantalla para reflejar el nuevo valor.

Para declarar estado, usamos el Hook `useState` de React:
```tsx
import React, { useState } from 'react';

const [contador, setContador] = useState(0);
```
*   `contador`: La variable que almacena el valor actual del estado.
*   `setContador`: La función que usamos para cambiar ese valor.
*   `0`: El valor inicial del estado.

---

## 🎨 Estilos Dinámicos con Tailwind (NativeWind)

En React Native con NativeWind, puedes cambiar la apariencia de un componente de forma dinámica combinando template literals (comillas invertidas `` ` ``) con el estado de tu aplicación. 

Por ejemplo, para alternar el fondo de un botón cuando está activo:
```tsx
<TouchableOpacity 
  className={`py-2 px-4 rounded-xl ${activo ? 'bg-emerald-500' : 'bg-gray-800'}`}
  onPress={() => setActivo(!activo)}
>
  <Text className={activo ? 'text-black' : 'text-gray-400'}>
    {activo ? 'Activo' : 'Inactivo'}
  </Text>
</TouchableOpacity>
```

---

## 📝 Ejercicio Práctico y Reto

Tu tarea es tomar la **Tarjeta de Perfil de Pepe** que creaste en la Clase 1 dentro de [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) y transformarla en una tarjeta interactiva aplicando `useState` y `props`. 

### 💡 Mini Concepto Extra: El "Gotcha" de la Asincronía en `useState`
En React, las funciones actualizadoras de estado (como `setContador`) son **asíncronas**. Esto significa que si haces esto:

```tsx
const [contador, setContador] = useState(0);

const incrementar = () => {
  setContador(contador + 1);
  console.log(contador); // <-- ¡GOTCHA! Aquí imprimirá 0, no 1.
};
```
El valor real del estado no cambia en la siguiente línea del código, sino que se programa para el siguiente renderizado. Si necesitas realizar un cálculo basado en el valor inmediatamente anterior, o si necesitas que se actualice de forma segura sin depender del valor de clausura, puedes pasarle una función a la actualizadora:
```tsx
setContador((valorAnterior) => valorAnterior + 1);
```

---

### 🏆 El Reto de la Clase 2:

1.  **Botón de "Seguir" dinámico**:
    *   Agrega un botón a la tarjeta de perfil que diga "Seguir".
    *   Al presionarlo, debe cambiar su estado a "Siguiendo".
    *   El diseño debe cambiar: de un estilo llamativo (ej. fondo esmeralda) a uno sobrio (ej. fondo gris oscuro con texto gris claro) para indicar que ya estás siguiendo al usuario.

2.  **Contador de "Likes" interactivo**:
    *   Agrega un botón en forma de corazón (puedes usar un emoji como `❤️`) junto con un contador numérico de likes.
    *   Cada vez que presiones el botón de likes, el contador debe incrementarse en 1.

3.  **Componente Reutilizable con Props (Obligatorio)**:
    *   Crea un subcomponente llamado `StatItem` **fuera** de tu componente principal `Clase1Basicos` (en el mismo archivo o en uno nuevo).
    *   Este subcomponente debe recibir dos propiedades (`label` y `valor`) y retornar un contenedor que los organice verticalmente (ideal para mostrar estadísticas como "Seguidores" o "Likes").
    *   Usa este subcomponente en tu tarjeta de perfil para mostrar el número actual de Likes e inventa otra estadística (por ejemplo, "Seguidores" o "Proyectos").

---

## 🔗 Código de Ejemplo

Para ver un ejemplo funcional que implementa estados, props y estilos condicionales, puedes revisar el archivo físico:
[curso_react_native/ejemplos/Clase2_EstadoProps.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase2_EstadoProps.tsx)
