import { useCallback, useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

type AsyncButtonProps = {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  busyLabel?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  title?: string;
  ariaLabel?: string;
};

export default function AsyncButton({
  children,
  onClick,
  busyLabel = 'Sealing…',
  disabled = false,
  className = '',
  type = 'button',
  title,
  ariaLabel,
}: AsyncButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onClick();
    } finally {
      setBusy(false);
    }
  }, [busy, onClick]);

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || busy}
      title={title}
      aria-label={ariaLabel}
      aria-busy={busy}
      className={className}
    >
      {busy ? (
        <span className="inline-flex items-center gap-1.5">
          <LoadingIndicator compact size="xs" />
          <span>{busyLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
