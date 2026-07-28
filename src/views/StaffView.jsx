import React, { useState } from 'react';
import { UserCheck, Plus, Phone, Mail, DollarSign, Building } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function StaffView({ staff = [], hostels = [], onAddStaff }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'Warden',
    hostel_id: hostels.length > 0 ? hostels[0].id : '',
    phone: '',
    email: '',
    salary: '',
    status: 'Active'
  });

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) return;
    await onAddStaff(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Staff Directory
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Hostel wardens, security personnel, maintenance crew, and administration staff.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Hostel Assigned</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No staff members registered.
                  </td>
                </tr>
              ) : (
                staff.map(s => (
                  <tr key={s.id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 light:text-slate-900">
                      {s.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300 light:text-slate-700">
                      {s.hostel_name || 'All Hostels'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-200 light:text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                      </div>
                      {s.email && (
                        <div className="text-xs text-slate-400 light:text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-200 light:text-slate-800">
                      {formatLKR(s.salary)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {s.status || 'Active'}
                      </span>
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
        title="Add Staff Member"
        subtitle="Register wardens, security, and maintenance personnel"
        icon={UserCheck}
        themeClass="from-teal-600 to-cyan-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Staff Member Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Role / Designation
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="Warden">Hostel Warden</option>
                <option value="Assistant Warden">Assistant Warden</option>
                <option value="Security Officer">Security Officer</option>
                <option value="Maintenance Technician">Maintenance Technician</option>
                <option value="Janitor / Cleaner">Janitor / Cleaner</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Assigned Hostel
              </label>
              <select
                value={formData.hostel_id}
                onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="">All Hostels</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Mobile Contact"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Official Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Monthly Salary (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="45000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
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
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md shadow-teal-500/20"
            >
              Register Staff
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
