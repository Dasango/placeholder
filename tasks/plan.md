# Plan de Implementación: Local Document RAG con Soporte de Proyectos (Estilo Google Notebook)

## Resumen
Este plan detalla el desarrollo e implementación del frontend móvil en Expo React Native para un RAG local multi-proyecto estilo Google Notebook. La aplicación permitirá crear múltiples cuadernos/proyectos de manera aislada. Para cada proyecto, el usuario podrá subir sus propios documentos e interactuar con el agente RAG local en un chat aislado que solo tiene conocimiento de los documentos de dicho proyecto.

Se implementará un tema muy sencillo con colores blancos para el tema claro y colores grises para el tema oscuro, detectando dinámicamente la preferencia del sistema.

## Decisiones de Arquitectura

1. **Aislamiento en Zustand y AsyncStorage**:
   - Usaremos la tienda global ya definida en `app/store.ts` que guarda `projects`, `documentsByProject` y `chatsByProject` persistidos automáticamente mediante Zustand.

2. **Soporte de Temas Sencillos (Claro/Oscuro)**:
   - Utilizaremos `useColorScheme()` de `react-native` para obtener el esquema de color del sistema (`'light'` o `'dark'`).
   - Aplicaremos clases de Tailwind correspondientes de forma limpia:
     - **Tema Claro**: Fondos blancos (`bg-white` / `bg-zinc-50`), textos oscuros (`text-zinc-900` / `text-zinc-500`).
     - **Tema Oscuro**: Fondos grises (`bg-zinc-950` / `bg-zinc-900`), textos claros (`text-zinc-100` / `text-zinc-400`).

3. **Integración con Backend de n8n**:
   - **Ingesta**: Enviaremos el archivo PDF y el `projectId` mediante `multipart/form-data` al endpoint `/webhook/upload-pdf`.
   - **Chat**: Enviaremos `{ message, projectId }` mediante JSON al endpoint `/webhook/chat`.
   - **Eliminar Documento**: Enviaremos `{ projectId, documentName }` mediante JSON al endpoint `/webhook/delete-document`.
   - **Eliminar Proyecto**: Enviaremos `{ projectId }` mediante JSON al endpoint `/webhook/delete-project`.

---

## Lista de Tareas

### Fase 1: Implementación de la Pantalla Principal (Lista de Proyectos)

#### Tarea 1: Desarrollar Vista de Inicio (`app/app/index.tsx`)
- **Descripción**: Crear la interfaz para listar los proyectos existentes, crear nuevos proyectos y configurar la dirección del servidor n8n.
- **Criterios de Aceptación**:
  - Muestra un listado de proyectos con tarjeta/tarjetas que indiquen su nombre y fecha de creación.
  - Implementa un botón para crear un nuevo proyecto abriendo un modal o formulario integrado que solicite el nombre.
  - Al hacer clic en un proyecto, navega a `/project/[id]` pasando el ID del proyecto.
  - Incluye una sección o botón para editar/configurar la URL de n8n, guardándola localmente de manera persistente (o mostrando la URL en uso).
  - Soporta el tema claro (fondo blanco, textos oscuros) y oscuro (fondo gris oscuro, textos claros).
- **Archivos a modificar**:
  - `app/app/index.tsx`
- **Dificultad**: M (Mediana)

---

### Fase 2: Implementación de Gestión de Documentos por Proyecto

#### Tarea 2: Desarrollar la Pantalla de Documentos (`app/app/project/[id]/index.tsx`)
- **Descripción**: Diseñar e implementar la interfaz para ver la lista de documentos subidos al proyecto actual, seleccionar un archivo desde el almacenamiento del dispositivo mediante `DocumentPicker` y subirlo al backend de n8n.
- **Criterios de Aceptación**:
  - Muestra el listado de documentos asignados al proyecto actual.
  - Muestra un botón para elegir un documento (PDF/CSV) y permite ver el nombre del archivo seleccionado antes de subirlo.
  - Botón de carga ("Ingestar Documento") con indicador de carga (`ActivityIndicator`) mientras la mutación se ejecuta.
  - Opción de eliminar un documento individual, la cual realiza la llamada a `/webhook/delete-document` y actualiza la lista localmente.
  - Los colores e iconos se adaptan correctamente al tema activo (claro/oscuro).
- **Archivos a modificar**:
  - `app/app/project/[id]/index.tsx`
- **Dificultad**: M (Mediana)

---

### Fase 3: Chat RAG Conversacional por Proyecto

#### Tarea 3: Desarrollar la Interfaz de Chat (`app/app/project/[id]/chat.tsx`)
- **Descripción**: Crear la pantalla de chat con el agente de n8n, mostrando las burbujas de conversación diferenciadas por rol (usuario y asistente) y una barra inferior para escribir y enviar mensajes.
- **Criterios de Aceptación**:
  - Carga el historial de conversación específico del proyecto desde la tienda de Zustand.
  - Muestra burbujas de chat legibles que se ajustan al tema del dispositivo:
    - Usuario: Fondo azul o gris destacado, texto claro.
    - Asistente: Fondo sutil gris claro (en tema claro) o gris medio (en tema oscuro), texto según contraste.
  - Muestra un indicador de carga animado cuando el bot está procesando la respuesta.
  - El teclado se desplaza de manera óptima en iOS y Android (`KeyboardAvoidingView`).
  - Permite limpiar el historial de chat con confirmación previa.
- **Archivos a modificar**:
  - `app/app/project/[id]/chat.tsx`
- **Dificultad**: M (Mediana)

---

## Checkpoints de Verificación

### Checkpoint 1: Navegación y Proyectos
- [ ] Ejecutar la app y validar que se visualiza la lista de proyectos.
- [ ] Crear un proyecto nuevo y comprobar que se agrega a la lista y persiste al reiniciar.
- [ ] Navegar a los detalles de un proyecto específico.

### Checkpoint 2: Gestión de Documentos
- [ ] Entrar al proyecto e intentar seleccionar un archivo con `DocumentPicker`.
- [ ] Comprobar que la subida (ingesta) funciona y reporta éxito.
- [ ] Eliminar un documento y verificar que desaparece de la vista.

### Checkpoint 3: Conversación RAG
- [ ] Enviar una pregunta en el chat y recibir la respuesta del backend n8n de manera aislada por proyecto.
- [ ] Cambiar el tema del dispositivo entre claro y oscuro y validar que la UI se renderiza con el esquema de color correcto (claro = blancos; oscuro = grises).

## Riesgos y Mitigaciones
| Riesgo | Impacto | Mitigación |
|------|--------|------------|
| Problemas de red con la IP del servidor n8n en dispositivos reales | Medio | Se provee un input configurable en la pantalla principal para cambiar la URL de n8n fácilmente si no se autodetecta. |
| Incompatibilidades de altura de teclado en Android/iOS | Bajo | Usar `KeyboardAvoidingView` con el offset correcto y controladores de eventos para gestionar la altura de manera nativa. |
