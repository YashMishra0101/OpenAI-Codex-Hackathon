import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Vitest global test setup.
 *
 * Runs before every test file in the client workspace.
 *
 * cleanup() — unmounts React trees rendered with `render()` after each test,
 *             preventing state and DOM leaks between tests.
 *             Equivalent to calling `unmount()` manually on every rendered component.
 *
 * @testing-library/jest-dom — extends Vitest's expect() with DOM-specific matchers:
 *   toBeInTheDocument(), toBeVisible(), toHaveTextContent(), toHaveAttribute(), etc.
 */
afterEach(() => {
  cleanup();
});
