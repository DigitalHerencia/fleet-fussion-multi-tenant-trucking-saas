# Component Library

FleetFusion's design system and component library built on Tailwind CSS and shadcn/ui components.

## Table of Contents

- [Design System](#design-system)
- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Content Components](#content-components)
- [Form Components](#form-components)
- [UI Components](#ui-components)
- [Styling Guidelines](#styling-guidelines)

## Design System

### Color Palette

- **Primary**: Blue (`blue-500`, `blue-800`)
- **Background**: Black (`black`, `bg-black`)
- **Text**: White (`text-white`, `text-white/90`)
- **Muted**: Gray (`text-muted-foreground`)
- **Accent Colors**: Purple (`purple-500`), Green, Orange for feature categorization

### Typography

- **Font Family**: Inter (primary), Playfair (accent)
- **Scale**:
  - `text-xs` (footer)
  - `text-sm` (navigation, descriptions)
  - `text-lg` (feature titles)
  - `text-xl` (pricing plans)
  - `text-2xl` (logo)
  - `text-3xl` (section headlines)
  - `text-4xl md:text-5xl` (hero headline)

### Spacing System

- **Padding**: `px-4`, `py-2`, `p-4`, `p-8`
- **Margins**: `mt-8`, `mb-2`, `mb-6`
- **Gaps**: `gap-6`, `gap-8`, `space-y-2`, `space-y-4`

### Border Radius

- **Small**: `rounded-lg` (buttons, cards)
- **Large**: `rounded-2xl` (pricing cards)

## Layout Components

### Page Container

```tsx
<div className="flex min-h-screen flex-col">
  {/* Navigation */}
  {/* Main Content */}
  {/* Footer */}
</div>
```

### Section Container

```tsx
<section className="w-full py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6">{/* Section Content */}</div>
</section>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">{/* Grid Items */}</div>
```

## Navigation Components

### Primary Navigation

```tsx
<header className="sticky top-0 z-30 flex h-16 items-center border-b bg-black px-4 lg:px-6">
  {/* Logo */}
  <div className="flex items-center gap-2">
    <MapPinned className="text-blue-500" />
    <span className="text-2xl font-extrabold text-white underline-offset-4 hover:text-blue-500 hover:underline">
      FleetFusion
    </span>
  </div>

  {/* Navigation Links */}
  <nav className="ml-auto flex gap-6">
    <a className="text-sm font-medium text-white underline-offset-4 hover:text-blue-500 hover:underline">
      Features
    </a>
    <a className="text-sm font-medium text-white underline-offset-4 hover:text-blue-500 hover:underline">
      Pricing
    </a>
    <a className="text-sm font-medium text-white underline-offset-4 hover:text-blue-500 hover:underline">
      About
    </a>
    <button className="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-800">
      Sign In
    </button>
  </nav>
</header>
```

### Footer

```tsx
<footer className="text-muted-foreground flex items-center justify-between bg-black px-4 py-6 text-xs">
  <p>&copy; 2024 FleetFusion. All rights reserved.</p>
  <div className="flex gap-4">
    <a href="#" className="hover:underline">
      Privacy
    </a>
    <a href="#" className="hover:underline">
      Terms
    </a>
  </div>
</footer>
```

## Content Components

### Hero Section

```tsx
<section className="relative w-full overflow-hidden py-12 md:py-24 lg:min-h-[600px] lg:py-0 xl:min-h-[700px] xl:py-0 2xl:min-h-[800px]">
  {/* Background Image */}
  <div className="absolute inset-0 z-0 hidden h-full w-full lg:block">
    <img
      src="/landing_hero.png"
      alt="Hero"
      className="h-full w-full object-cover object-right-bottom"
    />
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/20"></div>

  {/* Content */}
  <div className="relative z-10 container flex min-h-[400px] items-center px-4 md:px-6 lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        Fleet Management Made Simple
      </h1>
      <p className="text-lg text-white/90 md:text-xl">
        Streamline your operations with comprehensive fleet management
      </p>
      <button className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-800">
        Start Free 30-Day Trial
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </div>
</section>
```

### Feature Card

```tsx
<div className="border-muted flex flex-col items-center space-y-2 rounded-lg border bg-black p-4 text-center">
  <div className="mb-2 text-purple-500">
    <BarChart className="h-8 w-8" />
  </div>
  <h3 className="text-lg font-semibold text-white">Analytics & Reporting</h3>
  <p className="text-muted-foreground text-sm">
    Comprehensive analytics and detailed reporting capabilities
  </p>
</div>
```

### Pricing Card

```tsx
<div className="relative flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg">
  {/* Highlight Ring (for featured plans) */}
  <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-200 dark:ring-blue-900"></div>

  <h3 className="mb-4 text-xl font-bold">Growth</h3>
  <div className="mb-6 text-3xl font-bold text-blue-500">$49/month</div>

  <ul className="mb-6 space-y-2">
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-blue-500" />
      <span className="text-sm">Up to 50 vehicles</span>
    </li>
    {/* More features */}
  </ul>

  <button className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-800">
    Get Started
  </button>
</div>
```

## Form Components

### Button Variants

```tsx
// Primary Button
<button className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-800">
  Primary Action
</button>

// Secondary Button
<button className="border border-blue-500 text-blue-500 font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 hover:text-white">
  Secondary Action
</button>

// Ghost Button
<button className="text-blue-500 font-semibold py-2 px-6 rounded-lg hover:bg-blue-500/10">
  Ghost Action
</button>
```

### Input Fields

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-white">Email</label>
  <input
    type="email"
    className="border-muted w-full rounded-lg border bg-black px-3 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
    placeholder="Enter your email"
  />
</div>
```

## UI Components

### Card Component

```tsx
<div className="border-muted rounded-lg border bg-black p-6">
  <h3 className="mb-2 text-lg font-semibold text-white">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
```

### Badge Component

```tsx
<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
  New Feature
</span>
```

### Loading Spinner

```tsx
<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
```

## Styling Guidelines

### Responsive Design

- **Mobile First**: Start with mobile styles, add larger screen styles with `md:`, `lg:`, `xl:`
  prefixes
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

### Dark Theme Support

```tsx
// Use dark mode variants
<div className="bg-white text-black dark:bg-black dark:text-white">
  Content that adapts to theme
</div>
```

### Accessibility

- Use semantic HTML elements
- Ensure sufficient color contrast
- Provide focus states for interactive elements
- Include ARIA labels where needed

### Animation Guidelines

- Use `transition-colors` for color changes
- Use `hover:` states for interactive feedback
- Keep animations subtle and purposeful
- Consider `prefers-reduced-motion` for accessibility

## Component Architecture

### Base Components

Located in `/components/ui/` - shadcn/ui components with custom styling

### Feature Components

Located in `/components/` - Application-specific components built on base components

### Layout Components

Located in `/components/layout/` - Page structure and navigation components

### Styling Approach

- Tailwind CSS utility classes for styling
- CSS variables for theme values
- Component variants using `class-variance-authority`
- Consistent spacing and typography scale

This component library ensures consistent, accessible, and maintainable UI across the FleetFusion
application while providing flexibility for future enhancements.
