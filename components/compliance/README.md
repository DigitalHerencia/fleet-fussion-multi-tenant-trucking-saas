# Compliance Feature

This directory contains components and logic related to compliance management, including document uploads, compliance dashboards, and related utilities.

## Key Files
- `ComplianceDocuments.tsx`: React component for listing, searching, uploading, and previewing compliance documents.
- `ComplianceForm.tsx`: Form for creating or editing compliance records.

## Responsibilities
- Manage compliance document lifecycle (upload, preview, filter, download)
- Integrate with backend actions for document storage and retrieval
- Provide UI for compliance status and alerts

## Related Modules
- `/lib/actions/compliance-actions.ts`: Server actions for compliance document CRUD
- `/lib/fetchers/compliance-documents.ts`: Fetchers for compliance document data
- `/db/schema.ts`: Database schema for compliance documents

---
See the main project [README](../../README.md) for architecture and best practices.
