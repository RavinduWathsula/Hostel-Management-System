import React, { useState } from 'react';
import { 
  UserPlus, Plus, Clock, LogOut, Phone, ShieldCheck, CheckCircle2, 
  Search, Filter, User, Sparkles, AlertCircle, FileText, ArrowRight
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StudentSearchSelect } from '../components/common/StudentSearchSelect';

export function VisitorsView({ visitors = [], students = [], onLogVisitor, onCheckoutVisitor, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  const [formData, setFormData] = useState({
    visitor_name: '',
    relation: '',
    student_id: '',
    phone: '',
    purpose: ''
  });

  const formatDateTime = (dateVal, timeVal, checkVal) => {
    if (checkVal && typeof checkVal === 'string' && checkVal.trim() !== '') {
      return checkVal.replace('T', ' ').substring(0, 16);
    }
    if (timeVal) {
      const d = dateVal ? dateVal.substring(0, 10) : '';
      const t = timeVal.substring(0, 5);
      return d ? `${d} ${t}` : t;
    }
    return null;
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  // Summary Metrics
  const totalVisitorsCount = visitors.length;
  const onPremisesCount = visitors.filter(v => {
    const checkOut = formatDateTime(v.visit_date, v.time_out, v.check_out_time);
    return !checkOut;
  }).length;
  const checkedOutCount = totalVisitorsCount - onPremisesCount;
  const todaysCount = visitors.filter(v => {
    const dateStr = (v.visit_date || v.created_at || '').substring(0, 10);
    return dateStr === todayStr;
  }).length;

  const query = (searchTerm || localSearch).toLowerCase().trim();
  const filteredVisitors = visitors.filter(v => {
    const checkOut = formatDateTime(v.visit_date, v.time_out, v.check_out_time);
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'OnPremises' ? !checkOut :
      statusFilter === 'CheckedOut' ? Boolean(checkOut) : true;

    if (!matchesStatus) return false;
    if (!query) return true;

    return (
      (v.visitor_name || '').toLowerCase().includes(query) ||
      (v.student_name || '').toLowerCase().includes(query) ||
      (v.admission_no || '').toLowerCase().includes(query) ||
      (v.phone || '').toLowerCase().includes(query) ||
      (v.relation || '').toLowerCase().includes(query) ||
      (v.purpose || '').toLowerCase().includes(query)
    );
  });

  const handleOpenModal = () => {
    setFormData({
      visitor_name: '',
      relation: '',
      student_id: '',
      phone: '',
      purpose: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.visitor_name || !formData.phone) {
      alert('Please fill in required fields: Guest Name and Phone Number.');
      return;
    }
    await onLogVisitor(formData);
    setIsModalOpen(false);
  };

  const quickPurposes = ['Parent Visit', 'Parcel Delivery', 'Medical Emergency', 'Outing Pickup'];

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Visitors Entry Log
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Real-time guest registration, security check-ins, and resident visitor management.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Log Guest Entry</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visitors */}
        <div 
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-amber-500/5 shadow-md shadow-amber-500/10'
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">Total Logs</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-slate-100 light:text-slate-900">{totalVisitorsCount}</span>
            <span className="text-xs font-medium text-slate-400 light:text-slate-500">Recorded Entry Logs</span>
          </div>
        </div>

        {/* On Premises */}
        <div 
          onClick={() => setStatusFilter('OnPremises')}
          className={`p-4 rounded-2xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'OnPremises'
              ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-amber-500/5 shadow-md shadow-amber-500/10'
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              On Premises
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-amber-400">{onPremisesCount}</span>
            <span className="text-xs font-medium text-amber-400/80">Active Guest Visits</span>
          </div>
        </div>

        {/* Checked Out */}
        <div 
          onClick={() => setStatusFilter('CheckedOut')}
          className={`p-4 rounded-2xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'CheckedOut'
              ? 'border-emerald-500/60 ring-1 ring-emerald-500/20 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">Checked Out</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-emerald-400">{checkedOutCount}</span>
            <span className="text-xs font-medium text-slate-400 light:text-slate-500">Departed Guests</span>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="p-4 rounded-2xl bg-dark-card light:bg-white border border-dark-border light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">Today's Visits</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-orange-400">{todaysCount}</span>
            <span className="text-xs font-medium text-slate-400 light:text-slate-500">Arrivals Today</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-dark-card/80 light:bg-slate-100 border border-dark-border light:border-slate-200 rounded-xl max-w-fit overflow-x-auto">
          {[
            { id: 'All', label: 'All Visitors', count: totalVisitorsCount },
            { id: 'OnPremises', label: 'Currently On Premises', count: onPremisesCount },
            { id: 'CheckedOut', label: 'Checked Out', count: checkedOutCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 light:bg-slate-200 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor name, phone, student..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Table Log View */}
      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 light:bg-slate-100 text-slate-400 light:text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Visitor Details</th>
                <th className="px-6 py-4">Resident Student Visiting</th>
                <th className="px-6 py-4">Relation / Purpose</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4 whitespace-nowrap">Check-In Time</th>
                <th className="px-6 py-4 whitespace-nowrap">Check-Out Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                    <p className="text-sm font-semibold">No visitor records matching your filter criteria.</p>
                    <button
                      onClick={handleOpenModal}
                      className="mt-3 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Log First Visitor Entry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredVisitors.map(v => {
                  const checkIn = formatDateTime(v.visit_date, v.time_in, v.check_in_time);
                  const checkOut = formatDateTime(v.visit_date, v.time_out, v.check_out_time);
                  const visitorId = v.id || v.visitor_id;
                  const isStillOnPremises = !checkOut;

                  return (
                    <tr key={visitorId} className="hover:bg-slate-800/40 light:hover:bg-slate-50/80 transition-colors">
                      {/* Visitor Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md shadow-amber-500/20 border border-amber-400/30">
                            {(v.visitor_name || 'V')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-100 light:text-slate-900">
                              {v.visitor_name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID #{visitorId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Resident Student */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300 light:text-slate-700">
                        {v.student_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6.5 h-6.5 rounded-md bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {v.student_name[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-200 light:text-slate-800">{v.student_name}</span>
                              <span className="text-[11px] font-mono text-slate-400 block">({v.admission_no || 'STU'})</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">General Visitor</span>
                        )}
                      </td>

                      {/* Relation & Purpose */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                              {v.relation || 'Guest'}
                            </span>
                          </div>
                          {v.purpose ? (
                            <div className="text-xs font-medium text-slate-200 light:text-slate-800 bg-slate-800/60 light:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-700/50 light:border-slate-200 mt-0.5 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="break-words">{v.purpose}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic pl-1">No purpose specified</span>
                          )}
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="px-6 py-4 text-xs font-mono">
                        <a 
                          href={`tel:${v.phone}`} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-input light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-amber-400 border border-dark-border light:border-slate-300 transition-colors font-bold"
                        >
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{v.phone}</span>
                        </a>
                      </td>

                      {/* Check-In Time */}
                      <td className="px-6 py-4 text-xs font-mono font-medium text-slate-300 light:text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          <span>{checkIn || 'Logged'}</span>
                        </div>
                      </td>

                      {/* Check-Out Status */}
                      <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                        {checkOut ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-slate-800/90 light:bg-slate-100 text-slate-300 light:text-slate-600 border border-slate-700 light:border-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{checkOut}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                            <span>Still On Premises</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isStillOnPremises ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCheckoutVisitor && visitorId) onCheckoutVisitor(visitorId);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Check Out
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold px-2 py-1 bg-slate-800/40 rounded-lg">
                            Session Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Visitor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Visitor Check-In"
        subtitle="Register visitor details, relation, and purpose of visit"
        icon={UserPlus}
        themeClass="from-amber-600 to-orange-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Guest Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Guest's Full Name"
                value={formData.visitor_name}
                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Relationship
              </label>
              <input
                type="text"
                placeholder="Father, Mother, Friend..."
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Resident Student Visiting
              </label>
              <StudentSearchSelect
                students={students}
                value={formData.student_id}
                onChange={(val) => setFormData({ ...formData, student_id: val })}
                placeholder="-- Type Student Name or Choose Resident --"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Guest Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Contact Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Purpose of Visit
            </label>
            <input
              type="text"
              placeholder="e.g. Parcel delivery, Outing pickup..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500 mb-2"
            />
            {/* Quick Purpose Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {quickPurposes.map(qp => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => setFormData({ ...formData, purpose: qp })}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  + {qp}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-semibold text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all"
            >
              Log Guest Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
