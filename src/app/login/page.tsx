'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer ID dialog states
  const [showCustomerIdDialog, setShowCustomerIdDialog] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerIdError, setCustomerIdError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ตรวจสอบ username และ password ก่อน
    if (username === 'admin' && password === 'admin123') {
      // ถูกต้อง แสดง dialog ให้กรอก customer_id
      setLoading(false);
      setShowCustomerIdDialog(true);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
    }
  };

  const handleCustomerIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerIdError('');

    if (!customerId.trim()) {
      setCustomerIdError('กรุณากรอก Customer ID');
      return;
    }

    // Login พร้อม customer_id
    const user = login(username, password, customerId);

    if (user) {
      setShowCustomerIdDialog(false);
      router.push('/dashboard');
    } else {
      setCustomerIdError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              🏠 ระบบจัดการโครงการที่พักอาศัย
            </CardTitle>
            <CardDescription className="text-center">
              เข้าสู่ระบบเพื่อดำเนินการต่อ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>ข้อมูลทดสอบ: admin / admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Customer ID Dialog */}
      <Dialog open={showCustomerIdDialog} onOpenChange={setShowCustomerIdDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>กรอก Customer ID</DialogTitle>
            <DialogDescription>
              กรุณากรอก Customer ID เพื่อเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCustomerIdSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer ID</Label>
                <Input
                  id="customer_id"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="กรอก Customer ID"
                  required
                  autoFocus
                />
              </div>
              {customerIdError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {customerIdError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomerIdDialog(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                ยืนยัน
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
