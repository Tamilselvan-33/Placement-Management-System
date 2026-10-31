import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Sliders, CheckCircle2, ShieldAlert, Save } from 'lucide-react';

export const PolicySettings = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await adminApi.getPolicy();
      if (res.success && res.data) {
        setPolicy(res.data);
      }
    } catch (e) {
      console.error('Failed to load policy:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPolicy((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await adminApi.updatePolicy({
        ...policy,
        maxOffersAllowed: parseInt(policy.maxOffersAllowed),
        dreamCompanyCtcThreshold: parseFloat(policy.dreamCompanyCtcThreshold),
        minCgpaDefault: parseFloat(policy.minCgpaDefault),
        maxBacklogsDefault: parseInt(policy.maxBacklogsDefault),
      });
      if (res.success) {
        setPolicy(res.data);
        setSuccessMsg('Placement policy rules updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading placement policy settings..." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Placement Policy Configuration</h1>
        <p className="text-xs text-slate-500">Centralized recruitment rules, multiple offers restrictions, and dream-tier criteria</p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Policy Title / Academic Year</label>
          <input
            type="text"
            required
            name="policyName"
            value={policy?.policyName || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Max Offers Allowed Per Student</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              name="maxOffersAllowed"
              value={policy?.maxOffersAllowed || 1}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Students cannot accept offers beyond this threshold</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dream Company CTC Threshold (LPA)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              name="dreamCompanyCtcThreshold"
              value={policy?.dreamCompanyCtcThreshold || 10.0}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Drives at or above this CTC are marked as Dream Companies</span>
          </div>
        </div>

        <div className="pt-2 space-y-3 border-t border-slate-100">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowApplicationsAfterAcceptance"
              checked={policy?.allowApplicationsAfterAcceptance || false}
              onChange={handleChange}
              className="h-4 w-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="font-semibold text-slate-900 block">Allow Applications After Offer Acceptance</span>
              <span className="text-[11px] text-slate-500">If unchecked, placed students cannot apply to standard drives</span>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowDreamCompanyParticipation"
              checked={policy?.allowDreamCompanyParticipation || false}
              onChange={handleChange}
              className="h-4 w-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="font-semibold text-slate-900 block">Dream Company Participation Clause</span>
              <span className="text-[11px] text-slate-500">
                Permits placed students to apply to Dream Companies even if standard applications are locked
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Updating Rules...' : 'Save Policy Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicySettings;

