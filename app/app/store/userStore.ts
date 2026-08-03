import { create } from 'zustand';

interface UserState {
  username: string;
  profileImage: string;
  isDarkMode: boolean;
  setUsername: (username: string) => void;
  setProfileImage: (profileImage: string) => void;
  toggleTheme: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: 'alejo',
  profileImage: 'https://i.pinimg.com/736x/1c/c3/64/1cc3647babd449f43a03efdc51d3c9a7.jpg',
  isDarkMode: true,
  setUsername: (username: string) => set({ username }),
  setProfileImage: (profileImage: string) => set({ profileImage }),
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

// Sincronizar el Tema Visual:
// Usa el estado isDarkMode del store para aplicar dinámicamente colores de fondo claro u oscuro a la interfaz de la aplicación de manera global.
// 🎯 Mini Concepto Extra - Reto Obligatorio (Persistencia Local) 💾
// Para asegurar que los datos del usuario no se pierdan cuando cierre y vuelva a abrir la aplicación:

// Utiliza el middleware persist integrado de Zustand junto con un adaptador de almacenamiento para React Native.
// Dado que @react-native-async-storage/async-storage es el estándar en React Native, impórtalo e intégralo en el middleware de Zustand.
// Gotcha de Hidratación: Ten en cuenta que en entornos híbridos o con Expo Router, la lectura desde el almacenamiento es asíncrona. Asegúrate de que tu aplicación maneje correctamente el estado inicial antes de que el store termine de hidratarse del almacenamiento local.