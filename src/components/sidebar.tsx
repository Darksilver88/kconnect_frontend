'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  List,
  X
} from 'lucide-react';
import { UserMenu } from '@/components/user-menu';

const menuItems = [
  {
    title: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'จัดการบิล',
    href: '/billing',
    icon: FileText
  },
  {
    title: 'จัดการทะเบียน',
    href: '/resident',
    icon: Users
  },
  {
    title: 'ทดสอบหน้าลิส',
    href: '/test',
    icon: List
  },
  {
    title: 'ตั้งค่า',
    href: '/settings',
    icon: Settings
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay สำหรับมือถือ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold">🏠 RPMS</h2>
            <p className="text-sm text-slate-400">ระบบจัดการโครงการ</p>
          </div>
          {/* ปุ่มปิดสำหรับมือถือ */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu - scrollable */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      'hover:bg-blue-600 hover:translate-x-1',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* UserMenu - fixed ด้านล่าง (มือถือเท่านั้น) */}
        <div className="lg:hidden border-t border-slate-700 p-4 shrink-0 bg-slate-900">
          <UserMenu />
        </div>
      </div>
    </>
  );
}
