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
- **Icons**: Font Awesome 6 (installed via @fortawesome/fontawesome-free)

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
- แสดงชื่อหน้า + subtitle (ไม่มี icon แล้ว)
- มีปุ่ม hamburger menu (mobile only)
- **Customer ID Badge**: แสดง customer_id badge (bg-blue-50, text-blue-700) ก่อน UserMenu (Desktop only)
- **UserMenu**: แสดงบน Desktop เท่านั้น (mobile แสดงใน Sidebar)

#### UserMenu Component
- **Layout**:
  - ซ้าย: ชื่อผู้ใช้ (username) + บทบาท (name)
  - ขวา: Avatar (2 ตัวอักษรแรกจาก username, bg-white, text-blue-600)
- **Styling**:
  - พื้นหลัง: bg-blue-600 พร้อม border-blue-700
  - ข้อความ: username (font-bold, text-white) + name (text-blue-100)
  - Avatar: rounded-lg, w-10 h-10, flex-shrink-0, ชิดขวา
- กดแล้วเปิด Dialog ยืนยันออกจากระบบ
- **Responsive**:
  - Desktop: อยู่ใน PageHeader ด้านขวาบน (justify-between)
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
2. **Billing** (`/billing`): จัดการบิลและการเรียกเก็บเงิน - **Main Bill Management with Excel Import**
3. **Payment** (`/payment`): จัดการการชำระเงิน (placeholder)
4. **Room** (`/room`): จัดการห้องและผู้อยู่อาศัย - **Main CRUD Page**
5. **Test** (`/test`): Template หน้า CRUD สำหรับทดสอบ pattern
6. **Settings** (`/settings`): ตั้งค่าระบบ (placeholder)

### Room Management Page (`/room`)

**Main Features:**
- **Summary Cards** (5 cards): แสดงสถิติด้านบน
- รายการห้องพร้อมข้อมูลสมาชิก
- ค้นหา: ห้อง, ชื่อ, เบอร์โทรศัพท์
- View Modal แสดงรายละเอียดห้องพร้อม 3 tabs
- Member Detail Modal แสดงรายละเอียดสมาชิกแต่ละคน

**Summary Cards:**
```
Grid 5 columns (responsive: 1 col mobile, 2 tablet, 5 desktop)
├── Card 1: ห้องที่มีผู้อยู่อาศัย (Blue, fa-door-open)
├── Card 2: ผู้อยู่อาศัยทั้งหมด (Green, fa-users)
├── Card 3: เจ้าของห้อง (Yellow, fa-key)
├── Card 4: ผู้เช่า (Purple, fa-user-tag)
└── Card 5: สมาชิกครอบครัว (Teal, fa-user-friends)

Card Structure:
- Border-top: h-1 colored bar
- Icon: w-12 h-12 rounded-full, top-right
- Number: text-3xl font-bold
- Label: text-sm text-slate-600
- Change: text-xs font-bold (green/red with arrow icon)
```

**Table Columns:**
- เลขห้อง (title)
- จำนวนสมาชิก (clickable badge with fa-users icon, blue >0 / gray =0)
- เจ้าของ (prefix_name + full_name)
- สถานะ (badge: ใช้งานปกติ/ไม่ใช้งาน)
- การดำเนินการ (View button with fa-eye icon)

**View Modal Structure:**
```
Dialog (35vw, responsive: 95vw mobile, 85vw tablet)
├── Header
│   ├── Title: "รายละเอียดห้อง {room_title}"
│   └── Badge: "{count} สมาชิก" (bg-blue-600, text-white)
│
└── Tabs (2 tabs, h-12, flex overflow-x-auto สำหรับ mobile, flex-1 for equal width)
    ├── Tab 1: สมาชิกในห้อง (fa-users)
    │   ├── Table with Avatar (2 letters from name)
    │   ├── Columns: สมาชิก, ประเภท, อีเมล, สถานะ, เข้าร่วมเมื่อ, การดำเนินการ
    │   ├── Badge Types:
    │   │   ├── Owner: bg-yellow-100, text-[#D97706]
    │   │   └── Resident: bg-blue-50, text-blue-700
    │   ├── Status Badge:
    │   │   ├── 1: อนุมัติแล้ว (green)
    │   │   ├── 0: รออนุมัติ (yellow)
    │   │   └── 3: ถูกระงับ (red)
    │   ├── Action: View button (fa-eye) เปิด Member Detail Modal
    │   └── Pagination (API: member/list with page & limit)
    │
    └── Tab 2: ประวัติการชำระ (fa-file-invoice-dollar)
        ├── API: bill/bill_room_each_list?page={page}&limit={limit}&house_no={house_no}&customer_id={customer_id}
        ├── Auto-fetch เมื่อเปลี่ยนมาที่ tab (onValueChange)
        ├── Summary Cards (Grid 3 columns)
        │   ├── ยอดค่างวดระปัจจุบัน (pending_amount)
        │   ├── ชำระครบแล้ว (payment_completion) - green
        │   └── การชำระครั้งถัดไป (next_payment_date)
        ├── Table with Loading Overlay
        │   ├── Columns: วันที่ (expire_date), บิลเลขที่ (bill_no), รายการ (bill_title),
        │   │           จำนวนเงิน (total_price), สถานะ (status), การดำเนินการ
        │   ├── Status Badge:
        │   │   ├── 1: ชำระแล้ว (green)
        │   │   ├── 0: รอชำระ (yellow)
        │   │   └── 3: เกินกำหนด (red)
        │   ├── Action: ดูใบเสร็จ button (fa-eye, blue)
        │   └── Loading: Overlay with spinner (ไม่ clear data)
        └── Pagination
```

**Member Detail Modal:**
```
Dialog (35vw, responsive)
├── Header
│   ├── Avatar: 2 letters, bg-blue-600, rounded-lg
│   ├── Name: prefix + full_name
│   └── Badges:
│       ├── ประเภท: owner (yellow) / resident (blue)
│       ├── สถานะ: อนุมัติแล้ว / รออนุมัติ / ถูกระงับ
│       └── ห้อง: bg-blue-50, text-blue-700 (fa-door-open)
│
├── Section 1: ข้อมูลส่วนตัว
│   ├── ชื่อ-นามสกุล (fa-user)
│   ├── เบอร์โทรศัพท์ (fa-phone)
│   └── อีเมล (fa-envelope)
│
├── Section 2: ข้อมูลการพักอาศัย
│   ├── ห้องเลขที่ (fa-door-open)
│   ├── วันที่เข้าอยู่ (fa-calendar)
│   └── ประเภทสมาชิก (fa-user-tag)
│
└── Footer
    └── ปิด Button
```

**API Endpoints:**
- Room List: `api/room/list?page={page}&limit={limit}&customer_id={customer_id}&keyword={keyword}`
- Room Summary: `api/room/get_summary_data?customer_id={customer_id}` (fetch once on mount)
- Member List: `api/member/list?page={page}&limit={limit}&customer_id={customer_id}&room_id={room_id}`
- Member Detail: `api/member/{id}?customer_id={customer_id}`
- Payment History: `api/bill/bill_room_each_list?page={page}&limit={limit}&house_no={house_no}&customer_id={customer_id}`
- Delete: `api/room/delete` (POST with id, uid, customer_id)

### Billing Management Page (`/billing`)

**Main Features:**
- **Summary Cards** (5 cards): แสดงสถิติด้านบน (fetch once on mount, separate from list)
- จัดการหัวข้อบิลพร้อมนำเข้าข้อมูลจาก Excel/CSV
- Search: หัวข้อบิล, งวด, วันที่
- View Modal แสดงรายละเอียดบิลแบบ info-row
- Bill Room Details Modal: แสดงรายการบิลของแต่ละห้อง (คลิกจำนวนห้อง)
- สร้างบิลพร้อมนำเข้ารายการห้องจาก Excel

**Table Columns:**
- หัวข้อแจ้งบิล (title + งวด + ครบกำหนด)
- วันเวลาที่สร้าง (แยก 2 บรรทัด)
- วันเวลาที่แจ้ง (แยก 2 บรรทัด)
- จำนวนห้อง (total_room + " ห้อง")
- ยอดรวม (บาท) - font-semibold, ชิดขวา
- สถานะการแจ้ง (0=ฉบับร่าง, 1=แจ้งแล้ว)
- การดำเนินการ (View only)

**Create Bill Modal (1000px):**
```
Dialog
├── Form Fields (Grid 2 columns)
│   ├── หัวข้อบิล (title)
│   ├── ประเภทบิล (bill_type_id) - Dropdown จาก api/bill_type/list
│   ├── งวดที่เรียกเก็บ (detail)
│   └── วันครบกำหนดชำระ (expire_date) - Date picker
│
├── หมายเหตุ (remark) - Textarea, optional
│
├── นำเข้าข้อมูลรายการบิล Section
│   ├── ปุ่มดาวน์โหลด Template (CSV, XLSX)
│   ├── Upload Excel/CSV file
│   └── คำอธิบาย: เลขห้อง, ชื่อลูกบ้าน, ยอดเงิน, หมายเหตุ
│
├── ตรวจสอบข้อมูลที่นำเข้า (แสดงหลัง upload)
│   ├── Table: #, เลขห้อง, ชื่อลูกบ้าน, ยอดเงิน (฿x,xxx), หมายเหตุ, สถานะ, จัดการ (ลบ)
│   └── Summary Cards (Grid 4 columns)
│       ├── รายการทั้งหมด (total_rows)
│       ├── รายการถูกต้อง (valid_rows) - green
│       ├── รายการผิดพลาด (invalid_rows) - red
│       └── ยอดรวม (total_price)
│
└── Footer Buttons
    ├── ยกเลิก
    ├── บันทึกฉบับร่าง (status=0)
    └── สร้างและส่งแจ้งเตือน (status=1)
```

**Upload & Preview Flow:**
1. User เลือกไฟล์ Excel/CSV
2. Upload ไป `api/upload_file` (params: upload_key, menu="bill", files)
3. เรียก `api/bill/bill_excel_list?upload_key=xxx` เพื่อดึงข้อมูล preview
4. แสดงตารางพร้อม summary
5. User สามารถลบรายการได้ (frontend only, เก็บใน excluded_rows)
6. ถ้าลบจนหมด → รีเซ็ตกลับไปสถานะยังไม่ upload

**Delete Row Logic:**
- Delete frontend only (ไม่เรียก API)
- เก็บ row_number ไว้ใน excluded_rows array
- Submit ส่งเป็น comma-separated: "1,2,3"
- Summary อัปเดตตาม status:
  - Status 0: ลด total_rows, invalid_rows
  - Status 1: ลด total_rows, valid_rows, total_price

**View Modal (info-row pattern):**
```
Dialog (600px)
├── รหัสบิล: bill_no
├── หัวข้อบิล: title
├── งวด: detail
├── วันที่สร้าง: create_date_formatted
├── วันที่แจ้ง: send_date_formatted
├── วันครบกำหนด: expire_date_formatted (ตัดเวลาออก)
├── จำนวนห้อง: total_room + " ห้อง"
├── ยอดรวม: total_price (text-blue-600 font-semibold)
└── สถานะ: Badge (แจ้งแล้ว/ฉบับร่าง)

Layout: flex justify-between, label ซ้าย value ขวา
```

**Bill Room Details Modal:**
```
Dialog (1200px)
├── Header: รายละเอียดบิลแต่ละห้อง (fa-file-invoice)
│
├── Bill Info Section (bg-blue-50, 3 rows x 3 columns)
│   ├── Row 1: หัวข้อบิล, ประเภทบิล (bill_type_title), งวดที่เรียกเก็บ (detail)
│   ├── Row 2: จำนวนห้องทั้งหมด (total_rows), ยอดรวมทั้งหมด (total_price), สถานะการแจ้ง (status badge)
│   └── Row 3: วันเวลาที่สร้าง, วันเวลาที่แจ้ง
│
├── Search & Filter Section
│   ├── SearchBar (keyword)
│   ├── Status Filter Dropdown (-1=ทุกสถานะ, 1=ชำระแล้ว, 0=รอชำระ, 3=เกินกำหนด)
│   └── Export Button (placeholder)
│
├── Table with Loading Overlay
│   ├── Columns: เลขห้อง (bill_no), ชื่อลูกบ้าน (member_name), ยอดรวม (total_price),
│   │           วันครบกำหนด (expire_date - ไม่แสดงเวลา), สถานะ (status), การดำเนินการ
│   ├── Status Badge:
│   │   ├── 1: ชำระแล้ว (green)
│   │   ├── 0: รอชำระ (yellow)
│   │   └── 3: เกินกำหนด (red)
│   ├── Actions:
│   │   ├── ส่งแจ้งเตือน button (fa-bell, yellow) - แสดงเมื่อ status = 0 or 3
│   │   └── Always available actions...
│   └── Loading: Overlay with spinner (min-height: 400px, ไม่ clear data เมื่อเปลี่ยนหน้า)
│
├── Summary Statistics (4 columns)
│   ├── ชำระแล้ว (status_1)
│   ├── รอชำระ (status_0)
│   ├── เกินกำหนด (status_3)
│   └── ยอดเงินที่ชำระแล้ว (paid)
│
└── Pagination
```

**Loading State Pattern:**
- First load (page=1): Clear data, show loading
- Page change (page>1): Keep data, show overlay
- ป้องกันการกระพริบโดยไม่ clear data และใช้ overlay แทน

**API Endpoints:**
- Bill List: `api/bill/list?page={page}&limit={limit}&customer_id={customer_id}&keyword={keyword}`
- Bill Summary: `api/bill/get_summary_data?customer_id={customer_id}` (fetch once on mount)
- Bill Room List: `api/bill/bill_room_list?page={page}&limit={limit}&keyword={keyword}&bill_id={bill_id}&status={status}`
- Bill Types: `api/bill_type/list?page=1&limit=100`
- Upload File: `api/upload_file` (POST: upload_key, menu, files)
- Bill Excel List: `api/bill/bill_excel_list?upload_key={upload_key}`
- Insert with Excel: `api/bill/insert_with_excel` (POST)
  - Payload: upload_key, title, bill_type_id, detail, expire_date, remark, customer_id, status, uid=-1, excluded_rows
- Bill Detail: `api/bill/{id}`
- Template Downloads:
  - CSV: `{baseUrl}/uploads/template_bill_csv.csv`
  - XLSX: `{baseUrl}/uploads/template_bill_excel.xlsx`

**Button States:**
- ปุ่ม Insert disabled เมื่อ:
  - ยังไม่ upload file (!showDataPreview)
  - Form ไม่ครบ
  - กำลัง submit

### Reusable Components

#### SearchBar
- Input field with search icon
- Enter to search, X button to clear
- Placeholder customizable

#### TableActionButtons
- View button: bg-blue-50, text-blue-700, no border, fa-eye icon
- Edit button: bg-blue-50, text-blue-700, no border, fa-edit icon
- Delete button: bg-[#fee2e2], text-[#ef4444], no border, fa-trash icon
- Show/hide each button via props
- Icons: Font Awesome (ไม่ใช้ Lucide React)

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
3. **Icons** - ใช้ Font Awesome (`<i className="fas fa-icon-name"></i>`) แทน Lucide React ทั้งหมด
4. **Badge styling** - ใช้ `rounded` (4px) ไม่ใช้ `rounded-full`
5. **Modal width** - ต้องใช้ `!` prefix เพื่อ override default (35vw with responsive)
6. **Reusable components** - SearchBar, TableActionButtons, Pagination, ConfirmDialog, LoadingSpinner, ErrorAlert
7. **Avatar in table** - แสดง 2 ตัวอักษรแรกของชื่อ, bg-blue-600, rounded-lg
8. **Tab spacing** - ต้องมี `mt-6` เพื่อเว้นระยะจาก tab header
9. **Tab responsive** - ใช้ `flex overflow-x-auto` แทน `grid grid-cols-3` สำหรับ mobile
10. **Summary cards** - Icon ใช้ `rounded-full` (w-12 h-12), number (text-3xl font-bold), change (font-bold)

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

### Font Awesome Setup

**Installation:**
```bash
npm install @fortawesome/fontawesome-free
```

**Import in `src/app/layout.tsx`:**
```typescript
import '@fortawesome/fontawesome-free/css/all.min.css';
```

**Usage:**
```tsx
<i className="fas fa-door-open"></i>  // Solid icons
<i className="far fa-user"></i>       // Regular icons
<i className="fab fa-github"></i>     // Brand icons
```

**Common Icons Used:**
- `fa-eye` - View action
- `fa-edit` - Edit action
- `fa-trash` - Delete action
- `fa-users` - Members/Users
- `fa-door-open` - Room/Door
- `fa-user` - Single user
- `fa-phone` - Phone
- `fa-envelope` - Email
- `fa-calendar` - Calendar/Date
- `fa-user-tag` - User type/tag
- `fa-key` - Owner/Key
- `fa-user-friends` - Family/Friends
- `fa-file-invoice-dollar` - Payment/Invoice
- `fa-address-card` - Contact info
- `fa-arrow-up` / `fa-arrow-down` - Trend indicators

### Loading State Best Practices

**Anti-Flicker Pattern (for pagination):**
```typescript
// Prevent flickering when changing pages
const fetchData = async (page: number = 1) => {
  // Only clear data on first load
  if (page === 1) {
    setData(null);
  }
  setLoading(true);

  const result = await apiCall(url);

  if (result.success) {
    setData(result.data);
    setPagination(result.pagination);
  } else {
    if (page === 1) {
      setData(null);
    }
  }

  setLoading(false);
};
```

**UI Implementation:**
```tsx
// Table with loading overlay (not replacing content)
<div className="border rounded-lg overflow-hidden relative">
  {loading && (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
        <div className="text-sm text-slate-600">กำลังโหลดข้อมูล...</div>
      </div>
    </div>
  )}
  <table className="w-full">
    <tbody className="divide-y divide-slate-100" style={{ minHeight: '400px' }}>
      {/* Table rows */}
    </tbody>
  </table>
</div>

// Summary cards with skeleton loading (first load only)
{!data ? (
  <div className="grid grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded mb-2 w-2/3"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-3 gap-4">
    {/* Actual cards */}
  </div>
)}
```

**Key Points:**
- ไม่ clear data เมื่อเปลี่ยนหน้า (page > 1)
- ใช้ loading overlay แทนการซ่อนเนื้อหา
- ตั้ง min-height ให้ table body เพื่อป้องกันความสูงเปลี่ยน
- Summary cards ไม่กระพริบเพราะไม่ clear data
- ใช้ skeleton loading สำหรับ first load

---

## Recent Updates

### 2025-10-22: Payment Management System

**Payment Page (จัดการการชำระเงิน):**

1. **Tab Structure (4 tabs)**:
   - Tab 1: รอตรวจสอบและอนุมัติ (status=0)
   - Tab 2: อนุมัติและชำระแล้ว (status=1)
   - Tab 3: ปฏิเสธ (status=3)
   - Tab 4: รายงานและสถิติ (placeholder)

2. **Summary Cards (5 cards)** - ด้านบนระหว่าง tabs และ search:
   - API: `payment/get_summary_data?customer_id=xxx`
   - Cards:
     - บิลทั้งหมดเดือนนี้ (total_bill_rooms)
     - รอชำระ (pending_payment)
     - ชำระแล้ว (approved_payment)
     - ถูกปฏิเสธ (rejected_payment)
     - บิลค้างชำระ (unpaid_bill_rooms)
   - แต่ละ card แสดง: count, change_text, arrow up/down (ตาม change >= 0)
   - Color: green ถ้า change >= 0, red ถ้า < 0

3. **Filter Section** (tabs 1, 2, 3):
   - จำนวนเงิน: ทั้งหมด(1), <5000(2), 5000-10000(3), >10000(4)
   - ช่วงเวลา: ทั้งหมด(1), วันนี้(2), สัปดาห์นี้(3), เดือนนี้(4), กำหนดเอง(5)
   - ส่งเป็น params: `amount_range`, `date_range`

4. **Review Slip Modal** (900px width):
   - API: `payment/{id}` เมื่อคลิก View
   - Layout:
     - Slip image (ถ้ามี): object-contain, white background, clickable
     - Slip Details (3 columns grid):
       - สมาชิก (member_name)
       - รายละเอียด (member_detail)
       - จำนวนเงิน (payment_amount)
       - วันที่โอน (transfer_date)
       - ธนาคาร (bank_name)
       - หมายเหตุจากลูกบ้าน (member_remark)
     - Bill Info Section (bg-blue-50, 3 columns):
       - เลขที่บิล (bill_no), ชื่อบิล (bill_title), ประเภทบิล (bill_type)
       - งวด (bill_period), จำนวนเงิน (bill_amount), วันครบกำหนด (due_date - ไม่มีเวลา)
       - ผู้อนุมัติ (approver_name), สถานะ (badge with icon)
       - เหตุผลการปฏิเสธ (reject_reason - แสดงถ้า status=3)
   - Modal Title: เปลี่ยนตาม status
     - status 0: "ตรวจสอบสลิปการโอน"
     - อื่นๆ: "ดูรายละเอียด"
   - Footer Buttons (tab 1 only):
     - ปฏิเสธ (red) - เปิด reject dialog
     - อนุมัติ (green) - approve เดี่ยว

5. **Table (tabs 1, 2, 3)**:
   - Columns: checkbox (tab 1), avatar, สมาชิก, บิล, ยอดเงิน, วันที่, สถานะ, เหตุผล, การดำเนินการ
   - Checkbox selection (tab 1 only) with select all
   - Avatar: 2 letters, gradient `linear-gradient(135deg, #2B6EF3, #1F4EC2)`
   - เหตุผล column: truncate with max-width 200px, tooltip on hover
   - Status badges with icons (modal only):
     - รออนุมัติ (yellow, fa-clock)
     - อนุมัติแล้ว (green, fa-check-circle)
     - ปฏิเสธ (red, fa-times-circle)

6. **Approve/Reject Actions**:
   - API: `payment/update` (PUT method)
   - Payload: id (or comma-separated ids), status, remark (ถ้า reject), uid
   - Approve: เดี่ยว หรือ เลือกหลายรายการ (tab 1)
   - Reject: ต้องกรอก remark ใน dialog
   - หลัง submit: refresh ทั้ง list + summary status + summary data

7. **API Endpoints**:
   - List: `payment/list?customer_id=xxx&status=0&page=1&limit=20&amount_range=1&date_range=1`
   - Summary Status (badges): `payment/summary_status?customer_id=xxx`
   - Summary Data (5 cards): `payment/get_summary_data?customer_id=xxx`
   - Detail: `payment/{id}?customer_id=xxx`
   - Update: `payment/update` (PUT: id, status, uid, remark)

8. **Key Features**:
   - UID ใช้จาก `user?.uid` แทน hard code
   - Loading state ใน modal ใช้ LoadingSpinner
   - Tab badges แสดงจำนวนจาก `summary_status`
   - Summary cards และ status ต้อง refresh หลัง approve/reject

### 2025-10-24: Payment Page - Manual Payment Recording

**Manual Payment Modal (Tab 0 - รอชำระ):**

1. **Modal Structure** (800px width):
   - Header: "บันทึกการชำระเงินแบบ Manual" + close button
   - Body: 2 sections (ข้อมูลบิล + รายละเอียดการชำระ)
   - Footer: ยกเลิก, บันทึกการชำระเงิน (green)

2. **Bill Information Section** (2 columns grid):
   - เลขห้อง (house_no)
   - บิลเลขที่ (bill_no)
   - ชื่อลูกบ้าน (member_name)
   - หัวข้อบิล (bill_title)
   - ยอดรวมบิล (total_price)
   - ชำระแล้ว (hard-coded ฿0 for now)
   - ยอดค้าง (remaining_amount, text-red-700)

3. **Payment Details Form** (2 columns grid):
   - วิธีการชำระเงิน * (dropdown): API `bill_transaction/bill_transaction_type`
     - SelectTrigger: `w-full h-[42px] px-3 py-2 border border-slate-300 rounded-md bg-white`
   - จำนวนเงินที่ชำระ * (number input):
     - ปุ่ม "ชำระเต็มจำนวน" (ด้านล่าง input): `text-xs px-3 py-1.5 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50`
     - Set value = remaining_amount (remove ฿ and commas)
   - วันที่ชำระ (date input)
   - เวลาที่ชำระ (time input)

4. **Payment Method Specific Fields** (Conditional UI):
   - **Method 1 (เงินสด)**:
     - Info message only: "กรุณาตรวจนับเงินสดให้ถูกต้องก่อนบันทึก"
   - **Method 2 (โอนเงินธนาคาร)** - 2 columns grid:
     - ธนาคารที่โอน (transfer_bank)
     - เลขที่อ้างอิง (transfer_ref)
   - **Method 3 (เช็ค)** - 2 columns grid:
     - หมายเลขเช็ค (check_number)
     - ธนาคารที่ออกเช็ค (check_bank)
     - วันที่เช็ค (check_date) - full width
     - Warning: "กรุณาเก็บเช็คต้นฉบับไว้เป็นหลักฐาน" (yellow-50 bg)
   - **Method 4 (บัตรเครดิต)** - 2 columns grid:
     - หมายเลขอ้างอิง (card_ref) - Approval Code
     - 4 หลักท้ายของบัตร (card_last4) - maxLength: 4
   - **Method 5 (อื่นๆ)**:
     - ระบุวิธีการชำระ (other_method) - placeholder: "คูปอง, บัตรกำนัล"
   - **Styling**: bg-blue-50, p-4, rounded-lg, border-l-4 border-blue-500
   - **Input fields**: bg-white (all conditional inputs)

5. **Payment Calculation Summary** (bg-slate-50):
   - จำนวนเงินที่ชำระ
   - ยอดคงเหลือหลังชำระ (calculate: remaining_amount - payment_amount)

6. **Notes Field** (full width):
   - หมายเหตุเพิ่มเติม (textarea, 3 rows, optional)

7. **API Integration**:
   - Submit to: `bill_transaction/insert` (POST)
   - Payload:
     ```typescript
     {
       bill_room_id: item.id,
       bill_transaction_type_id: parseInt(selectedPaymentMethod),
       transaction_amount: parseFloat(paymentAmount),
       pay_date: "${paymentDate} ${paymentTime}:00",
       remark: paymentNotes || '',
       transaction_type_json: JSON.stringify({
         bill_transaction_type_id: parseInt(selectedPaymentMethod),
         // Method-specific fields:
         transfer_bank, transfer_ref,      // Method 2
         check_number, check_bank, check_date,  // Method 3
         card_ref, card_last4,             // Method 4
         other_method                      // Method 5
       }),
       customer_id: customerId,
       uid: uid
     }
     ```
   - After success: refresh list + summary_status2

8. **Action Button Trigger** (Tab 0 table):
   - Column: การดำเนินการ
   - Button: "บันทึกการชำระ" (badge style with status colors)
   - Icon: fa-dollar-sign
   - Class: `cursor-pointer` for hover effect

9. **Tab 0 Filters**:
   - หัวข้อบิล (dropdown): API `bill_type/list`
     - Option -1: "ทุกหัวข้อบิล"
     - Send as: `bill_type_id`
   - สถานะ (dropdown): API `bill/bill_status`
     - Send as: `status`

10. **Tab 0 Summary Cards** (3 cards, bottom of page):
    - API: `payment/summary_status2?customer_id=xxx`
    - Cards:
      - บิลรอชำระ (card1) - Yellow, fa-clock
      - เกินกำหนด (card2) - Red, fa-exclamation-triangle
      - ยอดค้างรวม (card3) - Blue, fa-dollar-sign
    - No hover effect (removed cursor-pointer)

11. **UI/UX Improvements**:
    - All modal action buttons have `cursor-pointer` class:
      - Payment page: "บันทึกการชำระ", "ดู" (review slip)
      - Billing page: "จำนวนห้อง", "ดู", "ยกเลิกการแจ้ง", "ส่งการแจ้งเตือน", "แก้ไข", "ลบ"

### 2025-10-30: Shared Components & Payment System Enhancements

**Shared Components - Transaction & Review Slip Modals:**
1. **TransactionDetailModal** (`/src/components/transaction-detail-modal.tsx`):
   - Props: `open`, `onOpenChange`, `billRoomId`, `onSlipClick` (optional callback)
   - API: `bill_room/{id}` - ดึงข้อมูล bill_room + latest transaction
   - แสดง:
     - Bill Info: เลขที่บิล, หัวข้อ, ลูกบ้าน, ยอดรวม, ชำระแล้ว, ยอดค้าง
     - Transaction Details: วิธีการชำระ, จำนวนเงิน, วันที่ชำระ, วันที่บันทึก, หมายเหตุ
     - Payment Method Specific Fields (read-only): เงินสด, โอนเงิน, เช็ค, บัตรเครดิต, อื่นๆ
   - Special: ถ้า `bill_transaction_type_id === 6` แสดงปุ่ม "ดู" (fa-eye) เปิด slip detail
   - ใช้ใน: Payment page (tab 0), Billing page (Bill Room Details Modal), Room page (Payment History tab)

2. **ReviewSlipModal** (`/src/components/review-slip-modal.tsx`):
   - Props: `open`, `onOpenChange`, `data`, `loading`, `showActions` (optional), `onApprove`, `onReject`, `submitting`, `getStatusBadge`
   - แสดง:
     - Slip Image: clickable, object-contain
     - Slip Details (3 columns): ผู้โอน, จำนวนเงิน, วันที่โอน, ธนาคาร, บิลที่อ้างอิง, หมายเหตุ
     - Bill Info: หัวข้อ, ประเภท, งวด, จำนวนที่ต้องชำระ, วันครบกำหนด, สถานะ, เหตุผลปฏิเสธ
   - Conditional Footer:
     - `showActions=true`: แสดงปุ่ม ปฏิเสธ (red) + อนุมัติ (green)
     - `showActions=false`: แสดงแค่ปุ่ม ปิด
   - ใช้ใน: Payment page (tab 1, showActions=true), Billing page (view-only, showActions=false), Room page (view-only)

**Payment Page Updates:**
1. **Tab 0 - Dynamic Status Labels**:
   - API: `bill/bill_status?page=1&limit=100`
   - ใช้ dynamic labels จาก API แทน hardcode
   - Support status: 0 (รอชำระ), 1 (ชำระแล้ว), 3 (เกินกำหนด), 4 (ชำระบางส่วน), 5 (รอตรวจสอบ)
   - Status 5: ไม่แสดงปุ่ม "บันทึกการชำระ" (แสดง "-" แทน)

2. **Tab 1 - Hardcoded Status**:
   - แสดง "รอตรวจสอบ" แบบ hardcode (เพราะ API แยกต่างหาก)
   - ไม่ใช้ `getStatusBadge()` function

3. **Manual Payment Modal**:
   - ลบ field "ประเภทการชำระ" ออกจาก Transaction Detail Modal
   - Field "จำนวนเงิน" เป็น readonly และชำระเต็มจำนวนเท่านั้น

**Billing Page Updates:**
1. **Status Integration**:
   - API: `bill/bill_status?page=1&limit=100`
   - ใช้ dynamic labels ใน Bill Room Details Modal
   - Support status: 0, 1, 3, 4, 5

2. **Action Buttons**:
   - ซ่อนปุ่ม "ยกเลิกการแจ้ง" เมื่อ status = 1 (แจ้งแล้ว)
   - เหลือแค่ปุ่ม "ดู" สำหรับ status = 1

**Room Page Updates:**
1. **Payment History Tab**:
   - แสดงปุ่ม "ดูบิล" เฉพาะ `status === 1` (ชำระแล้ว)
   - ถ้า status ไม่ใช่ 1: แสดง "-"
   - เปลี่ยนจาก `fetchBillDetail()` เป็นใช้ `TransactionDetailModal`
   - ส่ง `item.id` (bill_room_id) แทน bill_id
   - Support slip viewing ผ่าน `onSlipClick` callback

**Dashboard Updates:**
- Block "สถานะบิล": เปลี่ยน "รอชำระ" → "รอชำระและรอตรวจสอบ"
- Mock data และ display text อัปเดตแล้ว

**UI/UX Improvements - Hover Effects:**
- ทุกปุ่มที่มี action ต้องมี hover effect: `hover:shadow-md`, `transition-all`, `cursor-pointer`
- ปุ่มที่ได้รับการปรับปรุง:
  - Payment page: ดูรายละเอียด, บันทึกการชำระ, ดู slip
  - Billing page: ดู, ยกเลิกการแจ้ง, ส่งการแจ้งเตือน, แก้ไข, ลบ, X ห้อง
  - TransactionDetailModal: ปุ่มดู slip

**Code Deduplication:**
- สร้าง shared components ลดโค้ดซ้ำซ้อน:
  - TransactionDetailModal: ~240 บรรทัด
  - ReviewSlipModal: ~200 บรรทัด
- ใช้งานข้ามหน้า: Payment, Billing, Room

### 2025-10-31: Review Slip Status & Billing Modal Updates

**ReviewSlipModal Status Update:**
1. **Hardcoded Status Labels** (ไม่ใช้ API `bill/bill_status`):
   - Status 0: "รอตรวจสอบ" (yellow, fa-clock)
   - Status 1: "ชำระแล้ว" (green, fa-check-circle)
   - Status 3: "ปฏิเสธ" (red, fa-times-circle)
   - ลบ `getStatusBadge` prop ออกจาก component interface
   - ใช้ conditional rendering แทน dynamic badge function

2. **Slip Background Color**:
   - เปลี่ยนพื้นหลัง slip image จาก `bg-white` เป็น `bg-slate-800`
   - เพื่อให้เห็นส่วนโค้งขาวด้านบนของสลิปชัดเจนขึ้น

**Billing Modal - Bill Room Details:**
1. **Status Column Update**:
   - เช็ค `bill_info.status === 0` (บิลยังไม่ส่ง/ฉบับร่าง)
   - ถ้าเป็น 0: แสดง "-" ในคอลัม "สถานะชำระ"
   - ถ้าไม่ใช่ 0: แสดง badge status ตามปกติ (รอชำระ, ชำระแล้ว, เกินกำหนด)
   - เหตุผล: เมื่อบิลยังเป็นฉบับร่าง ยังไม่มีสถานะการชำระ

**Payment Page:**
- ใช้ `data.status` จาก API `payment/{id}` ใน ReviewSlipModal
- ไม่ใช้ `bill_room_status` field

### 2025-10-28: Status Badge & Room Sync Updates

**Payment Status Badge - Status 4 (ชำระบางส่วน):**
1. **Payment Page** (Tab 0):
   - เพิ่ม case 4 ใน `getStatusBadge()`: label "ชำระบางส่วน", color `text-[#0891B2]`
   - แสดงใน column "สถานะ" และ "คงค้าง"

2. **Billing Page** (Bill Room Details Modal):
   - เพิ่ม case 4 ใน `getPaymentStatusBadge()`: label "ชำระบางส่วน", className `bg-blue-50 text-[#0891B2]`
   - เพิ่ม SelectItem "ชำระบางส่วน" value="4" ใน status filter dropdown

3. **Room Page** (Payment History Tab):
   - เพิ่ม case 4 ใน `getPaymentStatusBadge()`: label "ชำระบางส่วน", className `bg-blue-50 text-[#0891B2]`
   - แสดงใน column "สถานะ" ของตาราง ประวัติการชำระ

**Manual Payment Modal Bug Fix:**
- แก้ไข "ยอดคงเหลือหลังชำระ" แสดง ฿฿ ซ้ำ
- เมื่อยังไม่กรอกยอดเงิน: แสดง remaining_amount หลัง remove ฿ และ format ใหม่
- แสดงแค่ ฿ เดียว ทั้งกรณีมีและไม่มียอดเงินที่ชำระ

**Room Page - Firebase Sync Feature:**
1. **Sync Button**:
   - ตำแหน่ง: ถัดจาก SearchBar (ใน flex gap-3)
   - Icon: `fa-sync-alt` (animate-spin ขณะ syncing)
   - Label: "ซิงค์ข้อมูล"
   - Styling: `variant="outline" h-11 px-4 gap-2 cursor-pointer`
   - Disabled state เมื่อกำลัง sync

2. **API Integration**:
   - Endpoint: `room/sync_from_firebase` (POST)
   - Payload: `{ customer_id, uid }`
   - Response: success, message, data (rooms/members stats)
   - Success: แสดง toast + refresh list + refresh summary
   - Error: แสดง toast error

3. **Loading Overlay**:
   - Full-screen overlay (fixed inset-0, z-50)
   - Background: `bg-black/50 backdrop-blur-sm`
   - Content: white card with spinner + "กำลังซิงค์ข้อมูล" + "กรุณารอสักครู่..."
   - Spinner: blue gradient border with rotate animation
   - ป้องกัน user interaction ขณะซิงค์

4. **State Management**:
   - `syncing` state: ควบคุม loading overlay และ button disabled
   - Set syncing(true) → API call → toast → refresh → syncing(false)

**UI/UX Best Practice Note**:
- ปุ่มทั้งหมดที่กดได้ต้องมี `cursor-pointer` class เพื่อแสดง hand cursor
- ปุ่มที่ใช้เวลานานต้องมี loading state และป้องกัน double-click
- ทุกปุ่มที่มี action ควรมี hover effect: `hover:shadow-md`, `transition-all`

### 2025-10-22: Build Error Fixes

**TypeScript Compilation Errors:**

1. **Missing UID Constant**:
   - ❌ Hard-coded: `const UID = 5`
   - ✅ Fixed: ใช้ `user?.uid` จาก `getCurrentUser()` แทน
   - ไฟล์ที่แก้: payment/page.tsx, billing/page.tsx, test/page.tsx

2. **Missing API Constants**:
   - payment/page.tsx: เพิ่ม `API_INSERT`, `API_UPDATE`
   - test/page.tsx: ตรวจสอบครบทุกค่า

3. **Missing refreshList Function**:
   - payment/page.tsx: เพิ่มฟังก์ชัน `refreshList()` แบบเดียวกับ billing
   - รองรับ tab filtering และ reset to first page

4. **File Upload Pattern**:
   - เปลี่ยนจาก `uploadFiles(files, uploadKey, MENU, UID)`
   - เป็น `uploadFiles(files, uploadKey, MENU, uid)` โดย uid = user?.uid || -1

5. **Best Practice**:
   - ไม่ hard code UID - ใช้ current user's uid
   - ทุกครั้งที่เรียก uploadFiles/deleteFile ต้องดึง uid จาก getCurrentUser()

### 2025-10-15: Room Payment History & UI Improvements

**Room Modal Updates:**
1. **Tab 3 (ข้อมูลการติดต่อ)**: Comment out - ใช้งานแค่ 2 tabs (สมาชิก, ประวัติการชำระ)
2. **Tab 2 (ประวัติการชำระ)**:
   - API Integration: `bill/bill_room_each_list` with pagination
   - Summary Cards: ยอดค่างวด, ชำระครบแล้ว, การชำระครั้งถัดไป
   - Payment History Table: วันที่, บิลเลขที่, รายการ, จำนวนเงิน, สถานะ, ดูใบเสร็จ
   - Loading overlay pattern (ไม่กระพริบ)
   - Auto-fetch เมื่อเปลี่ยนมาที่ tab

**Billing Modal Updates:**
1. **Bill Room Details Modal**:
   - เพิ่ม ประเภทบิล และ งวดที่เรียกเก็บ ใน header section
   - Layout: 3 rows x 3 columns (หัวข้อบิล/ประเภท/งวด, จำนวนห้อง/ยอดรวม/สถานะ, วันที่)
2. **Create Bill Modal**:
   - DropDown ประเภทบิล: เพิ่ม `className="w-full"` ให้ยืดเต็มความกว้าง

### 2025-10-13: Billing Management System

**Billing Page (จัดการบิล):**
1. **List View**:
   - ตารางแสดงบิลพร้อม search
   - Columns: หัวข้อแจ้งบิล, วันที่สร้าง, วันที่แจ้ง, จำนวนห้อง, ยอดรวม, สถานะ
   - View Modal แบบ info-row pattern

2. **Create Bill with Excel Import**:
   - Form: หัวข้อบิล, ประเภทบิล (dropdown จาก API), งวด, วันครบกำหนด, หมายเหตุ
   - Upload Excel/CSV file พร้อม preview data
   - ดาวน์โหลด Template (CSV, XLSX)
   - ตาราง preview พร้อม delete row (frontend only)
   - Summary cards แบบ real-time (รายการทั้งหมด, ถูกต้อง, ผิดพลาด, ยอดรวม)
   - 2 ปุ่ม submit: บันทึกฉบับร่าง (status=0), สร้างและส่งแจ้งเตือน (status=1)

3. **Key Features**:
   - Delete row อัปเดต summary ตาม status (0=ลบจาก invalid, 1=ลบจาก valid+price)
   - ลบจนหมดรีเซ็ตกลับสถานะยังไม่ upload
   - Excluded rows ส่งเป็น comma-separated ตอน submit
   - ปุ่ม Insert disabled จนกว่าจะ upload file และกรอกฟอร์มครบ

### 2025-10-13: UI Updates
1. **Sidebar Icons Migration**: เปลี่ยนจาก Lucide React เป็น Font Awesome ทั้งหมด
2. **Menu Structure**:
   - เพิ่มเมนู "จัดการการชำระเงิน" ภายใต้ "ค่าใช้จ่าย" (fa-credit-card)
   - ย้าย "ทดสอบหน้าลิส" ไปเป็นเมนูหลักหลัง "ตั้งค่า"
3. **Login Page Redesign**:
   - Two-column layout (branding + form)
   - Animated floating background circles
   - Modern form styling with icons inside inputs
   - Password toggle, remember me checkbox
   - Responsive design (single column on mobile)
   - Custom CSS animations (float, slide-up, slide-down)
   - Maintained customer_id dialog flow
