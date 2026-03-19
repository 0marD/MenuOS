import { test, expect } from '@playwright/test';

test.describe('Register flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/nombre del restaurante/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    // At least one validation error should appear
    const errors = page.locator('[role="alert"], p.text-red-600, p.text-destructive');
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByLabel(/nombre completo/i).fill('Test User');
    await page.getByLabel(/nombre del restaurante/i).fill('Test Restaurant');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^contraseña/i).fill('Password1!');
    await page.getByLabel(/confirmar contraseña/i).fill('Different1!');
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    const errors = page.locator('[role="alert"], p.text-red-600');
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });

  test('inputs mark aria-invalid on error', async ({ page }) => {
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    // After submission, at least one input should have aria-invalid="true"
    await page.waitForTimeout(500);
    const invalidInputs = page.locator('input[aria-invalid="true"]');
    await expect(invalidInputs.first()).toBeVisible({ timeout: 3000 });
  });

  test('has link back to login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /iniciar sesión/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});
