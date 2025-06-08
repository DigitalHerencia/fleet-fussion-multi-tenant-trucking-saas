---
name: Documentation Task
about: Request docs updates or additions for FleetFusion
title: "[Documentation]"
labels: Codex, Documentation
assignees: DigitalHerencia

---

labels: ["Documentation"]
assignees: [DigitalHerencia]
body:
  - type: input
    id: summary
    attributes:
      label: "Documentation Summary"
      description: "What documentation needs to be created or updated?"
      placeholder: "Add API documentation for vehicle endpoints"
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: "Context & Location"
      description: "Where should this documentation live? What's the current state?"
      placeholder: |
        - Location: /docs/api/vehicles.md
        - Current state: Missing endpoint documentation
        - Related to: Vehicle management feature #123
    validations:
      required: true

  - type: dropdown
    id: doc_type
    attributes:
      label: "Documentation Type"
      description: "What kind of documentation is this?"
      options:
        - "API Documentation"
        - "User Guide"
        - "Developer Setup"
        - "Architecture"
        - "Deployment"
        - "Troubleshooting"
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: "Priority"
      description: "How urgent is this documentation?"
      options:
        - "Priority-Low"
        - "Priority-Medium"
        - "Priority-High"
    validations:
      required: true

  - type: dropdown
    id: milestone
    attributes:
      label: "Target Milestone"
      description: "When should this documentation be completed?"
      options:
        - "MVP Launch"
        - "Q3 2025 Release"
        - "Testing & Automation Hardening"
        - "Post-Launch Enhancements"
    validations:
      required: false
