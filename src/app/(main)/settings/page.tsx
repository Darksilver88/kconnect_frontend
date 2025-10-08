'use client';

import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่า"
        subtitle="หน้าตั้งค่าระบบ"
        icon={<Settings className="w-8 h-8 text-slate-700" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-500 text-lg">
          เนื้อหาหน้าตั้งค่าจะพัฒนาในขั้นตอนถัดไป
        </p>
      </div>
    </div>
  );
}
