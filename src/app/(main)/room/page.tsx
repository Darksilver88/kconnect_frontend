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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Users2, User, Phone, Mail, Calendar, UserCheck, IdCard, Cake, MessageCircle, Shield, PhoneCall, Heart, Home, Car, Tag, DoorOpen, FileText, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { LIMIT } from '@/config/constants';
import { apiCall } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Pagination } from '@/components/pagination';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert } from '@/components/error-alert';
import { SearchBar } from '@/components/search-bar';
import { TableActionButtons } from '@/components/table-action-buttons';

// ตัวแปรคงที่
const MENU = 'room';

// ตัวแปร API path
const API_LIST = 'room/list';
const API_INSERT = 'room/insert';
const API_UPDATE = 'room/update';
const API_DELETE = 'room/delete';
const API_DETAIL = 'member/list';

export default function RoomPage() {
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
    room_number: '',
    resident_name: '',
    phone: '',
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
  const [viewRoomTitle, setViewRoomTitle] = useState('');
  const [viewRoomId, setViewRoomId] = useState<number | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [viewMemberPage, setViewMemberPage] = useState(1);
  const [viewMemberPagination, setViewMemberPagination] = useState<any>(null);

  // Member detail modal states
  const [memberDetailOpen, setMemberDetailOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<any>(null);
  const [loadingMemberDetail, setLoadingMemberDetail] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // keyword ที่ส่งไป API

  // Summary data states
  const [roomSummaryData, setRoomSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Fetch summary data (once on mount)
  const fetchSummary = async () => {
    setSummaryLoading(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}room/get_summary_data?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success) {
      setRoomSummaryData(result.data);
    } else {
      console.error('Failed to fetch summary:', result.error || result.message);
    }

    setSummaryLoading(false);
  };

  // Fetch data from API (with loading state)
  const fetchList = async () => {
    setLoading(true);
    setError('');

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;
    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }

    console.log(url);

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
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${pageToUse}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;
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
    fetchSummary(); // Fetch summary once on mount
  }, []);

  useEffect(() => {
    fetchList();
  }, [currentPage, searchKeyword]);

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return {
        label: 'ใช้งานปกติ',
        className: 'bg-green-50 text-green-700 hover:bg-green-100'
      };
    }
    return {
      label: 'ไม่ใช้งาน',
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    };
  };

  const getMemberBadge = (count: number) => {
    if (count > 0) {
      return {
        className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        iconColor: 'text-blue-600'
      };
    }
    return {
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      iconColor: 'text-gray-500'
    };
  };

  const getMemberStatusBadge = (status: number) => {
    if (status === 1) {
      return {
        label: 'อนุมัติแล้ว',
        className: 'bg-green-50 text-green-700 hover:bg-green-100'
      };
    }
    if (status === 0) {
      return {
        label: 'รออนุมัติ',
        className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      };
    }
    if (status === 3) {
      return {
        label: 'ถูกระงับ',
        className: 'bg-red-50 text-red-700 hover:bg-red-100'
      };
    }
    return {
      label: '-',
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    };
  };

  // Handle search
  const handleSearch = () => {
    setSearchKeyword(searchQuery);
    setCurrentPage(1);
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
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DELETE}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: deleteId,
        uid: uid,
        customer_id: customerId,
      }),
    });

    if (result.success) {
      await refreshList();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success(result.message || 'ลบข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการลบ');
    }

    setDeleting(false);
  };

  // Fetch members for view modal
  const fetchViewMembers = async (roomId: number, page: number = 1) => {
    setLoadingView(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DETAIL}?page=${page}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}&room_id=${roomId}`);

    if (result.success) {
      setViewData(result.data);
      setViewMemberPagination(result.pagination);
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูล');
      if (page === 1) {
        setViewModalOpen(false);
      }
    }

    setLoadingView(false);
  };

  // Handle view button click
  const handleViewClick = async (item: any) => {
    setViewModalOpen(true);
    setViewData(null);
    setViewRoomTitle(item.title || '-');
    setViewRoomId(item.id);
    setViewMemberPage(1);
    setViewMemberPagination(null);

    await fetchViewMembers(item.id, 1);
  };

  // Handle member page change
  const handleMemberPageChange = (page: number) => {
    setViewMemberPage(page);
    if (viewRoomId) {
      fetchViewMembers(viewRoomId, page);
    }
  };

  // Handle member detail view
  const handleMemberDetailView = async (memberId: number) => {
    setLoadingMemberDetail(true);
    setMemberDetailOpen(true);
    setMemberDetail(null);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}member/${memberId}?customer_id=${encodeURIComponent(customerId)}`);

    if (result.success) {
      setMemberDetail(result.data);
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูลสมาชิก');
      setMemberDetailOpen(false);
    }

    setLoadingMemberDetail(false);
  };

  // Handle edit button click
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      room_number: item.room_number || '',
      resident_name: item.resident_name || '',
      phone: item.phone || '',
      status: String(item.status || '1'),
    });
    setIsModalOpen(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    let payload: any;
    let apiPath: string;
    let method: string;

    if (isEditMode) {
      // Update mode
      payload = {
        id: editingItem.id,
        room_number: formData.room_number,
        resident_name: formData.resident_name,
        phone: formData.phone,
        status: parseInt(formData.status),
        uid: uid,
        customer_id: customerId,
      };
      apiPath = API_UPDATE;
      method = 'PUT';
    } else {
      // Insert mode
      payload = {
        room_number: formData.room_number,
        resident_name: formData.resident_name,
        phone: formData.phone,
        status: parseInt(formData.status),
        uid: uid,
        customer_id: customerId,
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
      setIsModalOpen(false);
      setFormData({ room_number: '', resident_name: '', phone: '', status: '1' });
      setEditingItem(null);

      if (isEditMode) {
        await refreshList();
      } else {
        await refreshList(true);
      }

      toast.success(result.message || 'บันทึกข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }

    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="จัดการข้อมูลทะเบียน"
        subtitle="ระบบจัดการข้อมูลห้องและผู้พักอาศัย"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="p-4 animate-pulse">
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : roomSummaryData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Card 1: Blue - ห้องทั้งหมด */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <i className="fas fa-door-open text-blue-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {roomSummaryData.total_rooms?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">ห้องทั้งหมด</div>
                <div className={`text-xs font-bold ${roomSummaryData.total_rooms?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${roomSummaryData.total_rooms?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {roomSummaryData.total_rooms?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 2: Green - สมาชิกทั้งหมด */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <i className="fas fa-users text-green-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {roomSummaryData.total_members?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">สมาชิกทั้งหมด</div>
                <div className={`text-xs font-bold ${roomSummaryData.total_members?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${roomSummaryData.total_members?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {roomSummaryData.total_members?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 3: Yellow - เจ้าของห้อง */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <i className="fas fa-key text-yellow-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {roomSummaryData.total_owners?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">เจ้าของห้อง</div>
                <div className={`text-xs font-bold ${roomSummaryData.total_owners?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${roomSummaryData.total_owners?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {roomSummaryData.total_owners?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 4: Purple - ผู้เช่า */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <i className="fas fa-user-tag text-purple-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {roomSummaryData.total_renters?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">ผู้เช่า</div>
                <div className={`text-xs font-bold ${roomSummaryData.total_renters?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${roomSummaryData.total_renters?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {roomSummaryData.total_renters?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 5: Teal - สมาชิกครอบครัว */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                  <i className="fas fa-user-friends text-teal-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {roomSummaryData.family_members?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">สมาชิกครอบครัว</div>
                <div className={`text-xs font-bold ${roomSummaryData.family_members?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${roomSummaryData.family_members?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {roomSummaryData.family_members?.change_text || '-'}
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Section */}
          <div className="flex gap-3 flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="ค้นหาจากห้อง, ชื่อ หรือเบอร์โทรศัพท์..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            {/* <Button
              className="bg-blue-600 hover:bg-blue-700 h-11 gap-2"
              onClick={() => {
                setEditingItem(null);
                setFormData({ room_number: '', resident_name: '', phone: '', status: '1' });
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มข้อมูลใหม่</span>
              <span className="sm:hidden">เพิ่ม</span>
            </Button> */}
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-0">รายการห้องและผู้อยู่อาศัย</h3>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[5%]">เลขห้อง</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[25%]">จำนวนสมาชิก</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[25%]">เจ้าของ</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[20%]">สถานะ</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[20%]">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          {searchKeyword ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูล'}
                        </td>
                      </tr>
                    ) : (
                      data.map((item) => {
                        const statusInfo = getStatusBadge(item.status);
                        const memberCount = item.members?.length || 0;
                        const memberBadgeInfo = getMemberBadge(memberCount);
                        const ownerName = item.owner ? `${item.owner.prefix_name || ''}${item.owner.full_name || ''}`.trim() || '-' : '-';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-800">{item.title || '-'}</div>
                            </td>
                            <td className="px-4 py-4 !text-center">
                              <button
                                onClick={() => handleViewClick(item)}
                                className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-all cursor-pointer ${memberBadgeInfo.className}`}
                              >
                                <i className={`fas fa-users mr-1.5 ${memberBadgeInfo.iconColor}`}></i>
                                {memberCount} คน
                              </button>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">
                              {ownerName}
                            </td>
                            <td className="px-4 py-4 !text-center">
                              <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}>
                                {statusInfo.label}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                <TableActionButtons
                                  onView={() => handleViewClick(item)}
                                  showEdit={false}
                                  showDelete={false}
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
        description="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        loading={deleting}
      />

      {/* Insert/Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มข้อมูลห้องใหม่'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'แก้ไขข้อมูลห้องและผู้พักอาศัย' : 'กรอกข้อมูลห้องและผู้พักอาศัยที่ต้องการเพิ่ม'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">เลขห้อง</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="กรอกเลขห้อง"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident_name">ชื่อผู้พักอาศัย</Label>
                <Input
                  id="resident_name"
                  value={formData.resident_name}
                  onChange={(e) => setFormData({ ...formData, resident_name: e.target.value })}
                  placeholder="กรอกชื่อผู้พักอาศัย"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทร</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="กรอกเบอร์โทร"
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
                    <SelectItem value="1">พักอาศัย</SelectItem>
                    <SelectItem value="3">ว่าง</SelectItem>
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
        <DialogContent className="!max-w-[95vw] sm:!max-w-[85vw] lg:!max-w-[35vw] max-h-[90vh] overflow-y-auto">
          {loadingView ? (
            <>
              <DialogHeader>
                <DialogTitle>กำลังโหลดข้อมูล...</DialogTitle>
              </DialogHeader>
              <LoadingSpinner />
            </>
          ) : viewData ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl">
                      รายละเอียดห้อง {viewRoomTitle}
                    </DialogTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white">
                      {viewData?.length || 0} สมาชิก
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="members" className="w-full">
                <TabsList className="flex w-full h-12 overflow-x-auto">
                  <TabsTrigger value="members" className="h-full flex-1 flex-shrink-0 min-w-[120px]">
                    <i className="fas fa-users mr-2"></i>
                    สมาชิกในห้อง
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="h-full flex-1 flex-shrink-0 min-w-[120px]">
                    <i className="fas fa-file-invoice-dollar mr-2"></i>
                    ประวัติการชำระ
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="h-full flex-1 flex-shrink-0 min-w-[120px]">
                    <i className="fas fa-address-card mr-2"></i>
                    ข้อมูลการติดต่อ
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: สมาชิกในห้อง */}
                <TabsContent value="members" className="space-y-4 mt-6">
                  {loadingView ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">สมาชิก</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">ประเภท</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">อีเมล</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">สถานะ</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">เข้าร่วมเมื่อ</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">การดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {viewData && viewData.length > 0 ? (
                              viewData.map((member: any, index: number) => {
                                const memberStatusInfo = getMemberStatusBadge(member.status);
                                return (
                                  <tr key={index} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                                          {(member.full_name || '').substring(0, 2).toUpperCase() || '--'}
                                        </div>
                                        <div>
                                          <div className="font-medium text-slate-900">
                                            {`${member.prefix_name || ''}${member.full_name || ''}`.trim() || '-'}
                                          </div>
                                          <div className="text-xs text-slate-500 mt-0.5">{member.phone_number || '-'}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 !text-center">
                                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        member.user_level === 'owner'
                                          ? 'bg-yellow-100 text-[#D97706]'
                                          : 'bg-blue-50 text-blue-700'
                                      }`}>
                                        {member.user_level === 'owner' ? 'เจ้าของ' : 'ผู้อยู่อาศัย'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                      {member.email || '-'}
                                    </td>
                                    <td className="px-4 py-3 !text-center">
                                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${memberStatusInfo.className}`}>
                                        {memberStatusInfo.label}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                      {member.enter_date_formatted || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        <TableActionButtons
                                          onView={() => handleMemberDetailView(member.id)}
                                          showEdit={false}
                                          showDelete={false}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                  ไม่มีสมาชิก
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination for members */}
                      {viewMemberPagination && (
                        <Pagination
                          currentPage={viewMemberPage}
                          onPageChange={handleMemberPageChange}
                          pagination={viewMemberPagination}
                        />
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Tab 2: ประวัติการชำระ */}
                <TabsContent value="payment" className="space-y-4 mt-6">
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>ฟีเจอร์นี้กำลังพัฒนา</p>
                  </div>
                </TabsContent>

                {/* Tab 3: ข้อมูลการติดต่อ */}
                <TabsContent value="contact" className="space-y-4 mt-6">
                  {(() => {
                    const owner = viewData?.find((m: any) => m.user_level === 'owner');
                    return owner ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-slate-500 text-sm">เจ้าของห้อง</Label>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-user text-blue-600"></i>
                              <p className="text-slate-900 font-medium">
                                {`${owner.prefix_name || ''}${owner.full_name || ''}`.trim() || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-slate-500 text-sm">เบอร์โทรศัพท์</Label>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-phone text-blue-600"></i>
                              <p className="text-slate-900 font-medium">{owner.phone_number || '-'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-slate-500 text-sm">อีเมล</Label>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-envelope text-blue-600"></i>
                              <p className="text-slate-900 font-medium">{owner.email || '-'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-slate-500 text-sm">วันที่เข้าอยู่</Label>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-calendar text-blue-600"></i>
                              <p className="text-slate-900 font-medium">{owner.enter_date_formatted || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <p>ไม่มีข้อมูลเจ้าของห้อง</p>
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Member Detail Modal */}
      <Dialog open={memberDetailOpen} onOpenChange={setMemberDetailOpen}>
        <DialogContent className="!max-w-[95vw] sm:!max-w-[85vw] lg:!max-w-[35vw] max-h-[90vh] overflow-y-auto">
          {loadingMemberDetail ? (
            <>
              <DialogHeader>
                <DialogTitle>กำลังโหลดข้อมูล...</DialogTitle>
              </DialogHeader>
              <LoadingSpinner />
            </>
          ) : memberDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">รายละเอียดสมาชิก</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header with Avatar */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-xl flex-shrink-0">
                    {(memberDetail.full_name || '').substring(0, 2).toUpperCase() || '--'}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-slate-900 mb-2">
                      {`${memberDetail.prefix_name || ''}${memberDetail.full_name || ''}`.trim() || '-'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        memberDetail.user_level === 'owner'
                          ? 'bg-yellow-100 text-[#D97706]'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {memberDetail.user_level === 'owner' ? 'เจ้าของ' : 'ผู้อยู่อาศัย'}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMemberStatusBadge(memberDetail.status).className}`}>
                        {getMemberStatusBadge(memberDetail.status).label}
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        <i className="fas fa-door-open mr-1"></i>
                        ห้อง {memberDetail.house_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">ข้อมูลส่วนตัว</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">ชื่อ-นามสกุล</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user text-blue-600"></i>
                          <span className="text-slate-900">
                            {`${memberDetail.prefix_name || ''}${memberDetail.full_name || ''}`.trim() || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">เบอร์โทรศัพท์</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-phone text-blue-600"></i>
                          <span className="text-slate-900">{memberDetail.phone_number || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">อีเมล</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-envelope text-blue-600"></i>
                          <span className="text-slate-900">{memberDetail.email || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Residential Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">ข้อมูลการพักอาศัย</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">ห้องเลขที่</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-door-open text-blue-600"></i>
                          <span className="text-slate-900">{memberDetail.house_no || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">วันที่เข้าอยู่</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar text-blue-600"></i>
                          <span className="text-slate-900">{memberDetail.enter_date_formatted || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 text-sm">ประเภทสมาชิก</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user-tag text-blue-600"></i>
                          <span className="text-slate-900">
                            {memberDetail.user_level === 'owner' ? 'เจ้าของ' : 'ผู้อยู่อาศัย'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMemberDetailOpen(false)}
                >
                  ปิด
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
