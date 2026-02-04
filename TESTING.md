# Heavy Token Replacer — User Stories

## Core: Find Tokens

### US-1: Find fills that match color variables
**As a** designer migrating from hardcoded colors to variables,
**I want to** scan the page for fills that match my color variables,
**So that** I can see which colors can be replaced.

**Given** a page with nodes using #333333 fills and a color variable resolving to #333333
**When** I click Find Tokens
**Then** the results table shows each match with the hex value and variable name

---

### US-2: Results show color swatches
**As a** designer reviewing matches,
**I want to** see a visual color swatch next to each hex value,
**So that** I can quickly verify the color is correct.

**Given** found tokens in the results table
**When** I look at the results
**Then** each row has a colored swatch matching the hex value

---

### US-3: Check all variable modes
**As a** designer using light/dark mode variables,
**I want** the scan to check colors across all modes,
**So that** colors matching any mode are found, not just the default.

**Given** a variable with value #FFFFFF in light mode and #1A1A1A in dark mode
**When** I scan a page with #1A1A1A fills
**Then** the match is found (not missed because it's not the default mode value)

---

### US-4: Surface variable collisions
**As a** designer with multiple variables sharing the same color,
**I want to** know when a collision exists,
**So that** I can verify the correct variable is being used.

**Given** "ui.text.default" and "ui.icon.default" both resolve to #333333
**When** I find tokens
**Then** the result shows the first variable name with "(+1 more)" indicator

---

## Core: Replace Tokens

### US-5: Replace fills with variable references
**As a** designer,
**I want to** replace all found matches with their variable references,
**So that** my designs use variables instead of hardcoded colors.

**Given** found tokens in the results
**When** I click Replace Tokens
**Then** each matching fill is bound to its color variable and a success notification shows the count

---

### US-6: Handle modified fills between find and replace
**As a** designer who made changes between finding and replacing,
**I want** the plugin to skip fills that no longer match,
**So that** it doesn't bind variables to the wrong fill.

**Given** I found tokens, then manually changed a node's fill color
**When** I click Replace Tokens
**Then** the changed fill is skipped and the notification reports how many were skipped

---

## Edge Cases

### US-7: No color variables in the file
**As a** user in a file without color variables,
**I want** a clear result,
**So that** I know there's nothing to replace.

**Given** the file has no local color variables
**When** I click Find Tokens
**Then** the status shows "No tokens found." with 0 results

---

### US-8: No matching fills on the page
**As a** designer whose page doesn't use any variable colors,
**I want** a clear result,
**So that** I know nothing needs replacing.

**Given** color variables exist but no fills on the page match them
**When** I click Find Tokens
**Then** the status shows "No tokens found."

---

### US-9: Large page performance
**As a** designer working on a page with many nodes,
**I want** the scan to complete without freezing,
**So that** the plugin remains responsive.

**Given** a page with thousands of nodes
**When** I click Find Tokens
**Then** the scan completes without the UI hanging (uses filtered node types, not all nodes)
