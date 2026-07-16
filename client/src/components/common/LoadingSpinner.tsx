import { cn } from '@/lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  /** Controls the diameter of the spinner. Defaults to 'md'. */
  size?: SpinnerSize;
  /** Additional Tailwind classes for color, margin, etc. */
  className?: string;
  /** Accessible label for screen readers. Defaults to 'Loading'. */
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
  xl: 'h-16 w-16 border-4',
};

/**
 * Accessible animated loading spinner.
 *
 * Used for:
 *   - Full-page loading states (size="lg" or "xl")
 *   - Button loading states (size="xs" or "sm")
 *   - Skeleton replacements during AI analysis (size="md")
 *
 * The border-t-transparent technique creates the spinning arc appearance
 * without requiring any SVG or image assets.
 */
export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  );
}

/**
 * Centered full-viewport loading overlay.
 * Used for initial page load and route transitions.
 */
export function FullScreenLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">{message ?? 'Loading…'}</p>
      </div>
    </div>
  );
}
