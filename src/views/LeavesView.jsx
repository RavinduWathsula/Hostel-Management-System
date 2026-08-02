import React, { useState } from 'react';
import { 
  CalendarDays, Plus, Check, X, Clock, Search, Filter, 
  CheckCircle2, XCircle, AlertCircle, Phone, User, FileText, ArrowRight,
  Sparkles
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StudentSearchSelect } from '../components/common/StudentSearchSelect';

export function LeavesView({ leaves = [], students = [], onRequestLeave, onUpdateLeaveStatus, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  
  const todayStr = new Date().toLocaleDateString('sv');

  // Stats calculation
  const totalCount = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  const query = (localSearch || searchTerm).toLowerCase().trim();
  
  const filteredLeaves = leaves.filter(l => {
    // Status filter
    if (statusFilter !== 'All' && l.status !== statusFilter) {
      return false;
    }
    // Search query filter
    if (!query) return true;
    return (
      (l.student_name || '').toLowerCase().includes(query) ||
      (l.admission_no || '').toLowerCase().includes(query) ||
      (l.reason || '').toLowerCase().includes(query) ||
      (l.status || '').toLowerCase().includes(query) ||
      (l.emergency_contact || '').toLowerCase().includes(query)
    );
  });

  const [formData, setFormData] = useState({
    student_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    emergency_contact: ''
  });

  const handleStudentChange = (studentId) => {
    setFormData(prev => ({
      ...prev,
      student_id: studentId
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      student_id: '',
      from_date: '',
      to_date: '',
      reason: '',
      emergency_contact: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.from_date || !formData.to_date || !formData.reason) {
      alert('Please fill in all required fields including student, dates, and reason.');
      return;
    }
    await onRequestLeave(formData);
    setIsModalOpen(false);
  };

  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return null;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end.getTime() - start.getTime();
    if (isNaN(diffTime)) return null;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? `${diffDays} ${diffDays === 1 ? 'day' : 'days'}` : '1 day';
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dark-border/40 light:border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
              Leave Applications Workflow
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Review, approve, or reject student hostel leave requests with ease.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Leave Request</span>
        </button>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'All' 
              ? 'border-blue-500/60 ring-1 ring-blue-500/20 bg-blue-500/5' 
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 light:text-slate-500 uppercase tracking-wider">Total Requests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 light:text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400 light:text-slate-500">All time</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'Pending' 
              ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-amber-500/5' 
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 light:text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-xs text-slate-400 light:text-slate-500">Requires action</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Approved')}
          className={`p-4 rounded-xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'Approved' 
              ? 'border-emerald-500/60 ring-1 ring-emerald-500/20 bg-emerald-500/5' 
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 light:text-slate-500 uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-slate-400 light:text-slate-500">Granted</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Rejected')}
          className={`p-4 rounded-xl bg-dark-card light:bg-white border transition-all cursor-pointer ${
            statusFilter === 'Rejected' 
              ? 'border-rose-500/60 ring-1 ring-rose-500/20 bg-rose-500/5' 
              : 'border-dark-border light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 light:text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400">{rejectedCount}</span>
            <span className="text-xs text-slate-400 light:text-slate-500">Declined</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-dark-card/80 light:bg-slate-100 border border-dark-border light:border-slate-200 rounded-xl max-w-fit overflow-x-auto">
          {[
            { id: 'All', label: 'All', count: totalCount },
            { id: 'Pending', label: 'Pending', count: pendingCount },
            { id: 'Approved', label: 'Approved', count: approvedCount },
            { id: 'Rejected', label: 'Rejected', count: rejectedCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                statusFilter === tab.id
                  ? 'bg-blue-700/60 text-white'
                  : 'bg-dark-hover light:bg-slate-200/60 text-slate-400 light:text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 light:text-slate-500" />
          <input
            type="text"
            placeholder="Search by student name, ID, or reason..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-xl text-xs text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/50 light:bg-slate-50 text-slate-400 light:text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Leave Duration</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Emergency Contact</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60 light:divide-slate-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400 light:text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-800/50 light:bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-300 light:text-slate-700">No leave applications found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {statusFilter !== 'All' 
                          ? `No applications matching status "${statusFilter}".` 
                          : 'Try refining your search terms or create a new leave application.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(l => {
                  const durationStr = calculateDays(l.from_date, l.to_date);
                  return (
                    <tr key={l.id || l.leave_id} className="hover:bg-dark-hover/50 light:hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                            {getInitials(l.student_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 light:text-slate-900 text-sm">
                              {l.student_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 light:text-slate-500">
                              {l.admission_no}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-slate-200 light:text-slate-800 font-medium text-xs">
                            <span>{l.from_date?.substring(0, 10)}</span>
                            <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{l.to_date?.substring(0, 10)}</span>
                          </div>
                          {durationStr && (
                            <span className="text-[10px] text-slate-400 light:text-slate-500 mt-0.5">
                              {durationStr}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="text-xs text-slate-300 light:text-slate-700 line-clamp-2" title={l.reason}>
                          {l.reason}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {l.emergency_contact && l.emergency_contact !== 'N/A' ? (
                          <a 
                            href={`tel:${l.emergency_contact}`} 
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 light:text-slate-700 hover:text-blue-400 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-blue-400" />
                            <span>{l.emergency_contact}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Not provided</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            l.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : l.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            l.status === 'Approved' ? 'bg-emerald-400' : l.status === 'Rejected' ? 'bg-rose-400' : 'bg-amber-400'
                          }`} />
                          {l.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {l.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const leaveId = l.id || l.leave_id;
                                if (onUpdateLeaveStatus && leaveId) onUpdateLeaveStatus(leaveId, 'Approved');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 font-medium text-xs transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const leaveId = l.id || l.leave_id;
                                if (onUpdateLeaveStatus && leaveId) onUpdateLeaveStatus(leaveId, 'Rejected');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-medium text-xs transition-all flex items-center gap-1 shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Completed</span>
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

      {/* Modal for Leave Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Leave Application"
        subtitle="Submit a student leave request for hostel warden review"
        icon={CalendarDays}
        themeClass="from-blue-600 to-indigo-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Resident Student <span className="text-rose-500">*</span>
            </label>
            <StudentSearchSelect
              students={students}
              value={formData.student_id}
              onChange={(val) => handleStudentChange(val)}
              required
              placeholder="-- Type Student Name or Select Resident --"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={formData.from_date || todayStr}
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="Provide specific reason (e.g. Home visit, Medical emergency, Semester break)..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {/* Quick Reason Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Home Visit', 'Medical Emergency', 'Semester Break', 'Family Function'].map(suggestion => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setFormData(prev => ({ ...prev, reason: suggestion }))}
                  className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-[11px] font-medium transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 0771234567 (Parent / Guardian phone)"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className="w-full px-3.5 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 font-medium text-xs hover:bg-slate-700 light:hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-500/25 transition-all"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

