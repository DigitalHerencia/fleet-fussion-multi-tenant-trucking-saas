async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  // Add any cleanup logic here
  // e.g., cleanup test database records, clear caches, etc.
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;