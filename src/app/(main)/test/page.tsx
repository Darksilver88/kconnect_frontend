'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { List, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LIMIT } from '@/config/constants';
import { generateUploadKey, uploadFiles, deleteFile } from '@/lib/utils';
import { apiCall } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Pagination } from '@/components/pagination';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert } from '@/components/error-alert';
import { FileUploadSection } from '@/components/file-upload-section';
import { FilePreview } from '@/components/file-preview';
import { SearchBar } from '@/components/search-bar';
import { TableActionButtons } from '@/components/table-action-buttons';

// ตัวแปรคงที่
const MENU = 'news';

// ตัวแปร API path
const API_LIST = 'news/list';
const API_INSERT = 'news/insert';
const API_UPDATE = 'news/update';
const API_DELETE = 'news/delete';
const API_DETAIL = 'news';

// ไฟล์ที่รองรับในการอัปโหลด
const ACCEPTED_FILES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';

export default function TestPage() {
  const { setSidebarOpen } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    status: '1',
  });
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = editingItem !== null;

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [loadingView, setLoadingView] = useState(false);

  // File upload states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadKey, setCurrentUploadKey] = useState<string>('');

  // File delete confirmation states
  const [deleteFileConfirmOpen, setDeleteFileConfirmOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);

  // Search and View Mode states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // keyword ที่ส่งไป API
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Fetch data from API (with loading state)
  const fetchList = async () => {
    setLoading(true);
    setError('');

    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}`;
    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }
    console.log(`url : ${url}`);

    const result = await apiCall(url);

    if (result.success) {
      setData(result.data || []);
      setPagination(result.pagination);
    } else {
      setError(result.error || result.message || 'เกิดข้อผิดพลาด');
    }

    setLoading(false);
  };

  // Refresh list after CRUD operations (silent, no loading)
  const refreshList = async (resetToFirstPage = false) => {
    const pageToUse = resetToFirstPage ? 1 : currentPage;
    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${pageToUse}&limit=${LIMIT}`;
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
    } else {
      console.error('Failed to refresh list:', result.error || result.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, searchKeyword]);

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return {
        label: 'เผยแพร่',
        className: 'bg-green-50 text-green-700 hover:bg-green-100'
      };
    }
    return {
      label: 'ไม่เผยแพร่',
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    };
  };

  // Handle search
  const handleSearch = () => {
    setSearchKeyword(searchQuery);
    setCurrentPage(1); // รีเซ็ตกลับไปหน้า 1 เมื่อค้นหาใหม่
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchKeyword('');
    setCurrentPage(1);
  };


  // Handle delete
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setDeleting(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DELETE}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: deleteId,
        uid: uid,
      }),
    });

    if (result.success) {
      await refreshList(); // Refresh ที่หน้าเดิม, ไม่ reset keyword
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success(result.message || 'ลบข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการลบ');
    }

    setDeleting(false);
  };

  // Handle view button click
  const handleViewClick = async (id: number) => {
    setLoadingView(true);
    setViewModalOpen(true);
    setViewData(null);

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DETAIL}/${id}`);

    if (result.success) {
      setViewData(result.data);
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูล');
      setViewModalOpen(false);
    }

    setLoadingView(false);
  };

  // Handle edit button click
  const handleEditClick = async (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      detail: item.detail || '',
      status: String(item.status || '1'),
    });
    setCurrentUploadKey(item.upload_key || '');

    // Fetch attachments for edit mode
    if (item.id) {
      const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DETAIL}/${item.id}`);
      if (result.success && result.data.attachments) {
        setAttachments(result.data.attachments);
      } else {
        setAttachments([]);
      }
    }

    setIsModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    // Use current upload key or generate new one
    const uploadKey = currentUploadKey || generateUploadKey();
    if (!currentUploadKey) {
      setCurrentUploadKey(uploadKey);
    }

    setUploading(true);

    const result = await uploadFiles(files, uploadKey, MENU, uid);

    if (result.success) {
      setAttachments((prev) => [...prev, ...result.data.files]);
      toast.success(result.message || 'อัปโหลดไฟล์สำเร็จ');
      // Clear file input
      e.target.value = '';
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    }

    setUploading(false);
  };

  // Handle file delete click
  const handleFileDeleteClick = (fileId: number) => {
    setDeleteFileId(fileId);
    setDeleteFileConfirmOpen(true);
  };

  // Handle file delete confirm
  const handleFileDeleteConfirm = async () => {
    if (!deleteFileId) return;

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    setDeletingFile(true);

    const result = await deleteFile(deleteFileId, MENU, uid);

    if (result.success) {
      setAttachments((prev) => prev.filter((file) => file.id !== deleteFileId));
      setDeleteFileConfirmOpen(false);
      setDeleteFileId(null);
      toast.success(result.message || 'ลบไฟล์สำเร็จ');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาดในการลบ');
    }

    setDeletingFile(false);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    let payload: any;
    let apiPath: string;
    let method: string;

    if (isEditMode) {
      // Update mode
      payload = {
        id: editingItem.id,
        title: formData.title,
        detail: formData.detail,
        status: parseInt(formData.status),
        uid: uid,
      };
      apiPath = API_UPDATE;
      method = 'PUT';
    } else {
      // Insert mode - use current upload key if files were uploaded
      payload = {
        title: formData.title,
        detail: formData.detail,
        upload_key: currentUploadKey || generateUploadKey(),
        status: parseInt(formData.status),
        uid: uid,
      };
      apiPath = API_INSERT;
      method = 'POST';
    }

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${apiPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      // Close modal
      setIsModalOpen(false);
      // Reset form and editing state
      setFormData({ title: '', detail: '', status: '1' });
      setEditingItem(null);
      setAttachments([]);
      setCurrentUploadKey('');

      // Refresh list
      if (isEditMode) {
        await refreshList(); // Update: ใช้หน้าเดิม
      } else {
        await refreshList(true); // Insert: กลับหน้า 1
      }

      // Show success toast
      toast.success(result.message || 'บันทึกข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }

    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="ทดสอบหน้าลิส"
        subtitle="ตัวอย่างการแสดงข้อมูลจาก API"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        {/* Action Bar */}
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
            {/* View Toggle */}
            {/* <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className={`h-9 gap-2 ${viewMode === 'card' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                onClick={() => {
                  setViewMode('card');
                  toast.info('มุมมองการ์ดกำลังพัฒนา');
                }}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">การ์ด</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={`h-9 gap-2 ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">รายการ</span>
              </Button>
            </div> */}

            {/* Add Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-11 gap-2"
              onClick={() => {
                setEditingItem(null);
                setFormData({ title: '', detail: '', status: '1' });
                setAttachments([]);
                setCurrentUploadKey('');
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มข่าวใหม่</span>
              <span className="sm:hidden">เพิ่ม</span>
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-0">รายการข่าว</h3>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && <ErrorAlert error={error} />}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[5%]">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[15%]">หัวข้อ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[20%]">รายละเอียด</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[15%]">Upload Key</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[15%]">สถานะ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[15%]">วันที่สร้าง</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[15%]">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        {searchKeyword ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูล'}
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => {
                      const statusInfo = getStatusBadge(item.status);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-slate-800 font-semibold">
                            #{item.id}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-800">{item.title || '-'}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-slate-600 max-w-xs truncate">
                              {item.detail || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {item.upload_key || '-'}
                          </td>
                          <td className="px-4 py-4 !text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}>
                              {statusInfo.label}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {item.create_date_formatted ? (
                              <>
                                <div className="text-slate-800">{item.create_date_formatted.split(' ')[0]}</div>
                                <div className="text-sm text-slate-600">{item.create_date_formatted.split(' ')[1]}</div>
                              </>
                            ) : (
                              <div className="text-slate-600">-</div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <TableActionButtons
                                onView={() => handleViewClick(item.id)}
                                onEdit={() => handleEditClick(item)}
                                onDelete={() => handleDeleteClick(item.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pagination={pagination}
            />
          </>
        )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        loading={deleting}
      />

      {/* Insert/Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'แก้ไขข้อมูลข่าว' : 'กรอกข้อมูลข่าวที่ต้องการเพิ่ม'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">หัวข้อ</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="กรอกหัวข้อข่าว"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail">รายละเอียด</Label>
                <Input
                  id="detail"
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  placeholder="กรอกรายละเอียด"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">แสดง</SelectItem>
                    <SelectItem value="3">ไม่แสดง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Section */}
              <FileUploadSection
                attachments={attachments}
                uploading={uploading}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDeleteClick}
                accept={ACCEPTED_FILES}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>รายละเอียดข่าว</DialogTitle>
            <DialogDescription>
              ข้อมูลทั้งหมดของข่าว
            </DialogDescription>
          </DialogHeader>

          {loadingView ? (
            <LoadingSpinner />
          ) : viewData ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-sm">ID</Label>
                  <p className="text-slate-900 font-medium">#{viewData.id}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-sm">สถานะ</Label>
                  <div className="mt-1">
                    <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getStatusBadge(viewData.status).className}`}>
                      {getStatusBadge(viewData.status).label}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-500 text-sm">หัวข้อ</Label>
                <p className="text-slate-900 font-medium">{viewData.title || '-'}</p>
              </div>

              <div>
                <Label className="text-slate-500 text-sm">รายละเอียด</Label>
                <p className="text-slate-900">{viewData.detail || '-'}</p>
              </div>

              <div>
                <Label className="text-slate-500 text-sm">Upload Key</Label>
                <p className="text-slate-900 font-mono text-sm break-all">{viewData.upload_key || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-sm">วันที่สร้าง</Label>
                  <p className="text-slate-900 text-sm">{viewData.create_date_formatted || viewData.create_date || '-'}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-sm">สร้างโดย</Label>
                  <p className="text-slate-900 text-sm">{viewData.create_by || '-'}</p>
                </div>
              </div>

              {viewData.update_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-sm">วันที่แก้ไข</Label>
                    <p className="text-slate-900 text-sm">{viewData.update_date_formatted || viewData.update_date || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-sm">แก้ไขโดย</Label>
                    <p className="text-slate-900 text-sm">{viewData.update_by || '-'}</p>
                  </div>
                </div>
              )}

              <FilePreview files={viewData.attachments || []} />
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewModalOpen(false)}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <ConfirmDialog
        open={deleteFileConfirmOpen}
        onOpenChange={setDeleteFileConfirmOpen}
        onConfirm={handleFileDeleteConfirm}
        title="ยืนยันการลบไฟล์"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        loading={deletingFile}
      />
    </div>
  );
}
