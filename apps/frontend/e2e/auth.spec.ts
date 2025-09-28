import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Agentic Orchestration');
    await expect(page.locator('p')).toContainText('Welcome back to your AI assistant');

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should toggle between login and signup forms', async ({ page }) => {
    // Initially on login form
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Click signup link
    await page.getByText(/sign up/i).click();

    // Should now be on signup form
    await expect(page.locator('p')).toContainText('Create your account to get started');
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

    // Click login link
    await page.getByText(/sign in/i).click();

    // Should be back on login form
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should validate required fields on login', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should still be on login page (form validation prevents submission)
    await expect(page.locator('h1')).toContainText('Agentic Orchestration');
  });

  test('should validate required fields on signup', async ({ page }) => {
    // Switch to signup
    await page.getByText(/sign up/i).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should still be on signup page
    await expect(page.locator('p')).toContainText('Create your account to get started');
  });

  test('should display error message for invalid login', async ({ page }) => {
    // Fill form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for and check error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during login', async ({ page }) => {
    // Fill form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show loading state briefly
    await expect(page.locator('text=Processing')).toBeVisible({ timeout: 5000 });
  });

  test('should handle successful login and navigate to chat', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/users/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: '12345',
          email: 'test@example.com',
        }),
      });
    });

    // Mock conversations API
    await page.route('**/api/agent/conversations/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Fill and submit login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should navigate to chat interface
    await expect(page.locator('text=AI Assistant')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Welcome to your AI Assistant')).toBeVisible();
  });

  test('should handle successful signup and navigate to chat', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: '12345',
          email: 'newuser@example.com',
        }),
      });
    });

    // Mock conversations API
    await page.route('**/api/agent/conversations/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Switch to signup
    await page.getByText(/sign up/i).click();

    // Fill and submit signup form
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should navigate to chat interface
    await expect(page.locator('text=AI Assistant')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Welcome to your AI Assistant')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that form is still accessible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Check that elements are properly sized
    const emailInput = page.locator('input[type="email"]');
    const inputBox = await emailInput.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(200); // Should be reasonably wide
  });
});
