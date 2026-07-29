import { useMemo, useState } from 'react';
import type { GraphNodeType, Collection, ResearchProject, GraphFilters } from '../../types';
import { NODE_COLORS, NODE_LABELS } from '../../types';

const ALL_TYPES: GraphNodeType[] = ['passage', 'note', 'bookmark', 'prayer', 'collection', 'project', 'catechism', 'summa'];

type Props = {
  filters: GraphFilters;
  onChange: (filters: GraphFilters) => void;
  allTags: string[];
  collections: Collection[];
  projects: ResearchProject[];
};

export default function GraphFilterPanel({ filters, onChange, allTags, collections, projects }: Props) {
  const [tagInput, setTagInput] = useState('');

  const toggleType = (type: GraphNodeType) => {
    const next = filters.nodeTypes.includes(type)
      ? filters.nodeTypes.filter((t) => t !== type)
      : [...filters.nodeTypes, type];
    onChange({ ...filters, nodeTypes: next.length === 0 ? ALL_TYPES : next });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onChange({ ...filters, tags: [...filters.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
  };

  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const lower = tagInput.toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(lower) && !filters.tags.includes(t));
  }, [tagInput, allTags, filters.tags]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 text-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">Filters</h3>

      <div>
        <span className="font-medium opacity-70">Type</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                filters.nodeTypes.includes(type) ? 'text-white' : 'border opacity-50 hover:opacity-100'
              }`}
              style={filters.nodeTypes.includes(type) ? { backgroundColor: NODE_COLORS[type] } : undefined}
            >
              {NODE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="font-medium opacity-70">Depth</span>
        <select
          value={filters.depth}
          onChange={(e) => onChange({ ...filters, depth: e.target.value as 'all' | 1 | 2 })}
          className="mt-1 w-full rounded border px-2 py-1 text-xs focus-accent"
        >
          <option value="all">Entire graph</option>
          <option value={1}>1 hop</option>
          <option value={2}>2 hops</option>
        </select>
        {filters.depth !== 'all' && !filters.focusedNodeId && (
          <p className="mt-1 italic opacity-40">Click a node to focus depth</p>
        )}
      </div>

      <div>
        <span className="font-medium opacity-70">Date</span>
        <div className="mt-1 flex flex-col gap-1">
          <input type="date" value={filters.dateFrom ?? ''} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })} className="rounded border px-2 py-1 text-xs focus-accent" />
          <input type="date" value={filters.dateTo ?? ''} onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })} className="rounded border px-2 py-1 text-xs focus-accent" />
        </div>
      </div>

      <div>
        <span className="font-medium opacity-70">Tags</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {filters.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded bg-accent-lighter px-1.5 py-0.5 text-[11px] text-accent">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent-hover">&times;</button>
            </span>
          ))}
        </div>
        <div className="relative mt-1">
          <input
            type="text" placeholder="Add tag..." value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput.trim().toLowerCase()); } }}
            className="w-full rounded border px-2 py-1 text-xs focus-accent"
          />
          {filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-0.5 w-full rounded border bg-white shadow">
              {filteredSuggestions.map((s) => (
                <button key={s} type="button" onClick={() => addTag(s)} className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50">{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <span className="font-medium opacity-70">Collection</span>
        <select
          value={filters.collectionId ?? ''}
          onChange={(e) => onChange({ ...filters, collectionId: e.target.value || undefined })}
          className="mt-1 w-full rounded border px-2 py-1 text-xs focus-accent"
        >
          <option value="">All</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <span className="font-medium opacity-70">Project</span>
        <select
          value={filters.projectId ?? ''}
          onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
          className="mt-1 w-full rounded border px-2 py-1 text-xs focus-accent"
        >
          <option value="">All</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.title}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ nodeTypes: [...ALL_TYPES], depth: 'all', tags: [], dateFrom: undefined, dateTo: undefined, collectionId: undefined, projectId: undefined, focusedNodeId: undefined })}
        className="mt-2 rounded border px-3 py-1.5 text-xs transition-colors hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
  );
}
