---
id: fcxqgjvi5mjchff3479mm5k
title: Spec
desc: ''
updated: 1748896875463
created: 1748896419675
---

# FleetFusion Design Specification

Based on the provided homepage screenshot and the Tailwind CSS styles, here is a detailed analysis
of the design elements used in the FleetFusion homepage:

---

## **Design Elements**

### **Logo ("FleetFusion" in nav, top left)**

- **Font:** Inter, bold (`font-extrabold`)
- **Font size:** `text-2xl`
- **Color:** White (`text-white`)
- **Icon:** Lucide MapPinned, blue (`text-blue-500`)
- **Layout:** Flex row, vertically centered
- **Hover:** Text turns blue, underline (`hover:text-blue-500 hover:underline underline-offset-4`)
- **Padding:** `px-4` (horizontal), `h-16` (header height)
- **Background:** Black (`bg-black`)
- **Border:** Bottom border (`border-b`)

---

### **Nav Links (Features, Pricing, About, Sign In, top right)**

- **Font:** Inter, medium (`font-medium`)
- **Font size:** `text-sm`
- **Color:** White (`text-white`)
- **Spacing:** `gap-6` between links
- **Hover:** Blue text, underline (`hover:text-blue-500 hover:underline underline-offset-4`)
- **Sign In Button:**
  - **Background:** Blue (`bg-blue-500`)
  - **Text:** White
  - **Hover:** Darker blue (`hover:bg-blue-800`)
  - **Padding:** `py-2`, `rounded-lg`
  - **Font weight:** Semibold

---

### **Hero Section (background, headline, subheadline, CTA)**

- **Background Image:** `/landing_hero.png`, covers entire section
  (`object-cover object-right-bottom`)
- **Overlay:** Black with 20% opacity (`bg-black/20`)
- **Headline:**
  - **Font:** Inter or Playfair, bold (`font-extrabold`)
  - **Font size:** Large (`text-4xl md:text-5xl`)
  - **Color:** White (`text-white`)
  - **Letter spacing:** Tight
- **Subheadline:**
  - **Font:** Inter, medium
  - **Font size:** `text-lg md:text-xl`
  - **Color:** White, slightly muted (`text-white/90`)
- **CTA Button ("Start Free 30-Day Trial"):**
  - **Background:** Blue (`bg-blue-500`)
  - **Text:** White
  - **Hover:** Darker blue (`hover:bg-blue-800`)
  - **Padding:** `py-2 px-6`
  - **Border radius:** `rounded-lg`
  - **Font weight:** Semibold
  - **Icon:** ArrowRight, white

---

### **Section Headline ("COMPREHENSIVE FLEET MANAGEMENT FEATURES")**

- **Font:** Inter or Playfair, bold (`font-extrabold`)
- **Font size:** `text-3xl md:text-4xl`
- **Color:** Blue (`text-blue-500`)
- **Text transform:** Uppercase
- **Alignment:** Centered

---

### **Feature Cards (e.g., "Analytics & Reporting")**

- **Container:** Grid, 3 columns on desktop
- **Card:**
  - **Background:** Black (`bg-black`)
  - **Border:** `border`, color muted (`border-muted`)
  - **Border radius:** `rounded-lg`
  - **Padding:** `p-4`
  - **Shadow:** Subtle or none
- **Icon:** Lucide, colored (e.g., purple for Analytics, `text-purple-500`)
- **Title:**
  - **Font:** Inter, semibold or bold
  - **Font size:** `text-lg`
  - **Color:** White
- **Description:**
  - **Font:** Inter, normal
  - **Font size:** `text-sm`
  - **Color:** Muted white (`text-muted-foreground`)
- **Alignment:** Centered

---

### **Pricing Section (Growth card, etc.)**

- **Section background:** Image (`/tiers_bg.png` or similar), overlay with white/blue tint
- **Pricing Card:**
  - **Background:** White (`bg-white`), or dark in dark mode
  - **Border radius:** `rounded-2xl`
  - **Shadow:** Large (`shadow-lg`)
  - **Padding:** `p-8`
  - **Highlight (Growth):**
    - **Ring:** Blue (`ring-2 ring-blue-200 dark:ring-blue-900`)
    - **Scale:** Slightly larger (`scale-105`)
    - **Z-index:** Raised (`z-10`)
- **Plan Name:**
  - **Font:** Inter, bold
  - **Font size:** `text-xl`
  - **Color:** Black or white (depending on mode)
- **Price:**
  - **Font:** Inter, bold
  - **Font size:** `text-3xl`
  - **Color:** Blue (`text-blue-500`)
- **Features List:**
  - **Font:** Inter, normal
  - **Font size:** `text-sm`
  - **Color:** Black or white
  - **Check icons:** Blue
- **CTA Button:**
  - **Background:** Blue (`bg-blue-500`)
  - **Text:** White
  - **Hover:** Darker blue
  - **Border radius:** `rounded-lg`
  - **Font weight:** Semibold

---

### **Footer**

- **Font:** Inter, normal
- **Font size:** `text-xs` or `text-sm`
- **Color:** Muted white (`text-muted-foreground`)
- **Background:** Black (`bg-black`)
- **Links:** White, underline on hover

---

## **Homepage Layout Description**

Here’s a detailed description of the homepage layout, focusing on flex, grid, spacing, padding, and
margins as implemented in your code and shown in the screenshot:

---

### **Overall Page Structure**

- **Root Container:**
  - `div.flex.flex-col.min-h-screen`
  - **Layout:** Vertical flexbox, full viewport height.
  - **Children:**
    1. Navigation bar (header)
    2. Main content (`main.flex-1`)
    3. Footer

---

### **Navigation Bar (Header)**

- **Class:**
  - `header.sticky.top-0.z-30.px-4.lg:px-6.h-16.flex.items-center.border-b.bg-black`
- **Layout:**
  - Flex row, items centered vertically.
  - Space between logo (left) and nav links (right).
  - Responsive horizontal padding (`px-4` on mobile, `px-6` on large screens).
  - Fixed height (`h-16`).
  - Sticks to top (`sticky top-0`).
  - Bottom border (`border-b`).

---

### **Hero Section**

- **Section Container:**
  - `section.w-full.py-12.md:py-24.lg:py-0.xl:py-0.relative.lg:min-h-[600px].xl:min-h-[700px].2xl:min-h-[800px].overflow-hidden`
  - **Layout:**
    - Full width.
    - Responsive vertical padding (`py-12`, `md:py-24`, none on large+ screens).
    - Responsive min-height for large screens.
    - Relative positioning for layering.
    - Overflow hidden for background image.
- **Background Image:**
  - `div.hidden.lg:block.absolute.inset-0.w-full.h-full.z-0`
  - **Layout:**
    - Absolutely positioned, covers section.
    - Only visible on large screens and up.
- **Overlay:**
  - `div.absolute.inset-0.bg-black/20`
  - **Layout:**
    - Absolutely positioned, covers image.
    - Adds semi-transparent black overlay.
- **Content Container:**
  - `div.container.px-4.md:px-6.relative.z-10.flex.items-center.min-h-[400px].lg:min-h-[600px].xl:min-h-[700px].2xl:min-h-[800px]`
  - **Layout:**
    - Uses Tailwind’s `.container` (centered, max-width).
    - Responsive horizontal padding.
    - Flex row, items centered vertically.
    - Responsive min-height.
    - High z-index to appear above background.

---

### **Features Section**

- **Section Container:**
  - `section#features.w-full.py-12.md:py-24.lg:py-32`
  - **Layout:**
    - Full width.
    - Responsive vertical padding.
- **Headline Container:**
  - `div.flex.flex-col.items-center.justify-center.space-y-4.text-center`
  - **Layout:**
    - Flex column, centered both axes.
    - Vertical spacing between children (`space-y-4`).
    - Text centered.
- **Features Grid:**
  - `div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-8.mt-8`
  - **Layout:**
    - Grid layout.
    - 1 column on mobile, 2 on medium, 3 on large+.
    - Gap between cards (`gap-8`).
    - Top margin (`mt-8`).
- **Feature Card:**
  - `div.rounded-lg.border.p-4.flex.flex-col.items-center.text-center.space-y-2`
  - **Layout:**
    - Rounded corners, border, padding.
    - Flex column, centered, vertical spacing between icon/title/desc.

---

### **Pricing Section**

- **Section Container:**
  - `section.w-full.min-h-screen.flex.items-center.justify-center.relative.overflow-hidden`
  - **Layout:**
    - Full width, min full viewport height.
    - Flex row, centered both axes.
    - Relative for background layering.
- **Pricing Cards Grid:**
  - `div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-8`
  - **Layout:**
    - Responsive grid (1/2/3 columns).
    - Gap between cards.
- **Pricing Card:**
  - `div.rounded-2xl.shadow-lg.p-8.flex.flex-col.items-center.text-center`
  - **Layout:**
    - Large rounded corners, shadow, padding.
    - Flex column, centered, text centered.
    - Highlighted card (Growth): extra ring, scale, z-index.

---

### **Footer**

- **Class:**
  - `footer.bg-black.text-muted-foreground.text-xs.px-4.py-6.flex.justify-between.items-center`
- **Layout:**
  - Flex row, space between copyright and links.
  - Padding on all sides.
  - Muted text color.

---

### **Spacing & Padding Summary**

- **Horizontal padding:**
  - `.px-4`, `.md:px-6`, `.lg:px-8` on containers.
- **Vertical padding:**
  - `.py-12`, `.md:py-24`, `.lg:py-32` on sections.
- **Grid/flex gaps:**
  - `.gap-6`, `.gap-8`, `.space-y-2`, `.space-y-4`.
- **Margins:**
  - `.mt-8` (top margin for grid), `.mb-2`, `.mb-6` (for text spacing).

---

## **In summary:**

The homepage uses a consistent palette (black, blue, white, muted), bold/modern typography, rounded
cards, blue highlights, and clear spacing. All circled elements are styled with Tailwind utility
classes and custom CSS variables for color and radius, as described above.

The homepage uses a vertical flex layout for the page, flex and grid for section content, responsive
padding/margins, and consistent spacing utilities to create a modern, centered, and visually
balanced layout. All major sections and cards are spaced and padded for clarity and brand
consistency.
