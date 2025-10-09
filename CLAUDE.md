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
│   │   ├── room/page.tsx         # หน้าจัดการห้องและผู้อยู่อาศัย (มี View Modal)
│   │   ├── test/page.tsx         # หน้าทดสอบ CRUD template
│   │   └── settings/page.tsx     # หน้าตั้งค่าระบบ
│   ├── login/page.tsx            # หน้า Login (customer_id dialog)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Redirect ไป /login
│
├── components/
│   ├── ui/                       # shadcn/ui components (Button, Input, Card, Dialog, Tabs, etc.)
│   ├── sidebar.tsx               # Sidebar navigation + UserMenu (mobile)
│   ├── user-menu.tsx            # User info + logout dialog
│   ├── page-header.tsx          # Header component สำหรับแต่ละหน้า
│   ├── search-bar.tsx           # Reusable search input with clear button
│   ├── table-action-buttons.tsx # View/Edit/Delete buttons with modern styling
│   ├── pagination.tsx           # Pagination component
│   ├── confirm-dialog.tsx       # Confirmation dialog for delete actions
│   ├── loading-spinner.tsx      # Loading state component
│   └── error-alert.tsx          # Error message display
│
├── lib/
│   ├── auth.ts                  # Authentication utilities (login/logout/getCurrentUser)
│   ├── api.ts                   # API call wrapper with error handling
│   └── utils.ts                 # Utility functions (cn, etc.)
│
├── config/
│   └── constants.ts             # App constants (LIMIT, etc.)
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
2. **Customer ID Dialog**: หลัง login สำเร็จจะแสดง Dialog ให้กรอก customer_id
3. **Storage**: เก็บ user data + customer_id ใน localStorage + cookie
4. **Middleware**: ตรวจสอบ cookie และ redirect ถ้าไม่มี session
5. **Logout**: ลบ localStorage + cookie แล้ว redirect ไป /login

**User Interface:**
```typescript
interface User {
  username: string;
  name: string;
  customer_id?: string;
}
```

**API Integration:**
- ทุก API request ต้องส่ง `customer_id` parameter
- ใช้ `getCurrentUser()` เพื่อดึง customer_id จาก localStorage
- Format: `api/endpoint?customer_id=xxx&other_params=yyy`

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
3. **Room** (`/room`): จัดการห้องและผู้อยู่อาศัย - **Main CRUD Page**
4. **Test** (`/test`): Template หน้า CRUD สำหรับทดสอบ pattern
5. **Settings** (`/settings`): ตั้งค่าระบบ (placeholder)

### Room Management Page (`/room`)

**Main Features:**
- รายการห้องพร้อมข้อมูลสมาชิก
- ค้นหา: ห้อง, ชื่อ, เบอร์โทรศัพท์
- View Modal แสดงรายละเอียดห้องพร้อม 3 tabs

**Table Columns:**
- เลขห้อง (title)
- จำนวนสมาชิก (badge with icon, blue >0 / gray =0)
- เจ้าของ (prefix_name + full_name)
- สถานะ (badge: ใช้งานปกติ/ไม่ใช้งาน)
- การดำเนินการ (View button)

**View Modal Structure:**
```
Dialog (45vw width)
├── Header
│   ├── Title: "รายละเอียดห้อง {room_title}"
│   └── Badge: "{count} สมาชิก" (bg-blue-600, text-white)
│
└── Tabs (3 tabs, h-12)
    ├── Tab 1: สมาชิกในห้อง
    │   ├── Table with Avatar (2 letters from name)
    │   ├── Columns: สมาชิก, ประเภท, อีเมล, สถานะ, เข้าร่วมเมื่อ, การดำเนินการ
    │   ├── Badge Types:
    │   │   ├── Owner: bg-yellow-100, text-[#D97706]
    │   │   └── Resident: bg-blue-50, text-blue-700
    │   ├── Status Badge:
    │   │   ├── 1: อนุมัติแล้ว (green)
    │   │   ├── 0: รออนุมัติ (yellow)
    │   │   └── 3: ถูกระงับ (red)
    │   └── Pagination (API: member/list with page & limit)
    │
    ├── Tab 2: ประวัติการชำระ
    │   └── Placeholder: "ฟีเจอร์นี้กำลังพัฒนา"
    │
    └── Tab 3: ข้อมูลการติดต่อ
        └── Grid 2 columns (owner info)
            ├── เจ้าของห้อง (User icon)
            ├── เบอร์โทรศัพท์ (Phone icon)
            ├── อีเมล (Mail icon)
            └── วันที่เข้าอยู่ (Calendar icon)
```

**API Endpoints:**
- List: `api/room/list?page={page}&limit={limit}&customer_id={customer_id}&keyword={keyword}`
- Members: `api/member/list?page={page}&limit={limit}&customer_id={customer_id}&room_id={room_id}`
- Delete: `api/room/delete` (POST with id, uid, customer_id)

### Reusable Components

#### SearchBar
- Input field with search icon
- Enter to search, X button to clear
- Placeholder customizable

#### TableActionButtons
- View button: bg-blue-50, text-blue-700, no border
- Edit button: bg-blue-50, text-blue-700, no border
- Delete button: bg-red-50, text-red-700, no border
- Show/hide each button via props

#### Pagination
- Shows current page, total pages
- Previous/Next buttons
- Jump to page input

#### Badge Styling Pattern
```typescript
// Modern badge style
className: 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-{color}-50 text-{color}-700'
// Border radius: rounded (4px) - ไม่กลมมาก
```

### API Integration Pattern

```typescript
// lib/api.ts - Centralized API call wrapper
export async function apiCall(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Usage in pages
const user = getCurrentUser();
const customerId = user?.customer_id || '';
const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?customer_id=${encodeURIComponent(customerId)}`);
```

### Styling Patterns

**Badge Colors:**
- Green (ใช้งานปกติ, อนุมัติ): `bg-green-50 text-green-700`
- Blue (สมาชิก, ผู้อยู่อาศัย): `bg-blue-50 text-blue-700`
- Yellow (รออนุมัติ, เจ้าของ): `bg-yellow-100 text-[#D97706]`
- Red (ถูกระงับ, ลบ): `bg-red-50 text-red-700`
- Gray (ไม่ใช้งาน, 0 สมาชิก): `bg-gray-50 text-gray-700`

**Border Radius:**
- Badges: `rounded` (4px)
- Cards: `rounded-lg` (8px)
- Avatars: `rounded-lg` (8px)

**Modal Sizing:**
- Small: `max-w-[425px]`
- Medium: `!max-w-[45vw]` (room view modal)
- Large: `!max-w-[65vw]` หรือมากกว่า
- Important: ใช้ `!` prefix เพื่อ override default `sm:max-w-lg`

### Best Practices

#### TypeScript
- ไม่ต้องสร้าง interface สำหรับ API response - ใช้ `any` type
- ใช้ TypeScript strict mode
- Path alias `@/*` สำหรับ imports

#### State Management Pattern
```typescript
// Loading state
const [loading, setLoading] = useState(true);  // List loading
const [loadingView, setLoadingView] = useState(false);  // Modal loading
const [submitting, setSubmitting] = useState(false);  // Form submit

// Data state
const [data, setData] = useState<any[]>([]);
const [pagination, setPagination] = useState<any>(null);

// Modal states
const [isModalOpen, setIsModalOpen] = useState(false);
const [viewData, setViewData] = useState<any>(null);

// Search states
const [searchQuery, setSearchQuery] = useState('');  // Input value
const [searchKeyword, setSearchKeyword] = useState('');  // API keyword
```

#### API Call Pattern
```typescript
// fetchList - มี loading state
const fetchList = async () => {
  setLoading(true);
  setError('');
  const result = await apiCall(url);
  if (result.success) {
    setData(result.data || []);
    setPagination(result.pagination);
  } else {
    setError(result.error || result.message || 'เกิดข้อผิดพลาด');
  }
  setLoading(false);
};

// refreshList - ไม่มี loading state (silent refresh)
const refreshList = async (resetToFirstPage = false) => {
  const pageToUse = resetToFirstPage ? 1 : currentPage;
  const result = await apiCall(url);
  if (result.success) {
    setData(result.data || []);
    setPagination(result.pagination);
    if (resetToFirstPage) setCurrentPage(1);
  }
};
```

#### Component Organization
1. **Imports** - libraries → components → utils → types
2. **Constants** - API paths, MENU, UID
3. **Component** - functional component
4. **States** - grouped by purpose
5. **Helper Functions** - getStatusBadge, getMemberBadge
6. **API Functions** - fetchList, refreshList, handleSubmit
7. **Event Handlers** - handleSearch, handleViewClick
8. **Render** - JSX

#### Dialog Accessibility
- ทุก Dialog ต้องมี `DialogTitle` (ไม่งั้นจะเกิด console warning)
- กรณี loading state ต้องมี DialogTitle ด้วย: `<DialogTitle>กำลังโหลดข้อมูล...</DialogTitle>`

#### Spacing Guidelines
- Tab content spacing: `mt-6` (จาก tab header ถึงเนื้อหา)
- Grid gap: `gap-6` (ระหว่าง columns)
- Item spacing: `space-y-3` (ระหว่าง label และ card)
- Tab height: `h-12` (48px)

### Common Issues & Solutions

1. **Modal ไม่กว้างตามที่ตั้งไว้**
   - เพิ่ม `!` prefix: `!max-w-[45vw]`
   - Override default `sm:max-w-lg` ของ DialogContent

2. **Badge ไม่มี background color**
   - ใช้ Tailwind class แทน inline style: `bg-yellow-100` แทน `var(--yellow-100)`

3. **API ไม่ส่ง customer_id**
   - ตรวจสอบว่าได้ `getCurrentUser()` และส่ง parameter `customer_id` ทุก request

4. **Pagination ใน Modal ไม่ทำงาน**
   - ต้องเก็บ `viewRoomId` state เพื่อใช้ใน `handleMemberPageChange`
   - เรียก `fetchViewMembers(viewRoomId, page)` เมื่อเปลี่ยนหน้า

5. **NameError หรือข้อมูลไม่แสดง**
   - ตรวจสอบว่าใช้ optional chaining: `item?.field || '-'`
   - แสดง prefix_name: `${item.prefix_name || ''}${item.full_name || ''}`

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_PATH=https://api.example.com/
```

**Usage:**
```typescript
const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}`;
```

### Important Notes

1. **ไม่ใช้ TypeScript interfaces สำหรับ API responses** - ใช้ `any` type เพื่อความยืดหยุ่น
2. **customer_id เป็น required parameter** - ต้องส่งในทุก API request
3. **Badge styling** - ใช้ `rounded` (4px) ไม่ใช้ `rounded-full`
4. **Modal width** - ต้องใช้ `!` prefix เพื่อ override default
5. **Reusable components** - SearchBar, TableActionButtons, Pagination, ConfirmDialog, LoadingSpinner, ErrorAlert
6. **Avatar in table** - แสดง 2 ตัวอักษรแรกของชื่อ, bg-blue-600, rounded-lg
7. **Tab spacing** - ต้องมี `mt-6` เพื่อเว้นระยะจาก tab header

### shadcn/ui Components Installed

- button
- input
- card
- dialog
- select
- label
- badge
- tabs
- sonner (toast notifications)

**Install new component:**
```bash
npx shadcn@latest add [component-name]
```
