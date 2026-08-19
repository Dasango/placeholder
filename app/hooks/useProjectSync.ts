import { useEffect, useRef } from "react";
import { useConnection } from "../contexts/ConnectionContext";
import { useAppStore } from "../store";
import { getProjectsApi } from "../services/api";

/**
 * Syncs projects and documents from the n8n backend when the connection is online.
 * Runs on initial connect and whenever the app returns online.
 */
export function useProjectSync() {
  const { isOnline } = useConnection();
  const syncFromBackend = useAppStore((state) => state.syncFromBackend);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      hasSynced.current = false;
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const projects = await getProjectsApi();
        if (!cancelled) {
          syncFromBackend(projects);
          hasSynced.current = true;
        }
      } catch (err) {
        console.warn("Could not sync projects from backend:", err);
      }
    };

    sync();
    const interval = setInterval(sync, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnline, syncFromBackend]);
}
