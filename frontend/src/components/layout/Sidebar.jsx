import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  Sliders,
  UserCheck,
  Calendar,
  Award,
  Bell,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, isStudent, isCompany } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/drives', icon: Briefcase, label: 'Placement Drives' },
    { to: '/admin/applications', icon: FileText, label: 'Applications' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/policies', icon: Sliders, label: 'Placement Policy' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/student/profile', icon: UserCheck, label: 'My Profile & Resume' },
    { to: '/student/drives', icon: Briefcase, label: 'Find Drives & Jobs' },
    { to: '/student/applications', icon: FileText, label: 'My Applications' },
    { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/student/offers', icon: Award, label: 'Offers' },
  ];

  const companyLinks = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/company/profile', icon: Building2, label: 'Company Profile' },
    { to: '/company/drives', icon: Briefcase, label: 'Job Drives' },
    { to: '/company/applicants', icon: Users, label: 'Applicants' },
    { to: '/company/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/company/offers', icon: Award, label: 'Offers' },
  ];

  const links = isAdmin ? adminLinks : isCompany ? companyLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 lg:hidden">
          <span className="text-base font-bold text-slate-900">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-full">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>

          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

