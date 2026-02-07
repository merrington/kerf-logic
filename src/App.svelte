<script lang="ts">
  import { onMount } from 'svelte';
  import { currentProject, materials, pieces, settings, initProject } from './lib/stores/project';
  import { calculateGuillotineCut } from './lib/algorithms/guillotine';
  import type { CutLayout } from './lib/types';
  import MaterialList from './lib/components/MaterialList.svelte';
  import PieceList from './lib/components/PieceList.svelte';
  import CutDiagram from './lib/components/CutDiagram.svelte';
  import BOMDisplay from './lib/components/BOMDisplay.svelte';
  import Settings from './lib/components/Settings.svelte';
  import ProjectManager from './lib/components/ProjectManager.svelte';
  
  let layout = $state<CutLayout | null>(null);
  let isCalculating = $state(false);
  
  onMount(() => {
    initProject();
  });
  
  function calculateLayout() {
    if ($materials.length === 0 || $pieces.length === 0) {
      layout = null;
      return;
    }
    
    isCalculating = true;
    
    setTimeout(() => {
      try {
        layout = calculateGuillotineCut($materials, $pieces, $settings);
        currentProject.save();
      } catch (e) {
        console.error('Calculation error:', e);
      } finally {
        isCalculating = false;
      }
    }, 50);
  }
  
  function updateProjectName(name: string) {
    if ($currentProject) {
      $currentProject.name = name;
      currentProject.save();
    }
  }
</script>

<main class="min-h-screen bg-gray-100">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Kerf Logic</h1>
        <div class="flex items-center gap-4">
          <input
            type="text"
            value={$currentProject?.name ?? 'Untitled Project'}
            onchange={(e) => updateProjectName(e.currentTarget.value)}
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          <ProjectManager />
          <button
            onclick={calculateLayout}
            disabled={$materials.length === 0 || $pieces.length === 0 || isCalculating}
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {#if isCalculating}
              Calculating...
            {:else if $materials.length === 0 || $pieces.length === 0}
              Add Materials & Pieces
            {:else}
              Calculate Layout
            {/if}
          </button>
        </div>
      </div>
    </div>
  </header>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column -->
      <div class="space-y-6">
        <MaterialList />
        <PieceList />
        <Settings />
      </div>
      
      <!-- Right Column -->
      <div class="space-y-6">
        <CutDiagram {layout} materials={$materials} pieces={$pieces} />
        <BOMDisplay {layout} materials={$materials} />
      </div>
    </div>
  </div>
</main>
