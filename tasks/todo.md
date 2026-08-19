# Lista de Tareas: Local Document RAG con Soporte de Proyectos

## Fase 1: Implementación de la Pantalla Principal (Lista de Proyectos)
- [x] **Tarea 1**: Desarrollar Vista de Inicio (`app/app/index.tsx`)
  - *Criterios de Aceptación*:
    - Muestra un listado de proyectos con tarjeta/tarjetas que indiquen su nombre y fecha de creación.
    - Implementa un botón para crear un nuevo proyecto abriendo un modal o formulario integrado que solicite el nombre.
    - Al hacer clic en un proyecto, navega a `/project/[id]` pasando el ID del proyecto.
    - Incluye una sección o botón para editar/configurar la URL de n8n, guardándola localmente de manera persistente (o mostrando la URL en uso).
    - Soporta el tema claro (fondo blanco, textos oscuros) y oscuro (fondo gris oscuro, textos claros).
  - *Verificación*:
    - Compilar la app, abrir el inicio, verificar que se muestra la lista y se puede añadir un proyecto, y cambiar el tema claro/oscuro en el simulador/dispositivo.

### Checkpoint: Pantalla de Proyectos
- [x] Proyectos se listan y se crean correctamente.
- [x] Persistencia de datos al reiniciar la app.

---

## Fase 2: Implementación de Gestión de Documentos por Proyecto
- [x] **Tarea 2**: Desarrollar la Pantalla de Documentos (`app/app/project/[id]/index.tsx`)
  - *Criterios de Aceptación*:
    - Muestra el listado de documentos asignados al proyecto actual.
    - Muestra un botón para elegir un documento (PDF/CSV) y permite ver el nombre del archivo seleccionado antes de subirlo.
    - Botón de carga ("Ingestar Documento") con indicador de carga (`ActivityIndicator`) mientras la mutación se ejecuta.
    - Opción de eliminar un documento individual, la cual realiza la llamada a `/webhook/delete-document` y actualiza la lista localmente.
    - Los colores e iconos se adaptan correctamente al tema activo (claro/oscuro).
  - *Verificación*:
    - Cargar un archivo en un proyecto y confirmar que aparece en la lista de documentos.

### Checkpoint: Gestión de Documentos
- [x] Subida de archivos y eliminación de documentos funcionales.
- [x] Los datos se guardan y reflejan de manera aislada para cada proyecto.

---

## Fase 3: Chat RAG Conversacional por Proyecto
- [x] **Tarea 3**: Desarrollar la Interfaz de Chat (`app/app/project/[id]/chat.tsx`)
  - *Criterios de Aceptación*:
    - Carga el historial de conversación específico del proyecto desde la tienda de Zustand.
    - Muestra burbujas de chat legibles que se ajustan al tema del dispositivo:
      - Usuario: Fondo azul o gris destacado, texto claro.
      - Asistente: Fondo sutil gris claro (en tema claro) o gris medio (en tema oscuro), texto según contraste.
    - Muestra un indicador de carga animado cuando el bot está procesando la respuesta.
    - El teclado se desplaza de manera óptima en iOS y Android (`KeyboardAvoidingView`).
    - Permite limpiar el historial de chat con confirmación previa.
  - *Verificación*:
    - Enviar mensajes al chat, recibir respuestas del agente RAG de n8n, y borrar el historial de chat.

### Checkpoint Final
- [x] Chat funcional y con aislamiento de proyecto.
- [x] Estilo visual adaptado a temas claros (blancos) y oscuros (grises).
