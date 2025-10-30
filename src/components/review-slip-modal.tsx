'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';

interface ReviewSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  loading: boolean;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  submitting?: boolean;
  getStatusBadge?: (status: number) => any;
}

export function ReviewSlipModal({
  open,
  onOpenChange,
  data,
  loading,
  showActions = false,
  onApprove,
  onReject,
  submitting = false,
  getStatusBadge
}: ReviewSlipModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <i className="fas fa-receipt"></i>
            {data?.status === 0 && showActions ? 'ตรวจสอบสลิปการโอน' : 'ดูรายละเอียด'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingSpinner />
        ) : data ? (
          <div className="space-y-6 py-4">
            {/* Slip Image - Only show if exists */}
            {data.slip_image && data.slip_image !== 'https://placehold.co/400x600/E0F2F7/2B6EF3?text=Payment+Slip' && (
              <div className="flex justify-center">
                <div className="w-full max-w-[400px] h-[600px] bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <img
                    src={data.slip_image}
                    alt="Payment Slip"
                    className="w-full h-full object-contain"
                    onClick={() => window.open(data.slip_image, '_blank')}
                  />
                </div>
              </div>
            )}

            {/* Slip Details - 3 columns on desktop, responsive on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">ผู้โอน</div>
                <div className="text-sm font-semibold text-slate-900">
                  {data.member_name} ({data.member_detail})
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">จำนวนเงิน</div>
                <div className="text-sm font-semibold text-slate-900">{data.payment_amount}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">วันที่โอน (ตามสลิป)</div>
                <div className="text-sm font-semibold text-slate-900">{data.transfer_date}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">ธนาคาร</div>
                <div className="text-sm font-semibold text-slate-900">{data.bank_name}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">บิลที่อ้างอิง</div>
                <div className="text-sm font-semibold text-slate-900">{data.bill_no}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">หมายเหตุจากลูกบ้าน</div>
                <div className="text-sm font-semibold text-slate-900">{data.member_remark}</div>
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
                  <span className="text-sm font-semibold text-slate-900">{data.bill_title}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">ประเภทบิล:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.bill_type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">งวด:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.bill_period}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">จำนวนที่ต้องชำระ:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.bill_amount}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">วันครบกำหนด:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.due_date}</span>
                </div>
                {getStatusBadge && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">สถานะ:</span>
                    <span className="text-sm">
                      <Badge className={getStatusBadge(data.status).className} style={{ color: getStatusBadge(data.status).textColor }}>
                        <i className={`fas ${getStatusBadge(data.status).icon} mr-1`}></i>
                        {getStatusBadge(data.status).label}
                      </Badge>
                    </span>
                  </div>
                )}
              </div>

              {/* Reject Reason - Full width */}
              {data.status === 3 && data.reject_reason && data.reject_reason !== '-' && (
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-xs text-slate-500">เหตุผลการปฏิเสธ:</span>
                  <span className="text-sm font-semibold text-slate-900">{data.reject_reason}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {showActions ? 'ยกเลิก' : 'ปิด'}
          </Button>
          {showActions && data && !loading && onApprove && onReject && (
            <>
              <Button
                className="bg-red-600 hover:bg-red-700 gap-2"
                onClick={onReject}
                disabled={submitting}
              >
                <i className="fas fa-times"></i>
                ปฏิเสธ
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 gap-2"
                onClick={onApprove}
                disabled={submitting}
              >
                <i className="fas fa-check"></i>
                อนุมัติ
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
