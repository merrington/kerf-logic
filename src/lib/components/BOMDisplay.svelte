<script lang="ts">
  import type { CutLayout, Material } from '../types';
  import { settings } from '../stores/project';
  import { formatDimension } from '../utils/units';
  
  interface Props {
    layout: CutLayout | null;
    materials: Material[];
  }
  
  let { layout, materials }: Props = $props();
  
  function getMaterialName(materialId: string): string {
    return materials.find(m => m.id === materialId)?.name ?? 'Unknown';
  }
  
  function getMaterialCost(materialId: string): number {
    return materials.find(m => m.id === materialId)?.costPerSheet ?? 0;
  }
  
  function getBOM(): { materialId: string; count: number; cost: number }[] {
    if (!layout) return [];
    
    const counts = new Map<string, number>();
    
    for (const sheet of layout.sheets) {
      counts.set(sheet.materialId, (counts.get(sheet.materialId) ?? 0) + 1);
    }
    
    return Array.from(counts.entries())
      .map(([materialId, count]) => ({
        materialId,
        count,
        cost: count * getMaterialCost(materialId),
      }))
      .sort((a, b) => a.materialId.localeCompare(b.materialId));
  }
  
  function exportBOM() {
    if (!layout) return;
    
    const bom = getBOM();
    let csv = 'Material,Quantity,Cost per Sheet,Total Cost\n';
    
    for (const item of bom) {
      const material = materials.find(m => m.id === item.materialId);
      csv += `"${getMaterialName(item.materialId)}",${item.count},${material?.costPerSheet ?? 0},${item.cost.toFixed(2)}\n`;
    }
    
    const totalCost = bom.reduce((sum, item) => sum + item.cost, 0);
    csv += `,,Total,${totalCost.toFixed(2)}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bom.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function printLayout() {
    window.print();
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-semibold mb-4">Bill of Materials</h2>
  
  {#if !layout || layout.sheets.length === 0}
    <div class="text-gray-500 text-center py-8">
      <p>Calculate the layout to see the BOM.</p>
    </div>
  {:else}
    {@const bom = getBOM()}
    {@const totalCost = bom.reduce((sum, item) => sum + item.cost, 0)}
    {@const totalSheets = bom.reduce((sum, item) => sum + item.count, 0)}
    
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div class="text-sm text-gray-600">Total Sheets</div>
          <div class="text-2xl font-bold">{totalSheets}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Waste</div>
          <div class="text-2xl font-bold">
            {((layout.totalWaste / layout.totalArea) * 100).toFixed(1)}%
          </div>
          <div class="text-sm text-gray-500">
            {formatDimension(layout.totalWaste, $settings.unitSystem)}²
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Total Cost</div>
          <div class="text-2xl font-bold">${totalCost.toFixed(2)}</div>
        </div>
      </div>
      
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Material</th>
            <th class="text-right py-2">Sheets Needed</th>
            <th class="text-right py-2">Unit Cost</th>
            <th class="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each bom as item}
            {@const material = materials.find(m => m.id === item.materialId)}
            <tr class="border-b">
              <td class="py-2">{getMaterialName(item.materialId)}</td>
              <td class="text-right py-2">{item.count}</td>
              <td class="text-right py-2">${material?.costPerSheet?.toFixed(2) ?? '0.00'}</td>
              <td class="text-right py-2">${item.cost.toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="font-semibold">
            <td class="py-2">Total</td>
            <td class="text-right py-2">{totalSheets}</td>
            <td></td>
            <td class="text-right py-2">${totalCost.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <div class="flex gap-3 pt-4">
        <button
          onclick={exportBOM}
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Export CSV
        </button>
        <button
          onclick={printLayout}
          class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Print
        </button>
      </div>
    </div>
  {/if}
</div>
