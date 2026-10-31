import React, { useState, useEffect } from 'react';
import { companyApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Clock, Video, MapPin, Edit3, MessageSquare } from 'lucide-react';

export const CompanyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editingInterview, setEditingInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [page]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await companyApi.getInterviews({ page, size: 10 });
      if (res.success && res.data) {
        setInterviews(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to load interviews:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await companyApi.updateInterview(editingInterview.id, editingInterview);
      setIsModalOpen(false);
      setEditingInterview(null);
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Failed to update interview');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scheduled Interviews</h1>
        <p className="text-xs text-slate-500">Manage technical rounds, online evaluations, and record candidate feedback</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Loading interview sessions..." />
        ) : interviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No scheduled interviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-4">Round</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Mode / Venue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {interviews.map((intv) => (
                  <tr key={intv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{intv.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{intv.studentRegNo} • {intv.studentDepartment}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{intv.jobTitle}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{intv.roundDisplayName || intv.round}</span>
                      {intv.interviewerName && (
                        <div className="text-[10px] text-slate-500">{intv.interviewerName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>{intv.interviewDate}</div>
                      <div className="text-[11px] text-slate-500">{intv.interviewTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{intv.mode}</span>
                      {intv.venueOrLink && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          {intv.venueOrLink}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={intv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setEditingInterview(intv); setIsModalOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Update Status / Feedback"
                      >
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Interview Status & Feedback"
      >
        {editingInterview && (
          <form onSubmit={handleUpdate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Status</label>
              <select
                value={editingInterview.status}
                onChange={(e) => setEditingInterview({ ...editingInterview, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="RESCHEDULED">RESCHEDULED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={editingInterview.interviewDate}
                  onChange={(e) => setEditingInterview({ ...editingInterview, interviewDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Time</label>
                <input
                  type="text"
                  value={editingInterview.interviewTime}
                  onChange={(e) => setEditingInterview({ ...editingInterview, interviewTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Evaluator Feedback</label>
              <textarea
                rows={3}
                placeholder="Candidate strengths, technical depth, problem-solving skills..."
                value={editingInterview.feedback || ''}
                onChange={(e) => setEditingInterview({ ...editingInterview, feedback: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Update Interview
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CompanyInterviews;

