# Plan de Implementación: Local Document RAG con Soporte de Proyectos (Estilo Google Notebook)

## Resumen
Este plan detalla la transformación de una aplicación móvil RAG local de una sola vista a una aplicación multi-proyecto (estilo Google Notebook). El usuario podrá crear múltiples proyectos. Dentro de cada proyecto, tendrá dos vistas independientes: una para gestionar/cargar los documentos exclusivos de ese proyecto y otra para interactuar en un chat conversacional con la IA que solo tendrá contexto de los documentos cargados en ese proyecto específico.

## Decisiones de Arquitectura

1. **Aislamiento de Proyectos en Base de Datos Vectorial (PostgreSQL/PGVector)**:
   - **Enfoque**: Utilizaremos metadatos en PGVector para etiquetar cada fragmento de documento con su respectivo ID de proyecto (`project_id`).
   - **Ingesta**: Al subir un archivo al webhook de n8n (`/upload-pdf`), se enviará el parámetro `projectId` en el cuerpo del formulario (`form-data`). El nodo PGVector en n8n guardará este ID en los metadatos de los vectores.
   - **Recuperación (Chat)**: Al enviar una consulta al webhook de chat (`/chat`), se incluirá `projectId` en el JSON. La herramienta de consulta vectorizada (`Query Data Tool`) en n8n aplicará un filtro de metadatos (`metadataFilter`) para que el Agente de IA solo busque en los vectores pertenecientes a ese proyecto.

2. **Almacenamiento Local (AsyncStorage)**:
   - Mantendremos la simplicidad del almacenamiento local para guardar los metadatos de los proyectos y no depender de una base de datos compleja adicional.
   - Guardaremos tres tipos de llaves estructuradas:
     - `@rag_projects`: Una lista general de proyectos: `Array<{ id: string, name: string, createdAt: string }>`.
     - `@rag_project_docs_[projectId]`: La lista de documentos cargados para ese proyecto en particular.
     - `@rag_project_chat_[projectId]`: El historial de conversación del chat de ese proyecto.

3. **Navegación e Interfaz de Usuario**:
   - Utilizaremos **Expo Router** para separar las pantallas de forma limpia:
     - **Pantalla Principal (`app/app/index.tsx`)**: Lista de proyectos, creación de nuevos proyectos y modal de configuración global de n8n.
     - **Pantalla de Detalle (`app/app/project/[id].tsx`)**: Pantalla dedicada a un proyecto seleccionado. Internamente utilizará un estado de pestañas sencillo para alternar entre la vista de **Documentos** (lista y selector de archivos) y la vista de **Chat** (conversación con los documentos).
   - Estilo sencillo y limpio, usando Tailwind CSS (NativeWind) que ya está configurado en el proyecto.

---

## Lista de Tareas

### Fase 1: Actualización del Backend (n8n Webhook y PGVector)

#### Tarea 1: Configurar Ingesta con Metadatos por Proyecto en n8n
- **Descripción**: Modificar el flujo de ingesta para que reciba `projectId` y lo guarde como metadato en PostgreSQL a través de pgvector.
- **Criterios de Aceptación**:
  - El webhook de subida acepta `projectId` como parámetro de `form-data`.
  - El nodo de PGVector de inserción guarda una clave `project_id` en los metadatos con el valor dinámico proveniente del webhook.
- **Archivos a modificar**: `workflows/Rag.json`
- **Dificultad**: S (Pequeña)

#### Tarea 2: Configurar Filtro de Proyecto en el Agente de Chat de n8n
- **Descripción**: Modificar el webhook de chat para recibir `projectId` en el body JSON y aplicar un filtro de metadatos en la herramienta `Query Data Tool` para aislar la consulta al proyecto seleccionado.
- **Criterios de Aceptación**:
  - El webhook `/chat` acepta `projectId` en el body.
  - La herramienta `Query Data Tool` de pgvector tiene configurado el filtro de metadatos `project_id = {{ $json.body.projectId }}` (o equivalente en n8n).
- **Archivos a modificar**: `workflows/Rag.json`
- **Dificultad**: S (Pequeña)

---

### Checkpoint: Backend n8n
- [ ] El backend n8n se actualiza correctamente con el nuevo JSON de flujo.
- [ ] La base de datos guarda correctamente los documentos con su respectivo ID de proyecto.
- [ ] La consulta de chat devuelve contexto aislado de un proyecto específico.

---

### Fase 2: Rediseño de Navegación y Pantalla Principal

#### Tarea 3: Refactorización del Esquema de Estado y Almacenamiento Local
- **Descripción**: Definir tipos TypeScript para Proyectos, Documentos e Historial de Chat. Implementar funciones auxiliares para leer y escribir en AsyncStorage de forma aislada por `projectId`.
- **Criterios de Aceptación**:
  - Tipos e interfaces definidos correctamente.
  - Métodos para guardar/cargar chats y documentos filtrados por proyecto.
- **Archivos a modificar**: `app/app/index.tsx` (o un nuevo archivo utilitario `app/app/utils/storage.ts`)
- **Dificultad**: S (Pequeña)

#### Tarea 4: Implementar Pantalla de Lista de Proyectos (`app/app/index.tsx`)
- **Descripción**: Convertir la vista actual en la pantalla de inicio ("Home"). Mostrará la lista de proyectos guardados, opción para crear uno nuevo mediante un modal (nombre del proyecto) y el botón de ajustes de red (n8n URL). Al seleccionar un proyecto, redirige a `/project/[id]`.
- **Criterios de Aceptación**:
  - Visualización limpia de la lista de proyectos.
  - Creación funcional de nuevos proyectos.
  - Redirección con parámetros a través de `router.push('/project/' + id)`.
- **Archivos a modificar**: `app/app/index.tsx`
- **Dificultad**: M (Mediana)

---

### Checkpoint: Pantalla de Proyectos
- [ ] El usuario puede crear proyectos ilimitados y guardarlos.
- [ ] La lista de proyectos se actualiza inmediatamente.
- [ ] Al presionar un proyecto se navega a la ruta dinámica.

---

### Fase 3: Detalle del Proyecto (Documentos y Chat)

#### Tarea 5: Crear Pantalla de Detalle de Proyecto (`app/app/project/[id].tsx`)
- **Descripción**: Crear la estructura básica del detalle de proyecto con el ID de la ruta (`useLocalSearchParams`). Implementar la cabecera (con nombre del proyecto y botón para regresar) y el toggle de pestañas locales ("Documentos" y "Chat").
- **Criterios de Aceptación**:
  - Muestra el nombre correcto del proyecto seleccionado.
  - El botón de regreso funciona correctamente.
  - Alterna entre los contenedores de las dos vistas internas.
- **Archivos a modificar**: `app/app/project/[id].tsx` (Nuevo)
- **Dificultad**: M (Mediana)

#### Tarea 6: Implementar Ingesta y Vista de Documentos por Proyecto
- **Descripción**: Migrar y adaptar el componente de subida de archivos y visualización de la lista de documentos de la pantalla original a `[id].tsx`. Al hacer upload, enviar el `projectId` en el formulario y guardar el metadato del archivo localmente para ese proyecto.
- **Criterios de Aceptación**:
  - La lista de documentos solo muestra los correspondientes al `projectId` actual.
  - La petición POST de subida envía el `projectId` en el FormData.
- **Archivos a modificar**: `app/app/project/[id].tsx`
- **Dificultad**: S (Pequeña)

#### Tarea 7: Implementar Chat Aislado por Proyecto
- **Descripción**: Migrar y adaptar la vista de chat a `[id].tsx`. La conversación debe guardarse y cargarse utilizando el id del proyecto. La petición de chat enviará `{ message: text, projectId: id }`.
- **Criterios de Aceptación**:
  - El chat carga y muestra el historial específico del proyecto.
  - El bot de IA responde con base únicamente en los documentos del proyecto gracias al filtro de la petición.
- **Archivos a modificar**: `app/app/project/[id].tsx`
- **Dificultad**: S (Pequeña)

---

### Checkpoint Final
- [ ] La aplicación móvil compila sin errores.
- [ ] Los proyectos funcionan de manera 100% aislada: subir un PDF en el Proyecto A no afecta ni responde a preguntas realizadas en el Proyecto B.
- [ ] La experiencia de usuario es fluida e intuitiva.

---

## Riesgos y Mitigaciones
| Riesgo | Impacto | Mitigación |
|------|--------|------------|
| El nodo PGVector en n8n no soporta filtro dinámico por metadatos fácilmente | Alto | Si la interfaz de n8n no permite filtrar dinámicamente con facilidad, se puede implementar un script en JS intermedio en el flujo de n8n para pre-filtrar o inyectar la query SQL al conector de PostgreSQL directamente. |
| Incompatibilidades de red con emuladores y celulares físicos | Medio | Explicar detalladamente en la interfaz (como ya hace la app) cómo configurar la IP local de la computadora en lugar de `localhost` en el modal de ajustes de red. |

## Preguntas Abiertas
- ¿Deseas que preparemos un script de prueba o actualicemos el archivo `test-endpoints.js` para simular llamadas multi-proyecto y validar el backend antes de tocar la app móvil?
- ¿Quieres que te proporcione el archivo `workflows/Rag.json` modificado con los parámetros de metadatos ya mapeados para que solo tengas que importarlo en tu n8n?
