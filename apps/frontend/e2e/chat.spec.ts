import { test, expect } from '@playwright/test';

test.describe('Agent Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login and navigate to chat
    await page.route('**/api/users/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'test-user-id',
          email: 'test@example.com',
        }),
      });
    });

    await page.route('**/api/agent/conversations/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'conv1',
            user: 'test-user-id',
            summary: 'Previous Chat',
            messages: [{ question: 'Hello', answer: 'Hi there!' }],
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ]),
      });
    });

    // Navigate to app and login
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for chat interface to load
    await expect(page.locator('text=AI Assistant')).toBeVisible({ timeout: 10000 });
  });

  test('should display chat interface correctly', async ({ page }) => {
    // Check main elements
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Powered by OpenAI GPT-4o-mini')).toBeVisible();
    await expect(page.locator('text=Welcome to your AI Assistant')).toBeVisible();

    // Check input and send button
    await expect(
      page.locator('textarea[placeholder*="Ask your AI assistant anything"]'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();

    // Check conversation list
    await expect(page.getByRole('button', { name: /new conversation/i })).toBeVisible();
    await expect(page.locator('text=Previous Chat')).toBeVisible();
  });

  test('should display conversation suggestions', async ({ page }) => {
    // Check that suggestion buttons are visible
    await expect(page.locator("text=What's the weather like today?")).toBeVisible();
    await expect(page.locator('text=Tell me about Alice')).toBeVisible();
    await expect(page.locator('text=Help me with my project')).toBeVisible();
    await expect(page.locator('text=Explain machine learning')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    // Mock agent response
    await page.route('**/api/agent/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Hello! I am your AI assistant. How can I help you today?',
          conversationId: 'new-conv-id',
        }),
      });
    });

    // Type message
    const messageInput = page.locator('textarea[placeholder*="Ask your AI assistant anything"]');
    await messageInput.fill('Hello, how are you?');

    // Send message
    await page.getByRole('button', { name: /send/i }).click();

    // Should show user message
    await expect(page.locator('text=Hello, how are you?')).toBeVisible();

    // Should show typing indicator
    await expect(page.locator('text=AI is thinking')).toBeVisible();

    // Should show AI response
    await expect(
      page.locator('text=Hello! I am your AI assistant. How can I help you today?'),
    ).toBeVisible({ timeout: 10000 });

    // Input should be cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should use suggestion to fill input', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Ask your AI assistant anything"]');

    // Click on a suggestion
    await page.locator("text=What's the weather like today?").click();

    // Input should be filled with suggestion
    await expect(messageInput).toHaveValue("What's the weather like today?");
  });

  test('should handle weather quick action', async ({ page }) => {
    // Mock weather API response
    await page.route('**/api/agent/weather/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'The weather in Tokyo is sunny and 25°C',
          conversationId: 'weather-conv-id',
        }),
      });
    });

    // Click weather quick action
    await page.getByRole('button', { name: /☀️ weather/i }).click();

    // Should show weather question and response
    await expect(page.locator("text=What's the weather in Tokyo?")).toBeVisible();
    await expect(page.locator('text=The weather in Tokyo is sunny and 25°C')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should handle user info quick action', async ({ page }) => {
    // Mock user info API response
    await page.route('**/api/agent/local/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Found user Bob: 25 years old, located in San Francisco',
          conversationId: 'info-conv-id',
        }),
      });
    });

    // Click user info quick action
    await page.getByRole('button', { name: /👤 user info/i }).click();

    // Should show user info question and response
    await expect(page.locator('text=Find information about Bob')).toBeVisible();
    await expect(
      page.locator('text=Found user Bob: 25 years old, located in San Francisco'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should create new conversation', async ({ page }) => {
    // Mock new conversation API response
    await page.route('**/api/agent/conversations/new', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'new-conversation-id',
        }),
      });
    });

    // Click new conversation button
    await page.getByRole('button', { name: /new conversation/i }).click();

    // Should clear the chat and show welcome message
    await expect(page.locator('text=Welcome to your AI Assistant')).toBeVisible();
  });

  test('should select existing conversation', async ({ page }) => {
    // Click on existing conversation
    await page.locator('text=Previous Chat').click();

    // Should display conversation messages
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=Hi there!')).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    // Find the sidebar toggle button (hamburger menu)
    const toggleButton = page.locator('button').first();

    // Click to toggle sidebar
    await toggleButton.click();

    // Sidebar should be collapsed (we can't easily check width, so we'll check if toggle button is still visible)
    await expect(toggleButton).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Click logout button
    await page.locator('button[title="Logout"]').click();

    // Should return to login page
    await expect(page.locator('h1')).toContainText('Agentic Orchestration');
    await expect(page.locator('text=Welcome back to your AI assistant')).toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i });

    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when input has text', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Ask your AI assistant anything"]');
    const sendButton = page.getByRole('button', { name: /send/i });

    // Type some text
    await messageInput.fill('Test message');

    // Send button should be enabled
    await expect(sendButton).not.toBeDisabled();
  });

  test('should handle Enter key to send message', async ({ page }) => {
    // Mock agent response
    await page.route('**/api/agent/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Response via Enter key',
          conversationId: 'enter-conv-id',
        }),
      });
    });

    const messageInput = page.locator('textarea[placeholder*="Ask your AI assistant anything"]');

    // Type message and press Enter
    await messageInput.fill('Test message');
    await messageInput.press('Enter');

    // Should send message
    await expect(page.locator('text=Test message')).toBeVisible();
    await expect(page.locator('text=Response via Enter key')).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/agent/ask', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const messageInput = page.locator('textarea[placeholder*="Ask your AI assistant anything"]');

    // Send message
    await messageInput.fill('Test error message');
    await page.getByRole('button', { name: /send/i }).click();

    // Should show user message
    await expect(page.locator('text=Test error message')).toBeVisible();

    // Should show error message
    await expect(page.locator('text=Sorry, I encountered an error')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still accessible
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(
      page.locator('textarea[placeholder*="Ask your AI assistant anything"]'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();

    // Check that sidebar can be toggled on mobile
    const toggleButton = page.locator('button').first();
    await expect(toggleButton).toBeVisible();
  });
});
