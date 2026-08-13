import React, { useState } from 'react';
import { Bookmark, Plus, Calendar, CheckCircle2, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function BookingsView({ bookings = [], onApplyBooking, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    applicant_name: '',
    phone: '',
    email: '',
    gender: 'Female',
    preferred_room_type: 'Double Sharing',
    expected_date: new Date().toISOString().substring(0, 10),
    special_notes: ''
  });

  const query = searchTerm.toLowerCase().trim();
  const filteredBookings = bookings.filter(b => {
    if (!query) return true;
    return (
      (b.applicant_name || '').toLowerCase().includes(query) ||
      (b.phone || '').toLowerCase().includes(query) ||
      (b.email || '').toLowerCase().includes(query) ||
      (b.preferred_room_type || '').toLowerCase().includes(query) ||
      (b.status || '').toLowerCase().includes(query)
    );
  });

  const handleOpenModal = () => {
    setErrorMsg('');
    setFormData({
      applicant_name: '',
      phone: '',
      email: '',
      gender: 'Female',
      preferred_room_type: 'Double Sharing',
      expected_date: new Date().toISOString().substring(0, 10),
      special_notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.applicant_name || !formData.phone) {
      setErrorMsg('Name and Phone are required fields.');
      return;
    }

    try {
      const res = await onApplyBooking({
        ...formData,
        id: Date.now(), // Generate a simple unique ID for local tracking
        status: 'Pending',
        created_at: new Date().toISOString()
      });

      if (res && res.success === false) {
        setErrorMsg(res.error || 'Application failed');
        return;
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Application request failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Room Bookings
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Apply for a room and track your booking application status.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Apply for Booking</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Preferences</th>
                <th className="px-6 py-4">Expected Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No booking applications found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100 light:text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                          {(b.applicant_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{b.applicant_name || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-400 light:text-slate-500 font-normal uppercase tracking-wider">
                            {b.gender || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 light:text-slate-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs">{b.phone}</span>
                      </div>
                      {b.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{b.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold font-mono text-xs border border-indigo-500/20">
                        {b.preferred_room_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-300 light:text-slate-700">
                      {b.expected_date ? b.expected_date.substring(0, 10) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : b.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> {b.status}
                        </span>
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
        title="Apply for Room Booking"
        subtitle="Submit your details to reserve a room."
        icon={Bookmark}
        themeClass="from-blue-600 to-indigo-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-500">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Applicant Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={formData.applicant_name}
                onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all"
                placeholder="e.g. Kaveesha Fernando"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                Preferred Room Type
              </label>
              <select
                value={formData.preferred_room_type}
                onChange={(e) => setFormData({ ...formData, preferred_room_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all"
              >
                <option value="Single Room">Single Room</option>
                <option value="Double Sharing">Double Sharing</option>
                <option value="Triple Sharing">Triple Sharing</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Expected Move-in Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="date"
                value={formData.expected_date}
                onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all [color-scheme:dark] light:[color-scheme:light]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Special Notes (Optional)
            </label>
            <textarea
              value={formData.special_notes}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              className="w-full px-4 py-3 bg-dark-hover light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-100 light:text-slate-900 transition-all min-h-[80px]"
              placeholder="Any specific requests?"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
