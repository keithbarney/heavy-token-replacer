# Heavy Token Replacer

**Find hardcoded hex colors and bind them to Figma variables in one click.**

Part of the [Heavy Suite](https://heavy.so) — a collection of focused Figma plugins for design system teams.

---

## What It Does

Heavy Token Replacer scans your Figma document for solid fill and stroke colors that match your local color variables, then lets you replace them all at once. No token infrastructure, no Git setup, no Tokens Studio subscription required.

It's the 80/20 tool: most token-binding tasks just need a fast "find hardcoded colors → swap to variables" workflow. That's all this does — and it does it well.

---

## Features

### Core
- **Smart scanning** — finds every solid fill and stroke color that matches a local variable
- **Multi-mode detection** — checks all variable modes (light, dark, brand, etc.), not just the default
- **All pages support** — scan the entire document or just the current page
- **Stroke scanning** — catches hardcoded stroke colors, not just fills
- **Selection-only mode** — scan just the selected layers and their children

### Collision Detection
- Identifies when multiple variables resolve to the same hex value
- Shows a ⚠ warning badge on affected rows
- Provides a dropdown to choose which variable to bind for each collision
- Filter view to show only collision rows

### Safety & UX
- **Stale-index protection** — matches fills by hex value, not array index (safe if fills change between scan and replace)
- **Single undo step** — all replacements are committed as one undoable action (`Cmd+Z` undoes the entire batch)
- **Already-bound skipping** — skips fills that are already bound to a variable
- **Progress indicator** — live progress bar for large documents

### Export
- **CSV report** — export a full audit of every hardcoded token found, including page, layer name, hex value, variable, and collision status

---

## Install

### From Figma Community
1. Open Figma → Plugins → Browse Community
2. Search for "Heavy Token Replacer"
3. Click Install

### From source (development)
```bash
git clone https://github.com/keithbarney/heavy-token-replacer
cd heavy-token-replacer
npm install
npm run dev
```

Then in Figma: **Plugins → Development → Import plugin from manifest** → select `manifest.json`.

---

## Usage

1. **Open your file** — make sure it has local color variables (Figma Variables panel)
2. **Run the plugin** — Plugins → Heavy Token Replacer
3. **Choose scope** — Current Page or All Pages
4. **Toggle options** — enable strokes, or restrict to selection
5. **Click Scan** — finds all hardcoded fills matching your variables
6. **Review results** — check for collision warnings (⚠), pick the right variable
7. **Click Replace** — replaces all selected tokens in one undoable step
8. **(Optional) Export** — download a CSV audit report

---

## How It Works

```
Document nodes
    │
    ▼
Build hex→variable map
(checks ALL modes: light, dark, etc.)
    │
    ▼
Scan fills + strokes
(skip already-bound variables)
    │
    ▼
Surface collisions
(2+ variables → same hex)
    │
    ▼
User reviews + picks collision resolution
    │
    ▼
Replace: setBoundVariableForPaint()
    │
    ▼
commitUndo() → single Cmd+Z step
```

### Collision Example

Suppose you have:
- `Colors/Brand/Primary` = `#6699CC` in light mode, `#4477AA` in dark mode
- `Colors/Interactive/Link` = `#6699CC` in light mode, `#5588BB` in dark mode

Both share `#6699CC` — so the plugin surfaces a collision, shows a dropdown, and lets you pick which variable each fill should receive.

---

## Development

### Setup

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode (esbuild, fast rebuilds) |
| `npm run build` | Production build (minified) |
| `npm run typecheck` | TypeScript type check |

### Project Structure

```
heavy-token-replacer/
├── code.ts          # Plugin main thread (Figma API)
├── ui.html          # Plugin UI (self-contained HTML/CSS/JS)
├── manifest.json    # Figma plugin manifest
├── dist/
│   └── code.js      # Built output (generated)
├── package.json
└── tsconfig.json
```

### Tech Stack

- **TypeScript** — typed plugin API usage
- **esbuild** — fast bundler
- **Figma Plugin API** — `figma.variables`, `setBoundVariableForPaint`, `commitUndo`
- **Vanilla HTML/CSS/JS** — no framework, zero dependencies in UI

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## Part of Heavy Suite

| Plugin | Description |
|--------|-------------|
| **Heavy Token Replacer** | Bind colors to variables in one click |
| Heavy Documentation Extractor | Export component specs to PDF |
| *(more coming)* | |

---

## License

MIT — see [LICENSE](LICENSE).
