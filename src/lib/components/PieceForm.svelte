<script lang="ts">
  import type { CutPiece, Material, GrainDirection } from '../types';
  import { formatDimension, parseDimension } from '../utils/units';
  import { settings, materials } from '../stores/project';
  
  interface Props {
    piece?: CutPiece | null;
    onSave: (piece: CutPiece) => void;
    onCancel: () => void;
  }
  
  let { piece = null, onSave, onCancel }: Props = $props();
  
  let name = $state(piece?.name ?? '');
  let materialId = $state(piece?.materialId ?? ($materials[0]?.id ?? ''));
  let lengthInput = $state(piece ? formatDimension(piece.dimensions.length, $settings.unitSystem) : '');
  let widthInput = $state(piece ? formatDimension(piece.dimensions.width, $settings.unitSystem) : '');
  let quantity = $state(piece?.quantity ?? 1);
  let grainDirection = $state<GrainDirection>(piece?.grainDirection ?? 'none');
  let notes = $state(piece?.notes ?? '');
  let error = $state('');
  
  function handleSubmit() {
    error = '';
    
    if (!name.trim()) {
      error = 'Piece name is required';
      return;
    }
    
    if (!materialId) {
      error = 'Please select a material';
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
    
    if (quantity < 1) {
      error = 'Quantity must be at least 1';
      return;
    }
    
    const newPiece: CutPiece = {
      id: piece?.id ?? crypto.randomUUID(),
      name: name.trim(),
      dimensions: { length, width },
      materialId,
      quantity,
      grainDirection,
      notes: notes.trim() || undefined,
    };
    
    onSave(newPiece);
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6 mb-4">
  <h3 class="text-lg font-semibold mb-4">
    {piece ? 'Edit Piece' : 'Add New Piece'}
  </h3>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}
  
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Piece Name
      </label>
      <input
        type="text"
        bind:value={name}
        placeholder="e.g., Cabinet Side Panel"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Material
      </label>
      <select
        bind:value={materialId}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each $materials as material}
          <option value={material.id}>{material.name}</option>
        {/each}
      </select>
      {#if $materials.length === 0}
        <p class="text-sm text-red-600 mt-1">Please add a material first</p>
      {/if}
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Length ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={lengthInput}
          placeholder={$settings.unitSystem === 'imperial' ? '24' : '610'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Width ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={widthInput}
          placeholder={$settings.unitSystem === 'imperial' ? '12' : '305'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          bind:value={quantity}
          min="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Grain Direction
        </label>
        <select
          bind:value={grainDirection}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">No preference</option>
          <option value="lengthwise">Lengthwise</option>
          <option value="widthwise">Widthwise</option>
        </select>
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Notes (optional)
      </label>
      <textarea
        bind:value={notes}
        placeholder="Any special instructions..."
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>
    
    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        disabled={$materials.length === 0}
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {piece ? 'Update' : 'Add'} Piece
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
