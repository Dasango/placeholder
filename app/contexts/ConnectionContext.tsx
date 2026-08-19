import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { checkBackendConnection } from "../services/api";

interface ConnectionContextType {
  isOnline: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const check = async () => {
    setIsChecking(true);
    const online = await checkBackendConnection();
    setIsOnline(online);
    setIsChecking(false);
    return online;
  };

  useEffect(() => {
    // Initial check
    check();

    // Check connection every 5 seconds
    const interval = setInterval(check, 5000);

    // Revalidate check when the app returns to the foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        check();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline, isChecking, checkConnection: check }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
