import { useCallback, useEffect, useRef, useState } from 'react';
import type { BibleBook, CollectionItemType, Highlight, Bookmark, Note, VerseRef } from '../../types';
import { useHighlights } from '../../lib/hooks/useHighlights';
import { useWorkHighlights } from '../../lib/hooks/useWorkHighlights';
import { useBookmarks } from '../../lib/hooks/useBookmarks';
import { HighlightRepository } from '../../lib/repositories/HighlightRepository';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { BookmarkRepository } from '../../lib/repositories/BookmarkRepository';
import { HIGHLIGHT_COLORS } from '../../lib/constants';
import { formatDate } from '../../lib/utils/date';
import { TextService } from '../../features/companion-texts/services/TextService';
import ConfirmDialog from '../../features/shared/components/ConfirmDialog';
import NoteSearch from '../sidebar/NoteSearch';
import AddToCollectionModal from '../../features/collections/components/AddToCollectionModal';
import { useWorkspaceSettings } from '../../lib/contexts/WorkspaceSettingsContext';

const highlightRepository = new HighlightRepository();
const noteRepository = new NoteRepository();
const bookmarkRepository = new BookmarkRepository();

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;

type RightPanelProps = {
  selectedVerse: VerseRef | null;
  selectedBook: BibleBook | null;
  selectedChapter: number | null;
  notes: Note[];
  books: BibleBook[];
  refreshKey: number;
  onNoteDeleted: () => void;
  onNavigateToBookmark: (sourceReference: string) => void;
  onNavigateToNote: (sourceReference: string) => void;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  workId?: string | null;
  sectionId?: string | null;
};

function coversVerse(sourceReference: string, verseNumber: number): boolean {
  const match = sourceReference.match(/^[^:]+:\d+:(\d+)(?:-(\d+))?$/);
  if (!match) return false;
  const start = Number.parseInt(match[1], 10);
  const end = match[2] ? Number.parseInt(match[2], 10) : start;
  return verseNumber >= start && verseNumber <= end;
}

export default function RightPanel({
  selectedVerse,
  selectedBook,
  selectedChapter,
  notes,
  books,
  refreshKey,
  onNoteDeleted,
  onNavigateToBookmark,
  onNavigateToNote,
  selectedNoteId,
  onSelectNote,
  workId,
  sectionId,
}: RightPanelProps) {
  const { settings, updateSettings } = useWorkspaceSettings();
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(settings.rightPanelWidth);
  const [deletingHighlight, setDeletingHighlight] = useState<Highlight | null>(null);
  const [deletingBookmark, setDeletingBookmark] = useState<Bookmark | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(['passage', 'highlights', 'notes', 'bookmarks']));
  const [addToCollectionTarget, setAddToCollectionTarget] = useState<{ type: CollectionItemType; label: string; sourceReference?: string; itemId?: string } | null>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textServiceRef = useRef(new TextService());

  const isCompanion = !!(workId && sectionId);
  const [sectionLabel, setSectionLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isCompanion || !workId || !sectionId) {
      setSectionLabel(null);
      return;
    }

    const entry = textServiceRef.current.getManifestEntry(workId);
    if (entry && entry.sections.length > 0) {
      const section = entry.sections.find((s) => s.id === sectionId);
      if (section) {
        setSectionLabel(section.label);
        return;
      }
    }

    textServiceRef.current.loadWork(workId).then((work) => {
      const section = work.sections.find((s) => s.id === sectionId);
      setSectionLabel(section?.label ?? sectionId);
    }).catch(() => {
      setSectionLabel(sectionId);
    });
  }, [workId, sectionId, isCompanion]);

  const highlights = isCompanion
    ? useWorkHighlights(workId, sectionId, refreshKey)
    : useHighlights(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const bookmarks = useBookmarks(isCompanion ? workId : selectedBook?.id ?? null, null, refreshKey);

  const verseNumber = selectedVerse?.verseNumber ?? null;

  const verseHighlights = !isCompanion && verseNumber !== null
    ? highlights.filter((h) => coversVerse(h.sourceReference, verseNumber))
    : highlights;

  function toggleSection(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const currentWidthRef = useRef(panelWidth);
  currentWidthRef.current = panelWidth;

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: currentWidthRef.current };

    const handleDragMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = dragRef.current.startX - ev.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragRef.current.startWidth + dx));
      setPanelWidth(newWidth);
      currentWidthRef.current = newWidth;
    };

    const handleDragEnd = () => {
      if (dragRef.current) {
        const finalWidth = currentWidthRef.current;
        localStorage.setItem('right-panel-width', String(finalWidth));
        updateSettings({ rightPanelWidth: finalWidth });
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [updateSettings]);

  useEffect(() => {
    localStorage.setItem('right-panel-width', String(panelWidth));
  }, [panelWidth]);

  async function handleConfirmDeleteHighlight() {
    if (!deletingHighlight) return;
    await highlightRepository.delete(deletingHighlight.id);
    setDeletingHighlight(null);
    onNoteDeleted();
  }

  async function handleChangeHighlightColor(highlight: Highlight, color: string) {
    await highlightRepository.update({ ...highlight, color });
    onNoteDeleted();
  }

  const handleToggleNoteFavorite = useCallback(async (note: Note) => {
    await noteRepository.update({ ...note, favorite: !note.favorite });
    onNoteDeleted(); // re-trigger refresh
  }, [onNoteDeleted]);

  const handleToggleBookmarkFavorite = useCallback(async (b: Bookmark) => {
    await bookmarkRepository.update({ ...b, favorite: !b.favorite });
    onNoteDeleted(); // re-trigger refresh
  }, [onNoteDeleted]);

  async function handleConfirmDeleteBookmark() {
    if (!deletingBookmark) return;
    await bookmarkRepository.delete(deletingBookmark.id);
    setDeletingBookmark(null);
    onNoteDeleted();
  }

  const isCollapsed = (id: string) => collapsed.has(id);

  return panelOpen ? (
    <aside
      ref={panelRef}
      className="relative flex shrink-0 flex-col border-l border-theme bg-panel"
      style={{ width: panelWidth }}
    >
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize transition-colors duration-150 hover:bg-accent-light active:bg-accent-lighter"
        onMouseDown={handleDragStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
      />
      <div className="flex items-center justify-between px-4 pt-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40">Panel</span>
        <button type="button" onClick={() => setPanelOpen(false)} className="text-xs opacity-40 hover:opacity-80" title="Collapse panel">
          {'\u2715'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pl-5 pt-1">
        <Section
          id="passage"
          title="Passage"
          collapsed={isCollapsed('passage')}
          onToggle={() => toggleSection('passage')}
          count={!isCompanion && verseNumber ? 1 : sectionId ? 1 : 0}
        >
          {isCompanion && sectionId ? (
            <div className="rounded border p-3">
              <p className="font-semibold">{sectionLabel ?? sectionId}</p>
            </div>
          ) : verseNumber && selectedBook ? (
            <div className="rounded border p-3">
              <p className="font-semibold">
                {selectedBook.name} {selectedChapter}:{verseNumber}
              </p>
            </div>
          ) : (
            <p className="text-sm opacity-60">No passage selected.</p>
          )}
        </Section>

        <Section
          id="highlights"
          title="Highlights"
          collapsed={isCollapsed('highlights')}
          onToggle={() => toggleSection('highlights')}
          count={verseHighlights.length}
        >
          {verseHighlights.length > 0 ? (
            <div className="space-y-2">
              {verseHighlights.map((h) => (
                <div key={h.id} className="rounded border p-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm" style={{ borderLeft: `3px solid ${h.color}`, paddingLeft: 8 }}>
                      {h.selectedText}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeletingHighlight(h)}
                      className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.name}
                        onClick={() => handleChangeHighlightColor(h, c.value)}
                        className={`h-3.5 w-3.5 rounded-full border hover:scale-125 ${
                          h.color === c.value ? 'border-gray-800 ring-1 ring-gray-400' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">Your lamp for the journey awaits a verse.</p>
          )}
        </Section>

        <Section
          id="notes"
          title="Notes"
          collapsed={isCollapsed('notes')}
          onToggle={() => toggleSection('notes')}
          count={notes.length}
        >
          <NoteSearch notes={notes} books={books} onNavigate={onNavigateToNote} onSelectNote={onSelectNote} onToggleFavorite={handleToggleNoteFavorite} onAddToCollection={(type, label, ref, id) => setAddToCollectionTarget({ type, label, sourceReference: ref, itemId: id })} selectedNoteId={selectedNoteId} />
        </Section>

        <Section
          id="bookmarks"
          title="Bookmarks"
          collapsed={isCollapsed('bookmarks')}
          onToggle={() => toggleSection('bookmarks')}
          count={bookmarks.length}
        >
          {bookmarks.length > 0 ? (
            <div className="space-y-2">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="group cursor-pointer rounded border p-2 hover-bg"
                  onClick={() => onNavigateToBookmark(b.sourceReference)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onNavigateToBookmark(b.sourceReference);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.title ?? 'Bookmark'}</p>
                      <p className="mt-1 text-xs opacity-60">{b.sourceReference}</p>
                      <p className="mt-1 text-xs opacity-60">{formatDate(b.createdAt)}</p>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddToCollectionTarget({ type: 'bookmark', label: b.title ?? 'Bookmark', sourceReference: b.sourceReference, itemId: b.id });
                        }}
                        className="text-sm text-gray-400 hover:text-green-600 transition-colors"
                        title="Add to collection"
                      >
                        {'\u{1F4C1}'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmarkFavorite(b);
                        }}
                        className={`text-lg leading-none transition-colors ${
                          b.favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        title={b.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {b.favorite ? '\u2605' : '\u2606'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingBookmark(b);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">Pin the verses that speak to you.</p>
          )}
        </Section>
      </div>

      {deletingHighlight && (
        <ConfirmDialog
          message={`Delete highlight "${deletingHighlight.selectedText}"?`}
          onConfirm={handleConfirmDeleteHighlight}
          onCancel={() => setDeletingHighlight(null)}
        />
      )}
      {deletingBookmark && (
        <ConfirmDialog
          message={`Delete bookmark "${deletingBookmark.title ?? 'Bookmark'}"?`}
          onConfirm={handleConfirmDeleteBookmark}
          onCancel={() => setDeletingBookmark(null)}
        />
      )}

      {addToCollectionTarget && (
        <AddToCollectionModal
          itemType={addToCollectionTarget.type}
          itemLabel={addToCollectionTarget.label}
          sourceReference={addToCollectionTarget.sourceReference}
          itemId={addToCollectionTarget.itemId}
          onClose={() => setAddToCollectionTarget(null)}
          onAdded={() => onNoteDeleted()}
        />
      )}
    </aside>
  ) : (
    <button
      type="button"
      onClick={() => setPanelOpen(true)}
      className="shrink-0 border-l border-theme bg-panel px-1 py-3 text-xs text-muted hover:text-text hover-bg transition-colors duration-150"
      title="Expand panel"
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
    >
      Panel
    </button>
  );
}

function Section({
  id,
  title,
  collapsed,
  onToggle,
  count,
  children,
}: {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`mb-3 overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-150 hover:shadow-lg ${
      collapsed ? 'border-theme' : 'border-[#B8962E]/60'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-60 transition-all duration-150 hover:opacity-100 hover:bg-black/5"
        aria-expanded={!collapsed}
        aria-controls={`section-${id}`}
      >
        <span className={`inline-block text-[10px] transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}>
          &#9654;
        </span>
        {title}
        {count > 0 && (
          <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-normal text-accent">
            {count}
          </span>
        )}
      </button>
      <div
        id={`section-${id}`}
        role="region"
        aria-hidden={collapsed}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-3 pb-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
