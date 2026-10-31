import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, Building, Percent } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminApi.getAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Calculating analytics metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Placement Analytics & Reports</h1>
        <p className="text-xs text-slate-500">Comprehensive statistical analysis of hiring trends, salary distribution, and conversion rates</p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Placement Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics?.placementRate || 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Highest Package</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">₹ {analytics?.highestPackage || 0} LPA</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Average Package</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹ {analytics?.averagePackage || 0} LPA</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Median Package</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">₹ {analytics?.medianPackage || 0} LPA</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Statistics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department Placement Rates (%)</h3>
          <p className="text-xs text-slate-500 mb-4">Percentage of eligible students placed by engineering discipline</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="placementRate" name="Placement %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Funnel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Lifecycle Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Volume of student applications at each stage</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.applicationStatusStats || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.applicationStatusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Company Hiring Statistics Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Company-Wise Hiring Performance</h3>
        <p className="text-xs text-slate-500 mb-4">Total selections and compensation packages per recruiting partner</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Offers Accepted</th>
                <th className="py-2.5 px-3">Average CTC Offered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analytics?.companyHiringStats?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-400">No confirmed hires yet.</td>
                </tr>
              ) : (
                analytics?.companyHiringStats?.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.companyName}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-600">{c.hires} Hires</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">₹ {c.averagePackage} LPA</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

