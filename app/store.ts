import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BackendProject } from "./services/api";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AppState {
  projects: Project[];
  documentsByProject: Record<string, UploadedDocument[]>;
  chatsByProject: Record<string, ChatMessage[]>;

  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setDocuments: (projectId: string, docs: UploadedDocument[]) => void;
  setChats: (projectId: string, chats: ChatMessage[]) => void;
  syncFromBackend: (backendProjects: BackendProject[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      documentsByProject: {},
      chatsByProject: {},

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      deleteProject: (projectId) =>
        set((state) => {
          const newDocs = { ...state.documentsByProject };
          delete newDocs[projectId];
          const newChats = { ...state.chatsByProject };
          delete newChats[projectId];
          return {
            projects: state.projects.filter((p) => p.id !== projectId),
            documentsByProject: newDocs,
            chatsByProject: newChats,
          };
        }),

      setDocuments: (projectId, docs) =>
        set((state) => ({
          documentsByProject: {
            ...state.documentsByProject,
            [projectId]: docs,
          },
        })),

      setChats: (projectId, chats) =>
        set((state) => ({
          chatsByProject: {
            ...state.chatsByProject,
            [projectId]: chats,
          },
        })),

      syncFromBackend: (backendProjects) =>
        set((state) => {
          const projectMap = new Map(state.projects.map((p) => [p.id, p]));
          const documentsByProject = { ...state.documentsByProject };

          for (const bp of backendProjects) {
            const existing = projectMap.get(bp.id);
            const name =
              bp.name && bp.name !== bp.id
                ? bp.name
                : existing?.name ?? bp.name;

            projectMap.set(bp.id, {
              id: bp.id,
              name,
              createdAt:
                bp.createdAt ||
                existing?.createdAt ||
                new Date().toLocaleDateString(),
            });

            if (bp.documents && bp.documents.length > 0) {
              const existingDocs = documentsByProject[bp.id] ?? [];
              const existingByName = new Map(existingDocs.map((d) => [d.name, d]));

              documentsByProject[bp.id] = bp.documents.map((fileName) => {
                const local = existingByName.get(fileName);
                return (
                  local ?? {
                    id: fileName,
                    name: fileName,
                    size: 0,
                    timestamp: "",
                  }
                );
              });
            }
          }

          return {
            projects: Array.from(projectMap.values()),
            documentsByProject,
          };
        }),
    }),
    {
      name: "rag-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
