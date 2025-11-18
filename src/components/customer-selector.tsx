'use client';

import { useState, useEffect } from 'react';
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
}

export function CustomerSelector({ onCustomerChange }: CustomerSelectorProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleCustomerSelect = (customer: any) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Update user data with new customer info
    const updatedUserData = {
      ...currentUser,
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      site_name: customer.site_name,
      site_code: customer.site_code,
    };

    // Save to localStorage
    localStorage.setItem('kconnect_user', JSON.stringify(updatedUserData));

    // Update cookie
    const cookieData = document.cookie
      .split('; ')
      .find(row => row.startsWith('kconnect_user='));

    if (cookieData) {
      const cookieValue = cookieData.split('=')[1];
      try {
        const oldData = JSON.parse(decodeURIComponent(cookieValue));
        // Check if it was a persistent cookie (has expires)
        const isPersistent = document.cookie.includes('expires');

        if (isPersistent) {
          // Keep the same expiry (30 days)
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `kconnect_user=${JSON.stringify(updatedUserData)}; path=/; expires=${expires}`;
        } else {
          // Session cookie
          document.cookie = `kconnect_user=${JSON.stringify(updatedUserData)}; path=/;`;
        }
      } catch {
        // Fallback to session cookie
        document.cookie = `kconnect_user=${JSON.stringify(updatedUserData)}; path=/;`;
      }
    }

    setShowDialog(false);

    // Callback for parent component
    if (onCustomerChange) {
      onCustomerChange();
    }

    // Refresh the page to reload all data
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <span>{getCurrentUser()?.customer_name || '-'}</span>
        <i className="fas fa-chevron-down text-xs"></i>
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>เลือกโครงการ</DialogTitle>
            <DialogDescription>
              กรุณาเลือกโครงการที่ต้องการจัดการ
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">กำลังโหลดรายการโครงการ...</p>
            </div>
          ) : (
            <div className="py-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {customers.map((customer, index) => {
                  const currentUser = getCurrentUser();
                  const isCurrentCustomer = currentUser?.customer_id === customer.customer_id &&
                                           currentUser?.site_code === customer.site_code;

                  return (
                    <button
                      key={index}
                      onClick={() => handleCustomerSelect(customer)}
                      disabled={isCurrentCustomer}
                      className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer group ${
                        isCurrentCustomer
                          ? 'border-blue-500 bg-blue-50 cursor-default'
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
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
