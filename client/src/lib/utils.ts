import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 *
 * clsx handles conditional classes and array/object notation.
 * tailwind-merge resolves Tailwind conflicts (e.g. "p-4 p-2" → "p-2").
 *
 * This is the standard utility used by all shadcn/ui components.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary', className)
 *   cn({ 'opacity-50': disabled }, 'text-sm')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a human-readable relative time.
 * E.g. "2 days ago", "just now", "3 months ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return d.toLocaleDateString();
}

/**
 * Truncates a string to a maximum length, appending an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
