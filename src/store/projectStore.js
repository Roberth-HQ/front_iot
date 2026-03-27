import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  selectedProjectId: null, // ID del proyecto actual
  projects: [],            // Lista de todos los proyectos
  
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (id) => set({ selectedProjectId: id }),
}));