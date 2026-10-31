import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import { Bell, User, LogOut, CheckCircle2, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, role, isAdmin, isStudent, isCompany } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications({ page: 0, size: 5 });
      if (res.success && res.data) {
        setNotifications(res.data.notifications.content || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (e) {}
  };

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Placement Officer / Admin';
    if (isCompany) return 'Recruiter';
    if (isStudent) return 'Student';
    return '';
  };

  const getProfileLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isCompany) return '/company/profile';
    return '/student/profile';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-sm">
            CP
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-slate-900 tracking-tight">PlacementHub</span>
            <span className="block text-[11px] text-slate-500 font-medium -mt-1">Campus Recruitment System</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                {user?.fullName}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                {getRoleDisplayName()}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                to={getProfileLink()}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <User size={15} className="text-slate-500" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

