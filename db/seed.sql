-- Seed test company (from clerk-org.json)
INSERT INTO companies (
  id, name, clerk_org_id, is_active, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'FleetFusion Test Org',
  'org_2wvjE9wZPYD3ueqyWk08KritcJX',
  true,
  NOW(),
  NOW()
) ON CONFLICT (clerk_org_id) DO NOTHING;

-- Seed users (from users.csv)
INSERT INTO company_users (
  id, user_id, company_id, role, is_active, created_at, updated_at
) VALUES
  ('10000000-0000-0000-0000-000000000001', 'user_2wvkK0jzrvQuzYTZCuD5o5a3LyT', '00000000-0000-0000-0000-000000000001', 'admin', true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'user_2wvkTnYpugudhtsKwZhJQiAPztZ', '00000000-0000-0000-0000-000000000001', 'dispatcher', true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'user_2wvkbIogujI4Obf7V3qH5LPaJux', '00000000-0000-0000-0000-000000000001', 'driver', true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'user_2wvkjZTcv61SL2czYl2hLgBEXzB', '00000000-0000-0000-0000-000000000001', 'compliance', true, NOW(), NOW())
ON CONFLICT (user_id, company_id) DO NOTHING;

-- Optionally, seed more tables (vehicles, etc.) as needed for testing.
