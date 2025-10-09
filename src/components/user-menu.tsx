'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { logout, getCurrentUser } from '@/lib/auth';

export function UserMenu() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  // Get first 2 characters from username for avatar
  const initials = user.username.substring(0, 2).toUpperCase();

  return (
    <>
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-90 px-4 py-2.5 rounded-lg transition-all bg-blue-600 border border-blue-700 gap-3"
        onClick={() => setShowLogoutDialog(true)}
      >
        <div className="flex flex-col items-start">
          <div className="text-sm font-bold text-white">{user.username}</div>
          <div className="text-xs text-blue-100">{user.name}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-white text-blue-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
          {initials}
        </div>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ออกจากระบบ</DialogTitle>
            <DialogDescription>
              คุณต้องการออกจากระบบใช่หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
