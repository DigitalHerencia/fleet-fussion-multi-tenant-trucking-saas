import { Page, expect } from '@playwright/test';

import type { TestUser } from './test-data';

export class AuthHelpers {
  static async signUp(page: Page, user: TestUser): Promise<void> {
    await page.goto('/sign-up');
    await page.waitForLoadState('networkidle');

    // Fill sign-up form
    await page
      .getByLabel(/full name/i)
      .fill(`${user.firstName} ${user.lastName}`);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);

    // Submit and wait for redirect
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for either onboarding or dashboard redirect
    await page.waitForURL(/\/(onboarding|.*\/dashboard)/, { timeout: 30000 });
  }

  static async signIn(page: Page, user: TestUser): Promise<void> {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);

    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for successful redirect (not sign-in page)
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 30000 });
  }

  static async completeOnboarding(page: Page, user: TestUser): Promise<void> {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Fill all required onboarding fields
    await page.getByLabel(/company name/i).fill(user.companyName);
    await page.getByLabel(/dot number/i).fill(user.dotNumber);
    await page.getByLabel(/mc number/i).fill(user.mcNumber);
    await page.getByLabel(/address/i).fill(user.address);
    await page.getByLabel(/city/i).fill(user.city);
    await page.getByLabel(/state/i).fill(user.state);
    await page.getByLabel(/zip/i).fill(user.zip);
    await page.getByLabel(/phone/i).fill(user.phone);

    // Submit onboarding
    await page.getByRole('button', { name: /complete onboarding/i }).click();

    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
  }

  static async signOut(page: Page): Promise<void> {
    await page.goto('/sign-out');
    await expect(page).toHaveURL('/', { timeout: 15000 });
  }
}
