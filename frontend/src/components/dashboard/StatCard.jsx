import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', subtitle, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {(subtitle || change) && (
          <div className="flex items-center mt-1 text-xs">
            {change && (
              <span className={`font-semibold mr-1.5 ${changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

