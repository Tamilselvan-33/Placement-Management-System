import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Building2,
  Briefcase,
  Award,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, anaRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getAnalytics(),
      ]);

      if (dashRes.success) setData(dashRes.data);
      if (anaRes.success) setAnalytics(anaRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading dashboard metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Placement Overview</h1>
        <p className="text-xs text-slate-500">Live recruitment metrics, hiring velocity, and placement statistics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={data?.totalStudents || 0}
          icon={Users}
          color="indigo"
          subtitle={`${data?.totalPlacedStudents || 0} placed`}
        />
        <StatCard
          title="Placement Rate"
          value={`${data?.placementPercentage || 0}%`}
          icon={Percent}
          color="emerald"
          changeType="positive"
          change={`${data?.totalPlacedStudents || 0} Students`}
          subtitle="secured offers"
        />
        <StatCard
          title="Partner Companies"
          value={data?.totalCompanies || 0}
          icon={Building2}
          color="purple"
          subtitle={`${data?.totalJobDrives || 0} active drives`}
        />
        <StatCard
          title="Highest CTC Package"
          value={`₹ ${data?.highestPackage || 0} LPA`}
          icon={TrendingUp}
          color="amber"
          subtitle={`Avg: ₹ ${data?.averagePackage || 0} LPA`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Placement Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Placement Performance</h3>
              <p className="text-xs text-slate-500">Placed vs Total Students by Branch</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="totalStudents" name="Total Students" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placedStudents" name="Placed Students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year-wise Placement Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Graduation Batch Placement Rate (%)</h3>
              <p className="text-xs text-slate-500">Placement conversion by graduating batch</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.yearlyStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="placementRate" name="Placement %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities & Hiring Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Placement Activity</h3>
          <div className="divide-y divide-slate-100">
            {data?.recentActivities?.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No recent activities recorded.</p>
            ) : (
              data?.recentActivities?.map((act, index) => (
                <div key={index} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Salary Stats Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Compensation Highlights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="text-[11px] text-indigo-700 font-medium">Highest Package</span>
                <p className="text-xl font-bold text-indigo-900 mt-0.5">₹ {data?.highestPackage || 0} LPA</p>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium">Average Package</span>
                <p className="text-xl font-bold text-emerald-900 mt-0.5">₹ {data?.averagePackage || 0} LPA</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                <span className="text-[11px] text-purple-700 font-medium">Median Package</span>
                <p className="text-xl font-bold text-purple-900 mt-0.5">₹ {data?.medianPackage || 0} LPA</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Computed from verified offers</span>
            <ArrowUpRight size={14} className="text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

