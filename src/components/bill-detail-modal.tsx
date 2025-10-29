import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';

interface BillDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billData: any;
  loading: boolean;
}

export function BillDetailModal({ open, onOpenChange, billData, loading }: BillDetailModalProps) {
  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return { label: 'แจ้งแล้ว', className: 'bg-green-50 text-green-700' };
    }
    return { label: 'ยังไม่แจ้ง', className: 'bg-slate-50 text-slate-700' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <i className="fas fa-eye mr-2"></i>รายละเอียดบิล
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingSpinner />
        ) : billData ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">รหัสบิล</span>
              <span className="text-sm text-slate-900 font-medium">{billData.bill_no || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">หัวข้อบิล</span>
              <span className="text-sm text-slate-900 font-medium text-right">{billData.title || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">งวด</span>
              <span className="text-sm text-slate-900 font-medium">{billData.detail || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">วันที่สร้าง</span>
              <span className="text-sm text-slate-900 font-medium">{billData.create_date_formatted || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">วันที่แจ้ง</span>
              <span className="text-sm text-slate-900 font-medium">{billData.send_date_formatted || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">วันครบกำหนด</span>
              <span className="text-sm text-slate-900 font-medium">
                {billData.expire_date_formatted ? billData.expire_date_formatted.split(' ')[0] : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">จำนวนห้อง</span>
              <span className="text-sm text-slate-900 font-medium">
                {billData.total_room ? `${billData.total_room} ห้อง` : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">ยอดรวม</span>
              <span className="text-sm text-blue-600 font-semibold">{billData.total_price || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-900">สถานะ</span>
              <span>
                <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getStatusBadge(billData.status).className}`}>
                  {getStatusBadge(billData.status).label}
                </span>
              </span>
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
