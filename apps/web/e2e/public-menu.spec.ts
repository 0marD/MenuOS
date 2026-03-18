import { test, expect } from '@playwright/test';

test.describe('Customer Menu PWA (public routes)', () => {
  test('offline page renders', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByText(/sin conexión|offline/i)).toBeVisible();
  });

  test('unknown slug returns 404 or not-found UI', async ({ page }) => {
    const res = await page.goto('/slug-que-no-existe-xyzabc');
    // Either 404 status or a not-found message
    const status = res?.status() ?? 200;
    const isNotFound = status === 404 ||
      (await page.getByText(/no encontrado|not found|restaurante/i).count()) > 0;
    expect(isNotFound).toBeTruthy();
  });
});
