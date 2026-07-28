import React from 'react';

export function KpiCard({ title, value, icon: Icon, color = 'blue', progress, subtext }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    orange: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:-translate-y-1 transition-all duration-300">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.blue}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <h3 className="text-2xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        {progress !== undefined && (
          <div className="w-full bg-slate-800 light:bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
        {subtext && (
          <span className="text-xs text-rose-500 font-semibold mt-1 block">{subtext}</span>
        )}
      </div>
    </div>
  );
}
