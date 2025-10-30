'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { generateUploadKey, uploadFiles, deleteFile } from '@/lib/utils';
import { FileUploadSection } from '@/components/file-upload-section';

const ACCEPTED_FILES = 'image/*,.jpg,.png,.gif';

export default function SettingsPage() {
  const { setSidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('general');

  // Mock data
  const [projectInfo, setProjectInfo] = useState({
    name: 'ABC Condominium',
    shortName: 'ABC',
    address: '123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพมหานคร 10110',
    phone: '02-123-4567',
    email: 'info@abccondo.com',
    website: 'https://www.abccondo.com'
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [bankMasterList, setBankMasterList] = useState<any[]>([]);
  const [loadingBankModal, setLoadingBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bank_id: '',
    bank_account: '',
    bank_no: '',
    type: '',
  });

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState({
    dueDays: 30,
    lateFeePercent: 2,
    minAmount: 100,
    billingDay: 25
  });

  const [notificationTypes, setNotificationTypes] = useState([
    {
      id: 'new_bill',
      title: 'แจ้งเตือนบิลใหม่',
      description: 'แจ้งเตือนเมื่อมีบิลใหม่ออกมา',
      icon: 'fa-file-invoice',
      enabled: true,
      methods: { app: true, sms: true, email: false }
    },
    {
      id: 'due_soon',
      title: 'แจ้งเตือนใกล้ครบกำหนด',
      description: 'แจ้งเตือนก่อนครบกำหนดชำระ 3 วัน',
      icon: 'fa-exclamation-triangle',
      enabled: true,
      methods: { app: true, sms: true, email: true }
    },
    {
      id: 'overdue',
      title: 'แจ้งเตือนเกินกำหนด',
      description: 'แจ้งเตือนเมื่อเกินกำหนดชำระแล้ว',
      icon: 'fa-times-circle',
      enabled: true,
      methods: { app: true, sms: true, phone: false }
    },
    {
      id: 'parcel',
      title: 'แจ้งเตือนพัสดุมาถึง',
      description: 'แจ้งเตือนเมื่อมีพัสดุส่งที่โครงการ',
      icon: 'fa-package',
      enabled: true,
      methods: { app: true, sms: true }
    }
  ]);

  // Modal states
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrImage, setSelectedQrImage] = useState<string>('');
  const [deleteBankModalOpen, setDeleteBankModalOpen] = useState(false);
  const [deletingBank, setDeletingBank] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // File upload states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadKey, setCurrentUploadKey] = useState<string>('');
  const [deleteFileConfirmOpen, setDeleteFileConfirmOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    setLoadingBankAccounts(true);
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}bank/list?page=1&limit=10&keyword=&customer_id=${customerId}`;
    const result = await apiCall(url);

    if (result.success) {
      setBankAccounts(result.data || []);
    } else {
      toast.error('ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้');
    }

    setLoadingBankAccounts(false);
  };

  useEffect(() => {
    initAndFetchData();
  }, []);

  const initAndFetchData = async () => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    // Initialize config first
    await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}app_customer_config/init_config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    // Then fetch all data
    fetchBankAccounts();
    fetchBankMasterList();
    fetchPaymentMethods();
  };

  // Fetch bank master list
  const fetchBankMasterList = async () => {
    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bank/master_list`);
    if (result.success) {
      setBankMasterList(result.data || []);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';

    const url = `${process.env.NEXT_PUBLIC_API_PATH}app_customer_config/list?page=1&limit=100&customer_id=${customerId}`;
    const result = await apiCall(url);

    if (result.success) {
      setPaymentMethods(result.data || []);
    } else {
      toast.error('ไม่สามารถโหลดข้อมูลวิธีการชำระเงินได้');
    }

    setLoadingPaymentMethods(false);
  };

  // Handle bank modal open
  const handleBankModalOpen = async (bank: any = null) => {
    if (bank) {
      // Edit mode - fetch bank detail
      setLoadingBankModal(true);
      setBankModalOpen(true);
      setEditingBank(bank);

      const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bank/${bank.id}`);

      if (result.success) {
        const data = result.data;
        setBankFormData({
          bank_id: String(data.bank_id || ''),
          bank_account: data.bank_account || '',
          bank_no: data.bank_no || '',
          type: data.type || '',
        });
        setAttachments(data.attachments || []);
        setCurrentUploadKey(data.upload_key || '');
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้');
        setBankModalOpen(false);
      }

      setLoadingBankModal(false);
    } else {
      // Add mode
      setEditingBank(null);
      setBankFormData({
        bank_id: '',
        bank_account: '',
        bank_no: '',
        type: 'ออมทรัพย์',
      });
      setAttachments([]);
      setCurrentUploadKey(generateUploadKey());
      setBankModalOpen(true);
    }
  };

  const handleQrClick = (qrImageUrl: string) => {
    setSelectedQrImage(qrImageUrl);
    setQrModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Only allow 1 file
    if (attachments.length > 0) {
      toast.error('สามารถอัปโหลด QR Code ได้เพียง 1 ไฟล์เท่านั้น กรุณาลบไฟล์เดิมก่อน');
      e.target.value = '';
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('upload_key', currentUploadKey);
    formData.append('menu', 'bank');
    formData.append('status', '0');
    formData.append('files', files[0]);

    try {
      const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}upload_file`, {
        method: 'POST',
        body: formData,
      });

      if (result.success && result.data && result.data.files && result.data.files.length > 0) {
        // Get uploaded file from response
        const uploadedFile = result.data.files[0];

        const fileData = {
          id: uploadedFile.id,
          file_name: uploadedFile.file_name,
          file_path: uploadedFile.file_path || uploadedFile.file_url,
          file_ext: uploadedFile.file_ext,
          file_size: uploadedFile.file_size,
        };

        setAttachments([fileData]); // Keep only 1 file
        toast.success(result.message || 'อัปโหลดไฟล์สำเร็จ');
        e.target.value = '';
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
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

    const result = await deleteFile(deleteFileId, 'bank', uid);

    if (result.success) {
      setAttachments([]);
      setDeleteFileConfirmOpen(false);
      setDeleteFileId(null);
      toast.success(result.message || 'ลบไฟล์สำเร็จ');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาดในการลบ');
    }

    setDeletingFile(false);
  };

  // Handle bank submit
  const handleBankSubmit = async () => {
    if (!bankFormData.bank_id || !bankFormData.bank_account || !bankFormData.bank_no) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmitting(true);

    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    const payload = {
      ...(editingBank && { id: editingBank.id }),
      upload_key: currentUploadKey,
      bank_id: parseInt(bankFormData.bank_id),
      bank_account: bankFormData.bank_account,
      bank_no: bankFormData.bank_no,
      type: bankFormData.type || '',
      customer_id: customerId,
      uid: uid,
      status: editingBank ? editingBank.status : 1,
    };

    const apiUrl = editingBank
      ? `${process.env.NEXT_PUBLIC_API_PATH}bank/update`
      : `${process.env.NEXT_PUBLIC_API_PATH}bank/insert`;

    const method = editingBank ? 'PUT' : 'POST';

    const result = await apiCall(apiUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      toast.success(result.message || (editingBank ? 'แก้ไขบัญชีธนาคารสำเร็จ' : 'เพิ่มบัญชีธนาคารสำเร็จ'));
      setBankModalOpen(false);
      fetchBankAccounts();
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }

    setSubmitting(false);
  };

  const handleDeleteBankClick = (bank: any) => {
    setDeletingBank(bank);
    setDeleteBankModalOpen(true);
  };

  const handleDeleteBankConfirm = async () => {
    if (!deletingBank) return;

    setDeleting(true);
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bank/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: deletingBank.id,
        uid: uid,
      }),
    });

    if (result.success) {
      toast.success('ลบบัญชีธนาคารเรียบร้อยแล้ว');
      setDeleteBankModalOpen(false);
      setDeletingBank(null);
      fetchBankAccounts(); // Refresh list
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการลบ');
    }

    setDeleting(false);
  };

  const toggleBankAccount = async (bank: any) => {
    const user = getCurrentUser();
    const customerId = user?.customer_id || '';
    const uid = user?.uid || -1;

    // Toggle status
    const newStatus = bank.status === 1 ? 0 : 1;

    const payload = {
      id: bank.id,
      bank_id: bank.bank_id,
      bank_account: bank.bank_account,
      bank_no: bank.bank_no,
      type: bank.type,
      customer_id: customerId,
      uid: uid,
      status: newStatus,
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}bank/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      toast.success(result.message || 'อัปเดตสถานะบัญชีธนาคารแล้ว');
      // Update state locally
      setBankAccounts(prev => prev.map(b =>
        b.id === bank.id ? { ...b, status: newStatus } : b
      ));
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const togglePaymentMethod = async (method: any) => {
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    // Toggle config_value (true/false as string) based on config_value_parsed
    const newConfigValue = method.config_value_parsed ? 'false' : 'true';

    const payload = {
      id: method.id,
      uid: uid,
      config_value: newConfigValue,
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}app_customer_config/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      toast.success(result.message || 'อัปเดตสถานะการชำระเงินแล้ว');
      // Update state locally
      setPaymentMethods(prev => prev.map(m =>
        m.id === method.id ? { ...m, config_value: newConfigValue, config_value_parsed: !method.config_value_parsed } : m
      ));
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const updateStringOrNumberConfig = async (method: any) => {
    const user = getCurrentUser();
    const uid = user?.uid || -1;

    const payload = {
      id: method.id,
      uid: uid,
      config_value: String(method.config_value_parsed),
    };

    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}app_customer_config/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (result.success) {
      toast.success(result.message || 'อัปเดตค่าเรียบร้อยแล้ว');
    } else {
      toast.error(result.message || result.error || 'เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  const toggleNotificationType = (id: string) => {
    setNotificationTypes(prev => prev.map(type =>
      type.id === id ? { ...type, enabled: !type.enabled } : type
    ));
  };

  return (
    <div>
      <PageHeader
        title="ตั้งค่าระบบ"
        subtitle="จัดการการตั้งค่าต่างๆ ของระบบ"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-14">
            <TabsTrigger value="general" className="text-sm h-full">
              <i className="fas fa-building mr-2"></i>
              ข้อมูลโครงการ
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-sm h-full">
              <i className="fas fa-credit-card mr-2"></i>
              การชำระเงิน
            </TabsTrigger>
            {/* <TabsTrigger value="notifications" className="text-sm h-full">
              <i className="fas fa-bell mr-2"></i>
              การแจ้งเตือน
            </TabsTrigger> */}
          </TabsList>

          {/* Tab 1: General Settings */}
          <TabsContent value="general" className="space-y-6">
            {/* Project Information */}
            {/* <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    ข้อมูลโครงการ
                  </h3>
                  <Button onClick={() => setEditProjectModalOpen(true)}>
                    <i className="fas fa-edit mr-2"></i>
                    แก้ไข
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  ข้อมูลพื้นฐานของโครงการที่จะแสดงในระบบและเอกสารต่างๆ
                </p>

                <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-lg mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {projectInfo.shortName}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">โลโก้โครงการ</h4>
                    <p className="text-sm text-slate-600 mb-3">ขนาดที่แนะนำ: 200x200px</p>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-upload mr-2"></i>
                      เปลี่ยนโลโก้
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อโครงการ</Label>
                    <Input value={projectInfo.name} readOnly className="mt-2 h-11 bg-slate-50" />
                  </div>
                  <div>
                    <Label>ชื่อย่อ</Label>
                    <Input value={projectInfo.shortName} readOnly className="mt-2 h-11 bg-slate-50" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>ที่อยู่โครงการ</Label>
                    <textarea
                      value={projectInfo.address}
                      readOnly
                      className="mt-2 w-full p-3 border rounded-lg bg-slate-50"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>เบอร์โทรศัพท์</Label>
                    <Input value={projectInfo.phone} readOnly className="mt-2 h-11 bg-slate-50" />
                  </div>
                  <div>
                    <Label>อีเมล</Label>
                    <Input value={projectInfo.email} readOnly className="mt-2 h-11 bg-slate-50" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>เว็บไซต์</Label>
                    <Input value={projectInfo.website} readOnly className="mt-2 h-11 bg-slate-50" />
                  </div>
                </div>
              </div>
            </Card> */}

            {/* Bank Accounts */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-university text-blue-600"></i>
                    ข้อมูลบัญชีธนาคาร
                  </h3>
                  <Button onClick={() => handleBankModalOpen()} className="bg-green-600 hover:bg-green-700">
                    <i className="fas fa-plus mr-2"></i>
                    เพิ่มบัญชีธนาคาร
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  ข้อมูลบัญชีธนาคารสำหรับการรับชำระเงินค่าส่วนกลางและค่าใช้จ่ายต่างๆ
                </p>

                <div className="space-y-4">
                  {loadingBankAccounts ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
                      <p className="text-sm text-slate-500 mt-2">กำลังโหลด...</p>
                    </div>
                  ) : bankAccounts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <i className="fas fa-university text-4xl mb-3"></i>
                      <p>ยังไม่มีข้อมูลบัญชีธนาคาร</p>
                    </div>
                  ) : (
                    bankAccounts.map((bank) => (
                      <div
                        key={bank.id}
                        className={`flex items-center justify-between p-5 rounded-lg border transition-all ${
                          bank.status === 1 ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                        } hover:shadow-md`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {bank.bank_icon ? (
                            <img
                              src={bank.bank_icon}
                              alt={bank.bank_name}
                              className="w-12 h-12 rounded-lg object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500 text-white">
                              <i className="fas fa-university text-xl"></i>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{bank.bank_name}</h4>
                            <p className="text-sm text-slate-600">
                              {bank.bank_no} | {bank.bank_account}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {bank.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (bank.attachments && bank.attachments.length > 0) {
                                handleQrClick(bank.attachments[0].file_path);
                              } else {
                                toast.info('ยังไม่มี QR Code สำหรับบัญชีนี้');
                              }
                            }}
                            className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer"
                            title="ดู QR Code"
                          >
                            <i className="fas fa-qrcode text-xl text-slate-500"></i>
                            <span className="text-xs text-slate-500 mt-1">QR Code</span>
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBankModalOpen(bank)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>

                          <button
                            onClick={() => toggleBankAccount(bank)}
                            className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                              bank.status === 1 ? 'bg-green-500' : 'bg-slate-300'
                            }`}
                            title="เปิด/ปิดใช้งาน"
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                bank.status === 1 ? 'translate-x-7' : 'translate-x-0'
                              }`}
                            ></span>
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteBankClick(bank)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 2: Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <div className="p-6">
                <div className="mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-credit-card text-blue-600"></i>
                    วิธีการชำระเงิน
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  เปิด/ปิดวิธีการชำระเงินที่ลูกบ้านสามารถใช้ได้
                </p>

                {loadingPaymentMethods ? (
                  <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
                    <p className="text-sm text-slate-500 mt-2">กำลังโหลด...</p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <i className="fas fa-credit-card text-4xl mb-3"></i>
                    <p>ยังไม่มีข้อมูลวิธีการชำระเงิน</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => {
                      const isBoolean = method.data_type === 'boolean';
                      const isNumber = method.data_type === 'number';
                      const isString = method.data_type === 'string';

                      // Background color based on type
                      let bgColor = 'bg-slate-50 border-slate-200';
                      if (isBoolean && method.config_value_parsed) {
                        bgColor = 'bg-green-50 border-green-200';
                      } else if (isNumber || isString) {
                        bgColor = 'bg-green-50 border-green-200';
                      }

                      return (
                        <div
                          key={method.id}
                          className={`flex items-center justify-between p-5 rounded-lg border transition-all ${bgColor} hover:shadow-md`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: method.background_color }}
                              dangerouslySetInnerHTML={{ __html: method.icon }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{method.title}</h4>
                              <p className="text-sm text-slate-600">{method.description}</p>
                            </div>
                          </div>

                          {isBoolean && (
                            <button
                              onClick={() => togglePaymentMethod(method)}
                              className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                                method.config_value_parsed ? 'bg-green-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                  method.config_value_parsed ? 'translate-x-7' : 'translate-x-0'
                                }`}
                              ></span>
                            </button>
                          )}

                          {isNumber && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={method.config_value_parsed}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setPaymentMethods(prev => prev.map(m =>
                                    m.id === method.id ? { ...m, config_value_parsed: parseFloat(newValue) } : m
                                  ));
                                }}
                                onBlur={() => updateStringOrNumberConfig(method)}
                                className="w-24 h-11 text-center"
                              />
                              <span className="text-sm text-slate-600">%</span>
                            </div>
                          )}

                          {isString && (
                            <div className="flex-1 ml-4">
                              <Input
                                type="text"
                                value={method.config_value_parsed}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setPaymentMethods(prev => prev.map(m =>
                                    m.id === method.id ? { ...m, config_value_parsed: newValue } : m
                                  ));
                                }}
                                onBlur={() => updateStringOrNumberConfig(method)}
                                className="h-11"
                                placeholder="กรอกข้อความ..."
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Configuration */}
            {/* <Card>
              <div className="p-6">
                <div className="mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-cogs text-blue-600"></i>
                    การตั้งค่าการชำระเงิน
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>ระยะเวลาครบกำหนดชำระ (วัน)</Label>
                    <Input
                      type="number"
                      value={paymentSettings.dueDays}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, dueDays: parseInt(e.target.value) })}
                      className="mt-2 h-11"
                    />
                    <p className="text-xs text-slate-500 mt-1">จำนวนวันหลังจากออกบิลแล้วถึงจะครบกำหนด</p>
                  </div>
                  <div>
                    <Label>ค่าปรับชำระล่าช้า (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={paymentSettings.lateFeePercent}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, lateFeePercent: parseFloat(e.target.value) })}
                      className="mt-2 h-11"
                    />
                    <p className="text-xs text-slate-500 mt-1">เปอร์เซ็นต์ค่าปรับต่อเดือนสำหรับการชำระล่าช้า</p>
                  </div>
                  <div>
                    <Label>จำนวนเงินขั้นต่ำในการชำระ</Label>
                    <Input
                      type="number"
                      value={paymentSettings.minAmount}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, minAmount: parseInt(e.target.value) })}
                      className="mt-2 h-11"
                    />
                    <p className="text-xs text-slate-500 mt-1">จำนวนเงินขั้นต่ำที่สามารถชำระได้</p>
                  </div>
                  <div>
                    <Label>เวลาตัดบิลรายเดือน</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={paymentSettings.billingDay}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, billingDay: parseInt(e.target.value) })}
                      className="mt-2 h-11"
                    />
                    <p className="text-xs text-slate-500 mt-1">วันที่ของทุกเดือนที่จะออกบิลรายเดือน</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')}>
                    <i className="fas fa-save mr-2"></i>
                    บันทึกการตั้งค่า
                  </Button>
                  <Button variant="outline">
                    <i className="fas fa-undo mr-2"></i>
                    คืนค่าเริ่มต้น
                  </Button>
                </div>
              </div>
            </Card> */}
          </TabsContent>

          {/* Tab 3: Notification Settings */}
          {/* <TabsContent value="notifications" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-bell text-blue-600"></i>
                    การแจ้งเตือนอัตโนมัติ
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  ตั้งค่าการแจ้งเตือนที่ระบบจะส่งอัตโนมัติไปยังลูกบ้าน
                </p>

                <div className="space-y-4">
                  {notificationTypes.map((type) => (
                    <div key={type.id} className="p-5 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-semibold flex items-center gap-2">
                          <i className={`fas ${type.icon} text-blue-600`}></i>
                          {type.title}
                        </div>
                        <button
                          onClick={() => toggleNotificationType(type.id)}
                          className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                            type.enabled ? 'bg-green-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                              type.enabled ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{type.description}</p>
                      <div className="flex gap-4 flex-wrap">
                        {Object.entries(type.methods).map(([method, enabled]) => (
                          <label key={method} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              className="w-4 h-4 accent-blue-600"
                              onChange={() => {
                                setNotificationTypes(prev => prev.map(t =>
                                  t.id === type.id
                                    ? { ...t, methods: { ...t.methods, [method]: !enabled } }
                                    : t
                                ));
                              }}
                            />
                            {method === 'app' && 'แจ้งเตือนในแอพ'}
                            {method === 'sms' && 'SMS'}
                            {method === 'email' && 'อีเมล'}
                            {method === 'phone' && 'โทรศัพท์'}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-file-alt text-blue-600"></i>
                    แม่แบบข้อความ
                  </h3>
                  <Button>
                    <i className="fas fa-edit mr-2"></i>
                    แก้ไขแม่แบบ
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  ปรับแต่งเนื้อหาข้อความแจ้งเตือนที่จะส่งให้ลูกบ้าน
                </p>

                <div>
                  <Label>แม่แบบแจ้งเตือนบิลใหม่</Label>
                  <textarea
                    readOnly
                    value="เรียนคุณลูกบ้าน มีบิลใหม่ {BILL_ID} งวด {PERIOD} จำนวน {AMOUNT} บาท กรุณาชำระภายในวันที่ {DUE_DATE} ขอบคุณครับ/ค่ะ"
                    className="mt-2 w-full p-3 border rounded-lg bg-white"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>

      {/* Edit Project Modal */}
      <Dialog open={editProjectModalOpen} onOpenChange={setEditProjectModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลโครงการ</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>ชื่อโครงการ</Label>
              <Input
                value={projectInfo.name}
                onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label>ชื่อย่อ</Label>
              <Input
                value={projectInfo.shortName}
                onChange={(e) => setProjectInfo({ ...projectInfo, shortName: e.target.value })}
                className="mt-2 h-11"
              />
            </div>
            <div className="md:col-span-2">
              <Label>ที่อยู่โครงการ</Label>
              <textarea
                value={projectInfo.address}
                onChange={(e) => setProjectInfo({ ...projectInfo, address: e.target.value })}
                className="mt-2 w-full p-3 border rounded-lg bg-white"
                rows={2}
              />
            </div>
            <div>
              <Label>เบอร์โทรศัพท์</Label>
              <Input
                value={projectInfo.phone}
                onChange={(e) => setProjectInfo({ ...projectInfo, phone: e.target.value })}
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input
                value={projectInfo.email}
                onChange={(e) => setProjectInfo({ ...projectInfo, email: e.target.value })}
                className="mt-2 h-11"
              />
            </div>
            <div className="md:col-span-2">
              <Label>เว็บไซต์</Label>
              <Input
                value={projectInfo.website}
                onChange={(e) => setProjectInfo({ ...projectInfo, website: e.target.value })}
                className="mt-2 h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.success('บันทึกข้อมูลโครงการเรียบร้อยแล้ว');
                setEditProjectModalOpen(false);
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Account Modal */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBank ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}</DialogTitle>
          </DialogHeader>
          {loadingBankModal ? (
            <div className="py-8 text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
              <p className="text-sm text-slate-500 mt-2">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ชื่อธนาคาร *</Label>
                  <Select
                    value={bankFormData.bank_id}
                    onValueChange={(value) => setBankFormData({ ...bankFormData, bank_id: value })}
                  >
                    <SelectTrigger className="w-full mt-2 !h-11">
                      <SelectValue placeholder="เลือกธนาคาร" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankMasterList.map((bank) => (
                        <SelectItem key={bank.id} value={String(bank.id)}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>เลขที่บัญชี *</Label>
                  <Input
                    value={bankFormData.bank_no}
                    onChange={(e) => setBankFormData({ ...bankFormData, bank_no: e.target.value })}
                    placeholder="เช่น: 123-4-56789-0"
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label>ชื่อบัญชี *</Label>
                  <Input
                    value={bankFormData.bank_account}
                    onChange={(e) => setBankFormData({ ...bankFormData, bank_account: e.target.value })}
                    placeholder="เช่น: นิติบุคคลอาคารชุด ABC"
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label>ประเภทบัญชี</Label>
                  <Select
                    value={bankFormData.type}
                    onValueChange={(value) => setBankFormData({ ...bankFormData, type: value })}
                  >
                    <SelectTrigger className="w-full mt-2 !h-11">
                      <SelectValue placeholder="เลือกประเภทบัญชี" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ออมทรัพย์">ออมทรัพย์</SelectItem>
                      <SelectItem value="กระแสรายวัน">กระแสรายวัน</SelectItem>
                      <SelectItem value="ประจำ">ประจำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload Section */}
              <FileUploadSection
                title="QR Code สำหรับการชำระเงิน"
                attachments={attachments}
                uploading={uploading}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDeleteClick}
                accept={ACCEPTED_FILES}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBankModalOpen(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleBankSubmit}
              disabled={submitting || loadingBankModal}
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code สำหรับการชำระเงิน</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            {selectedQrImage ? (
              <img
                src={selectedQrImage}
                alt="QR Code"
                className="max-w-full h-auto rounded-lg border"
              />
            ) : (
              <div className="text-center text-slate-500">
                <i className="fas fa-qrcode text-6xl mb-3"></i>
                <p>ไม่มี QR Code</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrModalOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Confirmation Modal */}
      <ConfirmDialog
        open={deleteBankModalOpen}
        onOpenChange={setDeleteBankModalOpen}
        onConfirm={handleDeleteBankConfirm}
        title="ยืนยันการลบบัญชีธนาคาร"
        description={`คุณแน่ใจหรือไม่ที่จะลบบัญชีธนาคาร ${deletingBank?.bank_name} (${deletingBank?.bank_no})? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        loading={deleting}
        confirmText="ยืนยันการลบ"
        variant="destructive"
      />

      {/* Delete File Confirmation Modal */}
      <ConfirmDialog
        open={deleteFileConfirmOpen}
        onOpenChange={setDeleteFileConfirmOpen}
        onConfirm={handleFileDeleteConfirm}
        title="ยืนยันการลบไฟล์"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        loading={deletingFile}
        confirmText="ยืนยันการลบ"
        variant="destructive"
      />
    </div>
  );
}
