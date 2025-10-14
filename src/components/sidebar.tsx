'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/user-menu';
import { useState } from 'react';

const menuItems = [
  {
    title: 'แดชบอร์ด',
    href: '/dashboard',
    icon: 'fa-chart-line'
  },
  {
    title: 'ค่าใช้จ่าย',
    icon: 'fa-file-invoice-dollar',
    submenu: [
      {
        title: 'จัดการบิล',
        href: '/billing',
        icon: 'fa-file-alt'
      },
      {
        title: 'จัดการการชำระเงิน',
        href: '/payment',
        icon: 'fa-credit-card'
      }
    ]
  },
  {
    title: 'จัดการข้อมูลทะเบียน',
    href: '/room',
    icon: 'fa-address-book'
  },
  {
    title: 'ตั้งค่า',
    href: '/settings',
    icon: 'fa-cog'
  },
  {
    title: 'ทดสอบหน้าลิส',
    href: '/test',
    icon: 'fa-list'
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
          'fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 text-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col shadow-sm',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">🏠 RPMS</h2>
            <p className="text-sm text-slate-500">ระบบจัดการโครงการ</p>
          </div>
          {/* ปุ่มปิดสำหรับมือถือ */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <i className="fas fa-times w-5 h-5"></i>
          </button>
        </div>

        {/* Menu - scrollable */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const hasSubmenu = 'submenu' in item;
              const isActive = item.href ? pathname === item.href : false;
              const isSubmenuOpen = openSubmenu === item.title;
              const isAnySubmenuActive = hasSubmenu && item.submenu?.some(sub => pathname === sub.href);

              if (hasSubmenu) {
                return (
                  <li key={item.title}>
                    <button
                      onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.title)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium',
                        isAnySubmenuActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      )}
                    >
                      <i className={`fas ${item.icon} w-5 h-5`}></i>
                      <span className="flex-1 text-left">{item.title}</span>
                      <svg
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isSubmenuOpen ? 'rotate-180' : ''
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isSubmenuOpen && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                onClick={onClose}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm',
                                  isSubActive
                                    ? 'bg-blue-50 text-blue-600 border-l-3 border-l-blue-600 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                )}
                              >
                                <i className={`fas ${subItem.icon} w-4 h-4`}></i>
                                <span>{subItem.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href!}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium',
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-3 border-l-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <i className={`fas ${item.icon} w-5 h-5`}></i>
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* UserMenu - fixed ด้านล่าง (มือถือเท่านั้น) */}
        <div className="lg:hidden border-t border-slate-200 p-4 shrink-0 bg-white">
          <UserMenu />
        </div>
      </div>
    </>
  );
}
