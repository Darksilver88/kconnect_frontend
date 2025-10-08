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
import { List, Eye, Edit, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { LIMIT } from '@/config/constants';
import { generateUploadKey, uploadFiles, deleteFile } from '@/lib/utils';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Pagination, PaginationSummary } from '@/components/pagination';

// ตัวแปรคงที่
const MENU = 'news';
const UID = 5;

// ตัวแปร API path
const API_LIST = 'news/list';
const API_INSERT = 'news/insert';
const API_UPDATE = 'news/update';
const API_DELETE = 'news/delete';
const API_DETAIL = 'news';

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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}`;
        console.log(`url : ${url}`);
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          setData(result.data || []);
          setPagination(result.pagination);
        } else {
          setError(result.error || result.message || 'เกิดข้อผิดพลาด');
        }
      } catch (err: any) {
        setError('ไม่สามารถเชื่อมต่อ API ได้: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return { label: 'เผยแพร่', className: 'bg-green-500 hover:bg-green-600' };
    }
    return { label: 'ไม่เผยแพร่', className: 'bg-gray-500 hover:bg-gray-600' };
  };

  // Handle delete
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}${API_DELETE}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteId,
          uid: 1,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh list
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}`;
        const listResponse = await fetch(url);
        const listResult = await listResponse.json();
        if (listResult.success) {
          setData(listResult.data || []);
          setPagination(listResult.pagination);
        }
        setDeleteConfirmOpen(false);
        setDeleteId(null);
        toast.success(result.message || 'ลบข้อมูลสำเร็จ');
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err: any) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Handle view button click
  const handleViewClick = async (id: number) => {
    setLoadingView(true);
    setViewModalOpen(true);
    setViewData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}${API_DETAIL}/${id}`);
      const result = await response.json();

      if (result.success) {
        setViewData(result.data);
      } else {
        toast.error(result.message || 'ไม่พบข้อมูล');
        setViewModalOpen(false);
      }
    } catch (err: any) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้: ' + err.message);
      setViewModalOpen(false);
    } finally {
      setLoadingView(false);
    }
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
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}${API_DETAIL}/${item.id}`);
        const result = await response.json();
        if (result.success && result.data.attachments) {
          setAttachments(result.data.attachments);
        } else {
          setAttachments([]);
        }
      } catch (err) {
        setAttachments([]);
      }
    }

    setIsModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Use current upload key or generate new one
    const uploadKey = currentUploadKey || generateUploadKey();
    if (!currentUploadKey) {
      setCurrentUploadKey(uploadKey);
    }

    setUploading(true);

    const result = await uploadFiles(files, uploadKey, MENU, UID);

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

    setDeletingFile(true);

    const result = await deleteFile(deleteFileId, MENU, UID);

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

    try {
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
          uid: UID,
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
          uid: UID,
        };
        apiPath = API_INSERT;
        method = 'POST';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}${apiPath}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Close modal
        setIsModalOpen(false);
        // Reset form and editing state
        setFormData({ title: '', detail: '', status: '1' });
        setEditingItem(null);
        setAttachments([]);
        setCurrentUploadKey('');
        // Refresh list
        const currentPageToUse = isEditMode ? currentPage : 1;
        if (!isEditMode) setCurrentPage(1);
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPageToUse}&limit=${LIMIT}`;
        const listResponse = await fetch(url);
        const listResult = await listResponse.json();
        if (listResult.success) {
          setData(listResult.data || []);
          setPagination(listResult.pagination);
        }
        // Show success toast
        toast.success(result.message || 'บันทึกข้อมูลสำเร็จ');
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err: any) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ทดสอบหน้าลิส"
        subtitle="ตัวอย่างการแสดงข้อมูลจาก API"
        icon={<List className="w-6 h-6 text-blue-600" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">รายการข่าว</h3>
            <PaginationSummary pagination={pagination} />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingItem(null);
              setFormData({ title: '', detail: '', status: '1' });
              setAttachments([]);
              setCurrentUploadKey('');
              setIsModalOpen(true);
            }}
          >
            เพิ่มข่าวใหม่
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-2">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>ข้อผิดพลาด:</strong> {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">หัวข้อ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">รายละเอียด</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Upload Key</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">สถานะ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">วันที่สร้าง</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        ไม่มีข้อมูล
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
                          <td className="px-4 py-4">
                            <Badge className={statusInfo.className}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {item.create_date_formatted || item.create_date || '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => handleViewClick(item.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-orange-600 hover:text-orange-700"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteClick(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
              <div className="space-y-2">
                <Label>ไฟล์แนบ</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">
                      {uploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเลือกไฟล์'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">รองรับไฟล์รูปภาพ</span>
                  </label>
                </div>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {attachments.map((file) => (
                      <div key={file.id} className="relative aspect-square bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-2">
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full flex items-center justify-center bg-black rounded-md overflow-hidden"
                        >
                          <img
                            src={file.file_path}
                            alt={file.file_name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleFileDeleteClick(file.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-slate-600 mt-1 truncate text-center">{file.file_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-500 mt-2">กำลังโหลดข้อมูล...</p>
            </div>
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
                    <Badge className={getStatusBadge(viewData.status).className}>
                      {getStatusBadge(viewData.status).label}
                    </Badge>
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

              {viewData.attachments && viewData.attachments.length > 0 && (
                <div>
                  <Label className="text-slate-500 text-sm">ไฟล์แนบ ({viewData.attachments.length} ไฟล์)</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {viewData.attachments.map((file: any) => (
                      <div key={file.id} className="relative aspect-square bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-2">
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full flex items-center justify-center bg-black rounded-md overflow-hidden"
                        >
                          <img
                            src={file.file_path}
                            alt={file.file_name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </a>
                        <p className="text-xs text-slate-600 mt-1 truncate text-center">{file.file_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
