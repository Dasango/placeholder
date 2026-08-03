import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  username: string;
  profileImage: string;
  isDarkMode: boolean;
  setUsername: (username: string) => void;
  setProfileImage: (profileImage: string) => void;
  toggleTheme: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: "alejo",
      profileImage:
        "https://i.pinimg.com/736x/1c/c3/64/1cc3647babd449f43a03efdc51d3c9a7.jpg",
      isDarkMode: true,
      setUsername: (username: string) => set({ username }),
      setProfileImage: (profileImage: string) => set({ profileImage }),
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
