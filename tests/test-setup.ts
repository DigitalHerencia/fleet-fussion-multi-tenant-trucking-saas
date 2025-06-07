import { test as setup, expect } from '@playwright/test';
import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 20;

// Test data for consistent user management - using actual test user
export const testUsers = {
  signup: {
    email: 'testuser+signup@fleetfusion.dev',
    password: '!Lis9_WK7RGCEGQ'
  },
  signin: {
    email: 'digitalherencia@outlook.com', // Using actual test user
    password: '!Lis9_WK7RGCEGQ'
  },
  signout: {
    email: 'digitalherencia@outlook.com', // Using actual test user
    password: '!Lis9_WK7RGCEGQ'
  },
  onboard: {
    email: 'digitalherencia@outlook.com', // Using actual test user
    password: '!Lis9_WK7RGCEGQ'
  },
  forgot: {
    email: 'testuser+forgot@fleetfusion.dev',
    password: '!Lis9_WK7RGCEGQ'
  }
};

// Helper functions for test operations
export const testHelpers = {
  async signUp(page: any, user: { email: string; password: string }) {
    await page.goto('/sign-up');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForLoadState('networkidle');
  },

  async signIn(page: any, user: { email: string; password: string }) {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');
  },

  async waitForRedirect(page: any, expectedUrlPattern: RegExp, timeout: number = 10000) {
    await page.waitForURL(expectedUrlPattern, { timeout });
  }
};

// Global setup - create test users if needed
setup('setup test users', async ({ page }) => {
  console.log('Setting up test users...');
  
  // Try to create test users if they don't exist
  for (const [key, user] of Object.entries(testUsers)) {
    try {
      await testHelpers.signUp(page, user);
      console.log(`Created test user: ${user.email}`);
    } catch (error) {
      console.log(`User ${user.email} may already exist or signup failed:`, error);
    }
  }
});
