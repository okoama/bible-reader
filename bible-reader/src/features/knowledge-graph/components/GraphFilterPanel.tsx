import { useCallback, useMemo, useRef, useState } from 'react';
import type { GraphNodeType, Collection, ResearchProject, GraphFilters } from '../../../types';
import { NODE_COLORS, NODE_LABELS } from '../../../types';

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
  const tagInputRef = useRef<HTMLInputElement>(null);

  const toggleType = useCallback((type: GraphNodeType) => {
    const next = filters.nodeTypes.includes(type)
      ? filters.nodeTypes.filter((t) => t !== type)
      : [...filters.nodeTypes, type];
    onChange({ ...filters, nodeTypes: next.length === 0 ? ALL_TYPES : next });
  }, [filters, onChange]);

  const addTag = useCallback((tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onChange({ ...filters, tags: [...filters.tags, tag] });
    }
    setTagInput('');
    tagInputRef.current?.focus();
  }, [filters, onChange]);

  const removeTag = useCallback((tag: string) => {
    onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
  }, [filters, onChange]);

  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const lower = tagInput.toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(lower) && !filters.tags.includes(t));
  }, [tagInput, allTags, filters.tags]);

  const handleReset = useCallback(() => {
    onChange({ nodeTypes: [...ALL_TYPES], depth: 'all', tags: [], dateFrom: undefined, dateTo: undefined, collectionId: undefined, projectId: undefined, focusedNodeId: undefined });
  }, [onChange]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 text-xs" role="region" aria-label="Graph filter controls">
      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">Filters</h3>

      <div role="group" aria-label="Filter by node type">
        <span className="font-medium opacity-70" id="filter-type-label">Type</span>
        <div className="mt-1 flex flex-wrap gap-1.5" role="listbox" aria-labelledby="filter-type-label" aria-multiselectable="true">
          {ALL_TYPES.map((type) => {
            const active = filters.nodeTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => toggleType(type)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'text-white' : 'border opacity-50 hover:opacity-100'
                }`}
                style={active ? { backgroundColor: NODE_COLORS[type] } : undefined}
              >
                {NODE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="font-medium opacity-70" htmlFor="filter-depth">Depth</label>
        <select
          id="filter-depth"
          value={filters.depth}
          onChange={(e) => onChange({ ...filters, depth: e.target.value as 'all' | 1 | 2 })}
          className="mt-1 w-full rounded border px-2 py-1 text-xs focus-accent"
        >
          <option value="all">Entire graph</option>
          <option value={1}>1 hop</option>
          <option value={2}>2 hops</option>
        </select>
        {filters.depth !== 'all' && !filters.focusedNodeId && (
          <p className="mt-1 italic opacity-40" role="status">Click a node to focus depth</p>
        )}
      </div>

      <div>
        <span className="font-medium opacity-70">Date</span>
        <div className="mt-1 flex flex-col gap-1">
          <label className="sr-only" htmlFor="filter-date-from">From date</label>
          <input id="filter-date-from" type="date" value={filters.dateFrom ?? ''} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })} className="rounded border px-2 py-1 text-xs focus-accent" />
          <label className="sr-only" htmlFor="filter-date-to">To date</label>
          <input id="filter-date-to" type="date" value={filters.dateTo ?? ''} onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })} className="rounded border px-2 py-1 text-xs focus-accent" />
        </div>
      </div>

      <div>
        <label className="font-medium opacity-70">Tags</label>
        <div className="mt-1 flex flex-wrap gap-1" role="list" aria-label="Active tag filters">
          {filters.tags.map((tag) => (
            <span key={tag} role="listitem" className="inline-flex items-center gap-1 rounded bg-accent-lighter px-1.5 py-0.5 text-[11px] text-accent">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent rounded">&times;</button>
            </span>
          ))}
        </div>
        <div className="relative mt-1">
          <input
            ref={tagInputRef}
            type="text" placeholder="Add tag..." value={tagInput}
            aria-label="Add tag filter"
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput.trim().toLowerCase()); } if (e.key === 'Escape') setTagInput(''); }}
            className="w-full rounded border px-2 py-1 text-xs focus-accent"
          />
          {filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-0.5 w-full rounded border bg-white shadow" role="listbox" aria-label="Tag suggestions">
              {filteredSuggestions.map((s) => (
                <button key={s} type="button" role="option" onClick={() => addTag(s)} className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-accent">{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="font-medium opacity-70" htmlFor="filter-collection">Collection</label>
        <select
          id="filter-collection"
          value={filters.collectionId ?? ''}
          onChange={(e) => onChange({ ...filters, collectionId: e.target.value || undefined })}
          className="mt-1 w-full rounded border px-2 py-1 text-xs focus-accent"
        >
          <option value="">All</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="font-medium opacity-70" htmlFor="filter-project">Project</label>
        <select
          id="filter-project"
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
        onClick={handleReset}
        className="mt-2 rounded border px-3 py-1.5 text-xs transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-accent"
      >
        Reset Filters
      </button>
    </div>
  );
}
