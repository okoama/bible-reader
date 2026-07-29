import { useEffect, useMemo, useState } from 'react';
import type { CrossLinkType, Note, Prayer, Collection } from '../../types';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { PrayerRepository } from '../../lib/repositories/PrayerRepository';
import { CollectionRepository } from '../../lib/repositories/CollectionRepository';
import { formatCrossLink } from '../../lib/utils/crossLinkParser';

const noteRepo = new NoteRepository();
const prayerRepo = new PrayerRepository();
const collectionRepo = new CollectionRepository();

const LINK_TYPES: { value: CrossLinkType; label: string }[] = [
  { value: 'note', label: 'Note' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'collection', label: 'Collection' },
  { value: 'passage', label: 'Passage' },
  { value: 'article', label: 'Article' },
];

type InsertLinkModalProps = {
  onInsert: (syntax: string) => void;
  onClose: () => void;
};

export default function InsertLinkModal({ onInsert, onClose }: InsertLinkModalProps) {
  const [linkType, setLinkType] = useState<CrossLinkType>('note');
  const [notes, setNotes] = useState<Note[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [manualId, setManualId] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.all([
      noteRepo.findAll(),
      prayerRepo.findAll(),
      collectionRepo.findAll(),
    ]).then(([n, p, c]) => {
      if (active) { setNotes(n); setPrayers(p); setCollections(c); }
    });
    return () => { active = false; };
  }, []);

  const filteredNotes = useMemo(
    () => notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase())),
    [notes, query],
  );
  const filteredPrayers = useMemo(
    () => prayers.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [prayers, query],
  );
  const filteredCollections = useMemo(
    () => collections.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [collections, query],
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleInsert = (id: string, label?: string) => {
    onInsert(formatCrossLink(linkType, id, label));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Insert link"
    >
      <div className="mx-4 flex w-full max-w-md flex-col gap-3 rounded-lg border bg-white p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">Insert Link</h2>

        <select
          value={linkType}
          onChange={(e) => setLinkType(e.target.value as CrossLinkType)}
          className="rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          {LINK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {(linkType === 'passage' || linkType === 'article') ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder={linkType === 'passage' ? 'e.g. gen:1:1' : 'e.g. catechism:part-1'}
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <p className="text-xs opacity-50">
              {linkType === 'passage'
                ? 'Format: bookId:chapter:verse  (e.g. gen:1:1)'
                : 'Format: workId:sectionId  (e.g. catechism:part-1)'}
            </p>
            <button
              type="button"
              disabled={!manualId.trim()}
              onClick={() => handleInsert(manualId.trim(), manualId.trim())}
              className="self-end rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {linkType === 'note' && filteredNotes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleInsert(n.id, n.title)}
                  className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                >
                  <p className="font-medium truncate">{n.title || 'Untitled'}</p>
                  <p className="text-xs opacity-40 truncate">{n.sourceReference}</p>
                </button>
              ))}
              {linkType === 'prayer' && filteredPrayers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleInsert(p.id, p.title)}
                  className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                >
                  <p className="font-medium truncate">{p.title}</p>
                </button>
              ))}
              {linkType === 'collection' && filteredCollections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleInsert(c.id, c.name)}
                  className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                >
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs opacity-40">{c.items.length} items</p>
                </button>
              ))}
              {linkType === 'note' && filteredNotes.length === 0 && (
                <p className="text-sm italic opacity-50 py-2 text-center">No matching notes</p>
              )}
              {linkType === 'prayer' && filteredPrayers.length === 0 && (
                <p className="text-sm italic opacity-50 py-2 text-center">No matching prayers</p>
              )}
              {linkType === 'collection' && filteredCollections.length === 0 && (
                <p className="text-sm italic opacity-50 py-2 text-center">No matching collections</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="self-end rounded-md border px-4 py-1.5 text-sm transition-colors hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
