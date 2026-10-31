import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { companyApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Download, UserCheck, Calendar, Award, CheckCircle, XCircle, Clock } from 'lucide-react';

export const ApplicantsManagement = () => {
  const [searchParams] = useSearchParams();
  const initialDriveId = searchParams.get('driveId') || '';

  const [applicants, setApplicants] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriveId, setSelectedDriveId] = useState(initialDriveId);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);

  // Interview Form Data
  const [interviewForm, setInterviewForm] = useState({
    round: 'TECHNICAL_INTERVIEW_1',
    interviewDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    interviewTime: '10:00 AM',
    mode: 'ONLINE',
    venueOrLink: 'https://meet.google.com/xyz-placement-interview',
    interviewerName: '',
    feedback: '',
  });

  // Offer Form Data
  const [offerForm, setOfferForm] = useState({
    ctc: '14.0',
    offerDate: new Date().toISOString().split('T')[0],
    joiningDate: '2025-07-01',
    remarks: 'Congratulations on your successful interview rounds!',
    offerLetterUrl: '',
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [page, selectedDriveId, status]);

  const fetchDrives = async () => {
    try {
      const res = await companyApi.getDrives({ page: 0, size: 50 });
      if (res.success && res.data) {
        setDrives(res.data.content || []);
      }
    } catch (e) {}
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const driveId = selectedDriveId ? parseInt(selectedDriveId) : null;
      const res = await companyApi.getDriveApplications(driveId, {
        status: status || undefined,
        search: search || undefined,
        page,
        size: 15,
      });
      if (res.success && res.data) {
        setApplicants(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to load applicants:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchApplicants();
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await companyApi.updateApplicationStatus(appId, { status: newStatus, notes: `Status updated by recruiter` });
      fetchApplicants();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await companyApi.scheduleInterview({
        applicationId: activeApplication.id,
        ...interviewForm,
      });
      setIsInterviewModalOpen(false);
      alert('Interview scheduled successfully!');
      fetchApplicants();
    } catch (err) {
      alert(err.message || 'Failed to schedule interview');
    }
  };

  const handleIssueOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      await companyApi.issueOffer({
        applicationId: activeApplication.id,
        ...offerForm,
        ctc: parseFloat(offerForm.ctc),
      });
      setIsOfferModalOpen(false);
      alert('Employment offer issued successfully!');
      fetchApplicants();
    } catch (err) {
      alert(err.message || 'Failed to issue offer');
    }
  };

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const blob = await companyApi.downloadStudentResume(studentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Candidate has not uploaded a resume yet.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Applicant Pipeline</h1>
        <p className="text-xs text-slate-500">Review candidate profiles, download verified resumes, schedule interviews, and issue job offers</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, reg no..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={selectedDriveId}
            onChange={(e) => { setSelectedDriveId(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All Job Drives</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>{d.jobTitle}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">APPLIED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
            <option value="SELECTED">SELECTED</option>
            <option value="OFFERED">OFFERED</option>
            <option value="OFFER_ACCEPTED">OFFER ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Fetching candidates..." />
        ) : applicants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No applicants found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Department / CGPA</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Recruiter Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.studentRegNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{app.studentDepartment}</div>
                      <div className="text-[11px] text-slate-500">
                        CGPA: <span className="font-bold text-slate-800">{app.studentCgpa || 0}</span> ({app.studentBacklogs} Backlogs)
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                      <div className="text-[10px] text-slate-400">₹ {app.salaryPackage} LPA</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {app.studentHasResume ? (
                        <button
                          onClick={() => handleDownloadResume(app.studentId, app.studentName)}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">Not Uploaded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {app.status === 'APPLIED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px]"
                        >
                          Shortlist
                        </button>
                      )}

                      {(app.status === 'APPLIED' || app.status === 'SHORTLISTED' || app.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => {
                            setActiveApplication(app);
                            setIsInterviewModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px]"
                        >
                          Schedule Round
                        </button>
                      )}

                      {!app.offerId && (
                        <button
                          onClick={() => {
                            setActiveApplication(app);
                            setOfferForm(prev => ({ ...prev, ctc: app.salaryPackage }));
                            setIsOfferModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]"
                        >
                          Issue Offer
                        </button>
                      )}

                      {app.status !== 'REJECTED' && app.status !== 'OFFER_ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-[11px]"
                          title="Reject Application"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={`Schedule Interview: ${activeApplication?.studentName}`}
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interview Round</label>
            <select
              value={interviewForm.round}
              onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="ONLINE_ASSESSMENT">Online Assessment</option>
              <option value="TECHNICAL_INTERVIEW_1">Technical Interview 1</option>
              <option value="TECHNICAL_INTERVIEW_2">Technical Interview 2</option>
              <option value="MANAGERIAL_INTERVIEW">Managerial Interview</option>
              <option value="HR_INTERVIEW">HR Interview</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Date</label>
              <input
                type="date"
                required
                value={interviewForm.interviewDate}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Time</label>
              <input
                type="text"
                required
                placeholder="10:30 AM"
                value={interviewForm.interviewTime}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mode</label>
              <select
                value={interviewForm.mode}
                onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="ONLINE">Online Meeting</option>
                <option value="IN_PERSON">In-Person Campus Venue</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interviewer Name</label>
              <input
                type="text"
                placeholder="Lead Engineer / Panel 1"
                value={interviewForm.interviewerName}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meeting Link or Campus Venue</label>
            <input
              type="text"
              placeholder="https://meet.google.com/... or Tech Block Lab 3"
              value={interviewForm.venueOrLink}
              onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Schedule & Notify Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={`Extend Employment Offer: ${activeApplication?.studentName}`}
      >
        <form onSubmit={handleIssueOfferSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total CTC (LPA)</label>
            <input
              type="number"
              step="0.1"
              required
              value={offerForm.ctc}
              onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Offer Extended Date</label>
              <input
                type="date"
                required
                value={offerForm.offerDate}
                onChange={(e) => setOfferForm({ ...offerForm, offerDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Joining Date</label>
              <input
                type="date"
                value={offerForm.joiningDate}
                onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Offer Letter / Remarks</label>
            <textarea
              rows={3}
              value={offerForm.remarks}
              onChange={(e) => setOfferForm({ ...offerForm, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
            >
              Issue Formal Offer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApplicantsManagement;

