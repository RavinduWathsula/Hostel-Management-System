import React, { useState } from 'react';
import { AlertCircle, Plus, CheckCircle, Clock, Wrench } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function ComplaintsView({ complaints = [], students = [], onLogComplaint, onUpdateComplaintStatus, onUpdateComplaintPriority, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    category: 'Maintenance',
    title: '',
    description: '',
    priority: 'Medium'
  });

  const query = searchTerm.toLowerCase().trim();
  const filteredComplaints = complaints.filter(c => {
    if (!query) return true;
    return (
      (c.student_name || '').toLowerCase().includes(query) ||
      (c.category || '').toLowerCase().includes(query) ||
      (c.title || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.status || '').toLowerCase().includes(query) ||
      (c.priority || '').toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    await onLogComplaint(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Complaints & Maintenance Desk
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Track student issues, maintenance work orders, and resolution status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Log New Complaint</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Complaint Details</th>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No complaints matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => {
                  const rawPriority = c.priority || 'Medium';
                  const normPriority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase();
                  
                  const isHighPriority = normPriority === 'High' || normPriority === 'Urgent';
                  const isMediumPriority = normPriority === 'Medium';
                  
                  const rawStatus = c.status || 'Open';
                  const displayStatus = (rawStatus === 'Pending' || rawStatus === 'Open') ? 'Open' : rawStatus;

                  return (
                    <tr key={c.id || c.complaint_id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100 light:text-slate-900">{c.title || c.category || 'Complaint'}</div>
                        <div className="text-xs text-slate-400 light:text-slate-500 line-clamp-1 mt-0.5">{c.description || 'No description provided'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300 light:text-slate-700">
                        {c.student_name || 'Anonymous Resident'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 whitespace-nowrap shadow-sm">
                          {c.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={normPriority}
                          onChange={(e) => {
                            if (onUpdateComplaintPriority) {
                              onUpdateComplaintPriority(c.id || c.complaint_id, e.target.value);
                            }
                          }}
                          className={`px-3 py-1 text-xs font-extrabold rounded-full whitespace-nowrap shadow-sm border focus:outline-none cursor-pointer transition-all ${
                            isHighPriority
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                              : isMediumPriority
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          }`}
                        >
                          <option value="Low" className="bg-slate-900 light:bg-white text-slate-100 light:text-slate-900 font-semibold">Low</option>
                          <option value="Medium" className="bg-slate-900 light:bg-white text-slate-100 light:text-slate-900 font-semibold">Medium</option>
                          <option value="High" className="bg-slate-900 light:bg-white text-slate-100 light:text-slate-900 font-semibold">High</option>
                          <option value="Urgent" className="bg-slate-900 light:bg-white text-slate-100 light:text-slate-900 font-semibold">Urgent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-extrabold rounded-full whitespace-nowrap shadow-sm ${
                            displayStatus === 'Resolved'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : displayStatus === 'In Progress'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={displayStatus}
                          onChange={(e) => onUpdateComplaintStatus(c.id || c.complaint_id, e.target.value)}
                          className="px-3 py-1.5 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 font-bold focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
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
        title="Log Complaint / Maintenance Ticket"
        subtitle="Submit resident issues or hostel facility repair requests"
        icon={AlertCircle}
        themeClass="from-rose-600 to-orange-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Resident (Optional)
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-rose-500"
            >
              <option value="">-- General / Facility Issue --</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>{st.full_name} ({st.admission_no})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-rose-500"
              >
                <option value="Maintenance">Maintenance & Plumbing</option>
                <option value="Electrical">Electrical / Lighting</option>
                <option value="Internet">Internet / Wi-Fi</option>
                <option value="Cleanliness">Cleanliness & Hygiene</option>
                <option value="Security">Security & Lock</option>
                <option value="Other">Other Request</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-rose-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Water leak in Room 102 bathroom"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Detailed Description
            </label>
            <textarea
              rows="3"
              placeholder="Describe the issue or exact location..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-rose-500"
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-md shadow-rose-500/20"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
