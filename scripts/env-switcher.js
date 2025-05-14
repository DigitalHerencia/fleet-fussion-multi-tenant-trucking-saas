#!/usr/bin/env node

/**
 * This utility script helps switch between development environments
 * for the FleetFusion application, particularly when working with
 * different domain setups (localhost, ngrok, production).
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths to environment files
const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalTemplatePath = path.join(process.cwd(), '.env.local.template');
const envProductionPath = path.join(process.cwd(), '.env.production');

// Environment templates
const localEnvTemplate = `# Clerk Auth URL Routes - Updated for local development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=http://localhost:3000/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=http://localhost:3000/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=http://localhost:3000/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=http://localhost:3000/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=http://localhost:3000/sign-in
NEXT_PUBLIC_CLERK_ORG_CREATE_REDIRECT_URL=http://localhost:3000/onboarding
NEXT_PUBLIC_CLERK_ORG_LEAVE_REDIRECT_URL=http://localhost:3000/sign-in
NEXT_PUBLIC_CLERK_AFTER_LOGO_CLICK_URL=http://localhost:3000/org-selection
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_FALLBACK_URL=http://localhost:3000/org-selection`;

const ngrokEnvTemplate = `# Clerk Auth URL Routes - Updated for ngrok tunneling
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-in
NEXT_PUBLIC_CLERK_ORG_CREATE_REDIRECT_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/onboarding
NEXT_PUBLIC_CLERK_ORG_LEAVE_REDIRECT_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/sign-in
NEXT_PUBLIC_CLERK_AFTER_LOGO_CLICK_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/org-selection
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_FALLBACK_URL=https://{{NGROK_SUBDOMAIN}}.ngrok-free.app/org-selection`;

/**
 * Read the current environment file
 */
function readCurrentEnv() {
  try {
    return fs.readFileSync(envLocalPath, 'utf8');
  } catch (err) {
    console.log('No .env.local file found. Creating one...');
    return '';
  }
}

/**
 * Update the environment file with new content
 */
function updateEnvFile(content) {
  // Preserve any existing variables that aren't related to URLs
  const currentEnv = readCurrentEnv();
  const currentEnvLines = currentEnv.split('\n');
  
  // Filter out the lines we're going to replace
  const preservedLines = currentEnvLines.filter(line => {
    return !line.includes('NODE_ENV=') && 
           !line.includes('NEXT_PUBLIC_APP_URL=') && 
           !line.includes('NEXT_PUBLIC_CLERK_') && 
           line.trim() !== '';
  });
  
  // Combine new content with preserved lines
  const newContent = content + '\n\n' + preservedLines.join('\n');
  
  fs.writeFileSync(envLocalPath, newContent);
  console.log('Environment file updated successfully!');
}

/**
 * Configure the environment for local development
 */
function configureLocalEnv() {
  updateEnvFile(localEnvTemplate);
  console.log('\nConfigured for local development (http://localhost:3000)');
  console.log('Remember to update your Clerk Dashboard settings if needed.');
}

/**
 * Configure the environment for ngrok tunneling
 */
function configureNgrokEnv() {
  rl.question('Enter your ngrok subdomain: ', (subdomain) => {
    if (!subdomain) {
      console.log('Subdomain is required. Please try again.');
      return configureNgrokEnv();
    }
    
    const customizedTemplate = ngrokEnvTemplate.replace(/\{\{NGROK_SUBDOMAIN\}\}/g, subdomain);
    updateEnvFile(customizedTemplate);
    
    console.log(`\nConfigured for ngrok tunneling (https://${subdomain}.ngrok-free.app)`);
    console.log('Remember to:');
    console.log('1. Start your ngrok tunnel with: ngrok http 3000 --subdomain ' + subdomain);
    console.log('2. Update your Clerk Dashboard with the new domain');
    console.log('3. Clear your browser cookies');
    
    rl.close();
  });
}

// Main menu
function showMenu() {
  console.log('\nFleetFusion Environment Configuration');
  console.log('====================================');
  console.log('1. Configure for local development (localhost:3000)');
  console.log('2. Configure for ngrok tunneling');
  console.log('3. Exit');
  
  rl.question('\nSelect an option (1-3): ', (answer) => {
    switch (answer) {
      case '1':
        configureLocalEnv();
        rl.close();
        break;
      case '2':
        configureNgrokEnv();
        break;
      case '3':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        showMenu();
        break;
    }
  });
}

// Start the script
console.log('🚀 FleetFusion Environment Switcher');
showMenu();
