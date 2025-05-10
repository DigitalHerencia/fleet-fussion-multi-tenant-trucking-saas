// Example script to create a Clerk webhook using your API route
// Place in scripts/ or run in a test environment

const fetch = require('node-fetch');

async function createWebhook() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const webhookBaseUrl = isDevelopment 
    ? 'https://liberal-gull-quietly.ngrok-free.app' // Your ngrok domain
    : 'https://fleet-fusion.vercel.app/'; // Replace with your actual production domain

  const res = await fetch('http://localhost:3000/api/clerk/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `${webhookBaseUrl}/api/clerk/webhook-handler`, // Dynamically set webhook URL
      events: [
        'user.created',
        'user.updated',
        'user.deleted',
        'organization.created',
        'organization.updated',
        'organization.deleted',
        'organizationMembership.created',
        'organizationMembership.updated',
        'organizationMembership.deleted',
      ],
    }),
  });
  const data = await res.json();
  // console.log('Webhook creation response:', data);
}

createWebhook().catch(console.error);
