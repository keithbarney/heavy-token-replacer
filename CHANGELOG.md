# Changelog

All notable changes to Heavy Token Replacer are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.0.0] — 2026-02-18

### Added
- **Core scanning** — find all solid fill colors matching local color variables
- **Multi-mode detection** — checks all variable modes (light, dark, brand, etc.)
- **Stroke scanning** — scan stroke colors in addition to fills
- **All-pages mode** — scan entire document, not just current page
- **Selection-only mode** — restrict scan to selected layers and children
- **Collision detection** — surface warnings when multiple variables share the same hex
- **Per-collision resolution** — dropdown picker to choose which variable to bind per collision
- **Filter tabs** — view All / Clean / Collision rows
- **Stale-index-safe replacement** — matches fills by hex value, not array index
- **Single undo step** — `commitUndo()` groups all replacements into one `Cmd+Z`
- **Already-bound skipping** — automatically skips fills already bound to variables
- **CSV export** — download a full audit report of all found tokens
- **Progress bar** — real-time progress for large document scans
- **Heavy dark UI** — Base16 Ocean / Spacegray theme, dark mode only

### Technical
- TypeScript with strict mode
- esbuild bundler with minification
- Zero UI dependencies (vanilla HTML/CSS/JS)
- Figma Plugin API: `figma.variables`, `setBoundVariableForPaint`, `commitUndo`

---

## Roadmap

### [1.1.0] — Planned
- [ ] Effect (shadow/blur) color binding
- [ ] Text style color binding
- [ ] Batch undo report in UI

### [1.2.0] — Planned
- [ ] Lemon Squeezy paywall integration (free tier limits)
- [ ] License key validation
- [ ] Usage analytics (privacy-respecting, opt-in)

### [2.0.0] — Future
- [ ] Variable alias resolution (follow alias chains)
- [ ] Component set scanning optimization
- [ ] Export as Tokens Studio JSON
