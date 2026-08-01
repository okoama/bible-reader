import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKey?: unknown;
  variant?: 'full' | 'card';
  title?: string;
  className?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          variant={this.props.variant ?? 'full'}
          title={this.props.title}
          className={this.props.className}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({
  error,
  variant,
  title,
  className = '',
  onReset,
}: {
  error: Error;
  variant: 'full' | 'card';
  title?: string;
  className?: string;
  onReset: () => void;
}) {
  const reload = () => window.location.reload();

  if (variant === 'card') {
    return (
      <div
        role="alert"
        className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
      >
        <span className="animate-flicker text-3xl" style={{ color: '#B8962E' }} aria-hidden="true">✠</span>
        <h2 className="text-sm font-semibold">{title ?? 'A page turned unexpectedly.'}</h2>
        <p className="max-w-sm text-xs opacity-60">
          This section hit an unexpected error. Your notes, prayers, and highlights remain safe on this device.
        </p>
        {error && (
          <p className="max-w-sm font-mono text-[10px] opacity-40" aria-live="polite">{error.message}</p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onReset} className="btn-stained rounded px-3 py-1.5 text-sm">
            Try Again
          </button>
          <button type="button" onClick={reload} className="btn-stained-ghost rounded px-3 py-1.5 text-sm">
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="alert" className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--bg)] animate-fade-in">
      <div className="flex max-w-md flex-col items-center gap-3 px-6 text-center">
        <span
          className="animate-flicker text-4xl"
          style={{ color: '#B8962E', textShadow: '0 0 16px rgba(185,150,46,0.6)' }}
          aria-hidden="true"
        >
          ✠
        </span>
        <h1 className="font-serif text-2xl font-semibold text-[#B8962E]">The scroll slipped from our hands.</h1>
        <p className="text-sm opacity-70">
          Catholic Study Desk hit an unexpected error. Your local notes, prayers, and highlights are still safe.
        </p>
        {title && <p className="text-xs opacity-50">{title}</p>}
        {error && (
          <p className="max-w-md font-mono text-xs opacity-50" aria-live="polite">{error.message}</p>
        )}
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={onReset} className="btn-stained rounded px-5 py-2 text-sm">
            Try Again
          </button>
          <button type="button" onClick={reload} className="btn-stained-ghost rounded px-5 py-2 text-sm">
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
