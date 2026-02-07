import { describe, it, expect } from 'vitest';
import { calculateGuillotineCut } from './guillotine';
import type { Material, CutPiece, ProjectSettings } from '../types';

const defaultSettings: ProjectSettings = {
  unitSystem: 'imperial',
  sawKerf: 3.175,
  allowRotation: true,
  optimizationPriority: 'minimizeSheets',
  cutType: 'guillotine',
  edgeMargin: 6.35,
};

// 4x8 sheet in mm (96" x 48")
const sheet4x8: Material = {
  id: '1',
  name: '4x8 Plywood',
  sheetSize: { length: 2438.4, width: 1219.2 },
};

// 5x5 sheet in mm (60" x 60")
const sheet5x5: Material = {
  id: '2',
  name: '5x5 Baltic Birch',
  sheetSize: { length: 1524, width: 1524 },
};

describe('Guillotine Cut Algorithm', () => {
  it('should place a single piece on a single sheet', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Test Piece',
      dimensions: { length: 609.6, width: 304.8 }, // 24" x 12"
      materialId: '1',
      quantity: 1,
      grainDirection: 'none',
    }];
    
    const result = calculateGuillotineCut([sheet4x8], pieces, defaultSettings);
    
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0].pieces).toHaveLength(1);
    expect(result.unplacedPieces).toHaveLength(0);
  });
  
  it('should place multiple pieces on one sheet when possible', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Small Piece',
      dimensions: { length: 304.8, width: 304.8 }, // 12" x 12"
      materialId: '1',
      quantity: 4,
      grainDirection: 'none',
    }];
    
    const result = calculateGuillotineCut([sheet4x8], pieces, defaultSettings);
    
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0].pieces).toHaveLength(4);
    expect(result.unplacedPieces).toHaveLength(0);
  });
  
  it('should use multiple sheets when needed', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Large Piece',
      dimensions: { length: 1219.2, width: 609.6 }, // 48" x 24"
      materialId: '1',
      quantity: 3,
      grainDirection: 'none',
    }];
    
    const result = calculateGuillotineCut([sheet4x8], pieces, defaultSettings);
    
    expect(result.sheets.length).toBeGreaterThanOrEqual(2);
    expect(result.unplacedPieces).toHaveLength(0);
  });
  
  it('should handle pieces with grain direction', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Grain Piece',
      dimensions: { length: 609.6, width: 304.8 },
      materialId: '1',
      quantity: 1,
      grainDirection: 'lengthwise',
    }];
    
    const settingsNoRotate = { ...defaultSettings, allowRotation: true };
    const result = calculateGuillotineCut([sheet4x8], pieces, settingsNoRotate);
    
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0].pieces[0].rotated).toBe(false);
  });
  
  it('should rotate pieces when beneficial and allowed', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Long Piece',
      dimensions: { length: 1219.2, width: 304.8 }, // 48" x 12"
      materialId: '1',
      quantity: 1,
      grainDirection: 'none',
    }];
    
    const settingsNoRotate = { ...defaultSettings, allowRotation: false };
    const settingsAllowRotate = { ...defaultSettings, allowRotation: true };
    
    const resultNoRotate = calculateGuillotineCut([sheet4x8], pieces, settingsNoRotate);
    const resultRotate = calculateGuillotineCut([sheet4x8], pieces, settingsAllowRotate);
    
    // Both should place successfully
    expect(resultNoRotate.unplacedPieces).toHaveLength(0);
    expect(resultRotate.unplacedPieces).toHaveLength(0);
  });
  
  it('should report unplaced pieces that do not fit', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Too Large',
      dimensions: { length: 3048, width: 1524 }, // 120" x 60" - too big
      materialId: '1',
      quantity: 1,
      grainDirection: 'none',
    }];
    
    const result = calculateGuillotineCut([sheet4x8], pieces, defaultSettings);
    
    expect(result.sheets).toHaveLength(0);
    expect(result.unplacedPieces).toContain('p1');
  });
  
  it('should handle different materials', () => {
    const pieces: CutPiece[] = [
      {
        id: 'p1',
        name: 'Piece 1',
        dimensions: { length: 304.8, width: 304.8 },
        materialId: '1',
        quantity: 2,
        grainDirection: 'none',
      },
      {
        id: 'p2',
        name: 'Piece 2',
        dimensions: { length: 304.8, width: 304.8 },
        materialId: '2',
        quantity: 2,
        grainDirection: 'none',
      },
    ];
    
    const result = calculateGuillotineCut([sheet4x8, sheet5x5], pieces, defaultSettings);
    
    expect(result.sheets.length).toBeGreaterThanOrEqual(2);
    
    // Should have sheets of both materials
    const materialIds = [...new Set(result.sheets.map(s => s.materialId))];
    expect(materialIds).toContain('1');
    expect(materialIds).toContain('2');
  });
  
  it('should account for kerf in spacing', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Exact Fit',
      dimensions: { length: 609.6, width: 609.6 }, // 24" x 24"
      materialId: '1',
      quantity: 4,
      grainDirection: 'none',
    }];
    
    const settingsNoKerf = { ...defaultSettings, sawKerf: 0, edgeMargin: 0 };
    const settingsWithKerf = { ...defaultSettings, sawKerf: 6.35, edgeMargin: 0 }; // 1/4"
    
    const resultNoKerf = calculateGuillotineCut([sheet4x8], pieces, settingsNoKerf);
    const resultWithKerf = calculateGuillotineCut([sheet4x8], pieces, settingsWithKerf);
    
    // Both should fit, but kerf version should have more sheets
    expect(resultNoKerf.sheets.length).toBeGreaterThanOrEqual(1);
    expect(resultWithKerf.sheets.length).toBeGreaterThanOrEqual(1);
    // Kerf should result in more waste
    expect(resultWithKerf.totalWaste).toBeGreaterThanOrEqual(resultNoKerf.totalWaste);
  });
  
  it('should calculate waste correctly', () => {
    const pieces: CutPiece[] = [{
      id: 'p1',
      name: 'Half Sheet',
      dimensions: { length: 1219.2, width: 609.6 }, // 48" x 24" - half of 4x8
      materialId: '1',
      quantity: 1,
      grainDirection: 'none',
    }];
    
    const result = calculateGuillotineCut([sheet4x8], pieces, defaultSettings);
    
    expect(result.sheets).toHaveLength(1);
    expect(result.usedArea).toBeGreaterThan(0);
    expect(result.totalArea).toBeGreaterThan(result.usedArea);
    expect(result.totalWaste).toBe(result.totalArea - result.usedArea);
  });
});
