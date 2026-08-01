import { useState } from 'react';
import { useStudySession } from '../../lib/contexts/StudySessionContext';
import SessionSummary from '../sessions/SessionSummary';

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StatusBar() {
  const { session, elapsed, startSession, endSession } = useStudySession();
  const [showSummary, setShowSummary] = useState(false);

  const handleEnd = () => {
    endSession();
    setShowSummary(true);
  };

  return (
    <footer className="flex items-center justify-between border-t px-4 py-2 text-sm">
      <span className="opacity-60">Ready • Offline • Version 0.1.0</span>
      <div className="flex items-center gap-3">
        {session && !session.endTime && (
          <>
            <span className="font-mono text-xs tabular-nums">{formatElapsed(elapsed)}</span>
            <button
              type="button"
              onClick={handleEnd}
              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
            >
              End Session
            </button>
          </>
        )}
        {(!session || session.endTime) && (
          <button
            type="button"
            onClick={() => startSession()}
            className="rounded bg-accent px-3 py-1 text-xs text-white hover:bg-accent-hover"
          >
            Start Session
          </button>
        )}
      </div>
      {showSummary && session && (
        <SessionSummary session={session} onClose={() => setShowSummary(false)} />
      )}
    </footer>
  );
}