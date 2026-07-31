import React, { useState } from 'react';
import { CalendarDays, Plus, Check, X, Clock } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function LeavesView({ leaves = [], students = [], onRequestLeave, onUpdateLeaveStatus, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const todayStr = new Date().toLocaleDateString('sv');

  const query = searchTerm.toLowerCase().trim();
  const filteredLeaves = leaves.filter(l => {
    if (!query) return true;
    return (
      (l.student_name || '').toLowerCase().includes(query) ||
      (l.admission_no || '').toLowerCase().includes(query) ||
      (l.reason || '').toLowerCase().includes(query) ||
      (l.status || '').toLowerCase().includes(query)
    );
  });

  const [formData, setFormData] = useState({
    student_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    emergency_contact: ''
  });

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Leave Applications Workflow
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Review, approve, or reject student hostel leave applications.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Leave Request</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4 whitespace-nowrap">Leave Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 whitespace-nowrap">Emergency Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No leave applications matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(l => (
                  <tr key={l.id || l.leave_id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 light:text-slate-900">
                      {l.student_name} ({l.admission_no})
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300 light:text-slate-700 whitespace-nowrap">
                      {l.from_date?.substring(0, 10)} → {l.to_date?.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 light:text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-300 light:text-slate-700 whitespace-nowrap">
                      {l.emergency_contact || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                            : l.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {l.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const leaveId = l.id || l.leave_id;
                              if (onUpdateLeaveStatus && leaveId) onUpdateLeaveStatus(leaveId, 'Approved');
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
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
                            className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Leave Application"
        subtitle="Log student leave duration and destination reason"
        icon={CalendarDays}
        themeClass="from-purple-600 to-pink-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Resident Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Choose Student --</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>{st.full_name} ({st.admission_no})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={formData.from_date || todayStr}
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Family function, Semester break, Medical emergency..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              placeholder="Parent / Emergency Contact Number"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
            />
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-500/20"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
