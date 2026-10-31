import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserCheck, FileText, Upload, Download, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    degree: '',
    graduationYear: 2025,
    cgpa: '',
    backlogs: 0,
    technicalSkills: '',
    programmingLanguages: '',
    projects: '',
    certifications: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          department: res.data.department || '',
          degree: res.data.degree || 'B.Tech',
          graduationYear: res.data.graduationYear || 2025,
          cgpa: res.data.cgpa || '',
          backlogs: res.data.backlogs || 0,
          technicalSkills: res.data.technicalSkills || '',
          programmingLanguages: res.data.programmingLanguages || '',
          projects: res.data.projects || '',
          certifications: res.data.certifications || '',
          linkedinUrl: res.data.linkedinUrl || '',
          githubUrl: res.data.githubUrl || '',
          portfolioUrl: res.data.portfolioUrl || '',
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
    setErrorMsg('');

    try {
      const res = await studentApi.updateProfile({
        ...formData,
        graduationYear: parseInt(formData.graduationYear),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        backlogs: parseInt(formData.backlogs),
      });
      if (res.success) {
        setProfile(res.data);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Resume file size must not exceed 5MB.');
      return;
    }

    setUploadingResume(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await studentApi.uploadResume(uploadData);
      if (res.success) {
        setSuccessMsg('Resume uploaded successfully!');
        fetchProfile();
      }
    } catch (err) {
      alert(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const blob = await studentApi.downloadResume();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${profile.fullName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download resume');
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading student profile..." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Academic Profile & Resume</h1>
        <p className="text-xs text-slate-500">Keep your academic achievements, skills, and resume updated for automated eligibility calculations</p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Resume Upload Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Placement Resume (PDF)</h3>
            <p className="text-xs text-slate-500">
              {profile?.hasResume
                ? `Uploaded: ${profile.resumeFileName || 'Resume.pdf'}`
                : 'No resume uploaded yet (PDF required by companies)'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {profile?.hasResume && (
            <button
              type="button"
              onClick={handleDownloadResume}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          )}

          <label className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload size={14} />
            <span>{uploadingResume ? 'Uploading...' : profile?.hasResume ? 'Replace PDF' : 'Upload PDF'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={uploadingResume}
            />
          </label>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
        {/* Basic & Academic Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Basic & Academic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">College Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration No (Read-only)</label>
              <input
                type="text"
                disabled
                value={profile?.registrationNumber || ''}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree Program</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                required
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                required
                name="backlogs"
                value={formData.backlogs}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Technical Portfolio */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Skills & Experience
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technical Skills</label>
              <input
                type="text"
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleChange}
                placeholder="Data Structures, System Design, React, Spring Boot, Docker, AWS"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Programming Languages</label>
              <input
                type="text"
                name="programmingLanguages"
                value={formData.programmingLanguages}
                onChange={handleChange}
                placeholder="Java, Python, C++, TypeScript, SQL"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Key Projects</label>
              <textarea
                rows={2}
                name="projects"
                value={formData.projects}
                onChange={handleChange}
                placeholder="Distributed Key-Value Store, Campus Placement Management System, etc."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Certifications</label>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                placeholder="AWS Certified Solutions Architect, Oracle Java SE 17 Developer"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Professional Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://myportfolio.dev"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;

