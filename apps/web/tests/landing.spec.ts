import { test, expect } from '@playwright/test';

test.describe('AIcruiter Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console logs and page errors to debug hydration/JS issues
    page.on('console', msg => console.log(`[PAGE CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[PAGE ERROR] ${err.message}\nStack:\n${err.stack}`));

    // Navigate to the base URL configured in playwright.config.ts
    await page.goto('/');

    // Wait 5 seconds to let Next.js dev server compile and complete Fast Refresh on first load
    await page.waitForTimeout(5000);
  });

  test('should load the homepage and display key elements', async ({ page }) => {
    // 1. Verify page title
    await expect(page).toHaveTitle(/AIcruiter/);

    // 2. Check header text (use first() to select the main landing header, bypassing background logo h1)
    const heading = page.locator('h1').first();
    await expect(heading).toContainText('Your');
    await expect(heading).toContainText('AI assistant');
    await expect(heading).toContainText('for every');
    await expect(heading).toContainText('meeting');

    // 3. Check for the live badge
    const badge = page.getByText(/AIcruiter 2.0 is live/);
    await expect(badge).toBeVisible();

    // 4. Verify landing sections are present (e.g. Features/Pricing/FAQ/About/CTA)
    const getStartedButton = page.locator('button:has-text("Get Started - It\'s free")').first();
    await expect(getStartedButton).toBeVisible();
  });

  test('should navigate to login page when clicking Log in', async ({ page }) => {
    const logInButton = page.locator('button:has-text("Log in")').first();
    await expect(logInButton).toBeVisible();

    // Poll until the button slides into the viewport (y >= 0), indicating layout has mounted
    await expect.poll(async () => {
      const box = await logInButton.boundingBox();
      return box ? box.y : -1;
    }, {
      message: 'Wait for Navbar Log in button to animate into view',
      timeout: 10000,
    }).toBeGreaterThanOrEqual(0);

    await logInButton.click({ force: true });
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test('should navigate to signup page when clicking Get Started', async ({ page }) => {
    const signUpButton = page.locator('nav button:has-text("Get Started")').first();
    await expect(signUpButton).toBeVisible();

    // Poll until the button slides into the viewport (y >= 0), indicating layout has mounted
    await expect.poll(async () => {
      const box = await signUpButton.boundingBox();
      return box ? box.y : -1;
    }, {
      message: 'Wait for Navbar Get Started button to animate into view',
      timeout: 10000,
    }).toBeGreaterThanOrEqual(0);

    await signUpButton.click({ force: true });
    await page.waitForURL(/\/signup/, { timeout: 10000 });
  });
});
