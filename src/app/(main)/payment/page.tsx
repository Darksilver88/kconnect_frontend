'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { TransactionDetailModal } from '@/components/transaction-detail-modal';
import { ReviewSlipModal } from '@/components/review-slip-modal';

// ตัวแปรคงที่
const MENU = 'payment';

// ตัวแปร API path
const API_LIST = 'payment/list';
const API_LIST_PENDING = 'bill/bill_room_pending_list';
const API_INSERT = 'payment/insert';
const API_UPDATE = 'payment/update';

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
  const [activeTab, setActiveTab] = useState('0');

  // Filter states
  const [amountRange, setAmountRange] = useState('1'); // จำนวนเงิน
  const [dateRange, setDateRange] = useState('1'); // ช่วงเวลา

  // Filter states for tab 0 (รอชำระ)
  const [billTypes, setBillTypes] = useState<any[]>([]);
  const [billStatusList, setBillStatusList] = useState<any[]>([]);
  const [selectedBillTypeId, setSelectedBillTypeId] = useState('-1'); // ทุกหัวข้อบิล
  const [selectedBillStatus, setSelectedBillStatus] = useState('-1'); // Default: all statuses

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

  // Summary status 2 state (for 3 cards at bottom - tab 0)
  const [summaryStatus2, setSummaryStatus2] = useState<any>(null);

  // Manual payment modal states
  const [manualPaymentModalOpen, setManualPaymentModalOpen] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState<any>(null);
  const [viewTransactionModalOpen, setViewTransactionModalOpen] = useState(false);
  const [viewTransactionBillRoomId, setViewTransactionBillRoomId] = useState<number | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Payment method specific fields
  const [transferBank, setTransferBank] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [otherMethod, setOtherMethod] = useState('');

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

  // Fetch summary status 2 (for 3 cards at bottom)
  const fetchSummaryStatus2 = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/summary_status2?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success) {
      setSummaryStatus2(result.data);
    }
  };

  // Fetch bill types (for tab 0 filter)
  const fetchBillTypes = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const url = `${process.env.NEXT_PUBLIC_API_PATH}bill_type/list?page=1&limit=100&status=1&keyword=&customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success && result.data) {
      // เพิ่ม "ทุกหัวข้อบิล" ไว้ลำดับแรก
      const allOption = { id: -1, title: 'ทุกหัวข้อบิล' };
      setBillTypes([allOption, ...result.data]);
    }
  };

  // Fetch bill status list (for tab 0 filter)
  const fetchBillStatusList = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const url = `${process.env.NEXT_PUBLIC_API_PATH}bill/bill_status?page=1&limit=100&customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success && result.data) {
      setBillStatusList(result.data);
    }
  };

  // Fetch payment methods (for manual payment)
  const fetchPaymentMethods = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const url = `${process.env.NEXT_PUBLIC_API_PATH}bill_transaction/bill_transaction_type?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success && result.data) {
      setPaymentMethods(result.data);
    }
  };

  useEffect(() => {
    fetchSummaryStatus();
    fetchSummaryData();
    fetchSummaryStatus2();
    fetchBillTypes();
    fetchBillStatusList();
    fetchPaymentMethods();
  }, []);

  // Handle URL query parameters and fetch data
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    setIsInitialized(true);
  }, [searchParams]);

  // Fetch data from API (with loading state)
  const fetchList = async () => {
    setLoading(true);
    setError('');

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    let url = '';

    // Tab 0: รอชำระ - ใช้ API ต่างหาก
    if (activeTab === '0') {
      url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST_PENDING}?page=${currentPage}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;

      if (searchKeyword) {
        url += `&keyword=${encodeURIComponent(searchKeyword)}`;
      }

      // Add filter parameters
      if (selectedBillTypeId !== '-1') {
        url += `&bill_type_id=${selectedBillTypeId}`;
      }

      if (selectedBillStatus !== '-1') {
        url += `&status=${selectedBillStatus}`;
      }
    } else {
      // Tab 1, 2, 3: ใช้ API เดิม
      // Map tab to status: tab 1(0)=status 0, tab 2(1)=status 1, tab 3(2)=status 3
      const statusMap: { [key: string]: string } = {
        '1': '0', // รอตรวจสอบและอนุมัติ
        '2': '1', // อนุมัติและชำระแล้ว
        '3': '3', // ปฏิเสธ
      };

      url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${currentPage}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;

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
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const statusMap: { [key: string]: string } = {
      '1': '0',
      '2': '1',
      '3': '3',
    };

    let url = `${process.env.NEXT_PUBLIC_API_PATH}${API_LIST}?page=${pageToUse}&limit=${LIMIT}&customer_id=${encodeURIComponent(customerId)}`;

    if (statusMap[activeTab]) {
      url += `&status=${statusMap[activeTab]}`;
    }

    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }

    if (activeTab === '1' || activeTab === '2' || activeTab === '3') {
      url += `&amount_range=${amountRange}`;
      url += `&date_range=${dateRange}`;
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
    // Fetch for all tabs (0, 1, 2, 3) only after initialization
    if (isInitialized) {
      fetchList();
    }
  }, [currentPage, searchKeyword, activeTab, amountRange, dateRange, selectedBillTypeId, selectedBillStatus, isInitialized]);

  const getStatusBadge = (status: number) => {
    // Find status from billStatusList
    const statusItem = billStatusList.find(s => s.id === status);
    const statusLabel = statusItem?.title || 'ไม่ระบุ';

    // Define colors based on status id
    if (status === 0) {
      return {
        label: statusLabel,
        className: 'bg-yellow-50 hover:bg-yellow-100',
        textColor: '#D97706',
        icon: 'fa-clock'
      };
    }
    if (status === 1) {
      return {
        label: statusLabel,
        className: 'bg-green-50 text-green-700 hover:bg-green-100',
        textColor: '#15803D',
        icon: 'fa-check-circle'
      };
    }
    if (status === 3) {
      return {
        label: statusLabel,
        className: 'bg-red-50 hover:bg-red-100',
        textColor: '#B91C1C',
        icon: 'fa-exclamation-triangle'
      };
    }
    if (status === 4) {
      return {
        label: statusLabel,
        className: 'bg-blue-50 hover:bg-blue-100',
        textColor: '#0891B2',
        icon: 'fa-info-circle'
      };
    }
    if (status === 5) {
      return {
        label: statusLabel,
        className: 'bg-yellow-50 hover:bg-yellow-100',
        textColor: '#D97706',
        icon: 'fa-clock'
      };
    }
    return {
      label: statusLabel,
      className: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      textColor: '#64748B',
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
      fetchSummaryStatus2();
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
      fetchSummaryStatus2();
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
      fetchSummaryStatus2();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }

    setSubmittingAction(false);
  };

  // Handle export to Excel
  const handleExportExcel = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const token = user?.token || '';

    // Map activeTab to status
    const statusMap: { [key: string]: string } = {
      '2': '1', // Tab 2: อนุมัติและชำระแล้ว -> status 1
      '3': '3', // Tab 3: ปฏิเสธ -> status 3
    };

    const status = statusMap[activeTab] || '1';

    // Build URL with query params
    const url = `${process.env.NEXT_PUBLIC_API_PATH}payment/list?keyword=${encodeURIComponent(searchKeyword)}&customer_id=${encodeURIComponent(customerId)}&status=${status}&type=excel`;

    try {
      // Fetch with Authorization header
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        toast.error('ไม่สามารถดาวน์โหลดไฟล์ได้');
        return;
      }

      // Convert to blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Get filename from Content-Disposition header
      const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'payment_list.xlsx';
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
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

  // Handle view transaction click (for status = 1)
  const handleViewTransactionClick = (item: any) => {
    setViewTransactionBillRoomId(item.id);
    setViewTransactionModalOpen(true);
  };

  // Handle manual payment click (for tab 0)
  const handleManualPaymentClick = (item: any) => {
    // Set current date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    // Set payment amount to total price (read-only full payment)
    const totalAmount = item.total_price ? item.total_price.replace(/[฿,]/g, '') : '';
    setPaymentAmount(totalAmount);

    setManualPaymentData({
      id: item.id,
      bill_no: item.bill_no,
      bill_title: item.title,
      member_name: item.member_name,
      house_no: item.house_no,
      total_price: item.total_price,
      remaining_amount: item.remaining_amount,
      status: item.status,
      member_id: item.member_id
    });
    setSelectedPaymentMethod('');
    setPaymentAmount('');
    setPaymentDate(dateStr);
    setPaymentTime(timeStr);
    setPaymentNotes('');

    // Reset payment method specific fields
    setTransferBank('');
    setTransferRef('');
    setCheckNumber('');
    setCheckBank('');
    setCheckDate('');
    setCardRef('');
    setCardLast4('');
    setOtherMethod('');

    setManualPaymentModalOpen(true);
  };


  // Handle confirm manual payment
  const handleConfirmManualPayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }

    if (!paymentDate || !paymentTime) {
      toast.error('กรุณาเลือกวันที่และเวลาที่ชำระ');
      return;
    }

    setSubmittingPayment(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    const payDateTime = `${paymentDate} ${paymentTime}:00`;

    // Use total_price from manualPaymentData (always full payment)
    const totalAmount = manualPaymentData?.total_price ? parseFloat(manualPaymentData.total_price.replace(/[฿,]/g, '')) : 0;

    // Build transaction_type_json based on payment method
    const transactionTypeJson: any = {
      bill_transaction_type_id: parseInt(selectedPaymentMethod)
    };

    // Add method-specific fields
    const methodId = parseInt(selectedPaymentMethod);
    if (methodId === 2) {
      // โอนเงินธนาคาร
      transactionTypeJson.transfer_bank = transferBank;
      transactionTypeJson.transfer_ref = transferRef;
    } else if (methodId === 3) {
      // เช็ค
      transactionTypeJson.check_number = checkNumber;
      transactionTypeJson.check_bank = checkBank;
      transactionTypeJson.check_date = checkDate;
    } else if (methodId === 4) {
      // บัตรเครดิต
      transactionTypeJson.card_ref = cardRef;
      transactionTypeJson.card_last4 = cardLast4;
    } else if (methodId === 5) {
      // อื่นๆ
      transactionTypeJson.other_method = otherMethod;
    }

    const body = {
      bill_room_id: manualPaymentData.id,
      member_id: manualPaymentData.member_id,
      bill_transaction_type_id: parseInt(selectedPaymentMethod),
      transaction_amount: totalAmount,
      pay_date: payDateTime,
      remark: paymentNotes || '',
      transaction_type_json: JSON.stringify(transactionTypeJson),
      customer_id: customerId,
      uid: uid
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill_transaction/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (result.success) {
      toast.success('บันทึกการชำระเงินสำเร็จ');
      setManualPaymentModalOpen(false);
      fetchList();
      fetchSummaryStatus();
      fetchSummaryData();
      fetchSummaryStatus2();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }

    setSubmittingPayment(false);
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
        title="จัดการการชำระเงิน"
        subtitle="ตรวจสอบและจัดการประวัติการชำระเงิน"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Card 1: บิลทั้งหมดเดือนนี้ - #2b6ef3 */}
          <Card className="relative overflow-hidden">
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
          <Card className="relative overflow-hidden">
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
          <Card className="relative overflow-hidden">
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
          <Card className="relative overflow-hidden">
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
          <Card className="relative overflow-hidden">
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
                    รายการบิลรอตรวจสอบและอนุมัติ
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
                {/* Tab 0: Dropdowns for Bill Type and Status */}
                {activeTab === '0' && (
                  <>
                    <Select value={selectedBillTypeId} onValueChange={setSelectedBillTypeId}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {billTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedBillStatus} onValueChange={setSelectedBillStatus}>
                      <SelectTrigger className="w-[180px] !h-[44px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {billStatusList.map((status) => (
                          <SelectItem key={status.id} value={String(status.id)}>
                            {status.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Tab 1: Dropdowns + Approve/Reject buttons */}
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

                    <Button variant="outline" className="!h-[44px] gap-2 bg-white" onClick={handleExportExcel}>
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
                <h3 className="text-xl font-bold text-slate-800 mb-0">รายการข้อมูล</h3>
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
                          {/* Tab 0: รอชำระ */}
                          {activeTab === '0' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">บิลเลขที่</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">ลูกบ้าน</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">หัวข้อบิล</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">ยอดรวม</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">คงค้าง</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">วันครบกำหนด</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">สถานะ</th>
                              <th className="px-3 py-3 text-center text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">การดำเนินการ</th>
                            </>
                          )}

                          {/* Tab 1, 2, 3: รอตรวจสอบ, อนุมัติแล้ว, ปฏิเสธ */}
                          {activeTab !== '0' && (
                            <>
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
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">ประเภทการชำระ</th>
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
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab === '0' ? 8 : activeTab === '3' ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                              {searchKeyword ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูล'}
                            </td>
                          </tr>
                        ) : (
                          data.map((item) => {
                            const statusInfo = activeTab === '0' ? getStatusBadge(item.status) : null;
                            const initials = item.member_real_name ? item.member_real_name.substring(0, 2) : '??';

                            return (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                {/* Tab 0: รอชำระ */}
                                {activeTab === '0' && (
                                  <>
                                    {/* บิลเลขที่ */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-semibold text-slate-800">{item.bill_no || '-'}</div>
                                    </td>

                                    {/* ลูกบ้าน */}
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
                                          <div className="text-xs text-slate-500 truncate">{item.house_no || '-'}</div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* หัวข้อบิล */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-slate-600">{item.title || '-'}</div>
                                    </td>

                                    {/* ยอดรวม */}
                                    <td className="px-4 py-4">
                                      <div className="font-bold text-slate-900">{item.total_price || '-'}</div>
                                    </td>

                                    {/* คงค้าง */}
                                    <td className="px-4 py-4">
                                      <div className="font-bold" style={{
                                        color: item.status === 0 ? '#D97706' :
                                               item.status === 3 ? '#B91C1C' :
                                               item.status === 4 ? '#0891B2' :
                                               '#0F172A'
                                      }}>
                                        {item.remaining_amount || '-'}
                                      </div>
                                    </td>

                                    {/* วันครบกำหนด */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-slate-800">
                                        {item.expire_date ? item.expire_date.split(' ')[0] : '-'}
                                      </div>
                                    </td>

                                    {/* สถานะ */}
                                    <td className="px-4 py-4 !text-center">
                                      {statusInfo && (
                                        <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`} style={{ color: statusInfo.textColor }}>
                                          {statusInfo.label}
                                        </div>
                                      )}
                                    </td>

                                    {/* การดำเนินการ */}
                                    <td className="px-4 py-4">
                                      <div className="flex justify-center gap-2">
                                        {item.status === 1 ? (
                                          <button
                                            onClick={() => handleViewTransactionClick(item)}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium cursor-pointer bg-blue-50 hover:bg-blue-100 hover:shadow-md text-blue-600 transition-all"
                                          >
                                            <i className="fas fa-eye"></i>
                                            ดูรายละเอียด
                                          </button>
                                        ) : item.status === 5 ? (
                                          <span className="text-sm text-slate-400">-</span>
                                        ) : (
                                          statusInfo && (
                                            <button
                                              onClick={() => handleManualPaymentClick(item)}
                                              className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium cursor-pointer hover:shadow-md transition-all ${statusInfo.className}`}
                                              style={{ color: statusInfo.textColor }}
                                            >
                                              <i className="fas fa-dollar-sign"></i>
                                              บันทึกการชำระ
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </td>
                                  </>
                                )}

                                {/* Tab 1, 2, 3: Other tabs */}
                                {activeTab !== '0' && (
                                  <>
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

                                    {/* ประเภทการชำระ */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-slate-600">{item.payment_type_detail || '-'}</div>
                                    </td>

                                    {/* สถานะ - Tab 1 only */}
                                    {activeTab === '1' && (
                                      <td className="px-4 py-4 !text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-yellow-50 hover:bg-yellow-100" style={{ color: '#D97706' }}>
                                          รอตรวจสอบ
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
                                          onClick={() => {
                                            if (activeTab === '2') {
                                              handleViewTransactionClick({ id: item.payable_id });
                                            } else {
                                              handleReviewSlipClick(item);
                                            }
                                          }}
                                          className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                                          title="ดู"
                                        >
                                          <i className="fas fa-eye text-sm"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
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
                      <div className="text-2xl font-bold text-slate-900 mb-1">{summaryStatus2?.card1 || 0}</div>
                      <div className="text-sm text-slate-600">บิลรอชำระ</div>
                    </div>
                  </div>

                  {/* Card 2: เกินกำหนด - Red */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-lg border-l-4 border-red-500 hover:translate-y-[-2px] transition-transform">
                    <div className="w-[50px] h-[50px] rounded-lg bg-red-500 flex items-center justify-center text-white text-xl">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">{summaryStatus2?.card2 || 0}</div>
                      <div className="text-sm text-slate-600">เกินกำหนด</div>
                    </div>
                  </div>

                  {/* Card 3: ยอดค้างรวม - Cyan */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-lg border-l-4 hover:translate-y-[-2px] transition-transform" style={{ borderLeftColor: '#0891B2' }}>
                    <div className="w-[50px] h-[50px] rounded-lg flex items-center justify-center text-white text-xl" style={{ backgroundColor: '#0891B2' }}>
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">{summaryStatus2?.card3 || '฿0'}</div>
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
      <ReviewSlipModal
        open={reviewSlipModalOpen}
        onOpenChange={setReviewSlipModalOpen}
        data={reviewSlipData}
        loading={loadingReviewSlip}
        showActions={activeTab === '1'}
        onApprove={() => handleApproveSingle(reviewSlipData?.id)}
        onReject={() => {
          setReviewSlipModalOpen(false);
          setSelectedIds([reviewSlipData.id]);
          setRejectDialogOpen(true);
        }}
        submitting={submittingAction}
      />

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              ระบุเหตุผลการปฏิเสธ
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Warning Box */}
            <div className="bg-red-100 p-4 rounded-lg mb-5 border-l-4 border-red-500">
              <div className="font-semibold text-red-500 mb-2">
                <i className="fas fa-info-circle"></i> กรุณาระบุเหตุผลในการปฏิเสธ
              </div>
              <p className="text-sm text-slate-700 mt-2">
                เหตุผลจะถูกส่งไปยังลูกบ้านเพื่อทำการแก้ไขและส่งสลิปใหม่
              </p>
            </div>

            {/* Quick Reasons */}
            <div className="mb-4">
              <label className="block mb-3 font-semibold text-slate-800">
                <i className="fas fa-list"></i> เลือกเหตุผลด่วน (Quick Text)
              </label>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setRejectRemark('ข้อมูลในสลิปไม่ชัดเจน กรุณาถ่ายภาพใหม่ให้ชัดเจนยิ่งขึ้น')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-image text-blue-600 w-5"></i>
                  <span>ข้อมูลในสลิปไม่ชัดเจน</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectRemark('จำนวนเงินไม่ตรงกับบิล กรุณาตรวจสอบและชำระให้ครบถ้วน')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-calculator text-blue-600 w-5"></i>
                  <span>จำนวนเงินไม่ตรงกับบิล</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectRemark('วันที่โอนเงินไม่ตรงกับระบบ กรุณาตรวจสอบอีกครั้ง')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-calendar text-blue-600 w-5"></i>
                  <span>วันที่โอนเงินไม่ตรง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectRemark('ไม่พบหลักฐานการโอนเงินในระบบธนาคาร กรุณาตรวจสอบ')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-university text-blue-600 w-5"></i>
                  <span>ไม่พบหลักฐานในระบบธนาคาร</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectRemark('สลิปไม่ตรงกับเลขที่บัญชีของนิติบุคคล')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-credit-card text-blue-600 w-5"></i>
                  <span>บัญชีปลายทางไม่ถูกต้อง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectRemark('สลิปถูกใช้ไปแล้ว หรืออาจเป็นสลิปปลอม')}
                  className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all hover:translate-x-1"
                >
                  <i className="fas fa-shield-alt text-blue-600 w-5"></i>
                  <span>สลิปถูกใช้แล้ว/ปลอม</span>
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="block mb-2 font-semibold text-slate-800">
                <i className="fas fa-comment-dots"></i> เหตุผลการปฏิเสธ *
              </label>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="กรอกเหตุผลการปฏิเสธ หรือเลือกจากปุ่มด่วนด้านบน..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={submittingAction}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              ย้อนกลับ
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRejectConfirm}
              disabled={submittingAction}
            >
              <i className="fas fa-times-circle mr-2"></i>
              {submittingAction ? 'กำลังบันทึก...' : 'ยืนยันการปฏิเสธ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Modal */}
      <Dialog open={manualPaymentModalOpen} onOpenChange={setManualPaymentModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <i className="fas fa-dollar-sign"></i>
              บันทึกการชำระเงินแบบ Manual
            </DialogTitle>
          </DialogHeader>

          {manualPaymentData && (
            <div className="space-y-6 py-4">
              {/* Bill Information */}
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
                <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                  <i className="fas fa-file-invoice"></i>
                  ข้อมูลบิล
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">เลขที่บิล:</span>
                    <span className="text-sm font-semibold text-slate-900">{manualPaymentData.bill_no}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">หัวข้อบิล:</span>
                    <span className="text-sm font-semibold text-slate-900">{manualPaymentData.bill_title}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">ลูกบ้าน:</span>
                    <span className="text-sm font-semibold text-slate-900">{manualPaymentData.member_name} ({manualPaymentData.house_no})</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">ยอดรวมบิล:</span>
                    <span className="text-sm font-semibold text-slate-900">{manualPaymentData.total_price}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">ชำระแล้ว:</span>
                    <span className="text-sm font-semibold text-slate-900">฿0</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">ยอดค้าง:</span>
                    <span className="text-sm font-bold text-red-700">{manualPaymentData.remaining_amount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Form */}
              <div>
                <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                  <i className="fas fa-credit-card"></i>
                  รายละเอียดการชำระเงิน
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">วิธีการชำระเงิน *</label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger className="w-full h-[42px] px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="เลือกวิธีการชำระ" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={String(method.id)}>
                            {method.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Amount - Display Only */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">จำนวนเงินที่ชำระ</label>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-900">
                      {manualPaymentData.total_price}
                    </div>
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">วันที่ชำระ</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Payment Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">เวลาที่ชำระ</label>
                    <input
                      type="time"
                      value={paymentTime}
                      onChange={(e) => setPaymentTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Payment Method Specific Fields */}
                {selectedPaymentMethod === '1' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                      <i className="fas fa-money-bill-wave"></i>
                      การชำระด้วยเงินสด
                    </h5>
                    <p className="text-sm text-slate-600">กรุณาตรวจนับเงินสดให้ถูกต้องก่อนบันทึก</p>
                  </div>
                )}

                {selectedPaymentMethod === '2' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <i className="fas fa-university"></i>
                      การโอนเงินธนาคาร
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ธนาคารที่โอน</label>
                        <input
                          type="text"
                          value={transferBank}
                          onChange={(e) => setTransferBank(e.target.value)}
                          placeholder="เช่น: ธนาคารกสิกรไทย"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">เลขที่อ้างอิง</label>
                        <input
                          type="text"
                          value={transferRef}
                          onChange={(e) => setTransferRef(e.target.value)}
                          placeholder="เลขที่อ้างอิงการโอน"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === '3' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <i className="fas fa-file-invoice"></i>
                      การชำระด้วยเช็ค
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">หมายเลขเช็ค</label>
                        <input
                          type="text"
                          value={checkNumber}
                          onChange={(e) => setCheckNumber(e.target.value)}
                          placeholder="เลขที่เช็ค"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ธนาคารที่ออกเช็ค</label>
                        <input
                          type="text"
                          value={checkBank}
                          onChange={(e) => setCheckBank(e.target.value)}
                          placeholder="ชื่อธนาคาร"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">วันที่เช็ค</label>
                        <input
                          type="date"
                          value={checkDate}
                          onChange={(e) => setCheckDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-3 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <small className="text-yellow-800 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        กรุณาเก็บเช็คต้นฉบับไว้เป็นหลักฐาน
                      </small>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === '4' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <i className="fas fa-credit-card"></i>
                      การชำระด้วยบัตรเครดิต
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">หมายเลขอ้างอิง</label>
                        <input
                          type="text"
                          value={cardRef}
                          onChange={(e) => setCardRef(e.target.value)}
                          placeholder="เลขที่ Approval Code"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">4 หลักท้ายของบัตร</label>
                        <input
                          type="text"
                          value={cardLast4}
                          onChange={(e) => setCardLast4(e.target.value)}
                          placeholder="XXXX"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === '5' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <i className="fas fa-ellipsis-h"></i>
                      วิธีการอื่นๆ
                    </h5>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">ระบุวิธีการชำระ</label>
                      <input
                        type="text"
                        value={otherMethod}
                        onChange={(e) => setOtherMethod(e.target.value)}
                        placeholder="เช่น: คูปอง, บัตรกำนัล"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}


                {/* Notes */}
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-slate-700">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={3}
                    placeholder="บันทึกรายละเอียดเพิ่มเติม เช่น หมายเลขเช็ค, การอ้างอิง, ฯลฯ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setManualPaymentModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={handleConfirmManualPayment}
              disabled={submittingPayment}
            >
              <i className="fas fa-save"></i>
              บันทึกการชำระเงิน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transaction Modal */}
      <TransactionDetailModal
        open={viewTransactionModalOpen}
        onOpenChange={setViewTransactionModalOpen}
        billRoomId={viewTransactionBillRoomId}
        onSlipClick={(paymentId) => handleReviewSlipClick({ id: paymentId })}
      />
    </div>
  );
}
