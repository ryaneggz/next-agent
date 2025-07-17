# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast builds
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture & Structure

This is a Next.js 15 application using the App Router architecture with the following key components:

### Framework & Dependencies
- **Next.js 15** with App Router (`app/` directory structure)
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling with PostCSS integration
- **shadcn/ui** component library using Radix UI primitives
- **Lucide React** for icons

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/ui/` - Reusable shadcn/ui components
- `lib/` - Utility functions and shared code
- `public/` - Static assets

### Component System
The project uses shadcn/ui components configured with:
- **Style**: "new-york" variant
- **Base color**: neutral
- **CSS variables**: enabled for theming
- **Path aliases**: `@/components`, `@/lib/utils`, `@/components/ui`

### Styling Approach
- **Tailwind CSS v4** as the primary styling solution
- **CSS utility classes** with `cn()` utility for conditional class merging
- **Design system** through shadcn/ui components with consistent variants
- **Typography**: Geist font family (both sans and mono variants)

### Development Patterns
- Uses `@/` path alias for absolute imports
- TypeScript with strict configuration
- Component composition using Radix UI Slot pattern
- Class variance authority (cva) for component variant management
- Tailwind merge for conflict resolution in utility classes

### Configuration Files
- `tsconfig.json` - TypeScript configuration with Next.js plugin
- `components.json` - shadcn/ui configuration
- `next.config.ts` - Next.js configuration (minimal setup)
- `postcss.config.mjs` - PostCSS configuration for Tailwind