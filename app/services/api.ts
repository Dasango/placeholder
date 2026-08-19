import { N8N_URL } from "../config";

export interface FileData {
  uri: string;
  name: string;
  mimeType: string;
}

export interface ChatResponse {
  output?: string;
  text?: string;
  [key: string]: any;
}

export async function checkBackendConnection(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

  try {
    const response = await fetch(`${N8N_URL}/healthz`, {
      method: "GET",
      signal: controller.signal,
    });
    
    // Status < 500 means server responds (could be 200 ok, or redirects/auth required, but it is reachable)
    return response.status < 500;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Uploads a document (PDF/CSV) to the n8n backend ingestion flow.
 */
export async function uploadDocumentApi(file: FileData, projectId: string): Promise<any> {
  const formData = new FormData();
  
  // React Native FormData requires a specific file structure object
  formData.append("data", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/pdf",
  } as any);
  
  formData.append("projectId", projectId);

  const response = await fetch(`${N8N_URL}/webhook/upload-pdf`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Deletes a single document's vector embeddings from the n8n vector store.
 */
export async function deleteDocumentApi(projectId: string, documentName: string): Promise<any> {
  const response = await fetch(`${N8N_URL}/webhook/delete-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      documentName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Delete document failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Deletes all document vector embeddings associated with a project.
 */
export async function deleteProjectApi(projectId: string): Promise<any> {
  const response = await fetch(`${N8N_URL}/webhook/delete-project`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Delete project documents failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Sends a chat message to the RAG Agent webhook in n8n.
 */
export async function sendChatMessageApi(message: string, projectId: string): Promise<ChatResponse> {
  const response = await fetch(`${N8N_URL}/webhook/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      projectId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status: ${response.status}`);
  }

  return response.json();
}
