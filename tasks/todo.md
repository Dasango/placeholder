# Lista de Tareas: Local Document RAG con Soporte de Proyectos

## Fase 1: Actualización del Backend (n8n Webhook y PGVector)
- [x] **Tarea 1**: Configurar Ingesta con Metadatos por Proyecto en n8n
  - *Criterios de Aceptación*:
    - Webhook `/upload-pdf` recibe `projectId`.
    - Nodo de inserción PGVector guarda `project_id` en metadatos del chunk.
- [x] **Tarea 2**: Configurar Filtro de Proyecto en el Agente de Chat de n8n
  - *Criterios de Aceptación*:
    - Webhook `/chat` recibe `projectId` en JSON.
    - Herramienta `Query Data Tool` (PGVector) tiene filtro `project_id = {{ $json.body.projectId }}`.

### Checkpoint: Backend n8n
- [x] Validar importación de JSON o edición de nodos.
- [x] Probar endpoint con archivos cargados a dos proyectos distintos y corroborar metadatos en la base PostgreSQL.

---

## Fase 2: Rediseño de Navegación y Pantalla Principal
- [x] **Tarea 3**: Refactorización del Esquema de Estado y Almacenamiento Local
  - *Criterios de Aceptación*:
    - Interfaces TS creadas para `Project`, `UploadedDocument`, `ChatMessage` con aislamiento por proyecto.
    - Funciones de almacenamiento en `AsyncStorage` actualizadas para usar claves específicas por proyecto.
- [x] **Tarea 4**: Implementar Pantalla de Lista de Proyectos (`app/app/index.tsx`)
  - *Criterios de Aceptación*:
    - Pantalla de inicio muestra listado de proyectos y modal para crear nuevos proyectos.
    - Guarda proyectos creados en AsyncStorage (`@rag_projects`).
    - Al presionar un proyecto se navega a `/project/[id]` usando Expo Router `router.push()`.

### Checkpoint: Pantalla de Proyectos
- [x] Ejecutar la aplicación en modo desarrollo.
- [x] Crear un proyecto "Test A" y otro "Test B".
- [x] Verificar que aparecen en la lista y persisten después de recargar la aplicación.

---

## Fase 3: Detalle del Proyecto (Documentos y Chat)
- [x] **Tarea 5**: Crear Pantalla de Detalle de Proyecto (`app/app/project/[id].tsx`)
  - *Criterios de Aceptación*:
    - Estructura básica creada usando `useLocalSearchParams` de `expo-router`.
    - Cabecera funcional con botón de regreso a la pantalla principal.
    - Barra de navegación de pestañas internas ("Documentos" y "Chat") usando control de estados de React.
- [x] **Tarea 6**: Implementar Ingesta y Vista de Documentos por Proyecto
  - *Criterios de Aceptación*:
    - Vista de Documentos muestra solo archivos del proyecto actual (`projectId`).
    - Envía el archivo PDF/CSV junto con `projectId` en la llamada multipart/form-data.
- [x] **Tarea 7**: Implementar Chat Aislado por Proyecto
  - *Criterios de Aceptación*:
    - Chat carga el historial específico del proyecto.
    - Envía `{ message, projectId }` en la petición al backend de n8n.

### Checkpoint Final
- [x] La aplicación compila sin errores.
- [x] Subir un PDF de prueba en el Proyecto A.
- [x] Preguntar algo del PDF en el Proyecto A: debe responder correctamente con contexto.
- [x] Ir al Proyecto B (sin PDFs subidos): el chat no debe saber nada sobre la información del PDF del Proyecto A.
