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
<div className="flex flex-col min-h-screen">
  {/* Navigation */}
  {/* Main Content */}
  {/* Footer */}
</div>
```

### Section Container
```tsx
<section className="w-full py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6">
    {/* Section Content */}
  </div>
</section>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Grid Items */}
</div>
```

## Navigation Components

### Primary Navigation
```tsx
<header className="sticky top-0 z-30 px-4 lg:px-6 h-16 flex items-center border-b bg-black">
  {/* Logo */}
  <div className="flex items-center gap-2">
    <MapPinned className="text-blue-500" />
    <span className="text-2xl font-extrabold text-white hover:text-blue-500 hover:underline underline-offset-4">
      FleetFusion
    </span>
  </div>
  
  {/* Navigation Links */}
  <nav className="ml-auto flex gap-6">
    <a className="text-sm font-medium text-white hover:text-blue-500 hover:underline underline-offset-4">
      Features
    </a>
    <a className="text-sm font-medium text-white hover:text-blue-500 hover:underline underline-offset-4">
      Pricing
    </a>
    <a className="text-sm font-medium text-white hover:text-blue-500 hover:underline underline-offset-4">
      About
    </a>
    <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800">
      Sign In
    </button>
  </nav>
</header>
```

### Footer
```tsx
<footer className="bg-black text-muted-foreground text-xs px-4 py-6 flex justify-between items-center">
  <p>&copy; 2024 FleetFusion. All rights reserved.</p>
  <div className="flex gap-4">
    <a href="#" className="hover:underline">Privacy</a>
    <a href="#" className="hover:underline">Terms</a>
  </div>
</footer>
```

## Content Components

### Hero Section
```tsx
<section className="w-full py-12 md:py-24 lg:py-0 xl:py-0 relative lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px] overflow-hidden">
  {/* Background Image */}
  <div className="hidden lg:block absolute inset-0 w-full h-full z-0">
    <img src="/landing_hero.png" alt="Hero" className="object-cover object-right-bottom w-full h-full" />
  </div>
  
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/20"></div>
  
  {/* Content */}
  <div className="container px-4 md:px-6 relative z-10 flex items-center min-h-[400px] lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
        Fleet Management Made Simple
      </h1>
      <p className="text-lg md:text-xl text-white/90">
        Streamline your operations with comprehensive fleet management
      </p>
      <button className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-800 flex items-center gap-2">
        Start Free 30-Day Trial
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</section>
```

### Feature Card
```tsx
<div className="rounded-lg border border-muted p-4 flex flex-col items-center text-center space-y-2 bg-black">
  <div className="text-purple-500 mb-2">
    <BarChart className="w-8 h-8" />
  </div>
  <h3 className="text-lg font-semibold text-white">Analytics & Reporting</h3>
  <p className="text-sm text-muted-foreground">
    Comprehensive analytics and detailed reporting capabilities
  </p>
</div>
```

### Pricing Card
```tsx
<div className="rounded-2xl shadow-lg p-8 flex flex-col items-center text-center bg-white relative">
  {/* Highlight Ring (for featured plans) */}
  <div className="absolute inset-0 ring-2 ring-blue-200 dark:ring-blue-900 rounded-2xl"></div>
  
  <h3 className="text-xl font-bold mb-4">Growth</h3>
  <div className="text-3xl font-bold text-blue-500 mb-6">$49/month</div>
  
  <ul className="space-y-2 mb-6">
    <li className="flex items-center gap-2">
      <Check className="w-4 h-4 text-blue-500" />
      <span className="text-sm">Up to 50 vehicles</span>
    </li>
    {/* More features */}
  </ul>
  
  <button className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800">
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
    className="w-full px-3 py-2 border border-muted rounded-lg bg-black text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter your email"
  />
</div>
```

## UI Components

### Card Component
```tsx
<div className="rounded-lg border border-muted p-6 bg-black">
  <h3 className="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
```

### Badge Component
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  New Feature
</span>
```

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
```

## Styling Guidelines

### Responsive Design
- **Mobile First**: Start with mobile styles, add larger screen styles with `md:`, `lg:`, `xl:` prefixes
- **Breakpoints**: 
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

### Dark Theme Support
```tsx
// Use dark mode variants
<div className="bg-white dark:bg-black text-black dark:text-white">
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

This component library ensures consistent, accessible, and maintainable UI across the FleetFusion application while providing flexibility for future enhancements.
