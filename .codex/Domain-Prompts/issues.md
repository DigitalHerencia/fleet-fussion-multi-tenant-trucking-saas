Here are PowerShell commands for the GitHub CLI (`gh issue create`) to generate main issues (epics) for each domain, with sub-issues as checklists, using your automation conventions. Each issue references the relevant wiki path, uses the correct labels, milestone, and assignment, and is ready for your project board and PR workflow.

---

### 1. Admin Domain

```powershell
gh issue create `
  --title "🚨 [Feature] Implement Admin Domain Core Features" `
  --body @"
## Domain: Admin
**Epic**: Admin Domain MVP  
**Priority**: High  
**Estimated Effort**: XL

### Description
Implement the complete Admin domain for system administration and organization management.

### Sub-Issues
- [ ] Create main admin page route (`app/(tenant)/[orgId]/admin/page.tsx`)
- [ ] Integrate multi-tab dashboard (Overview, Users, Billing, Audit, Settings)
- [ ] Implement user management interface (CRUD, role assignment, bulk ops)
- [ ] Add organization statistics and system health monitoring
- [ ] Build audit log viewer with filtering
- [ ] RBAC enforcement (admin role required)
- [ ] Mobile-responsive design
- [ ] Integrate with `features/admin/AdminDashboard.tsx` and user components
- [ ] Add comprehensive audit logging
- [ ] Documentation: [Admin Domain Prompt](.github/wiki/Admin-Domain.md)
- [ ] Reference: [Architecture](.github/wiki/Architecture.md), [Domains](.github/wiki/Domains.md), [API](.github/wiki/API-Documentation.md)

### Acceptance Criteria
- [ ] All admin tabs functional and protected by RBAC
- [ ] All features integrated and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
Feature, Codex, Priority-High

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-medium `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"
  
gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url  
```

---

### 2. Analytics Domain

```powershell
$issue_url = gh issue create `
  --title "📊 [Feature] Enhance Analytics Domain with Advanced BI" `
  --body @"
## Domain: Analytics
**Epic**: Analytics Domain Enhancement  
**Priority**: Medium  
**Estimated Effort**: L

### Description
Enhance the Analytics domain to provide advanced business intelligence and real-time insights.

### Sub-Issues
- [ ] Add advanced filtering and custom date range picker
- [ ] Implement export/reporting (PDF, CSV, scheduled reports)
- [ ] Integrate real-time dashboard updates (WebSocket)
- [ ] Add advanced visualizations (drill-down, maps, forecasting)
- [ ] Optimize for mobile (touch, offline, PWA)
- [ ] Documentation: [Analytics Domain Prompt](.github/wiki/Analytics-Domain.md)
- [ ] Reference: [API](.github/wiki/API-Documentation.md), [Component Library](.github/wiki/Component-Library.md)

### Acceptance Criteria
- [ ] Real-time dashboard, advanced export, predictive analytics
- [ ] All features tested and documented
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-medium

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-medium `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 3. Compliance Domain

```powershell
$issue_url = gh issue create `
  --title "📋 [Feature] Complete Compliance Management Features" `
  --body @"
## Domain: Compliance
**Epic**: Compliance Domain Completion  
**Priority**: High  
**Estimated Effort**: L

### Description
Complete the Compliance domain for comprehensive regulatory compliance management.

### Sub-Issues
- [ ] Complete document upload and versioning
- [ ] Implement automated compliance alerts and monitoring
- [ ] Add DOT inspection management and analytics
- [ ] Build advanced compliance reporting and dashboards
- [ ] Mobile compliance tools (upload, field checks)
- [ ] Documentation: [Compliance Domain Prompt](.github/wiki/Compliance-Domain.md)
- [ ] Reference: [API](.github/wiki/API-Documentation.md), [Testing](.github/wiki/Testing-Strategy.md)

### Acceptance Criteria
- [ ] Document upload, alerts, DOT management, reporting
- [ ] All features tested and documented
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 4. Cross-Domain Integration

```powershell
$issue_url = gh issue create `
  --title "🔗 [Feature] Implement Cross-Domain Integration & UX" `
  --body @"
## Domain: Cross-Domain
**Epic**: Cross-Domain Integration  
**Priority**: High  
**Estimated Effort**: L

### Description
Ensure seamless integration between all domains and create a unified user experience.

### Sub-Issues
- [ ] Unified navigation and role-based menu visibility
- [ ] Cross-domain data sharing and unified export
- [ ] Integrated reporting and real-time sync
- [ ] Unified notification center and alerting
- [ ] System-wide audit logging and security monitoring
- [ ] Performance optimization (caching, CDN, progressive loading)
- [ ] Documentation: [Cross-Domain Prompt](.github/wiki/Cross-Domain.md)
- [ ] Reference: [Architecture](.github/wiki/Architecture.md), [Design System](.github/wiki/Design-System.md)

### Acceptance Criteria
- [ ] Seamless navigation, unified data, optimized performance
- [ ] All features tested and documented
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 5. Dashboard Domain

```powershell
$issue_url = gh issue create `
  --title "📊 [Feature] Implement Multi-Role Dashboard & KPIs" `
  --body @"
## Domain: Dashboard
**Epic**: Dashboard MVP  
**Priority**: High  
**Estimated Effort**: XL

### Description
Implement the Dashboard domain as the central hub for all fleet operations.

### Sub-Issues
- [ ] Build multi-role dashboard layout (Admin, Dispatcher, Driver, etc.)
- [ ] Implement KPI widgets (fleet, loads, drivers, vehicles, compliance)
- [ ] Add quick actions and real-time updates
- [ ] Integrate activity feed and notifications
- [ ] RBAC/ABAC permissions and org isolation
- [ ] Responsive design and error boundaries
- [ ] Documentation: [Dashboard Domain Prompt](.github/wiki/Dashboard-Domain.md)
- [ ] Reference: [Dashboard Guide](.github/wiki/Dashboard-Guide.md), [Types](.github/wiki/Types.md)

### Acceptance Criteria
- [ ] All dashboard features functional and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 6. Dispatch Domain

```powershell
$issue_url = gh issue create `
  --title "🚦 [Feature] Enhance Dispatch Board & Load Management" `
  --body @"
## Domain: Dispatch
**Epic**: Dispatch Domain Enhancement  
**Priority**: High  
**Estimated Effort**: XL

### Description
Enhance the Dispatch domain for load management, assignment, and real-time tracking.

### Sub-Issues
- [ ] Improve load management and status tracking
- [ ] Enhance driver/vehicle assignment workflows
- [ ] Build advanced dispatch board (drag-and-drop, real-time)
- [ ] Integrate route optimization and notifications
- [ ] Document management for loads
- [ ] Mobile app support for drivers
- [ ] Documentation: [Dispatch Domain Prompt](.github/wiki/Dispatch-Domain.md)
- [ ] Reference: [API](.github/wiki/API-Documentation.md), [Testing](.github/wiki/Testing-Strategy.md)

### Acceptance Criteria
- [ ] All dispatch features functional and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 7. Drivers Domain

```powershell
$issue_url = gh issue create `
  --title "👨‍✈️ [Feature] Complete Driver Lifecycle & Compliance" `
  --body @"
## Domain: Drivers
**Epic**: Drivers Domain Completion  
**Priority**: High  
**Estimated Effort**: L

### Description
Complete the Drivers domain for onboarding, compliance, and performance tracking.

### Sub-Issues
- [ ] Implement driver onboarding and profile management
- [ ] Add licensing and HOS compliance tracking
- [ ] Build assignment management and analytics
- [ ] Integrate real-time status and notifications
- [ ] Mobile driver app and ELD integration
- [ ] Documentation: [Drivers Domain Prompt](.github/wiki/Drivers-Domain.md)
- [ ] Reference: [Types](.github/wiki/Types.md), [Testing](.github/wiki/Testing-Strategy.md)

### Acceptance Criteria
- [ ] All driver features functional and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 8. IFTA Domain

```powershell
$issue_url = gh issue create `
  --title "⛽ [Feature] Finalize IFTA Reporting & Tax Automation" `
  --body @"
## Domain: IFTA
**Epic**: IFTA Domain Completion  
**Priority**: Medium  
**Estimated Effort**: M

### Description
Complete the IFTA domain for comprehensive fuel tax reporting and compliance.

### Sub-Issues
- [ ] Implement PDF report generation (quarterly, trip, fuel summary)
- [ ] Automate tax calculations and jurisdiction rate management
- [ ] Build tax rate manager component and audit trail
- [ ] Integrate with official data sources and validation
- [ ] Documentation: [IFTA Domain Prompt](.github/wiki/IFTA-Domain.md)
- [ ] Reference: [API](.github/wiki/API-Documentation.md), [Types](.github/wiki/Types.md)

### Acceptance Criteria
- [ ] All IFTA features functional and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-medium

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-medium `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

### 9. Settings Domain

```powershell
$issue_url = gh issue create `
  --title "⚙️ [Feature] Complete Organization & User Settings" `
  --body @"
## Domain: Settings
**Epic**: Settings Domain Completion  
**Priority**: High  
**Estimated Effort**: L

### Description
Complete the Settings domain for organization and user configuration management.

### Sub-Issues
- [ ] Build multi-tab settings page (Org, User, Notifications, Integrations, Billing)
- [ ] Implement server actions for all settings types
- [ ] Add audit trail, export/import, and reset functionality
- [ ] Role-based tab visibility and real-time validation
- [ ] Documentation: [Settings Domain Prompt](.github/wiki/Setting-Domain.md)
- [ ] Reference: [Types](.github/wiki/Types.md), [API](.github/wiki/API-Documentation.md)

### Acceptance Criteria
- [ ] All settings features functional and tested
- [ ] Project board: https://github.com/users/DigitalHerencia/projects/4

### Milestone
MVP Launch

### Labels
feature, codex, priority-high

### Assignment
DigitalHerencia

---
"@ `
  --label feature `
  --label codex `
  --label priority-high `
  --assignee "DigitalHerencia" `
  --milestone "MVP Launch" `
  --json url --jq ".url"

gh project item-add https://github.com/users/DigitalHerencia/projects/4 --url $issue_url
```

---

**Instructions:**  
- Run each command in PowerShell to create the issues.
- Each issue is ready for your project board, automation, and PR workflow.
- Sub-issues are checklists for tracking and can be split into separate issues as needed.
- All issues reference the relevant `.github/wiki/*` documentation for context and requirements.

Let me know if you want the sub-issues as separate `gh issue create` commands or need further breakdowns!