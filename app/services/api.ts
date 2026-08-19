import { N8N_URL } from "../config";
import { Platform } from "react-native";

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

export interface BackendProject {
  id: string;
  name: string;
  createdAt?: string;
  documents?: string[];
}

export async function checkBackendConnection(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${N8N_URL}/healthz`, {
      method: "GET",
      signal: controller.signal,
    });

    return response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches all projects (and their documents) from the n8n backend.
 */
export async function getProjectsApi(): Promise<BackendProject[]> {
  const response = await fetch(`${N8N_URL}/webhook/get-projects`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  const data = await response.json();
  const rows = Array.isArray(data) ? data : data?.projects ?? [];

  return rows.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? row.id ?? ""),
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
    documents: parseDocuments(row.documents),
  }));
}

function parseDocuments(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Registers a new project in the n8n backend so it persists across devices.
 */
export async function createProjectApi(projectId: string, name: string): Promise<void> {
  const response = await fetch(`${N8N_URL}/webhook/create-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`);
  }
}

/**
 * Uploads a document (PDF/CSV) to the n8n backend ingestion flow.
 */
export async function uploadDocumentApi(file: FileData, projectId: string): Promise<any> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const blob = await fetch(file.uri).then((r) => r.blob());
    formData.append("data", blob, file.name);
  } else {
    formData.append("data", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/pdf",
    } as any);
  }

  formData.append("projectId", projectId);

  const response = await fetch(`${N8N_URL}/webhook/upload-pdf`, {
    method: "POST",
    body: formData,
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
