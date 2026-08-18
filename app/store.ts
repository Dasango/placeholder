import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Actions
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setDocuments: (projectId: string, docs: UploadedDocument[]) => void;
  setChats: (projectId: string, chats: ChatMessage[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: "default_project",
          name: "Proyecto Ejemplo",
          createdAt: new Date().toLocaleDateString(),
        },
      ],
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
    }),
    {
      name: "rag-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
