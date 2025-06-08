---
id: 7jzabkmdv660mxopnk2r3fx
title: Tables
desc: ''
updated: 1748311039306
created: 1748310570814
---

## compliance_documents

| Field             | Type         | Nullable |
|-------------------|--------------|----------|
| id                | text         | not null |
| organization_id   | text         | not null |
| driver_id         | text         | null     |
| vehicle_id        | text         | null     |
| type              | text         | not null |
| title             | text         | not null |
| document_number   | text         | null     |
| issuing_authority | text         | null     |
| file_url          | text         | null     |
| file_name         | text         | null     |
| file_size         | int4         | null     |
| mime_type         | text         | null     |
| issue_date        | date         | null     |
| expiration_date   | date         | null     |
| status            | text         | not null |
| is_verified       | bool         | null     |
| verified_by       | text         | null     |
| verified_at       | timestamp    | null     |
| notes             | text         | null     |
| tags              | jsonb        | null     |
| created_at        | timestamp    | not null |
| updated_at        | timestamp    | not null |

## loads

| Field                | Type            | Nullable |
|----------------------|-----------------|----------|
| id                   | text            | not null |
| organization_id      | text            | not null |
| driver_id            | text            | null     |
| vehicle_id           | text            | null     |
| trailer_id           | text            | null     |
| load_number          | text            | not null |
| reference_number     | text            | null     |
| status               | LoadStatus      | not null |
| customer_name        | text            | null     |
| customer_contact     | text            | null     |
| customer_phone       | text            | null     |
| customer_email       | text            | null     |
| origin_address       | text            | not null |
| origin_city          | text            | not null |
| origin_state         | text            | not null |
| origin_zip           | text            | not null |
| origin_lat           | numeric(10,6)   | null     |
| origin_lng           | numeric(10,6)   | null     |
| destination_address  | text            | not null |
| destination_city     | text            | not null |
| destination_state    | text            | not null |
| destination_zip      | text            | not null |
| destination_lat      | numeric(10,6)   | null     |
| destination_lng      | numeric(10,6)   | null     |
| rate                 | numeric(10,2)   | null     |
| currency             | text            | null     |
| scheduled_pickup_date| timestamp       | null     |
| actual_pickup_date   | timestamp       | null     |
| scheduled_delivery_date| timestamp     | null     |
| actual_delivery_date | timestamp       | null     |
| weight               | int4            | null     |
| pieces               | int4            | null     |
| commodity            | text            | null     |
| hazmat               | bool            | null     |
| estimated_miles      | int4            | null     |
| actual_miles         | int4            | null     |
| notes                | text            | null     |
| instructions         | text            | null     |
| custom_fields        | jsonb           | null     |
| created_at           | timestamp       | not null |
| updated_at           | timestamp       | not null |

## audit_logs

| Field           | Type      | Nullable |
|-----------------|-----------|----------|
| id              | text      | not null |
| organization_id | text      | not null |
| user_id         | text      | null     |
| entity_type     | text      | not null |
| entity_id       | text      | not null |
| action          | text      | not null |
| changes         | jsonb     | null     |
| metadata        | jsonb     | null     |
| timestamp       | timestamp | not null |

## drivers

| Field                | Type         | Nullable |
|----------------------|--------------|----------|
| id                   | text         | not null |
| organization_id      | text         | not null |
| user_id              | text         | null     |
| employee_id          | text         | null     |
| first_name           | text         | not null |
| last_name            | text         | not null |
| email                | text         | null     |
| phone                | text         | null     |
| address              | text         | null     |
| city                 | text         | null     |
| state                | text         | null     |
| zip                  | text         | null     |
| license_number       | text         | null     |
| license_state        | text         | null     |
| license_class        | text         | null     |
| license_expiration   | date         | null     |
| medical_card_exp     | date         | null     |
| drug_test_date       | date         | null     |
| background_check     | date         | null     |
| hire_date            | date         | null     |
| termination_date     | date         | null     |
| status               | DriverStatus | not null |
| emergency_contact_1  | text         | null     |
| emergency_contact_2  | text         | null     |
| emergency_contact_3  | text         | null     |
| notes                | text         | null     |
| custom_fields        | jsonb        | null     |
| created_at           | timestamp    | not null |
| updated_at           | timestamp    | not null |

## ifta_reports

| Field             | Type          | Nullable |
|-------------------|---------------|----------|
| id                | text          | not null |
| organization_id   | text          | not null |
| quarter           | int4          | not null |
| year              | int4          | not null |
| status            | text          | not null |
| total_miles       | int4          | null     |
| total_gallons     | numeric(10,3) | null     |
| total_tax_owed    | numeric(10,2) | null     |
| total_tax_paid    | numeric(10,2) | null     |
| submitted_at      | timestamp     | null     |
| submitted_by      | text          | null     |
| due_date          | date          | null     |
| filed_date        | date          | null     |
| report_file_url   | text          | null     |
| supporting_docs   | text          | null     |
| notes             | text          | null     |
| calculation_data  | jsonb         | null     |
| created_at        | timestamp     | not null |
| updated_at        | timestamp     | not null |

## users

| Field              | Type        | Nullable |
|--------------------|-------------|----------|
| id                 | text        | not null |
| clerk_id           | text        | not null |
| organization_id    | text        | not null |
| email              | text        | not null |
| first_name         | text        | null     |
| last_name          | text        | null     |
| profile_image      | text        | null     |
| role               | UserRole    | not null |
| permissions        | jsonb       | null     |
| is_active          | bool        | not null |
| onboarding_complete| bool        | not null |
| last_login         | timestamp   | null     |
| created_at         | timestamp   | not null |
| updated_at         | timestamp   | not null |
| onboarding_steps   | jsonb       | null     |

## vehicles

| Field                | Type         | Nullable |
|----------------------|--------------|----------|
| id                   | text         | not null |
| organization_id      | text         | not null |
| type                 | text         | not null |
| status               | VehicleStatus| not null |
| make                 | text         | null     |
| model                | text         | null     |
| year                 | int4         | null     |
| vin                  | text         | null     |
| license_plate        | text         | null     |
| license_plate_state  | text         | null     |
| unit_number          | text         | not null |
| current_odometer     | int4         | null     |
| last_odometer_update | timestamp    | null     |
| fuel_type            | text         | null     |
| last_inspection_date | date         | null     |
| next_inspection_date | date         | null     |
| insurance_expiration | date         | null     |
| registration_expiry  | date         | null     |
| notes                | text         | null     |
| custom_fields        | jsonb        | null     |
| created_at           | timestamp    | not null |
| updated_at           | timestamp    | not null |


## organizations

| Field               | Type                | Nullable |
|---------------------|---------------------|----------|
| id                  | text                | not null |
| clerk_id            | text                | not null |
| name                | text                | not null |
| slug                | text                | not null |
| dot_number          | text                | null     |
| mc_number           | text                | null     |
| address             | text                | null     |
| city                | text                | null     |
| state               | text                | null     |
| zip                 | text                | null     |
| phone               | text                | null     |
| email               | text                | null     |
| logo_url            | text                | null     |
| subscription_tier   | SubscriptionTier    | not null |
| subscription_status | SubscriptionStatus  | not null |
| max_users           | int4                | not null |
| billing_email       | text                | null     |
| settings            | jsonb               | null     |
| is_active           | bool                | not null |
| created_at          | timestamp           | not null |
| updated_at          | timestamp           | not null |

## webhook_events

| Field            | Type      | Nullable |
|------------------|-----------|----------|
| id               | text      | not null |
| event_type       | text      | not null |
| event_id         | text      | not null |
| organization_id  | text      | null     |
| user_id          | text      | null     |
| payload          | jsonb     | not null |
| status           | text      | not null |
| processing_error | text      | null     |
| processed_at     | timestamp | null     |
| created_at       | timestamp | not null |
| retry_count      | int4      | not null |