# RPMS - Residential Property Management System

## โครงสร้างโปรเจค

Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui

```
src/
├── app/
│   ├── (main)/          # หน้าที่ต้อง login
│   │   ├── layout.tsx   # Layout พร้อม Sidebar + Toaster
│   │   ├── dashboard/
│   │   ├── billing/
│   │   ├── test/        # หน้าทดสอบ CRUD
│   │   ├── resident/
│   │   └── settings/
│   ├── login/
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── confirm-dialog.tsx
│   ├── pagination.tsx
│   ├── loading-spinner.tsx
│   ├── error-alert.tsx
│   ├── file-upload-section.tsx
│   ├── file-preview.tsx
│   ├── search-bar.tsx
│   ├── table-action-buttons.tsx
│   ├── sidebar.tsx
│   ├── page-header.tsx
│   └── user-menu.tsx
├── lib/
│   ├── api.ts           # apiCall() - API utility
│   ├── utils.ts         # cn(), generateUploadKey(), uploadFiles(), deleteFile()
│   └── auth.ts
└── config/
    └── constants.ts     # LIMIT
```

## Components ที่สร้างไว้

### 1. ConfirmDialog
**ไฟล์:** `src/components/confirm-dialog.tsx`

Generic dialog สำหรับยืนยันการทำงาน (ลบ, ยืนยัน, etc.)

```tsx
<ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={setDeleteConfirmOpen}
  onConfirm={handleDeleteConfirm}
  title="ยืนยันการลบ"
  description="คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?"
  loading={deleting}
  confirmText="ลบ"
  cancelText="ยกเลิก"
  variant="destructive"
/>
```

### 2. Pagination
**ไฟล์:** `src/components/pagination.tsx`

แสดง pagination พร้อม smart page numbers (แสดง ... เมื่อหน้าเยอะ)

```tsx
<Pagination
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  pagination={pagination}
  showSummary={true}
/>

// หรือแสดงแค่ summary ด้านบน
<PaginationSummary pagination={pagination} />
```

**ตัวอย่าง:**
- ≤7 หน้า: `1 2 3 4 5 6 7`
- >7 หน้า: `1 ... 5 6 7 ... 11`

### 3. LoadingSpinner
**ไฟล์:** `src/components/loading-spinner.tsx`

```tsx
<LoadingSpinner message="กำลังโหลดข้อมูล..." />
```

### 4. ErrorAlert
**ไฟล์:** `src/components/error-alert.tsx`

```tsx
<ErrorAlert error={error} title="ข้อผิดพลาด" />
```

### 5. FileUploadSection
**ไฟล์:** `src/components/file-upload-section.tsx`

Section สำหรับอัปโหลดไฟล์พร้อม preview (รองรับทั้งรูปภาพและเอกสาร)

```tsx
<FileUploadSection
  attachments={attachments}
  uploading={uploading}
  onFileUpload={handleFileUpload}
  onFileDelete={handleFileDeleteClick}
  accept={ACCEPTED_FILES}
/>
```

**Features:**
- แสดงรูปภาพ preview
- แสดง icon สำหรับเอกสาร (PDF, DOC, Excel)
- แสดงชื่อไฟล์และขนาดไฟล์
- ปุ่มลบแต่ละไฟล์

### 6. FilePreview
**ไฟล์:** `src/components/file-preview.tsx`

แสดงไฟล์แนบแบบ read-only (ใช้ใน view modal)

```tsx
<FilePreview files={viewData.attachments || []} />
```

### 7. SearchBar
**ไฟล์:** `src/components/search-bar.tsx`

Search bar component พร้อม clear และ search buttons

```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  onClear={handleClearSearch}
  placeholder="ค้นหาจากหัวข้อ, รายละเอียด..."
/>
```

**Features:**
- รองรับ Enter key สำหรับค้นหา
- ปุ่ม clear (แสดงเมื่อมีข้อความ)
- ปุ่ม search
- Responsive design

### 8. TableActionButtons
**ไฟล์:** `src/components/table-action-buttons.tsx`

Action buttons มาตรฐานสำหรับตาราง (View, Edit, Delete)

```tsx
<TableActionButtons
  onView={() => handleViewClick(item.id)}
  onEdit={() => handleEditClick(item)}
  onDelete={() => handleDeleteClick(item.id)}
  showView={true}
  showEdit={true}
  showDelete={true}
/>
```

## Utility Functions

### src/lib/utils.ts

```tsx
// Class name merger
cn(...inputs: ClassValue[])

// สร้าง upload key (32 ตัวอักษร)
generateUploadKey(): string

// อัปโหลดไฟล์
uploadFiles(
  files: FileList | File[],
  uploadKey: string,
  menu: string,
  uid: number
): Promise<{ success: boolean; data?: any; message?: string; error?: string }>

// ลบไฟล์
deleteFile(
  fileId: number,
  menu: string,
  uid: number
): Promise<{ success: boolean; data?: any; message?: string; error?: string }>
```

### src/lib/api.ts

```tsx
// API utility function - ลด repetitive try-catch-fetch patterns
apiCall<T = any>(
  url: string,
  options?: RequestInit
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: any;
}>

// ตัวอย่างการใช้งาน
const result = await apiCall(`${API_PATH}/news/list?page=1&limit=10`);
if (result.success) {
  setData(result.data);
} else {
  toast.error(result.message || result.error);
}
```

**Benefits:**
- ลด code ที่ซ้ำซ้อน (try-catch-fetch patterns)
- Error handling แบบ centralized
- Response format ที่สม่ำเสมอ
- ง่ายต่อการเพิ่ม features (logging, retry, etc.)

## Patterns

### 🌟 IMPORTANT: Test Page เป็น Template หลัก

**`src/app/(main)/test/page.tsx` คือโครงสร้างหลักสำหรับทุกหน้า CRUD**

เมื่อสร้างเมนูใหม่:
1. **คัดลอกจาก test page** - ใช้เป็นพื้นฐาน
2. **ปรับแต่งตามความต้องการ** - แก้ไข fields, validations, business logic
3. **View Modal แยกกันแต่ละเมนู** - ไม่ต้องทำ shared ViewField component เพราะแต่ละเมนูมีความแตกต่างกันมาก

**สิ่งที่แชร์กันได้:**
- ✅ Utility components (ConfirmDialog, Pagination, LoadingSpinner, etc.)
- ✅ API utility (apiCall)
- ✅ File utilities (uploadFiles, deleteFile)
- ❌ View Modal structure - ควรแยกตามแต่ละเมนู

### 1. CRUD Page Structure

**Template:** `src/app/(main)/test/page.tsx`

```tsx
// States
const [data, setData] = useState<any[]>([])
const [pagination, setPagination] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [searchQuery, setSearchQuery] = useState('')
const [searchKeyword, setSearchKeyword] = useState('') // ส่งไป API

// Data Fetching Pattern
// fetchList - ใช้เมื่อ initial load (มี loading state)
const fetchList = async () => {
  setLoading(true);
  setError('');

  let url = `${API_PATH}?page=${currentPage}&limit=${LIMIT}`;
  if (searchKeyword) {
    url += `&keyword=${encodeURIComponent(searchKeyword)}`;
  }

  const result = await apiCall(url);

  if (result.success) {
    setData(result.data || []);
    setPagination(result.pagination);
  } else {
    setError(result.error || result.message || 'เกิดข้อผิดพลาด');
  }

  setLoading(false);
};

// refreshList - ใช้หลัง CRUD operations (silent, no loading)
const refreshList = async (resetToFirstPage = false) => {
  const pageToUse = resetToFirstPage ? 1 : currentPage;
  let url = `${API_PATH}?page=${pageToUse}&limit=${LIMIT}`;
  if (searchKeyword) {
    url += `&keyword=${encodeURIComponent(searchKeyword)}`;
  }

  const result = await apiCall(url);

  if (result.success) {
    setData(result.data || []);
    setPagination(result.pagination);
    if (resetToFirstPage) {
      setCurrentPage(1);
    }
  }
};

// Usage:
// - Delete: await refreshList() // คงหน้าเดิม, คง keyword
// - Insert: await refreshList(true) // กลับหน้า 1
// - Update: await refreshList() // คงหน้าเดิม

useEffect(() => {
  fetchList();
}, [currentPage, searchKeyword])
```

### 2. Action Bar Pattern

```tsx
<div className="flex flex-col lg:flex-row gap-4 mb-6">
  {/* Search Section */}
  <div className="flex gap-3 flex-1">
    <SearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      onSearch={handleSearch}
      onClear={handleClearSearch}
      placeholder="ค้นหาจากหัวข้อ, รายละเอียด..."
    />
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3 items-center">
    <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 h-11 gap-2">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">เพิ่มใหม่</span>
      <span className="sm:hidden">เพิ่ม</span>
    </Button>
  </div>
</div>
```

### 3. Table Card Structure

```tsx
<Card className="p-6">
  <div>
    <h3 className="text-xl font-bold mb-0">หัวข้อ</h3>
  </div>

  {loading && <LoadingSpinner />}
  {error && <ErrorAlert error={error} />}

  {!loading && !error && (
    <>
      <div className="overflow-x-auto">
        <table>...</table>
      </div>

      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pagination={pagination}
      />
    </>
  )}
</Card>
```

### 4. Modal Pattern (Insert/Update)

```tsx
const isEditMode = editingItem !== null

<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{isEditMode ? 'แก้ไข' : 'เพิ่มใหม่'}</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <FileUploadSection
        attachments={attachments}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDeleteClick}
        accept={ACCEPTED_FILES}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

## API Integration

### Response Format

```typescript
// Success
{
  success: true,
  data: any,
  message?: string,
  pagination?: {
    current_page: number,
    per_page: number,
    total: number,
    total_pages: number,
    has_prev: boolean,
    has_next: boolean
  }
}

// Error
{
  success: false,
  error: string,
  message: string
}
```

### File Upload Response

```typescript
{
  success: true,
  data: {
    upload_key: string,
    files: [
      {
        id: number,
        file_name: string,
        file_size: number,
        file_ext: string,
        file_path: string
      }
    ]
  }
}
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_PATH=http://localhost:3000/api/
```

### Constants

```typescript
// src/config/constants.ts
export const LIMIT = 10; // Pagination limit
```

## Styling

### Theme Colors

- Primary: Blue 600 (`bg-blue-600`)
- Success: Green 500 (`bg-green-500`)
- Error: Red 500/Red 50 background
- Background: Slate 50 (`bg-slate-50`)

### Responsive Breakpoints

- `sm:` - ≥640px
- `lg:` - ≥1024px

### Common Patterns

```tsx
// Hide on mobile
<span className="hidden sm:inline">ข้อความ</span>

// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">

// Different text on mobile/desktop
<span className="hidden sm:inline">เพิ่มข่าวใหม่</span>
<span className="sm:hidden">เพิ่ม</span>
```

## Toast Notifications

**Setup:** `src/app/(main)/layout.tsx`
```tsx
<Toaster position="top-right" />
```

**Usage:**
```tsx
import { toast } from 'sonner'

toast.success('สำเร็จ')
toast.error('ข้อผิดพลาด')
toast.info('ข้อมูล')
```

## File Types Support

```typescript
const ACCEPTED_FILES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx'
```

**Icon mapping:**
- Images → แสดงรูป
- PDF/DOC → `FileText` icon
- Excel → `FileSpreadsheet` icon
- อื่นๆ → `File` icon

## TypeScript Policy

**สำคัญ:** โปรเจคนี้ไม่ทำ interface/type definitions สำหรับ API responses

```typescript
// ✅ ใช้ any สำหรับ API data
const [data, setData] = useState<any[]>([]);
const [viewData, setViewData] = useState<any>(null);

// ✅ apiCall ใช้ generic แต่ default เป็น any
const result = await apiCall<any>('/api/news');

// ❌ ไม่ต้องทำแบบนี้
interface NewsResponse { ... }
const result = await apiCall<NewsResponse>('/api/news');
```

**เหตุผล:** ลด complexity, ไม่ต้องจัดการ type definitions ที่ซับซ้อน

## สิ่งที่ควรทราบ

1. **Authentication:** ใช้ `isAuthenticated()` จาก `src/lib/auth.ts`
2. **Sidebar:** รองรับ submenu (ดูจาก `src/components/sidebar.tsx`)
3. **Responsive:** ทุก component รองรับ mobile และ desktop
4. **File Upload:** ใช้ FormData, ต้องมี upload_key
5. **Pagination:** API ส่ง `page` และ `limit` parameters
6. **Search:** API รับ `keyword` parameter
7. **API calls:** ใช้ `apiCall()` จาก `src/lib/api.ts` เสมอ
8. **Data fetching:** ใช้ `fetchList()` สำหรับ initial load, `refreshList()` หลัง CRUD
9. **View Modal:** แยกตามแต่ละเมนู ไม่ share structure
10. **Type safety:** ใช้ `any` สำหรับ API data, ไม่ต้องทำ interface/type
