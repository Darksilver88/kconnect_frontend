'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { isAuthenticated } from '@/lib/auth';

// Context สำหรับ sidebar state
const SidebarContext = createContext<{
  setSidebarOpen: (open: boolean) => void;
}>({
  setSidebarOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // แสดง loading หรือ blank จนกว่าจะ mount เสร็จ (แก้ hydration error)
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ setSidebarOpen }}>
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl m-3 lg:m-5 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
