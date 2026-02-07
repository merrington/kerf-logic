# AGENTS.md - Development Guidelines

This document provides guidelines for AI agents working on this Kerf Logic codebase.

## Tech Stack

- **Framework**: Svelte 5 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest with jsdom and @testing-library/svelte
- **Package Manager**: npm

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Type Checking
npm run check        # Run svelte-check and tsc

# Testing
npm test             # Run all tests (watch mode)
npm run test:ui      # Run tests with UI
npm test -- src/lib/utils/units.test.ts           # Run single test file
npm test -- --run                                 # Run tests once (CI)
npm test -- --reporter=verbose                    # Verbose output
```

## Code Style

### TypeScript

- Use strict TypeScript with explicit types
- Import types separately: `import type { Material } from '../types'`
- Use union types for string literals: `type UnitSystem = 'imperial' | 'metric'`
- Prefer `interface` for object shapes, `type` for unions
- Optional properties use `?:`: `costPerSheet?: number`
- Use nullish coalescing: `material?.id ?? crypto.randomUUID()`

### Naming Conventions

- **Variables/Functions**: camelCase (`calculateGuillotineCut`, `sheetSize`)
- **Components**: PascalCase (`MaterialForm.svelte`)
- **Interfaces/Types**: PascalCase (`CutLayout`, `GrainDirection`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`MM_PER_INCH`)
- **Files**: PascalCase for components, camelCase for utilities

### Svelte 5 Runes

Always use Svelte 5 runes:

```typescript
// State
let name = $state('');
let count = $state(0);

// Props with interface
interface Props {
  material?: Material | null;
  onSave: (material: Material) => void;
}
let { material = null, onSave }: Props = $props();

// Derived
let totalArea = $derived(width * height);

// Store subscriptions (existing stores still use $)
$settings.unitSystem
```

### Imports

```typescript
// 1. External libraries
import { describe, it, expect } from 'vitest';

// 2. Svelte imports
import { onMount } from 'svelte';

// 3. Type imports
import type { Material, CutPiece } from '../types';

// 4. Component imports
import MaterialForm from './MaterialForm.svelte';

// 5. Utility imports
import { formatDimension } from '../utils/units';

// 6. Store imports
import { settings, currentProject } from '../stores/project';
```

### Error Handling

Use early returns with user-friendly error messages:

```typescript
function handleSubmit() {
  error = '';
  
  if (!name.trim()) {
    error = 'Material name is required';
    return;
  }
  
  const value = parseDimension(input, unit);
  if (value === null || value <= 0) {
    error = 'Invalid dimension';
    return;
  }
  
  // Proceed with valid data
}
```

### Testing Patterns

```typescript
import { describe, it, expect } from 'vitest';
import { formatDimension } from './units';

describe('Unit Conversion', () => {
  describe('formatDimension', () => {
    it('should format metric dimensions', () => {
      expect(formatDimension(100, 'metric')).toBe('100mm');
    });
    
    it('should format imperial fractions', () => {
      expect(formatDimension(38.1, 'imperial')).toBe('1 1/2"');
    });
  });
});
```

## File Organization

```
src/
├── lib/
│   ├── algorithms/     # Cut calculation algorithms
│   │   ├── guillotine.ts
│   │   └── guillotine.test.ts
│   ├── components/     # Svelte components
│   │   ├── MaterialForm.svelte
│   │   ├── MaterialList.svelte
│   │   └── PieceForm.svelte
│   ├── stores/         # Svelte stores
│   │   └── project.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   └── utils/          # Utility functions
│       ├── units.ts
│       └── units.test.ts
├── App.svelte
└── main.ts
```

## Styling

- Use Tailwind utility classes
- Common patterns:
  - Cards: `bg-white rounded-lg shadow-md p-6`
  - Buttons: `bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700`
  - Form inputs: `w-full px-3 py-2 border border-gray-300 rounded-md`
  - Error messages: `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded`

## State Management

- Use Svelte stores in `src/lib/stores/`
- Project state is persisted to localStorage via `storage.ts`
- Store methods update state immutably

## Type Safety

- Run `npm run check` before committing
- All functions should have explicit return types
- Use `satisfies` for constant objects when needed
- Prefer `unknown` over `any`
