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
import { List, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ตัวแปร API path
const API_LIST = 'news/list';
const API_INSERT = 'news/insert';
const API_DELETE = 'news/delete';

// ฟังก์ชันสร้าง random string 32 ตัวอักษร
const generateUploadKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function TestPage() {
  const { setSidebarOpen } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    status: '1',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=5`;
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
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=5`;
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

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        detail: formData.detail,
        upload_key: generateUploadKey(),
        status: parseInt(formData.status),
        uid: 1,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}${API_INSERT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Close modal
        setIsModalOpen(false);
        // Reset form
        setFormData({ title: '', detail: '', status: '1' });
        // Refresh list
        setCurrentPage(1);
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=1&limit=5`;
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
    <div className="space-y-6">
      <PageHeader
        title="ทดสอบหน้าลิส"
        subtitle="ตัวอย่างการแสดงข้อมูลจาก API"
        icon={<List className="w-8 h-8 text-slate-700" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">รายการข่าว</h3>
            {pagination && (
              <p className="text-sm text-slate-500 mt-1">
                แสดง {((pagination.current_page - 1) * pagination.per_page) + 1}-
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} จาก {pagination.total} รายการ
              </p>
            )}
          </div>
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600"
            onClick={() => setIsModalOpen(true)}
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
                            {item.create_date || '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-orange-600 hover:text-orange-700">
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
            {pagination && pagination.total > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  แสดง {((pagination.current_page - 1) * pagination.per_page) + 1}-
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} จาก {pagination.total} รายการ
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.has_prev}
                  >
                    ← ก่อนหน้า
                  </Button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(pagination.total_pages, p + 1))}
                    disabled={!pagination.has_next}
                  >
                    ถัดไป →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'กำลังลบ...' : 'ลบ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insert Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เพิ่มข่าวใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลข่าวที่ต้องการเพิ่ม
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
                className="bg-gradient-to-r from-blue-500 to-blue-600"
                disabled={submitting}
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
