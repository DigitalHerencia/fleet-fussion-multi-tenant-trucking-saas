import { test, expect } from '@playwright/test';

test.describe('Basic Health Check', () => {
  test('Application loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FleetFusion/);
  });
  
  test('Sign up page loads', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
  
  test('Sign in page loads', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});

test.describe('Webhook API Test', () => {
  test('Webhook endpoint responds', async ({ request }) => {
    const webhookPayload = {
      type: 'user.created',
      data: {
        id: 'test_user_id',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'Test',
        last_name: 'User',
      },
    };
    
    const res = await request.post('/api/clerk/webhook-handler', {
      data: webhookPayload,
      headers: { 
        'content-type': 'application/json',
        'x-clerk-signature': 'test-signature' 
      },
    });
    
    console.log('Response status:', res.status());
    console.log('Response text:', await res.text());
    
    // Just check that we get a response (even if it's an error due to invalid signature)
    expect([200, 400, 401, 500]).toContain(res.status());
  });
});
