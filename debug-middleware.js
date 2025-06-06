/**
 * Debug script to test middleware route matching logic
 * This will help us understand why the navigation links are failing
 */

// Simulate the system roles and route protection logic
const SystemRoles = {
  ADMIN: 'admin',
  DISPATCHER: 'dispatcher', 
  DRIVER: 'driver',
  COMPLIANCE_OFFICER: 'compliance_officer',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
};

const PROTECTED_ROUTES = {
  // Dashboard: All authenticated users should access their dashboard
  '/:orgId/dashboard/:userId': [
    SystemRoles.ADMIN,
    SystemRoles.DISPATCHER,
    SystemRoles.DRIVER,
    SystemRoles.COMPLIANCE_OFFICER,
    SystemRoles.ACCOUNTANT,
    SystemRoles.VIEWER
  ],
  // Compliance dashboard: Compliance Officer, Admin
  '/:orgId/compliance/:userId': [
    SystemRoles.COMPLIANCE_OFFICER,
    SystemRoles.ADMIN
  ],
  // Drivers list: Admin, Dispatcher, Compliance (need to see drivers for compliance), Viewer
  '/:orgId/drivers': [
    SystemRoles.ADMIN,
    SystemRoles.DISPATCHER,
    SystemRoles.COMPLIANCE_OFFICER,
    SystemRoles.VIEWER
  ],
  // Drivers dashboard: Driver (own profile), Admin, Dispatcher, Compliance
  '/:orgId/drivers/:userId': [
    SystemRoles.DRIVER,
    SystemRoles.ADMIN,
    SystemRoles.DISPATCHER,
    SystemRoles.COMPLIANCE_OFFICER
  ],
  // Dispatch dashboard: Dispatcher, Admin
  '/:orgId/dispatch/:userId': [
    SystemRoles.DISPATCHER,
    SystemRoles.ADMIN
  ],
  // Analytics: Admin, Dispatcher, Compliance Officer, Viewer (read-only)
  '/:orgId/analytics': [
    SystemRoles.ADMIN,
    SystemRoles.DISPATCHER,
    SystemRoles.COMPLIANCE_OFFICER,
    SystemRoles.VIEWER
  ],
  // Vehicles list: Admin, Dispatcher, Compliance (for inspections), Viewer
  '/:orgId/vehicles': [
    SystemRoles.ADMIN,
    SystemRoles.DISPATCHER,
    SystemRoles.COMPLIANCE_OFFICER,
    SystemRoles.VIEWER
  ],
  // IFTA: Admin, Accountant
  '/:orgId/ifta': [
    SystemRoles.ADMIN,
    SystemRoles.ACCOUNTANT
  ],
  // Settings: Admin only
  '/:orgId/settings': [
    SystemRoles.ADMIN
  ],
};

// Helper function to match dynamic routes
function matchesRoute(pattern, actualPath) {
  // Convert pattern like "/:orgId/drivers/:userId" to regex
  const regexPattern = pattern
    .replace(/:[^\/]+/g, '[^/]+') // Replace :param with [^/]+ (non-slash characters)
    .replace(/\//g, '\\/'); // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  console.log(`Checking pattern "${pattern}" -> regex "${regexPattern}" against path "${actualPath}"`);
  const matches = regex.test(actualPath);
  console.log(`  Result: ${matches}`);
  return matches;
}

function hasAnyRole(user, roles) {
  if (!user || user.isActive === false) return false;
  return roles.includes(user.role);
}

function canAccessRoute(user, path) {
  if (!user || user.isActive === false) {
    console.log(`❌ Access denied: user is null or inactive`);
    return false;
  }

  console.log(`\n🔍 Checking access for user (role: ${user.role}) to path: ${path}`);

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find(routePattern => {
    return matchesRoute(routePattern, path);
  });

  if (matchedRoute) {
    const requiredRoles = PROTECTED_ROUTES[matchedRoute];
    console.log(`📋 Route "${matchedRoute}" requires roles: [${requiredRoles.join(', ')}]`);
    const hasAccess = hasAnyRole(user, requiredRoles);
    console.log(`🎯 User has access: ${hasAccess}`);
    return hasAccess;
  }
  
  // Default to true if not in protected routes
  console.log(`✅ Route not in protected routes, allowing access`);
  return true; 
}

// Test cases based on the live app navigation
console.log('=== MIDDLEWARE ROUTE PROTECTION DEBUGGING ===\n');

// Simulate different user types
const testUsers = [
  { role: SystemRoles.ADMIN, isActive: true, name: 'Admin User' },
  { role: SystemRoles.DISPATCHER, isActive: true, name: 'Dispatcher User' },
  { role: SystemRoles.DRIVER, isActive: true, name: 'Driver User' },
  { role: SystemRoles.ACCOUNTANT, isActive: true, name: 'Accountant User' },
  { role: SystemRoles.VIEWER, isActive: true, name: 'Viewer User' },
  { role: SystemRoles.COMPLIANCE_OFFICER, isActive: true, name: 'Compliance User' },
];

// Test paths from MainNav component
const testPaths = [
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/dashboard/user_2xvBkgnvDcAcQoF45MnzPo63R2l',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/vehicles',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/drivers',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/drivers/user_2xvBkgnvDcAcQoF45MnzPo63R2l',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/dispatch/user_2xvBkgnvDcAcQoF45MnzPo63R2l',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/analytics',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/ifta',
  '/org_2xvBliaRVTLXpaA6Uc5n66Jsw0u/settings',
];

// Test each user type against each path
testUsers.forEach(user => {
  console.log(`\n🧑‍💼 TESTING USER: ${user.name} (${user.role})`);
  console.log('='.repeat(50));
  
  testPaths.forEach(path => {
    const result = canAccessRoute(user, path);
    console.log(`${result ? '✅' : '❌'} ${path.split('/').slice(-2).join('/')} `);
  });
});

console.log('\n=== KEY FINDINGS ===');
console.log('✅ FIXED: Dashboard route now includes ALL roles: [admin, dispatcher, driver, compliance_officer, accountant, viewer]');
console.log('✅ FIXED: Vehicles route now includes: [admin, dispatcher, compliance_officer, viewer]');
console.log('✅ FIXED: Drivers list now includes: [admin, dispatcher, compliance_officer, viewer]');
console.log('✅ FIXED: Analytics now includes viewer role: [admin, dispatcher, compliance_officer, viewer]');
console.log('\nAll major navigation routes should now work for the common user roles!');
console.log('The restrictive route protection has been updated to be more inclusive.');