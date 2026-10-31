import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Briefcase, Calendar, MapPin, IndianRupee, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applyingId, setApplyingId] = useState(null);

  // Eligibility inspection modal
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAvailableDrives(search);
      if (res.success && res.data) {
        setDrives(res.data);
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrives();
  };

  const handleOpenDetails = async (drive) => {
    setSelectedDrive(drive);
    setIsModalOpen(true);
    setLoadingEligibility(true);

    try {
      const res = await studentApi.checkEligibility(drive.id);
      if (res.success && res.data) {
        setEligibilityData(res.data);
      }
    } catch (err) {
      console.error('Failed to check eligibility:', err);
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    try {
      const res = await studentApi.applyToDrive(driveId);
      if (res.success) {
        alert('Application submitted successfully!');
        if (isModalOpen) setIsModalOpen(false);
        fetchDrives();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Placement Drives</h1>
        <p className="text-xs text-slate-500">Discover job opportunities and verify your automatic backend eligibility</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, skills, location..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner size={28} text="Fetching available drives..." />
      ) : drives.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No active placement drives found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Eligibility Bar Tag */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  d.hasApplied
                    ? 'bg-blue-500'
                    : d.isEligible
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
                }`}
              />

              <div>
                <div className="flex items-start justify-between mt-1">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.jobTitle}</h3>
                    <span className="text-xs text-indigo-600 font-semibold">{d.companyName}</span>
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                    ₹ {d.salaryPackage} LPA
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">{d.jobDescription}</p>

                <div className="mt-3.5 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{d.jobLocation} • {d.employmentType}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Deadline: <span className="font-semibold text-slate-700">{d.applicationDeadline}</span></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Briefcase size={13} className="text-slate-400" />
                    <span>Depts: {d.eligibleDepartments} (Min CGPA: {d.minimumCgpa})</span>
                  </div>
                </div>

                {/* Eligibility Tag */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {d.hasApplied ? (
                    <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} className="mr-1" />
                      Applied ({d.myApplicationStatus || 'APPLIED'})
                    </span>
                  ) : d.isEligible ? (
                    <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} className="mr-1" />
                      Eligible to Apply
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full" title={d.eligibilityReason}>
                      <AlertCircle size={12} className="mr-1" />
                      Criteria Mismatch
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(d)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  View Criteria
                </button>

                {!d.hasApplied && (
                  <button
                    type="button"
                    disabled={!d.isEligible || applyingId === d.id}
                    onClick={() => handleApply(d.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {applyingId === d.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drive Details & Real Eligibility Breakdown Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Drive Details & Automated Eligibility Calculation"
        maxWidth="max-w-2xl"
      >
        {selectedDrive && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDrive.jobTitle}</h3>
                <span className="text-xs text-indigo-600 font-semibold">{selectedDrive.companyName}</span>
              </div>
              <span className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                ₹ {selectedDrive.salaryPackage} LPA
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Role Description:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedDrive.jobDescription}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Required Skills:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedDrive.requiredSkills}
              </p>
            </div>

            {/* Eligibility Comparison Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Backend Eligibility Verification Result:</span>
                {loadingEligibility ? (
                  <span className="text-slate-400">Verifying...</span>
                ) : eligibilityData?.eligible ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    PASSED ALL CRITERIA
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                    NOT ELIGIBLE
                  </span>
                )}
              </div>

              {eligibilityData?.reasons && eligibilityData.reasons.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800">
                  <span className="font-bold block mb-1">Reasons:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {eligibilityData.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side by side comparison table */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-semibold text-[9px] block">Your CGPA</span>
                  <span className="font-bold text-slate-800">{eligibilityData?.studentCgpa || 0}</span>
                  <span className="text-slate-500 block text-[10px]">Min Required: {eligibilityData?.requiredCgpa}</span>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-semibold text-[9px] block">Your Backlogs</span>
                  <span className="font-bold text-slate-800">{eligibilityData?.studentBacklogs || 0}</span>
                  <span className="text-slate-500 block text-[10px]">Max Allowed: {eligibilityData?.maxBacklogsAllowed}</span>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-semibold text-[9px] block">Your Department</span>
                  <span className="font-bold text-slate-800">{eligibilityData?.studentDepartment}</span>
                  <span className="text-slate-500 block text-[10px]">Eligible: {eligibilityData?.eligibleDepartments}</span>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-semibold text-[9px] block">Graduation Batch</span>
                  <span className="font-bold text-slate-800">{eligibilityData?.studentGraduationYear}</span>
                  <span className="text-slate-500 block text-[10px]">Required: {eligibilityData?.driveGraduationYear}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {!selectedDrive.hasApplied && (
                <button
                  type="button"
                  disabled={!eligibilityData?.eligible || applyingId === selectedDrive.id}
                  onClick={() => handleApply(selectedDrive.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-40"
                >
                  {applyingId === selectedDrive.id ? 'Applying...' : 'Apply for this Job'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobDrives;

