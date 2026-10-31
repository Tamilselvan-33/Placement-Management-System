import React, { useState, useEffect } from 'react';
import { companyApi } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, Users, Calendar, Award, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const [profRes, drivRes, intRes, offRes] = await Promise.all([
        companyApi.getProfile(),
        companyApi.getDrives({ page: 0, size: 10 }),
        companyApi.getInterviews({ page: 0, size: 5 }),
        companyApi.getOffers({ page: 0, size: 5 }),
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (drivRes.success) setDrives(drivRes.data.content || []);
      if (intRes.success) setInterviews(intRes.data.content || []);
      if (offRes.success) setOffers(offRes.data.content || []);
    } catch (e) {
      console.error('Failed to load company dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading recruiter dashboard..." />;
  }

  const totalApplicants = drives.reduce((sum, d) => sum + (d.totalApplications || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {profile?.companyName} • Campus Recruitment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Industry: {profile?.industry || 'Technology'} • Location: {profile?.location || 'Pan India'} • Contact: {profile?.contactPerson}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/company/drives"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Post New Drive</span>
          </Link>
          <Link
            to="/company/applicants"
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            <span>Review Applicants</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Job Drives"
          value={drives.length}
          icon={Briefcase}
          color="indigo"
          subtitle="Campus drives posted"
        />
        <StatCard
          title="Total Applications"
          value={totalApplicants}
          icon={Users}
          color="purple"
          subtitle="Candidates applied"
        />
        <StatCard
          title="Scheduled Interviews"
          value={interviews.length}
          icon={Calendar}
          color="blue"
          subtitle="Rounds in progress"
        />
        <StatCard
          title="Offers Extended"
          value={offers.length}
          icon={Award}
          color="emerald"
          subtitle="Employment offers"
        />
      </div>

      {/* Drives & Interviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Drives */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">My Job Postings</h3>
            <Link to="/company/drives" className="text-xs text-indigo-600 hover:underline font-semibold">
              Manage Drives
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {drives.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No job drives posted yet.</p>
            ) : (
              drives.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{d.jobTitle}</h4>
                    <span className="text-[11px] text-slate-500">
                      ₹ {d.salaryPackage} LPA • {d.totalApplications || 0} Applicants
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {d.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Interview Rounds</h3>
            <Link to="/company/interviews" className="text-xs text-indigo-600 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No interviews scheduled yet.</p>
            ) : (
              interviews.map((intv) => (
                <div key={intv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{intv.studentName} ({intv.studentRegNo})</h4>
                    <span className="text-[11px] text-slate-500">
                      {intv.roundDisplayName || intv.round} • {intv.interviewDate} {intv.interviewTime}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {intv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

