'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiCall } from '@/lib/api';
import { CustomerSelector, CustomerSelectorRef } from '@/components/customer-selector';

export default function LoginPage() {
  const router = useRouter();
  const customerSelectorRef = useRef<CustomerSelectorRef>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login data for CustomerSelector
  const [loginData, setLoginData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login API
      const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (result.success && result.data?.token) {
        // Fetch customer list
        const customerResult = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}auth/customer_list`, {
          headers: {
            'Authorization': `Bearer ${result.data.token}`
          }
        });

        if (customerResult.success && customerResult.data?.customers) {
          // Set login data for CustomerSelector
          setLoginData({
            username,
            token: result.data.token,
            rememberMe,
            loginResponseData: result.data
          });

          // Open customer selector dialog
          customerSelectorRef.current?.openDialog(customerResult.data.customers);
        } else {
          setError(customerResult.message || 'ไม่สามารถโหลดรายการโครงการได้');
        }
      } else {
        setError(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }

    setLoading(false);
  };

  const handleLoginComplete = () => {
    router.push('/dashboard');
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
                   style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)' }}>
                <i className="fas fa-building text-6xl text-white drop-shadow-lg"></i>
              </div>

              {/* Brand Text */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">K-Connect</h1>
              <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
                ระบบจัดการโครงการที่พักอาศัย
              </p>

              {/* Features */}
              <div className="space-y-4 text-left max-w-[280px] mx-auto">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                       style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <i className="fas fa-shield-alt text-lg"></i>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">ปลอดภัยและเชื่อถือได้</div>
                    <div className="text-sm text-white/80">ระบบรักษาความปลอดภัยระดับสูง</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                       style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <i className="fas fa-bolt text-lg"></i>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">รวดเร็วและทันสมัย</div>
                    <div className="text-sm text-white/80">ประมวลผลข้อมูลอย่างรวดเร็ว</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                       style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <i className="fas fa-users text-lg"></i>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">ใช้งานง่าย</div>
                    <div className="text-sm text-white/80">ออกแบบให้ใช้งานสะดวก</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <div className="w-[80px] h-[80px] mx-auto mb-4 rounded-[20px] flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #2B6EF3 0%, #1F4EC2 100%)' }}>
                <i className="fas fa-building text-4xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">K-Connect</h2>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">ยินดีต้อนรับ</h2>
              <p className="text-slate-500">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3 animate-slide-down">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">
                  ชื่อผู้ใช้
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <i className="fas fa-user"></i>
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 pl-12 pr-4 text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="กรอกชื่อผู้ใช้"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <i className="fas fa-lock"></i>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 pr-12 text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="กรอกรหัสผ่าน"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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
                <a href="https://portal.koder3.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors">
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

      {/* Customer Selection Dialog */}
      <CustomerSelector
        ref={customerSelectorRef}
        isLoginMode={true}
        loginData={loginData}
        onLoginComplete={handleLoginComplete}
      />

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
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 25s ease-in-out 5s infinite;
        }

        .animate-float-slow {
          animation: float 30s ease-in-out 2s infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
