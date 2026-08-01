import { useMemo, useState } from 'react';
import type { Prayer, PrayerCategory } from '../../types';
import { PRAYER_CATEGORIES } from '../../types';
import { usePrayers } from '../../lib/hooks/usePrayers';
import { PrayerRepository } from '../../lib/repositories/PrayerRepository';
import { formatDate } from '../../lib/utils/date';
import { stripHtml } from '../../lib/utils/text';
import PrayerEditor from '../../features/prayers/components/PrayerEditor';
import ConfirmDialog from '../ConfirmDialog';

const prayerRepository = new PrayerRepository();

const CATEGORY_COLORS: Record<PrayerCategory, string> = {
  thanksgiving: 'bg-green-100 text-green-800',
  petitions: 'bg-accent-light text-accent',
  intercession: 'bg-purple-100 text-purple-800',
  rosary: 'bg-indigo-100 text-indigo-800',
  novena: 'bg-pink-100 text-pink-800',
  family: 'bg-amber-100 text-amber-800',
  work: 'bg-orange-100 text-orange-800',
  study: 'bg-cyan-100 text-cyan-800',
  custom: 'bg-gray-100 text-gray-800',
  prayers: 'bg-accent-light text-accent',
};

type PrayerJournalProps = {
  refreshKey: number;
  onRefresh: () => void;
};

export default function PrayerJournal({ refreshKey, onRefresh }: PrayerJournalProps) {
  const prayers = usePrayers(refreshKey);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PrayerCategory | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [deletingPrayer, setDeletingPrayer] = useState<Prayer | null>(null);

  const filtered = useMemo(() => {
    let result = prayers;

    if (favoritesOnly) {
      result = result.filter((p) => p.favorite);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          stripHtml(p.content).toLowerCase().includes(lower) ||
          p.tags.some((t) => t.toLowerCase().includes(lower)),
      );
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [prayers, query, categoryFilter, favoritesOnly]);

  function handleNew() {
    setEditingPrayer(null);
    setEditorOpen(true);
  }

  function handleEdit(prayer: Prayer) {
    setEditingPrayer(prayer);
    setEditorOpen(true);
  }

  function handleSave() {
    setEditorOpen(false);
    setEditingPrayer(null);
    onRefresh();
  }

  function handleCancel() {
    setEditorOpen(false);
    setEditingPrayer(null);
  }

  async function handleConfirmDelete() {
    if (!deletingPrayer) return;
    await prayerRepository.delete(deletingPrayer.id);
    setDeletingPrayer(null);
    onRefresh();
  }

  async function handleMarkPrayed(prayer: Prayer) {
    await prayerRepository.markPrayed(prayer.id);
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Prayer Journal</h2>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-accent-hover"
        >
          New Prayer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search prayers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-4 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus-accent"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
            categoryFilter === 'all' ? 'bg-accent text-white' : 'border hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {PRAYER_CATEGORIES.filter((c) => c.value !== 'custom').map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategoryFilter(c.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              categoryFilter === c.value
                ? 'bg-accent text-white'
                : `${CATEGORY_COLORS[c.value]} border border-transparent hover:opacity-80`
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFavoritesOnly((f) => !f)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
            favoritesOnly ? 'bg-yellow-500 text-white' : 'border hover:bg-gray-100'
          }`}
        >
          {favoritesOnly ? '★ Favorites' : '☆ Favorites'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((prayer) => {
          const catLabel = PRAYER_CATEGORIES.find((c) => c.value === prayer.category)?.label ?? prayer.category;
          return (
            <div key={prayer.id} className="rounded-md border p-4 transition-colors duration-150 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {prayer.favorite && <span className="text-yellow-500 text-sm" title="Favorite">★</span>}
                    <p className="font-semibold">{prayer.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[prayer.category]}`}>
                      {catLabel}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs opacity-50">
                    <span>{formatDate(prayer.updatedAt)}</span>
                    {prayer.lastPrayed && (
                      <span>Last prayed: {formatDate(prayer.lastPrayed)}</span>
                    )}
                  </div>
                  {prayer.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prayer.tags.map((tag) => (
                        <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {prayer.content && (
                    <div
                      className="mt-2 text-sm leading-relaxed opacity-80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-70 [&_blockquote]:my-2 [&_.scripture-ref]:text-accent [&_.scripture-ref]:italic"
                      dangerouslySetInnerHTML={{ __html: prayer.content }}
                    />
                  )}
                </div>
                <div className="ml-3 flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(prayer)}
                    className="text-xs text-accent transition-colors duration-150 hover:text-accent-hover"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkPrayed(prayer)}
                    className="text-xs text-green-600 transition-colors duration-150 hover:text-green-800"
                  >
                    Prayed
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingPrayer(prayer)}
                    className="text-xs text-red-500 transition-colors duration-150 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {prayers.length === 0 && (
          <p className="mt-8 text-center text-sm opacity-50 italic">
            No prayers yet. Click "New Prayer" to begin.
          </p>
        )}

        {query.trim() && filtered.length === 0 && prayers.length > 0 && (
          <p className="mt-8 text-center text-sm opacity-50 italic">No matching prayers.</p>
        )}
      </div>

      {editorOpen && (
        <PrayerEditor
          prayer={editingPrayer ?? undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {deletingPrayer && (
        <ConfirmDialog
          message={`Delete prayer "${deletingPrayer.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPrayer(null)}
        />
      )}
    </div>
  );
}
