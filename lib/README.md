# Lib Directory

This directory contains domain logic, server actions, fetchers, and utility functions for FleetFusion.

## Structure
- `actions/`: Server actions for CRUD and business logic
- `fetchers/`: Data fetching utilities for various modules
- `validation/`: Zod schemas for form and API validation
- `utils/`: General-purpose utility functions

## Usage
- Import fetchers and actions in feature modules and pages
- Use Zod schemas for validating all user input

## Best Practices
- Keep business logic in server actions, not components
- Use fetchers for all data access (no direct DB queries in components)
- Validate all data at the boundary (forms, API, actions)

---
See the main project [README](../README.md) for more details.
