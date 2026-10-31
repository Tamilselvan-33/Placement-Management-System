import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Download, Eye, CheckCircle, XCircle, Filter, FileText } from 'lucide-react';

export const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [page, department, placementStatus]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStudents({
        search: search || undefined,
        department: department || undefined,
        placementStatus: placementStatus || undefined,
        page,
        size: 10,
      });
      if (res.success && res.data) {
        setStudents(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStudents();
  };

  const handleToggleStatus = async (studentId, currentActive) => {
    try {
      await adminApi.toggleStudentStatus(studentId, !currentActive);
      fetchStudents();
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(prev => ({ ...prev, active: !currentActive }));
      }
    } catch (err) {
      alert('Failed to update student status');
    }
  };

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const blob = await adminApi.downloadStudentResume(studentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('No resume file found or failed to download');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500">Manage registered students, view eligibility, resumes, and placement status</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, reg no, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <select
            value={placementStatus}
            onChange={(e) => { setPlacementStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Placement Status</option>
            <option value="UNPLACED">UNPLACED</option>
            <option value="PLACED">PLACED</option>
            <option value="OPTED_OUT">OPTED OUT</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size={28} text="Fetching student records..." />
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No students found matching current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Dept / Year</th>
                  <th className="py-3 px-4">CGPA / Backlogs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{s.registrationNumber}</td>
                    <td className="py-3 px-4">
                      {s.department} • {s.graduationYear}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{s.cgpa || 0}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({s.backlogs} BL)</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={s.placementStatus} />
                    </td>
                    <td className="py-3 px-4">
                      {s.hasResume ? (
                        <button
                          onClick={() => handleDownloadResume(s.id, s.fullName)}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.active)}
                        className={`inline-flex items-center text-[11px] font-medium ${
                          s.active ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {s.active ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
                        {s.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Profile Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {page + 1} of {totalPages}
            </span>
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

      {/* Student Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Full Profile"
        maxWidth="max-w-2xl"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedStudent.fullName}</h4>
                <p className="text-slate-500">{selectedStudent.email} • {selectedStudent.phone || 'No phone'}</p>
              </div>
              <Badge status={selectedStudent.placementStatus} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reg No</span>
                <p className="font-bold text-slate-800">{selectedStudent.registrationNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="font-bold text-slate-800">{selectedStudent.department}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">CGPA</span>
                <p className="font-bold text-slate-800">{selectedStudent.cgpa || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Backlogs</span>
                <p className="font-bold text-slate-800">{selectedStudent.backlogs}</p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Technical Skills:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedStudent.technicalSkills || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Programming Languages:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedStudent.programmingLanguages || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Projects:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedStudent.projects || 'None documented'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {selectedStudent.linkedinUrl && (
                <a
                  href={selectedStudent.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline truncate"
                >
                  LinkedIn Profile
                </a>
              )}
              {selectedStudent.githubUrl && (
                <a
                  href={selectedStudent.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline truncate"
                >
                  GitHub Profile
                </a>
              )}
              {selectedStudent.hasResume && (
                <button
                  onClick={() => handleDownloadResume(selectedStudent.id, selectedStudent.fullName)}
                  className="flex items-center space-x-1 text-emerald-600 hover:underline font-semibold"
                >
                  <Download size={12} />
                  <span>Download Resume PDF</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsManagement;

