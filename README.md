# Local Document RAG (n8n + PostgreSQL pgvector + Expo React Native)

# Documentación del Backend RAG (n8n Webhooks)

Esta documentación describe la interfaz técnica para interactuar con el backend RAG (Retrieval-Augmented Generation) alojado en n8n. Contiene los dos únicos endpoints disponibles para el usuario final: subida de archivos y consulta conversacional.

---

    ## 1. Subida de Documentos (Ingesta RAG)

    Este endpoint se utiliza para cargar cartas, documentos y archivos PDF en la base de datos vectorial interna. Los

fragmentos del documento serán indexados y generarán los embeddings correspondientes para búsquedas futuras.

    * **URL del Endpoint:**
      * **Producción:** `POST http://localhost:5678/webhook/upload-pdf`
      * **Pruebas (Test UI):** `POST http://localhost:5678/webhook-test/upload-pdf`
    * **Método HTTP:** `POST`
    * **Content-Type:** `multipart/form-data`

    ### Parámetros de la Petición (Request Body)

    La petición debe enviarse codificada como `form-data`. Contiene el siguiente campo:

    | Nombre del Campo | Tipo | Ubicación | Descripción |
    | :--- | :--- | :--- | :--- |
    | `data` (o el archivo directo) | `file` (Binario) | Body (`form-data`) | El documento (PDF, texto, etc.) que se

desea ingestar en la base de datos. |

    ### Ejemplo en cURL

    ```bash
    curl -X POST http://localhost:5678/webhook/upload-pdf \
      -H "Content-Type: multipart/form-data" \
      -F "data=@/ruta/a/tu/carta_delegacion.pdf"

### Respuesta del Servidor (Response)

Devuelve el estado de procesamiento del flujo de n8n.

• Código de Estado: 200 OK
• Cuerpo de Respuesta (JSON):
[
{
"success": true
}
]

──────

## 2. Consulta y Chat Conversacional (Agente RAG)

Este endpoint se utiliza para enviar preguntas al Agente RAG. El agente buscará de forma autónoma en los documentos
ingestados utilizando los embeddings y responderá la pregunta basándose en el contenido de la base de datos
vectorial.

• URL del Endpoint:
• Producción: POST http://localhost:5678/webhook/chat
• Pruebas (Test UI): POST http://localhost:5678/webhook-test/chat
• Método HTTP: POST
• Content-Type: application/json

### Parámetros de la Petición (Request Body)

El cuerpo de la petición debe enviarse en formato JSON con la siguiente estructura:

    {
      "message": "¿Qué dice la carta sobre las delegaciones?"
    }

Campo │ Tipo │ Obligatorio │ Descripción
───────────┼───────────┼─────────────┼──────────────────────────────────────────────────────────────────────────────
message │ string │ Sí │ La pregunta o consulta en lenguaje natural sobre los documentos almacenados.

### Ejemplo en cURL

    curl -X POST http://localhost:5678/webhook/chat \
      -H "Content-Type: application/json; charset=utf-8" \
      -d '{"message": "¿Qué dice la carta sobre las delegaciones?"}'

### Respuesta del Servidor (Response)

El backend procesa la petición de forma síncrona y devuelve la respuesta formulada por el Agente.

• Código de Estado: 200 OK
• Cuerpo de Respuesta (JSON):
{
"output": "La carta menciona que Edgar Abel Sango Pillalaza ha designado a Neris Marcelo Rosero Galarza como su
delegado..."
}

──────

## Notas de Integración y Códigos de Error

### Webhooks en Modo Test vs Producción

• Para usar los endpoints de Pruebas (/webhook-test/...), debes presionar previamente el botón "Execute workflow" en
la interfaz gráfica de n8n. Este puerto de pruebas solo escucha durante 120 segundos o para una única ejecución.
• Para usar los endpoints de Producción (/webhook/...), el flujo de trabajo en n8n debe estar activado y publicado.

### Errores Comunes

• 404 Not Found: Si intentas llamar al webhook de pruebas sin haber pulsado "Execute workflow" en la UI de n8n, o si
el flujo de producción no está activo.
• 500 Internal Server Error: Ocurre si la base de datos Postgres/pgvector no es accesible o el motor LLM (Ollama)
local se encuentra apagado o no responde en el tiempo límite.
