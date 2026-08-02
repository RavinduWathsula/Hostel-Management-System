import React, { useState } from 'react';
import { KeyRound, Plus, Building2, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function AllocationsView({ allocations = [], students = [], hostels = [], rooms = [], onAllocateRoom, searchTerm = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const query = searchTerm.toLowerCase().trim();
  const filteredAllocations = allocations.filter(a => {
    if (!query) return true;
    return (
      (a.student_name || '').toLowerCase().includes(query) ||
      (a.admission_no || '').toLowerCase().includes(query) ||
      (a.hostel_name || '').toLowerCase().includes(query) ||
      String(a.room_number || '').toLowerCase().includes(query) ||
      (a.status || '').toLowerCase().includes(query)
    );
  });

  const getStudentId = (s) => s.student_id || s.id;
  const getStudentName = (s) => s.full_name || s.name || `Student ${getStudentId(s)}`;

  const getHostelId = (h) => h.hostel_id || h.id;
  const getHostelName = (h) => h.hostel_name || h.name || `Hostel ${getHostelId(h)}`;

  const getRoomId = (r) => r.room_id || r.id;
  const getRoomNumber = (r) => r.room_number || r.number || getRoomId(r);

  const initialHostelId = hostels.length > 0 ? getHostelId(hostels[0]) : '';

  const [formData, setFormData] = useState({
    student_id: '',
    hostel_id: initialHostelId,
    room_id: '',
    bed_number: 1,
    allocated_from: new Date().toISOString().substring(0, 10)
  });

  const handleOpenModal = () => {
    setErrorMsg('');
    const firstHId = hostels.length > 0 ? getHostelId(hostels[0]) : '';
    const hRooms = rooms.filter(r => String(r.hostel_id) === String(firstHId));
    const firstRId = hRooms.length > 0 ? getRoomId(hRooms[0]) : (rooms.length > 0 ? getRoomId(rooms[0]) : '');

    setFormData({
      student_id: '',
      hostel_id: firstHId,
      room_id: firstRId,
      bed_number: 1,
      allocated_from: new Date().toISOString().substring(0, 10)
    });
    setIsModalOpen(true);
  };

  const availableRooms = formData.hostel_id
    ? rooms.filter(r => String(r.hostel_id) === String(formData.hostel_id))
    : rooms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.student_id) {
      setErrorMsg('Please select a resident student.');
      return;
    }

    const roomIdToUse = formData.room_id || (availableRooms.length > 0 ? getRoomId(availableRooms[0]) : '');
    if (!roomIdToUse) {
      setErrorMsg('Please select a room to allocate.');
      return;
    }

    try {
      const res = await onAllocateRoom({
        student_id: Number(formData.student_id),
        room_id: Number(roomIdToUse),
        bed_number: Number(formData.bed_number || 1),
        allocated_from: formData.allocated_from
      });

      if (res && res.success === false) {
        setErrorMsg(res.error || 'Allocation failed');
        return;
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Allocation request failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Room Allocations
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Assign rooms and bed spots to registered students.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate New Room</span>
        </button>
      </div>

      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Hostel</th>
                <th className="px-6 py-4">Room & Bed</th>
                <th className="px-6 py-4">Allocation Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No active room allocations matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map(acc => {
                  const rawDate = acc.allocated_date || acc.allocated_from || acc.created_at;
                  const formattedDate = rawDate ? String(rawDate).substring(0, 10) : new Date().toISOString().substring(0, 10);
                  const studentObj = students.find(s => String(s.student_id || s.id) === String(acc.student_id));
                  const currentStatus = acc.student_status || (studentObj ? studentObj.status : null) || acc.status || 'Active';

                  return (
                    <tr key={acc.allocation_id || acc.id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100 light:text-slate-900">
                        {acc.student_name} ({acc.admission_no})
                      </td>
                      <td className="px-6 py-4 text-slate-300 light:text-slate-700">
                        {acc.hostel_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold font-mono text-xs border border-blue-500/20">
                          Room {acc.room_number} • Bed {acc.bed_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-300 light:text-slate-700">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4">
                        {currentStatus === 'Suspended' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : currentStatus === 'Vacated' || currentStatus === 'Inactive' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3.5 h-3.5" /> {currentStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Room & Bed"
        subtitle="Select a registered student and assign an available room"
        icon={KeyRound}
        themeClass="from-emerald-600 to-teal-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Choose Student --</option>
              {students.length === 0 && <option value="" disabled>No students available</option>}
              {students.map(st => {
                const sId = getStudentId(st);
                const isSuspended = st.status === 'Suspended';
                return (
                  <option key={sId} value={sId} disabled={isSuspended}>
                    {getStudentName(st)} ({st.admission_no || sId}) {isSuspended ? '⚠️ [SUSPENDED]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Select Hostel <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.hostel_id}
                onChange={(e) => {
                  const hId = e.target.value;
                  const hRooms = rooms.filter(r => String(r.hostel_id) === String(hId));
                  const firstRId = hRooms.length > 0 ? getRoomId(hRooms[0]) : '';
                  setFormData({ ...formData, hostel_id: hId, room_id: firstRId });
                }}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                {hostels.map(h => {
                  const hId = getHostelId(h);
                  return (
                    <option key={hId} value={hId}>
                      {getHostelName(h)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Select Room <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                {availableRooms.length === 0 && <option value="">No rooms available for this hostel</option>}
                {availableRooms.map(r => {
                  const rId = getRoomId(r);
                  return (
                    <option key={rId} value={rId}>
                      Room {getRoomNumber(r)} ({r.occupied_seats || 0}/{r.capacity || 2} beds occupied)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Select Bed Spot Number
              </label>
              <select
                value={formData.bed_number}
                onChange={(e) => setFormData({ ...formData, bed_number: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {(() => {
                  const selRoom = rooms.find(r => String(getRoomId(r)) === String(formData.room_id));
                  const cap = selRoom ? Number(selRoom.capacity || 2) : 2;
                  const occBeds = allocations
                    .filter(a => String(a.room_id) === String(formData.room_id) && a.status === 'Active')
                    .map(a => Number(a.bed_number));
                  return Array.from({ length: cap }, (_, i) => i + 1).map(b => {
                    const isOcc = occBeds.includes(b);
                    return (
                      <option key={b} value={b} disabled={isOcc}>
                        Bed Spot {b} {isOcc ? '(Occupied)' : '(Available)'}
                      </option>
                    );
                  });
                })()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Allocation Date
              </label>
              <input
                type="date"
                value={formData.allocated_from}
                onChange={(e) => setFormData({ ...formData, allocated_from: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500"
              />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20"
            >
              Assign Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
