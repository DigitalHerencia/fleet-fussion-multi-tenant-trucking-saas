-- Companies
INSERT INTO companies (id, name, dot_number, mc_number, address, city, state, zip, phone, email, logo_url, primary_color, is_active, created_at, updated_at)
VALUES 
('c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'C & J Express Inc.', '1565942', '580454', '710 Eagle Dr', 'Anthony', 'NM', '88021', '555-123-4567', 'info@cjexpress.com', NULL, '#0f766e', true, NOW(), NOW());

-- Vehicles (Tractors)
INSERT INTO vehicles (id, company_id, type, status, make, model, year, vin, license_plate, state, unit_number, current_odometer, last_odometer_update, fuel_type, created_at, updated_at)
VALUES
('d81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'tractor', 'active', 'Freightliner', 'Cascadia', 2022, '1FUJGHDV0CLBP8834', 'ABC1234', 'NM', 'T-101', 125000, NOW(), 'diesel', NOW(), NOW()),
('d81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'tractor', 'active', 'Peterbilt', '579', 2021, '1XPBD49X1MD456789', 'XYZ5678', 'NM', 'T-102', 98000, NOW(), 'diesel', NOW(), NOW()),
('d81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'tractor', 'active', 'Kenworth', 'T680', 2023, '1XKAD49X1NJ123456', 'DEF9012', 'NM', 'T-103', 45000, NOW(), 'diesel', NOW(), NOW()),
('d81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'tractor', 'maintenance', 'Volvo', 'VNL', 2020, '4V4NC9EH4LN234567', 'GHI3456', 'NM', 'T-104', 210000, NOW(), 'diesel', NOW(), NOW()),
('d81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'tractor', 'inactive', 'Mack', 'Anthem', 2019, '1M1AN07Y5KM345678', 'JKL7890', 'NM', 'T-105', 320000, NOW(), 'diesel', NOW(), NOW());

-- Vehicles (Trailers)
INSERT INTO vehicles (id, company_id, type, status, make, model, year, vin, license_plate, state, unit_number, current_odometer, last_odometer_update, fuel_type, created_at, updated_at)
VALUES
('e81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'trailer', 'active', 'Great Dane', 'Everest', 2021, '1GRAA06Y5KM123456', 'TRL1234', 'NM', 'TR-201', NULL, NULL, NULL, NOW(), NOW()),
('e81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'trailer', 'active', 'Utility', '3000R', 2022, '1UYVS2538NM234567', 'TRL5678', 'NM', 'TR-202', NULL, NULL, NULL, NOW(), NOW()),
('e81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'trailer', 'active', 'Wabash', 'DuraPlate', 2020, '1JJV532B0LL345678', 'TRL9012', 'NM', 'TR-203', NULL, NULL, NULL, NOW(), NOW()),
('e81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'trailer', 'maintenance', 'Hyundai', 'Translead', 2019, '3H3V532C1KT456789', 'TRL3456', 'NM', 'TR-204', NULL, NULL, NULL, NOW(), NOW());

-- Drivers
INSERT INTO drivers (id, company_id, clerk_user_id, first_name, last_name, email, phone, license_number, license_state, license_expiration, medical_card_expiration, hire_date, termination_date, status, notes, created_at, updated_at)
VALUES
('f81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'John', 'Smith', 'john.smith@example.com', '555-111-2222', 'DL123456', 'NM', '2026-05-15', '2025-08-20', '2022-03-10', NULL, 'active', 'Experienced driver with hazmat endorsement', NOW(), NOW()),
('f81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'Maria', 'Garcia', 'maria.garcia@example.com', '555-222-3333', 'DL234567', 'TX', '2025-11-30', '2025-04-15', '2021-06-22', NULL, 'active', 'Team driver capability', NOW(), NOW()),
('f81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'Robert', 'Johnson', 'robert.johnson@example.com', '555-333-4444', 'DL345678', 'AZ', '2024-09-18', '2024-12-05', '2023-01-15', NULL, 'active', 'Prefers southwest routes', NOW(), NOW()),
('f81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'Sarah', 'Williams', 'sarah.williams@example.com', '555-444-5555', 'DL456789', 'NM', '2025-07-22', '2024-08-30', '2022-11-08', NULL, 'active', 'Excellent safety record', NOW(), NOW()),
('f81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'Michael', 'Brown', 'michael.brown@example.com', '555-555-6666', 'DL567890', 'CA', '2026-02-14', '2025-03-10', '2021-09-30', NULL, 'inactive', 'On extended leave', NOW(), NOW());

-- Loads
INSERT INTO loads (id, company_id, driver_id, vehicle_id, trailer_id, status, reference_number, customer_name, customer_contact, customer_phone, customer_email, origin_address, origin_city, origin_state, origin_zip, origin_lat, origin_lng, destination_address, destination_city, destination_state, destination_zip, destination_lat, destination_lng, pickup_date, delivery_date, actual_pickup_date, actual_delivery_date, commodity, weight, rate, miles, notes, created_at, updated_at)
VALUES
('a81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', 'e81d4e2e-bcf2-11e6-869b-7df92533d2db', 'in_transit', 'L-1001', 'ABC Distributors', 'Jane Doe', '555-987-6543', 'jane.doe@abcdist.com', '123 Shipping Lane', 'El Paso', 'TX', '79901', 31.7619, -106.4850, '456 Receiving Blvd', 'Albuquerque', 'NM', '87102', 35.0844, -106.6504, '2025-05-01 08:00:00', '2025-05-02 14:00:00', '2025-05-01 08:30:00', NULL, 'Electronics', 15000.00, 2500.00, 267, 'High-value shipment, requires signature', NOW(), NOW()),
('a81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'e81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'assigned', 'L-1002', 'XYZ Logistics', 'John Smith', '555-123-4567', 'john.smith@xyzlogistics.com', '789 Pickup Road', 'Las Cruces', 'NM', '88001', 32.3199, -106.7637, '321 Delivery Street', 'Phoenix', 'AZ', '85001', 33.4484, -112.0740, '2025-05-02 10:00:00', '2025-05-03 16:00:00', NULL, NULL, 'Auto Parts', 22000.00, 3200.00, 390, 'Delivery window: 2-5 PM', NOW(), NOW()),
('a81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'e81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'completed', 'L-1003', 'Southwest Freight', 'Maria Rodriguez', '555-789-0123', 'maria@swfreight.com', '567 Cargo Court', 'Tucson', 'AZ', '85701', 32.2226, -110.9747, '890 Freight Avenue', 'El Paso', 'TX', '79901', 31.7619, -106.4850, '2025-04-28 09:00:00', '2025-04-29 15:00:00', '2025-04-28 09:15:00', '2025-04-29 14:30:00', 'Building Materials', 28000.00, 2800.00, 317, 'Completed ahead of schedule', NOW(), NOW()),
('a81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2de', 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', 'e81d4e2e-bcf2-11e6-869b-7df92533d2db', 'pending', 'L-1004', 'Desert Shipping Co.', 'Robert Lee', '555-456-7890', 'robert@desertshipping.com', '432 Warehouse Way', 'Denver', 'CO', '80201', 39.7392, -104.9903, '765 Delivery Drive', 'Santa Fe', 'NM', '87501', 35.6870, -105.9378, '2025-05-05 08:00:00', '2025-05-06 17:00:00', NULL, NULL, 'Food Products', 18000.00, 3500.00, 412, 'Refrigerated load, maintain at 38°F', NOW(), NOW()),
('a81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, NULL, NULL, 'pending', 'L-1005', 'Mountain Transport', 'Susan Miller', '555-234-5678', 'susan@mountaintransport.com', '987 Pickup Place', 'Salt Lake City', 'UT', '84101', 40.7608, -111.8910, '654 Delivery Road', 'Las Vegas', 'NV', '89101', 36.1699, -115.1398, '2025-05-07 07:00:00', '2025-05-08 13:00:00', NULL, NULL, 'Retail Goods', 16000.00, 2900.00, 421, 'Needs assignment', NOW(), NOW());

-- Documents
INSERT INTO documents (id, company_id, driver_id, vehicle_id, load_id, type, name, file_url, file_type, file_size, notes, created_at, updated_at)
VALUES
('b81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'a81d4e2e-bcf2-11e6-869b-7df92533d2db', 'BOL', 'BOL_L-1001.pdf', 'https://example.com/documents/BOL_L-1001.pdf', 'application/pdf', 1024, 'Bill of Lading for load L-1001', NOW(), NOW()),
('b81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dd', NULL, 'a81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'POD', 'POD_L-1003.pdf', 'https://example.com/documents/POD_L-1003.pdf', 'application/pdf', 2048, 'Proof of Delivery for load L-1003', NOW(), NOW()),
('b81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'registration', 'T-101_Registration.pdf', 'https://example.com/documents/T-101_Registration.pdf', 'application/pdf', 1536, 'Vehicle registration for T-101', NOW(), NOW()),
('b81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, NULL, 'license', 'John_Smith_CDL.pdf', 'https://example.com/documents/John_Smith_CDL.pdf', 'application/pdf', 1280, 'Commercial driver license for John Smith', NOW(), NOW()),
('b81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, NULL, NULL, 'insurance', 'Liability_Insurance_2025.pdf', 'https://example.com/documents/Liability_Insurance_2025.pdf', 'application/pdf', 3072, 'Company liability insurance policy', NOW(), NOW());

-- Inspections
INSERT INTO inspections (id, company_id, vehicle_id, driver_id, type, status, date, location, notes, defects, created_at, updated_at)
VALUES
('c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2db', 'pre-trip', 'passed', '2025-04-30 06:30:00', 'Company Yard', 'All systems normal', '[]', NOW(), NOW()),
('c81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'DOT', 'passed', '2025-04-15 13:45:00', 'I-10 Mile Marker 162', 'Routine DOT inspection', '[]', NOW(), NOW()),
('c81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'post-trip', 'failed', '2025-04-29 18:15:00', 'Company Yard', 'Brake light issue identified', '[{"component": "brake_lights", "description": "Right brake light not functioning", "severity": "medium"}]', NOW(), NOW()),
('c81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2de', 'f81d4e2e-bcf2-11e6-869b-7df92533d2de', 'annual', 'passed', '2025-03-10 09:00:00', 'Certified Inspection Center', 'Annual inspection completed', '[]', NOW(), NOW()),
('c81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'e81d4e2e-bcf2-11e6-869b-7df92533d2db', NULL, 'pre-trip', 'passed', '2025-05-01 05:45:00', 'Company Yard', 'Trailer inspection before load L-1001', '[]', NOW(), NOW());

-- Maintenance Records
INSERT INTO maintenance_records (id, company_id, vehicle_id, type, status, description, odometer, cost, vendor, completed_date, scheduled_date, notes, created_at, updated_at)
VALUES
('g81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', 'preventive', 'completed', 'Oil change and filter replacement', 120000, 350.00, 'FleetCare Service Center', '2025-04-20 14:30:00', '2025-04-20 13:00:00', 'Used synthetic oil', NOW(), NOW()),
('g81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'repair', 'completed', 'Replace air filter and cabin filter', 95000, 280.00, 'FleetCare Service Center', '2025-04-15 11:00:00', '2025-04-15 10:00:00', 'Routine replacement', NOW(), NOW()),
('g81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2de', 'repair', 'in_progress', 'Transmission fluid leak repair', 208000, 1200.00, 'Truck Repair Specialists', NULL, '2025-05-02 09:00:00', 'Parts on order, estimated completion in 2 days', NOW(), NOW()),
('g81d4e2e-bcf2-11e6-869b-7df92533d2de', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'preventive', 'scheduled', '50,000 mile service', 45000, 850.00, 'FleetCare Service Center', NULL, '2025-05-10 08:00:00', 'Comprehensive service including all fluids and filters', NOW(), NOW()),
('g81d4e2e-bcf2-11e6-869b-7df92533d2df', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'e81d4e2e-bcf2-11e6-869b-7df92533d2de', 'repair', 'scheduled', 'Replace worn brake pads', NULL, 450.00, 'Trailer Repair Shop', NULL, '2025-05-05 13:00:00', 'Scheduled during non-use period', NOW(), NOW());

-- IFTA Trips
INSERT INTO ifta_trips (id, company_id, vehicle_id, driver_id, load_id, start_date, end_date, start_odometer, end_odometer, total_miles, jurisdiction_data, fuel_purchases, created_at, updated_at)
VALUES
('h81d4e2e-bcf2-11e6-869b-7df92533d2db', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2db', 'f81d4e2e-bcf2-11e6-869b-7df92533d2db', 'a81d4e2e-bcf2-11e6-869b-7df92533d2db', '2025-05-01 08:00:00', '2025-05-02 14:00:00', 125000, 125267, 267.00, '{"TX": 85, "NM": 182}', '[{"date": "2025-05-01 12:30:00", "location": "Las Cruces, NM", "gallons": 120, "cost": 480.00, "state": "NM"}]', NOW(), NOW()),
('h81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dc', 'a81d4e2e-bcf2-11e6-869b-7df92533d2dc', '2025-05-02 10:00:00', '2025-05-03 16:00:00', 98000, 98390, 390.00, '{"NM": 150, "AZ": 240}', '[{"date": "2025-05-02 14:00:00", "location": "Lordsburg, NM", "gallons": 100, "cost": 400.00, "state": "NM"}, {"date": "2025-05-03 10:00:00", "location": "Phoenix, AZ", "gallons": 80, "cost": 336.00, "state": "AZ"}]', NOW(), NOW()),
('h81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'c81d4e2e-bcf2-11e6-869b-7df92533d2db', 'd81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'f81d4e2e-bcf2-11e6-869b-7df92533d2dd', 'a81d4e2e-bcf2-11e6-869b-7df92533d2dd', '2025-04-28 09:00:00', '2025-04-29 15:00:00', 44683, 45000, 317.00, '{"AZ": 200, "NM": 50, "TX": 67}', '[{"date": "2025-04-28 12:00:00", "location": "Tucson, AZ", "gallons": 150, "cost": 630.00, "state": "AZ"}]', NOW(), NOW());
