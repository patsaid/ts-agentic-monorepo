import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { userApi } from '../services/api';

// Mock the API
vi.mock('../services/api');

describe('Login Component', () => {
  const mockOnLogin = vi.fn();
  const mockUser = {
    _id: '12345',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByText('Agentic Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Welcome back to your AI assistant')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to signup form when clicking signup link', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);

    const signupLink = screen.getByText(/sign up/i);
    await user.click(signupLink);

    expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Form should not submit without required fields
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('submits login form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.login).mockResolvedValue(mockUser);

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(userApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('submits signup form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.create).mockResolvedValue(mockUser);

    render(<Login onLogin={mockOnLogin} />);

    // Switch to signup mode
    const signupLink = screen.getByText(/sign up/i);
    await user.click(signupLink);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(userApi.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    vi.mocked(userApi.login).mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup();
    // Make the API call hang to test loading state
    vi.mocked(userApi.login).mockImplementation(() => new Promise(() => {}));

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.login).mockRejectedValue(new Error('Network error'));

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });
});
