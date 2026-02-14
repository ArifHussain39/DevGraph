import type { Edge, Node } from '@xyflow/react';

export type JsonValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

export interface CardRow {
  key: string;
  value: string;
  type: JsonValueType;
  /** If this row links to a child card node */
  childNodeId?: string;
  /** For color values, store the actual color */
  colorSwatch?: string;
}

export interface CardNodeData {
  rows: CardRow[];
  isCollapsed: boolean;
  path: string;
  depth: number;
  [key: string]: unknown;
}

const NODE_WIDTH = 220;
const ROW_HEIGHT = 28;
const HEADER_PADDING = 12;
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 30;

function getValueType(value: unknown): JsonValueType {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonValueType;
}

/** Detect if a string is a hex color */
function isColorValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return value;
  return null;
}

function getValuePreview(value: unknown, type: JsonValueType): string {
  switch (type) {
    case 'string': {
      const str = String(value);
      return str.length > 30 ? str.substring(0, 30) + '…' : str;
    }
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'object':
      return `{${Object.keys(value as object).length} keys}`;
    case 'array':
      return `[${(value as unknown[]).length} items]`;
    default:
      return String(value);
  }
}

interface BuildContext {
  nodes: Node<CardNodeData>[];
  edges: Edge[];
  collapsedNodes: Set<string>;
}

/**
 * Build a card node for an object or array, and recursively build child cards
 * for nested objects/arrays.
 * Returns the node ID and estimated visual height.
 */
function buildCardNode(
  value: unknown,
  path: string,
  depth: number,
  ctx: BuildContext
): string {
  const nodeId = path || 'root';
  const type = getValueType(value);
  const isCollapsed = ctx.collapsedNodes.has(nodeId);

  const rows: CardRow[] = [];

  if (
    type === 'object' &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const valType = getValueType(val);
      const childPath = `${path}.${key}`;

      if ((valType === 'object' || valType === 'array') && val !== null) {
        // This row links to a child card
        rows.push({
          key,
          value: getValuePreview(val, valType),
          type: valType,
          childNodeId: isCollapsed ? undefined : childPath,
        });

        if (!isCollapsed) {
          // Recursively build child card
          buildCardNode(val, childPath, depth + 1, ctx);

          // Create edge with label
          ctx.edges.push({
            id: `e-${nodeId}-${childPath}`,
            source: nodeId,
            sourceHandle: `handle-${key}`,
            target: childPath,
            type: 'smoothstep',
            label: key,
            labelStyle: {
              fontSize: 11,
              fontWeight: 500,
              fill: 'var(--edge-label-color)',
              fontFamily: 'Inter, sans-serif',
            },
            labelBgStyle: {
              fill: 'var(--edge-label-bg)',
              fillOpacity: 0.85,
            },
            labelBgPadding: [6, 3] as [number, number],
            labelBgBorderRadius: 4,
            style: { stroke: 'var(--edge-color)', strokeWidth: 1.5 },
          });
        }
      } else {
        // Primitive value row
        rows.push({
          key,
          value: getValuePreview(val, valType),
          type: valType,
          colorSwatch: isColorValue(val) ?? undefined,
        });
      }
    }
  } else if (type === 'array' && Array.isArray(value)) {
    // For arrays, each element gets wired to its own card if it's an object/array
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const itemType = getValueType(item);
      const childPath = `${path}[${i}]`;

      if ((itemType === 'object' || itemType === 'array') && item !== null) {
        rows.push({
          key: `[${i}]`,
          value: getValuePreview(item, itemType),
          type: itemType,
          childNodeId: isCollapsed ? undefined : childPath,
        });

        if (!isCollapsed) {
          buildCardNode(item, childPath, depth + 1, ctx);
          const parentLabel = path.includes('.')
            ? (path.split('.').pop() ?? path)
            : path.includes('[')
            ? (path.split('[')[0].split('.').pop() ?? path)
            : path;

          ctx.edges.push({
            id: `e-${nodeId}-${childPath}`,
            source: nodeId,
            sourceHandle: `handle-[${i}]`,
            target: childPath,
            type: 'smoothstep',
            label: parentLabel === 'root' ? `[${i}]` : parentLabel,
            labelStyle: {
              fontSize: 11,
              fontWeight: 500,
              fill: 'var(--edge-label-color)',
              fontFamily: 'Inter, sans-serif',
            },
            labelBgStyle: {
              fill: 'var(--edge-label-bg)',
              fillOpacity: 0.85,
            },
            labelBgPadding: [6, 3] as [number, number],
            labelBgBorderRadius: 4,
            style: { stroke: 'var(--edge-color)', strokeWidth: 1.5 },
          });
        }
      } else {
        rows.push({
          key: `[${i}]`,
          value: getValuePreview(item, itemType),
          type: itemType,
          colorSwatch: isColorValue(item) ?? undefined,
        });
      }
    }
  } else {
    // Single primitive at root - edge case
    rows.push({
      key: 'value',
      value: getValuePreview(value, type),
      type,
    });
  }

  const node: Node<CardNodeData> = {
    id: nodeId,
    type: 'cardNode',
    position: { x: 0, y: 0 },
    data: {
      rows,
      isCollapsed,
      path: nodeId,
      depth,
    },
  };

  ctx.nodes.push(node);
  return nodeId;
}

/**
 * Calculate the pixel height of a card node.
 */
function getCardHeight(node: Node<CardNodeData>): number {
  return node.data.rows.length * ROW_HEIGHT + HEADER_PADDING;
}

/**
 * Layout all nodes in a left-to-right tree.
 */
function layoutNodes(nodes: Node<CardNodeData>[], edges: Edge[]): void {
  const childrenMap = new Map<string, string[]>();
  for (const edge of edges) {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  }

  const nodeMap = new Map<string, Node<CardNodeData>>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Calculate subtree height
  const subtreeHeight = new Map<string, number>();

  function calcHeight(id: string): number {
    const node = nodeMap.get(id);
    if (!node) return 0;
    const selfHeight = getCardHeight(node);

    const children = childrenMap.get(id);
    if (!children || children.length === 0) {
      subtreeHeight.set(id, selfHeight);
      return selfHeight;
    }

    let totalChildHeight = 0;
    for (const childId of children) {
      totalChildHeight += calcHeight(childId);
    }
    totalChildHeight += (children.length - 1) * VERTICAL_GAP;

    const total = Math.max(selfHeight, totalChildHeight);
    subtreeHeight.set(id, total);
    return total;
  }

  // Find root nodes
  const targets = new Set(edges.map((e) => e.target));
  const rootIds = nodes.filter((n) => !targets.has(n.id)).map((n) => n.id);

  for (const rootId of rootIds) {
    calcHeight(rootId);
  }

  function positionNode(id: string, x: number, centerY: number) {
    const node = nodeMap.get(id);
    if (!node) return;

    const selfHeight = getCardHeight(node);
    node.position = { x, y: centerY - selfHeight / 2 };

    const children = childrenMap.get(id);
    if (!children || children.length === 0) return;

    const totalChildHeight =
      children.reduce((sum, cid) => sum + (subtreeHeight.get(cid) || 0), 0) +
      (children.length - 1) * VERTICAL_GAP;

    let currentY = centerY - totalChildHeight / 2;

    for (const childId of children) {
      const childH = subtreeHeight.get(childId) || 0;
      positionNode(
        childId,
        x + NODE_WIDTH + HORIZONTAL_GAP,
        currentY + childH / 2
      );
      currentY += childH + VERTICAL_GAP;
    }
  }

  let globalY = 0;
  for (const rootId of rootIds) {
    const h = subtreeHeight.get(rootId) || 0;
    positionNode(rootId, 0, globalY + h / 2);
    globalY += h + VERTICAL_GAP * 2;
  }
}

/**
 * Transform parsed JSON into React Flow nodes and edges (card style).
 */
export function jsonToFlow(
  data: unknown,
  collapsedNodes: Set<string> = new Set()
): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  if (data === null || data === undefined) {
    return { nodes: [], edges: [] };
  }

  const ctx: BuildContext = {
    nodes: [],
    edges: [],
    collapsedNodes,
  };

  buildCardNode(data, 'root', 0, ctx);
  layoutNodes(ctx.nodes, ctx.edges);

  return { nodes: ctx.nodes, edges: ctx.edges };
}
