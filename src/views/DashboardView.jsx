import React from 'react';
import { Users, KeyRound, CreditCard, AlertCircle, Plus, Building2, CalendarDays, UserPlus } from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';

export function DashboardView({ stats, hostels, onQuickAction }) {
  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Real-time management metrics and hostel occupancy analytics.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Residents"
          value={stats.total_students || 0}
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Active Allocations"
          value={stats.active_allocations || 0}
          icon={KeyRound}
          color="purple"
        />
        <KpiCard
          title="Monthly Revenue"
          value={formatLKR(stats.monthly_revenue || 0)}
          icon={CreditCard}
          color="green"
        />
        <KpiCard
          title="Pending Complaints"
          value={stats.pending_complaints || 0}
          icon={AlertCircle}
          color="orange"
          subtext={stats.pending_complaints > 0 ? `${stats.pending_complaints} require attention` : null}
        />
      </div>

      {/* Main Grid: Occupancy Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hostel Occupancy Progress */}
        <div className="lg:col-span-2 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-dark-border light:border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-bold font-heading text-slate-100 light:text-slate-900">
              Hostel Occupancy Capacity
            </h3>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-6">
            {hostels.map(hostel => {
              const cap = hostel.capacity || 100;
              const occ = hostel.occupied_beds || 0;
              const perc = Math.min(Math.round((occ / cap) * 100), 100);
              return (
                <div key={hostel.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-200 light:text-slate-800">{hostel.name}</span>
                    <span className="text-slate-400 light:text-slate-600 font-mono">
                      {occ} / {cap} Beds ({perc}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 light:bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        perc > 90
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : perc > 70
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="border-b border-dark-border light:border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-bold font-heading text-slate-100 light:text-slate-900">
              Quick Admin Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <button
              onClick={() => onQuickAction('add-student')}
              className="p-5 rounded-xl bg-dark-hover light:bg-slate-50 hover:bg-blue-500/10 hover:border-blue-500/30 border border-dark-border light:border-slate-200 flex flex-col items-center justify-center gap-3 text-center transition-all group"
            >
              <Users className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">Add Resident</span>
            </button>

            <button
              onClick={() => onQuickAction('allocate-room')}
              className="p-5 rounded-xl bg-dark-hover light:bg-slate-50 hover:bg-purple-500/10 hover:border-purple-500/30 border border-dark-border light:border-slate-200 flex flex-col items-center justify-center gap-3 text-center transition-all group"
            >
              <KeyRound className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">Assign Room</span>
            </button>

            <button
              onClick={() => onQuickAction('record-fee')}
              className="p-5 rounded-xl bg-dark-hover light:bg-slate-50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-dark-border light:border-slate-200 flex flex-col items-center justify-center gap-3 text-center transition-all group"
            >
              <CreditCard className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">Collect Fee</span>
            </button>

            <button
              onClick={() => onQuickAction('log-complaint')}
              className="p-5 rounded-xl bg-dark-hover light:bg-slate-50 hover:bg-rose-500/10 hover:border-rose-500/30 border border-dark-border light:border-slate-200 flex flex-col items-center justify-center gap-3 text-center transition-all group"
            >
              <AlertCircle className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">Log Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
