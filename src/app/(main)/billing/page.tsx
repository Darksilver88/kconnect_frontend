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
import { Plus } from 'lucide-react';
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
const MENU = 'bill';
const UID = 5;

// ตัวแปร API path
const API_LIST = 'bill/list';
const API_INSERT = 'bill/insert';
const API_UPDATE = 'bill/update';
const API_DELETE = 'bill/delete';
const API_DETAIL = 'bill';
const API_BILL_ROOM_LIST = 'bill/bill_room_list';

// ไฟล์ที่รองรับในการอัปโหลด
const ACCEPTED_FILES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';

export default function BillingPage() {
  const { setSidebarOpen } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary data states
  const [billSummaryData, setBillSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    bill_type_id: '',
    detail: '',
    expire_date: '',
    remark: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = editingItem !== null;

  // Delete states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // View states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [loadingView, setLoadingView] = useState(false);

  // Edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    detail: '',
    expire_date: '',
    status: '0',
  });

  // Send notification states
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendItem, setSendItem] = useState<any>(null);
  const [sendChannels, setSendChannels] = useState({
    app: true,
    // sms: true,
    // email: true,
  });
  const [sending, setSending] = useState(false);

  // Cancel send states
  const [cancelSendModalOpen, setCancelSendModalOpen] = useState(false);
  const [cancelSendItem, setCancelSendItem] = useState<any>(null);
  const [cancelingSend, setCancelingSend] = useState(false);

  // Bill details modal states
  const [billDetailsModalOpen, setBillDetailsModalOpen] = useState(false);
  const [billDetailsLoading, setBillDetailsLoading] = useState(false);
  const [billDetailsData, setBillDetailsData] = useState<any>(null);
  const [billDetailsCurrentPage, setBillDetailsCurrentPage] = useState(1);
  const [billDetailsPagination, setBillDetailsPagination] = useState<any>(null);
  const [billDetailsSearchKeyword, setBillDetailsSearchKeyword] = useState('');
  const [billDetailsBillId, setBillDetailsBillId] = useState<number | null>(null);
  const [billDetailsStatusFilter, setBillDetailsStatusFilter] = useState('-1');

  // File upload states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadKey, setCurrentUploadKey] = useState<string>('');

  // File delete confirmation states
  const [deleteFileConfirmOpen, setDeleteFileConfirmOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // keyword ที่ส่งไป API

  // Import data states
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [excludedRows, setExcludedRows] = useState<number[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);

  // Delete row states
  const [deleteRowConfirmOpen, setDeleteRowConfirmOpen] = useState(false);
  const [deleteRowNumber, setDeleteRowNumber] = useState<number | null>(null);
  const [deleteRowHouseNo, setDeleteRowHouseNo] = useState<string>('');

  // Bill type states
  const [billTypes, setBillTypes] = useState<any[]>([]);
  const [loadingBillTypes, setLoadingBillTypes] = useState(false);

  // Fetch summary data (once on mount)
  const fetchSummary = async () => {
    setSummaryLoading(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}bill/get_summary_data?customer_id=${encodeURIComponent(customerId)}`;
    const result = await apiCall(url);

    if (result.success) {
      setBillSummaryData(result.data);
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

  // Fetch bill types
  const fetchBillTypes = async () => {
    setLoadingBillTypes(true);
    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill_type/list?page=1&limit=100`);
    if (result.success) {
      setBillTypes(result.data || []);
    } else {
      toast.error('ไม่สามารถดึงข้อมูลประเภทบิลได้');
    }
    setLoadingBillTypes(false);
  };

  // Fetch bill excel list after upload
  const fetchBillExcelList = async (uploadKey: string) => {
    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/bill_excel_list?upload_key=${uploadKey}`);
    if (result.success) {
      setImportedData(result.data.items || []);
      setSummaryData(result.data);
      setShowDataPreview(true);
    } else {
      toast.error(result.message || 'ไม่สามารถดึงข้อมูล Excel ได้');
    }
  };

  // Load bill types when modal opens
  useEffect(() => {
    if (isModalOpen && !isEditMode) {
      fetchBillTypes();
    }
  }, [isModalOpen]);

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return {
        label: 'แจ้งแล้ว',
        className: 'bg-green-50 text-green-700 hover:bg-green-100'
      };
    }
    if (status === 3) {
      return {
        label: 'รอการแจ้ง',
        className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      };
    }
    return {
      label: 'ฉบับร่าง',
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

  // Handle Excel file upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploading(true);

    const uploadKey = currentUploadKey || generateUploadKey();
    if (!currentUploadKey) {
      setCurrentUploadKey(uploadKey);
    }

    const formData = new FormData();
    formData.append('files', file);
    formData.append('upload_key', uploadKey);
    formData.append('menu', MENU);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}upload_file`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        toast.success('อัปโหลดไฟล์สำเร็จ');
        // Fetch bill excel list
        await fetchBillExcelList(uploadKey);
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    }

    setUploading(false);
    e.target.value = '';
  };

  // Handle download template
  const handleDownloadTemplate = (type: 'csv' | 'xlsx') => {
    const fileName = type === 'csv' ? 'template_bill_csv.csv' : 'template_bill_excel.xlsx';
    // Remove 'api/' from path for template downloads
    const baseUrl = process.env.NEXT_PUBLIC_API_PATH?.replace(/api\/$/, '') || '';
    const url = `${baseUrl}uploads/${fileName}`;

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle delete row click
  const handleDeleteRowClick = (rowNumber: number, houseNo: string) => {
    setDeleteRowNumber(rowNumber);
    setDeleteRowHouseNo(houseNo);
    setDeleteRowConfirmOpen(true);
  };

  // Handle delete row confirm (frontend only)
  const handleDeleteRowConfirm = () => {
    if (!deleteRowNumber) return;

    // Find the item being deleted
    const deletedItem = importedData.find((item) => item.row_number === deleteRowNumber);

    // Filter out the deleted item
    const newImportedData = importedData.filter((item) => item.row_number !== deleteRowNumber);

    // Check if this is the last item
    if (newImportedData.length === 0) {
      // Reset everything like no file was uploaded
      setImportedData([]);
      setShowDataPreview(false);
      setUploadedFileName('');
      setExcludedRows([]);
      setSummaryData(null);
      setCurrentUploadKey('');
      setDeleteRowConfirmOpen(false);
      setDeleteRowNumber(null);
      setDeleteRowHouseNo('');
      toast.success('ลบรายการสุดท้ายแล้ว กรุณาอัปโหลดไฟล์ใหม่');
      return;
    }

    if (deletedItem && summaryData) {
      // Update summary based on status
      const currentTotal = parseInt(summaryData.total_rows);
      const currentValid = parseInt(summaryData.valid_rows);
      const currentInvalid = parseInt(summaryData.invalid_rows);

      // Parse current total price (remove ฿ and commas)
      const currentPrice = parseFloat(summaryData.total_price.replace(/[฿,]/g, ''));

      let newTotalRows = currentTotal - 1;
      let newValidRows = currentValid;
      let newInvalidRows = currentInvalid;
      let newTotalPrice = currentPrice;

      if (deletedItem.status === 0) {
        // Status 0: reduce total and invalid only
        newInvalidRows -= 1;
      } else if (deletedItem.status === 1) {
        // Status 1: reduce total, valid, and price
        newValidRows -= 1;
        newTotalPrice -= parseFloat(deletedItem.total_price);
      }

      // Update summary data
      setSummaryData({
        ...summaryData,
        total_rows: String(newTotalRows),
        valid_rows: String(newValidRows),
        invalid_rows: String(newInvalidRows),
        total_price: `฿${newTotalPrice.toLocaleString()}`
      });
    }

    setImportedData(newImportedData);
    setExcludedRows((prev) => [...prev, deleteRowNumber]);
    setDeleteRowConfirmOpen(false);
    setDeleteRowNumber(null);
    setDeleteRowHouseNo('');
    toast.success('ลบรายการสำเร็จ');
  };


  // Handle delete
  const handleDeleteClick = (item: any) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    setDeleting(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_DELETE}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: deleteItem.id,
        uid: uid,
      }),
    });

    if (result.success) {
      await refreshList(); // Refresh ที่หน้าเดิม, ไม่ reset keyword
      setDeleteModalOpen(false);
      setDeleteItem(null);
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

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/${id}`);

    if (result.success) {
      setViewData(result.data);
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูล');
      setViewModalOpen(false);
    }

    setLoadingView(false);
  };

  // Handle edit button click
  const handleEditClick = async (id: number) => {
    setLoadingEdit(true);
    setEditModalOpen(true);
    setEditData(null);

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/${id}`);

    if (result.success) {
      setEditData(result.data);

      // Format expire_date to YYYY-MM-DD if needed
      let formattedExpireDate = result.data.expire_date || '';
      console.log('Original expire_date from API:', formattedExpireDate);

      // Convert to YYYY-MM-DD for date input
      if (formattedExpireDate) {
        if (formattedExpireDate.includes('T')) {
          // ISO 8601 format: "2025-10-09T17:00:00.000Z" -> "2025-10-09"
          formattedExpireDate = formattedExpireDate.split('T')[0];
        } else if (formattedExpireDate.includes('/')) {
          // DD/MM/YYYY format
          const parts = formattedExpireDate.split(' ')[0].split('/');
          if (parts.length === 3) {
            formattedExpireDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else if (formattedExpireDate.includes(' ')) {
          // "YYYY-MM-DD HH:MM:SS" format
          formattedExpireDate = formattedExpireDate.split(' ')[0];
        }
      }

      console.log('Formatted expire_date for input:', formattedExpireDate);

      // Populate form with data
      setEditFormData({
        title: result.data.title || '',
        detail: result.data.detail || '',
        expire_date: formattedExpireDate,
        status: String(result.data.status || '0'),
      });
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูล');
      setEditModalOpen(false);
    }

    setLoadingEdit(false);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editData) return;

    setSubmitting(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const payload = {
      id: editData.id,
      title: editFormData.title,
      detail: editFormData.detail,
      expire_date: editFormData.expire_date,
      status: parseInt(editFormData.status),
      uid: uid,
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}${API_UPDATE}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      setEditModalOpen(false);
      setEditData(null);
      setEditFormData({ title: '', detail: '', expire_date: '', status: '0' });
      await refreshList();
      toast.success(result.message || 'แก้ไขข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการแก้ไข');
    }

    setSubmitting(false);
  };

  // Handle send notification click
  const handleSendClick = (item: any) => {
    setSendItem(item);
    setSendChannels({ app: true });
    setSendModalOpen(true);
  };

  // Handle send notification submit
  const handleSendSubmit = async () => {
    if (!sendItem) return;

    // Check if at least one channel is selected
    const hasSelectedChannel = sendChannels.app; // || sendChannels.sms || sendChannels.email;
    if (!hasSelectedChannel) {
      toast.error('กรุณาเลือกช่องทางการส่งอย่างน้อย 1 ช่องทาง');
      return;
    }

    setSending(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: sendItem.id,
        uid: uid,
      }),
    });

    if (result.success) {
      setSendModalOpen(false);
      setSendItem(null);
      setSendChannels({ app: true });
      await refreshList();
      toast.success(result.message || 'ส่งการแจ้งเตือนสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
    }

    setSending(false);
  };

  // Handle cancel send click
  const handleCancelSendClick = (item: any) => {
    setCancelSendItem(item);
    setCancelSendModalOpen(true);
  };

  // Handle cancel send confirm
  const handleCancelSendConfirm = async () => {
    if (!cancelSendItem) return;

    setCancelingSend(true);

    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/cancel_send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: cancelSendItem.id,
        uid: uid,
      }),
    });

    if (result.success) {
      setCancelSendModalOpen(false);
      setCancelSendItem(null);
      await refreshList();
      toast.success(result.message || 'ยกเลิกการแจ้งเตือนสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการยกเลิกการแจ้งเตือน');
    }

    setCancelingSend(false);
  };

  // Handle room count click - show bill details modal
  const handleRoomCountClick = async (billId: number, page: number = 1, keyword?: string, statusFilter?: string) => {
    // Only show modal and clear data on first load
    if (!billDetailsModalOpen) {
      setBillDetailsModalOpen(true);
      setBillDetailsData(null);
    }

    setBillDetailsLoading(true);
    setBillDetailsCurrentPage(page);
    setBillDetailsBillId(billId);

    const searchKeyword = keyword !== undefined ? keyword : billDetailsSearchKeyword;
    const statusValue = statusFilter !== undefined ? statusFilter : billDetailsStatusFilter;
    const url = `${process.env.NEXT_PUBLIC_API_PATH}${API_BILL_ROOM_LIST}?page=${page}&limit=${LIMIT}&keyword=${encodeURIComponent(searchKeyword)}&bill_id=${billId}&status=${statusValue}`;
    const result = await apiCall(url);

    if (result.success) {
      setBillDetailsData(result.data);
      setBillDetailsPagination(result.pagination);
    } else {
      toast.error(result.message || result.error || 'ไม่พบข้อมูล');
      setBillDetailsModalOpen(false);
    }

    setBillDetailsLoading(false);
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: number) => {
    if (status === 1) {
      return {
        label: 'ชำระแล้ว',
        className: 'bg-green-50 text-green-700'
      };
    }
    if (status === 3) {
      return {
        label: 'เกินกำหนด',
        className: 'bg-red-50 text-red-700'
      };
    }
    return {
      label: 'รอชำระ',
      className: 'bg-yellow-50 text-yellow-700'
    };
  };

  // Format number with comma
  const formatPrice = (price: number) => {
    return `฿${price.toLocaleString()}`;
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
  const handleSubmit = async (status: number) => {
    setSubmitting(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    const payload = {
      upload_key: currentUploadKey,
      title: formData.title,
      bill_type_id: parseInt(formData.bill_type_id),
      detail: formData.detail,
      expire_date: formData.expire_date,
      remark: formData.remark || '',
      customer_id: customerId,
      status: status,
      uid: uid,
      excluded_rows: excludedRows.join(','),
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bill/insert_with_excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      setIsModalOpen(false);
      setFormData({ title: '', bill_type_id: '', detail: '', expire_date: '', remark: '' });
      setAttachments([]);
      setCurrentUploadKey('');
      setShowDataPreview(false);
      setImportedData([]);
      setUploadedFileName('');
      setExcludedRows([]);
      setSummaryData(null);

      await refreshList(true);
      toast.success(result.message || 'บันทึกข้อมูลสำเร็จ');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }

    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="จัดการบิล"
        subtitle="หน้าจัดการบิลและการเรียกเก็บเงิน"
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
        ) : billSummaryData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Card 1: Blue - หัวข้อบิลในระบบ */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <i className="fas fa-file-invoice text-blue-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {billSummaryData.total_bills?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">หัวข้อบิลในระบบ</div>
                <div className={`text-xs font-bold ${billSummaryData.total_bills?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${billSummaryData.total_bills?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {billSummaryData.total_bills?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 2: Green - บิลที่แจ้งแล้ว */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {billSummaryData.sent_bills?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">บิลที่แจ้งแล้ว</div>
                <div className={`text-xs font-bold ${billSummaryData.sent_bills?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${billSummaryData.sent_bills?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {billSummaryData.sent_bills?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 3: Yellow - รอการชำระ */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <i className="fas fa-clock text-yellow-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {billSummaryData.pending_payment?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">รอการชำระ</div>
                <div className={`text-xs font-bold ${billSummaryData.pending_payment?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${billSummaryData.pending_payment?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {billSummaryData.pending_payment?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 4: Purple - ชำระเสร็จแล้ว */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <i className="fas fa-money-check text-purple-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {billSummaryData.paid?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">ชำระเสร็จแล้ว</div>
                <div className={`text-xs font-bold ${billSummaryData.paid?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${billSummaryData.paid?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {billSummaryData.paid?.change_text || '-'}
                </div>
              </div>
            </Card>

            {/* Card 5: Teal - ห้องทั้งหมด */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500"></div>
              <div className="p-4 relative">
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                  <i className="fas fa-home text-teal-500 text-lg"></i>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {billSummaryData.total_rooms?.count || 0}
                </div>
                <div className="text-sm text-slate-600 mb-2">ห้องทั้งหมด</div>
                <div className={`text-xs font-bold ${billSummaryData.total_rooms?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fas fa-arrow-${billSummaryData.total_rooms?.change >= 0 ? 'up' : 'down'}`}></i>{' '}
                  {billSummaryData.total_rooms?.change_text || '-'}
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
              placeholder="ค้นหาจากหัวข้อบิล, งวด หรือ วันที่..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            {/* Add Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-11 gap-2"
              onClick={() => {
                setEditingItem(null);
                setFormData({ title: '', bill_type_id: '', detail: '', expire_date: '', remark: '' });
                setAttachments([]);
                setCurrentUploadKey('');
                setShowDataPreview(false);
                setImportedData([]);
                setUploadedFileName('');
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">สร้างบิลใหม่</span>
              <span className="sm:hidden">สร้าง</span>
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-0">รายการหัวข้อบิลทั้งหมด</h3>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[25%]">หัวข้อแจ้งบิล</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[12%]">วันเวลาที่สร้าง</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-[12%]">วันเวลาที่แจ้ง</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[10%]">จำนวนห้อง</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 w-[12%]">ยอดรวม (บาท)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[12%]">สถานะการแจ้ง</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-[12%]">การดำเนินการ</th>
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
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-800">{item.title || '-'}</div>
                            <div className="text-sm text-slate-600 mt-1">
                              งวด: {item.detail || '-'} • ครบกำหนด: {item.expire_date_formatted ? item.expire_date_formatted.split(' ')[0] : '-'}
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
                            {item.send_date_formatted ? (
                              <>
                                <div className="text-slate-800">{item.send_date_formatted.split(' ')[0]}</div>
                                <div className="text-sm text-slate-600">{item.send_date_formatted.split(' ')[1]}</div>
                              </>
                            ) : (
                              <div className="text-slate-600">-</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center text-sm">
                            {item.total_room ? (
                              <button
                                onClick={() => handleRoomCountClick(item.id)}
                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                              >
                                {item.total_room} ห้อง
                              </button>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-slate-800 font-bold">
                            {item.total_price || '-'}
                          </td>
                          <td className="px-4 py-4 !text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}>
                              {statusInfo.label}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-2">
                              {/* ปุ่ม ดู - แสดงทุก status */}
                              <button
                                onClick={() => handleViewClick(item.id)}
                                className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:-translate-y-0.5"
                                title="ดู"
                              >
                                <i className="fas fa-eye text-sm"></i>
                              </button>

                              {/* ปุ่มเมื่อ status = 1 (แจ้งแล้ว) */}
                              {item.status === 1 && (
                                <button
                                  onClick={() => handleCancelSendClick(item)}
                                  className="w-8 h-8 rounded-md bg-yellow-100 text-yellow-500 hover:bg-yellow-200 transition-all hover:-translate-y-0.5"
                                  title="ยกเลิกการแจ้ง"
                                >
                                  <i className="fas fa-ban text-sm"></i>
                                </button>
                              )}

                              {/* ปุ่มเมื่อ status = 3 (รอการแจ้ง) */}
                              {item.status === 3 && (
                                <button
                                  onClick={() => handleSendClick(item)}
                                  className="w-8 h-8 rounded-md bg-green-100 text-green-500 hover:bg-green-200 transition-all hover:-translate-y-0.5"
                                  title="ส่งการแจ้งเตือน"
                                >
                                  <i className="fas fa-paper-plane text-sm"></i>
                                </button>
                              )}

                              {/* ปุ่มเมื่อ status = 0 (ฉบับร่าง) */}
                              {item.status === 0 && (
                                <>
                                  <button
                                    onClick={() => handleEditClick(item.id)}
                                    className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all hover:-translate-y-0.5"
                                    title="แก้ไข"
                                  >
                                    <i className="fas fa-edit text-sm"></i>
                                  </button>
                                  <button
                                    onClick={() => handleSendClick(item)}
                                    className="w-8 h-8 rounded-md bg-green-100 text-green-500 hover:bg-green-200 transition-all hover:-translate-y-0.5"
                                    title="ส่งการแจ้งเตือน"
                                  >
                                    <i className="fas fa-paper-plane text-sm"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="w-8 h-8 rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-all hover:-translate-y-0.5"
                                    title="ลบ"
                                  >
                                    <i className="fas fa-trash text-sm"></i>
                                  </button>
                                </>
                              )}
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

      {/* Cancel Send Confirmation Dialog */}
      <ConfirmDialog
        open={cancelSendModalOpen}
        onOpenChange={setCancelSendModalOpen}
        onConfirm={handleCancelSendConfirm}
        title="ยืนยันการยกเลิกการแจ้งเตือน"
        description="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแจ้งเตือนบิลนี้? ลูกบ้านจะไม่เห็นบิลนี้อีกต่อไป"
        loading={cancelingSend}
        confirmText="ยืนยัน"
        variant="default"
      />

      {/* Send Notification Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <i className="fas fa-paper-plane"></i>
              ส่งการแจ้งเตือน
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-slate-600">
              เลือกช่องทางการส่งการแจ้งเตือนไปยังลูกบ้าน
            </p>

            <div className="space-y-3">
              {/* Application Channel */}
              <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sendChannels.app}
                  onChange={(e) => setSendChannels({ ...sendChannels, app: e.target.checked })}
                  className="w-4 h-4 mr-3 accent-blue-600"
                />
                <div>
                  <div className="font-semibold text-slate-900">Application</div>
                  <div className="text-xs text-slate-500">แจ้งเตือนผ่านแอปพลิเคชัน</div>
                </div>
              </label>

              {/* SMS Channel - Commented */}
              {/* <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sendChannels.sms}
                  onChange={(e) => setSendChannels({ ...sendChannels, sms: e.target.checked })}
                  className="w-4 h-4 mr-3 accent-blue-600"
                />
                <div>
                  <div className="font-semibold text-slate-900">SMS</div>
                  <div className="text-xs text-slate-500">ส่งข้อความ SMS</div>
                </div>
              </label> */}

              {/* Email Channel - Commented */}
              {/* <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sendChannels.email}
                  onChange={(e) => setSendChannels({ ...sendChannels, email: e.target.checked })}
                  className="w-4 h-4 mr-3 accent-blue-600"
                />
                <div>
                  <div className="font-semibold text-slate-900">Email</div>
                  <div className="text-xs text-slate-500">ส่งอีเมล</div>
                </div>
              </label> */}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSendModalOpen(false)}
              disabled={sending}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSendSubmit}
              disabled={sending || !sendChannels.app}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  ส่งการแจ้งเตือน
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <i className="fas fa-edit"></i>
              แก้ไขบิล
            </DialogTitle>
          </DialogHeader>

          {loadingEdit ? (
            <LoadingSpinner />
          ) : editData ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">หัวข้อบิล</Label>
                <Input
                  id="edit_title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="เช่น: ค่าส่วนกลาง ประจำเดือน กันยายน 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_detail">งวด</Label>
                <Input
                  id="edit_detail"
                  value={editFormData.detail}
                  onChange={(e) => setEditFormData({ ...editFormData, detail: e.target.value })}
                  placeholder="เช่น: กันยายน 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_expire_date">วันครบกำหนด</Label>
                <Input
                  id="edit_expire_date"
                  type="date"
                  value={editFormData.expire_date}
                  onChange={(e) => setEditFormData({ ...editFormData, expire_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">สถานะ</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">ฉบับร่าง</SelectItem>
                    <SelectItem value="1">แจ้งแล้ว</SelectItem>
                    <SelectItem value="3">รอการแจ้ง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEditSubmit}
              disabled={submitting || !editFormData.title || !editFormData.detail || !editFormData.expire_date}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  บันทึก
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bill Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <i className="fas fa-exclamation-triangle"></i>
              ยืนยันการลบ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-slate-600">
              คุณแน่ใจหรือไม่ที่จะลบบิลนี้?
            </p>

            {/* Warning Box */}
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                คำเตือน
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <div>การลบบิลนี้จะส่งผลต่อ:</div>
                <div>
                  • <strong>{deleteItem?.total_room || 0} ห้อง</strong> จะไม่สามารถเห็นบิลนี้ได้
                </div>
                <div>• ข้อมูลการชำระเงินที่เกี่ยวข้องจะถูกลบ</div>
                <div>
                  • <strong>ไม่สามารถกู้คืนข้อมูลได้</strong> หลังจากลบแล้ว
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>กำลังลบ...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-trash mr-2"></i>
                  ยืนยันการลบ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insert/Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>สร้างหัวข้อบิลใหม่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">หัวข้อบิล</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น: ค่าส่วนกลาง ประจำเดือน กันยายน 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill_type">ประเภทบิล</Label>
                  <Select
                    value={formData.bill_type_id}
                    onValueChange={(value) => setFormData({ ...formData, bill_type_id: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกประเภทบิล" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBillTypes ? (
                        <SelectItem value="loading" disabled>กำลังโหลด...</SelectItem>
                      ) : (
                        billTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail">งวดที่เรียกเก็บ</Label>
                  <Input
                    id="detail"
                    value={formData.detail}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                    placeholder="เช่น: กันยายน 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expire_date">วันครบกำหนดชำระ</Label>
                  <Input
                    id="expire_date"
                    type="date"
                    value={formData.expire_date}
                    onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Remark */}
              <div className="space-y-2">
                <Label htmlFor="remark">หมายเหตุ</Label>
                <textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="หมายเหตุเพิ่มเติม"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Import Section */}
              <div className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold text-slate-900">นำเข้าข้อมูลรายการบิล</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white h-8 text-xs"
                      onClick={() => handleDownloadTemplate('csv')}
                    >
                      <i className="fas fa-download mr-1"></i> CSV
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                      onClick={() => handleDownloadTemplate('xlsx')}
                    >
                      <i className="fas fa-download mr-1"></i> XLSX
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="file"
                    id="excelFile"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-16 border-2 border-dashed border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => document.getElementById('excelFile')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mr-2" />
                        <span>กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-2"></i>
                        <span>{uploadedFileName || 'เลือกไฟล์ Excel (.xlsx) หรือ CSV (.csv)'}</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div><strong>รูปแบบไฟล์ที่รองรับ:</strong> Excel (.xlsx, .xls) หรือ CSV (.csv)</div>
                  <div><strong>คอลัมน์ที่ต้องมี:</strong> เลขห้อง, ชื่อลูกบ้าน, ยอดเงิน, หมายเหตุ (ถ้ามี)</div>
                </div>
              </div>

              {/* Data Preview Section (Hidden initially) */}
              {showDataPreview && summaryData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-semibold text-slate-900">
                      <i className="fas fa-table mr-2"></i>ตรวจสอบข้อมูลที่นำเข้า
                    </h4>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-slate-600 font-medium">
                        {importedData.length} รายการ
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => {
                          setImportedData([]);
                          setShowDataPreview(false);
                          setUploadedFileName('');
                          setExcludedRows([]);
                          setSummaryData(null);
                        }}
                      >
                        <i className="fas fa-trash mr-1"></i> ล้างข้อมูล
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">เลขห้อง</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">ชื่อลูกบ้าน</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">ยอดเงิน</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">หมายเหตุ</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">สถานะ</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedData.map((item) => {
                          const statusBadge = item.status === 1
                            ? { label: 'ถูกต้อง', className: 'bg-green-50 text-green-700' }
                            : { label: 'ผิดพลาด', className: 'bg-red-50 text-red-700' };

                          return (
                            <tr key={item.row_number} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-800 font-medium">{item.row_number}</td>
                              <td className="px-4 py-3 text-slate-800">{item.house_no}</td>
                              <td className="px-4 py-3 text-slate-800">{item.member_name}</td>
                              <td className="px-4 py-3 text-right text-slate-800 font-medium">
                                ฿{Number(item.total_price).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{item.remark || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusBadge.className}`}>
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteRowClick(item.row_number, item.house_no)}
                                >
                                  <i className="fas fa-trash text-xs"></i>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Cards */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {summaryData.total_rows}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">รายการทั้งหมด</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-500">{summaryData.valid_rows}</div>
                        <div className="text-xs text-slate-600 mt-1">รายการถูกต้อง</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">{summaryData.invalid_rows}</div>
                        <div className="text-xs text-slate-600 mt-1">รายการผิดพลาด</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{summaryData.total_price}</div>
                        <div className="text-xs text-slate-600 mt-1">ยอดรวม</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="bg-slate-500 hover:bg-slate-600"
                disabled={!showDataPreview || submitting || !formData.title || !formData.bill_type_id || !formData.detail || !formData.expire_date}
                onClick={() => handleSubmit(0)}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    บันทึกฉบับร่าง
                  </>
                )}
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!showDataPreview || submitting || !formData.title || !formData.bill_type_id || !formData.detail || !formData.expire_date}
                onClick={() => handleSubmit(1)}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    สร้างและส่งแจ้งเตือน
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              <i className="fas fa-eye mr-2"></i>รายละเอียดบิล
            </DialogTitle>
          </DialogHeader>

          {loadingView ? (
            <LoadingSpinner />
          ) : viewData ? (
            <div className="space-y-3 py-4">
              {/* Info Row Pattern */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">รหัสบิล</span>
                <span className="text-sm text-slate-900 font-medium">{viewData.bill_no || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">หัวข้อบิล</span>
                <span className="text-sm text-slate-900 font-medium text-right">{viewData.title || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">งวด</span>
                <span className="text-sm text-slate-900 font-medium">{viewData.detail || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">วันที่สร้าง</span>
                <span className="text-sm text-slate-900 font-medium">{viewData.create_date_formatted || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">วันที่แจ้ง</span>
                <span className="text-sm text-slate-900 font-medium">{viewData.send_date_formatted || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">วันครบกำหนด</span>
                <span className="text-sm text-slate-900 font-medium">
                  {viewData.expire_date_formatted ? viewData.expire_date_formatted.split(' ')[0] : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">จำนวนห้อง</span>
                <span className="text-sm text-slate-900 font-medium">
                  {viewData.total_room ? `${viewData.total_room} ห้อง` : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">ยอดรวม</span>
                <span className="text-sm text-blue-600 font-semibold">{viewData.total_price || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-900">สถานะ</span>
                <span>
                  <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getStatusBadge(viewData.status).className}`}>
                    {getStatusBadge(viewData.status).label}
                  </span>
                </span>
              </div>
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

      {/* Delete Row Confirmation Dialog */}
      <ConfirmDialog
        open={deleteRowConfirmOpen}
        onOpenChange={setDeleteRowConfirmOpen}
        onConfirm={handleDeleteRowConfirm}
        title="ยืนยันการลบรายการ"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการห้อง ${deleteRowHouseNo}? รายการนี้จะไม่ถูกนำเข้าในระบบ`}
        loading={false}
      />

      {/* Bill Room Details Modal */}
      <Dialog open={billDetailsModalOpen} onOpenChange={setBillDetailsModalOpen}>
        <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              <i className="fas fa-file-invoice mr-2"></i>รายละเอียดบิลแต่ละห้อง
            </DialogTitle>
          </DialogHeader>

          {!billDetailsData ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6 py-4">
              {/* Header Info Section - Blue Background */}
              <div className="bg-blue-50 p-6 rounded-xl mb-6">
                {/* Row 1: หัวข้อบิล, ประเภทบิล, งวดที่เรียกเก็บ */}
                <div className="grid grid-cols-3 gap-5 mb-5 pb-5 border-b border-blue-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">หัวข้อบิล</div>
                    <div className="font-semibold text-gray-900 text-[15px]">
                      {billDetailsData.bill_info?.title || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ประเภทบิล</div>
                    <div className="font-semibold text-gray-900 text-[15px]">
                      {billDetailsData.bill_info?.bill_type_title || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">งวดที่เรียกเก็บ</div>
                    <div className="font-semibold text-gray-900 text-[15px]">
                      {billDetailsData.bill_info?.detail || '-'}
                    </div>
                  </div>
                </div>

                {/* Row 2: จำนวนห้อง, ยอดรวม, สถานะ */}
                <div className="grid grid-cols-3 gap-5 mb-5 pb-5 border-b border-blue-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">จำนวนห้องทั้งหมด</div>
                    <div className="font-semibold text-blue-600 text-[15px]">
                      {billDetailsData.total_rows || 0} ห้อง
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ยอดรวมทั้งหมด</div>
                    <div className="font-semibold text-gray-900 text-[15px]">
                      {billDetailsData.total_price || '฿0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">สถานะการแจ้ง</div>
                    <div>
                      {billDetailsData.bill_info?.status !== undefined && (
                        <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getStatusBadge(billDetailsData.bill_info.status).className}`}>
                          {getStatusBadge(billDetailsData.bill_info.status).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: วันที่สร้าง, วันที่แจ้ง */}
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">วันเวลาที่สร้าง</div>
                    <div className="font-medium text-gray-700 text-sm">
                      {billDetailsData.bill_info?.create_date_formatted || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">วันเวลาที่แจ้ง</div>
                    <div className="font-medium text-gray-700 text-sm">
                      {billDetailsData.bill_info?.send_date_formatted || '-'}
                    </div>
                  </div>
                  <div>
                    {/* Empty column for alignment */}
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <SearchBar
                    value={billDetailsSearchKeyword}
                    onChange={setBillDetailsSearchKeyword}
                    onSearch={() => billDetailsBillId && handleRoomCountClick(billDetailsBillId, 1)}
                    onClear={() => {
                      setBillDetailsSearchKeyword('');
                      if (billDetailsBillId) {
                        handleRoomCountClick(billDetailsBillId, 1, '');
                      }
                    }}
                    placeholder="ค้นหาเลขห้อง หรือ ชื่อลูกบ้าน..."
                  />
                </div>

                {/* Status Filter Dropdown */}
                <Select
                  value={billDetailsStatusFilter}
                  onValueChange={(value) => {
                    setBillDetailsStatusFilter(value);
                    if (billDetailsBillId) {
                      handleRoomCountClick(billDetailsBillId, 1, undefined, value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ทุกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">ทุกสถานะ</SelectItem>
                    <SelectItem value="1">ชำระแล้ว</SelectItem>
                    <SelectItem value="0">รอชำระ</SelectItem>
                    <SelectItem value="3">เกินกำหนด</SelectItem>
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button
                  onClick={() => {
                    toast.info('ฟีเจอร์นี้กำลังพัฒนา');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fas fa-download mr-2"></i>
                  ส่งออก
                </Button>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden relative">
                {/* Loading Overlay */}
                {billDetailsLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <div className="text-sm text-slate-600">กำลังโหลดข้อมูล...</div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">เลขที่บิล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">เลขห้อง</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">ชื่อลูกบ้าน</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">ยอดเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">วันครบกำหนด</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">สถานะชำระ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" style={{ minHeight: '400px' }}>
                      {billDetailsData.items && billDetailsData.items.length > 0 ? (
                        billDetailsData.items.map((item: any) => {
                          const paymentStatus = getPaymentStatusBadge(item.status);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-800 font-medium">{item.bill_no || '-'}</td>
                              <td className="px-4 py-3 text-blue-600 font-semibold">{item.house_no || '-'}</td>
                              <td className="px-4 py-3 text-slate-800">{item.member_name || '-'}</td>
                              <td className="px-4 py-3 text-right text-slate-800 font-semibold">
                                {item.total_price ? `฿${Number(item.total_price).toLocaleString()}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-center text-slate-600">
                                {billDetailsData.bill_info?.expire_date_formatted ?
                                  billDetailsData.bill_info.expire_date_formatted.split(' ')[0] : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentStatus.className}`}>
                                  {paymentStatus.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {billDetailsData.bill_info?.status === 1 ? (
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        toast.info('ฟีเจอร์นี้กำลังพัฒนา');
                                      }}
                                      className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:-translate-y-0.5"
                                      title="ดู"
                                    >
                                      <i className="fas fa-eye text-sm"></i>
                                    </button>

                                    {(item.status === 0 || item.status === 3) && (
                                      <button
                                        onClick={() => {
                                          toast.info('ฟีเจอร์นี้กำลังพัฒนา');
                                        }}
                                        className="w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-all hover:-translate-y-0.5"
                                        title="ส่งแจ้งเตือน"
                                      >
                                        <i className="fas fa-bell text-sm"></i>
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {billDetailsPagination && billDetailsBillId && (
                  <div className="border-t border-slate-200 p-4">
                    <Pagination
                      currentPage={billDetailsCurrentPage}
                      onPageChange={(page) => handleRoomCountClick(billDetailsBillId, page)}
                      pagination={billDetailsPagination}
                    />
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {billDetailsData.summary_data?.status_1 || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">ชำระแล้ว</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {billDetailsData.summary_data?.status_0 || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">รอชำระ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {billDetailsData.summary_data?.status_3 || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">เกินกำหนด</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {billDetailsData.summary_data?.paid || '฿0'}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">ยอดชำระแล้ว</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
