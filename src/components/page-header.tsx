'use client';

import { UserMenu } from '@/components/user-menu';
import { CustomerSelector } from '@/components/customer-selector';
import { Menu } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onMenuClick?: () => void;
}

export function PageHeader({ title, subtitle, icon, onMenuClick }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              {icon}
              <h1 className="text-xl lg:text-2xl font-semibold text-slate-900">{title}</h1>
            </div>
            {subtitle && <p className="text-slate-600 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
        {/* แสดง UserMenu เฉพาะหน้าจอใหญ่ (บนมือถือแสดงใน Sidebar แทน) */}
        <div className="hidden lg:flex items-stretch gap-3">
          <CustomerSelector />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
