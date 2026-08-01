import { useEffect, useRef } from 'react';

type ShortcutEntry = { keys: string; label: string };

const SHORTCUTS: ShortcutEntry[] = [
  { keys: 'Ctrl+K', label: 'Global search (notes)' },
  { keys: 'Ctrl+Shift+P', label: 'New prayer' },
  { keys: 'Ctrl+Shift+C', label: 'New collection' },
  { keys: 'Ctrl+Alt+N', label: 'New note' },
  { keys: 'Alt+\u2190', label: 'Go back' },
  { keys: 'Alt+\u2192', label: 'Go forward' },
  { keys: 'Escape', label: 'Close modals / Cancel forms' },
  { keys: 'Tab, \u2190 \u2192', label: 'Navigate tabs' },
  { keys: '?', label: 'Show this help' },
];

type Props = { onClose: () => void };

export default function KeyboardShortcutsHelp({ onClose }: Props) {
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    doneRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
        <div className="mt-4 space-y-2">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={keys} className="flex items-center justify-between text-sm">
              <span className="opacity-70">{label}</span>
              <kbd className="rounded border bg-gray-50 px-2 py-0.5 font-mono text-xs">{keys}</kbd>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button ref={doneRef} type="button" onClick={onClose} className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">Done</button>
        </div>
      </div>
    </div>
  );
}
