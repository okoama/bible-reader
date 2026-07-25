export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r p-4 overflow-y-auto">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-2">
        <div className="rounded border px-3 py-2">Bible</div>
        <div className="rounded border px-3 py-2">Catechism</div>
        <div className="rounded border px-3 py-2">Summa Theologiae</div>
        <div className="rounded border px-3 py-2">Confessions</div>
        <div className="rounded border px-3 py-2">Imitation of Christ</div>
        <div className="rounded border px-3 py-2">Devout Life</div>
        <div className="rounded border px-3 py-2">Prayer Journal</div>
      </div>
    </aside>
  );
}