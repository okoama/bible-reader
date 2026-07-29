import type { GraphNode, GraphEdge } from '../../types';
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
}

export async function buildGraphData(): Promise<GraphData> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
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
    addNode({ id: `note:${note.id}`, type: 'note', label: note.title || 'Untitled', subtitle: note.sourceReference });
    addPassageNode(note.sourceReference);
    if (note.projectId) addEdge({ id: `e:note-project:${note.id}`, source: `note:${note.id}`, target: `project:${note.projectId}`, type: 'part_of' });
    addEdge({ id: `e:note-passage:${note.id}`, source: `note:${note.id}`, target: `passage:${note.sourceReference}`, type: 'references' });
  }

  for (const bm of bookmarks) {
    addNode({ id: `bookmark:${bm.id}`, type: 'bookmark', label: bm.title || bm.sourceReference, subtitle: bm.sourceReference });
    addPassageNode(bm.sourceReference);
    if (bm.projectId) addEdge({ id: `e:bm-project:${bm.id}`, source: `bookmark:${bm.id}`, target: `project:${bm.projectId}`, type: 'part_of' });
    addEdge({ id: `e:bm-passage:${bm.id}`, source: `bookmark:${bm.id}`, target: `passage:${bm.sourceReference}`, type: 'references' });
  }

  for (const prayer of prayers) {
    addNode({ id: `prayer:${prayer.id}`, type: 'prayer', label: prayer.title, subtitle: prayer.category });
    if (prayer.projectId) addEdge({ id: `e:prayer-project:${prayer.id}`, source: `prayer:${prayer.id}`, target: `project:${prayer.projectId}`, type: 'part_of' });
  }

  for (const col of collections) {
    addNode({ id: `collection:${col.id}`, type: 'collection', label: col.name, subtitle: `${col.items.length} items` });
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
    addNode({ id: `project:${project.id}`, type: 'project', label: project.title, subtitle: project.status });
  }

  return { nodes, edges };
}
