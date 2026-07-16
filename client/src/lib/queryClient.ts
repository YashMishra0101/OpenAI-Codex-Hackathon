import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query v5 client with production-tuned defaults.
 *
 * staleTime: 5min  — data is considered fresh for 5 minutes; no background
 *                     refetch within that window even if the window regains focus.
 *                     Reduces unnecessary API calls for relatively stable data.
 *
 * gcTime: 10min    — (formerly cacheTime) inactive query data stays in memory
 *                     for 10 minutes before garbage collection. Allows fast
 *                     re-renders when navigating back to a cached query.
 *
 * retry: 1         — retry failed requests once before surfacing the error.
 *                     AI analysis routes may have transient failures; one retry
 *                     covers most cases without excessive delay.
 *
 * refetchOnWindowFocus: false — prevents refetch storms when the user
 *                               alt-tabs back to the browser tab.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations should not retry automatically — state side effects are not idempotent
      retry: 0,
    },
  },
});
