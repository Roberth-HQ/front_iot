import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      // Acción para cambiar el tema
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'theme-storage' }
  )
);