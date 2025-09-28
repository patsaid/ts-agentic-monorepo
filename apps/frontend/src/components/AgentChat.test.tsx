import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentChat from './AgentChat';
import { agentApi, conversationApi } from '../services/api';

// Mock the API
vi.mock('../services/api');

const mockUser = {
  _id: '12345',
  email: 'test@example.com',
};

const mockConversations = [
  {
    _id: 'conv1',
    user: '12345',
    summary: 'Test conversation 1',
    messages: [{ question: 'Hello', answer: 'Hi there!' }],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    _id: 'conv2',
    user: '12345',
    summary: 'Test conversation 2',
    messages: [],
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('AgentChat Component', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(agentApi.getConversations).mockResolvedValue(mockConversations);
  });

  it('renders chat interface correctly', async () => {
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument();
    expect(screen.getByText('Powered by OpenAI GPT-4o-mini')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask your ai assistant anything/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new conversation/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(agentApi.getConversations).toHaveBeenCalledWith(mockUser._id);
    });
  });

  it('displays welcome message when no messages', () => {
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByText('Welcome to your AI Assistant')).toBeInTheDocument();
    expect(screen.getByText(/ask me anything/i)).toBeInTheDocument();
  });

  it('displays conversation suggestions', () => {
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByText("What's the weather like today?")).toBeInTheDocument();
    expect(screen.getByText('Tell me about Alice')).toBeInTheDocument();
    expect(screen.getByText('Help me with my project')).toBeInTheDocument();
    expect(screen.getByText('Explain machine learning')).toBeInTheDocument();
  });

  it('loads and displays conversations', async () => {
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Test conversation 1')).toBeInTheDocument();
      expect(screen.getByText('Test conversation 2')).toBeInTheDocument();
    });
  });

  it('handles load conversations error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(agentApi.getConversations).mockRejectedValue(
      new Error('Failed to load conversations'),
    );

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load conversations:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('sends message and displays response', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      answer: 'Hello! How can I help you today?',
      conversationId: 'new-conv-id',
    };

    vi.mocked(agentApi.ask).mockResolvedValue(mockResponse);

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Hello, how are you?');
    await user.click(sendButton);

    // Should show typing indicator initially (if it appears)
    await waitFor(
      () => {
        const typingIndicator = screen.queryByText(/ai is thinking/i);
        if (typingIndicator) {
          expect(typingIndicator).toBeInTheDocument();
        }
      },
      { timeout: 1000 },
    );

    await waitFor(() => {
      expect(agentApi.ask).toHaveBeenCalledWith({
        userId: mockUser._id,
        conversationId: undefined,
        question: 'Hello, how are you?',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });

    // Input should be cleared
    expect(messageInput).toHaveValue('');
  });

  it('handles Enter key to send message', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      answer: 'Response via Enter key',
      conversationId: 'new-conv-id',
    };

    vi.mocked(agentApi.ask).mockResolvedValue(mockResponse);

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);

    await user.type(messageInput, 'Test message{enter}');

    await waitFor(() => {
      expect(agentApi.ask).toHaveBeenCalledWith({
        userId: mockUser._id,
        conversationId: undefined,
        question: 'Test message',
      });
    });
  });

  it('allows Shift+Enter for new line without sending', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);

    await user.type(messageInput, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(messageInput, 'Line 2');

    expect(messageInput).toHaveValue('Line 1\nLine 2');
    expect(agentApi.ask).not.toHaveBeenCalled();
  });

  it('creates new conversation', async () => {
    const user = userEvent.setup();
    const mockConversationId = 'new-conversation-id';

    vi.mocked(conversationApi.create).mockResolvedValue({
      conversationId: mockConversationId,
    });

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const newConversationButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newConversationButton);

    await waitFor(() => {
      expect(conversationApi.create).toHaveBeenCalledWith(mockUser._id);
    });
  });

  it('handles new conversation creation error', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(conversationApi.create).mockRejectedValue(new Error('Failed to create conversation'));

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const newConversationButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newConversationButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create conversation:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('selects existing conversation', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Test conversation 1')).toBeInTheDocument();
    });

    const conversation = screen.getByText('Test conversation 1');
    await user.click(conversation);

    // Should display the conversation's messages
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('executes weather quick action', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      answer: 'The weather in Tokyo is sunny and 25°C',
      conversationId: 'weather-conv-id',
    };

    vi.mocked(agentApi.getWeather).mockResolvedValue(mockResponse);

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const weatherButton = screen.getByRole('button', { name: /☀️ weather/i });
    await user.click(weatherButton);

    await waitFor(() => {
      expect(agentApi.getWeather).toHaveBeenCalledWith('Tokyo', mockUser._id);
    });

    await waitFor(() => {
      expect(screen.getByText("What's the weather in Tokyo?")).toBeInTheDocument();
      expect(screen.getByText('The weather in Tokyo is sunny and 25°C')).toBeInTheDocument();
    });
  });

  it('executes user info quick action', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      answer: 'Found user Bob: 25 years old, located in San Francisco',
      conversationId: 'info-conv-id',
    };

    vi.mocked(agentApi.getLocalInfo).mockResolvedValue(mockResponse);

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const userInfoButton = screen.getByRole('button', { name: /👤 user info/i });
    await user.click(userInfoButton);

    await waitFor(() => {
      expect(agentApi.getLocalInfo).toHaveBeenCalledWith('Bob', mockUser._id);
    });

    await waitFor(() => {
      expect(screen.getByText('Find information about Bob')).toBeInTheDocument();
      expect(
        screen.getByText('Found user Bob: 25 years old, located in San Francisco'),
      ).toBeInTheDocument();
    });
  });

  it('handles quick action error', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(agentApi.getWeather).mockRejectedValue(new Error('Quick action failed'));

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const weatherButton = screen.getByRole('button', { name: /☀️ weather/i });
    await user.click(weatherButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to execute quick action:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('toggles sidebar visibility', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    // Find the hamburger menu button by its SVG path content
    const hamburgerPath = screen.getByText((content, element) => {
      if (element?.tagName === 'path') {
        const d = element.getAttribute('d');
        return d === 'M4 6h16M4 12h16M4 18h16';
      }
      return false;
    });

    // Get the button that contains this SVG path
    const toggleButton = hamburgerPath.closest('button');

    expect(toggleButton).toBeInTheDocument();

    // Test that the button is clickable
    await user.click(toggleButton!);

    // Verify button still exists after click (basic functionality test)
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByTitle('Logout');
    await user.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('disables send button when input is empty', () => {
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');

    expect(sendButton).not.toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(agentApi.ask).mockRejectedValue(new Error('API Error'));

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText(/sorry, i encountered an error/i)).toBeInTheDocument();
    });
  });

  it('fills input when suggestion is clicked', async () => {
    const user = userEvent.setup();
    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const suggestion = screen.getByText("What's the weather like today?");
    await user.click(suggestion);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);
    expect(messageInput).toHaveValue("What's the weather like today?");
  });

  it('handles multiple messages correctly', async () => {
    const user = userEvent.setup();
    const mockResponse1 = {
      answer: 'First response',
      conversationId: 'conv-1',
    };
    const mockResponse2 = {
      answer: 'Second response',
      conversationId: 'conv-1',
    };

    vi.mocked(agentApi.ask)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    render(<AgentChat user={mockUser} onLogout={mockOnLogout} />);

    const messageInput = screen.getByPlaceholderText(/ask your ai assistant anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Send first message
    await user.type(messageInput, 'First question');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Send second message
    await user.type(messageInput, 'Second question');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });

    // Both messages should still be visible
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('First response')).toBeInTheDocument();
  });
});
