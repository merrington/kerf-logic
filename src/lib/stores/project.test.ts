import { describe, it, expect, beforeEach } from 'vitest';
import { currentProject, projectsList, initProject } from './project';
import { loadProjects, loadCurrentProjectId } from '../utils/storage';
import { get } from 'svelte/store';

describe('Project Store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('createNew', () => {
    it('should create a new project with given name', () => {
      const project = currentProject.createNew('My Test Project');

      expect(project.name).toBe('My Test Project');
      expect(project.materials).toEqual([]);
      expect(project.pieces).toEqual([]);
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should set the new project as current', () => {
      const project = currentProject.createNew('Current Project');

      const current = get(currentProject);
      expect(current?.id).toBe(project.id);
      expect(current?.name).toBe('Current Project');
    });

    it('should save the new project to localStorage', () => {
      currentProject.createNew('Saved Project');

      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(1);
      expect(savedProjects[0].name).toBe('Saved Project');
    });

    it('should save the current project ID', () => {
      const project = currentProject.createNew('Project With ID');

      const savedId = loadCurrentProjectId();
      expect(savedId).toBe(project.id);
    });

    it('should add multiple projects to the list', () => {
      currentProject.createNew('Project 1');
      currentProject.createNew('Project 2');
      currentProject.createNew('Project 3');

      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(3);
      
      const names = savedProjects.map(p => p.name);
      expect(names).toContain('Project 1');
      expect(names).toContain('Project 2');
      expect(names).toContain('Project 3');
    });

    it('should use default name when none provided', () => {
      const project = currentProject.createNew();

      expect(project.name).toBe('New Project');
    });

    it('should refresh projectsList store after creating', () => {
      let projects = get(projectsList);
      expect(projects).toHaveLength(0);

      currentProject.createNew('Test Project');
      
      // Reload from storage
      projectsList.refresh();
      projects = get(projectsList);
      
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Test Project');
    });
  });

  describe('loadProject', () => {
    it('should load an existing project as current', () => {
      // Create first
      const project1 = currentProject.createNew('Project One');
      currentProject.createNew('Project Two');

      // Load first one
      currentProject.loadProject(project1);

      const current = get(currentProject);
      expect(current?.name).toBe('Project One');
    });

    it('should save the loaded project as current', () => {
      const project = currentProject.createNew('To Load');
      
      currentProject.loadProject(project);
      
      const savedId = loadCurrentProjectId();
      expect(savedId).toBe(project.id);
    });
  });

  describe('save', () => {
    it('should save current project to projects list', () => {
      currentProject.createNew('Initial Project');
      
      // Add a material
      currentProject.addMaterial({
        id: 'm1',
        name: 'Test Material',
        sheetSize: { length: 100, width: 200 },
      });

      // Save it
      currentProject.save();

      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(1);
      expect(savedProjects[0].materials).toHaveLength(1);
      expect(savedProjects[0].materials[0].name).toBe('Test Material');
    });

    it('should update existing project instead of duplicating', () => {
      const project = currentProject.createNew('Original');
      
      // Modify and save
      currentProject.addMaterial({
        id: 'm1',
        name: 'New Material',
        sheetSize: { length: 100, width: 200 },
      });
      currentProject.save();

      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(1);
      expect(savedProjects[0].materials).toHaveLength(1);
    });
  });

  describe('initProject', () => {
    it('should create first project when none exist', () => {
      initProject();

      const current = get(currentProject);
      expect(current).not.toBeNull();
      expect(current?.name).toBe('My First Project');

      const projects = loadProjects();
      expect(projects).toHaveLength(1);
    });

    it('should load existing projects if current ID is set', () => {
      const project = currentProject.createNew('Saved Project');
      
      // Simulate fresh load
      window.localStorage.clear();
      currentProject.set(null);
      
      // Re-create and save
      currentProject.createNew('Saved Project');
      
      initProject();

      const current = get(currentProject);
      expect(current?.name).toBe('Saved Project');
    });

    it('should load first project when no current ID', () => {
      currentProject.createNew('Project A');
      currentProject.createNew('Project B');
      
      // Clear current ID
      window.localStorage.removeItem('cut-stock-calculator-current');
      currentProject.set(null);
      
      initProject();

      const current = get(currentProject);
      expect(current).not.toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should update project settings', () => {
      currentProject.createNew('Settings Test');

      currentProject.updateSettings({ unitSystem: 'metric' });

      const current = get(currentProject);
      expect(current?.settings.unitSystem).toBe('metric');
    });

    it('should persist settings to localStorage immediately', () => {
      currentProject.createNew('Persistence Test');

      currentProject.updateSettings({
        unitSystem: 'metric',
        sawKerf: 5,
        edgeMargin: 10,
      });

      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(1);
      expect(savedProjects[0].settings.unitSystem).toBe('metric');
      expect(savedProjects[0].settings.sawKerf).toBe(5);
      expect(savedProjects[0].settings.edgeMargin).toBe(10);
    });

    it('should update updatedAt timestamp', () => {
      const project = currentProject.createNew('Timestamp Test');
      const originalUpdatedAt = project.updatedAt;

      // Wait a tiny bit to ensure timestamp changes
      setTimeout(() => {
        currentProject.updateSettings({ allowRotation: false });

        const current = get(currentProject);
        expect(current?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should refresh projectsList when settings are updated', () => {
      currentProject.createNew('Refresh Test');

      // Get initial projects list
      projectsList.refresh();
      let projects = get(projectsList);
      expect(projects[0].settings.unitSystem).toBe('imperial');

      // Update settings
      currentProject.updateSettings({ unitSystem: 'metric' });

      // Verify projectsList was refreshed
      projects = get(projectsList);
      expect(projects[0].settings.unitSystem).toBe('metric');
    });

    it('should maintain separate settings for different projects', () => {
      // Create project 1 and update its settings
      currentProject.createNew('Project 1');
      currentProject.updateSettings({ unitSystem: 'metric', sawKerf: 5 });

      // Create project 2 and update its settings  
      currentProject.createNew('Project 2');
      currentProject.updateSettings({ unitSystem: 'imperial', sawKerf: 3.175 });

      // Load both projects from storage to get fresh copies
      const savedProjects = loadProjects();
      expect(savedProjects).toHaveLength(2);
      
      // Find projects by name
      const proj1 = savedProjects.find(p => p.name === 'Project 1')!;
      const proj2 = savedProjects.find(p => p.name === 'Project 2')!;

      // Verify they have different settings
      expect(proj1.settings.unitSystem).toBe('metric');
      expect(proj1.settings.sawKerf).toBe(5);
      expect(proj2.settings.unitSystem).toBe('imperial');
      expect(proj2.settings.sawKerf).toBe(3.175);

      // Load project 1 and verify settings display correctly
      currentProject.loadProject(proj1);
      let current = get(currentProject);
      expect(current?.settings.unitSystem).toBe('metric');
      expect(current?.settings.sawKerf).toBe(5);

      // Load project 2 and verify settings display correctly
      currentProject.loadProject(proj2);
      current = get(currentProject);
      expect(current?.settings.unitSystem).toBe('imperial');
      expect(current?.settings.sawKerf).toBe(3.175);
    });
  });

  describe('projectsList', () => {
    it('should list all saved projects', () => {
      currentProject.createNew('Project Alpha');
      currentProject.createNew('Project Beta');
      
      projectsList.refresh();
      const projects = get(projectsList);
      
      expect(projects).toHaveLength(2);
    });

    it('should delete a project', () => {
      const project = currentProject.createNew('To Delete');
      currentProject.createNew('Keep This');
      
      projectsList.deleteProject(project.id);
      
      const projects = get(projectsList);
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Keep This');
    });

    it('should refresh from localStorage', () => {
      currentProject.createNew('First');
      
      // Directly modify localStorage
      const projects = loadProjects();
      projects.push({
        id: 'manual-id',
        name: 'Manual Project',
        createdAt: new Date(),
        updatedAt: new Date(),
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
      });
      
      // Need to stringify for localStorage
      window.localStorage.setItem('cut-stock-calculator-projects', JSON.stringify(projects));
      
      projectsList.refresh();
      const refreshed = get(projectsList);
      
      expect(refreshed).toHaveLength(2);
    });
  });
});
