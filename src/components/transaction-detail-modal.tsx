'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billRoomId: number | null;
  onSlipClick?: (paymentId: number) => void;
}

export function TransactionDetailModal({
  open,
  onOpenChange,
  billRoomId,
  onSlipClick
}: TransactionDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (open && billRoomId) {
      fetchTransactionDetail();
    } else {
      setData(null);
    }
  }, [open, billRoomId]);

  const fetchTransactionDetail = async () => {
    if (!billRoomId) return;

    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_PATH}bill_room/${billRoomId}`;
    const result = await apiCall(url);

    if (result.success && result.data) {
      // Get the first transaction from transactions array (latest, already sorted by API)
      const billRoomData = result.data;
      const latestTransaction = billRoomData.transactions && billRoomData.transactions.length > 0
        ? billRoomData.transactions[0]
        : null;

      if (latestTransaction) {
        // Get payment data from payment_list if exists
        const paymentData = billRoomData.payment_list && billRoomData.payment_list.length > 0
          ? billRoomData.payment_list[0]
          : null;

        // Format payment_date_app_detail_formatted by adding :00
        const paymentDate = paymentData?.payment_date_app_detail_formatted
          ? `${paymentData.payment_date_app_detail_formatted}:00`
          : latestTransaction.pay_date_formatted;

        // Combine bill_room data with latest transaction
        setData({
          ...latestTransaction,
          bill_no: billRoomData.bill_no,
          bill_title: billRoomData.bill_title,
          member_name: billRoomData.member_name,
          house_no: billRoomData.house_no,
          total_price: billRoomData.total_price,
          summary: billRoomData.summary,
          pay_date_formatted: paymentDate
        });
      } else {
        toast.error('ไม่พบข้อมูลการชำระเงิน');
        onOpenChange(false);
      }
    } else {
      toast.error(result.message || 'ไม่สามารถโหลดข้อมูลได้');
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <i className="fas fa-eye"></i>
            รายละเอียดการชำระเงิน
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
            <p className="text-sm text-slate-500 mt-2">กำลังโหลด...</p>
          </div>
        ) : data ? (
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
                  <span className="text-sm font-semibold text-slate-900">{data.bill_no}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">หัวข้อบิล:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.bill_title || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">ลูกบ้าน:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.member_name} ({data.house_no})</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">ยอดรวมบิล:</span>
                  <span className="text-sm font-semibold text-slate-900">฿{data.total_price?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">ชำระแล้ว:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ฿{data.summary?.total_paid?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">ยอดค้าง:</span>
                  <span className="text-sm font-bold text-red-700">
                    ฿{data.summary?.remaining_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-credit-card"></i>
                รายละเอียดการชำระเงิน
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">วิธีการชำระเงิน</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      {data.transaction_type_title}
                    </div>
                    {data.bill_transaction_type_id === 6 && data.payment_id && onSlipClick && (
                      <button
                        onClick={() => onSlipClick(data.payment_id)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md rounded-md transition-all cursor-pointer"
                        title="ดูรายละเอียด"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">จำนวนเงินที่ชำระ</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-semibold">
                    ฿{parseFloat(data.transaction_amount)?.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">วันที่ชำระ</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                    {data.pay_date_formatted}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">วันที่บันทึก</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                    {data.create_date_formatted}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">หมายเหตุเพิ่มเติม</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                    {data.remark || '-'}
                  </div>
                </div>
              </div>

              {/* Payment Method Specific Fields - View Only */}
              {data.transaction_type_json && (
                <div className="mt-4">
                  {data.bill_transaction_type_id === 1 && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                        <i className="fas fa-money-bill-wave"></i>
                        การชำระด้วยเงินสด
                      </h5>
                      <p className="text-sm text-slate-600">กรุณาตรวจนับเงินสดให้ถูกต้องก่อนบันทึก</p>
                    </div>
                  )}

                  {data.bill_transaction_type_id === 2 && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <i className="fas fa-university"></i>
                        การโอนเงินธนาคาร
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">ธนาคารที่โอน</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.bank_name || '-'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">เลขที่อ้างอิง</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.transfer_ref || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.bill_transaction_type_id === 3 && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <i className="fas fa-file-invoice"></i>
                        การชำระด้วยเช็ค
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">เลขที่เช็ค</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.check_number || '-'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">ธนาคาร</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.check_bank || '-'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">วันที่เช็ค</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.check_date
                              ? new Date(data.transaction_type_json.check_date).toLocaleDateString('th-TH', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.bill_transaction_type_id === 4 && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <i className="fas fa-credit-card"></i>
                        การชำระด้วยบัตรเครดิต
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">เลขที่อ้างอิง</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.card_ref || '-'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">เลข 4 ตัวท้าย</label>
                          <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                            {data.transaction_type_json?.card_last4 || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.bill_transaction_type_id === 5 && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <i className="fas fa-ellipsis-h"></i>
                        วิธีอื่นๆ
                      </h5>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">รายละเอียด</label>
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
                          {data.transaction_type_json?.other_method || '-'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
