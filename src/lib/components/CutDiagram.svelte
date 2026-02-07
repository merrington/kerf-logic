<script lang="ts">
  import type { CutLayout, Material, CutPiece } from '../types';
  import { settings } from '../stores/project';
  import { formatDimension } from '../utils/units';
  
  interface Props {
    layout: CutLayout | null;
    materials: Material[];
    pieces: CutPiece[];
  }
  
  let { layout, materials, pieces }: Props = $props();
  
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  ];
  
  function getMaterialName(materialId: string): string {
    return materials.find(m => m.id === materialId)?.name ?? 'Unknown';
  }
  
  function getPieceColor(index: number): string {
    return colors[index % colors.length];
  }

  function getPieceName(pieceId: string): string {
    return pieces.find(p => p.id === pieceId)?.name ?? 'Unknown';
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-semibold mb-4">Cut Layout</h2>
  
  {#if !layout || layout.sheets.length === 0}
    <div class="text-gray-500 text-center py-8">
      <p>Add materials and pieces, then calculate the layout.</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each layout.sheets as sheet, sheetIdx}
        {@const material = materials.find(m => m.id === sheet.materialId)}
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-3">
            Sheet {sheetIdx + 1}: {getMaterialName(sheet.materialId)}
            ({formatDimension(sheet.height, $settings.unitSystem)} × {formatDimension(sheet.width, $settings.unitSystem)})
          </h3>
          
          <div class="relative bg-gray-100 rounded overflow-hidden" style="aspect-ratio: {sheet.width / sheet.height}">
            <svg
              viewBox="0 0 {sheet.width} {sheet.height}"
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Sheet background -->
              <rect width={sheet.width} height={sheet.height} fill="#F3F4F6" stroke="#9CA3AF" stroke-width="0.5"/>
              
              <!-- Margin indicator -->
              <rect
                x={$settings.edgeMargin}
                y={$settings.edgeMargin}
                width={sheet.width - 2 * $settings.edgeMargin}
                height={sheet.height - 2 * $settings.edgeMargin}
                fill="none"
                stroke="#D1D5DB"
                stroke-width="0.25"
                stroke-dasharray="2,2"
              />
              
              <!-- Pieces -->
              {#each sheet.pieces as piece, pieceIdx}
                {@const color = getPieceColor(pieceIdx)}
                <g>
                  <rect
                    x={piece.x}
                    y={piece.y}
                    width={piece.width}
                    height={piece.height}
                    fill={color}
                    fill-opacity="0.7"
                    stroke="white"
                    stroke-width="0.5"
                  />
                  {#if piece.width > 15 && piece.height > 10}
                    <text
                      x={piece.x + piece.width / 2}
                      y={piece.y + piece.height / 2}
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="white"
                      font-size="3"
                      font-weight="bold"
                    >
                      {getPieceName(piece.pieceId)}
                    </text>
                  {/if}
                </g>
              {/each}
              
              <!-- Cut lines -->
              {#each sheet.cuts as cut}
                <line
                  x1={cut.type === 'horizontal' ? cut.from : cut.position}
                  y1={cut.type === 'horizontal' ? cut.position : cut.from}
                  x2={cut.type === 'horizontal' ? cut.to : cut.position}
                  y2={cut.type === 'horizontal' ? cut.position : cut.to}
                  stroke="#DC2626"
                  stroke-width="0.25"
                  stroke-dasharray="1,1"
                />
              {/each}
            </svg>
          </div>
          
          <!-- Legend -->
          <div class="mt-3 flex flex-wrap gap-2 text-sm">
            {#each sheet.pieces as piece, pieceIdx}
              <div class="flex items-center gap-1">
                <div class="w-4 h-4 rounded" style="background-color: {getPieceColor(pieceIdx)}"></div>
                <span>{getPieceName(piece.pieceId)} ({formatDimension(piece.height, $settings.unitSystem)} × {formatDimension(piece.width, $settings.unitSystem)})</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    
    {#if layout.unplacedPieces.length > 0}
      <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 font-medium">Warning: {layout.unplacedPieces.length} piece(s) could not be placed</p>
        <p class="text-red-600 text-sm mt-1">The following pieces don't fit on the available stock materials:</p>
        <ul class="text-red-600 text-sm mt-1 list-disc list-inside">
          {#each layout.unplacedPieces as pieceId}
            {@const piece = pieces.find(p => p.id === pieceId)}
            {#if piece}
              <li>{piece.name} ({formatDimension(piece.dimensions.length, $settings.unitSystem)} × {formatDimension(piece.dimensions.width, $settings.unitSystem)})</li>
            {/if}
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</div>
