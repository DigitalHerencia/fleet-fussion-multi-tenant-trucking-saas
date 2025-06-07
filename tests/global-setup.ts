import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Verify server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Server is accessible');
  } catch (error) {
    console.error('❌ Server not accessible:', error);
    throw new Error('Development server is not running on localhost:3000');
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;