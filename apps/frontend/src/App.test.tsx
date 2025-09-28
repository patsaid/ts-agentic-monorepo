import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { userApi, agentApi } from './services/api';

// Mock the API
vi.mock('./services/api');

const mockUser = {
  _id: '12345',
  email: 'test@example.com',
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userApi.login).mockResolvedValue(mockUser);
    vi.mocked(agentApi.getConversations).mockResolvedValue([]);
  });

  it('renders Login component when no user is logged in', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Agentic Orchestration' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back to your AI assistant')).toBeInTheDocument();
  });

  it('renders AgentChat component when user is logged in', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Fill in login form and submit
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show AgentChat component after successful login
    expect(await screen.findByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument();
  });

  it('handles logout and returns to Login component', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Login first
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Verify we're in AgentChat
    expect(await screen.findByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument();

    // Click logout button
    const logoutButton = screen.getByTitle('Logout');
    await user.click(logoutButton);

    // Should be back to Login
    expect(screen.getByRole('heading', { name: 'Agentic Orchestration' })).toBeInTheDocument();
  });
});
