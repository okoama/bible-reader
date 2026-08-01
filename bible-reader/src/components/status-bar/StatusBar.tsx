import { useEffect, useState } from 'react';
import { useStudySession } from '../../lib/contexts/StudySessionContext';
import { useToast } from '../../lib/contexts/ToastContext';
import SessionSummary from '../../features/study-sessions/components/SessionSummary';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StatusBar() {
  const { session, sessionLoading, elapsed, startSession, endSession } = useStudySession();
  const { showToast } = useToast();
  const [showSummary, setShowSummary] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) {
      showToast('Installation is unavailable in this browser or app mode.');
      return;
    }

    installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      showToast('Install prompt accepted — you can now install the app.');
    } else {
      showToast('Install canceled.');
    }
    setInstallPromptEvent(null);
    setCanInstall(false);
  };

  const handleEnd = () => {
    endSession();
    showToast('Study session ended');
    setShowSummary(true);
  };

  return (
    <footer className="flex items-center justify-between border-t border-theme bg-panel px-4 py-2 text-sm">
      <span className="opacity-60">Ready • Offline • Version 0.1.0</span>
      <div className="flex items-center gap-3">
        {sessionLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs opacity-50" role="status">
            <span className="inline-block h-2 w-2 animate-spin rounded-full border border-[#B8962E] border-t-transparent" aria-hidden="true" />
            Resuming your study…</span>
        ) : (
          <>
            {session && !session.endTime && (
              <>
                <span className="font-mono text-xs tabular-nums" aria-label={`Session elapsed time ${formatElapsed(elapsed)}`}>{formatElapsed(elapsed)}</span>
                <button
                  type="button"
                  onClick={handleEnd}
                  className="btn-stained-danger rounded px-3 py-1 text-xs"
                >
                  End Session
                </button>
              </>
            )}
            {(!session || session.endTime) && (
                <button
                  type="button"
                  onClick={() => { startSession(); showToast('Study session started'); }}
                  className="btn-stained rounded px-3 py-1 text-xs"
                >
                  Start Session
                </button>
            )}
            {canInstall && (
              <button
                type="button"
                onClick={handleInstall}
                className="btn-stained rounded px-3 py-1 text-xs"
              >
                Install App
              </button>
            )}
          </>
        )}
      </div>
      {showSummary && session && (
        <SessionSummary session={session} onClose={() => setShowSummary(false)} />
      )}
    </footer>
  );
}