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

## 📝 Ejercicio Práctico
Tu tarea es modificar el código de la clase (o crear uno nuevo) para diseñar una **Tarjeta de Perfil de Usuario**.
Debe contener:
1.  Un contenedor principal con un borde y sombra elegante.
2.  Un título (nombre del usuario).
3.  Una descripción breve de su biografía.
4.  Un campo de texto (`TextInput`) para dejarle un mensaje o comentario.
5.  Un botón (`TouchableOpacity`) de "Enviar Mensaje" que al presionarlo llame a `Alert.alert("Mensaje enviado", "Tu mensaje ha sido enviado con éxito")`.

---

## 🔗 Código de Ejemplo
El código de ejemplo para esta clase está guardado en el archivo físico:
[curso_react_native/ejemplos/Clase1_Basicos.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/curso_react_native/ejemplos/Clase1_Basicos.tsx)

Copia todo su contenido y pégalo en tu archivo [app/app/index.tsx](file:///C:/Users/Desk/git/multiStack/Placeholdername/app/app/index.tsx) para probarlo en tiempo real.
