import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, FileText, Calendar, Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [availableDrivesCount, setAvailableDrivesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [profRes, appRes, intRes, offRes, drivRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getMyApplications({ page: 0, size: 5 }),
        studentApi.getMyInterviews(),
        studentApi.getMyOffers(),
        studentApi.getAvailableDrives(''),
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (appRes.success) setApplications(appRes.data.content || []);
      if (intRes.success) setInterviews(intRes.data || []);
      if (offRes.success) setOffers(offRes.data || []);
      if (drivRes.success) setAvailableDrivesCount(drivRes.data.length || 0);
    } catch (e) {
      console.error('Failed to load student dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading student dashboard..." />;
  }

  const isPlaced = profile?.placementStatus === 'PLACED';

  return (
    <div className="space-y-6">
      {/* Welcome & Placement Banner */}
      <div className={`p-6 rounded-2xl border shadow-xs ${
        isPlaced
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border-emerald-200'
          : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-white border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome back, {profile?.fullName}!
              </h1>
              <Badge status={profile?.placementStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.department} Engineering • Batch of {profile?.graduationYear} • Reg No: {profile?.registrationNumber}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!profile?.hasResume && (
              <Link
                to="/student/profile"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
              >
                <AlertCircle size={14} />
                <span>Upload Resume</span>
              </Link>
            )}
            <Link
              to="/student/drives"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Explore Active Drives</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Available Drives</span>
            <Briefcase size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{availableDrivesCount}</p>
          <span className="text-[10px] text-slate-400">Open for applications</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">My Applications</span>
            <FileText size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{applications.length}</p>
          <span className="text-[10px] text-slate-400">Total submitted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Interviews</span>
            <Calendar size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{interviews.length}</p>
          <span className="text-[10px] text-slate-400">Scheduled rounds</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Job Offers</span>
            <Award size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{offers.length}</p>
          <span className="text-[10px] text-slate-400">Received offers</span>
        </div>
      </div>

      {/* Applications and Interviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-indigo-600 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No active applications submitted yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{app.jobTitle}</h4>
                    <span className="text-[11px] text-slate-500">{app.companyName} • ₹ {app.salaryPackage} LPA</span>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Interviews</h3>
            <Link to="/student/interviews" className="text-xs text-indigo-600 hover:underline font-semibold">
              View Schedule
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No interviews currently scheduled.</p>
            ) : (
              interviews.map((intv) => (
                <div key={intv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{intv.roundDisplayName || intv.round}</h4>
                    <span className="text-[11px] text-slate-500">
                      {intv.companyName} • {intv.interviewDate} at {intv.interviewTime}
                    </span>
                  </div>
                  <Badge status={intv.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

