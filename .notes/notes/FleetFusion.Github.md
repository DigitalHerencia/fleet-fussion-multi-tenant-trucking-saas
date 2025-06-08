---
id: ids2hss4pl9x5hk8ezw7od7
title: Github
desc: ''
updated: 1749350136182
created: 1749350128206
---
# GitHub CLI & PowerShell Automation for FleetFusion

This document provides ready-to-use GitHub CLI (`gh`) and PowerShell scripts for automating common repository management tasks: issues, pull requests, milestones, and labels.

## Issue Management

### Create a New Issue with Labels, Assignee, and Milestone
```bash
gh issue create -t "Implement X Feature" -b "We should implement X because..." \
  -l "Feature,Priority-Medium" -a @me --milestone "Q3 2025"
```

### Batch Label Issues (PowerShell)
```powershell
# Add "Blocked" label to all open issues with label "Feature"
$issues = gh issue list --label "Feature" --state open --json number | ConvertFrom-Json
foreach ($issue in $issues) {
    gh issue edit $($issue.number) --add-label "Blocked"
}
```

## Milestone Management

### Create a New Milestone (via API)
```bash
gh api -X POST /repos/<OWNER>/<REPO>/milestones -f title="Q4 2025" -f due_on="2025-12-31T23:59:59Z"
```

### Move Issues to a New Milestone (PowerShell)
```powershell
$oldMilestone = "Q3 2025"
$newMilestone = "Q4 2025"
$issues = gh issue list --milestone "$oldMilestone" --state open --json number | ConvertFrom-Json
foreach ($issue in $issues) {
    gh issue edit $($issue.number) --milestone $newMilestone
}
```

## Pull Request Automation

### Create a PR from Current Branch
```bash
gh pr create --fill --base main --head feature/my-new-feature
```

### Merge and Delete Branch
```bash
gh pr merge 42 --squash --delete-branch
```

## Label Management

### Create Standard Labels
```bash
gh label create "Priority-High" --color FF0000 --description "High priority issue"
gh label create "Priority-Medium" --color FFA500 --description "Medium priority issue"
gh label create "Priority-Low" --color 00AAFF --description "Low priority issue"
```

## Tips
- Use `gh issue list`, `gh pr list`, and `gh label list` to discover and filter items for automation.
- Combine CLI with PowerShell or Bash for advanced workflows.
- See the audit report for more advanced scripting ideas.
