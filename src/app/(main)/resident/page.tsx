'use client';

import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Users } from 'lucide-react';

export default function ResidentPage() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div>
      <PageHeader
        title="จัดการทะเบียน"
        subtitle="หน้าจัดการข้อมูลผู้พักอาศัย"
        icon={<Users className="w-6 h-6 text-blue-600" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
          <p className="text-slate-500 text-lg">
            เนื้อหาหน้าจัดการทะเบียนจะพัฒนาในขั้นตอนถัดไป
          </p>
        </div>
      </div>
    </div>
  );
}
