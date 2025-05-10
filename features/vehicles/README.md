# Vehicle Feature

This directory contains components and logic for vehicle management, including document uploads, vehicle forms, and related utilities.

## Key Files
- `VehicleDocuments.tsx`: Component for uploading, listing, and previewing vehicle-specific documents.
- `VehicleForm.tsx`: Form for creating or editing vehicle records.

## Responsibilities
- Manage vehicle document lifecycle (upload, preview, download)
- Integrate with backend actions for vehicle document storage
- Provide UI for vehicle document status

## Related Modules
- `/lib/actions/document-actions.ts`: Server actions for document CRUD
- `/lib/fetchers/documents.ts`: Fetchers for vehicle document data
- `/db/schema.ts`: Database schema for vehicles and documents

---
See the main project [README](../../README.md) for architecture and best practices.
