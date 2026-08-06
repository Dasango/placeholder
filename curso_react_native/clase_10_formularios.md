# Clase 10: React Hook Form + Zod (Formularios y Validaciones) 📝🔒

En aplicaciones móviles, los formularios son la forma principal en que capturamos información de los usuarios. Sin embargo, manejar formularios en React Native puede volverse confuso rápidamente. El enfoque tradicional de enlazar cada campo de texto a un estado local con `useState` provoca re-renders masivos con cada letra escrita, arruinando el rendimiento en dispositivos de gama baja.

Hoy aprenderemos a utilizar **React Hook Form** junto a **Zod** para crear formularios de alto rendimiento, seguros a nivel de tipos (type-safe) y con validaciones complejas de forma declarativa.

---

## 📖 Conceptos Clave

### 1. ¿Por qué React Hook Form?
A diferencia de librerías basadas en componentes (como Formik), React Hook Form se basa en **componentes no controlados** y referencias. 
*   **Sin re-renders globales**: Escribir en un campo de texto no obliga a toda la pantalla a renderizarse de nuevo. Solo se actualiza el input individual.
*   **Ligero y eficiente**: Tiene cero dependencias externas y un peso mínimo.
*   **Soporte nativo para React Native**: Se integra perfectamente usando el componente `Controller`.

### 2. El Componente `<Controller />` de React Hook Form
En la Web, registramos un input usando la referencia de ref: `<input {...register("email")} />`. Pero en React Native, los componentes nativos como `<TextInput />` no exponen la misma API que un input de HTML.
Por eso, en React Native usamos obligatoriamente el componente `<Controller />`. Este componente actúa como un wrapper/puente que maneja el valor del input, el foco y los errores automáticamente.

```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextInput, View, Text } from 'react-native';

const { control, handleSubmit } = useForm();

<Controller
  control={control}
  name="username"
  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
    <View>
      <TextInput
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        placeholder="Nombre de usuario"
      />
      {error && <Text>{error.message}</Text>}
    </View>
  )}
/>
```

### 3. Esquemas de Validación con Zod
Zod nos permite declarar el esquema de datos y sus reglas de validación en un solo lugar. Además, podemos inferir de forma automática el tipo de TypeScript a partir del esquema.

```typescript
import { z } from 'zod';

const schemaRegistro = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  edad: z.number().min(18, 'Debes ser mayor de 18 años'),
});

// Inferencia automática del tipo de datos:
type RegistroForm = z.infer<typeof schemaRegistro>;
```

### 4. Integrando React Hook Form + Zod (El Resolver)
Para unir ambas librerías, usamos el resolver oficial `@hookform/resolvers/zod`. Esto hace que React Hook Form valide los campos contra nuestro esquema de Zod antes de ejecutar la función de envío.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { control, handleSubmit } = useForm<RegistroForm>({
  resolver: zodResolver(schemaRegistro),
  defaultValues: {
    email: '',
    edad: undefined,
  }
});
```

---

## 💡 El Gotcha de React Hook Form en React Native: `defaultValues` obligatorios ⚠️

En la Web, si omites `defaultValues`, React Hook Form puede intentar leer los valores iniciales de los elementos del DOM. En **React Native**, al no haber DOM, **es obligatorio proveer `defaultValues`** para todos los campos al inicializar `useForm`.

**¿Qué pasa si los omites?**
Tus inputs comenzarán con un valor de `undefined`. Cuando el usuario empiece a escribir, el valor pasará de `undefined` a una cadena de texto (`string`), haciendo que React Native lance una advertencia de consola alertando que tu componente ha pasado de ser un **componente no controlado a controlado**, o provocar fallos inesperados de renderizado.

### 🛠️ La Solución:
Define siempre el objeto `defaultValues` en la configuración de `useForm`:

```typescript
const { control } = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    nombre: '',
    habilitado: false, // Asegura los tipos booleanos también!
  }
});
```

---

## 🏆 El Reto de la Clase 10: Formulario de Configuración del Radar de GitHub

Tu misión es crear una pantalla de configuración para nuestra aplicación GitHub Activity Radar. El usuario debe poder definir el repositorio que quiere monitorear y sus preferencias de alertas.

### Requerimientos del Reto:

1.  **Instalar dependencias**:
    *   Ejecuta `npm install react-hook-form zod @hookform/resolvers` dentro del directorio `app`.
2.  **Crear la pantalla de Configuración**:
    *   Crea una pantalla en `app/app/configuracion.tsx` (o un botón de acceso en el header de tu app).
3.  **Esquema de Validación en Zod**:
    *   **Repository Name**: Debe ser una cadena requerida con formato de repositorio de GitHub (ej. `facebook/react-native`).
    *   **Email Alertas**: Debe ser un correo electrónico válido si el usuario decide escribir uno.
4.  **Manejo de Errores Visuales**:
    *   Muestra los mensajes de error en color rojo debajo de cada input si la validación falla al intentar enviar (`handleSubmit`).
    *   Aplica estilos visuales (como bordes rojos) a los inputs que tengan errores para una mejor UX.

---

## 🎯 Mini Concepto Extra - Reto Obligatorio (Validaciones Condicionales y Refine) 🔗🛡️

Para llevar las validaciones al siguiente nivel, implementaremos lógica condicional y personalizada en Zod.

**Tu reto obligatorio es:**
1.  **Validación con Expresión Regular (`.refine`)**: El campo del repositorio de GitHub debe validarse usando un refine o regex en Zod para asegurar que contiene exactamente un slash `/` separando el dueño y el nombre del repositorio (ej. `propietario/repositorio`).
2.  **Validación Condicional (Campos Dependientes)**:
    *   Agrega un Switch de React Native llamado **"Repositorio Privado"** (`isPrivate` - booleano).
    *   Agrega un input para el **"Personal Access Token"** (`token`).
    *   Utilizando el método `.refine()` o `.superRefine()` de Zod a nivel de objeto, haz que:
        *   Si `isPrivate` es `true`, el campo `token` sea **obligatorio** y tenga un mínimo de **40 caracteres** (el estándar de un token clásico de GitHub).
        *   Si `isPrivate` es `false`, el campo `token` sea opcional y pueda quedar vacío.

*💡 Consejo de Zod:* Puedes usar `z.object({...}).refine((data) => { ... }, { message: "Token requerido para repositorios privados", path: ["token"] })` para adjuntar el error directamente al campo correspondiente.
