import type { Note } from '../../types';

type RightPanelProps = {
  notes: Note[];
};

export default function RightPanel({ notes }: RightPanelProps) {
  return (
    <aside className="w-72 shrink-0 border-l p-4 overflow-y-auto">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Notes & Prayers
      </h2>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded border p-3">
              <p className="font-medium">{note.title}</p>
              <p className="mt-1 text-xs opacity-60">{note.sourceReference}</p>
              {note.content && (
                <p className="mt-2 text-sm opacity-80">{note.content}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded border p-4">
          <p className="font-medium">No notes yet</p>
          <p className="mt-2 text-sm opacity-80">
            Select text in the reader and click Note to create one.
          </p>
        </div>
      )}
    </aside>
  );
}