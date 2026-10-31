import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Building } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authData = await login(email, password);
      redirectByRole(authData.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const authData = await login(demoEmail, demoPassword);
      redirectByRole(authData.role);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'ROLE_COMPANY') {
      navigate('/company/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg mb-3">
            CP
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@placement.edu"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@placement.edu', 'Password@123')}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all text-center"
            >
              <ShieldCheck size={16} className="text-indigo-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Admin</span>
              <span className="text-[9px] text-slate-500">Director</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('arun.kumar@placement.edu', 'Password@123')}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all text-center"
            >
              <UserCheck size={16} className="text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Student</span>
              <span className="text-[9px] text-slate-500">Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('recruiter@google.com', 'Password@123')}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-purple-50/50 hover:border-purple-300 transition-all text-center"
            >
              <Building size={16} className="text-purple-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Company</span>
              <span className="text-[9px] text-slate-500">Recruiter</span>
            </button>
          </div>
        </div>

        {/* Registration links */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>
            New Student?{' '}
            <Link to="/register/student" className="text-indigo-600 hover:underline font-semibold">
              Register here
            </Link>
          </p>
          <p>
            New Recruiting Partner?{' '}
            <Link to="/register/company" className="text-indigo-600 hover:underline font-semibold">
              Register company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

