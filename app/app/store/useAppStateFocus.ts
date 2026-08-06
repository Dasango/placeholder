import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { focusManager } from "@tanstack/react-query";

export function useAppStateFocus() {
  useEffect(() => {
    function onAppStateChange(status: AppStateStatus) {
      focusManager.setFocused(status === "active");
    }

    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
}
