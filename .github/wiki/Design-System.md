# FleetFusion Design System

This document outlines the design system and UI components used throughout FleetFusion, providing a
comprehensive guide for maintaining visual consistency and development standards.

## Color Palette

### Primary Colors

- **Background**: Black (`bg-black`)
- **Primary Blue**: Blue 500 (`bg-blue-500`, `text-blue-500`)
- **Primary Blue Hover**: Blue 800 (`hover:bg-blue-800`)
- **Text Primary**: White (`text-white`)
- **Text Muted**: Muted foreground (`text-muted-foreground`)

### Accent Colors

- **Purple**: Purple 500 (`text-purple-500`) - Analytics & Reporting
- **Success**: Green tones for positive states
- **Warning**: Yellow/Orange tones for alerts
- **Error**: Red tones for errors

### Overlays

- **Semi-transparent Black**: `bg-black/20` for hero overlays
- **Border**: Muted border colors (`border-muted`)

## Typography

### Font Family

- **Primary**: Inter - Used throughout the application
- **Alternative**: Playfair Display - Used for decorative headlines

### Font Weights and Sizes

#### Headers

- **Main Headlines**: `font-extrabold text-4xl md:text-5xl`
- **Section Headlines**: `font-extrabold text-3xl md:text-4xl`
- **Subsection Headlines**: `font-bold text-xl`

#### Body Text

- **Large Body**: `font-medium text-lg md:text-xl`
- **Regular Body**: `font-normal text-sm`
- **Small Text**: `text-xs`

#### Navigation

- **Logo**: `font-extrabold text-2xl`
- **Nav Links**: `font-medium text-sm`
- **Buttons**: `font-semibold`

### Text Colors

- **Primary Text**: White (`text-white`)
- **Secondary Text**: White with opacity (`text-white/90`)
- **Accent Text**: Blue (`text-blue-500`)
- **Muted Text**: Muted foreground (`text-muted-foreground`)

## Layout System

### Container Structure

```css
/* Root page layout */
.page-layout {
  @apply flex min-h-screen flex-col;
}

/* Main content area */
.main-content {
  @apply flex-1;
}
```

### Spacing Standards

#### Padding

- **Small**: `p-4` (16px)
- **Medium**: `p-6` (24px)
- **Large**: `p-8` (32px)
- **Responsive Horizontal**: `px-4 md:px-6 lg:px-8`

#### Margins

- **Section Spacing**: `py-12 md:py-24 lg:py-32`
- **Element Spacing**: `mt-8`, `mb-6`
- **Component Spacing**: `space-y-2`, `space-y-4`, `gap-6`, `gap-8`

#### Grid Systems

- **Feature Cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Pricing Cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Dashboard Metrics**: Responsive grid layouts

## Component Library

### Navigation Bar

```tsx
<header className="sticky top-0 z-30 flex h-16 items-center border-b bg-black px-4 lg:px-6">
  {/* Logo */}
  <div className="flex items-center space-x-2">
    <MapPinned className="text-blue-500" />
    <span className="text-2xl font-extrabold text-white underline-offset-4 hover:text-blue-500 hover:underline">
      FleetFusion
    </span>
  </div>

  {/* Navigation Links */}
  <nav className="ml-auto flex items-center space-x-6">
    <a className="text-sm font-medium text-white underline-offset-4 hover:text-blue-500 hover:underline">
      Features
    </a>
    {/* Additional nav items */}
  </nav>
</header>
```

### Buttons

#### Primary Button

```tsx
<button className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-800">
  Start Free Trial
</button>
```

#### Secondary Button

```tsx
<button className="rounded-lg border border-blue-500 px-6 py-2 font-semibold text-blue-500 transition-colors hover:bg-blue-500 hover:text-white">
  Learn More
</button>
```

### Cards

#### Feature Card

```tsx
<div className="border-muted flex flex-col items-center space-y-2 rounded-lg border bg-black p-4 text-center">
  <Icon className="h-12 w-12 text-blue-500" />
  <h3 className="text-lg font-semibold text-white">Feature Title</h3>
  <p className="text-muted-foreground text-sm">Feature description text</p>
</div>
```

#### Pricing Card

```tsx
<div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg">
  {/* Highlighted card gets additional classes */}
  <div className="z-10 scale-105 ring-2 ring-blue-200 dark:ring-blue-900">
    <h3 className="text-xl font-bold text-black">Plan Name</h3>
    <p className="text-3xl font-bold text-blue-500">$99/month</p>
    {/* Features list */}
  </div>
</div>
```

#### Dashboard Card

```tsx
<div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
  <h3 className="mb-4 text-lg font-semibold">Card Title</h3>
  <div className="space-y-2">{/* Card content */}</div>
</div>
```

### Forms

#### Input Field

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">Field Label</label>
  <input
    type="text"
    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="Enter value"
  />
</div>
```

#### Select Field

```tsx
<select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
  <option value="">Select option</option>
  <option value="option1">Option 1</option>
</select>
```

## Page Layouts

### Hero Section

```tsx
<section className="relative w-full overflow-hidden py-12 md:py-24 lg:min-h-[600px] lg:py-0 xl:min-h-[700px] xl:py-0 2xl:min-h-[800px]">
  {/* Background Image */}
  <div className="absolute inset-0 z-0 hidden h-full w-full lg:block">
    <Image src="/landing_hero.png" alt="Hero" className="object-cover object-right-bottom" />
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/20"></div>

  {/* Content */}
  <div className="relative z-10 container flex min-h-[400px] items-center px-4 md:px-6 lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold text-white md:text-5xl">Hero Headline</h1>
      <p className="text-lg font-medium text-white/90 md:text-xl">Hero description text</p>
      <button className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-800">
        Call to Action
      </button>
    </div>
  </div>
</section>
```

### Features Section

```tsx
<section id="features" className="w-full py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6">
    {/* Section Header */}
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-3xl font-extrabold text-blue-500 uppercase md:text-4xl">
        Section Headline
      </h2>
      <p className="text-muted-foreground text-lg">Section description</p>
    </div>

    {/* Features Grid */}
    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Feature cards */}
    </div>
  </div>
</section>
```

### Dashboard Layout

```tsx
<div className="min-h-screen bg-gray-50">
  {/* Dashboard Header */}
  <header className="border-b bg-white shadow-sm">
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
    </div>
  </header>

  {/* Main Content */}
  <main className="p-6">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Dashboard widgets */}
    </div>
  </main>
</div>
```

## Icons

### Icon Library

- **Primary**: Lucide React icons
- **Sizes**: `w-4 h-4`, `w-6 h-6`, `w-8 h-8`, `w-12 h-12`
- **Colors**: Match text colors (`text-blue-500`, `text-white`, etc.)

### Common Icons

- **Navigation**: MapPinned (logo), Menu, User, Settings
- **Actions**: ArrowRight, Plus, Edit, Trash, Download
- **Status**: CheckCircle, AlertCircle, XCircle
- **Dashboard**: BarChart, PieChart, TrendingUp, Users

## Responsive Design

### Breakpoints

- **Small (sm)**: 640px and up
- **Medium (md)**: 768px and up
- **Large (lg)**: 1024px and up
- **Extra Large (xl)**: 1280px and up
- **2X Large (2xl)**: 1536px and up

### Responsive Patterns

```css
/* Mobile-first approach */
.responsive-text {
  @apply text-sm md:text-base lg:text-lg;
}

.responsive-padding {
  @apply px-4 md:px-6 lg:px-8;
}

.responsive-grid {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
```

## Animation and Transitions

### Hover Effects

```css
.hover-scale {
  @apply transition-transform hover:scale-105;
}

.hover-color {
  @apply transition-colors hover:text-blue-500;
}

.hover-shadow {
  @apply transition-shadow hover:shadow-lg;
}
```

### Focus States

```css
.focus-ring {
  @apply focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none;
}
```

## Accessibility Guidelines

### Color Contrast

- Ensure sufficient contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test with accessibility tools
- Provide alternative indicators beyond color

### Interactive Elements

- All interactive elements must be keyboard accessible
- Include proper focus indicators
- Use semantic HTML elements
- Provide descriptive alt text for images

### Screen Reader Support

- Use proper heading hierarchy (h1, h2, h3, etc.)
- Include aria-labels for complex interactions
- Ensure proper tab order
- Test with screen readers

## Dark Mode Support

### Implementation

```css
/* Light mode (default) */
.bg-light {
  @apply bg-white text-gray-900;
}

/* Dark mode */
.dark .bg-light {
  @apply bg-gray-800 text-white;
}
```

### Color Tokens for Dark Mode

- **Background**: `bg-white dark:bg-gray-800`
- **Text**: `text-gray-900 dark:text-white`
- **Borders**: `border-gray-200 dark:border-gray-700`
- **Cards**: `bg-white dark:bg-gray-800`

## Performance Considerations

### Image Optimization

- Use Next.js Image component
- Implement proper lazy loading
- Optimize image formats (WebP, AVIF)
- Use appropriate sizing and compression

### CSS Optimization

- Use Tailwind's purge feature
- Minimize custom CSS
- Implement critical CSS loading
- Use CSS-in-JS for dynamic styles

## Design Tokens

### Custom CSS Variables

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #1e40af;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
}
```

### Usage in Components

```css
.custom-button {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}

.custom-button:hover {
  background-color: var(--color-primary-hover);
}
```

## Component Documentation Standards

### Component Props Interface

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Component Usage Examples

```tsx
// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// Secondary button with loading state
<Button variant="secondary" loading={isSubmitting}>
  Submit Form
</Button>
```

## Testing Guidelines

### Visual Regression Testing

- Test component states (default, hover, focus, disabled)
- Test responsive breakpoints
- Test dark mode variants
- Test with different content lengths

### Accessibility Testing

- Test with keyboard navigation
- Test with screen readers
- Verify color contrast ratios
- Check focus management

This design system ensures consistency across FleetFusion's interface while providing flexibility
for future development and maintaining accessibility standards.
