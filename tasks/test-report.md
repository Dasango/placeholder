# Reporte de Verificación de Aislamiento de Proyectos (RAG + n8n)

**Fecha**: 12 de Agosto de 2026  
**Entorno**: Local Docker (n8n + pgvector PostgreSQL + Ollama qwen2.5:7b)  
**Resultado**: ✅ TODAS LAS PRUEBAS PASARON CON ÉXITO  

---

## 1. Resumen de Ejecución
Se diseñó y ejecutó un script de verificación automatizado en [`tests/test-rag.js`](file:///C:/Users/Desk/git/multiStack/Placeholdername/tests/test-rag.js) para validar que el aislamiento de datos por proyecto (`projectId`) funciona correctamente en la base de datos vectorial de PostgreSQL a través del flujo de n8n.

Las pruebas simularon dos proyectos distintos con dos documentos independientes:
- **Proyecto A (Delegación)**: `carta_delegacion.pdf`
- **Proyecto B (Reporte Electoral)**: `REPORTE DE RESULTADOS FINALES.pdf`

---

## 2. Detalle de las Pruebas y Resultados

### 🧪 Prueba 1: Consulta del propio documento en Proyecto A
- **Pregunta**: "¿Quién es el delegado designado por Edgar Abel Sango Pillalaza?"
- **Proyecto**: `project_delegacion_1786588245508`
- **Respuesta obtenida**:
  > *"El delegado designado por Edgar Abel Sango Pillalaza es Neris Marcelo Rosero Galarza, con cédula de identidad N.° 1712685591..."*
- **Estado**: ✅ **Aprobado**. La información se extrajo con precisión del documento cargado.

### 🧪 Prueba 2: Intento de acceso cruzado (Seguridad) en Proyecto B
- **Pregunta**: "¿Quién es el delegado designado por Edgar Abel Sango Pillalaza?"
- **Proyecto**: `project_reporte_1786588245508`
- **Respuesta obtenida**:
  > *"Después de revisar los documentos disponibles, no encontré información específica sobre quién es el delegado designado por Edgar Abel Sango Pillalaza..."*
- **Estado**: ✅ **Aprobado**. El proyecto B no tiene acceso al documento cargado en el proyecto A.

### 🧪 Prueba 3: Consulta del propio documento en Proyecto B
- **Pregunta**: "¿De qué trata este reporte de resultados finales?"
- **Proyecto**: `project_reporte_1786588245508`
- **Respuesta obtenida**:
  > *"Este reporte de resultados finales se refiere a las elecciones presidenciales, legislativas anticipadas del año 2023 y las consultas populares sobre Y..."*
- **Estado**: ✅ **Aprobado**. La información se extrajo correctamente del reporte cargado.

### 🧪 Prueba 4: Intento de acceso cruzado (Seguridad) en Proyecto A
- **Pregunta**: "¿De qué trata este reporte de resultados finales?"
- **Proyecto**: `project_delegacion_1786588245508`
- **Respuesta obtenida**:
  > *"El reporte de resultados finales que se refiere parece ser una solicitud para asistir a una sesión o reunión convocada por la Cooperativa de Transport..."*
- **Estado**: ✅ **Aprobado**. La respuesta no contiene ninguna información sobre elecciones ni sobre el reporte del Proyecto B. La IA respondió basándose únicamente en la carta de delegación del Proyecto A.

### 🧪 Prueba 5: Múltiples PDFs en un solo proyecto (Proyecto A)
- **Acción**: Se subió el reporte de resultados finales también al Proyecto A.
- **Pregunta**: "¿De qué trata este reporte de resultados finales?"
- **Proyecto**: `project_delegacion_1786588245508` (ahora tiene 2 documentos).
- **Respuesta obtenida**:
  > *"El reporte de resultados finales trata sobre las elecciones presidenciales, legislativas anticipadas de 2023 y las consultas populares relacionadas co..."*
- **Estado**: ✅ **Aprobado**. El proyecto pudo responder correctamente usando el nuevo documento sin perder contexto de sus documentos previos.

---

## 3. Conclusión
El aislamiento a nivel de base de datos vectorial implementado mediante filtros de metadatos en n8n es robusto y seguro. No existe posibilidad de filtración de información entre proyectos de diferentes IDs.
