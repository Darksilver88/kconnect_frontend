'use client';

import { useState } from 'react';
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

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: 'ธนาคารกสิกรไทย',
      accountNumber: '123-4-56789-0',
      accountName: 'นิติบุคคลอาคารชุด ABC',
      accountType: 'บัญชีออมทรัพย์',
      active: true,
      color: '#22C55E'
    },
    {
      id: 2,
      bankName: 'ธนาคารกรุงเทพ',
      accountNumber: '987-6-54321-0',
      accountName: 'นิติบุคคลอาคารชุด ABC',
      accountType: 'บัญชีกระแสรายวัน',
      active: false,
      color: '#1e4d8b'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'bank_transfer',
      name: 'โอนเงินผ่านธนาคาร',
      description: 'ลูกบ้านโอนเงินและส่งสลิปมาตรวจสอบ',
      icon: 'fa-university',
      color: 'from-blue-600 to-blue-800',
      enabled: true
    }
    // {
    //   id: 'qr_promptpay',
    //   name: 'QR Code PromptPay',
    //   description: 'ชำระผ่าน QR Code แบบทันที',
    //   icon: 'fa-qrcode',
    //   color: 'from-purple-600 to-purple-800',
    //   enabled: true
    // },
    // {
    //   id: 'credit_card',
    //   name: 'บัตรเครดิต/เดบิต',
    //   description: 'ชำระผ่านบัตรเครดิตหรือบัตรเดบิต (ค่าธรรมเนียม 2.5%)',
    //   icon: 'fa-credit-card',
    //   color: 'from-red-600 to-red-800',
    //   enabled: false
    // }
  ]);

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

  const toggleBankAccount = (id: number) => {
    setBankAccounts(prev => prev.map(bank =>
      bank.id === id ? { ...bank, active: !bank.active } : bank
    ));
    toast.success('อัปเดตสถานะบัญชีธนาคารแล้ว');
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method =>
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
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
                  <Button onClick={() => { setEditingBank(null); setBankModalOpen(true); }} className="bg-green-600 hover:bg-green-700">
                    <i className="fas fa-plus mr-2"></i>
                    เพิ่มบัญชีธนาคาร
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  ข้อมูลบัญชีธนาคารสำหรับการรับชำระเงินค่าส่วนกลางและค่าใช้จ่ายต่างๆ
                </p>

                <div className="space-y-4">
                  {bankAccounts.map((bank) => (
                    <div
                      key={bank.id}
                      className={`flex items-center justify-between p-5 rounded-lg border transition-all ${
                        bank.active ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                      } hover:shadow-md`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ background: bank.color }}
                        >
                          <i className="fas fa-university text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{bank.bankName}</h4>
                          <p className="text-sm text-slate-600">
                            {bank.accountNumber} | {bank.accountName}
                          </p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {bank.accountType}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer"
                          title="ดู QR Code"
                        >
                          <i className="fas fa-qrcode text-xl text-slate-500"></i>
                          <span className="text-xs text-slate-500 mt-1">QR Code</span>
                        </button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingBank(bank); setBankModalOpen(true); }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>

                        <button
                          onClick={() => toggleBankAccount(bank.id)}
                          className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                            bank.active ? 'bg-green-500' : 'bg-slate-300'
                          }`}
                          title="เปิด/ปิดใช้งาน"
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                              bank.active ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          ></span>
                        </button>

                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
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

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-5 rounded-lg border transition-all ${
                        method.enabled ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                      } hover:shadow-md`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-white`}>
                          <i className={`fas ${method.icon} text-xl`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold">{method.name}</h4>
                          <p className="text-sm text-slate-600">{method.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => togglePaymentMethod(method.id)}
                        className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                          method.enabled ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                            method.enabled ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        ></span>
                      </button>
                    </div>
                  ))}
                </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBank ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>ชื่อธนาคาร *</Label>
              <Select>
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue placeholder="เลือกธนาคาร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="กสิกรไทย">ธนาคารกสิกรไทย</SelectItem>
                  <SelectItem value="กรุงเทพ">ธนาคารกรุงเทพ</SelectItem>
                  <SelectItem value="กรุงไทย">ธนาคารกรุงไทย</SelectItem>
                  <SelectItem value="ทหารไทยธนชาต">ธนาคารทหารไทยธนชาต</SelectItem>
                  <SelectItem value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์</SelectItem>
                  <SelectItem value="กรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>เลขที่บัญชี *</Label>
              <Input placeholder="เช่น: 123-4-56789-0" className="mt-2 h-11" />
            </div>
            <div>
              <Label>ชื่อบัญชี *</Label>
              <Input placeholder="เช่น: นิติบุคคลอาคารชุด ABC" className="mt-2 h-11" />
            </div>
            <div>
              <Label>ประเภทบัญชี</Label>
              <Select defaultValue="savings">
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">ออมทรัพย์</SelectItem>
                  <SelectItem value="current">กระแสรายวัน</SelectItem>
                  <SelectItem value="fixed">ประจำ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>QR Code สำหรับการชำระเงิน</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                <p className="text-sm text-slate-600 mb-3">อัปโหลด QR Code สำหรับบัญชีนี้</p>
                <Button variant="outline" size="sm">
                  <i className="fas fa-upload mr-2"></i>
                  เลือกไฟล์ QR Code
                </Button>
                <p className="text-xs text-slate-500 mt-3">รองรับไฟล์ .jpg, .png, .gif</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.success(editingBank ? 'แก้ไขบัญชีธนาคารเรียบร้อยแล้ว' : 'เพิ่มบัญชีธนาคารเรียบร้อยแล้ว');
                setBankModalOpen(false);
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
