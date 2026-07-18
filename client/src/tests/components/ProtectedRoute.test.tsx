import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Mock the react-router-dom components
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate-mock">{to}</div>),
    Outlet: vi.fn(() => <div data-testid="outlet-mock" />),
  };
});

// Mock the AuthContext hook
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: false, isLoading: false })),
}));

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated (scaffold behavior)', () => {
    // Currently useIsAuthenticated is hardcoded to false
    render(
      <BrowserRouter>
        <ProtectedRoute />
      </BrowserRouter>
    );

    // It should render the Navigate component with to="/login"
    expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/login');
    expect(screen.queryByTestId('outlet-mock')).not.toBeInTheDocument();
  });
});
