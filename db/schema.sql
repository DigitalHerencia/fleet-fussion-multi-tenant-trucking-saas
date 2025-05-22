-- Companies (tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  dot_number TEXT,
  mc_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0f766e',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  make TEXT,
  model TEXT,
  year INTEGER,
  vin TEXT,
  license_plate TEXT,
  state TEXT,
  unit_number TEXT NOT NULL,
  current_odometer INTEGER,
  last_odometer_update TIMESTAMP,
  fuel_type TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  clerk_user_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  license_state TEXT,
  license_expiration DATE,
  medical_card_expiration DATE,
  hire_date DATE,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Loads
CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  trailer_id UUID REFERENCES vehicles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  customer_name TEXT,
  customer_contact TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  origin_address TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_zip TEXT NOT NULL,
  origin_lat NUMERIC(10,6),
  origin_lng NUMERIC(10,6),
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_zip TEXT NOT NULL,
  destination_lat NUMERIC(10,6),
  destination_lng NUMERIC(10,6),
  pickup_date TIMESTAMP,
  delivery_date TIMESTAMP,
  actual_pickup_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  commodity TEXT,
  weight NUMERIC(10,2),
  rate NUMERIC(10,2),
  miles INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  load_id UUID REFERENCES loads(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Inspections
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  location TEXT,
  notes TEXT,
  defects JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Maintenance Records
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  odometer INTEGER,
  cost NUMERIC(10,2),
  vendor TEXT,
  completed_date TIMESTAMP,
  scheduled_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- IFTA Trips
CREATE TABLE ifta_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  load_id UUID REFERENCES loads(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  start_odometer INTEGER,
  end_odometer INTEGER,
  total_miles NUMERIC(10,2),
  jurisdiction_data JSONB,
  fuel_purchases JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
