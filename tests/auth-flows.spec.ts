import { test, expect } from '@playwright/test';

import { AuthHelpers } from './test-helpers';
import { generateTestUser } from './test-data';

test.describe('Authentication Flows', () => {
  test('Complete user journey: Sign Up → Onboarding → Sign Out', async ({
    page,
  }) => {
    const user = generateTestUser();

    // Test Sign Up
    await AuthHelpers.signUp(page, user);
    await expect(page).toHaveURL(/onboarding/, { timeout: 15000 });

    // Test Onboarding
    await AuthHelpers.completeOnboarding(page, user);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Test Sign Out
    await AuthHelpers.signOut(page);
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('Sign In with existing user', async ({ page }) => {
    const user = generateTestUser();

    // First create the user
    await AuthHelpers.signUp(page, user);
    await AuthHelpers.completeOnboarding(page, user);
    await AuthHelpers.signOut(page);

    // Now test sign in
    await AuthHelpers.signIn(page, user);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
  });

  test('Forgot Password flow', async ({ page }) => {
    const user = generateTestUser();

    // First create user
    await AuthHelpers.signUp(page, user);
    await AuthHelpers.completeOnboarding(page, user);
    await AuthHelpers.signOut(page);

    // Test forgot password
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email/i).fill(user.email);
    await page.getByRole('button', { name: /send reset/i }).click();

    await expect(
      page.getByText(/reset code sent|check your email/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
