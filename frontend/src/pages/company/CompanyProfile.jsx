import React, { useState, useEffect } from 'react';
import { companyApi } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building, Save, CheckCircle2, Globe, MapPin, Mail, Phone } from 'lucide-react';

export const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    contactPhone: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await companyApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          companyName: res.data.companyName || '',
          contactPerson: res.data.contactPerson || '',
          contactPhone: res.data.contactPhone || '',
          industry: res.data.industry || '',
          location: res.data.location || '',
          website: res.data.website || '',
          description: res.data.description || '',
          logoUrl: res.data.logoUrl || '',
        });
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await companyApi.updateProfile(formData);
      if (res.success) {
        setProfile(res.data);
        setSuccessMsg('Company profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading company profile..." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-xs text-slate-500">Manage your recruitment branding, point of contact, and business information</p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email (Read-only)</label>
            <input
              type="email"
              disabled
              value={profile?.companyEmail || ''}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              required
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Location(s)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Careers Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Logo Image URL</label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company Description</label>
          <textarea
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Updating...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;

