# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ระบบจัดการโครงการที่พักอาศัย (Residential Project Management System - RPMS) เป็น Next.js 15 frontend application สำหรับจัดการบิล ผู้พักอาศัย และข้อมูลโครงการ

## Git Repository

- **Remote**: git@github.com:Darksilver88/kconnect_frontend.git
- **Main branch**: main

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

```
src/
├── app/
│   ├── (main)/                    # Route group - ทุกหน้าที่ต้อง authentication
│   │   ├── layout.tsx            # Main layout พร้อม Sidebar + SidebarContext
│   │   ├── dashboard/page.tsx    # หน้า Dashboard มีกราฟแสดงข้อมูล
│   │   ├── billing/page.tsx      # หน้าจัดการบิล
│   │   ├── resident/page.tsx     # หน้าจัดการทะเบียนผู้พักอาศัย
│   │   └── settings/page.tsx     # หน้าตั้งค่าระบบ
│   ├── login/page.tsx            # หน้า Login (ไม่ต้อง auth)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Redirect ไป /login
│
├── components/
│   ├── ui/                       # shadcn/ui components (Button, Input, Card, etc.)
│   ├── sidebar.tsx               # Sidebar navigation + UserMenu (mobile)
│   ├── user-menu.tsx            # User info + logout dialog
│   └── page-header.tsx          # Header component สำหรับแต่ละหน้า
│
├── lib/
│   ├── auth.ts                  # Authentication utilities (login/logout/getCurrentUser)
│   └── utils.ts                 # Utility functions (cn, etc.)
│
└── middleware.ts                # Route protection + redirects
```

### Key Technologies

- **Framework**: Next.js 15.5.4 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Strict mode, target ES2017
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts for Dashboard visualization
- **Icons**: Lucide React

### Authentication Flow

1. **Login**: ใช้ credentials fix (admin/admin123)
2. **Storage**: เก็บ user data ใน localStorage + cookie
3. **Middleware**: ตรวจสอบ cookie และ redirect ถ้าไม่มี session
4. **Logout**: ลบ localStorage + cookie แล้ว redirect ไป /login

### Layout & Components

#### Route Group `(main)`
- ใช้ Route Group เพื่อแชร์ layout เดียวกันโดยไม่เพิ่ม path ใน URL
- ทุกหน้าใน `(main)` ต้อง authenticated
- มี SidebarContext สำหรับควบคุม sidebar state

#### Sidebar
- **Desktop (≥1024px)**: แสดง static sidebar ด้านซ้ายตลอดเวลา
- **Mobile (<1024px)**: ซ่อนไว้ แสดงเป็น drawer เมื่อกดปุ่ม hamburger
- **UserMenu บนมือถือ**: แสดงใน Sidebar ด้านล่างสุด (fixed position ไม่ scroll)

#### PageHeader Component
- แสดงชื่อหน้า + icon + subtitle
- มีปุ่ม hamburger menu (mobile only)
- **UserMenu**: แสดงบน Desktop เท่านั้น (mobile แสดงใน Sidebar)

#### UserMenu Component
- แสดงชื่อผู้ใช้ + Avatar
- กดแล้วเปิด Dialog ยืนยันออกจากระบบ
- **Responsive**:
  - Desktop: อยู่ใน PageHeader ด้านขวาบน
  - Mobile: อยู่ใน Sidebar ด้านล่างสุด (fixed)

### TypeScript Configuration

- Path alias `@/*` maps to `./src/*`
- Example: `import { Sidebar } from '@/components/sidebar'`

### Styling

- **Gradient Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Color Scheme**: Slate สำหรับ Sidebar, Blue สำหรับ active states
- Tailwind CSS 4 with responsive breakpoints (lg: 1024px)

### Key Pages

1. **Dashboard** (`/dashboard`): หน้าแรกหลัง login, มี summary cards + charts (Bar, Line)
2. **Billing** (`/billing`): จัดการบิลและการเรียกเก็บเงิน (placeholder)
3. **Resident** (`/resident`): จัดการข้อมูลผู้พักอาศัย (placeholder)
4. **Settings** (`/settings`): ตั้งค่าระบบ (placeholder)
