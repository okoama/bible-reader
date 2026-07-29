import { useMemo, useState } from 'react';
import type { Prayer, PrayerFilter } from '../../types';
import { PRAYER_CATEGORIES, TRADITIONAL_PRAYERS, isTraditionalPrayer } from '../../types';
import { usePrayers } from '../../lib/hooks/usePrayers';
import { PrayerRepository } from '../../lib/repositories/PrayerRepository';
import { stripHtml } from '../../lib/utils/text';
import { formatDate } from '../../lib/utils/date';
import PrayerEditor from '../../features/prayers/components/PrayerEditor';
import PrayerViewer from '../PrayerViewer';
import ConfirmDialog from '../ConfirmDialog';

const prayerRepository = new PrayerRepository();

const CATEGORY_COLORS: Record<string, string> = {
  thanksgiving: 'bg-green-100 text-green-800',
  petitions: 'bg-blue-100 text-blue-800',
  intercession: 'bg-purple-100 text-purple-800',
  rosary: 'bg-indigo-100 text-indigo-800',
  novena: 'bg-pink-100 text-pink-800',
  family: 'bg-amber-100 text-amber-800',
  work: 'bg-orange-100 text-orange-800',
  study: 'bg-cyan-100 text-cyan-800',
  custom: 'bg-gray-100 text-gray-800',
};

type PrayerLibraryProps = {
  filter: PrayerFilter;
  refreshKey: number;
  onRefresh: () => void;
};

export default function PrayerLibrary({ filter, refreshKey, onRefresh }: PrayerLibraryProps) {
  const userPrayers = usePrayers(refreshKey);
  const [query, setQuery] = useState('');
  const [viewingPrayer, setViewingPrayer] = useState<Prayer | null>(null);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingPrayer, setDeletingPrayer] = useState<Prayer | null>(null);

  const isTraditional = filter.type === 'traditional';

  const allPrayers = useMemo(() => [...TRADITIONAL_PRAYERS, ...userPrayers], [userPrayers]);

  const filtered = useMemo(() => {
    if (isTraditional) {
      let result = [...TRADITIONAL_PRAYERS];
      if (query.trim()) {
        const lower = query.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            stripHtml(p.content).toLowerCase().includes(lower) ||
            p.tags.some((t) => t.toLowerCase().includes(lower)),
        );
      }
      return result;
    }

    let result = filter.type === 'all' ? allPrayers : userPrayers;

    if (filter.type === 'favorites') {
      result = result.filter((p) => p.favorite);
    } else if (filter.type === 'answered') {
      result = result.filter((p) => p.answered);
    } else if (filter.type === 'recent') {
      result = [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (filter.type === 'category') {
      result = result.filter((p) => p.category === filter.category);
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
  }, [userPrayers, filter, query, isTraditional]);

  function handleNew() {
    setEditingPrayer(null);
    setEditorOpen(true);
  }

  function handleEdit(prayer: Prayer) {
    setViewingPrayer(null);
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

  const filterLabel = isTraditional
    ? 'Traditional Prayers'
    : filter.type === 'category'
      ? PRAYER_CATEGORIES.find((c) => c.value === filter.category)?.label ?? 'Prayers'
      : filter.type === 'all'
        ? 'All Prayers'
        : filter.type === 'favorites'
          ? 'Favorites'
          : filter.type === 'answered'
            ? 'Answered'
            : 'Recent';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{filterLabel}</h2>
        {!isTraditional && (
          <button
            type="button"
            onClick={handleNew}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-blue-700"
          >
            New Prayer
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search prayers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-4 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {filtered.map((prayer) => {
          const trad = isTraditionalPrayer(prayer.id);
          const catLabel = PRAYER_CATEGORIES.find((c) => c.value === prayer.category)?.label ?? prayer.category;
          const catColor = CATEGORY_COLORS[prayer.category] ?? 'bg-gray-100 text-gray-800';
          const preview = stripHtml(prayer.content).slice(0, 120);

          return (
            <button
              key={prayer.id}
              type="button"
              onClick={() => setViewingPrayer(prayer)}
              className={`rounded-lg border p-4 text-left transition-colors duration-150 hover:bg-gray-50 hover:shadow-sm ${trad ? 'border-l-4 border-l-blue-400' : ''}`}
            >
              <div className="flex items-center gap-2">
                {prayer.favorite && <span className="text-yellow-500 text-sm shrink-0">★</span>}
                <p className="font-semibold truncate">{prayer.title}</p>
                {prayer.answered && <span className="shrink-0 text-xs text-green-600">✓</span>}
              </div>
              {preview && (
                <p className="mt-1 text-sm leading-relaxed opacity-60 line-clamp-2">{preview}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}>
                  {catLabel}
                </span>
                {trad && (
                  <span className="text-[10px] text-blue-500 font-medium">Traditional</span>
                )}
                {!trad && prayer.lastPrayed && (
                  <span className="text-[10px] opacity-40">Prayed {formatDate(prayer.lastPrayed)}</span>
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="sm:col-span-2">
            <p className="mt-8 text-center text-sm opacity-50 italic">
              {isTraditional
                ? 'No traditional prayers found.'
                : userPrayers.length === 0
                  ? 'No prayers yet. Click "New Prayer" to begin.'
                  : 'No matching prayers.'}
            </p>
          </div>
        )}
      </div>

      {viewingPrayer && (
        <PrayerViewer
          prayer={viewingPrayer}
          readOnly={isTraditionalPrayer(viewingPrayer.id)}
          onClose={() => setViewingPrayer(null)}
          onEdit={handleEdit}
          onRefresh={onRefresh}
        />
      )}

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
