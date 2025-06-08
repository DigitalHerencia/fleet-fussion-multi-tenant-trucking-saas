---
id: hghxqyfz2df3ba4zbapkyk1
title: Prompts
desc: ''
updated: 1748643305990
created: 1748633363942
---

# TODO for Agent Mode Prompting

1. **Create a Staged Approach**:

   - Begin with: "Using the refactor plan in FleetFusion.Context.Refactor.md, help me implement
     Stage 1: Normalizing the file structure"
   - Progress through each section (2.2 Refactor Task List) in order

2. **Request Specific File Consolidation**:

   - Example: "Help me merge `driver-actions.ts` into `driverActions.ts` as specified in section 2.2
     of the refactor plan"
   - Ask for specific import path updates after each consolidation

3. **Request Validation Checks**:

   - After completing sections, ask: "What validation checks should I perform to ensure this stage
     of the refactor was successful?"

4. **Track Progress**:

   - Keep a checklist of completed tasks from section 2.2
   - Ask the agent to update this checklist as tasks are completed

5. **Handle Edge Cases**:

   - Request: "What potential conflicts or issues should I watch for when consolidating (specific
     files)?"

6. **Request Test Coverage Guidance**:
   - Ask: "What tests should I write/run to verify the refactored (component/section) works as
     expected?"

# Prompt for Agent Mode

**Task**

A Staged Approach:

- Using the refactor plan in FleetFusion.Context.Refactor.md, help me implement each step by
  progressing incrementally through each section in order

**Tools and Resources**

Context:

- .notes\notes\FleetFusion.Context.Refactor.md
- .notes\notes\FleetFusion.Context.CodeCurrent.md
- .notes\notes\FleetFusion.Context.CodeFuture (1).md MCP Server Tools:
- neon
- clerk
- git
- github
- filesystem
- playwright DB:
- name: FleetFusion
- driver: postgres
- neon: ep-tight-field-a6w2fjkw-pooler.us-west-2.aws.neon.tech

**Specifications**

Document the following in this file: .notes\notes\FleetFusion.Context.Progress.md

- Track progress of the refactor
- Recommend Validation Checks
- Provide Testing Strategies

**Response Formatting**

Apply Edits to Specified Files:

- Match the new structure for each file that needs to be moved or consolidated.
- Ensure all import paths and references are updated.
- Group changes to files by domain or feature.
- Briefly describe the steps and the changes made.
- Start each file with a comment containing the filepath.
- Use `// ...delete...` to indicate files that need to be deleted.
- Do not repeat code redundantly and deduplicate thoroughly.
- Clearly indicate changes you've made and their intended functionality.
