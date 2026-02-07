<script lang="ts">
  import type { Material } from '../types';
  import { currentProject } from '../stores/project';
  import { formatDimension } from '../utils/units';
  import { settings } from '../stores/project';
  import MaterialForm from './MaterialForm.svelte';
  import { MATERIAL_PRESETS } from '../types';
  
  let editingMaterial = $state<Material | null>(null);
  let showForm = $state(false);
  
  function handleSave(material: Material) {
    if (editingMaterial) {
      currentProject.updateMaterial(material.id, material);
    } else {
      currentProject.addMaterial(material);
    }
    showForm = false;
    editingMaterial = null;
  }
  
  function handleCancel() {
    showForm = false;
    editingMaterial = null;
  }
  
  function startEdit(material: Material) {
    editingMaterial = material;
    showForm = true;
  }
  
  function startAdd() {
    editingMaterial = null;
    showForm = true;
  }
  
  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this material?')) {
      currentProject.removeMaterial(id);
    }
  }
  
  function addPreset(preset: typeof MATERIAL_PRESETS[0]) {
    const material: Material = {
      id: crypto.randomUUID(),
      name: preset.name,
      sheetSize: preset.sheetSize,
    };
    currentProject.addMaterial(material);
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">Stock Materials</h2>
    <button
      onclick={startAdd}
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      + Add Material
    </button>
  </div>
  
  {#if showForm}
    <MaterialForm
      material={editingMaterial}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {/if}
  
  {#if $currentProject?.materials.length === 0}
    <div class="text-gray-500 text-center py-8">
      <p class="mb-4">No materials added yet.</p>
      <p class="text-sm mb-2">Quick add presets:</p>
      <div class="flex flex-wrap gap-2 justify-center">
        {#each MATERIAL_PRESETS as preset}
          <button
            onclick={() => addPreset(preset)}
            class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
          >
            {preset.name}
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <div class="space-y-2">
      {#each $currentProject?.materials ?? [] as material (material.id)}
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <div class="font-medium">{material.name}</div>
            <div class="text-sm text-gray-600">
              {formatDimension(material.sheetSize.length, $settings.unitSystem)} × {formatDimension(material.sheetSize.width, $settings.unitSystem)}
              {#if material.costPerSheet}
                • ${material.costPerSheet.toFixed(2)}
              {/if}
            </div>
          </div>
          <div class="flex gap-2">
            <button
              onclick={() => startEdit(material)}
              class="text-blue-600 hover:text-blue-800 px-2 py-1"
            >
              Edit
            </button>
            <button
              onclick={() => handleDelete(material.id)}
              class="text-red-600 hover:text-red-800 px-2 py-1"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
