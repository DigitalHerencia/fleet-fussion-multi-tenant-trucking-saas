---
id: byr66jux6e3fz7m3c7isajy
title: System
desc: ''
updated: 1748933084209
created: 1748893905216
---
# FleetFusion Style Analysis

Based on my examination of the provided files, here's a detailed breakdown of the styling elements used on the FleetFusion homepage:

## Typography System

### Fonts
- **Primary Font**: Inter (`--font-inter`) for body text
- **Secondary Font**: Playfair Display (`--font-playfair`) for headers
- **Font Weights**: Regular, Medium, Semibold, Bold, Extrabold

### Text Sizes
- Heading scales: `text-2xl` through `text-5xl`
- Body text: `text-sm`, `text-base`, `text-lg`, `text-xl`
- Line height variations: `md:text-5xl/tight`, `md:text-xl/relaxed`

## Color System

### Base Colors (from globals.css)
- Background: `--color-background: 240 10% 3.9%`
- Foreground: `--color-foreground: 0 0% 98%`
- Primary: `--color-primary: 217 91% 60%` (blue)

### Semantic Colors
- Primary: Blue (`text-blue-500`, `bg-blue-500`, `hover:bg-blue-800`)
- Feature icons: Green, Purple, Yellow, Red, Cyan (all at 500 weight)
- Text: White, muted variants (`text-white`, `text-white/90`, `text-muted-foreground`)
- Backgrounds: `bg-black`, `bg-white`, `bg-zinc-900` (in dark mode)
- Overlays: `bg-black/20`, `bg-black/70`, `bg-white/80`, `bg-zinc-900/20`

## Layout System

### Page Structure
- Main container: `flex flex-col min-h-screen`
- Header: `sticky top-0 z-30 h-16`
- Main content area: `flex-1`
- Full-width sections: `w-full`

### Containers & Grids 
- Container widths: `container`, `max-w-5xl`
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Flex patterns: `flex items-center`, `flex flex-col`, `flex justify-center`

### Responsive Breakpoints
- Mobile-first with breakpoints: `md:`, `lg:`, `xl:`, `2xl:`
- Responsive heights: `min-h-[400px]`, `lg:min-h-[600px]`, `xl:min-h-[700px]`, `2xl:min-h-[800px]`
- Responsive padding: `px-4 md:px-6`, `px-4 md:px-8 xl:px-32`

## Spacing System

### Padding
- Standard padding: `p-4`, `p-6`, `p-8`
- Horizontal padding: `px-4`, `px-6`, `px-8`
- Vertical padding: `py-2`, `py-12`, `py-24`, `py-32`
- Directional padding: `pl-6`, `pl-12`, `pl-20`

### Margins
- Standard bottom margins: `mb-2`, `mb-6`, `mb-8`, `mb-12`
- Standard top margins: `mt-4`, `mt-8`
- Auto margins: `mx-auto`

### Gaps
- Flex/grid gaps: `gap-2`, `gap-6`, `gap-8`, `gap-12`
- Vertical spacing: `space-y-2`, `space-y-4`

## Component Styles

### Cards & Containers
- Feature cards: `rounded-lg border p-4`
- Pricing plans: `rounded-2xl shadow-lg p-8`
- Highlighted plan: `ring-2 ring-blue-200 dark:ring-blue-900 scale-105 z-10`

### Buttons
- Primary: `bg-blue-500 hover:bg-blue-800 py-2 rounded-lg font-semibold text-white`
- Secondary: `bg-gray-500 hover:bg-blue-500`
- Button with icon: Contains `ArrowRight` icon with appropriate spacing

### Navigation
- Links: `hover:text-blue-500 hover:underline underline-offset-4`
- Nav button: `bg-blue-500 hover:bg-blue-800 text-white`

### Images
- Background images with overlay
- Responsive visibility: `hidden lg:block`
- Image styling: `object-cover object-center` or `object-right-bottom`

## Reusable Components

### UI Components
- `Button` from `@/components/ui/button` (ShadCN)
- `PublicNav` for site navigation
- `PricingSection` for pricing display
- `SharedFooter` for page footer

### Icons
- Lucide icons: `Truck`, `Shield`, `BarChart3`, `FileText`, `MapPin`, `Users`, `Calendar`, `CreditCard`, `ArrowRight`

## Effects & Visual Treatments

- Shadows: `shadow-lg`
- Borders: `border`, `border-muted`, `ring-2`
- Rounded corners: `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`
- Transitions: `transition-colors`, `transition-transform`
- Z-index layering: `z-0`, `z-10`, `z-30`

## Creating a Design System

Based on this analysis, you could create a modular design system in the styles directory with these components:

1. `typography.module.css` - Font families, sizes, weights, and line heights
2. `colors.module.css` - Color variables and theme definitions
3. `spacing.module.css` - Standard spacing rules for margin, padding, and gaps
4. `layout.module.css` - Grid systems, containers, and responsive rules
5. `components.module.css` - Base component styles (cards, buttons, etc.)
6. `effects.module.css` - Shadows, borders, animations, etc.
7. `index.css` - Main file that imports all modules

These could be imported into globals.css to create a comprehensive design system that maintains the current styling while making it more maintainable and consistent.