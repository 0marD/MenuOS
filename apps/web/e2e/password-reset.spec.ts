import { test, expect } from '@playwright/test';

test.describe('Forgot password flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password');
  });

  test('renders email field and submit button', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  });

  test('has link back to login', async ({ page }) => {
    const link = page.getByRole('link', { name: /volver/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/login/);
  });

  test('shows validation error on invalid email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByRole('button', { name: /enviar/i }).click();
    await expect(page.locator('[aria-invalid="true"]')).toBeVisible({ timeout: 3000 });
  });

  test('shows success state after valid email submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /enviar/i }).click();
    // Success: shows "Revisa tu correo" message (button disappears)
    await expect(page.getByRole('button', { name: /enviar/i })).not.toBeVisible({ timeout: 8000 });
  });
});

test.describe('Reset password page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/reset-password');
  });

  test('renders password fields and submit button', async ({ page }) => {
    await expect(page.getByLabel(/nueva contraseña/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();
  });

  test('has link back to login', async ({ page }) => {
    const link = page.getByRole('link', { name: /volver/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/login/);
  });

  test('shows validation error on short password', async ({ page }) => {
    await page.getByLabel(/nueva contraseña/i).fill('short');
    await page.getByLabel(/confirmar contraseña/i).fill('short');
    await page.getByRole('button', { name: /guardar/i }).click();
    await expect(page.locator('[aria-invalid="true"]')).toBeVisible({ timeout: 3000 });
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByLabel(/nueva contraseña/i).fill('StrongPass1!');
    await page.getByLabel(/confirmar contraseña/i).fill('Different1!');
    await page.getByRole('button', { name: /guardar/i }).click();
    const errors = page.locator('[role="alert"], p.text-red-600');
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });
});
