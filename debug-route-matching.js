// Debug script to test route pattern matching
// This will help us identify the issue with MainNav redirects

// Simulate the pattern matching logic from RouteProtection
function matchesRoute(pattern, actualPath) {
  // Convert pattern like "/:orgId/drivers/:userId" to regex
  const regexPattern = pattern
    .replace(/:[^\/]+/g, '[^/]+') // Replace :param with [^/]+ (non-slash characters)
    .replace(/\//g, '\\/'); // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  console.log(`Pattern: ${pattern}`);
  console.log(`Regex: ^${regexPattern}$`);
  console.log(`Path: ${actualPath}`);
  console.log(`Match: ${regex.test(actualPath)}`);
  console.log('---');
  return regex.test(actualPath);
}

// Test cases based on MainNav routes
const PROTECTED_ROUTES = {
  '/:orgId/dashboard/:userId': ['admin', 'accountant', 'viewer'],
  '/:orgId/compliance/:userId': ['compliance_officer', 'admin'],
  '/:orgId/drivers': ['admin', 'dispatcher'],
  '/:orgId/drivers/:userId': ['driver', 'admin', 'dispatcher'],
  '/:orgId/dispatch/:userId': ['dispatcher', 'admin'],
  '/:orgId/analytics': ['admin', 'dispatcher', 'compliance_officer'],
  '/:orgId/vehicles': ['admin', 'dispatcher'],
  '/:orgId/ifta': ['admin', 'accountant'],
  '/:orgId/settings': ['admin'],
};

// Test paths from MainNav
const testPaths = [
  '/org123/dashboard/user456',
  '/org123/dispatch/user456',
  '/org123/drivers/user456',
  '/org123/vehicles',
  '/org123/compliance/user456',
  '/org123/ifta',
  '/org123/analytics',
  '/org123/settings',
];

console.log('=== ROUTE MATCHING DEBUG ===\n');

testPaths.forEach(path => {
  console.log(`Testing path: ${path}`);
  
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find(routePattern => {
    return matchesRoute(routePattern, path);
  });
  
  if (matchedRoute) {
    console.log(`✅ Matched route pattern: ${matchedRoute}`);
    console.log(`Required roles: ${PROTECTED_ROUTES[matchedRoute].join(', ')}`);
  } else {
    console.log(`❌ No matching route pattern found! Path will default to accessible.`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
});
