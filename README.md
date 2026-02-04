# Heavy Token Replacer

Figma plugin to find and replace hardcoded hex colors with color variable references.

## What it does

1. Run the plugin on any page
2. Click Find Tokens to scan for fills matching your color variables
3. Review the matches in the results table
4. Click Replace Tokens to bind variables to the matching fills

Scans all nodes on the current page for solid fills that match any local color variable. Checks all variable modes (not just the default). Surfaces collisions when multiple variables resolve to the same hex color.

## Features

- Scan current page for fills matching local color variables
- Checks all variable modes (light, dark, etc.)
- Color swatch preview in results table
- Surfaces variable collisions with "(+N more)" indicator
- Safe replacement: validates fills haven't changed before replacing
- Reports skipped replacements when fills were modified between find and replace
- Filtered node type search for performance on large pages

## Status

This plugin is in the ideation stage and not yet published.

## Development

```bash
npm install
npm run dev        # Watch mode
npm run build      # Production build
npm run typecheck   # Type checking
```

## Tech Stack

- TypeScript
- esbuild (bundler)
- Figma Plugin API

## Files

| File | Purpose |
|------|---------|
| `code.ts` | Token scanning and replacement logic |
| `ui.html` | Results table and action buttons |
| `manifest.json` | Plugin config |
