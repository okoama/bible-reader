import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Bookmark, Collection, Highlight, Note, Prayer, ResearchProject, ProjectStatus } from '../../../types';
import { ResearchProjectRepository } from '../../../lib/repositories/ResearchProjectRepository';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { BookmarkRepository } from '../../../lib/repositories/BookmarkRepository';
import { PrayerRepository } from '../../../lib/repositories/PrayerRepository';
import { CollectionRepository } from '../../../lib/repositories/CollectionRepository';
import { HighlightRepository } from '../../../lib/repositories/HighlightRepository';
import { PROJECT_STATUSES } from '../../../types';
import { createId } from '../../../lib/utils/id';
import { formatDate } from '../../../lib/utils/date';
import { useModalFocus } from '../../../lib/hooks/useModalFocus';
import LoadingIndicator from '../../shared/components/LoadingIndicator';
import ErrorRetry from '../../shared/components/ErrorRetry';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import { useToast } from '../../../lib/contexts/ToastContext';

const projectRepo = new ResearchProjectRepository();
const noteRepo = new NoteRepository();
const bookmarkRepo = new BookmarkRepository();
const prayerRepo = new PrayerRepository();
const collectionRepo = new CollectionRepository();
const highlightRepo = new HighlightRepository();

type ProjectViewerProps = {
  projectId: string;
  refreshKey: number;
  onBack: () => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void | Promise<void>;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  onNavigateToReference?: (sourceReference: string) => void;
  onSelectCollection: (collectionId: string) => void;
};

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ hint, action }: { hint: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="text-sm italic opacity-40">{hint}</p>
      {action}
    </div>
  );
}

function ItemList<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  if (items.length === 0) return null;
  return <ul className="space-y-1">{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul>;
}

export default function ProjectViewer({ projectId, refreshKey, onBack, onEdit, onDelete, onStatusChange, onNavigateToReference, onSelectCollection }: ProjectViewerProps) {
  const { showToast } = useToast();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projectNotes, setProjectNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showNewBookmark, setShowNewBookmark] = useState(false);
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLinkDelete, setConfirmingLinkDelete] = useState<{ type: string; itemId: string; label: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const p = await projectRepo.findById(projectId);
      if (p) {
        setProject(p);
        setProjectNotes(p.notes);
        setLoadError(false);
      } else {
        setLoadError(true);
        return;
      }
      const [ns, hls, bms, ps, cs] = await Promise.all([
        noteRepo.findByProjectId(projectId),
        highlightRepo.findByProjectId(projectId),
        bookmarkRepo.findByProjectId(projectId),
        prayerRepo.findByProjectId(projectId),
        collectionRepo.findByProjectId(projectId),
      ]);
      setNotes(ns);
      setHighlights(hls);
      setBookmarks(bms);
      setPrayers(ps);
      setCollections(cs);
    } catch {
      setLoadError(true);
    }
  }, [projectId]);

  useEffect(() => { void fetchData(); }, [fetchData, refreshKey]);

  const handleSaveNotes = useCallback(async () => {
    if (!project || projectNotes === project.notes) return;
    setSaving(true);
    try {
      const updated = { ...project, notes: projectNotes, updatedAt: new Date().toISOString() };
      await projectRepo.create(updated);
      setProject(updated);
      setNotesSaved(true);
      showToast('Project notes saved');
    } finally {
      setSaving(false);
    }
  }, [project, projectNotes, showToast]);

  const handleCreateNote = useCallback(async (title: string, content: string, sourceReference: string) => {
    const now = new Date().toISOString();
    const note: Note = { id: createId('note'), title, content, sourceReference, tags: [], favorite: false, projectId, createdAt: now, updatedAt: now };
    await noteRepo.create(note);
    showToast('Note saved');
    setNotes((prev) => [...prev, note]);
    setShowNewNote(false);
  }, [projectId, showToast]);

  const handleCreateBookmark = useCallback(async (sourceReference: string, title: string) => {
    const bm: Bookmark = { id: createId('bm'), sourceReference, title, favorite: false, projectId, createdAt: new Date().toISOString() };
    await bookmarkRepo.create(bm);
    showToast('Bookmark added');
    setBookmarks((prev) => [...prev, bm]);
    setShowNewBookmark(false);
  }, [projectId, showToast]);

  const handleCreatePrayer = useCallback(async (title: string, content: string) => {
    const now = new Date().toISOString();
    const prayer: Prayer = { id: createId('pr'), title, content, category: 'custom', favorite: false, answered: false, projectId, tags: [], createdAt: now, updatedAt: now, lastPrayed: null };
    await prayerRepo.create(prayer);
    showToast('Prayer saved');
    setPrayers((prev) => [...prev, prayer]);
    setShowNewPrayer(false);
  }, [projectId, showToast]);

  const handleDeleteLink = useCallback(async (type: string, itemId: string) => {
    if (type === 'note') { await noteRepo.delete(itemId); setNotes((prev) => prev.filter((n) => n.id !== itemId)); }
    if (type === 'bookmark') { await bookmarkRepo.delete(itemId); setBookmarks((prev) => prev.filter((b) => b.id !== itemId)); }
    if (type === 'prayer') { await prayerRepo.delete(itemId); setPrayers((prev) => prev.filter((p) => p.id !== itemId)); }
    showToast(type === 'note' ? 'Note deleted' : type === 'bookmark' ? 'Bookmark deleted' : 'Prayer deleted');
  }, [showToast]);

  const recentActivity = useMemo(() => {
    const all: { date: string; label: string; type: string }[] = [
      ...notes.map((n) => ({ date: n.createdAt, label: n.title, type: 'note' })),
      ...bookmarks.map((b) => ({ date: b.createdAt, label: b.title ?? b.sourceReference, type: 'bookmark' })),
      ...prayers.map((p) => ({ date: p.createdAt, label: p.title, type: 'prayer' })),
      ...collections.map((c) => ({ date: c.createdAt, label: c.name, type: 'collection' })),
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [notes, bookmarks, prayers, collections]);

  if (loadError) {
    return (
      <div className="mx-auto reading-width animate-fade-in">
        <button type="button" onClick={onBack} className="mb-3 text-sm text-accent hover:text-accent-hover">&larr; Projects</button>
        <ErrorRetry
          message="This project could not be found or loaded. It may have been deleted."
          onRetry={() => { setLoadError(false); void fetchData(); }}
        />
      </div>
    );
  }

  if (!project) {
    return <div className="mx-auto reading-width animate-fade-in"><LoadingIndicator message="Laying the foundation…" className="mt-12" /></div>;
  }

  const statusColors: Record<ProjectStatus, string> = {
    active: 'bg-accent text-white',
    draft: 'bg-gray-100 text-gray-600',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-gray-200 text-gray-500',
  };

  return (
    <div className="mx-auto reading-width animate-fade-in">
      <button type="button" onClick={onBack} className="mb-3 text-sm text-accent hover:text-accent-hover">&larr; Projects</button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl" style={{ color: project.color }}>{project.icon}</span>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{project.title}</h2>
              <span className={`rounded-full px-3 py-0.5 text-xs capitalize font-medium ${statusColors[project.status]}`}>{project.status}</span>
            </div>
            {project.description && <p className="mt-1 text-sm opacity-60">{project.description}</p>}
            <p className="mt-1 text-xs opacity-40">Created {formatDate(project.createdAt)} &middot; Updated {formatDate(project.updatedAt)}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={() => onEdit(project)} className="btn-stained-ghost rounded px-3 py-1 text-sm">Edit</button>
          <button type="button" onClick={() => setConfirmingDelete(true)} className="rounded border px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50">Delete</button>
        </div>
      </div>

      <div className="mb-8 flex gap-2">
        {PROJECT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(project.id, s)}
            className={`rounded-full px-4 py-1.5 text-xs capitalize transition-colors ${
              project.status === s ? 'bg-accent text-white' : 'border hover-bg'
            }`}
          >{s}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Project Notes">
          <textarea
            value={projectNotes}
            onChange={(e) => { setProjectNotes(e.target.value); setNotesSaved(false); }}
            className="min-h-[120px] w-full resize-y rounded border p-2 text-sm focus-accent"
            placeholder="Write notes, ideas, and findings..."
          />
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={handleSaveNotes} disabled={notesSaved || saving} aria-busy={saving} className="inline-flex items-center gap-1.5 rounded bg-accent px-3 py-1 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40">
              {saving ? (
                <>
                  <LoadingIndicator compact size="xs" />
                  <span>Saving…</span>
                </>
              ) : 'Save Notes'}
            </button>
            {notesSaved && <span className="text-xs text-green-600">Saved</span>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity">
          {recentActivity.length === 0 ? (
            <EmptyState hint="Activity appears here as you add items." />
          ) : (
            <ul className="space-y-1">
              {recentActivity.map((act, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${act.type === 'note' ? 'bg-blue-400' : act.type === 'prayer' ? 'bg-purple-400' : act.type === 'bookmark' ? 'bg-green-400' : 'bg-amber-400'}`} />
                  <span className="flex-1 truncate">{act.label}</span>
                  <span className="shrink-0 text-xs opacity-40">{formatDate(act.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Notes & Highlights">
          {notes.length === 0 && highlights.length === 0 ? (
            <EmptyState hint="No linked notes or highlights." action={<button type="button" onClick={() => setShowNewNote(true)} className="text-xs text-accent hover:underline">+ Add Note</button>} />
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => setViewingNote(n)} className="min-w-0 flex-1 text-left" title="View note">
                      <p className="text-sm font-medium">{n.title || 'Untitled note'}</p>
                      <p className="mt-1 text-sm leading-relaxed opacity-70 whitespace-pre-wrap">{n.content || 'No note text added.'}</p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => onNavigateToReference?.(n.sourceReference)} className="rounded px-2 py-1 text-xs text-accent hover:bg-accent/5" title={`Go to ${n.sourceReference}`}>Go to passage</button>
                      <button type="button" onClick={() => setConfirmingLinkDelete({ type: 'note', itemId: n.id, label: n.title || 'Untitled' })} className="text-xs text-red-400 hover:text-red-600" aria-label={`Remove note ${n.title || 'Untitled'}`}>&times;</button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs opacity-40">{n.sourceReference}</p>
                </div>
              ))}
              {highlights.map((h) => (
                <div key={h.id} className="rounded border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Highlight</p>
                      <p className="mt-1 text-sm leading-relaxed italic opacity-80">“{h.selectedText}”</p>
                    </div>
                    <button type="button" onClick={() => onNavigateToReference?.(h.sourceReference)} className="shrink-0 rounded px-2 py-1 text-xs text-amber-700 hover:bg-amber-100" title={`Go to ${h.sourceReference}`}>Go to passage</button>
                  </div>
                  <p className="mt-2 text-xs opacity-40">{h.sourceReference}</p>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setShowNewNote(true)} className="mt-3 text-xs text-accent hover:underline">+ Add Note</button>
        </SectionCard>

        <SectionCard title="Reading Progress">
          {showNewBookmark ? (
            <NewBookmarkForm onSubmit={handleCreateBookmark} onCancel={() => setShowNewBookmark(false)} />
          ) : (
            <>
              <ItemList items={bookmarks} render={(b) => (
                <div className="flex items-center gap-2 text-sm">
                  <button type="button" onClick={() => onNavigateToReference?.(b.sourceReference)} className="flex-1 truncate text-left hover:text-accent focus-visible:ring-2 focus-visible:ring-accent rounded" title={b.sourceReference}>{b.title ?? b.sourceReference}</button>
                  <span className="text-xs opacity-40">{b.sourceReference}</span>
                  <button type="button" onClick={() => setConfirmingLinkDelete({ type: 'bookmark', itemId: b.id, label: b.title ?? b.sourceReference })} className="text-xs text-red-400 hover:text-red-600" aria-label={`Remove bookmark ${b.title ?? b.sourceReference}`}>&times;</button>
                </div>
              )} />
              {bookmarks.length === 0 && <EmptyState hint="No linked passages." action={<button type="button" onClick={() => setShowNewBookmark(true)} className="text-xs text-accent hover:underline">+ Add Passage Reference</button>} />}
              {bookmarks.length > 0 && <button type="button" onClick={() => setShowNewBookmark(true)} className="mt-2 text-xs text-accent hover:underline">+ Add Passage Reference</button>}
            </>
          )}
        </SectionCard>

        <SectionCard title="Collections">
          {collections.length === 0 ? (
            <EmptyState hint="No linked collections." />
          ) : (
            <ul className="space-y-1">
              {collections.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => onSelectCollection(c.id)}
                    className="flex-1 truncate text-left text-accent hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent rounded"
                  >
                    {c.name}
                  </button>
                  <span className="text-xs opacity-40">{c.items.length} items</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="References">
          {bookmarks.length === 0 ? (
            <EmptyState hint="Bookmarked passages appear here." />
          ) : (
            <ul className="space-y-1">
              {bookmarks.map((b) => (
                <li key={b.id} className="flex items-center gap-2 text-sm">
                  <button type="button" onClick={() => onNavigateToReference?.(b.sourceReference)} className="flex-1 truncate text-left hover:text-accent focus-visible:ring-2 focus-visible:ring-accent rounded" title={b.sourceReference}>{b.sourceReference}</button>
                  {b.title && <span className="text-xs opacity-40">{b.title}</span>}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Prayer List">
          {showNewPrayer ? (
            <NewPrayerForm onSubmit={handleCreatePrayer} onCancel={() => setShowNewPrayer(false)} />
          ) : (
            <>
              <ItemList items={prayers} render={(p) => (
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-xs opacity-40">{p.category}</span>
                  <button type="button" onClick={() => setConfirmingLinkDelete({ type: 'prayer', itemId: p.id, label: p.title })} className="text-xs text-red-400 hover:text-red-600" aria-label={`Remove prayer ${p.title}`}>&times;</button>
                </div>
              )} />
              {prayers.length === 0 && <EmptyState hint="No linked prayers." action={<button type="button" onClick={() => setShowNewPrayer(true)} className="text-xs text-accent hover:underline">+ Add Prayer</button>} />}
              {prayers.length > 0 && <button type="button" onClick={() => setShowNewPrayer(true)} className="mt-2 text-xs text-accent hover:underline">+ Add Prayer</button>}
            </>
          )}
        </SectionCard>

        <SectionCard title="Timeline">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span><strong>Created</strong> &mdash; {formatDate(project.createdAt)}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              <span><strong>Last updated</strong> &mdash; {formatDate(project.updatedAt)}</span>
            </li>
            {notes.map((n) => (
              <li key={n.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                <span><strong>Note</strong> &mdash; {n.title || 'Untitled'}</span>
              </li>
            ))}
            {bookmarks.map((b) => (
              <li key={b.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                <span><strong>Reference</strong> &mdash; {b.sourceReference}</span>
              </li>
            ))}
            {prayers.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-300" />
                <span><strong>Prayer</strong> &mdash; {p.title}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          message={`Delete project "${project.title}"? Its linked notes, prayers, and bookmarks will also be removed. This cannot be undone.`}
          onConfirm={() => onDelete(project.id)}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {confirmingLinkDelete && (
        <ConfirmDialog
          message={`Delete ${confirmingLinkDelete.type === 'note' ? 'note' : confirmingLinkDelete.type === 'bookmark' ? 'bookmark' : 'prayer'} "${confirmingLinkDelete.label}"? This cannot be undone.`}
          onConfirm={() => handleDeleteLink(confirmingLinkDelete.type, confirmingLinkDelete.itemId)}
          onCancel={() => setConfirmingLinkDelete(null)}
        />
      )}

      {showNewNote && (
        <NewNoteModal
          onSubmit={handleCreateNote}
          onCancel={() => setShowNewNote(false)}
        />
      )}

      {viewingNote && (
        <NoteViewModal note={viewingNote} onClose={() => setViewingNote(null)} />
      )}
    </div>
  );
}

function NewNoteModal({ onSubmit, onCancel }: { onSubmit: (title: string, content: string, sourceReference: string) => void | Promise<void>; onCancel: () => void }) {
  const panelRef = useModalFocus<HTMLDivElement>();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label="New note"
    >
      <div ref={panelRef} className="mx-4 w-full max-w-md rounded-lg border border-theme bg-card p-6 shadow-xl animate-slide-up">
        <h2 className="mb-3 text-lg font-semibold">New Note</h2>
        <NewNoteForm onSubmit={onSubmit} onCancel={onCancel} />
      </div>
    </div>
  );
}

function NoteViewModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const panelRef = useModalFocus<HTMLDivElement>();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Note: ${note.title || 'Untitled'}`}
    >
      <div ref={panelRef} className="mx-4 w-full max-w-lg rounded-lg border border-theme bg-card p-6 shadow-xl animate-slide-up">
        <FormKeyHandler onCancel={onClose} />
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{note.title || 'Untitled note'}</h2>
          <button type="button" onClick={onClose} aria-label="Close note" className="text-sm opacity-40 hover:opacity-80">&times;</button>
        </div>
        {note.sourceReference && <p className="mb-3 text-xs opacity-50">{note.sourceReference}</p>}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content || 'No note text added.'}</p>
        <p className="mt-4 text-xs opacity-40">Created {formatDate(note.createdAt)}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-1 text-xs">Close</button>
        </div>
      </div>
    </div>
  );
}

function FormKeyHandler({ onCancel }: { onCancel: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);
  return null;
}

function NewNoteForm({ onSubmit, onCancel }: { onSubmit: (title: string, content: string, sourceReference: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="flex flex-col gap-2">
      <FormKeyHandler onCancel={onCancel} />
      <input ref={inputRef} type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-2 py-1 text-sm focus-accent" aria-label="Note title" />
      <input type="text" placeholder="Source (e.g. GEN:1)" value={sourceReference} onChange={(e) => setSourceReference(e.target.value)} className="rounded border px-2 py-1 text-sm focus-accent" aria-label="Source reference" />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="rounded border px-2 py-1 text-sm focus-accent resize-none" aria-label="Note content" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSubmit(title, content, sourceReference)} disabled={!title.trim()} className="rounded bg-accent px-3 py-1 text-xs text-white disabled:opacity-40">Create</button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-1 text-xs">Cancel</button>
      </div>
    </div>
  );
}

function NewBookmarkForm({ onSubmit, onCancel }: { onSubmit: (sourceReference: string, title: string) => void; onCancel: () => void }) {
  const [sourceReference, setSourceReference] = useState('');
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="flex flex-col gap-2">
      <FormKeyHandler onCancel={onCancel} />
      <input ref={inputRef} type="text" placeholder="Reference (e.g. GEN:1-5)" value={sourceReference} onChange={(e) => setSourceReference(e.target.value)} className="rounded border px-2 py-1 text-sm focus-accent" aria-label="Reference" />
      <input type="text" placeholder="Label (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-2 py-1 text-sm focus-accent" aria-label="Label" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSubmit(sourceReference, title)} disabled={!sourceReference.trim()} className="rounded bg-accent px-3 py-1 text-xs text-white disabled:opacity-40">Create</button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-1 text-xs">Cancel</button>
      </div>
    </div>
  );
}

function NewPrayerForm({ onSubmit, onCancel }: { onSubmit: (title: string, content: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="flex flex-col gap-2">
      <FormKeyHandler onCancel={onCancel} />
      <input ref={inputRef} type="text" placeholder="Prayer title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-2 py-1 text-sm focus-accent" aria-label="Prayer title" />
      <textarea placeholder="Prayer text" value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="rounded border px-2 py-1 text-sm focus-accent resize-none" aria-label="Prayer text" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSubmit(title, content)} disabled={!title.trim() || !content.trim()} className="rounded bg-accent px-3 py-1 text-xs text-white disabled:opacity-40">Create</button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-1 text-xs">Cancel</button>
      </div>
    </div>
  );
}
