import type { Material, CutPiece, CutLayout, CutSheet, PlacedPiece, CutInstruction, ProjectSettings } from '../types';

interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PieceToPlace {
  id: string;
  instanceIndex: number;
  width: number;
  height: number;
  canRotate: boolean;
  grainDirection: 'none' | 'lengthwise' | 'widthwise';
}

export function calculateGuillotineCut(
  materials: Material[],
  pieces: CutPiece[],
  settings: ProjectSettings
): CutLayout {
  const sheets: CutSheet[] = [];
  const unplacedPieces: string[] = [];
  
  const materialMap = new Map(materials.map(m => [m.id, m]));
  
  const piecesByMaterial = new Map<string, PieceToPlace[]>();
  
  for (const piece of pieces) {
    const material = materialMap.get(piece.materialId);
    if (!material) {
      unplacedPieces.push(piece.id);
      continue;
    }
    
    const pieceList = piecesByMaterial.get(piece.materialId) ?? [];
    
    for (let i = 0; i < piece.quantity; i++) {
      const canRotate = settings.allowRotation && piece.grainDirection === 'none';
      pieceList.push({
        id: piece.id,
        instanceIndex: i,
        width: piece.dimensions.width,
        height: piece.dimensions.length,
        canRotate,
        grainDirection: piece.grainDirection,
      });
    }
    
    piecesByMaterial.set(piece.materialId, pieceList);
  }
  
  for (const [materialId, pieceList] of piecesByMaterial) {
    const material = materialMap.get(materialId)!;
    const sheetWidth = material.sheetSize.width;
    const sheetHeight = material.sheetSize.length;
    
    const sortedPieces = pieceList.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    let remainingPieces = [...sortedPieces];
    
    while (remainingPieces.length > 0) {
      const sheetIndex = sheets.length;
      const result = packSheet(
        remainingPieces,
        sheetWidth,
        sheetHeight,
        settings.sawKerf,
        settings.edgeMargin,
        materialId,
        sheetIndex
      );
      
      if (result.placed.length === 0) {
        unplacedPieces.push(...remainingPieces.map(p => p.id));
        break;
      }
      
      sheets.push({
        sheetIndex,
        materialId,
        width: sheetWidth,
        height: sheetHeight,
        pieces: result.placed,
        cuts: result.cuts,
      });
      
      remainingPieces = result.remaining;
    }
  }
  
  const totalArea = sheets.reduce((sum, s) => sum + s.width * s.height, 0);
  const usedArea = sheets.reduce((sum, s) => 
    sum + s.pieces.reduce((pSum, p) => pSum + p.width * p.height, 0), 0);
  
  return {
    sheets,
    unplacedPieces: [...new Set(unplacedPieces)],
    totalWaste: totalArea - usedArea,
    totalArea,
    usedArea,
  };
}

function packSheet(
  pieces: PieceToPlace[],
  sheetWidth: number,
  sheetHeight: number,
  kerf: number,
  margin: number,
  materialId: string,
  sheetIndex: number
): { placed: PlacedPiece[]; remaining: PieceToPlace[]; cuts: CutInstruction[] } {
  const placed: PlacedPiece[] = [];
  const remaining: PieceToPlace[] = [];
  const cuts: CutInstruction[] = [];
  
  const freeRectangles: FreeRectangle[] = [{
    x: margin,
    y: margin,
    width: sheetWidth - 2 * margin,
    height: sheetHeight - 2 * margin,
  }];
  
  for (const piece of pieces) {
    let bestRectIndex = -1;
    let bestPlacement: { x: number; y: number; rotated: boolean } | null = null;
    let bestWaste = Infinity;
    
    for (let i = 0; i < freeRectangles.length; i++) {
      const rect = freeRectangles[i];
      
      const placements = piece.canRotate 
        ? [
            { width: piece.width, height: piece.height, rotated: false },
            { width: piece.height, height: piece.width, rotated: true },
          ]
        : [{ width: piece.width, height: piece.height, rotated: false }];
      
      for (const placement of placements) {
        if (placement.width <= rect.width && placement.height <= rect.height) {
          const waste = rect.width * rect.height - placement.width * placement.height;
          if (waste < bestWaste) {
            bestWaste = waste;
            bestRectIndex = i;
            bestPlacement = { x: rect.x, y: rect.y, rotated: placement.rotated };
          }
        }
      }
    }
    
    if (bestPlacement && bestRectIndex >= 0) {
      const rect = freeRectangles[bestRectIndex];
      
      placed.push({
        pieceId: piece.id,
        instanceIndex: piece.instanceIndex,
        x: bestPlacement.x,
        y: bestPlacement.y,
        width: piece.canRotate && bestPlacement.rotated ? piece.height : piece.width,
        height: piece.canRotate && bestPlacement.rotated ? piece.width : piece.height,
        rotated: bestPlacement.rotated,
        sheetIndex,
      });
      
      const placedWidth = piece.canRotate && bestPlacement.rotated ? piece.height : piece.width;
      const placedHeight = piece.canRotate && bestPlacement.rotated ? piece.width : piece.height;
      
      freeRectangles.splice(bestRectIndex, 1);
      
      const rightSpace = rect.width - placedWidth - kerf;
      const bottomSpace = rect.height - placedHeight - kerf;
      
      if (rightSpace > 0 && bottomSpace > 0) {
        if (rightSpace >= bottomSpace) {
          freeRectangles.push({
            x: bestPlacement.x + placedWidth + kerf,
            y: bestPlacement.y,
            width: rightSpace,
            height: placedHeight,
          });
          freeRectangles.push({
            x: bestPlacement.x,
            y: bestPlacement.y + placedHeight + kerf,
            width: rect.width,
            height: bottomSpace,
          });
          
          cuts.push({
            type: 'vertical',
            position: bestPlacement.x + placedWidth + kerf / 2,
            from: bestPlacement.y,
            to: bestPlacement.y + placedHeight,
            sheetIndex,
          });
          cuts.push({
            type: 'horizontal',
            position: bestPlacement.y + placedHeight + kerf / 2,
            from: bestPlacement.x,
            to: bestPlacement.x + rect.width,
            sheetIndex,
          });
        } else {
          freeRectangles.push({
            x: bestPlacement.x,
            y: bestPlacement.y + placedHeight + kerf,
            width: placedWidth,
            height: bottomSpace,
          });
          freeRectangles.push({
            x: bestPlacement.x + placedWidth + kerf,
            y: bestPlacement.y,
            width: rightSpace,
            height: rect.height,
          });
          
          cuts.push({
            type: 'horizontal',
            position: bestPlacement.y + placedHeight + kerf / 2,
            from: bestPlacement.x,
            to: bestPlacement.x + placedWidth,
            sheetIndex,
          });
          cuts.push({
            type: 'vertical',
            position: bestPlacement.x + placedWidth + kerf / 2,
            from: bestPlacement.y,
            to: bestPlacement.y + rect.height,
            sheetIndex,
          });
        }
      } else if (rightSpace > 0) {
        freeRectangles.push({
          x: bestPlacement.x + placedWidth + kerf,
          y: bestPlacement.y,
          width: rightSpace,
          height: rect.height,
        });
        cuts.push({
          type: 'vertical',
          position: bestPlacement.x + placedWidth + kerf / 2,
          from: bestPlacement.y,
          to: bestPlacement.y + rect.height,
          sheetIndex,
        });
      } else if (bottomSpace > 0) {
        freeRectangles.push({
          x: bestPlacement.x,
          y: bestPlacement.y + placedHeight + kerf,
          width: rect.width,
          height: bottomSpace,
        });
        cuts.push({
          type: 'horizontal',
          position: bestPlacement.y + placedHeight + kerf / 2,
          from: bestPlacement.x,
          to: bestPlacement.x + rect.width,
          sheetIndex,
        });
      }
    } else {
      remaining.push(piece);
    }
  }
  
  return { placed, remaining, cuts };
}
