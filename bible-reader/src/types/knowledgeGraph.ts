export type GraphNodeType = 'passage' | 'note' | 'bookmark' | 'prayer' | 'collection' | 'project' | 'catechism' | 'summa';

export type GraphEdgeType = 'references' | 'linked_to' | 'part_of' | 'mentions' | 'contains';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subtitle?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
}

export interface GraphPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type PositionedNode = GraphNode & GraphPosition;

export const NODE_COLORS: Record<GraphNodeType, string> = {
  passage: '#3b82f6',
  note: '#6b7280',
  bookmark: '#14b8a6',
  prayer: '#a855f7',
  collection: '#f59e0b',
  project: '#ef4444',
  catechism: '#22c55e',
  summa: '#f97316',
};

export const NODE_LABELS: Record<GraphNodeType, string> = {
  passage: 'Passage',
  note: 'Note',
  bookmark: 'Bookmark',
  prayer: 'Prayer',
  collection: 'Collection',
  project: 'Project',
  catechism: 'Catechism',
  summa: 'Summa',
};
