import type { GraphNode, GraphEdge, Collection, ResearchProject, GraphFilters } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { PrayerRepository } from '../repositories/PrayerRepository';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { ResearchProjectRepository } from '../repositories/ResearchProjectRepository';

const noteRepo = new NoteRepository();
const bookmarkRepo = new BookmarkRepository();
const prayerRepo = new PrayerRepository();
const collectionRepo = new CollectionRepository();
const projectRepo = new ResearchProjectRepository();

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  collections: Collection[];
  projects: ResearchProject[];
}

export async function buildGraphData(): Promise<GraphData> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const allTags = new Set<string>();
  const addedPassages = new Set<string>();
  const addedNodes = new Set<string>();

  function addNode(node: GraphNode) {
    if (addedNodes.has(node.id)) return;
    addedNodes.add(node.id);
    nodes.push(node);
  }

  function addPassageNode(ref: string) {
    if (!ref || addedPassages.has(ref)) return;
    addedPassages.add(ref);
    addNode({ id: `passage:${ref}`, type: 'passage', label: ref });
  }

  function addEdge(edge: GraphEdge) {
    if (!addedNodes.has(edge.source) || !addedNodes.has(edge.target)) return;
    edges.push(edge);
  }

  const [notes, bookmarks, prayers, collections, projects] = await Promise.all([
    noteRepo.findAll(),
    bookmarkRepo.findAll(),
    prayerRepo.findAll(),
    collectionRepo.findAll(),
    projectRepo.findAll(),
  ]);

  for (const note of notes) {
    addNode({ id: `note:${note.id}`, type: 'note', label: note.title || 'Untitled', subtitle: note.sourceReference, createdAt: note.createdAt, tags: note.tags });
    note.tags.forEach((t) => allTags.add(t));
    addPassageNode(note.sourceReference);
    if (note.projectId) addEdge({ id: `e:note-project:${note.id}`, source: `note:${note.id}`, target: `project:${note.projectId}`, type: 'part_of' });
    addEdge({ id: `e:note-passage:${note.id}`, source: `note:${note.id}`, target: `passage:${note.sourceReference}`, type: 'references' });
  }

  for (const bm of bookmarks) {
    addNode({ id: `bookmark:${bm.id}`, type: 'bookmark', label: bm.title || bm.sourceReference, subtitle: bm.sourceReference, createdAt: bm.createdAt });
    addPassageNode(bm.sourceReference);
    if (bm.projectId) addEdge({ id: `e:bm-project:${bm.id}`, source: `bookmark:${bm.id}`, target: `project:${bm.projectId}`, type: 'part_of' });
    addEdge({ id: `e:bm-passage:${bm.id}`, source: `bookmark:${bm.id}`, target: `passage:${bm.sourceReference}`, type: 'references' });
  }

  for (const prayer of prayers) {
    addNode({ id: `prayer:${prayer.id}`, type: 'prayer', label: prayer.title, subtitle: prayer.category, createdAt: prayer.createdAt });
    if (prayer.projectId) addEdge({ id: `e:prayer-project:${prayer.id}`, source: `prayer:${prayer.id}`, target: `project:${prayer.projectId}`, type: 'part_of' });
  }

  for (const col of collections) {
    addNode({ id: `collection:${col.id}`, type: 'collection', label: col.name, subtitle: `${col.items.length} items`, createdAt: col.createdAt });
    if (col.projectId) addEdge({ id: `e:col-project:${col.id}`, source: `collection:${col.id}`, target: `project:${col.projectId}`, type: 'part_of' });
    for (const item of col.items) {
      if (item.sourceReference) {
        addPassageNode(item.sourceReference);
        addEdge({ id: `e:col-passage:${col.id}:${item.id}`, source: `collection:${col.id}`, target: `passage:${item.sourceReference}`, type: 'contains' });
      }
      if (item.itemId) {
        if (item.type === 'note') addEdge({ id: `e:col-note:${col.id}:${item.id}`, source: `collection:${col.id}`, target: `note:${item.itemId}`, type: 'contains' });
        if (item.type === 'prayer') addEdge({ id: `e:col-prayer:${col.id}:${item.id}`, source: `collection:${col.id}`, target: `prayer:${item.itemId}`, type: 'contains' });
        if (item.type === 'bookmark') addEdge({ id: `e:col-bm:${col.id}:${item.id}`, source: `collection:${col.id}`, target: `bookmark:${item.itemId}`, type: 'contains' });
      }
    }
  }

  for (const project of projects) {
    addNode({ id: `project:${project.id}`, type: 'project', label: project.title, subtitle: project.status, createdAt: project.createdAt });
  }

  return { nodes, edges, collections, projects };
}

export function applyFilters(data: GraphData, filters: GraphFilters): { nodes: GraphNode[]; edges: GraphEdge[] } {
  let nodes = [...data.nodes];
  let edges = [...data.edges];

  if (filters.nodeTypes.length < 8) {
    const typeSet = new Set(filters.nodeTypes);
    nodes = nodes.filter((n) => typeSet.has(n.type));
  }

  if (filters.dateFrom || filters.dateTo) {
    nodes = nodes.filter((n) => {
      if (!n.createdAt) return false;
      const d = new Date(n.createdAt).getTime();
      if (filters.dateFrom && d < new Date(filters.dateFrom).getTime()) return false;
      if (filters.dateTo && d > new Date(filters.dateTo).getTime() + 86400000) return false;
      return true;
    });
  }

  if (filters.tags.length > 0) {
    const tagSet = new Set(filters.tags);
    const noteIds = new Set(nodes.filter((n) => n.type === 'note' && n.tags?.some((t) => tagSet.has(t))).map((n) => n.id));
    nodes = nodes.filter((n) => n.type !== 'note' || noteIds.has(n.id));
  }

  if (filters.collectionId) {
    const colNodeId = `collection:${filters.collectionId}`;
    const colNode = nodes.find((n) => n.id === colNodeId);
    if (colNode) {
      const connected = new Set([colNodeId]);
      edges.filter((e) => e.source === colNodeId || e.target === colNodeId).forEach((e) => { connected.add(e.source); connected.add(e.target); });
      nodes = nodes.filter((n) => connected.has(n.id));
    }
  }

  if (filters.projectId) {
    const projNodeId = `project:${filters.projectId}`;
    const projNode = nodes.find((n) => n.id === projNodeId);
    if (projNode) {
      const connected = new Set([projNodeId]);
      edges.filter((e) => e.source === projNodeId || e.target === projNodeId).forEach((e) => { connected.add(e.source); connected.add(e.target); });
      nodes = nodes.filter((n) => connected.has(n.id));
    }
  }

  const visibleIds = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));

  if (filters.depth !== 'all' && filters.focusedNodeId && visibleIds.has(filters.focusedNodeId)) {
    const visited = new Set([filters.focusedNodeId]);
    const queue: { id: string; depth: number }[] = [{ id: filters.focusedNodeId, depth: 0 }];
    while (queue.length > 0) {
      const c = queue.shift()!;
      if (c.depth >= filters.depth) continue;
      for (const edge of edges) {
        const nb = edge.source === c.id ? edge.target : edge.target === c.id ? edge.source : null;
        if (nb && !visited.has(nb) && visibleIds.has(nb)) { visited.add(nb); queue.push({ id: nb, depth: c.depth + 1 }); }
      }
    }
    nodes = nodes.filter((n) => visited.has(n.id));
  }

  return { nodes, edges };
}
