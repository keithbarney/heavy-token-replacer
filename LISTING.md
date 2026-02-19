# Figma Community Listing Copy

---

## Title

**Heavy Token Replacer — Bind Colors to Variables in One Click**

---

## Short Description (≤80 chars)

Find hardcoded hex colors and replace them with variable references instantly.

---

## Long Description

### Stop manually hunting hardcoded colors.

Your design system has color variables. Your Figma file has thousands of hardcoded hex fills that *should* be using them. Connecting the two used to mean hours of clicking layer-by-layer. Not anymore.

**Heavy Token Replacer** scans your entire document, finds every solid fill and stroke that matches a local color variable, and replaces them all in one undoable action.

---

### Who it's for

- **Design system designers** migrating legacy files to tokens
- **Component library maintainers** enforcing variable usage
- **Design leads** auditing files before handoff
- **Anyone** who's ever thought "why does this file still have #333333 everywhere?"

---

### What it does

**Scan**
- Finds all solid fills and strokes matching local color variables
- Checks every variable mode (light, dark, brand) — not just the default
- Works on the current page or your entire document
- Can restrict to just selected layers

**Detect**
- Surfaces collision warnings when multiple variables share the same hex
- Lets you pick which variable to bind per collision
- Filter results to show only problematic rows

**Replace**
- Binds fills to variables using Figma's native API
- All replacements committed as one undo step (Cmd+Z undoes the whole batch)
- Skips already-bound fills automatically
- Reports exact counts: replaced / skipped / errored

**Audit**
- Export a full CSV report of every hardcoded token found
- Share with your team as a design debt audit

---

### Why it's better than alternatives

| Feature | Heavy Token Replacer | Tokens Studio | Tokenify |
|---------|---------------------|---------------|----------|
| Bind fills to variables | ✅ | ✅ | ✅ |
| Multi-mode detection | ✅ | ✅ | ❌ |
| Collision detection | ✅ | ❌ | ❌ |
| Scan strokes | ✅ | ❌ | ❌ |
| All pages at once | ✅ | ❌ | ❌ |
| Single undo step | ✅ | ❌ | ❌ |
| Export CSV report | ✅ | ❌ | ❌ |
| No subscription / Git | ✅ | ❌ (€39/mo) | ✅ |
| Price | $9 one-time | €39/mo | Free |

**Tokens Studio** is powerful but designed for multi-platform token management with a full JSON/Git workflow. If you just need to bind existing Figma variables to existing fills — that's overkill.

**Heavy Token Replacer** does one thing, does it well, and costs less than a lunch.

---

### How to use it

1. Open any file with local color variables
2. Run Heavy Token Replacer
3. Choose your scope (current page or all pages)
4. Click **Scan Document**
5. Review results — handle any ⚠ collision warnings
6. Click **Replace Selected**
7. Done. One undo step if you need to roll back.

---

### Features at a glance

- ✅ Scan current page or all pages
- ✅ Scan fills, strokes, or both
- ✅ Selection-only mode
- ✅ Multi-mode variable detection (light/dark/brand)
- ✅ Collision detection with per-row resolution
- ✅ Already-bound fill skipping
- ✅ Stale-index-safe replacement
- ✅ Single undo step for entire batch
- ✅ CSV export for design audits
- ✅ Dark, focused UI — no clutter

---

### Part of the Heavy Suite

Heavy Token Replacer is one of a growing collection of focused Figma plugins for design system teams. Learn more at [heavy.so](https://heavy.so).

---

## Tags

```
tokens, variables, design system, color, token replacement, color variables, 
design tokens, hex, fills, strokes, component library, style guide, 
token binding, design ops, automation, dark mode, multi-mode
```

---

## Category

**Productivity** / **Design Systems**

---

## Pricing (Lemon Squeezy)

- **Free tier**: Scan current page, up to 50 tokens per scan, no CSV export
- **Pro** ($9 one-time): Unlimited scans, all pages, strokes, CSV export, collision resolution

See [MONETIZATION.md](MONETIZATION.md) for full strategy.
