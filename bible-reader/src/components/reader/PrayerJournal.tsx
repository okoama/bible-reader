import { useMemo, useState } from 'react';
import type { Prayer } from '../../types';
import { usePrayers } from '../../lib/hooks/usePrayers';
import { PrayerRepository } from '../../lib/repositories/PrayerRepository';
import { formatDate } from '../../lib/utils/date';
import { stripHtml } from '../../lib/utils/text';
import PrayerEditor from '../../features/prayers/components/PrayerEditor';
import ConfirmDialog from '../ConfirmDialog';

const prayerRepository = new PrayerRepository();

type PrayerJournalProps = {
  refreshKey: number;
  onRefresh: () => void;
};

export default function PrayerJournal({ refreshKey, onRefresh }: PrayerJournalProps) {
  const prayers = usePrayers(refreshKey);
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [deletingPrayer, setDeletingPrayer] = useState<Prayer | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return prayers;

    const lower = query.toLowerCase();
    return prayers.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        stripHtml(p.content).toLowerCase().includes(lower),
    );
  }, [prayers, query]);

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Prayer Journal</h2>
        <button
          type="button"
          onClick={handleNew}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          New Prayer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search prayers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-4 w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="mt-4 space-y-3">
        {filtered.map((prayer) => (
          <div key={prayer.id} className="rounded border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">{prayer.title}</p>
                <p className="mt-1 text-xs opacity-60">{formatDate(prayer.updatedAt)}</p>
                {prayer.content && (
                  <div
                    className="mt-2 text-sm leading-relaxed opacity-80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-70 [&_blockquote]:my-2 [&_.scripture-ref]:text-blue-600 [&_.scripture-ref]:italic"
                    dangerouslySetInnerHTML={{ __html: prayer.content }}
                  />
                )}
              </div>
              <div className="ml-3 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(prayer)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingPrayer(prayer)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {prayers.length === 0 && (
          <p className="mt-4 text-sm opacity-60">
            No prayers yet. Click "New Prayer" to begin.
          </p>
        )}

        {query.trim() && filtered.length === 0 && prayers.length > 0 && (
          <p className="mt-4 text-sm opacity-60">No matching prayers.</p>
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
