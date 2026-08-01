export type GraphNodeType = 'passage' | 'note' | 'bookmark' | 'prayer' | 'collection' | 'project' | 'catechism' | 'summa';

export type GraphEdgeType = 'references' | 'linked_to' | 'part_of' | 'mentions' | 'contains';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subtitle?: string;
  createdAt?: string;
  tags?: string[];
}

export interface GraphFilters {
  nodeTypes: GraphNodeType[];
  depth: 'all' | 1 | 2;
  focusedNodeId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags: string[];
  collectionId?: string;
  projectId?: string;
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
  passage: '#6b8fc9',
  note: '#8b96a5',
  bookmark: '#6fb5ab',
  prayer: '#9d86bd',
  collection: '#c9a45c',
  project: '#c27070',
  catechism: '#7fb58a',
  summa: '#c98f5f',
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
