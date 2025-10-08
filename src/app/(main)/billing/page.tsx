'use client';

import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { FileText } from 'lucide-react';

export default function BillingPage() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการบิล"
        subtitle="หน้าจัดการบิลและการเรียกเก็บเงิน"
        icon={<FileText className="w-8 h-8 text-slate-700" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-500 text-lg">
          เนื้อหาหน้าจัดการบิลจะพัฒนาในขั้นตอนถัดไป
        </p>
      </div>
    </div>
  );
}
