import type { Note, CrossLinkType } from '../../../types';
import { formatDate } from '../../../lib/utils/date';
import CrossLinkRenderer from './CrossLinkRenderer';

type NoteViewerProps = {
  note: Note;
  onClose: () => void;
  onCrossLinkNavigate?: (type: CrossLinkType, id: string) => void;
};

export default function NoteViewer({ note, onClose, onCrossLinkNavigate }: NoteViewerProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={note.title || 'Note'}
    >
      <div className="mx-4 flex w-full max-w-2xl max-h-[85vh] flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl animate-slide-up overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{note.title || 'Untitled'}</h2>
            <p className="mt-0.5 text-xs opacity-40">{note.sourceReference}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        <div className="rounded-md border bg-gray-50 p-4 text-sm leading-relaxed">
          {note.content ? (
            <CrossLinkRenderer html={note.content} onNavigate={(t, id) => onCrossLinkNavigate?.(t, id)} />
          ) : (
            <span className="italic opacity-50">No content</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs opacity-50">
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded bg-accent-lighter px-1.5 py-0.5 text-accent">{tag}</span>
              ))}
            </div>
          )}
          <span>Created {formatDate(note.createdAt)}</span>
          <span>Updated {formatDate(note.updatedAt)}</span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
