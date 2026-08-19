# Guía de Uso del Tema y Creación de Componentes

Este proyecto implementa un sistema de temas claro (blancos) y oscuro (grises) mediante el hook `useAppTheme`.

## 📦 El Hook `useAppTheme`

El hook `useAppTheme` provee tres valores principales:
- `theme`: `'light' | 'dark'` (El nombre del tema actual).
- `isDark`: `boolean` (Un atajo para saber si el tema es oscuro).
- `colors`: Un objeto con colores semánticos definidos para cada modo.

### Colores Semánticos Disponibles

| Nombre del Color | Descripción | Valor en Claro | Valor en Oscuro |
| :--- | :--- | :--- | :--- |
| `background` | Fondo principal de la pantalla | `#ffffff` | `#121212` |
| `foreground` | Color del texto principal | `#18181b` | `#f4f4f5` |
| `card` | Fondo para tarjetas y bloques | `#f4f4f5` | `#1e1e1e` |
| `cardForeground` | Texto sobre tarjetas | `#18181b` | `#f4f4f5` |
| `border` | Color de bordes y separadores | `#e4e4e7` | `#27272a` |
| `primary` | Color destacado/principal | `#18181b` | `#fafafa` |
| `primaryForeground` | Texto sobre elementos primarios | `#ffffff` | `#18181b` |
| `mutedForeground` | Color para textos secundarios | `#71717a` | `#a1a1aa` |

---

## 🛠️ Cómo Crear Componentes usando `useAppTheme`

Al construir o extender vistas y componentes, puedes adaptar su estilo de dos formas principales:

### Método 1: Estilos en Línea Dinámicos (Recomendado para Fondos/Bordes de Contenedores Básicos)

Puedes pasar estilos dinámicos a la propiedad `style` de tus componentes `View`, `Text` o `TouchableOpacity`:

```tsx
import React from "react";
import { View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/text";

export default function MiTarjeta() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 16,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: colors.foreground }}>
        Esta es una tarjeta responsiva.
      </Text>
      <Text style={{ color: colors.mutedForeground }}>
        Texto secundario.
      </Text>
    </View>
  );
}
```

### Método 2: Clases Condicionales de NativeWind

Si prefieres usar utilidades de Tailwind CSS (NativeWind), puedes utilizar `isDark` o la directiva `dark:`:

```tsx
import React from "react";
import { View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/text";

export default function MiTarjetaTailwind() {
  const { isDark } = useAppTheme();

  return (
    <View className="p-4 border rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <Text className="text-zinc-900 dark:text-zinc-100 font-bold">
        Título de Tarjeta
      </Text>
    </View>
  );
}
```

---

## ⚠️ Reglas y Buenas Prácticas
1. **Evitar Valores de Color Hardcodeados**: No utilices colores como `#fff`, `white`, `#000` o clases estáticas como `bg-slate-900` de forma directa sin considerar el tema.
2. **Priorizar `components/ui`**: Utiliza componentes base como `Button`, `Text` y `Card` que ya respetan la jerarquía tipográfica y de color del sistema.
3. **Consistencia**: Asegúrate de que los fondos de pantalla (`View` raíz) siempre consuman `colors.background` para evitar cortes de color al cambiar el tema del sistema.
