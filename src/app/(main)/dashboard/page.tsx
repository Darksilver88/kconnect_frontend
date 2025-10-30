'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

// Card configuration for mapping API fields to UI
const cardConfig: any = {
  total_rooms: { icon: 'fa-door-open', color: 'blue', trendIcon: 'fa-minus' },
  active_members: { icon: 'fa-users', color: 'green' },
  new_members: { icon: 'fa-user-plus', color: 'teal' },
  pending_members: { icon: 'fa-user-clock', color: 'yellow', trendIcon: 'fa-clock' },
  unpaid_rooms: { icon: 'fa-home', color: 'red' },
  revenue_this_month: { icon: 'fa-money-bill-wave', color: 'blue' },
  unpaid_amount: { icon: 'fa-exclamation-triangle', color: 'red' },
  paid_count: { icon: 'fa-check-circle', color: 'green' },
  pending_payment: { icon: 'fa-search-dollar', color: 'orange', trendIcon: 'fa-clock' },
  total_bills: { icon: 'fa-file-invoice-dollar', color: 'purple' }
};

// Mock data for other sections (will be replaced later)
const mockData = {

  // Alerts
  alerts: [
    { type: 'critical', icon: 'fa-exclamation-circle', text: '12 รายการรอตรวจสอบและอนุมัติการชำระเงิน', subtext: 'ต้องดำเนินการภายใน 24 ชั่วโมง' },
    { type: 'warning', icon: 'fa-clock', text: '25 บิลรอการชำระเงิน (8 รายการเกินกำหนด)', subtext: 'บางรายการควรติดตามเร่งด่วน' },
    { type: 'success', icon: 'fa-user-check', text: '3 คำขออนุมัติบัญชีลูกบ้านใหม่', subtext: 'รอการตรวจสอบข้อมูล' },
    { type: 'info', icon: 'fa-tools', text: '5 คำขอเรียกใช้บริการที่รอดำเนินการ', subtext: 'จัดลำดับความสำคัญตามเวลาแล้ว' }
  ],

  // Bar Chart Data
  chartData: [
    { month: 'ม.ค.', billed: 75, received: 68 },
    { month: 'ก.พ.', billed: 68, received: 62 },
    { month: 'มี.ค.', billed: 82, received: 75 },
    { month: 'เม.ย.', billed: 78, received: 71 },
    { month: 'พ.ค.', billed: 85, received: 79 },
    { month: 'มิ.ย.', billed: 92, received: 85 }
  ],

  // Donut Chart Data
  billStatus: [
    { label: 'ชำระแล้ว', value: 765, percent: 88, color: '#22C55E' },
    { label: 'รอชำระและรอตรวจสอบ', value: 127, percent: 10, color: '#EAB308' },
    { label: 'เกินกำหนด', value: 8, percent: 2, color: '#EF4444' }
  ],

  // Upcoming Bills
  upcomingBills: [
    { date: 'วันพรุ่งนี้ (25/08)', count: '45 รายการ', amount: '฿67,500' },
    { date: '2 วันข้างหน้า (26/08)', count: '32 รายการ', amount: '฿48,000' },
    { date: '3 วันข้างหน้า (27/08)', count: '28 รายการ', amount: '฿42,000' },
    { date: '4-7 วันข้างหน้า', count: '89 รายการ', amount: '฿133,500' }
  ]
};

export default function DashboardPage() {
  const { setSidebarOpen } = useSidebar();
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Billing revenue chart states
  const [monthDuration, setMonthDuration] = useState(3);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Bill status states
  const [billStatusData, setBillStatusData] = useState<any>(null);
  const [billStatusLoading, setBillStatusLoading] = useState(true);

  // Payment efficiency states
  const [paymentEfficiencyData, setPaymentEfficiencyData] = useState<any>(null);
  const [paymentEfficiencyLoading, setPaymentEfficiencyLoading] = useState(true);

  // Action items states
  const [actionItemsData, setActionItemsData] = useState<any>(null);
  const [actionItemsLoading, setActionItemsLoading] = useState(true);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} น.`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard summary
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      const user = getCurrentUser();
      const customerId = user?.customer_id || '';

      const result = await apiCall(
        `${process.env.NEXT_PUBLIC_API_PATH}dashboard/summary?customer_id=${customerId}`
      );

      if (result.success) {
        setSummaryData(result.data);
      }
      setSummaryLoading(false);
    };

    fetchSummary();
  }, []);

  // Fetch billing revenue chart data
  useEffect(() => {
    const fetchBillingRevenue = async () => {
      setChartLoading(true);
      const user = getCurrentUser();
      const customerId = user?.customer_id || '';

      const result = await apiCall(
        `${process.env.NEXT_PUBLIC_API_PATH}dashboard/billing_revenue?customer_id=${customerId}&month_duration=${monthDuration}`
      );

      if (result.success && result.data.chart_data) {
        setChartData(result.data.chart_data);
      }
      setChartLoading(false);
    };

    fetchBillingRevenue();
  }, [monthDuration]);

  // Fetch bill status data
  useEffect(() => {
    const fetchBillStatus = async () => {
      setBillStatusLoading(true);
      const user = getCurrentUser();
      const customerId = user?.customer_id || '';

      const result = await apiCall(
        `${process.env.NEXT_PUBLIC_API_PATH}dashboard/bill_status?customer_id=${customerId}`
      );

      if (result.success) {
        setBillStatusData(result.data);
      }
      setBillStatusLoading(false);
    };

    fetchBillStatus();
  }, []);

  // Fetch payment efficiency data
  useEffect(() => {
    const fetchPaymentEfficiency = async () => {
      setPaymentEfficiencyLoading(true);
      const user = getCurrentUser();
      const customerId = user?.customer_id || '';

      const result = await apiCall(
        `${process.env.NEXT_PUBLIC_API_PATH}dashboard/payment_efficiency?customer_id=${customerId}`
      );

      if (result.success) {
        setPaymentEfficiencyData(result.data);
      }
      setPaymentEfficiencyLoading(false);
    };

    fetchPaymentEfficiency();
  }, []);

  // Fetch action items data
  useEffect(() => {
    const fetchActionItems = async () => {
      setActionItemsLoading(true);
      const user = getCurrentUser();
      const customerId = user?.customer_id || '';

      const result = await apiCall(
        `${process.env.NEXT_PUBLIC_API_PATH}dashboard/action_items?customer_id=${customerId}`
      );

      if (result.success) {
        setActionItemsData(result.data);
      }
      setActionItemsLoading(false);
    };

    fetchActionItems();
  }, []);

  // Transform API data to UI format
  const getStatsFromAPI = () => {
    if (!summaryData) return { residentsStats: [], financialStats: [] };

    const residentsStats = [
      {
        number: summaryData.total_rooms.value,
        label: summaryData.total_rooms.label,
        change: summaryData.total_rooms.change,
        trend: 'neutral',
        ...cardConfig.total_rooms
      },
      {
        number: summaryData.active_members.value,
        label: summaryData.active_members.label,
        change: summaryData.active_members.change,
        trend: summaryData.active_members.trend === 'up' ? 'positive' : summaryData.active_members.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.active_members
      },
      {
        number: summaryData.new_members.value,
        label: summaryData.new_members.label,
        change: summaryData.new_members.change,
        trend: summaryData.new_members.trend === 'up' ? 'positive' : summaryData.new_members.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.new_members
      },
      {
        number: summaryData.pending_members.value,
        label: summaryData.pending_members.label,
        change: summaryData.pending_members.change,
        trend: 'neutral',
        ...cardConfig.pending_members
      },
      {
        number: summaryData.unpaid_rooms.value,
        label: summaryData.unpaid_rooms.label,
        change: summaryData.unpaid_rooms.change,
        trend: summaryData.unpaid_rooms.trend === 'up' ? 'positive' : summaryData.unpaid_rooms.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.unpaid_rooms
      }
    ];

    const financialStats = [
      {
        number: summaryData.revenue_this_month.value,
        label: summaryData.revenue_this_month.label,
        change: summaryData.revenue_this_month.change,
        trend: summaryData.revenue_this_month.trend === 'up' ? 'positive' : summaryData.revenue_this_month.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.revenue_this_month
      },
      {
        number: summaryData.unpaid_amount.value,
        label: summaryData.unpaid_amount.label,
        change: summaryData.unpaid_amount.change,
        trend: summaryData.unpaid_amount.trend === 'up' ? 'positive' : summaryData.unpaid_amount.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.unpaid_amount
      },
      {
        number: summaryData.paid_count.value,
        label: summaryData.paid_count.label,
        change: summaryData.paid_count.change,
        trend: summaryData.paid_count.trend === 'up' ? 'positive' : summaryData.paid_count.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.paid_count
      },
      {
        number: summaryData.pending_payment.value,
        label: summaryData.pending_payment.label,
        change: summaryData.pending_payment.change,
        trend: 'neutral',
        ...cardConfig.pending_payment
      },
      {
        number: summaryData.total_bills.value,
        label: summaryData.total_bills.label,
        change: summaryData.total_bills.change,
        trend: summaryData.total_bills.trend === 'up' ? 'positive' : summaryData.total_bills.trend === 'down' ? 'negative' : 'neutral',
        ...cardConfig.total_bills
      }
    ];

    return { residentsStats, financialStats };
  };

  const { residentsStats, financialStats } = getStatsFromAPI();

  const getStatColors = (color: string) => {
    const colors: any = {
      blue: { border: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { border: 'bg-green-500', bg: 'bg-green-100', text: 'text-green-500' },
      yellow: { border: 'bg-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-500' },
      red: { border: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-500' },
      teal: { border: 'bg-teal-500', bg: 'bg-teal-100', text: 'text-teal-500' },
      orange: { border: 'bg-[#f97316]', bg: 'bg-orange-100', text: 'text-[#f97316]' },
      purple: { border: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-500' }
    };
    return colors[color] || colors.blue;
  };

  const getTrendColors = (trend: string) => {
    if (trend === 'positive') return 'text-green-500';
    if (trend === 'negative') return 'text-red-500';
    return 'text-slate-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'positive') return 'fa-arrow-up';
    if (trend === 'negative') return 'fa-arrow-down';
    return 'fa-minus';
  };

  const getAlertColors = (type: string) => {
    const colors: any = {
      critical: { bg: 'bg-red-100', border: 'border-l-red-500', icon: 'text-red-500' },
      warning: { bg: 'bg-yellow-100', border: 'border-l-yellow-500', icon: 'text-yellow-500' },
      success: { bg: 'bg-green-100', border: 'border-l-green-500', icon: 'text-green-500' },
      info: { bg: 'bg-blue-100', border: 'border-l-blue-500', icon: 'text-blue-600' }
    };
    return colors[type] || colors.info;
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`ภาพรวมโครงการ - อัพเดทล่าสุด: วันนี้ ${currentTime}`}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="p-4 lg:p-8">
        {/* Section 1: การเข้าพักและลูกบ้าน */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <i className="fas fa-home"></i>
          การเข้าพักและลูกบ้าน
        </h3>
        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="p-4 animate-pulse">
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {residentsStats.map((stat, index) => {
              const colors = getStatColors(stat.color);
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colors.border}`}></div>
                  <div className="p-4 relative">
                    <div className={`absolute top-3 right-3 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                      <i className={`fas ${stat.icon} text-lg ${colors.text}`}></i>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-600 mb-2">{stat.label}</div>
                    <div className={`text-xs font-bold flex items-center gap-1 ${getTrendColors(stat.trend)}`}>
                      <i className={`fas ${(stat as any).trendIcon || getTrendIcon(stat.trend)}`}></i>
                      {stat.change}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Section 2: การเงินและการชำระเงิน */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <i className="fas fa-wallet"></i>
          การเงินและการชำระเงิน
        </h3>
        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="p-4 animate-pulse">
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {financialStats.map((stat, index) => {
              const colors = getStatColors(stat.color);
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colors.border}`}></div>
                  <div className="p-4 relative">
                    <div className={`absolute top-3 right-3 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                      <i className={`fas ${stat.icon} text-lg ${colors.text}`}></i>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-600 mb-2">{stat.label}</div>
                    <div className={`text-xs font-bold flex items-center gap-1 ${getTrendColors(stat.trend)}`}>
                      <i className={`fas ${(stat as any).trendIcon || getTrendIcon(stat.trend)}`}></i>
                      {stat.change}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Section 3: รายการที่ต้องดำเนินการ */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-bell"></i>
              รายการที่ต้องดำเนินการ
            </h3>
            {actionItemsLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-pulse text-slate-400">
                  <i className="fas fa-spinner fa-spin text-2xl"></i>
                </div>
              </div>
            ) : actionItemsData?.items && actionItemsData.items.length > 0 ? (
              <div className="space-y-3">
                {actionItemsData.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => item.router && router.push(`/${item.router}`)}
                    className={`flex items-center p-4 rounded-lg border-l-4 ${item.background_color} ${item.border_color} cursor-pointer hover:translate-x-1 transition-transform`}
                  >
                    <i className={`${item.icon_class} text-2xl ${item.icon_color} mr-4`}></i>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-check-circle text-4xl mb-2"></i>
                <div>ไม่มีรายการที่ต้องดำเนินการ</div>
              </div>
            )}
          </div>
        </Card>

        {/* Section 4: Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <i className="fas fa-chart-bar"></i>
                  ค่าเรียกเก็บและรายรับ
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMonthDuration(3)}
                    className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer ${monthDuration === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    3 เดือน
                  </button>
                  <button
                    onClick={() => setMonthDuration(6)}
                    className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer ${monthDuration === 6 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    6 เดือน
                  </button>
                  <button
                    onClick={() => setMonthDuration(12)}
                    className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer ${monthDuration === 12 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    1 ปี
                  </button>
                </div>
              </div>
              {chartLoading ? (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="animate-pulse text-slate-400">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="h-[280px] flex items-end gap-4 pb-4 min-w-[480px]">
                      {chartData.map((data, index) => {
                        const maxValue = Math.max(...chartData.map(d => Math.max(d.billed, d.revenue)));
                        const billedHeight = maxValue > 0 ? (data.billed / maxValue) * 100 : 0;
                        const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="flex gap-1 items-end h-[220px] w-full justify-center relative">
                              <div
                                className="w-6 rounded-t cursor-pointer hover:opacity-80 transition-all relative group hover:z-50"
                                style={{
                                  height: `${billedHeight}%`,
                                  minHeight: data.billed > 0 ? '8px' : '0',
                                  background: 'linear-gradient(to top, #1F4EC2, #2B6EF3)'
                                }}
                              >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999] pointer-events-none">
                                  เรียกเก็บ: {data.billed_formatted}
                                </div>
                              </div>
                              <div
                                className="w-6 rounded-t cursor-pointer hover:opacity-80 transition-all relative group hover:z-50"
                                style={{
                                  height: `${revenueHeight}%`,
                                  minHeight: data.revenue > 0 ? '8px' : '0',
                                  background: 'linear-gradient(to top, #22C55E, #10B981)'
                                }}
                              >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999] pointer-events-none">
                                  รายรับ: {data.revenue_formatted}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-600 mt-2">{data.month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #1F4EC2, #2B6EF3)' }}></div>
                      <span className="text-slate-700">ค่าเรียกเก็บ</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #22C55E, #10B981)' }}></div>
                      <span className="text-slate-700">รายรับจริง</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Donut Chart */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <i className="fas fa-chart-pie"></i>
                สถานะบิล
              </h3>
              {billStatusLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse text-slate-400">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                  </div>
                </div>
              ) : billStatusData?.bill_status ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {/* Paid - Green */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="40"
                        strokeDasharray={`${billStatusData.bill_status.paid.percent * 5.03} 503`}
                        strokeDashoffset="0"
                        transform="rotate(-90 100 100)"
                      />
                      {/* Pending - Yellow */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#EAB308"
                        strokeWidth="40"
                        strokeDasharray={`${billStatusData.bill_status.pending.percent * 5.03} 503`}
                        strokeDashoffset={`-${billStatusData.bill_status.paid.percent * 5.03}`}
                        transform="rotate(-90 100 100)"
                      />
                      {/* Overdue - Red */}
                      {billStatusData.bill_status.overdue.percent > 0 && (
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="40"
                          strokeDasharray={`${billStatusData.bill_status.overdue.percent * 5.03} 503`}
                          strokeDashoffset={`-${(billStatusData.bill_status.paid.percent + billStatusData.bill_status.pending.percent) * 5.03}`}
                          transform="rotate(-90 100 100)"
                        />
                      )}
                      <circle cx="100" cy="100" r="60" fill="white" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-3xl font-bold text-slate-900">{billStatusData.bill_status.total_bills}</div>
                      <div className="text-xs text-slate-500 mt-1">บิลทั้งหมด</div>
                    </div>
                  </div>
                  <div className="w-full mt-6 space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#22C55E]"></div>
                        <span className="text-sm text-slate-700">ชำระแล้ว</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">{billStatusData.bill_status.paid.count} ({billStatusData.bill_status.paid.percent}%)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#EAB308]"></div>
                        <span className="text-sm text-slate-700">รอชำระและรอตรวจสอบ</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">{billStatusData.bill_status.pending.count} ({billStatusData.bill_status.pending.percent}%)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#EF4444]"></div>
                        <span className="text-sm text-slate-700">เกินกำหนด</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">{billStatusData.bill_status.overdue.count} ({billStatusData.bill_status.overdue.percent}%)</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Section 5: Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Bills */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-calendar-alt"></i>
                บิลที่กำลังจะครบกำหนด (7 วันข้างหน้า)
              </h3>
              {billStatusLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="animate-pulse text-slate-400">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                  </div>
                </div>
              ) : billStatusData?.upcoming_bills ? (
                <>
                  <div className="space-y-3">
                    {billStatusData.upcoming_bills.map((bill: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-slate-900">{bill.label}</div>
                          <div className="text-sm text-slate-600">{bill.count} รายการ</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{bill.total_amount_formatted}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => router.push('/billing')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer"
                  >
                    <i className="fas fa-paper-plane"></i>
                    ส่งการแจ้งเตือนให้ลูกบ้าน
                  </Button>
                </>
              ) : null}
            </div>
          </Card>

          {/* Payment Efficiency */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-chart-line"></i>
                ประสิทธิภาพการชำระ
              </h3>
              {paymentEfficiencyLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-pulse text-slate-400">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                  </div>
                </div>
              ) : paymentEfficiencyData ? (
                <>
                  <div className="text-center mb-8">
                    <div className={`text-5xl font-bold mb-2 ${paymentEfficiencyData.payment_rate >= paymentEfficiencyData.target_rate ? 'text-green-500' : 'text-yellow-500'}`}>
                      {paymentEfficiencyData.payment_rate_formatted}
                    </div>
                    <div className="text-sm text-slate-600">อัตราการชำระเงินเดือนนี้</div>
                    {paymentEfficiencyData.rate_change !== 0 && (
                      <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${paymentEfficiencyData.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fas ${paymentEfficiencyData.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        {paymentEfficiencyData.rate_change_formatted} จากเดือนที่แล้ว
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg mb-3">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-600">เป้าหมาย</span>
                      <span className="font-semibold">{paymentEfficiencyData.target_rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all"
                        style={{ width: `${Math.min(paymentEfficiencyData.payment_rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {paymentEfficiencyData.needed_payments > 0 && (
                    <div className="bg-blue-100 p-3 rounded-lg border-l-3 border-l-blue-600">
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <i className="fas fa-info-circle text-blue-600"></i>
                        ต้องการอีก <strong>{paymentEfficiencyData.needed_payments} รายการ</strong> เพื่อบรรลุเป้าหมาย {paymentEfficiencyData.target_rate}%
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Section 6: Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-bolt"></i>
              การดำเนินการด่วน
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/billing?action=create')}
                className="flex flex-col items-center gap-3 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-blue-100 hover:border-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="font-semibold text-sm">สร้างบิลใหม่</div>
              </button>
              <button
                onClick={() => router.push('/payment?tab=1')}
                className="flex flex-col items-center gap-3 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-blue-100 hover:border-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="font-semibold text-sm">อนุมัติรายการ</div>
              </button>
              <button
                onClick={() => toast.info('ฟีเจอร์กำลังพัฒนา')}
                className="flex flex-col items-center gap-3 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-blue-100 hover:border-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <div className="font-semibold text-sm">สร้างประกาศ</div>
              </button>
              <button
                onClick={() => router.push('/room')}
                className="flex flex-col items-center gap-3 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-blue-100 hover:border-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="font-semibold text-sm">จัดการลูกบ้าน</div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
