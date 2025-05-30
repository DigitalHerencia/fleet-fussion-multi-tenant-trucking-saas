// Stub for auth module
export async function auth() {
  // Return a mock user/org context for now
  return {
    user: { id: 'mock-user-id', name: 'Mock User' },
    organizationId: 'mock-org-id',
  };
}
