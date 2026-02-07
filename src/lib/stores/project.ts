import { writable, derived } from 'svelte/store';
import type { Project, Material, CutPiece, ProjectSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { loadProjects, saveProjects, loadCurrentProjectId, saveCurrentProject } from '../utils/storage';

function createProjectsListStore() {
  const { subscribe, set } = writable<Project[]>(loadProjects());

  return {
    subscribe,
    refresh: () => set(loadProjects()),
    deleteProject: (id: string) => {
      const projects = loadProjects().filter(p => p.id !== id);
      saveProjects(projects);
      set(projects);
    },
  };
}

const projectsList = createProjectsListStore();

function createProjectStore() {
  const { subscribe, set, update } = writable<Project | null>(null);
  
  return {
    subscribe,
    set,
    update,
    createNew: (name: string = 'New Project') => {
      const project: Project = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        materials: [],
        pieces: [],
        settings: { ...DEFAULT_SETTINGS },
      };
      set(project);
      saveCurrentProject(project.id);
      
      // Add to projects list
      const projects = loadProjects();
      projects.push(project);
      saveProjects(projects);
      
      return project;
    },
    loadProject: (project: Project) => {
      set(project);
      saveCurrentProject(project.id);
    },
    addMaterial: (material: Material) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          materials: [...p.materials, material],
          updatedAt: new Date(),
        };
      });
    },
    updateMaterial: (id: string, updates: Partial<Material>) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          materials: p.materials.map(m => m.id === id ? { ...m, ...updates } : m),
          updatedAt: new Date(),
        };
      });
    },
    removeMaterial: (id: string) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          materials: p.materials.filter(m => m.id !== id),
          updatedAt: new Date(),
        };
      });
    },
    addPiece: (piece: CutPiece) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          pieces: [...p.pieces, piece],
          updatedAt: new Date(),
        };
      });
    },
    updatePiece: (id: string, updates: Partial<CutPiece>) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          pieces: p.pieces.map(piece => piece.id === id ? { ...piece, ...updates } : piece),
          updatedAt: new Date(),
        };
      });
    },
    removePiece: (id: string) => {
      update(p => {
        if (!p) return p;
        return {
          ...p,
          pieces: p.pieces.filter(piece => piece.id !== id),
          updatedAt: new Date(),
        };
      });
    },
    updateSettings: (settings: Partial<ProjectSettings>) => {
      update(p => {
        if (!p) return p;
        const updated = {
          ...p,
          settings: { ...p.settings, ...settings },
          updatedAt: new Date(),
        };
        // Persist settings changes immediately
        const projects = loadProjects();
        const existingIndex = projects.findIndex(proj => proj.id === updated.id);
        if (existingIndex >= 0) {
          projects[existingIndex] = updated;
        } else {
          projects.push(updated);
        }
        saveProjects(projects);
        // Refresh projectsList to reflect changes
        projectsList.refresh();
        return updated;
      });
    },
    save: () => {
      update(p => {
        if (!p) return p;
        const projects = loadProjects();
        const existingIndex = projects.findIndex(proj => proj.id === p.id);
        
        if (existingIndex >= 0) {
          projects[existingIndex] = p;
        } else {
          projects.push(p);
        }
        
        saveProjects(projects);
        return p;
      });
    },
  };
}

export const currentProject = createProjectStore();
export { projectsList };

export const materials = derived(currentProject, $project => $project?.materials ?? []);
export const pieces = derived(currentProject, $project => $project?.pieces ?? []);
export const settings = derived(currentProject, $project => $project?.settings ?? DEFAULT_SETTINGS);

export function initProject() {
  const savedId = loadCurrentProjectId();
  const projects = loadProjects();
  
  if (savedId) {
    const project = projects.find(p => p.id === savedId);
    if (project) {
      currentProject.loadProject(project);
      return;
    }
  }
  
  if (projects.length > 0) {
    currentProject.loadProject(projects[0]);
  } else {
    currentProject.createNew('My First Project');
  }
}
