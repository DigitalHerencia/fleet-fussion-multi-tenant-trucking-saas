import { test, expect } from '@playwright/test';
import { Webhook } from 'svix';

test.describe('Webhook Handler', () => {
  test('Webhook handler processes user.created event', async ({ request }) => {
    // const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    const webhookSecret = 'whsec_c6gzgp0U/O4A43X0CeBlu5vlScWLlWw8';
    const payload = {
      type: 'user.created',
      data: {
        id: 'user_test_123',
        email_addresses: [{ email_address: 'webhook-test@fleetfusion.dev' }],
        first_name: 'Webhook',
        last_name: 'User',
        public_metadata: {
          role: 'admin',
          isActive: true,
          onboardingComplete: false
        }
      },
    };

    // Generate proper Svix signature
    const wh = new Webhook(webhookSecret);
    const payloadString = JSON.stringify(payload);
    const headers = wh.sign('webhook_test_id', new Date(), payloadString);

    const response = await request.post('/api/clerk/webhook-handler', {
      data: payloadString,
      headers: {
        'content-type': 'application/json',
        ...(headers && typeof headers === 'object' && !Array.isArray(headers) ? headers : {}),
      },
    });

    console.log('Webhook response status:', response.status());
    const responseText = await response.text();
    console.log('Webhook response:', responseText);

    expect(response.ok()).toBeTruthy();
    
    const responseJson = await response.json();
    expect(responseJson.message).toBe('Webhook processed successfully');
  });

  test('Webhook handler rejects invalid signatures', async ({ request }) => {
    const payload = {
      type: 'user.created',
      data: { id: 'test_user' },
    };

    const response = await request.post('/api/clerk/webhook-handler', {
      data: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
        'svix-signature': 'invalid-signature',
      },
    });

    expect(response.status()).toBe(400);
    
    const responseJson = await response.json();
    expect(responseJson.error).toBe('Invalid webhook signature');
  });
});