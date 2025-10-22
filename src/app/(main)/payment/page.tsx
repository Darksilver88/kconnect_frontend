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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
const MENU = 'payment';

// ตัวแปร API path
const API_LIST = 'payment/list';

// ไฟล์ที่รองรับในการอัปโหลด
const ACCEPTED_FILES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';

export default function PaymentPage() {
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

  // View states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [loadingView, setLoadingView] = useState(false);

  // Review slip modal states (for tabs 1, 2, 3)
  const [reviewSlipModalOpen, setReviewSlipModalOpen] = useState(false);
  const [reviewSlipData, setReviewSlipData] = useState<any>(null);
  const [loadingReviewSlip, setLoadingReviewSlip] = useState(false);

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

  // Tab state
  const [activeTab, setActiveTab] = useState('1');

  // Filter states
  const [amountRange, setAmountRange] = useState('1'); // จำนวนเงิน
  const [dateRange, setDateRange] = useState('1'); // ช่วงเวลา

  // Checkbox selection states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Reject dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Summary status state
  const [summaryStatus, setSummaryStatus] = useState<any>(null);

  // Summary data state (for 5 cards)
  const [summaryData, setSummaryData] = useState<any>(null);

  // Fetch summary status
  const fetchSummaryStatus = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/summary_status?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success) {
      setSummaryStatus(result.data);
    }
  };

  // Fetch summary data
  const fetchSummaryData = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/get_summary_data?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success) {
      setSummaryData(result.data);
    }
  };

  useEffect(() => {
    fetchSummaryStatus();
    fetchSummaryData();
  }, []);

  // Fetch data from API (with loading state)
  const fetchList = async () => {
    setLoading(true);
    setError('');

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    // Map tab to status: tab 1(0)=status 0, tab 2(1)=status 1, tab 3(2)=status 3
    const statusMap: { [key: string]: string } = {
      '1': '0', // รอตรวจสอบและอนุมัติ
      '2': '1', // อนุมัติและชำระแล้ว
      '3': '3', // ปฏิเสธ
    };

    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;

    if (statusMap[activeTab]) {
      url += `&status=${statusMap[activeTab]}`;
    }

    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }

    // Add filter parameters for tabs 1, 2, 3
    if (activeTab === '1' || activeTab === '2' || activeTab === '3') {
      url += `&amount_range=${amountRange}`;
      url += `&date_range=${dateRange}`;
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

  useEffect(() => {
    // Only fetch for tab 1, 2, 3 (skip tab 0 for now)
    if (activeTab === '1' || activeTab === '2' || activeTab === '3') {
      fetchList();
    }
  }, [currentPage, searchKeyword, activeTab, amountRange, dateRange]);

  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return {
        label: 'รออนุมัติ',
        className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
        icon: 'fa-clock'
      };
    }
    if (status === 1) {
      return {
        label: 'อนุมัติแล้ว',
        className: 'bg-green-50 text-green-700 hover:bg-green-100',
        icon: 'fa-check-circle'
      };
    }
    if (status === 3) {
      return {
        label: 'ปฏิเสธ',
        className: 'bg-red-50 text-red-700 hover:bg-red-100',
        icon: 'fa-times-circle'
      };
    }
    return {
      label: 'ไม่เผยแพร่',
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      icon: 'fa-circle'
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

  // Handle checkbox selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = data.map(item => item.id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      setSelectAll(false);
    } else {
      const newSelectedIds = [...selectedIds, id];
      setSelectedIds(newSelectedIds);
      if (newSelectedIds.length === data.length) {
        setSelectAll(true);
      }
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกรายการที่ต้องการอนุมัติ');
      return;
    }

    setSubmittingAction(true);
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/update`;
    const body = {
      ids: selectedIds.join(','),
      status: 1,
      uid: uid
    };

    const result = await apiCall(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (result.success) {
      toast.success('อนุมัติสำเร็จ');
      setSelectedIds([]);
      setSelectAll(false);
      fetchList();
      fetchSummaryStatus();
      fetchSummaryData();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }

    setSubmittingAction(false);
  };

  // Handle approve from modal (single item)
  const handleApproveSingle = async (id: number) => {
    setSubmittingAction(true);
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/update`;
    const body = {
      ids: String(id),
      status: 1,
      uid: uid
    };

    const result = await apiCall(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (result.success) {
      toast.success('อนุมัติสำเร็จ');
      setReviewSlipModalOpen(false);
      fetchList();
      fetchSummaryStatus();
      fetchSummaryData();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }

    setSubmittingAction(false);
  };

  // Handle reject - open dialog
  const handleRejectClick = () => {
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกรายการที่ต้องการปฏิเสธ');
      return;
    }
    setRejectRemark('');
    setRejectDialogOpen(true);
  };

  // Handle reject confirm
  const handleRejectConfirm = async () => {
    if (!rejectRemark.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    setSubmittingAction(true);
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/update`;
    const body = {
      ids: selectedIds.join(','),
      status: 3,
      uid: uid,
      remark: rejectRemark
    };

    const result = await apiCall(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (result.success) {
      toast.success('ปฏิเสธสำเร็จ');
      setSelectedIds([]);
      setSelectAll(false);
      setRejectDialogOpen(false);
      setRejectRemark('');
      fetchList();
      fetchSummaryStatus();
      fetchSummaryData();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }

    setSubmittingAction(false);
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

  // Handle review slip click (for tabs 1, 2, 3)
  const handleReviewSlipClick = async (item: any) => {
    setLoadingReviewSlip(true);
    setReviewSlipModalOpen(true);
    setReviewSlipData(null);

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}payment/${item.id}`);

    if (result.success && result.data) {
      const data = result.data;
      setReviewSlipData({
        // Slip image
        slip_image: data.attachment?.file_path || 'https://placehold.co/400x600/E0F2F7/2B6EF3?text=Payment+Slip',

        // Slip details
        member_name: data.member_name || '-',
        member_detail: data.member_detail || '-',
        payment_amount: data.payment_amount || '-',
        transfer_date: data.transfer_date || data.create_date_formatted || '-',
        bank_name: data.bank_name || data.payment_type_title || '-',
        bill_no: data.bill_no || '-',
        member_remark: data.member_remark || '-',
        reject_reason: data.remark || '-',

        // Bill info
        bill_title: data.bill_title || '-',
        bill_type: data.bill_type_title || '-',
        bill_period: data.bill_detail || '-',
        bill_amount: data.bill_total_price || '-',
        due_date: data.expire_date_formatted ? data.expire_date_formatted.split(' ')[0] : '-',
        status: data.status,

        // Additional info
        approver_name: data.update_by_name || data.approver_name || 'รอข้อมูล',

        // For approve/reject
        id: data.id
      });
    } else {
      toast.error(result.message || 'ไม่สามารถโหลดข้อมูลได้');
      setReviewSlipModalOpen(false);
    }

    setLoadingReviewSlip(false);
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
        title="จัดการการชำระเงิน"
        subtitle="ตรวจสอบและจัดการประวัติการชำระเงิน"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Card 1: บิลทั้งหมดเดือนนี้ - #2b6ef3 */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#2b6ef3' }}></div>
            <div className="p-4 relative">
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 110, 243, 0.1)' }}>
                <i className="fas fa-file-invoice-dollar text-lg" style={{ color: '#2b6ef3' }}></i>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {summaryData?.total_bill_rooms?.count || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">บิลทั้งหมดเดือนนี้</div>
              <div className={`text-xs font-bold ${summaryData?.total_bill_rooms?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${summaryData?.total_bill_rooms?.change >= 0 ? 'up' : 'down'}`}></i> {summaryData?.total_bill_rooms?.change_text || '-'}
              </div>
            </div>
          </Card>

          {/* Card 2: รออนุมัติ - #eab308 */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#eab308' }}></div>
            <div className="p-4 relative">
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
                <i className="fas fa-clock text-lg" style={{ color: '#eab308' }}></i>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {summaryData?.pending_payment?.count || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">รออนุมัติ</div>
              <div className={`text-xs font-bold ${summaryData?.pending_payment?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${summaryData?.pending_payment?.change >= 0 ? 'up' : 'down'}`}></i> {summaryData?.pending_payment?.change_text || '-'}
              </div>
            </div>
          </Card>

          {/* Card 3: อนุมัติแล้ว - #22c55e */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#22c55e' }}></div>
            <div className="p-4 relative">
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <i className="fas fa-check-circle text-lg" style={{ color: '#22c55e' }}></i>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {summaryData?.approved_payment?.count || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">อนุมัติแล้ว</div>
              <div className={`text-xs font-bold ${summaryData?.approved_payment?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${summaryData?.approved_payment?.change >= 0 ? 'up' : 'down'}`}></i> {summaryData?.approved_payment?.change_text || '-'}
              </div>
            </div>
          </Card>

          {/* Card 4: ปฏิเสธ - #ef4444 */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#ef4444' }}></div>
            <div className="p-4 relative">
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <i className="fas fa-times-circle text-lg" style={{ color: '#ef4444' }}></i>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {summaryData?.rejected_payment?.count || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">ปฏิเสธ</div>
              <div className={`text-xs font-bold ${summaryData?.rejected_payment?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${summaryData?.rejected_payment?.change >= 0 ? 'up' : 'down'}`}></i> {summaryData?.rejected_payment?.change_text || '-'}
              </div>
            </div>
          </Card>

          {/* Card 5: รอชำระ - #8B5CF6 */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#8B5CF6' }}></div>
            <div className="p-4 relative">
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <i className="fas fa-hand-holding-usd text-lg" style={{ color: '#8B5CF6' }}></i>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {summaryData?.unpaid_bill_rooms?.count || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">รอชำระ</div>
              <div className={`text-xs font-bold ${summaryData?.unpaid_bill_rooms?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${summaryData?.unpaid_bill_rooms?.change >= 0 ? 'up' : 'down'}`}></i> {summaryData?.unpaid_bill_rooms?.change_text || '-'}
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
          setSelectedIds([]);
          setSelectAll(false);
        }} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2">
            <TabsTrigger value="0" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4">
              <i className="fas fa-file-invoice-dollar text-sm md:text-base"></i>
              <span className="text-xs md:text-sm">รอชำระ</span>
              <Badge className="ml-1 bg-yellow-100 text-yellow-700 text-xs">
                {summaryStatus?.tab1 || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="1" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4">
              <i className="fas fa-clock text-sm md:text-base"></i>
              <span className="text-xs md:text-sm hidden sm:inline">รอตรวจสอบและอนุมัติ</span>
              <span className="text-xs md:text-sm sm:hidden">รออนุมัติ</span>
              <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">
                {summaryStatus?.tab2 || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4">
              <i className="fas fa-check-circle text-sm md:text-base"></i>
              <span className="text-xs md:text-sm hidden sm:inline">อนุมัติและชำระแล้ว</span>
              <span className="text-xs md:text-sm sm:hidden">อนุมัติแล้ว</span>
              <Badge className="ml-1 bg-green-100 text-green-700 text-xs">
                {summaryStatus?.tab3 || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-4">
              <i className="fas fa-times-circle text-sm md:text-base"></i>
              <span className="text-xs md:text-sm">ปฏิเสธ</span>
              <Badge className="ml-1 bg-red-100 text-red-700 text-xs">
                {summaryStatus?.tab4 || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Manual Payment Header - Different for each tab */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600 mb-6">
              {activeTab === '0' && (
                <>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">
                    <i className="fas fa-edit mr-2"></i>
                    รายการบิลรอชำระ
                  </h3>
                  <p className="text-gray-600 text-sm m-0">
                    รองรับสำหรับกรณีที่ลูกบ้านมาชำระเงินที่นิติบุคคลโดยตรง เป็นบันทึกการชำระเงินแบบ Manual สามารถค้นหาแล้วทำการบันทึกการชำระเงินได้เลย
                  </p>
                </>
              )}
              {activeTab === '1' && (
                <>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">
                    <i className="fas fa-clock mr-2"></i>
                    รายการบิลรอรอตรวจสอบและอนุมัติ
                  </h3>
                  <p className="text-gray-600 text-sm m-0">
                    รายการบิลที่ได้รับลูกบ้านได้ทำการส่งหลักฐานการชำระมาให้ทำการตรวจสอบและอนุมัติต่อไป
                  </p>
                </>
              )}
              {activeTab === '2' && (
                <>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">
                    <i className="fas fa-check-circle mr-2"></i>
                    รายการบิลที่ได้รับอนุมัติชำระเงิน
                  </h3>
                  <p className="text-gray-600 text-sm m-0">
                    รายการบิลที่ได้รับการตรวจสอบหลักฐานการชำระแล้วผ่านการอนุมัติความถูกต้อง รวมทั้งบิลที่มีการชำระเงินโดยตรงกับนิติ
                  </p>
                </>
              )}
              {activeTab === '3' && (
                <>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">
                    <i className="fas fa-times-circle mr-2"></i>
                    รายการบิลที่ถูกปฏิเสธ
                  </h3>
                  <p className="text-gray-600 text-sm m-0">
                    รายการบิลที่ได้รับการตรวจสอบหลักฐานการชำระแล้วถูกปฏิเสธ ด้วยเหตุผล...
                  </p>
                </>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Section */}
              <div className="flex gap-3 flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  placeholder="ค้นหาจากเลขห้อง, ชื่อ, หัวข้อบิล, หรือเลขบิล..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 items-center">
                {/* Tab 1: No buttons */}

                {/* Tab 2: Dropdowns + Approve/Reject buttons */}
                {activeTab === '1' && (
                  <>
                    <Select value={amountRange} onValueChange={setAmountRange}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ทุกจำนวนเงิน</SelectItem>
                        <SelectItem value="2">น้อยกว่า 1,000 บาท</SelectItem>
                        <SelectItem value="3">1,000-3,000 บาท</SelectItem>
                        <SelectItem value="4">มากกว่า 3,000 บาท</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ทั้งหมด</SelectItem>
                        <SelectItem value="2">วันนี้</SelectItem>
                        <SelectItem value="3">7 วันล่าสุด</SelectItem>
                        <SelectItem value="4">เดือนนี้</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      className="bg-green-600 hover:bg-green-700 !h-[44px] gap-2"
                      onClick={handleApprove}
                      disabled={submittingAction || selectedIds.length === 0}
                    >
                      <i className="fas fa-check"></i>
                      <span className="hidden sm:inline">อนุมัติที่เลือก</span>
                    </Button>

                    <Button
                      className="bg-red-600 hover:bg-red-700 !h-[44px] gap-2"
                      onClick={handleRejectClick}
                      disabled={submittingAction || selectedIds.length === 0}
                    >
                      <i className="fas fa-times"></i>
                      <span className="hidden sm:inline">ปฏิเสธที่เลือก</span>
                    </Button>
                  </>
                )}

                {/* Tab 3 & 4: Dropdowns + Export button */}
                {(activeTab === '2' || activeTab === '3') && (
                  <>
                    <Select value={amountRange} onValueChange={setAmountRange}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ทุกจำนวนเงิน</SelectItem>
                        <SelectItem value="2">น้อยกว่า 1,000 บาท</SelectItem>
                        <SelectItem value="3">1,000-3,000 บาท</SelectItem>
                        <SelectItem value="4">มากกว่า 3,000 บาท</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ทั้งหมด</SelectItem>
                        <SelectItem value="2">วันนี้</SelectItem>
                        <SelectItem value="3">7 วันล่าสุด</SelectItem>
                        <SelectItem value="4">เดือนนี้</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="!h-[44px] gap-2 bg-white" onClick={() => toast.info('ฟีเจอร์กำลังพัฒนา')}>
                      <i className="fas fa-download"></i>
                      <span className="hidden sm:inline">ส่งออกข้อมูล</span>
                    </Button>
                  </>
                )}
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
                          {activeTab === '1' && (
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[50px]">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                              />
                            </th>
                          )}
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">บิลเลขที่</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">ข้อมูลลูกบ้าน</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">หัวข้อบิล</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">จำนวนเงิน</th>
                          {activeTab === '1' && <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">สถานะ</th>}
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                            {activeTab === '1' ? 'วันที่ส่ง' : activeTab === '2' ? 'วันที่อนุมัติ' : 'วันที่ปฏิเสธ'}
                          </th>
                          {(activeTab === '2' || activeTab === '3') && (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                              {activeTab === '2' ? 'ผู้อนุมัติ' : 'ผู้ปฏิเสธ'}
                            </th>
                          )}
                          {activeTab === '3' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">เหตุผล</th>}
                          <th className="px-3 py-3 text-center text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">
                            การดำเนินการ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab === '1' ? 7 : activeTab === '2' ? 6 : 7} className="px-4 py-8 text-center text-slate-500">
                              {searchKeyword ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูล'}
                            </td>
                          </tr>
                        ) : (
                          data.map((item) => {
                            const statusInfo = getStatusBadge(item.status);
                            const initials = item.member_real_name ? item.member_real_name.substring(0, 2) : '??';

                            return (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                {/* Checkbox - Tab 1 only */}
                                {activeTab === '1' && (
                                  <td className="px-4 py-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(item.id)}
                                      onChange={() => handleSelectRow(item.id)}
                                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                                    />
                                  </td>
                                )}

                                {/* บิลเลขที่ */}
                                <td className="px-4 py-4">
                                  <div className="text-sm font-semibold text-slate-800">{item.bill_no || '-'}</div>
                                </td>

                                {/* ข้อมูลลูกบ้าน */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                      style={{ background: 'linear-gradient(135deg, #2B6EF3, #1F4EC2)' }}
                                    >
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium text-slate-800 truncate">{item.member_name || '-'}</div>
                                      <div className="text-xs text-slate-500 truncate">{item.member_detail || '-'}</div>
                                    </div>
                                  </div>
                                </td>

                                {/* หัวข้อบิล */}
                                <td className="px-4 py-4">
                                  <div className="text-sm text-slate-600">{item.bill_title || '-'}</div>
                                </td>

                                {/* จำนวนเงิน */}
                                <td className="px-4 py-4">
                                  <div className="font-semibold text-slate-900">{item.payment_amount || '-'}</div>
                                </td>

                                {/* สถานะ - Tab 1 only */}
                                {activeTab === '1' && (
                                  <td className="px-4 py-4 !text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}>
                                      {statusInfo.label}
                                    </div>
                                  </td>
                                )}

                                {/* วันที่ส่ง/อนุมัติ/ปฏิเสธ */}
                                <td className="px-4 py-4">
                                  {(activeTab === '1' ? item.create_date_formatted : item.update_date_formatted) ? (
                                    <>
                                      <div className="text-slate-800 text-sm">
                                        {(activeTab === '1' ? item.create_date_formatted : item.update_date_formatted)?.split(' ')[0]}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {(activeTab === '1' ? item.create_date_formatted : item.update_date_formatted)?.split(' ')[1]}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-slate-600">-</div>
                                  )}
                                </td>

                                {/* ผู้อนุมัติ/ผู้ปฏิเสธ - Tab 2 & 3 */}
                                {(activeTab === '2' || activeTab === '3') && (
                                  <td className="px-4 py-4">
                                    <div className="font-semibold text-slate-800 text-sm">Admin</div>
                                    <div className="text-xs text-slate-500">ผู้ดูแลระบบ</div>
                                  </td>
                                )}

                                {/* เหตุผล - Tab 3 only */}
                                {activeTab === '3' && (
                                  <td className="px-4 py-4">
                                    <div className="mb-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">
                                        <i className="fas fa-times-circle"></i>
                                        ปฏิเสธ
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-600 max-w-[200px] truncate" title={item.remark || '-'}>
                                      {item.remark || '-'}
                                    </div>
                                  </td>
                                )}

                                {/* การดำเนินการ */}
                                <td className="px-4 py-4">
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => handleReviewSlipClick(item)}
                                      className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:-translate-y-0.5"
                                      title="ดู"
                                    >
                                      <i className="fas fa-eye text-sm"></i>
                                    </button>
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

            {/* Summary Cards - Only for Tab 0 (รอชำระ) */}
            {activeTab === '0' && (
              <Card className="p-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: บิลรอชำระ - Yellow */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-lg border-l-4 border-yellow-500 hover:translate-y-[-2px] transition-transform">
                    <div className="w-[50px] h-[50px] rounded-lg bg-yellow-500 flex items-center justify-center text-white text-xl">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">15</div>
                      <div className="text-sm text-slate-600">บิลรอชำระ</div>
                    </div>
                  </div>

                  {/* Card 2: เกินกำหนด - Red */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-lg border-l-4 border-red-500 hover:translate-y-[-2px] transition-transform">
                    <div className="w-[50px] h-[50px] rounded-lg bg-red-500 flex items-center justify-center text-white text-xl">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">8</div>
                      <div className="text-sm text-slate-600">เกินกำหนด</div>
                    </div>
                  </div>

                  {/* Card 3: ยอดค้างรวม - Cyan */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-lg border-l-4 hover:translate-y-[-2px] transition-transform" style={{ borderLeftColor: '#0891B2' }}>
                    <div className="w-[50px] h-[50px] rounded-lg flex items-center justify-center text-white text-xl" style={{ backgroundColor: '#0891B2' }}>
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">฿89,400</div>
                      <div className="text-sm text-slate-600">ยอดค้างรวม</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

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

      {/* Review Slip Modal */}
      <Dialog open={reviewSlipModalOpen} onOpenChange={setReviewSlipModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <i className="fas fa-receipt"></i>
              {reviewSlipData?.status === 0 ? 'ตรวจสอบสลิปการโอน' : 'ดูรายละเอียด'}
            </DialogTitle>
          </DialogHeader>

          {loadingReviewSlip ? (
            <LoadingSpinner />
          ) : reviewSlipData ? (
            <div className="space-y-6 py-4">
              {/* Slip Image - Only show if exists */}
              {reviewSlipData.slip_image && reviewSlipData.slip_image !== 'https://placehold.co/400x600/E0F2F7/2B6EF3?text=Payment+Slip' && (
                <div className="flex justify-center">
                  <div className="w-full max-w-[400px] h-[600px] bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <img
                      src={reviewSlipData.slip_image}
                      alt="Payment Slip"
                      className="w-full h-full object-contain"
                      onClick={() => window.open(reviewSlipData.slip_image, '_blank')}
                    />
                  </div>
                </div>
              )}

              {/* Slip Details - 3 columns on desktop, responsive on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">ผู้โอน</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {reviewSlipData.member_name} ({reviewSlipData.member_detail})
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">จำนวนเงิน</div>
                  <div className="text-sm font-semibold text-slate-900">{reviewSlipData.payment_amount}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">วันที่โอน (ตามสลิป)</div>
                  <div className="text-sm font-semibold text-slate-900">{reviewSlipData.transfer_date}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">ธนาคาร</div>
                  <div className="text-sm font-semibold text-slate-900">{reviewSlipData.bank_name}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">บิลที่อ้างอิง</div>
                  <div className="text-sm font-semibold text-slate-900">{reviewSlipData.bill_no}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">หมายเหตุจากลูกบ้าน</div>
                  <div className="text-sm font-semibold text-slate-900">{reviewSlipData.member_remark}</div>
                </div>
              </div>

              {/* Bill Info Box */}
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
                <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  ข้อมูลบิลที่เกี่ยวข้อง
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">หัวข้อบิล:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.bill_title}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">ประเภทบิล:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.bill_type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">งวด:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.bill_period}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">จำนวนที่ต้องชำระ:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.bill_amount}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">วันครบกำหนด:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.due_date}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">สถานะ:</span>
                    <span className="text-sm">
                      <Badge className={getStatusBadge(reviewSlipData.status).className}>
                        <i className={`fas ${getStatusBadge(reviewSlipData.status).icon} mr-1`}></i>
                        {getStatusBadge(reviewSlipData.status).label}
                      </Badge>
                    </span>
                  </div>
                </div>

                {/* Reject Reason - Full width */}
                {reviewSlipData.status === 3 && reviewSlipData.reject_reason && reviewSlipData.reject_reason !== '-' && (
                  <div className="flex flex-col gap-1 mt-3">
                    <span className="text-xs text-slate-500">เหตุผลการปฏิเสธ:</span>
                    <span className="text-sm font-semibold text-slate-900">{reviewSlipData.reject_reason}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewSlipModalOpen(false)}
            >
              ยกเลิก
            </Button>
            {activeTab === '1' && reviewSlipData && !loadingReviewSlip && (
              <>
                <Button
                  className="bg-red-600 hover:bg-red-700 gap-2"
                  onClick={() => {
                    setReviewSlipModalOpen(false);
                    setSelectedIds([reviewSlipData.id]);
                    setRejectDialogOpen(true);
                  }}
                >
                  <i className="fas fa-times"></i>
                  ปฏิเสธ
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => handleApproveSingle(reviewSlipData.id)}
                  disabled={submittingAction}
                >
                  <i className="fas fa-check"></i>
                  อนุมัติ
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ปฏิเสธรายการ</DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลในการปฏิเสธรายการที่เลือก
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="เหตุผลในการปฏิเสธ..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={submittingAction}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRejectConfirm}
              disabled={submittingAction}
            >
              {submittingAction ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
