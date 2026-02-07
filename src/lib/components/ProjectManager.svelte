<script lang="ts">
  import type { Project } from '../types';
  import { currentProject, projectsList } from '../stores/project';
  import { exportProject, importProject } from '../utils/storage';
  
  let isOpen = $state(false);
  let newProjectName = $state('');
  let showNewProjectForm = $state(false);
  let importError = $state('');
  let fileInput: HTMLInputElement | null = $state(null);
  let editingProjectId = $state<string | null>(null);
  let editProjectName = $state('');
  
  function handleCreateProject() {
    if (newProjectName.trim()) {
      currentProject.createNew(newProjectName.trim());
      projectsList.refresh();
      newProjectName = '';
      showNewProjectForm = false;
      isOpen = false;
    }
  }
  
  function handleSwitchProject(project: Project) {
    currentProject.loadProject(project);
    isOpen = false;
  }

  function startRename(project: Project, event: MouseEvent) {
    event.stopPropagation();
    editingProjectId = project.id;
    editProjectName = project.name;
  }

  function handleRename(project: Project) {
    if (editProjectName.trim() && editProjectName.trim() !== project.name) {
      const updatedProject = { ...project, name: editProjectName.trim(), updatedAt: new Date() };
      
      // Update in projects list
      const projects = JSON.parse(localStorage.getItem('cut-stock-calculator-projects') || '[]');
      const index = projects.findIndex((p: Project) => p.id === project.id);
      if (index >= 0) {
        projects[index] = updatedProject;
        localStorage.setItem('cut-stock-calculator-projects', JSON.stringify(projects));
      }
      
      // Update current project if it's the one being renamed
      if ($currentProject?.id === project.id) {
        currentProject.loadProject(updatedProject);
      }
      
      projectsList.refresh();
    }
    editingProjectId = null;
    editProjectName = '';
  }

  function cancelRename() {
    editingProjectId = null;
    editProjectName = '';
  }
  
  function handleDeleteProject(projectId: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      projectsList.deleteProject(projectId);
      if ($currentProject?.id === projectId) {
        currentProject.createNew('New Project');
      }
    }
  }
  
  function handleExportProject(project: Project, event: MouseEvent) {
    event.stopPropagation();
    const json = exportProject(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function handleImportClick() {
    fileInput?.click();
  }
  
  function handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const project = importProject(json);
        
        if (project) {
          // Generate new ID to avoid conflicts
          project.id = crypto.randomUUID();
          project.name = `${project.name} (Imported)`;
          project.createdAt = new Date();
          project.updatedAt = new Date();
          
          currentProject.loadProject(project);
          currentProject.save();
          projectsList.refresh();
          importError = '';
          isOpen = false;
        } else {
          importError = 'Invalid project file format';
        }
      } catch (err) {
        importError = 'Failed to import project';
        console.error(err);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
</script>

<div class="relative">
  <button
    onclick={() => isOpen = !isOpen}
    class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
    Projects
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>
  
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Your Projects</h3>
          <button
            onclick={() => showNewProjectForm = !showNewProjectForm}
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + New Project
          </button>
        </div>
        
        {#if showNewProjectForm}
          <div class="mt-3 flex gap-2">
            <input
              type="text"
              bind:value={newProjectName}
              placeholder="Project name"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onkeydown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <button
              onclick={handleCreateProject}
              disabled={!newProjectName.trim()}
              class="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Create
            </button>
          </div>
        {/if}
      </div>
      
      <div class="max-h-64 overflow-y-auto">
        {#if $projectsList.length === 0}
          <div class="p-4 text-center text-gray-500 text-sm">
            No projects yet. Create your first project!
          </div>
        {:else}
          {#each $projectsList as project}
            <div
              class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              class:bg-blue-50={$currentProject?.id === project.id}
              onclick={() => handleSwitchProject(project)}
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  {#if editingProjectId === project.id}
                    <div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        bind:value={editProjectName}
                        class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        onkeydown={(e) => {
                          if (e.key === 'Enter') handleRename(project);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onblur={() => handleRename(project)}
                      />
                    </div>
                  {:else}
                    <p class="font-medium text-gray-900 truncate" class:text-blue-600={$currentProject?.id === project.id}>
                      {project.name}
                    </p>
                  {/if}
                  <p class="text-xs text-gray-500">
                    Updated {project.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div class="flex items-center gap-1 ml-2">
                  {#if editingProjectId !== project.id}
                    <button
                      onclick={(e) => startRename(project, e)}
                      class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                      title="Rename project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  {/if}
                  <button
                    onclick={(e) => handleExportProject(project, e)}
                    class="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200"
                    title="Export as JSON"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  {#if $projectsList.length > 1}
                    <button
                      onclick={(e) => handleDeleteProject(project.id, e)}
                      class="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      title="Delete project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
      
      <div class="p-4 border-t border-gray-200">
        <button
          onclick={handleImportClick}
          class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-9.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" transform="rotate(180 10 10)" />
          </svg>
          Import Project from JSON
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept=".json"
          class="hidden"
          onchange={handleFileImport}
        />
        {#if importError}
          <p class="mt-2 text-sm text-red-600">{importError}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

{#if isOpen}
  <div class="fixed inset-0 z-40" onclick={() => isOpen = false}></div>
{/if}
