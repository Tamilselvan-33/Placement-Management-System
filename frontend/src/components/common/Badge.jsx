import React from 'react';

const colorMap = {
  // Placement / Drive Status
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Application Status
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SHORTLISTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 border-purple-200',
  SELECTED: 'bg-teal-50 text-teal-700 border-teal-200',
  OFFERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OFFER_ACCEPTED: 'bg-green-100 text-green-800 border-green-300 font-semibold',
  OFFER_DECLINED: 'bg-slate-100 text-slate-600 border-slate-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  WITHDRAWN: 'bg-gray-100 text-gray-500 border-gray-200',

  // Student Placement Status
  PLACED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  UNPLACED: 'bg-amber-50 text-amber-700 border-amber-200',
  OPTED_OUT: 'bg-gray-100 text-gray-600 border-gray-200',

  // Interview Status
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  RESCHEDULED: 'bg-amber-50 text-amber-700 border-amber-200',

  // Offer Status
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
  DECLINED: 'bg-slate-100 text-slate-600 border-slate-200',
  REVOKED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const Badge = ({ status, text, className = '' }) => {
  const label = text || (status ? status.replace(/_/g, ' ') : '');
  const style = colorMap[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;

