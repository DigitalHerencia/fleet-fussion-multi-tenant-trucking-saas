# Start dev server and ngrok tunnel for Clerk webhooks

# Start Next.js dev server
npm run dev &

# Start ngrok with custom domain for Clerk webhooks
grok http --domain=liberal-gull-quietly.ngrok-free.app 3000
