'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

    // Simulate loading
    setTimeout(() => {
      // ตรวจสอบ username และ password
      if (username === 'admin' && password === 'admin123') {
        // ถูกต้อง แสดง dialog ให้กรอก customer_id
        setLoading(false);
        setShowCustomerIdDialog(true);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      }
    }, 1000);
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
      {/* Background with Animation */}
      <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #5894ff 0%, #6884ff 100%)' }}>

        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[300px] h-[300px] -top-[150px] -left-[150px] rounded-full bg-white/10 animate-float" />
          <div className="absolute w-[200px] h-[200px] -bottom-[100px] -right-[100px] rounded-full bg-white/10 animate-float-delayed" />
          <div className="absolute w-[150px] h-[150px] top-1/2 left-[10%] rounded-full bg-white/10 animate-float-slow" />
        </div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-[1100px] grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl animate-slide-up">

          {/* Left Side - Branding (Hidden on mobile) */}
          <div className="hidden md:flex flex-col justify-center items-center text-center text-white p-12 lg:p-16 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #2B6EF3 0%, #1F4EC2 100%)' }}>

            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-10"
                 style={{
                   backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
                   backgroundSize: '50px 50px'
                 }} />

            <div className="relative z-10">
              {/* Logo */}
              <div className="w-[120px] h-[120px] mx-auto mb-8 rounded-[30px] flex items-center justify-center"
                   style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                <i className="fas fa-building text-6xl text-white"></i>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                ระบบจัดการ<br />โครงการ K-Connect
              </h1>

              {/* Subtitle */}
              <p className="text-base opacity-90 mb-10 leading-relaxed">
                แพลตฟอร์มครบวงจรสำหรับการบริหารจัดการ<br />
                โครงการที่พักอาศัย คอนโดมิเนียม และหมู่บ้านจัดสรร
              </p>

              {/* Features */}
              <div className="text-left inline-block">
                {[
                  'จัดการข้อมูลผู้อยู่อาศัยแบบครบวงจร',
                  'ระบบแจ้งเตือนและการสื่อสารอัตโนมัติ',
                  'รายงานและสถิติแบบเรียลไทม์',
                  'ปลอดภัย รวดเร็ว ใช้งานง่าย'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 mb-4 text-sm opacity-95">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
                      <i className="fas fa-check text-xs"></i>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-10 lg:p-12 xl:p-16 flex flex-col justify-center">

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">ยินดีต้อนรับ</h2>
              <p className="text-slate-500">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 mb-5 bg-red-50 text-red-900 border border-red-200 rounded-xl text-sm animate-slide-down">
                <i className="fas fa-exclamation-circle text-lg"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                  อีเมลหรือชื่อผู้ใช้
                </Label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"></i>
                  <Input
                    id="username"
                    type="text"
                    placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-base focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"></i>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-base focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between -mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[18px] h-[18px] cursor-pointer accent-blue-600"
                  />
                  <span className="text-sm text-slate-600">จดจำฉันไว้</span>
                </label>
                <a href="#" className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors">
                  ลืมรหัสผ่าน?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <i className="fas fa-arrow-right ml-2"></i>
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-400">
              ©2025 KODER 3 COMPANY LIMITED. All rights reserved.
            </div>
          </div>
        </div>
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

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-30px) translateX(30px) scale(1.1); }
          66% { transform: translateY(30px) translateX(-30px) scale(0.9); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 20s infinite ease-in-out;
        }

        .animate-float-delayed {
          animation: float 20s infinite ease-in-out;
          animation-delay: 3s;
        }

        .animate-float-slow {
          animation: float 20s infinite ease-in-out;
          animation-delay: 6s;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease;
        }
      `}</style>
    </>
  );
}
