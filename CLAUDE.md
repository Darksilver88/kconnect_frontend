# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 frontend application built with TypeScript, React 19, and Tailwind CSS 4. The project uses the Next.js App Router architecture with the `src/app` directory structure.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind CSS styles
- `public/` - Static assets (SVGs, images)

### Key Technologies

- **Framework**: Next.js 15.5.4 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Configured with strict mode, target ES2017
- **Styling**: Tailwind CSS 4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`

### TypeScript Configuration

- Path alias `@/*` maps to `./src/*` for cleaner imports
- Example: `import Component from '@/app/component'`

### Styling

- Tailwind CSS 4 is configured via PostCSS plugin (`@tailwindcss/postcss`)
- Global styles in `src/app/globals.css`
- Utility-first approach with Tailwind classes
