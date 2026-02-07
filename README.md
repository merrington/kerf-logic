# Kerf Logic

A web application for optimizing cut layouts on sheet materials. Minimize waste and maximize efficiency when cutting wood, metal, glass, or any sheet stock by calculating optimal layouts with kerf compensation.

## Features

- **Material Management**: Define materials with dimensions, thickness, and cost
- **Cut Optimization**: Guillotine cutting algorithm for efficient sheet utilization
- **Bill of Materials**: Track all pieces needed for your project
- **Visual Layouts**: Interactive diagrams showing optimal cut arrangements
- **Unit Support**: Work in imperial (inches) or metric (millimeters)
- **Grain Direction**: Respect material grain when cutting
- **Kerf Compensation**: Account for blade thickness in calculations
- **Local Storage**: Projects persist in your browser

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Add Materials**: Create materials with dimensions and properties
2. **Add Pieces**: Define the pieces you need to cut
3. **Set Quantity**: Specify how many of each piece you need
4. **Calculate**: Run the optimization algorithm
5. **Review Layout**: View the generated cut diagrams
6. **Export**: Get a summary of materials and cuts needed

## Development

```bash
# Type checking
npm run check

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## Tech Stack

- [Svelte 5](https://svelte.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vitest](https://vitest.dev/) - Testing

## Algorithm

Uses a guillotine cutting algorithm that makes cuts across the entire sheet (like a paper cutter). This approach is commonly used in manufacturing and produces practical cutting layouts.

## License

MIT
