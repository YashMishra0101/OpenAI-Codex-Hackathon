import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';

// Helper to wrap components that need router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    renderWithRouter(<LoginForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderWithRouter(<LoginForm onSubmit={handleSubmit} />);
    
    // Submit without filling fields
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/Please provide a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderWithRouter(<LoginForm onSubmit={handleSubmit} />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'not-an-email');
    
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Please provide a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderWithRouter(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'ValidPassword123!');
    
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'ValidPassword123!' },
        expect.anything()
      );
    });
  });

  it('shows loading state when isLoading is true', () => {
    renderWithRouter(<LoginForm onSubmit={vi.fn()} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Password$/i)).toBeDisabled();
  });
});
