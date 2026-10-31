import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Calendar, Award, AlertCircle, Trash2 } from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, [page]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyApplications({ page, size: 10 });
      if (res.success && res.data) {
        setApplications(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to load applications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId, jobTitle) => {
    if (window.confirm(`Are you sure you want to withdraw your application for ${jobTitle}?`)) {
      try {
        await studentApi.withdrawApplication(appId);
        fetchApplications();
      } catch (err) {
        alert(err.message || 'Failed to withdraw application');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Job Applications</h1>
        <p className="text-xs text-slate-500">Track application statuses, shortlists, interview rounds, and offers</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Loading your applications..." />
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            You have not applied to any placement drives yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4">Interviews / Offers</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.jobTitle}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">{app.companyName}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹ {app.salaryPackage} LPA
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      {app.offerStatus ? (
                        <span className="font-semibold text-emerald-700 text-[11px]">
                          Offer: {app.offerStatus} (₹{app.offerCtc} LPA)
                        </span>
                      ) : app.latestInterviewRound ? (
                        <span className="text-purple-700 text-[11px]">
                          {app.latestInterviewRound} on {app.latestInterviewDate}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Under Evaluation</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'APPLIED' ? (
                        <button
                          onClick={() => handleWithdraw(app.id, app.jobTitle)}
                          className="px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-medium"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

