# Heavy Token Replacer

Figma plugin that finds solid fill colors matching color variables and replaces them with variable references.

**Important:** When working on this project, reference the official Figma Plugin documentation for API details, best practices, and capabilities: https://www.figma.com/plugin-docs/

## Files

| File | Purpose |
|------|---------|
| `code.ts` | Main plugin logic |
| `ui.html` | UI panel with results table |
| `manifest.json` | Plugin configuration |
| `package.json` | Build scripts |

## Build

```bash
npm install      # Install dependencies
npm run dev      # Watch mode (esbuild)
npm run build    # Production build (minified)
npm run typecheck # Type checking
```

## Build Target

esbuild uses `--target=es6` because Figma's plugin sandbox doesn't support ES2020+ syntax (e.g., `??`, `?.`). Write modern TypeScript freely — esbuild transpiles it down automatically.

## How It Works

1. Run the plugin
2. Click "Find Tokens" to scan the current page
3. The plugin compares all solid fill colors against local color variables
4. Matching colors are displayed in a table with hex value and variable name
5. Click "Replace Tokens" to bind the fills to their matching variables
