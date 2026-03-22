// src/context/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Acción para iniciar sesión
      login: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ 
            token, 
            user: decoded, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error("Token inválido", error);
        }
      },

      // Acción para cerrar sesión
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage'); // Limpia el storage
      },
    }),
    {
      name: 'auth-storage', // Nombre de la llave en LocalStorage
    }
  )
);