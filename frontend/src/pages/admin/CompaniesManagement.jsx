import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building2, Plus, Search, Edit2, Trash2, Globe, MapPin, Mail, Phone } from 'lucide-react';

export const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: 'Password@123',
    contactPerson: '',
    contactPhone: '',
    industry: 'Technology',
    location: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCompanies({
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.success && res.data) {
        setCompanies(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCompanies();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCompany(formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Failed to create company');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateCompany(editingCompany.id, editingCompany);
      setIsEditModalOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Failed to update company');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate ${name}?`)) {
      try {
        await adminApi.deleteCompany(id);
        fetchCompanies();
      } catch (err) {
        alert('Failed to deactivate company');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      email: '',
      password: 'Password@123',
      contactPerson: '',
      contactPhone: '',
      industry: 'Technology',
      location: '',
      website: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recruiting Companies</h1>
          <p className="text-xs text-slate-500">Corporate partners participating in campus recruitment drives</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company by name, industry, location..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSpinner size={28} text="Loading company profiles..." />
      ) : companies.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No companies found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {c.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.companyName}</h3>
                      <span className="text-[11px] text-slate-500">{c.industry || 'Technology'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => { setEditingCompany(c); setIsEditModalOpen(true); }}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.companyName)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>

                <div className="mt-4 space-y-1.5 text-[11px] text-slate-500">
                  {c.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{c.location}</span>
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center space-x-2">
                      <Globe size={13} className="text-slate-400" />
                      <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                        {c.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Mail size={13} className="text-slate-400" />
                    <span className="truncate">{c.companyEmail}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">{c.totalDrivesPosted || 0} Drives Posted</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Verified Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Recruiting Company"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Company
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company Profile"
      >
        {editingCompany && (
          <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={editingCompany.companyName}
                onChange={(e) => setEditingCompany({ ...editingCompany, companyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editingCompany.contactPerson || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editingCompany.contactPhone || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={editingCompany.industry || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingCompany.location || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="url"
                value={editingCompany.website || ''}
                onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingCompany.description || ''}
                onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
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
                Update Company
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CompaniesManagement;

