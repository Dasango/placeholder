import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  checkBackendConnection,
  uploadDocumentApi,
  deleteDocumentApi,
  deleteProjectApi,
  sendChatMessageApi,
  FileData,
} from "./api";

/**
 * Hook to query backend connectivity.
 * Used on the home page to display the "no connection" warning.
 */
export function useConnectionCheck() {
  return useQuery({
    queryKey: ["backend-connection"],
    queryFn: checkBackendConnection,
    refetchInterval: 10000, // Check connection every 10 seconds
    retry: 1,
  });
}

/**
 * Mutation hook to upload documents.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, projectId }: { file: FileData; projectId: string }) =>
      uploadDocumentApi(file, projectId),
    onSuccess: () => {
      // Invalidate connection state or list queries if any
      queryClient.invalidateQueries({ queryKey: ["backend-connection"] });
    },
  });
}

/**
 * Mutation hook to delete a specific document.
 */
export function useDeleteDocument() {
  return useMutation({
    mutationFn: ({ projectId, documentName }: { projectId: string; documentName: string }) =>
      deleteDocumentApi(projectId, documentName),
  });
}

/**
 * Mutation hook to delete a project's files in the backend.
 */
export function useDeleteProjectFiles() {
  return useMutation({
    mutationFn: (projectId: string) => deleteProjectApi(projectId),
  });
}

/**
 * Mutation hook to send a message to the AI agent.
 */
export function useSendChatMessage() {
  return useMutation({
    mutationFn: ({ message, projectId }: { message: string; projectId: string }) =>
      sendChatMessageApi(message, projectId),
  });
}
