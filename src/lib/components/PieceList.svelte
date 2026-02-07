<script lang="ts">
  import type { CutPiece } from '../types';
  import { currentProject, pieces, materials, settings } from '../stores/project';
  import { formatDimension } from '../utils/units';
  import PieceForm from './PieceForm.svelte';
  
  let editingPiece = $state<CutPiece | null>(null);
  let showForm = $state(false);
  
  function handleSave(piece: CutPiece) {
    if (editingPiece) {
      currentProject.updatePiece(piece.id, piece);
    } else {
      currentProject.addPiece(piece);
    }
    showForm = false;
    editingPiece = null;
  }
  
  function handleCancel() {
    showForm = false;
    editingPiece = null;
  }
  
  function startEdit(piece: CutPiece) {
    editingPiece = piece;
    showForm = true;
  }
  
  function startAdd() {
    editingPiece = null;
    showForm = true;
  }
  
  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this piece?')) {
      currentProject.removePiece(id);
    }
  }
  
  function getMaterialName(materialId: string): string {
    return $materials.find(m => m.id === materialId)?.name ?? 'Unknown';
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">Cut List</h2>
    <button
      onclick={startAdd}
      disabled={$materials.length === 0}
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      + Add Piece
    </button>
  </div>
  
  {#if showForm}
    <PieceForm
      piece={editingPiece}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {/if}
  
  {#if $pieces.length === 0}
    <div class="text-gray-500 text-center py-8">
      <p>No pieces added yet.</p>
      {#if $materials.length === 0}
        <p class="text-sm mt-2">Add a material first to start adding pieces.</p>
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      {#each $pieces as piece (piece.id)}
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div class="flex-1">
            <div class="font-medium">{piece.name}</div>
            <div class="text-sm text-gray-600">
              {formatDimension(piece.dimensions.length, $settings.unitSystem)} × {formatDimension(piece.dimensions.width, $settings.unitSystem)}
              • Qty: {piece.quantity}
              • {getMaterialName(piece.materialId)}
              {#if piece.grainDirection !== 'none'}
                • Grain: {piece.grainDirection}
              {/if}
            </div>
            {#if piece.notes}
              <div class="text-xs text-gray-500 mt-1">{piece.notes}</div>
            {/if}
          </div>
          <div class="flex gap-2">
            <button
              onclick={() => startEdit(piece)}
              class="text-blue-600 hover:text-blue-800 px-2 py-1"
            >
              Edit
            </button>
            <button
              onclick={() => handleDelete(piece.id)}
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
