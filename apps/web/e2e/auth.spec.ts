import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /menuos/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByLabel(/nombre/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i).first()).toBeVisible();
  });

  test('forgot password page renders correctly', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  });

  test('login validates empty fields', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    // Form should not submit without valid data — page stays on login
    await expect(page).toHaveURL(/login/);
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/contraseña/i).fill('WrongPassword1!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    // Wait for error message
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8000 });
  });

  test('PIN login page renders correctly', async ({ page }) => {
    await page.goto('/auth/pin');
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('root redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login|register/);
  });

  test('admin routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
