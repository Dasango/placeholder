# Clase 1: Componentes Básicos y Estilos (Layouts y Tailwind)

En el desarrollo web usas etiquetas HTML como `<div>`, `<p>`, `<input>` y `<button>`. En **React Native** esto no existe, porque los teléfonos móviles no renderizan HTML nativamente. En su lugar, usamos componentes especiales provistos por la librería `react-native`.

---

## 📖 Conceptos Clave

1.  **`View`** (El equivalente a `<div>`)
    Es el contenedor básico. Se usa para estructurar layouts, agrupar elementos y aplicar estilos de posicionamiento (como Flexbox).
2.  **`Text`** (El equivalente a `<p>`, `<span>`, `<h1>`)
    **Todo** texto en React Native debe estar dentro de un componente `<Text>`. Si pones texto suelto, la app fallará inmediatamente.
3.  **`TextInput`** (El equivalente a `<input type="text">`)
    Se usa para que el usuario escriba. Tiene propiedades específicas como `placeholder`, `secureTextEntry` (para contraseñas) o `keyboardType` (para abrir teclado numérico, etc.).
4.  **`TouchableOpacity`** (El botón recomendado)
    Existe un componente llamado `Button`, pero tiene muy pocas opciones de diseño. Por eso, casi siempre usamos `<TouchableOpacity>`, que es un contenedor que reacciona cuando lo presionas (haciéndose un poco transparente) y adentro le puedes poner el diseño que quieras.
5.  **`ScrollView`**
    Por defecto, las pantallas móviles **no hacen scroll** si el contenido se sale. Debes envolver el contenido en un `<ScrollView>` si quieres que se pueda deslizar hacia abajo.

---

## 🎨 Estilos con Tailwind CSS (NativeWind)
Tu proyecto viene con **NativeWind** instalado, lo cual es increíble porque puedes usar clases comunes de Tailwind mediante la propiedad `className` en tus componentes, igual que en la web.
*   `flex-1`: Ocupa todo el espacio disponible.
*   `bg-slate-900`: Fondo oscuro.
*   `p-4`: Padding de 16px.
*   `rounded-xl`: Bordes redondeados.
*   `items-center justify-center`: Centrado de elementos con Flexbox.

---

## 📝 Ejercicio Práctico y Reto

Tu tarea es diseñar una **Tarjeta de Perfil de Usuario**. No debe ser una simple copia del ejemplo; debe incorporar el siguiente **Mini Concepto Extra** como un desafío personal.

### 💡 Mini Concepto Extra: El Componente `Image`
Para mostrar imágenes en React Native, usamos el componente `<Image>` de `'react-native'`.
*   **Imágenes locales**: `<Image source={require('./ruta/imagen.png')} />`
*   **Imágenes de internet (Network)**: `<Image source={{ uri: 'https://ejemplo.com/foto.jpg' }} />`

> [!IMPORTANT]
> **El gran "Gotcha" de React Native**: A diferencia del desarrollo web, si cargas una imagen de internet, **debes darle dimensiones explícitas (ancho y alto)** usando clases de Tailwind (como `w-16 h-16`) o estilos inline. Si no lo haces, la imagen se renderizará con tamaño 0x0 y será totalmente invisible.

---

### 🏆 El Reto de la Clase 1:
1.  Diseña la **Tarjeta de Perfil de Usuario** con un contenedor, título, biografía, input de texto y botón con la alerta.
2.  **Agrega una Foto de Perfil (Avatar)** usando el componente `<Image>` y un enlace de internet (puedes usar un avatar de prueba como `https://avatar.iran.liara.run/public/boy`).
3.  Estiliza la foto para que sea redonda (`rounded-full`) y colócala de manera armoniosa en tu tarjeta (por ejemplo, alineada al lado del nombre o centrada en la parte superior).
4.  **Crea una cabecera decorativa**: Pon un contenedor de fondo con un gradiente o color sólido que sirva como "portada" y haz que el avatar sobresalga ligeramente sobre él usando márgenes negativos (ej. `-mt-8` o similar).

---

## 🔗 Código de Ejemplo
El código de ejemplo básico para esta clase está guardado en el archivo físico:
[curso_react_native/ejemplos/Clase1_Basicos.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase1_Basicos.tsx)

