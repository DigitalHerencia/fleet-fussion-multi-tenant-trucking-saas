import { test, expect } from '@playwright/test';

test.describe('RBAC UI and Route Protection', () => {
  test('Driver cannot access admin panel', async ({ page }) => {
    // TODO: Login as driver
    // TODO: Try to visit /admin
    // TODO: Expect 403 or redirect
  });
});
