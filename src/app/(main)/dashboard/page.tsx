'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useSidebar } from '@/app/(main)/layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, LayoutDashboard } from 'lucide-react';

// Sample data for charts
const monthlyData = [
  { month: 'ม.ค.', รายรับ: 245000, รายจ่าย: 180000 },
  { month: 'ก.พ.', รายรับ: 260000, รายจ่าย: 195000 },
  { month: 'มี.ค.', รายรับ: 278000, รายจ่าย: 205000 },
  { month: 'เม.ย.', รายรับ: 290000, รายจ่าย: 210000 },
  { month: 'พ.ค.', รายรับ: 310000, รายจ่าย: 225000 },
  { month: 'มิ.ย.', รายรับ: 295000, รายจ่าย: 215000 },
];

const summaryCards = [
  {
    title: 'ยอดรายรับเดือนนี้',
    value: '฿295,000',
    change: '+12.5%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'ยอดค้างชำระ',
    value: '฿48,500',
    change: '-5.2%',
    trend: 'down',
    icon: TrendingDown,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'จำนวนผู้พักอาศัย',
    value: '156',
    change: '+3',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'บิลทั้งหมดเดือนนี้',
    value: '142',
    change: '+8',
    trend: 'up',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function DashboardPage() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="space-y-6">
      <PageHeader
        title="แดชบอร์ด"
        subtitle="ภาพรวมระบบจัดการโครงการที่พักอาศัย"
        icon={<LayoutDashboard className="w-8 h-8 text-slate-700" />}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={`text-xs ${card.trend === 'up' ? 'text-green-600' : 'text-orange-600'}`}>
                  {card.change} จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>รายรับ - รายจ่าย รายเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="รายรับ" fill="#3b82f6" />
                <Bar dataKey="รายจ่าย" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มรายรับ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="รายรับ" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
