'use client';

import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';

export default function PaymentPage() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div>
      <PageHeader
        title="จัดการการชำระเงิน"
        subtitle="หน้าจัดการการชำระเงินและติดตามสถานะ"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
          <p className="text-slate-500 text-lg">
            เนื้อหาหน้าจัดการการชำระเงินจะพัฒนาในขั้นตอนถัดไป
          </p>
        </div>
      </div>
    </div>
  );
}
