# Database Schema

This directory contains the Drizzle ORM schema definitions for all database tables used in FleetFusion.

## Key File

- `schema.ts`: Main schema file defining all tables, relations, and field types for the application.

## Schema Overview

- **Multi-tenancy:** All major tables reference `companyId` for data isolation.
- **Relations:** Uses Drizzle's `relations()` to define foreign keys and associations.
- **Timestamps:** Most tables include `createdAt` and `updatedAt` fields.

## Main Tables

- `companies`: Company/tenant information
- `company_users`: User membership and roles per company
- `vehicles`, `drivers`, `loads`: Core fleet management entities
- `documents`, `compliance_documents`: File/document storage and compliance tracking
- `hos_logs`, `inspections`, `maintenance_records`: Compliance and operational records

## Best Practices

- Use UUIDs for primary keys
- Use `onDelete: "cascade"` for dependent records (all major tables referencing `companyId` or other parent entities use this for multi-tenant data integrity; this is required for all future tables)
- Keep schema and relations in sync with business logic

---

See the main project [README](../README.md) for more details and best practices.
