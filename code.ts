// Heavy Token Replacer — Figma Plugin
// Find solid fill colors that match color variables and replace them with variable references

interface TokenMatch {
  nodeId: string;
  nodeName: string;
  property: string;
  fillHex: string;
  hex: string;
  variableName: string;
  variableId: string;
}

figma.showUI(__html__, { width: 400, height: 480 });

// Helper: Convert RGB to Hex
function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Get all color variables in the document (checks all modes)
function getColorVariables(): Map<string, Variable[]> {
  const variableMap = new Map<string, Variable[]>();
  const variables = figma.variables.getLocalVariables("COLOR");

  for (const variable of variables) {
    const collectionId = variable.variableCollectionId;
    const collection = figma.variables.getVariableCollectionById(collectionId);
    if (collection) {
      for (const mode of collection.modes) {
        const value = variable.valuesByMode[mode.modeId];
        if (value && typeof value === "object" && "r" in value) {
          const hex = rgbToHex(value as RGB);
          const existing = variableMap.get(hex) || [];
          if (!existing.some(v => v.id === variable.id)) {
            existing.push(variable);
            variableMap.set(hex, existing);
          }
        }
      }
    }
  }

  return variableMap;
}

// Node types that can have solid fills
const FILL_NODE_TYPES: NodeType[] = [
  "RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "VECTOR", "LINE",
  "TEXT", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE",
  "BOOLEAN_OPERATION", "SECTION"
];

// Scan all layers for fills that match color variables
function findTokens(): void {
  const variableMap = getColorVariables();
  const foundTokens: TokenMatch[] = [];

  const nodes = figma.currentPage.findAllWithCriteria({ types: FILL_NODE_TYPES });

  for (const node of nodes) {
    if ("fills" in node && Array.isArray(node.fills)) {
      for (let i = 0; i < node.fills.length; i++) {
        const fill = node.fills[i];
        if (fill.type === "SOLID") {
          const hex = rgbToHex(fill.color);
          const variables = variableMap.get(hex);
          if (variables && variables.length > 0) {
            const variable = variables[0];
            foundTokens.push({
              nodeId: node.id,
              nodeName: node.name,
              property: "fills",
              fillHex: hex,
              hex,
              variableName: variable.name + (variables.length > 1 ? ` (+${variables.length - 1} more)` : ""),
              variableId: variable.id
            });
          }
        }
      }
    }
  }

  figma.ui.postMessage({ type: "foundTokens", data: foundTokens });
  figma.notify(`Found ${foundTokens.length} tokens`);
}

// Replace hex values with color variables
function replaceTokens(tokens: TokenMatch[]): void {
  let replacedCount = 0;
  let skippedCount = 0;

  for (const token of tokens) {
    const node = figma.getNodeById(token.nodeId);
    if (!node || !("fills" in node) || !Array.isArray(node.fills)) continue;

    const variable = figma.variables.getVariableById(token.variableId);
    if (!variable) continue;

    try {
      const fills = JSON.parse(JSON.stringify(node.fills));

      // Find the fill by matching hex color instead of relying on stale index
      let targetIndex = -1;
      for (let i = 0; i < fills.length; i++) {
        if (fills[i].type === "SOLID" && rgbToHex(fills[i].color) === token.fillHex) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === -1) {
        skippedCount++;
        continue;
      }

      fills[targetIndex] = figma.variables.setBoundVariableForPaint(
        fills[targetIndex],
        "color",
        variable
      );
      node.fills = fills;
      replacedCount++;
    } catch (err) {
      console.warn("Failed to replace token:", err);
    }
  }

  const message = skippedCount > 0
    ? `Replaced ${replacedCount} tokens (${skippedCount} skipped — fills changed)`
    : `Replaced ${replacedCount} tokens`;
  figma.notify(message);
}

// Listen for UI messages
figma.ui.onmessage = (msg) => {
  if (msg.type === "findTokens") {
    findTokens();
  }

  if (msg.type === "replaceTokens") {
    replaceTokens(msg.data);
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
