import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <--- Importante

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, userToken) => {
        console.log("CEREBRO: Guardando datos...", userData);
        set({ 
          user: userData, 
          token: userToken, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        console.log("CEREBRO: Limpiando sesión");
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage'); // Limpieza extra
      },
    }),
    {
      name: 'auth-storage', // Nombre de la llave en LocalStorage
    }
  )
);