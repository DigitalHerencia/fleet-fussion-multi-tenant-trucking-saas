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
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "../../components/ui/sheet"
```

## Button Component API

The `Button` component supports multiple variants and sizes for consistent UI. Use the `variant` and `size` props to control appearance.

| Prop      | Type     | Default   | Description                                      |
|-----------|----------|-----------|--------------------------------------------------|
| `variant` | string   | "default" | One of: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| `size`    | string   | "default" | One of: `default`, `sm`, `lg`, `icon`           |
| `asChild` | boolean  | false     | Render as child element (for custom wrappers)     |
| ...rest   | button props |         | All standard button props supported              |

### Examples

```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="icon" aria-label="Menu"><MenuIcon /></Button>
<Button asChild><a href="/docs">Docs Link</a></Button>
```

- Use `variant` and `size` for visual consistency.
- Use `asChild` to render a custom element (e.g., `<a>`, `<Link>`).
- All buttons are accessible and keyboard-friendly by default.

## Best Practices

- Prefer composition over inheritance
- Use Tailwind utility classes for styling
- Document props and usage for complex components
- Use the provided variants and sizes for all Button usages
- Avoid custom button styles outside the Button component

---

See the main project [README](../../README.md) for more details.
