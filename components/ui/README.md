# UI Components

This directory contains reusable UI components built with React and Tailwind CSS. Components are designed to be composable, accessible, and theme-aware.

## Structure
- Each file exports a single component or a set of related subcomponents.
- Components use Radix UI primitives and utility functions from `/lib/utils`.

## Example Components
- `button.tsx`: Button component with variants
- `sheet.tsx`: Sliding panel (Sheet) component using Radix Dialog
- `table.tsx`: Table primitives for consistent data display

## Usage
Import components as needed in feature modules or pages:

```tsx
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
```

## Best Practices
- Prefer composition over inheritance
- Use Tailwind utility classes for styling
- Document props and usage for complex components

---
See the main project [README](../../README.md) for more details.
