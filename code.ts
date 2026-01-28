// Heavy Token Replacer — Figma Plugin
// Find solid fill colors that match color variables and replace them with variable references

interface TokenMatch {
  nodeId: string;
  property: string;
  index: number;
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

// Get all color variables in the document
function getColorVariables(): Map<string, Variable> {
  const variableMap = new Map<string, Variable>();
  const variables = figma.variables.getLocalVariables("COLOR");

  for (const variable of variables) {
    // Get the value for the default mode
    const collectionId = variable.variableCollectionId;
    const collection = figma.variables.getVariableCollectionById(collectionId);
    if (collection) {
      const modeId = collection.defaultModeId;
      const value = variable.valuesByMode[modeId];
      if (value && typeof value === "object" && "r" in value) {
        const hex = rgbToHex(value as RGB);
        variableMap.set(hex, variable);
      }
    }
  }

  return variableMap;
}

// Scan all layers for fills that match color variables
function findTokens(): void {
  const variableMap = getColorVariables();
  const foundTokens: TokenMatch[] = [];

  const nodes = figma.currentPage.findAll();

  for (const node of nodes) {
    if ("fills" in node && Array.isArray(node.fills)) {
      for (let i = 0; i < node.fills.length; i++) {
        const fill = node.fills[i];
        if (fill.type === "SOLID") {
          const hex = rgbToHex(fill.color);
          const variable = variableMap.get(hex);
          if (variable) {
            foundTokens.push({
              nodeId: node.id,
              property: "fills",
              index: i,
              hex,
              variableName: variable.name,
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

  for (const token of tokens) {
    const node = figma.getNodeById(token.nodeId);
    if (!node || !("fills" in node)) continue;

    const variable = figma.variables.getVariableById(token.variableId);
    if (!variable) continue;

    try {
      const fills = JSON.parse(JSON.stringify(node.fills));
      if (fills[token.index]) {
        fills[token.index] = figma.variables.setBoundVariableForPaint(
          fills[token.index],
          "color",
          variable
        );
        node.fills = fills;
        replacedCount++;
      }
    } catch (err) {
      console.warn("Failed to replace token:", err);
    }
  }

  figma.notify(`Replaced ${replacedCount} tokens`);
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
