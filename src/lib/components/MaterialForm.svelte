<script lang="ts">
  import type { Material } from '../types';
  import { formatDimension, parseDimension } from '../utils/units';
  import { settings } from '../stores/project';
  
  interface Props {
    material?: Material | null;
    onSave: (material: Material) => void;
    onCancel: () => void;
  }
  
  let { material = null, onSave, onCancel }: Props = $props();
  
  let name = $state(material?.name ?? '');
  let lengthInput = $state(material ? formatDimension(material.sheetSize.length, $settings.unitSystem) : '');
  let widthInput = $state(material ? formatDimension(material.sheetSize.width, $settings.unitSystem) : '');
  let costPerSheet = $state(material?.costPerSheet ?? '');
  let quantityOnHand = $state(material?.quantityOnHand ?? '');
  let error = $state('');
  
  function handleSubmit() {
    error = '';
    
    if (!name.trim()) {
      error = 'Material name is required';
      return;
    }
    
    const length = parseDimension(lengthInput, $settings.unitSystem);
    const width = parseDimension(widthInput, $settings.unitSystem);
    
    if (length === null || length <= 0) {
      error = 'Invalid length';
      return;
    }
    
    if (width === null || width <= 0) {
      error = 'Invalid width';
      return;
    }
    
    const newMaterial: Material = {
      id: material?.id ?? crypto.randomUUID(),
      name: name.trim(),
      sheetSize: { length, width },
      costPerSheet: costPerSheet ? parseFloat(costPerSheet as string) : undefined,
      quantityOnHand: quantityOnHand ? parseInt(quantityOnHand as string) : undefined,
    };
    
    onSave(newMaterial);
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6 mb-4">
  <h3 class="text-lg font-semibold mb-4">
    {material ? 'Edit Material' : 'Add New Material'}
  </h3>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}
  
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Material Name
      </label>
      <input
        type="text"
        bind:value={name}
        placeholder="e.g., 3/4in Walnut Plywood"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Sheet Length ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={lengthInput}
          placeholder={$settings.unitSystem === 'imperial' ? '96' : '2440'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="text-xs text-gray-500 mt-1">
          {$settings.unitSystem === 'imperial' ? 'Use fractions like 96 or 96 1/2' : 'In millimeters'}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Sheet Width ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={widthInput}
          placeholder={$settings.unitSystem === 'imperial' ? '48' : '1220'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Cost Per Sheet (optional)
        </label>
        <input
          type="number"
          bind:value={costPerSheet}
          placeholder="0.00"
          step="0.01"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Quantity On Hand (optional)
        </label>
        <input
          type="number"
          bind:value={quantityOnHand}
          placeholder="0"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        {material ? 'Update' : 'Add'} Material
      </button>
      <button
        type="button"
        onclick={onCancel}
        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  </form>
</div>
