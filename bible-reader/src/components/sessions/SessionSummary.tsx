import type { StudySession } from '../../types';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function SessionSummary({ session, onClose }: { session: StudySession; onClose: () => void }) {
  const duration = session.duration ?? Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold">Session Complete</h2>
        <p className="mt-1 text-sm opacity-60">{session.title}</p>

        <div className="mt-4 space-y-2">
          <SummaryRow label="Duration" value={formatDuration(duration)} />
          <SummaryRow label="Notes Created" value={String(session.notesCreated.length)} />
          <SummaryRow label="Prayers Written" value={String(session.prayersWritten.length)} />
          <SummaryRow label="Bookmarks Added" value={String(session.bookmarksAdded.length)} />
          <SummaryRow label="Collections Updated" value={String(session.collectionEvents.length)} />
        </div>

        {session.worksVisited.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">Works Visited</h3>
            <ul className="mt-1 space-y-0.5">
              {Array.from(new Set(session.worksVisited.map((v) => v.label))).map((label) => (
                <li key={label} className="text-sm">{label}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
