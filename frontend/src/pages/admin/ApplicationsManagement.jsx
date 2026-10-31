import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Filter, Calendar, Award } from 'lucide-react';

export const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, [page, status]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getApplications({
        search: search || undefined,
        status: status || undefined,
        page,
        size: 15,
      });
      if (res.success && res.data) {
        setApplications(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recruitment Applications</h1>
        <p className="text-xs text-slate-500">Monitor candidate progressions, shortlists, interview outcomes, and offers</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, reg no..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="">All Application Statuses</option>
          <option value="APPLIED">APPLIED</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="SHORTLISTED">SHORTLISTED</option>
          <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
          <option value="SELECTED">SELECTED</option>
          <option value="OFFERED">OFFERED</option>
          <option value="OFFER_ACCEPTED">OFFER ACCEPTED</option>
          <option value="OFFER_DECLINED">OFFER DECLINED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="WITHDRAWN">WITHDRAWN</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Fetching application history..." />
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No applications found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Dept / CGPA</th>
                  <th className="py-3 px-4">Job Role & Company</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4">Interview / Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.studentRegNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{app.studentDepartment}</div>
                      <div className="text-[11px] text-slate-500">CGPA: {app.studentCgpa || 0}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.jobTitle}</div>
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
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                          <Award size={13} className="mr-1" />
                          Offer: {app.offerStatus} (₹{app.offerCtc} LPA)
                        </span>
                      ) : app.latestInterviewRound ? (
                        <span className="inline-flex items-center text-[11px] text-purple-700">
                          <Calendar size={13} className="mr-1" />
                          {app.latestInterviewRound} ({app.latestInterviewDate})
                        </span>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="space-x-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsManagement;

