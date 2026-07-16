import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ArrowCounterClockwise, Warning } from '@phosphor-icons/react';

interface ErrorBoundaryProps {
  /** The component tree to guard. */
  children: ReactNode;
  /**
   * Custom fallback UI. If not provided, a default error card is rendered.
   * The fallback receives the error and a reset function.
   */
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches unhandled errors in the component tree.
 *
 * Must be a class component; React does not support hook-based error boundaries.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeFeatureComponent />
 *   </ErrorBoundary>
 *
 *   With custom fallback:
 *   <ErrorBoundary fallback={(error, reset) => <MyFallback onRetry={reset} />}>
 *     <AIResumeChecker />
 *   </ErrorBoundary>
 *
 * In Phase 12, Sentry.captureException will be added to componentDidCatch
 * for production error tracking.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO (Phase 19): Sentry.captureException(error, { extra: info });
    console.error('[ErrorBoundary] Caught error:', error.message, info.componentStack);
  }

  reset(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    // Custom fallback — caller has full control
    if (fallback) return fallback(error, this.reset);

    // Default error card
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-error/20 bg-error-subtle p-8 text-center"
      >
        <Warning size={32} weight="fill" className="text-error" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-error">Something went wrong</p>
          {error?.message && (
            <p className="text-xs text-muted-foreground max-w-sm">{error.message}</p>
          )}
        </div>
        <button
          onClick={this.reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-error/30 px-3 py-1.5 text-xs text-error transition-colors hover:bg-error/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          <ArrowCounterClockwise size={14} aria-hidden />
          Try again
        </button>
      </div>
    );
  }
}
