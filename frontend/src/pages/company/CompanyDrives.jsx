import React, { useState, useEffect } from 'react';
import { companyApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, Plus, Users, Edit, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CompanyDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    requiredSkills: '',
    eligibleDepartments: 'CSE,IT,ECE',
    minimumCgpa: '7.5',
    maxBacklogs: 0,
    graduationYear: 2025,
    salaryPackage: '14.0',
    jobLocation: 'Bangalore / Remote',
    employmentType: 'Full Time',
    openingDate: new Date().toISOString().split('T')[0],
    applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'OPEN',
  });

  useEffect(() => {
    fetchDrives();
  }, [page]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await companyApi.getDrives({ page, size: 10 });
      if (res.success && res.data) {
        setDrives(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to load drives:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await companyApi.createDrive({
        ...formData,
        minimumCgpa: parseFloat(formData.minimumCgpa),
        maxBacklogs: parseInt(formData.maxBacklogs),
        graduationYear: parseInt(formData.graduationYear),
        salaryPackage: parseFloat(formData.salaryPackage),
      });
      setIsAddModalOpen(false);
      fetchDrives();
    } catch (err) {
      alert(err.message || 'Failed to create drive');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await companyApi.updateDrive(editingDrive.id, {
        ...editingDrive,
        minimumCgpa: parseFloat(editingDrive.minimumCgpa),
        maxBacklogs: parseInt(editingDrive.maxBacklogs),
        graduationYear: parseInt(editingDrive.graduationYear),
        salaryPackage: parseFloat(editingDrive.salaryPackage),
      });
      setIsEditModalOpen(false);
      setEditingDrive(null);
      fetchDrives();
    } catch (err) {
      alert(err.message || 'Failed to update drive');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Job Drives</h1>
          <p className="text-xs text-slate-500">Post open positions, customize eligibility criteria, and manage application deadlines</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Post New Drive</span>
        </button>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner size={28} text="Loading your job drives..." />
      ) : drives.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No job drives posted yet. Click "Post New Drive" to create your first recruitment posting.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{d.jobTitle}</h3>
                  <Badge status={d.status} />
                </div>

                <div className="mt-2 text-base font-extrabold text-slate-900">
                  ₹ {d.salaryPackage} LPA
                  <span className="text-xs font-normal text-slate-500 ml-1.5">({d.employmentType})</span>
                </div>

                <p className="mt-2 text-xs text-slate-600 line-clamp-2">{d.jobDescription}</p>

                <div className="mt-3.5 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{d.jobLocation}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Deadline: {d.applicationDeadline}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Briefcase size={13} className="text-slate-400" />
                    <span>Min CGPA: {d.minimumCgpa} • Depts: {d.eligibleDepartments}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/company/applicants?driveId=${d.id}`)}
                  className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Users size={14} />
                  <span>{d.totalApplications || 0} Candidates</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setEditingDrive(d); setIsEditModalOpen(true); }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  title="Edit Drive"
                >
                  <Edit size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Drive Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Post New Campus Placement Drive"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. SDE 1 - Backend Engineering"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary Package (CTC in LPA)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.salaryPackage}
                onChange={(e) => setFormData({ ...formData, salaryPackage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
              <input
                type="text"
                required
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.minimumCgpa}
                onChange={(e) => setFormData({ ...formData, minimumCgpa: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Year</label>
              <input
                type="number"
                required
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Departments</label>
              <input
                type="text"
                required
                placeholder="CSE,IT,ECE or ALL"
                value={formData.eligibleDepartments}
                onChange={(e) => setFormData({ ...formData, eligibleDepartments: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
              <input
                type="text"
                required
                value={formData.jobLocation}
                onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opening Date</label>
              <input
                type="date"
                required
                value={formData.openingDate}
                onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Skills</label>
            <input
              type="text"
              required
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={3}
              required
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Publish Job Drive
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Drive Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Job Drive"
      >
        {editingDrive && (
          <form onSubmit={handleEdit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={editingDrive.jobTitle}
                onChange={(e) => setEditingDrive({ ...editingDrive, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salary Package (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingDrive.salaryPackage}
                  onChange={(e) => setEditingDrive({ ...editingDrive, salaryPackage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drive Status</label>
                <select
                  value={editingDrive.status}
                  onChange={(e) => setEditingDrive({ ...editingDrive, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={editingDrive.applicationDeadline}
                onChange={(e) => setEditingDrive({ ...editingDrive, applicationDeadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CompanyDrives;

