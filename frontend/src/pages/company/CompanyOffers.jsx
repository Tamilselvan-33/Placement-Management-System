import React, { useState, useEffect } from 'react';
import { companyApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Award, Calendar, IndianRupee } from 'lucide-react';

export const CompanyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchOffers();
  }, [page]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await companyApi.getOffers({ page, size: 10 });
      if (res.success && res.data) {
        setOffers(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to load offers:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Extended Job Offers</h1>
        <p className="text-xs text-slate-500">Track candidate responses, accepted employment offers, and planned joining dates</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Loading issued offers..." />
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No job offers extended yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Annual Package (CTC)</th>
                  <th className="py-3 px-4">Offer Date</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Candidate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{o.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{o.studentRegNo}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{o.studentDepartment}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{o.jobTitle}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-sm">
                      ₹ {o.ctc} LPA
                    </td>
                    <td className="py-3 px-4 text-slate-500">{o.offerDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{o.joiningDate || 'TBD'}</td>
                    <td className="py-3 px-4">
                      <Badge status={o.status} />
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

export default CompanyOffers;

