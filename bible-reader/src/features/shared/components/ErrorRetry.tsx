type ErrorRetryProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
  retryLabel?: string;
};

export default function ErrorRetry({ message, onRetry, className = '', retryLabel = 'Try Again' }: ErrorRetryProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-4 py-16 text-center animate-fade-in ${className}`}
      role="alert"
    >
      <span className="text-2xl text-red-400" aria-hidden="true">✠</span>
      <p className="max-w-md text-sm opacity-80">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-stained rounded px-4 py-2 text-sm">
          ↻ {retryLabel}
        </button>
      )}
    </div>
  );
}
