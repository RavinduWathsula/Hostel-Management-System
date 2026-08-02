import React, { useState } from 'react';
import { UserPlus, Plus, Clock, LogOut, Phone, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StudentSearchSelect } from '../components/common/StudentSearchSelect';

export function VisitorsView({ visitors = [], students = [], onLogVisitor, onCheckoutVisitor, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    relation: '',
    student_id: '',
    phone: '',
    purpose: ''
  });

  const query = searchTerm.toLowerCase().trim();
  const filteredVisitors = visitors.filter(v => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Visitors Entry Log
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Track guest check-ins, security logs, and resident visitor history.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Guest Entry</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Visitor Name</th>
                <th className="px-6 py-4">Visiting Student</th>
                <th className="px-6 py-4">Relation / Purpose</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 whitespace-nowrap">Check-In</th>
                <th className="px-6 py-4 whitespace-nowrap">Check-Out</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No visitor logs matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map(v => {
                  const checkIn = formatDateTime(v.visit_date, v.time_in, v.check_in_time);
                  const checkOut = formatDateTime(v.visit_date, v.time_out, v.check_out_time);
                  const visitorId = v.id || v.visitor_id;

                  return (
                    <tr key={visitorId} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100 light:text-slate-900">
                        {v.visitor_name}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300 light:text-slate-700">
                        {v.student_name ? `${v.student_name} (${v.admission_no || ''})` : 'General Visitor'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-200 light:text-slate-800">{v.relation || 'Guest'}</div>
                        {v.purpose && <div className="text-xs text-slate-400 light:text-slate-500">{v.purpose}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300 light:text-slate-700">
                        {v.phone}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300 light:text-slate-700 whitespace-nowrap">
                        {checkIn || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                        {checkOut ? (
                          <span className="text-slate-400 light:text-slate-600">
                            {checkOut}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                            Still On Premises
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {!checkOut && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCheckoutVisitor && visitorId) onCheckoutVisitor(visitorId);
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Check Out
                          </button>
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
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-amber-500"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md shadow-amber-500/20"
            >
              Log Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
