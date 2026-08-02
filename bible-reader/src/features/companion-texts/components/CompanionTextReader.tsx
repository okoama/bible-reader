import { useCallback, useEffect, useRef, useState } from 'react';
import ContentReader from '../../reader/components/ContentReader';
import LoadingIndicator from '../../shared/components/LoadingIndicator';
import ErrorRetry from '../../shared/components/ErrorRetry';
import { TextService } from '../services/TextService';
import { useTextSelection, COMPANION_TEXT_SELECTION_CONFIG } from '../../annotations/hooks/useTextSelection';
import type { SelectedVerse } from '../../annotations/hooks/useTextSelection';
import AnnotationToolbar from '../../annotations/components/AnnotationToolbar';
import NoteEditor from '../../notes/components/NoteEditor';
import { BookmarkEditor } from '../../bookmarks';
import { VerseFavoriteRepository } from '../../../lib/repositories/VerseFavoriteRepository';
import { HighlightRepository } from '../../../lib/repositories/HighlightRepository';
import { useHighlights } from '../../../lib/hooks/useHighlights';
import { useRefNotes } from '../../../lib/hooks/useRefNotes';
import { createId } from '../../../lib/utils/id';
import { useToast } from '../../../lib/contexts/ToastContext';
import type { TextWork, TextSection, Highlight, Note } from '../../../types';

const textService = new TextService();
const highlightRepository = new HighlightRepository();

type CompanionTextReaderProps = {
  workId: string;
  sectionId?: string | null;
  onSectionChange?: (sectionId: string) => void;
};

function getHighlightsForBlock(highlights: Highlight[], blockNumber: number): Highlight[] {
  return highlights.filter((h) => {
    const match = h.sourceReference.match(/^[^:]+:[^:]+:(\d+)(?:-(\d+))?$/);
    if (!match) return false;
    const start = Number.parseInt(match[1], 10);
    const end = match[2] ? Number.parseInt(match[2], 10) : start;
    return blockNumber >= start && blockNumber <= end;
  });
}

function renderBlockText(text: string, blockHighlights: Highlight[]): React.ReactNode {
  if (blockHighlights.length === 0) {
    return text;
  }

  const segments: React.ReactNode[] = [];
  let remaining = text;

  for (const h of blockHighlights) {
    const idx = remaining.indexOf(h.selectedText);
    if (idx === -1) continue;

    if (idx > 0) {
      segments.push(remaining.slice(0, idx));
    }

    segments.push(
      <mark key={h.id} style={{ backgroundColor: h.color }}>
        {remaining.slice(idx, idx + h.selectedText.length)}
      </mark>,
    );

    remaining = remaining.slice(idx + h.selectedText.length);
  }

  if (remaining) {
    segments.push(remaining);
  }

  return segments.length > 0 ? segments : text;
}

export default function CompanionTextReader({ workId, sectionId, onSectionChange }: CompanionTextReaderProps) {
  const [work, setWork] = useState<TextWork | null>(null);
  const selectedSection = sectionId ?? null;
  const [section, setSection] = useState<TextSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [workReloadKey, setWorkReloadKey] = useState(0);
  const [sectionReloadKey, setSectionReloadKey] = useState(0);
  const [annotationBusy, setAnnotationBusy] = useState(false);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalSourceRef, setModalSourceRef] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [bookmarkModalSourceRef, setBookmarkModalSourceRef] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const onSectionChangeRef = useRef(onSectionChange);
  useEffect(() => {
    onSectionChangeRef.current = onSectionChange;
  }, [onSectionChange]);

  const { selection, clearSelection } = useTextSelection(containerElement, COMPANION_TEXT_SELECTION_CONFIG);
  const { showToast } = useToast();
  const highlights = useHighlights(workId, selectedSection, refreshKey);
  const chapterNotes = useRefNotes(workId, selectedSection, refreshKey);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    setWork(null);
    setSection(null);

    textService.loadWork(workId).then((loaded) => {
      if (isActive) {
        setWork(loaded);
        setLoading(false);
        if (!sectionId && loaded.sections.length > 0) {
          onSectionChangeRef.current?.(loaded.sections[0].id);
        }
      }
    }).catch((err) => {
      if (isActive) {
        setError(`Failed to load "${workId}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    });

    return () => { isActive = false; };
  }, [workId, sectionId, workReloadKey]);

  useEffect(() => {
    if (!work || !selectedSection) {
      setSection(null);
      return;
    }

    let isActive = true;
    setSectionLoading(true);
    setSectionError(null);

    textService.loadSection(workId, selectedSection).then((loaded) => {
      if (isActive) {
        setSection(loaded ?? null);
        setSectionLoading(false);
      }
    }).catch((err) => {
      if (isActive) {
        setSectionError(`Failed to load section "${selectedSection}" in "${workId}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSectionLoading(false);
      }
    });

    return () => { isActive = false; };
  }, [workId, work, selectedSection, sectionReloadKey]);

  useEffect(() => {
    if (section && topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  const sections = work?.sections.map((s) => ({ id: s.id, label: s.label })) ?? [];

  const handleHighlight = async (text: string, selectedVerses: SelectedVerse[], color: string, projectId?: string) => {
    const first = selectedVerses[0];
    const last = selectedVerses[selectedVerses.length - 1];
    const sourceReference = `${first.bookId}:${selectedSection}:${first.verseNumber}-${last.verseNumber}`;

    setAnnotationBusy(true);
    try {
      await highlightRepository.create({
        id: createId('hl'),
        sourceReference,
        color,
        selectedText: text,
        projectId,
        createdAt: new Date().toISOString(),
      });
      showToast('Highlight added');
    } finally {
      setAnnotationBusy(false);
    }

    setRefreshKey((k) => k + 1);
    clearSelection();
  };

  const handleNote = (_text: string, verses: SelectedVerse[]) => {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${selectedSection}:${first.verseNumber}-${last.verseNumber}`;

    setEditingNote(null);
    setModalSourceRef(sourceReference);
    clearSelection();
  };

  const handleBookmark = (verses: SelectedVerse[]) => {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${selectedSection}:${first.verseNumber}-${last.verseNumber}`;

    setBookmarkModalSourceRef(sourceReference);
    clearSelection();
  };

  const handleNoteSave = () => {
    setEditingNote(null);
    setModalSourceRef(null);
    setRefreshKey((k) => k + 1);
  };

  const handleNoteCancel = () => {
    setEditingNote(null);
    setModalSourceRef(null);
  };

  const handleBookmarkSave = () => {
    setBookmarkModalSourceRef(null);
    setRefreshKey((k) => k + 1);
  };

  const handleBookmarkCancel = () => {
    setBookmarkModalSourceRef(null);
  };

  const verseFavRepo = new VerseFavoriteRepository();

  const handleAddFavorite = async (text: string, verses: SelectedVerse[]) => {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${selectedSection}:${first.verseNumber}-${last.verseNumber}`;

    setAnnotationBusy(true);
    try {
      const existing = await verseFavRepo.findBySourceReference(sourceReference);
      if (existing) {
        await verseFavRepo.delete(existing.id);
      } else {
        await verseFavRepo.create({
          id: createId(),
          sourceReference,
          selectedText: text.length > 120 ? text.slice(0, 120) + '...' : text,
          bookId: first.bookId,
          chapterNumber: first.chapterNumber,
          createdAt: new Date().toISOString(),
        });
      }
      showToast(existing ? 'Favorite removed' : 'Verse added to favorites');
    } finally {
      setAnnotationBusy(false);
    }
    setRefreshKey((k) => k + 1);
    clearSelection();
  };

  useEffect(() => {
    const isInputFocused = () => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        if (modalSourceRef) {
          handleNoteCancel();
        } else if (bookmarkModalSourceRef) {
          handleBookmarkCancel();
        } else if (selection) {
          clearSelection();
        }
        return;
      }

      if (ctrl && e.key === 'b') {
        e.preventDefault();
        if (selection) {
          handleBookmark(selection.verses);
        }
        return;
      }

      if (ctrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        if (selection) {
          handleNote(selection.text, selection.verses);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selection, modalSourceRef, bookmarkModalSourceRef, handleNote, handleNoteCancel, handleBookmarkCancel, clearSelection, handleBookmark]);

  const getBlockNotes = useCallback((blockNumber: number): Note[] => {
    return chapterNotes.filter((n) => {
      const match = n.sourceReference.match(/^[^:]+:[^:]+:(\d+)(?:-(\d+))?$/);
      if (!match) return false;
      const start = Number.parseInt(match[1], 10);
      const end = match[2] ? Number.parseInt(match[2], 10) : start;
      return blockNumber >= start && blockNumber <= end;
    });
  }, [chapterNotes]);

  function handleNoteIndicatorClick(note: Note) {
    setEditingNote(note);
    setModalSourceRef(note.sourceReference);
  }

  if (error) {
    return (
      <div className="mx-auto reading-width rounded-lg border p-6 animate-fade-in">
        <h2 className="text-2xl font-semibold">{workId}</h2>
        <ErrorRetry
          message={error}
          onRetry={() => setWorkReloadKey((k) => k + 1)}
          className="py-6"
        />
      </div>
    );
  }

  return (
    <ContentReader
      title={work?.name ?? workId}
      subtitle={work?.author}
      sections={sections}
      currentSectionId={selectedSection}
      onSelectSection={(id) => onSectionChange?.(id)}
      loading={loading}
      showSections={workId !== 'catechism' && workId !== 'confessions'}
      emptyMessage="Select a section to begin reading."
    >
      {sectionError ? (
        <ErrorRetry
          message={sectionError}
          onRetry={() => setSectionReloadKey((k) => k + 1)}
          className="py-12"
        />
      ) : sectionLoading ? (
        <LoadingIndicator message="Turning the pages…" className="py-12" />
      ) : section && section.content.length > 0 ? (
        <div ref={setContainerElement} className="space-y-4">
          <div ref={topRef} />
          {section.content.map((block) => {
            const blockHighlights = getHighlightsForBlock(highlights, block.number ?? 0);
            const blockNotes = getBlockNotes(block.number ?? 0);

            return (
              <div
                key={block.id}
                data-work={workId}
                data-section={selectedSection}
                data-block={block.number ?? block.id}
                className="text-sm leading-relaxed"
              >
                {(block.label || block.number != null) && (
                  <span className="mr-2 font-semibold text-xs small-caps tracking-wider opacity-50">
                    {block.label ?? block.number}
                  </span>
                )}
                {blockNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleNoteIndicatorClick(note)}
                    title={note.title}
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-super transition-transform duration-150 hover:scale-150"
                  />
                ))}
                <span>{renderBlockText(block.text, blockHighlights)}</span>
              </div>
            );
          })}
        </div>
      ) : (<p className="py-12 text-center opacity-60 text-sm italic">
      {selectedSection ? `Section "${selectedSection}" has no content.` : 'Select a section to begin reading.'}
      </p>)}

      {selection && (
        <AnnotationToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onNote={handleNote}
          onBookmark={handleBookmark}
          onAddFavorite={handleAddFavorite}
          busy={annotationBusy}
        />
      )}

      {modalSourceRef && (
        <NoteEditor
          key={editingNote?.id ?? 'new'}
          note={editingNote ?? undefined}
          sourceReference={modalSourceRef}
          onSave={handleNoteSave}
          onCancel={handleNoteCancel}
        />
      )}

      {bookmarkModalSourceRef && (
        <BookmarkEditor
          sourceReference={bookmarkModalSourceRef}
          onSave={handleBookmarkSave}
          onCancel={handleBookmarkCancel}
        />
      )}
    </ContentReader>
  );
}
