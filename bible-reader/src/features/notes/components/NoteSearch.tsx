import { useMemo, useRef, useState } from 'react';
import type { BibleBook, Note } from '../../../types';
import { truncateHtml, stripHtml } from '../../../lib/utils/text';
import { formatDate } from '../../../lib/utils/date';
import LoadingIndicator from '../../shared/components/LoadingIndicator';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

type NoteSearchProps = {
  notes: Note[];
  books: BibleBook[];
  onNavigate: (sourceReference: string) => void;
  onSelectNote?: (noteId: string) => void;
  onToggleFavorite?: (note: Note) => void | Promise<void>;
  onAddToCollection?: (type: 'note', label: string, sourceReference: string, itemId: string) => void;
  selectedNoteId?: string | null;
  maxVisible?: number;
};

function extractBookId(sourceReference: string): string {
  const idx = sourceReference.indexOf(':');
  return idx > 0 ? sourceReference.slice(0, idx) : '';
}

function matchesDateFilter(note: Note, filter: DateFilter): boolean {
  if (filter === 'all') return true;

  const created = new Date(note.createdAt);
  const now = new Date();

  switch (filter) {
    case 'today': {
      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth() &&
        created.getDate() === now.getDate()
      );
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created >= monthAgo;
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return created >= yearAgo;
    }
  }
}

export default function NoteSearch({ notes, books, onNavigate, onSelectNote, onToggleFavorite, onAddToCollection, selectedNoteId, maxVisible = 4 }: NoteSearchProps) {
  const [query, setQuery] = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDate, setFilterDate] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleResultsKeyDown = (e: React.KeyboardEvent) => {
    const container = resultsRef.current;
    if (!container) return;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const targets = Array.from(container.querySelectorAll<HTMLElement>('[data-note-nav]'));
    if (targets.length === 0) return;
    const currentIndex = targets.indexOf(document.activeElement as HTMLElement);
    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = targets.length - 1;
    else if (e.key === 'ArrowDown') nextIndex = currentIndex < targets.length - 1 ? currentIndex + 1 : 0;
    else if (e.key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : targets.length - 1;
    targets[nextIndex]?.focus();
  };

  const handleToggleFavorite = async (note: Note) => {
    if (favoriteBusyId) return;
    setFavoriteBusyId(note.id);
    try {
      await onToggleFavorite?.(note);
    } finally {
      setFavoriteBusyId(null);
    }
  };

  const bookIdToName = useMemo(() => {
    const map = new Map<string, string>();
    for (const book of books) {
      map.set(book.id, book.name);
    }
    return map;
  }, [books]);

  const uniqueBookIds = useMemo(() => {
    const ids = new Set<string>();
    for (const note of notes) {
      const id = extractBookId(note.sourceReference);
      if (id) ids.add(id);
    }
    return [...ids].sort();
  }, [notes]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tags.add(tag);
      }
    }
    return [...tags].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      if (query.trim()) {
        const lower = query.toLowerCase();
        const matches =
          note.title.toLowerCase().includes(lower) ||
          stripHtml(note.content).toLowerCase().includes(lower) ||
          note.tags.some((t) => t.toLowerCase().includes(lower));
        if (!matches) return false;
      }

      if (filterBook) {
        const noteBook = extractBookId(note.sourceReference);
        if (noteBook !== filterBook) return false;
      }

      if (filterTag) {
        if (!note.tags.includes(filterTag)) return false;
      }

      if (!matchesDateFilter(note, filterDate)) return false;

      return true;
    });
  }, [notes, query, filterBook, filterTag, filterDate]);

  const hasActiveFilters = filterBook || filterTag || filterDate !== 'all';

  function clearFilters() {
    setFilterBook('');
    setFilterTag('');
    setFilterDate('all');
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search notes..."
        aria-label="Search notes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus-accent"
      />

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="mb-3 flex items-center gap-1 text-xs opacity-50 transition-opacity duration-150 hover:opacity-100"
      >
        <span>{showFilters ? 'Hide' : 'Show'} filters</span>
        {hasActiveFilters && (
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </button>

      {showFilters && (
        <div className="mb-3 space-y-2 rounded-md border p-2 animate-fade-in">
          <div>
            <label htmlFor="note-filter-book" className="mb-0.5 block text-xs opacity-60">Book</label>
            <select
              id="note-filter-book"
              value={filterBook}
              onChange={(e) => setFilterBook(e.target.value)}
              className="w-full rounded-md border px-2 py-1 text-xs outline-none transition-colors duration-150 focus-accent"
            >
              <option value="">All books</option>
              {uniqueBookIds.map((id) => (
                <option key={id} value={id}>
                  {bookIdToName.get(id) ?? id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note-filter-tag" className="mb-0.5 block text-xs opacity-60">Tag</label>
            <select
              id="note-filter-tag"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full rounded-md border px-2 py-1 text-xs outline-none transition-colors duration-150 focus-accent"
            >
              <option value="">All tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note-filter-date" className="mb-0.5 block text-xs opacity-60">Date</label>
            <select
              id="note-filter-date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value as DateFilter)}
              className="w-full rounded-md border px-2 py-1 text-xs outline-none transition-colors duration-150 focus-accent"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last year</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-red-500 transition-colors duration-150 hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <div className="mb-2 flex flex-wrap gap-1">
          {filterBook && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">
              {bookIdToName.get(filterBook) ?? filterBook}
              <button type="button" onClick={() => setFilterBook('')} aria-label="Remove book filter" className="text-white/80 hover:text-white">&times;</button>
            </span>
          )}
          {filterTag && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">
              {filterTag}
              <button type="button" onClick={() => setFilterTag('')} aria-label="Remove tag filter" className="text-white/80 hover:text-white">&times;</button>
            </span>
          )}
          {filterDate !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">
              {filterDate === 'week' ? 'Last 7 days' : filterDate === 'month' ? 'Last 30 days' : filterDate === 'year' ? 'Last year' : 'Today'}
              <button type="button" onClick={() => setFilterDate('all')} aria-label="Remove date filter" className="text-white/80 hover:text-white">&times;</button>
            </span>
          )}
        </div>
      )}

      <div ref={resultsRef} onKeyDown={handleResultsKeyDown} className="space-y-2">
        {filtered.slice(0, expanded ? filtered.length : maxVisible).map((note) => (
          <div
            key={note.id}
            className={`relative rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150 hover-bg ${
              selectedNoteId === note.id ? 'border-accent bg-accent-light' : ''
            }`}
          >
            <button
              type="button"
              data-note-nav
              onClick={() => {
                onNavigate(note.sourceReference);
                onSelectNote?.(note.id);
              }}
              className="w-full text-left"
            >
            <p className="font-medium">{note.title || 'Untitled'}</p>
            <p className="mt-1 text-xs opacity-60">{formatDate(note.createdAt)}</p>
            <p className="mt-0.5 text-xs opacity-40">{note.sourceReference}</p>
            {note.content && (
              <p className="mt-1 text-xs opacity-80">{truncateHtml(note.content, 60)}</p>
            )}
            {note.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            </button>
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              {onAddToCollection && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddToCollection('note', note.title || 'Untitled', note.sourceReference, note.id); }}
                  className="text-sm leading-none text-gray-400 hover:text-green-600 transition-colors"
                  title="Add to collection"
                  aria-label="Add to collection"
                >
                  {'\u{1F4C1}'}
                </button>
              )}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); void handleToggleFavorite(note); }}
                  disabled={favoriteBusyId !== null}
                  aria-busy={favoriteBusyId === note.id}
                  aria-label={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  className={`text-lg leading-none transition-colors disabled:cursor-not-allowed ${
                    note.favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  title={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favoriteBusyId === note.id ? (
                    <LoadingIndicator compact size="xs" />
                  ) : note.favorite ? '\u2605' : '\u2606'}
                </button>
              )}
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <p className="py-2 text-xs opacity-50 italic">A blank page for your reflections.</p>
        )}

        {notes.length > 0 && filtered.length === 0 && (
          <p className="py-2 text-xs opacity-50 italic">No matching notes.</p>
        )}

        {filtered.length > maxVisible && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="w-full rounded-md border border-theme px-3 py-1.5 text-xs opacity-60 transition-colors duration-150 hover:opacity-100 hover-bg"
          >
            {expanded ? 'Show fewer' : `Show all ${filtered.length} notes`}
          </button>
        )}
      </div>
    </div>
  );
}
