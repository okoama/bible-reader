import { useState, useEffect } from 'react';
import type { Prayer, Note, Bookmark } from '../../../types';
import { TRADITIONAL_PRAYERS } from '../../../types';
import { usePrayers } from '../../../lib/hooks/usePrayers';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { BookmarkRepository } from '../../../lib/repositories/BookmarkRepository';
import { formatDate } from '../../../lib/utils/date';
import PrayerViewer from '../../prayers/components/PrayerViewer';
import { stripHtml } from '../../../lib/utils/text';
import NoteViewer from '../../notes/components/NoteViewer';

const noteRepo = new NoteRepository();
const bookmarkRepo = new BookmarkRepository();

import type { CrossLinkType } from '../../../types';

type FavoritesPageProps = {
  refreshKey: number;
  onRefresh: () => void;
  onCrossLinkNavigate?: (type: CrossLinkType, id: string) => void;
};

export default function FavoritesPage({ refreshKey, onRefresh, onCrossLinkNavigate }: FavoritesPageProps) {
  const userPrayers = usePrayers(refreshKey);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [viewingPrayer, setViewingPrayer] = useState<Prayer | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      noteRepo.findFavorites(),
      bookmarkRepo.findFavorites(),
    ]).then(([favNotes, favBms]) => {
      if (active) { setNotes(favNotes); setBookmarks(favBms); }
    });
    return () => { active = false; };
  }, [refreshKey]);

  const tradFavorites = TRADITIONAL_PRAYERS.filter((p) => p.favorite);
  const userFavPrayers = userPrayers.filter((p) => p.favorite);
  const prayers = [...tradFavorites, ...userFavPrayers];

  const hasAny = prayers.length > 0 || notes.length > 0 || bookmarks.length > 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Favorites</h2>
      <p className="mt-1 text-sm opacity-50">All your starred items in one place.</p>

      {!hasAny && (
        <p className="mt-12 text-center text-sm opacity-50 italic">
          Star items to add them to your favorites.
        </p>
      )}

      {prayers.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">Prayers</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {prayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setViewingPrayer(p)}
                className="rounded-lg border p-4 text-left transition-colors duration-150 hover:bg-gray-50"
              >
                <p className="font-semibold">{p.title}</p>
                {p.content && <p className="mt-1 text-sm leading-relaxed opacity-60 line-clamp-2">{stripHtml(p.content).slice(0, 100)}</p>}
              </button>
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">Notes</h3>
          <div className="mt-2 space-y-2">
            {notes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setViewingNote(n)}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
              >
                <p className="font-semibold">{n.title || 'Untitled'}</p>
                <p className="mt-0.5 text-xs opacity-40">{n.sourceReference}</p>
                {n.content && <p className="mt-1 text-sm opacity-60 line-clamp-2">{stripHtml(n.content).slice(0, 120)}</p>}
              </button>
            ))}
          </div>
        </section>
      )}

      {bookmarks.length > 0 && (
        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">Bookmarks</h3>
          <div className="mt-2 space-y-2">
            {bookmarks.map((b) => (
              <div key={b.id} className="rounded-lg border p-4">
                <p className="font-semibold">{b.title || 'Bookmark'}</p>
                <p className="mt-0.5 text-xs opacity-40">{b.sourceReference}</p>
                <p className="mt-1 text-xs opacity-40">{formatDate(b.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {viewingPrayer && (
        <PrayerViewer
          prayer={viewingPrayer}
          onClose={() => setViewingPrayer(null)}
          onEdit={() => {}}
          onRefresh={onRefresh}
        />
      )}

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onCrossLinkNavigate={onCrossLinkNavigate}
        />
      )}
    </div>
  );
}
