import { test, expect } from '@playwright/test';

test.describe('Navigation & Static Pages', () => {
  test('manifest is served correctly', async ({ page }) => {
    const res = await page.goto('/manifest.webmanifest');
    expect(res?.status()).toBe(200);
    const json = await res?.json();
    expect(json).toMatchObject({
      name: 'MenuOS',
      display: 'standalone',
    });
  });

  test('service worker script is served', async ({ page }) => {
    const res = await page.goto('/sw.js');
    expect(res?.status()).toBe(200);
  });

  test('favicon is served', async ({ page }) => {
    const res = await page.goto('/favicon.ico');
    expect(res?.status()).toBe(200);
  });

  test('login page has correct title', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/menuos/i);
  });

  test('register has link back to login', async ({ page }) => {
    await page.goto('/auth/register');
    const loginLink = page.getByRole('link', { name: /iniciar sesión|login/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});
