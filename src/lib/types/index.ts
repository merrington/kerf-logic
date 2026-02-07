export type UnitSystem = 'imperial' | 'metric';
export type GrainDirection = 'none' | 'lengthwise' | 'widthwise';
export type OptimizationPriority = 'minimizeSheets' | 'minimizeWaste';
export type CutType = 'guillotine' | 'nesting';

export interface Dimensions {
  length: number;
  width: number;
}

export interface Material {
  id: string;
  name: string;
  sheetSize: Dimensions;
  costPerSheet?: number;
  quantityOnHand?: number;
}

export interface CutPiece {
  id: string;
  name: string;
  dimensions: Dimensions;
  materialId: string;
  quantity: number;
  grainDirection: GrainDirection;
  notes?: string;
}

export interface ProjectSettings {
  unitSystem: UnitSystem;
  sawKerf: number;
  allowRotation: boolean;
  optimizationPriority: OptimizationPriority;
  cutType: CutType;
  edgeMargin: number;
}

export interface PlacedPiece {
  pieceId: string;
  instanceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  sheetIndex: number;
}

export interface CutInstruction {
  type: 'horizontal' | 'vertical';
  position: number;
  from: number;
  to: number;
  sheetIndex: number;
}

export interface CutSheet {
  sheetIndex: number;
  materialId: string;
  width: number;
  height: number;
  pieces: PlacedPiece[];
  cuts: CutInstruction[];
}

export interface CutLayout {
  sheets: CutSheet[];
  unplacedPieces: string[];
  totalWaste: number;
  totalArea: number;
  usedArea: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  materials: Material[];
  pieces: CutPiece[];
  settings: ProjectSettings;
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  unitSystem: 'imperial',
  sawKerf: 0.125,
  allowRotation: true,
  optimizationPriority: 'minimizeSheets',
  cutType: 'guillotine',
  edgeMargin: 0.25,
};

export const MATERIAL_PRESETS: Omit<Material, 'id'>[] = [
  {
    name: '4×8 Plywood Sheet',
    sheetSize: { length: 96, width: 48 },
  },
  {
    name: '5×5 Baltic Birch',
    sheetSize: { length: 60, width: 60 },
  },
  {
    name: '4×4 Plywood Sheet',
    sheetSize: { length: 48, width: 48 },
  },
];
