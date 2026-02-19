// Heavy Token Replacer v1.0.0 — Figma Plugin
// Find hardcoded hex colors and replace them with Figma variable references
// © Heavy Suite — https://heavy.so

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollisionVariable {
  id: string;
  name: string;
  collectionName: string;
}

interface TokenMatch {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  pageName: string;
  pageId: string;
  property: 'fills' | 'strokes';
  fillIndex: number;
  hex: string;
  variableId: string;
  variableName: string;
  collectionName: string;
  hasCollision: boolean;
  collisionCount: number;
  allVariables: CollisionVariable[];
}

interface ScanOptions {
  scanAllPages: boolean;
  selectionOnly: boolean;
  includeStrokes: boolean;
}

interface ProgressMessage {
  type: 'scanProgress';
  current: number;
  total: number;
  pageName: string;
}

interface FoundTokensMessage {
  type: 'foundTokens';
  data: TokenMatch[];
  totalNodes: number;
  collisionCount: number;
  pagesScanned: number;
}

interface ReplaceCompleteMessage {
  type: 'replaceComplete';
  replacedCount: number;
  skippedCount: number;
  errorCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILL_NODE_TYPES: NodeType[] = [
  'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE',
  'TEXT', 'FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE',
  'BOOLEAN_OPERATION', 'SECTION',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function getCollectionName(variable: Variable): string {
  const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
  return collection?.name ?? 'Unknown';
}

// Build map: hex → Variable[] across ALL modes of ALL collections
function buildColorVariableMap(): Map<string, Variable[]> {
  const variableMap = new Map<string, Variable[]>();
  const variables = figma.variables.getLocalVariables('COLOR');

  for (const variable of variables) {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    if (!collection) continue;

    for (const mode of collection.modes) {
      const value = variable.valuesByMode[mode.modeId];
      // Only handle direct RGB values (skip aliases)
      if (value && typeof value === 'object' && 'r' in value) {
        const hex = rgbToHex(value as RGB);
        const existing = variableMap.get(hex) ?? [];
        if (!existing.some(v => v.id === variable.id)) {
          existing.push(variable);
          variableMap.set(hex, existing);
        }
      }
    }
  }

  return variableMap;
}

// Scan a single Paint and return a TokenMatch if it matches a variable
function matchPaint(
  paint: Paint,
  index: number,
  property: 'fills' | 'strokes',
  node: SceneNode,
  pageName: string,
  pageId: string,
  variableMap: Map<string, Variable[]>
): TokenMatch | null {
  if (paint.type !== 'SOLID') return null;

  // Skip if already bound to a variable
  const solid = paint as SolidPaint;
  if (solid.boundVariables && solid.boundVariables['color']) return null;

  const hex = rgbToHex(solid.color);
  const variables = variableMap.get(hex);
  if (!variables || variables.length === 0) return null;

  const primary = variables[0];

  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    pageName,
    pageId,
    property,
    fillIndex: index,
    hex,
    variableId: primary.id,
    variableName: primary.name,
    collectionName: getCollectionName(primary),
    hasCollision: variables.length > 1,
    collisionCount: variables.length,
    allVariables: variables.map(v => ({
      id: v.id,
      name: v.name,
      collectionName: getCollectionName(v),
    })),
  };
}

// Collect nodes to scan based on options
function collectNodes(page: PageNode, options: ScanOptions): SceneNode[] {
  if (options.selectionOnly && page === figma.currentPage) {
    const selected = figma.currentPage.selection;
    if (selected.length === 0) return [];

    const result: SceneNode[] = [];
    for (const node of selected) {
      if (FILL_NODE_TYPES.includes(node.type as NodeType)) {
        result.push(node as SceneNode);
      }
      if ('findAllWithCriteria' in node) {
        const children = (node as FrameNode).findAllWithCriteria({ types: FILL_NODE_TYPES });
        result.push(...children);
      }
    }
    return result;
  }

  return page.findAllWithCriteria({ types: FILL_NODE_TYPES });
}

// ─── Core Functions ───────────────────────────────────────────────────────────

async function findTokens(options: ScanOptions): Promise<void> {
  const variableMap = buildColorVariableMap();

  if (variableMap.size === 0) {
    figma.ui.postMessage({ type: 'noVariables' });
    figma.notify('No local color variables found in this document.', { error: true });
    return;
  }

  const foundTokens: TokenMatch[] = [];
  const pages: PageNode[] = options.scanAllPages
    ? (figma.root.children as PageNode[])
    : [figma.currentPage];

  // First pass: count nodes for accurate progress
  let totalNodes = 0;
  const nodesByPage: SceneNode[][] = [];
  for (const page of pages) {
    const nodes = collectNodes(page, options);
    nodesByPage.push(nodes);
    totalNodes += nodes.length;
  }

  figma.ui.postMessage({ type: 'scanStart', total: totalNodes });

  let processedNodes = 0;

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const nodes = nodesByPage[pi];

    figma.ui.postMessage({
      type: 'scanProgress',
      current: processedNodes,
      total: totalNodes,
      pageName: page.name,
    } as ProgressMessage);

    for (const node of nodes) {
      // Scan fills
      if ('fills' in node && Array.isArray(node.fills)) {
        const fills = node.fills as Paint[];
        for (let i = 0; i < fills.length; i++) {
          const match = matchPaint(fills[i], i, 'fills', node, page.name, page.id, variableMap);
          if (match) foundTokens.push(match);
        }
      }

      // Scan strokes (optional)
      if (options.includeStrokes && 'strokes' in node && Array.isArray(node.strokes)) {
        const strokes = node.strokes as Paint[];
        for (let i = 0; i < strokes.length; i++) {
          const match = matchPaint(strokes[i], i, 'strokes', node, page.name, page.id, variableMap);
          if (match) foundTokens.push(match);
        }
      }

      processedNodes++;

      // Yield to UI every 500 nodes to keep responsive
      if (processedNodes % 500 === 0) {
        figma.ui.postMessage({
          type: 'scanProgress',
          current: processedNodes,
          total: totalNodes,
          pageName: page.name,
        } as ProgressMessage);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  const collisionCount = foundTokens.filter(t => t.hasCollision).length;

  figma.ui.postMessage({
    type: 'foundTokens',
    data: foundTokens,
    totalNodes,
    collisionCount,
    pagesScanned: pages.length,
  } as FoundTokensMessage);

  const parts: string[] = [`Found ${foundTokens.length} token${foundTokens.length !== 1 ? 's' : ''}`];
  if (collisionCount > 0) parts.push(`${collisionCount} collision${collisionCount !== 1 ? 's' : ''}`);
  if (options.scanAllPages && pages.length > 1) parts.push(`${pages.length} pages`);

  figma.notify(parts.join(' · '));
}

function replaceTokens(
  tokens: TokenMatch[],
  overrides: Record<string, string>
): void {
  let replacedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const token of tokens) {
    const node = figma.getNodeById(token.nodeId);
    if (!node || !('fills' in node)) {
      skippedCount++;
      continue;
    }

    // Check for user-selected variable override (collision resolution)
    const overrideKey = `${token.nodeId}:${token.property}:${token.fillIndex}`;
    const variableId = overrides[overrideKey] ?? token.variableId;
    const variable = figma.variables.getVariableById(variableId);

    if (!variable) {
      skippedCount++;
      continue;
    }

    try {
      if (token.property === 'fills') {
        const fills = JSON.parse(JSON.stringify(node.fills)) as Paint[];

        // Find fill by hex match (stale-index-safe: fills may have changed since scan)
        let targetIndex = -1;
        for (let i = 0; i < fills.length; i++) {
          const fill = fills[i] as SolidPaint;
          if (fill.type === 'SOLID' && !fill.boundVariables?.['color'] && rgbToHex(fill.color) === token.hex) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex === -1) {
          skippedCount++;
          continue;
        }

        fills[targetIndex] = figma.variables.setBoundVariableForPaint(
          fills[targetIndex] as SolidPaint, 'color', variable
        );
        (node as GeometryMixin).fills = fills;
        replacedCount++;

      } else if (token.property === 'strokes' && 'strokes' in node) {
        const strokes = JSON.parse(JSON.stringify(node.strokes)) as Paint[];

        let targetIndex = -1;
        for (let i = 0; i < strokes.length; i++) {
          const stroke = strokes[i] as SolidPaint;
          if (stroke.type === 'SOLID' && !stroke.boundVariables?.['color'] && rgbToHex(stroke.color) === token.hex) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex === -1) {
          skippedCount++;
          continue;
        }

        strokes[targetIndex] = figma.variables.setBoundVariableForPaint(
          strokes[targetIndex] as SolidPaint, 'color', variable
        );
        (node as GeometryMixin).strokes = strokes;
        replacedCount++;
      }
    } catch (err) {
      console.warn('Failed to replace token on node:', token.nodeName, err);
      errorCount++;
    }
  }

  // Group ALL replacements into a single undoable step
  figma.commitUndo();

  const parts: string[] = [`✅ Replaced ${replacedCount}`];
  if (skippedCount > 0) parts.push(`${skippedCount} skipped`);
  if (errorCount > 0) parts.push(`${errorCount} errors`);

  figma.notify(parts.join(' · '), { timeout: 4000 });

  figma.ui.postMessage({
    type: 'replaceComplete',
    replacedCount,
    skippedCount,
    errorCount,
  } as ReplaceCompleteMessage);
}

function exportReport(tokens: TokenMatch[]): void {
  const headers = ['Node Name', 'Node Type', 'Page', 'Property', 'Fill Index', 'Hex', 'Variable', 'Collection', 'Collision'];

  const rows = tokens.map(t => [
    `"${t.nodeName.replace(/"/g, '""')}"`,
    t.nodeType,
    `"${t.pageName.replace(/"/g, '""')}"`,
    t.property,
    String(t.fillIndex),
    t.hex,
    `"${t.variableName.replace(/"/g, '""')}"`,
    `"${t.collectionName.replace(/"/g, '""')}"`,
    t.hasCollision ? `"${t.allVariables.map(v => v.name).join(', ')}"` : 'No',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  figma.ui.postMessage({
    type: 'exportReport',
    csv,
    tokenCount: tokens.length,
  });
}

// ─── UI Lifecycle ─────────────────────────────────────────────────────────────

figma.showUI(__html__, {
  width: 440,
  height: 580,
  title: 'Heavy Token Replacer',
});

// ─── Message Handler ──────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg: {
  type: string;
  options?: ScanOptions;
  tokens?: TokenMatch[];
  overrides?: Record<string, string>;
}) => {
  switch (msg.type) {
    case 'findTokens':
      if (msg.options) {
        await findTokens(msg.options);
      }
      break;

    case 'replaceTokens':
      if (msg.tokens) {
        replaceTokens(msg.tokens, msg.overrides ?? {});
      }
      break;

    case 'exportReport':
      if (msg.tokens) {
        exportReport(msg.tokens);
      }
      break;

    case 'close':
      figma.closePlugin();
      break;
  }
};
