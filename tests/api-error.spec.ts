import { test, expect } from '@playwright/test';

test.describe('API Error Handling', () => {
  test('Returns error for invalid webhook payload', async ({ request }) => {
    const res = await request.post('/api/clerk/webhook-handler', {
      data: { invalid: true },
      headers: { 'content-type': 'application/json' },
    });
    expect([400, 422, 500]).toContain(res.status());
  });
});
