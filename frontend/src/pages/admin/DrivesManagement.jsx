import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, Plus, Search, Calendar, MapPin, IndianRupee, Users, Edit3, XCircle } from 'lucide-react';

export const DrivesManagement = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
    jobTitle: '',
    jobDescription: '',
    requiredSkills: '',
    eligibleDepartments: 'CSE,IT,ECE',
    minimumCgpa: '7.0',
    maxBacklogs: 0,
    graduationYear: 2025,
    salaryPackage: '12.0',
    jobLocation: 'Bangalore',
    employmentType: 'Full Time',
    openingDate: new Date().toISOString().split('T')[0],
    applicationDeadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'OPEN',
  });

  useEffect(() => {
    fetchDrives();
    fetchCompaniesList();
  }, [page, status]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDrives({
        search: search || undefined,
        status: status || undefined,
        page,
        size: 10,
      });
      if (res.success && res.data) {
        setDrives(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompaniesList = async () => {
    try {
      const res = await adminApi.getCompanies({ page: 0, size: 50 });
      if (res.success && res.data) {
        setCompanies(res.data.content);
        if (res.data.content.length > 0 && !formData.companyId) {
          setFormData((prev) => ({ ...prev, companyId: res.data.content[0].id }));
        }
      }
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDrives();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createDrive({
        ...formData,
        companyId: parseInt(formData.companyId),
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateDrive(editingDrive.id, {
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

  const handleCancelDrive = async (id, title) => {
    if (window.confirm(`Are you sure you want to cancel ${title}?`)) {
      try {
        await adminApi.deleteDrive(id);
        fetchDrives();
      } catch (e) {
        alert('Failed to cancel drive');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-xs text-slate-500">Configure recruitment eligibility, schedules, and compensation packages</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Post New Drive</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives, company, roles..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="">All Drive Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="CLOSED">CLOSED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Drives List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Fetching placement drives..." />
        ) : drives.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No placement drives found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Drive & Company</th>
                  <th className="py-3 px-4">Package (CTC)</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {drives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{d.jobTitle}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">{d.companyName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">₹ {d.salaryPackage} LPA</span>
                      <div className="text-[10px] text-slate-400">{d.employmentType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>Min CGPA: <span className="font-semibold">{d.minimumCgpa}</span></div>
                      <div className="text-[10px] text-slate-500">Depts: {d.eligibleDepartments}</div>
                    </td>
                    <td className="py-3 px-4">{d.jobLocation}</td>
                    <td className="py-3 px-4 font-medium">{d.applicationDeadline}</td>
                    <td className="py-3 px-4">
                      <Badge status={d.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => { setEditingDrive(d); setIsEditModalOpen(true); }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Drive"
                      >
                        <Edit3 size={15} />
                      </button>
                      {d.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelDrive(d.id, d.jobTitle)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Cancel Drive"
                        >
                          <XCircle size={15} />
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

      {/* Add Drive Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Campus Placement Drive"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recruiting Company</label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="Software Engineer, Cloud Analyst"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Departments</label>
              <input
                type="text"
                required
                placeholder="CSE,IT,ECE or ALL"
                value={formData.eligibleDepartments}
                onChange={(e) => setFormData({ ...formData, eligibleDepartments: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary Package (CTC in LPA)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="12.5"
                value={formData.salaryPackage}
                onChange={(e) => setFormData({ ...formData, salaryPackage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

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
              <label className="block font-semibold text-slate-700 mb-1">Max Active Backlogs Allowed</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Target Graduation Year</label>
              <input
                type="number"
                required
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
              <input
                type="text"
                required
                placeholder="Bangalore, Hyderabad, Pan-India"
                value={formData.jobLocation}
                onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Opening Date</label>
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
              placeholder="Java, Python, System Design, SQL"
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
              placeholder="Detailed responsibilities, role expectations, and perks"
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
              Publish Drive
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Drive Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Placement Drive"
        maxWidth="max-w-2xl"
      >
        {editingDrive && (
          <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingDrive.minimumCgpa}
                  onChange={(e) => setEditingDrive({ ...editingDrive, minimumCgpa: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Required Skills</label>
              <input
                type="text"
                value={editingDrive.requiredSkills}
                onChange={(e) => setEditingDrive({ ...editingDrive, requiredSkills: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
              <textarea
                rows={3}
                value={editingDrive.jobDescription}
                onChange={(e) => setEditingDrive({ ...editingDrive, jobDescription: e.target.value })}
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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

export default DrivesManagement;

