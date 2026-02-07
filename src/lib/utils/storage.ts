import type { Project } from '../types';

const STORAGE_KEY = 'cut-stock-calculator-projects';
const CURRENT_PROJECT_KEY = 'cut-stock-calculator-current';

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const projects = JSON.parse(data);
    return projects.map((p: Project) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (e) {
    console.error('Failed to load projects:', e);
    return [];
  }
}

export function saveCurrentProject(projectId: string): void {
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  } catch (e) {
    console.error('Failed to save current project:', e);
  }
}

export function loadCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  } catch (e) {
    console.error('Failed to load current project:', e);
    return null;
  }
}

export function exportProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function importProject(json: string): Project | null {
  try {
    const project = JSON.parse(json);
    return {
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    };
  } catch (e) {
    console.error('Failed to import project:', e);
    return null;
  }
}
