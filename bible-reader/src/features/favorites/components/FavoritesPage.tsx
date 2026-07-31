import { useState, useEffect } from 'react';
import type { Prayer, Note, Bookmark, VerseFavorite, CrossLinkType } from '../../../types';
import { TRADITIONAL_PRAYERS } from '../../../types';
import { usePrayers } from '../../../lib/hooks/usePrayers';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { BookmarkRepository } from '../../../lib/repositories/BookmarkRepository';
import { VerseFavoriteRepository } from '../../../lib/repositories/VerseFavoriteRepository';
import { formatDate } from '../../../lib/utils/date';
import PrayerViewer from '../../prayers/components/PrayerViewer';
import { stripHtml } from '../../../lib/utils/text';
import NoteViewer from '../../notes/components/NoteViewer';

const noteRepo = new NoteRepository();
const bookmarkRepo = new BookmarkRepository();
const verseFavRepo = new VerseFavoriteRepository();

type FavoritesPageProps = {
  refreshKey: number;
  onRefresh: () => void;
  onCrossLinkNavigate?: (type: CrossLinkType, id: string) => void;
  onNavigateToPassage?: (bookId: string, chapter: number, verse?: number) => void;
};

export default function FavoritesPage({ refreshKey, onRefresh, onCrossLinkNavigate, onNavigateToPassage }: FavoritesPageProps) {
  const userPrayers = usePrayers(refreshKey);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [verseFavorites, setVerseFavorites] = useState<VerseFavorite[]>([]);
  const [viewingPrayer, setViewingPrayer] = useState<Prayer | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      noteRepo.findFavorites(),
      bookmarkRepo.findFavorites(),
      verseFavRepo.findAll(),
    ]).then(([favNotes, favBms, favVerses]) => {
      if (active) { setNotes(favNotes); setBookmarks(favBms); setVerseFavorites(favVerses); }
    });
    return () => { active = false; };
  }, [refreshKey]);

  const tradFavorites = TRADITIONAL_PRAYERS.filter((p) => p.favorite);
  const userFavPrayers = userPrayers.filter((p) => p.favorite);
  const prayers = [...tradFavorites, ...userFavPrayers];

  const handleRemoveVerseFavorite = async (id: string) => {
    await verseFavRepo.delete(id);
    onRefresh();
  };

  const hasAny = prayers.length > 0 || notes.length > 0 || bookmarks.length > 0 || verseFavorites.length > 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Favorites</h2>
      <p className="mt-1 text-sm opacity-50">All your starred items in one place.</p>

      {!hasAny && (
        <p className="mt-12 text-center text-sm opacity-50 italic">
          Star items to add them to your favorites.
        </p>
      )}

      {verseFavorites.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">Verses</h3>
          <div className="mt-2 space-y-2">
            {verseFavorites.map((v) => (
              <div key={v.id} className="card-favorite flex items-start gap-3 rounded-lg border p-4">
                <button
                  type="button"
                    onClick={() => {
                    const match = v.sourceReference.match(/^([^:]+):(\d+):(\d+)/);
                    if (match && onNavigateToPassage) {
                      onNavigateToPassage(match[1], Number(match[2]), Number(match[3]));
                    }
                  }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="font-semibold">{v.sourceReference}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-60 line-clamp-2">{v.selectedText}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveVerseFavorite(v.id)}
                  className="shrink-0 self-start text-yellow-500 hover:text-yellow-600 transition-colors"
                  title="Remove from favorites"
                >
                  {'\u2605'}
                </button>
              </div>
            ))}
          </div>
        </section>
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
                className="card-favorite rounded-lg border p-4 text-left transition-colors duration-150 hover-bg"
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
                className="card-favorite w-full rounded-lg border p-4 text-left transition-colors hover-bg"
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
              <div key={b.id} className="card-favorite rounded-lg border p-4">
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
