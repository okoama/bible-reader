export default function RightPanel() {
  return (
    <aside className="w-72 shrink-0 border-l p-4 overflow-y-auto">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Notes & Prayers
      </h2>

      <div className="rounded border p-4">
        <p className="font-medium">No passage selected</p>
        <p className="mt-2 text-sm opacity-80">
          Highlights, notes, bookmarks, and prayers will appear here.
        </p>
      </div>
    </aside>
  );
}