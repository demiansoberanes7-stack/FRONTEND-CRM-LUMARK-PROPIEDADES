---
name: Lumark PropTech Canvas
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#3e2400'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c3800'
  on-tertiary-container: '#ef9900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  numeric-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system blends the precision and functional velocity of modern productivity engines (Linear, Stripe, Notion) with the institutional trust required by top-tier real estate transactions in Mexico. The visual tone is architectural, rational, and poised: high utility, dense information hierarchy, restrained surfaces, and deliberate micro-interactions that project security and institutional stature.

### Design Movement & Aesthetic
- **Hybrid Minimalist-Corporate Modern:** Combines Linear’s razor-sharp borders, subtle tinted backdrops, and compact ergonomics with Stripe’s typographic clarity and Notion’s spatial restraint.
- **Atmospheric Clarity:** Interfaces leverage layered micro-borders (`slate-200/80` over deep white or canvas tints) rather than heavy elevation, eliminating visual noise in dense multi-unit tables, portfolio analytics, and transaction pipelines.
- **Audience:** High-performing brokers, investment funds, real estate developers, and asset managers handling high-value operations across Baja California and Mexico nationwide.

## Colors

The color system establishes institutional credibility through structural deep indigos, balanced with calibrated semantic status colors engineered for real-time portfolio management.

### Palette Architecture
- **Primary (`#1E3A8A` - Navy Deep / Interactive Accent `#2563EB`):** Grounded navy anchors the navigation bars, primary CTAs, active selections, and decisive operational checkpoints.
- **Secondary (`#059669` - Emerald / Mint Tint):** Dedicated to closed transactions, active leases, positive yield percentages, and verified notary titles.
- **Tertiary (`#F59E0B` - Warm Amber):** Reserved for incoming leads, earnest money deposits under escrow, reservation deadlines, and deal warnings.
- **Neutral (`#0F172A` - Slate Spectrum):** Powers high-contrast typography, structural borders, and modular backgrounds.
  - Light canvas: `#F8FAFC` base with `#FFFFFF` card layers and `#E2E8F0` hairline dividers.
  - Dark mode target: `#090D16` foundation with `#0F172A` intermediate cards, `#1E293B` raised surfaces, and `#334155` crisp ghost borders.

## Typography

Typography prioritizes fast scanning, dense tabular processing, and hierarchical clarity.

- **Plus Jakarta Sans** provides structural elegance to page headers, module titles, and value metrics without visual fatigue.
- **Inter** handles high-volume editorial, forms, and data grid rows.
- **OpenType Tabular Figures (`tnum`):** All financial summaries, square meter metrics (`m²`), and MXN currency values must force `font-feature-settings: 'tnum' 1, 'cv05' 1` to ensure numeric columns align identically down the visual axis.

## Layout & Spacing

The system implements a rigid 4px/8px layout architecture configured for data dashboards, kanban pipelines, and master-detail splits.

### Layout Rules
- **Desktop (1280px+):** 12-column fluid grid or persistent collapsible sidebar (240px) paired with an infinite/scrollable canvas. Gutter spacing defaults to `1.5rem` (`gutter-desktop`).
- **Tablet (768px - 1279px):** 8-column layout. Sidebar collapses into an overlay icon bar. Gutter set to `1rem` with `1.5rem` outer margins.
- **Mobile (< 768px):** 4-column layout. Multi-column property tables convert to stacked property summary cards. Sticky action bars pin to the bottom edge. Outer canvas margin drops to `1rem`.

## Elevation & Depth

Visual hierarchy uses crisp hairlines and low-opacity ambient diffusion rather than deep dropped shadows.

- **Tonal Layers:** Layer 0 sits at `#F8FAFC` (Dark: `#090D16`). Layer 1 (Cards, Tables, Panels) sits at `#FFFFFF` (Dark: `#0F172A`). Layer 2 (Modals, Dropdowns, Flyouts) sits at `#FFFFFF` (Dark: `#1E293B`).
- **Border Integration:** Every elevated surface is reinforced with a 1px ghost border: `border-slate-200/80` (Light) or `border-slate-800` (Dark).
- **Ambient Diffusion:**
  - Flat base: 1px border, 0px blur.
  - Floating element (Card / Row hover): `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);`
  - Popover / Context Menu: `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03);`
  - Modal: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.05);`

## Shapes

The interface balances sharp productivity lines with refined softness.

- **Standard Containers (`rounded-xl` / 12px):** Property detail cards, kanban stages, analytical charts, modal wrappers, and data frames.
- **Interactive Controls (`rounded-lg` / 8px):** Text fields, search bars, filter triggers, and standard action buttons.
- **Pill Badges (`rounded-full`):** Status flags (e.g., *En Renta*, *Apartado*, *Escriturado*, *Lead Calificado*), agent presence indicators, and numeric notification counts.

## Components

### Buttons
- **Primary:** Background `#1E3A8A`, text `#FFFFFF`, border `transparent`, active state `#172554`. Height: 36px (compact) / 40px (default). Padding: `0 16px`. Font: `Inter` 14px, weight 500.
- **Secondary / Outline:** Background `#FFFFFF` (Dark: `#0F172A`), border `1px solid #E2E8F0` (Dark: `#334155`), text `#0F172A` (Dark: `#F8FAFC`). Hover: Background `#F1F5F9` (Dark: `#1E293B`).
- **Destructive:** Background `#FEF2F2`, border `1px solid #FEE2E2`, text `#DC2626`. Dark mode: `#450A0A` background with `#FCA5A5` text.

### Chips & Status Badges
- **Shape:** Full pill (`rounded-full`), height 22px, padding `2px 8px`. Font: 11px, weight 600, uppercase letter-spacing (`0.03em`).
- **Active / Closed:** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Under Escrow / Pending:** Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Draft / Inactive:** Background `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`.

### Form Fields & Inputs
- **Container:** Height 38px, border `1px solid #CBD5E1` (Dark: `#334155`), background `#FFFFFF` (Dark: `#090D16`), radius `8px`.
- **Focus State:** Border `#2563EB`, outer ring `2px solid rgba(37, 99, 235, 0.15)`. No aggressive shadows.
- **Prefix / Suffix Elements:** Dedicated slots for currency symbols (`$ MXN`), square footage icons (`m²`), and property status dropdowns.

### Lists & Data Grids
- **Header:** Sticky top, height 36px, background `#F8FAFC` (Dark: `#0F172A`), border-bottom `1px solid #E2E8F0` (Dark: `#1E293B`), text `label-md` in `#64748B`.
- **Rows:** Height 44px, alternating hover background `#F8FAFC` (Dark: `#131B2E`), subtle bottom divider. Numeric values right-aligned with monospace/tabular digits.

### Checkboxes & Radios
- **Checkbox:** 16x16px, radius 4px, border `1.5px solid #94A3B8`. Checked state: background `#1E3A8A`, checkmark icon white.
- **Radio:** 16x16px, circle. Selected state: outer ring `#1E3A8A`, inner dot 6px `#1E3A8A`.

### Cards
- **Property Listing Card:** Border `1px solid #E2E8F0` (Dark: `#1E293B`), background `#FFFFFF` (Dark: `#0F172A`), radius `12px`, overflow hidden. Image slot 16:10 aspect ratio with floating pill badge top-left and heart/bookmark top-right. Bottom metric band displaying bedrooms, bathrooms, and surface area in tabular format.