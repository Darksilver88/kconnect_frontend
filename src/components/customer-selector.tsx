'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiCall } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

interface CustomerSelectorProps {
  onCustomerChange?: () => void;
  // For login page
  isLoginMode?: boolean;
  loginData?: {
    username: string;
    token: string;
    rememberMe: boolean;
    loginResponseData: any;
  };
  onLoginComplete?: () => void;
}

export interface CustomerSelectorRef {
  openDialog: (customersData?: any[]) => void;
}

export const CustomerSelector = forwardRef<CustomerSelectorRef, CustomerSelectorProps>(
  ({ onCustomerChange, isLoginMode = false, loginData, onLoginComplete }, ref) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}auth/customer_list`);

    if (result.success && result.data?.customers) {
      setCustomers(result.data.customers);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setShowDialog(true);
    fetchCustomers();
  };

  // Expose method to parent component
  useImperativeHandle(ref, () => ({
    openDialog: (customersData?: any[]) => {
      if (customersData) {
        setCustomers(customersData);
      } else {
        fetchCustomers();
      }
      setShowDialog(true);
    }
  }));

  const handleCustomerSelect = async (customer: any) => {
    setSelecting(true);

    try {
      let userData;

      if (isLoginMode && loginData) {
        // Login mode: Create new user data
        const userid = loginData.loginResponseData?.user?.userid ? parseInt(loginData.loginResponseData.user.userid) : 99;

        userData = {
          username: loginData.username,
          token: loginData.token,
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          site_name: customer.site_name,
          site_code: customer.site_code,
          uid: userid
        };

        // Save to localStorage
        localStorage.setItem('kconnect_user', JSON.stringify(userData));

        // Save to cookie based on rememberMe
        if (loginData.rememberMe) {
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `kconnect_user=${JSON.stringify(userData)}; path=/; expires=${expires}`;
        } else {
          document.cookie = `kconnect_user=${JSON.stringify(userData)}; path=/;`;
        }
      } else {
        // Normal mode: Update existing user data
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setSelecting(false);
          return;
        }

        userData = {
          ...currentUser,
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          site_name: customer.site_name,
          site_code: customer.site_code,
        };

        // Save to localStorage
        localStorage.setItem('kconnect_user', JSON.stringify(userData));

        // Update cookie
        const cookieData = document.cookie
          .split('; ')
          .find(row => row.startsWith('kconnect_user='));

        if (cookieData) {
          const cookieValue = cookieData.split('=')[1];
          try {
            const oldData = JSON.parse(decodeURIComponent(cookieValue));
            const isPersistent = document.cookie.includes('expires');

            if (isPersistent) {
              const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
              document.cookie = `kconnect_user=${JSON.stringify(userData)}; path=/; expires=${expires}`;
            } else {
              document.cookie = `kconnect_user=${JSON.stringify(userData)}; path=/;`;
            }
          } catch {
            document.cookie = `kconnect_user=${JSON.stringify(userData)}; path=/;`;
          }
        }
      }

      // Initialize config for new customer
      const result = await apiCall(`${process.env.NEXT_PUBLIC_API_PATH}app_customer_config/init_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customer.customer_id }),
      });

      if (!result.success) {
        console.error('Failed to initialize config:', result.error || result.message);
      }

      setShowDialog(false);

      if (isLoginMode && onLoginComplete) {
        // Login mode: Call completion callback
        onLoginComplete();
      } else {
        // Normal mode: Callback and refresh
        if (onCustomerChange) {
          onCustomerChange();
        }
        window.location.reload();
      }
    } catch (error) {
      console.error('Error selecting customer:', error);
      setSelecting(false);
    }
  };

  return (
    <>
      {!isLoginMode && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <span>{getCurrentUser()?.customer_name || '-'}</span>
          <i className="fas fa-chevron-down text-xs"></i>
        </button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>เลือกโครงการ</DialogTitle>
            <DialogDescription>
              {isLoginMode ? 'กรุณาเลือกโครงการที่ต้องการเข้าสู่ระบบ' : 'กรุณาเลือกโครงการที่ต้องการจัดการ'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="ค้นหาโครงการ..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {loading || selecting ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">{loading ? 'กำลังโหลดรายการโครงการ...' : 'กำลังเข้าสู่ระบบ...'}</p>
            </div>
          ) : (
            <div className="py-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {customers
                  .filter((customer) => {
                    if (!searchKeyword) return true;
                    const keyword = searchKeyword.toLowerCase();
                    return (
                      customer.site_name?.toLowerCase().includes(keyword) ||
                      customer.customer_name?.toLowerCase().includes(keyword) ||
                      customer.customer_id?.toString().toLowerCase().includes(keyword)
                    );
                  })
                  .map((customer, index) => {
                  const currentUser = getCurrentUser();
                  const isCurrentCustomer = currentUser?.customer_id === customer.customer_id &&
                                           currentUser?.site_code === customer.site_code;

                  return (
                    <button
                      key={index}
                      onClick={() => handleCustomerSelect(customer)}
                      disabled={isCurrentCustomer || selecting}
                      className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer group ${
                        isCurrentCustomer || selecting
                          ? 'border-blue-500 bg-blue-50 cursor-default opacity-50'
                          : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isCurrentCustomer
                            ? 'bg-blue-200'
                            : 'bg-blue-100 group-hover:bg-blue-200'
                        }`}>
                          <i className="fas fa-building text-blue-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
                            {customer.site_name}
                            {isCurrentCustomer && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">ปัจจุบัน</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {customer.customer_name}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            รหัสโครงการ: {customer.customer_id}
                          </div>
                        </div>
                        {!isCurrentCustomer && (
                          <i className="fas fa-chevron-right text-slate-400 group-hover:text-blue-600 transition-colors"></i>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              {isLoginMode ? 'ยกเลิก' : 'ปิด'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

CustomerSelector.displayName = 'CustomerSelector';
