import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProjects,
  loadProjects,
  saveCurrentProject,
  loadCurrentProjectId,
  exportProject,
  importProject,
} from './storage';
import type { Project } from '../types';

const STORAGE_KEY = 'cut-stock-calculator-projects';
const CURRENT_PROJECT_KEY = 'cut-stock-calculator-current';

describe('Storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveProjects', () => {
    it('should save projects to localStorage', () => {
      const projects: Project[] = [
        {
          id: '1',
          name: 'Test Project',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          materials: [],
          pieces: [],
          settings: {
            unitSystem: 'imperial',
            sawKerf: 3.175,
            allowRotation: true,
            optimizationPriority: 'minimizeSheets',
            cutType: 'guillotine',
            edgeMargin: 6.35,
          },
        },
      ];

      saveProjects(projects);

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Test Project');
    });

    it('should handle empty array', () => {
      saveProjects([]);
      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBe('[]');
    });
  });

  describe('loadProjects', () => {
    it('should load projects from localStorage', () => {
      const projects: Project[] = [
        {
          id: '1',
          name: 'Test Project',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          materials: [],
          pieces: [],
          settings: {
            unitSystem: 'imperial',
            sawKerf: 3.175,
            allowRotation: true,
            optimizationPriority: 'minimizeSheets',
            cutType: 'guillotine',
            edgeMargin: 6.35,
          },
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

      const loaded = loadProjects();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('Test Project');
      expect(loaded[0].createdAt).toBeInstanceOf(Date);
      expect(loaded[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no projects exist', () => {
      const loaded = loadProjects();
      expect(loaded).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      const loaded = loadProjects();
      expect(loaded).toEqual([]);
    });
  });

  describe('saveCurrentProject', () => {
    it('should save current project ID', () => {
      saveCurrentProject('project-123');
      const saved = localStorage.getItem(CURRENT_PROJECT_KEY);
      expect(saved).toBe('project-123');
    });
  });

  describe('loadCurrentProjectId', () => {
    it('should load current project ID', () => {
      localStorage.setItem(CURRENT_PROJECT_KEY, 'project-456');
      const loaded = loadCurrentProjectId();
      expect(loaded).toBe('project-456');
    });

    it('should return null when no current project exists', () => {
      const loaded = loadCurrentProjectId();
      expect(loaded).toBeNull();
    });
  });

  describe('exportProject', () => {
    it('should export project as formatted JSON', () => {
      const project: Project = {
        id: '1',
        name: 'Export Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        materials: [
          {
            id: 'm1',
            name: '4x8 Plywood',
            sheetSize: { length: 2438.4, width: 1219.2 },
          },
        ],
        pieces: [],
        settings: {
          unitSystem: 'imperial',
          sawKerf: 3.175,
          allowRotation: true,
          optimizationPriority: 'minimizeSheets',
          cutType: 'guillotine',
          edgeMargin: 6.35,
        },
      };

      const exported = exportProject(project);
      const parsed = JSON.parse(exported);

      expect(parsed.name).toBe('Export Test');
      expect(parsed.materials).toHaveLength(1);
      expect(exported).toContain('\n'); // Should be formatted with indentation
    });
  });

  describe('importProject', () => {
    it('should import project from JSON string', () => {
      const project: Project = {
        id: '1',
        name: 'Import Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        materials: [],
        pieces: [],
        settings: {
          unitSystem: 'metric',
          sawKerf: 3.175,
          allowRotation: false,
          optimizationPriority: 'minimizeWaste',
          cutType: 'guillotine',
          edgeMargin: 6.35,
        },
      };

      const json = JSON.stringify(project);
      const imported = importProject(json);

      expect(imported).not.toBeNull();
      expect(imported!.name).toBe('Import Test');
      expect(imported!.createdAt).toBeInstanceOf(Date);
      expect(imported!.settings.unitSystem).toBe('metric');
    });

    it('should return null for invalid JSON', () => {
      const imported = importProject('invalid json');
      expect(imported).toBeNull();
    });

    it('should handle empty string', () => {
      const imported = importProject('');
      expect(imported).toBeNull();
    });

    it('should preserve all project data', () => {
      const project: Project = {
        id: 'complex-id',
        name: 'Complex Project',
        createdAt: new Date('2024-06-15T10:30:00'),
        updatedAt: new Date('2024-06-16T14:45:00'),
        materials: [
          {
            id: 'mat-1',
            name: '5x5 Baltic Birch',
            sheetSize: { length: 1524, width: 1524 },
            costPerSheet: 85,
            quantityOnHand: 3,
          },
        ],
        pieces: [
          {
            id: 'piece-1',
            name: 'Shelf A',
            dimensions: { length: 609.6, width: 304.8 },
            materialId: 'mat-1',
            quantity: 4,
            grainDirection: 'lengthwise',
            notes: 'Top shelf',
          },
        ],
        settings: {
          unitSystem: 'imperial',
          sawKerf: 3.175,
          allowRotation: true,
          optimizationPriority: 'minimizeSheets',
          cutType: 'guillotine',
          edgeMargin: 6.35,
        },
      };

      const json = JSON.stringify(project);
      const imported = importProject(json);

      expect(imported).not.toBeNull();
      expect(imported!.materials).toHaveLength(1);
      expect(imported!.materials[0].costPerSheet).toBe(85);
      expect(imported!.pieces).toHaveLength(1);
      expect(imported!.pieces[0].grainDirection).toBe('lengthwise');
      expect(imported!.settings.allowRotation).toBe(true);
    });
  });

  describe('round-trip persistence', () => {
    it('should save and load projects preserving all data', () => {
      const projects: Project[] = [
        {
          id: '1',
          name: 'Round Trip Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          materials: [
            {
              id: 'm1',
              name: 'Test Material',
              sheetSize: { length: 100, width: 200 },
            },
          ],
          pieces: [
            {
              id: 'p1',
              name: 'Test Piece',
              dimensions: { length: 50, width: 50 },
              materialId: 'm1',
              quantity: 2,
              grainDirection: 'none',
            },
          ],
          settings: {
            unitSystem: 'metric',
            sawKerf: 3,
            allowRotation: true,
            optimizationPriority: 'minimizeWaste',
            cutType: 'guillotine',
            edgeMargin: 5,
          },
        },
      ];

      saveProjects(projects);
      const loaded = loadProjects();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('Round Trip Test');
      expect(loaded[0].materials).toHaveLength(1);
      expect(loaded[0].pieces).toHaveLength(1);
      expect(loaded[0].settings.unitSystem).toBe('metric');
    });
  });
});
