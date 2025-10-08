'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Eye, Edit, Trash2 } from 'lucide-react';

// ตัวแปร API path
const API_PATH = 'news/list';

export default function TestPage() {
  const { setSidebarOpen } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_PATH}?page=${currentPage}&limit=5`;
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
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
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
                              <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700">
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
    </div>
  );
}
