# Local Document RAG (n8n + PostgreSQL pgvector + Expo React Native)

Este proyecto es una aplicación de inteligencia artificial (RAG - Retrieval-Augmented Generation) ejecutada **100% de forma local** para almacenar y chatear con tus propios documentos (.PDF, .CSV).

La base de datos vectorial es persistente gracias a Docker, y los flujos de n8n se sincronizan automáticamente con tu repositorio Git mediante scripts de PowerShell provistos.

---

## 🏗️ Arquitectura del Sistema

```
[ Celular / App Expo ] ──(Webhooks HTTP)──► [ n8n Docker ] ──► [ OpenAI LLM / Embeddings ]
                                                │
                                                ▼ (Vectores)
                                      [ Postgres pgvector Docker ]
```

1. **Frontend Móvil:** App en React Native con Expo utilizando **NativeWind** (Tailwind CSS) con dos pantallas interactivas: selector/subidor de PDFs y sala de chat.
2. **Orquestador (n8n):** Flujo local en Docker que recibe los documentos mediante Webhooks, procesa el texto, genera los embeddings y atiende las consultas del chat del usuario mediante un Agente de IA.
3. **Persistencia (PostgreSQL + pgvector):** Base de datos PostgreSQL local en Docker con soporte para vectores, permitiendo acceder a la información indexada hoy, en 2 semanas, o en 5 años.

---

## ⚡ Guía de Inicio Rápido

Sigue estos pasos para arrancar el proyecto en tu entorno local.

### Paso 1: Iniciar los contenedores de Docker
Asegúrate de tener Docker Desktop abierto y ejecuta en la raíz del proyecto:
```bash
docker compose up -d
```
Esto levantará dos contenedores:
* **n8n** en `http://localhost:5678`
* **PostgreSQL + pgvector** en el puerto `5432` (inicializado automáticamente con la extensión de vectores).

### Paso 2: Importar los flujos de trabajo a n8n
Hemos creado un script que une tus flujos guardados y los sube a n8n. Ejecuta en PowerShell:
```powershell
.\restore-workflows.ps1
```
Una vez ejecutado, abre `http://localhost:5678` en tu navegador. Encontrarás el flujo **Rag** ya listo.

### Paso 3: Configurar credenciales en n8n
Dentro de la interfaz web de n8n, abre el flujo **Rag** y configura las siguientes credenciales:

1. **Credencial de OpenAI:** Agrega tu OpenAI API Key en el nodo `Embeddings OpenAI` o `OpenAI Chat Model`.
2. **Credencial de PostgreSQL:** En el nodo `Insert Data to Store` o `Query Data Tool`, crea una credencial de tipo **Postgres** con estos datos:
   * **Host:** `postgres-db`
   * **Database:** `rag_db`
   * **User:** `postgres`
   * **Password:** `rag_secure_pass_123`
   * **Port:** `5432`
   * **SSL:** `Disable`

*Guarda los cambios y activa (deja en ON) el flujo de n8n.*

### Paso 4: Iniciar la Aplicación Móvil
Navega a la carpeta de la app móvil, instala dependencias e inicializa el servidor de desarrollo de Expo:
```bash
cd app
npm install
npx expo start
```
Escanea el código QR desde tu celular con la app **Expo Go** (Android) o la cámara (iOS).

* **Importante:** Dado que n8n corre en tu PC, en la app móvil abre el menú de configuración (icono de engranaje ⚙️) e ingresa la **IP local de tu computadora** en tu red Wi-Fi (ejemplo: `http://192.168.1.15:5678`) para conectar el celular.

---

## 🔄 Sincronización con Git

Para evitar perder los cambios que hagas directamente en la interfaz web de n8n, hemos creado herramientas que documentan tus flujos directamente en el Git de tu repositorio:

* **Hacer copia de seguridad (Exportar a Git):**
  Ejecuta este comando antes de hacer un commit. Extrae todos tus flujos de n8n, los divide en archivos JSON legibles dentro de la carpeta `workflows/` y los deja listos para guardar en Git:
  ```powershell
  .\backup-workflows.ps1
  ```

* **Restaurar flujos (Importar a n8n):**
  Si descargas el repositorio en otra computadora o quieres recuperar el estado original guardado en Git:
  ```powershell
  .\restore-workflows.ps1
  ```

---

## 📂 Estructura del Repositorio

* [`app/`](file:///C:/Users/Desk/git/multiStack/Placeholdername/app) - Código fuente de la app React Native (Expo).
* [`workflows/`](file:///C:/Users/Desk/git/multiStack/Placeholdername/workflows) - Flujos de trabajo de n8n serializados en JSON para Git.
* [`init-db/init.sql`](file:///C:/Users/Desk/git/multiStack/Placeholdername/init-db/init.sql) - Script SQL para inicializar PostgreSQL con la extensión de vectores al primer arranque.
* [`docker-compose.yml`](file:///C:/Users/Desk/git/multiStack/Placeholdername/docker-compose.yml) - Configuración de contenedores locales de Docker.
* [`backup-workflows.ps1`](file:///C:/Users/Desk/git/multiStack/Placeholdername/backup-workflows.ps1) - Script para exportar flujos de Docker a Git.
* [`restore-workflows.ps1`](file:///C:/Users/Desk/git/multiStack/Placeholdername/restore-workflows.ps1) - Script para importar flujos de Git a Docker.
