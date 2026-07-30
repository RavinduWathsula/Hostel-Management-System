import React, { useState } from 'react';
import { Building2, Plus, BedDouble, Users, Home, DollarSign, Eye, CheckCircle2, Phone, Sparkles, User, Info, Heart } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function RoomsView({ hostels = [], rooms = [], students = [], allocations = [], onAddRoom, onAddHostel }) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const getHostelId = (h) => h.hostel_id || h.id;
  const getHostelName = (h) => h.hostel_name || h.name || `Hostel ${getHostelId(h)}`;
  const getHostelType = (h) => h.hostel_type || h.gender_type || h.type || 'Girls';

  const getRoomId = (r) => r.room_id || r.id;
  const getRoomCapacity = (r) => Number(r.capacity || 2);
  const getRoomOccupied = (r) => Number(r.occupied_seats ?? r.occupied_beds ?? r.occupied ?? 0);
  const getRoomRent = (r) => Number(r.monthly_rent || r.rent || 0);

  // Default to Girls Hostel if available, otherwise first hostel
  const [selectedHostelId, setSelectedHostelId] = useState(() => {
    const girlsHostel = hostels.find(h => 
      (h.hostel_type && h.hostel_type.toLowerCase() === 'girls') ||
      (h.hostel_name && h.hostel_name.toLowerCase().includes('girls')) ||
      (h.hostel_name && h.hostel_name.toLowerCase().includes('south'))
    );
    if (girlsHostel) return getHostelId(girlsHostel);
    return hostels.length > 0 ? getHostelId(hostels[0]) : '';
  });

  const activeHostelId = selectedHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : null);
  const activeHostelObj = hostels.find(h => String(getHostelId(h)) === String(activeHostelId)) || hostels[0];

  const filteredRooms = activeHostelId
    ? rooms.filter(r => String(r.hostel_id) === String(activeHostelId))
    : rooms;

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Form State for Adding Room
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    hostel_id: activeHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : 1),
    capacity: 2,
    floor_number: 1,
    room_type: 'Double',
    monthly_rent: 8000
  });

  const [hostelForm, setHostelForm] = useState({
    hostel_name: '',
    hostel_type: 'Girls',
    capacity: 100
  });

  const handleOpenAddRoomModal = () => {
    const currentHostelId = activeHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : 1);
    setRoomForm({
      room_number: '',
      hostel_id: currentHostelId,
      capacity: 2,
      floor_number: 1,
      room_type: 'Double',
      monthly_rent: 8000
    });
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const finalHostelId = roomForm.hostel_id || activeHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : 1);
    if (!roomForm.room_number) {
      alert('Please enter a room number');
      return;
    }
    const payload = {
      ...roomForm,
      hostel_id: Number(finalHostelId)
    };
    const res = await onAddRoom(payload);
    if (res && res.success === false) {
      alert(res.error || 'Failed to add room');
      return;
    }
    setIsRoomModalOpen(false);
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    if (!hostelForm.hostel_name) return;
    await onAddHostel(hostelForm);
    setIsHostelModalOpen(false);
    setHostelForm({ hostel_name: '', hostel_type: 'Girls', capacity: 100 });
  };

  return (
    <div className="space-y-8 animate-fade-in font-body">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            {activeHostelObj ? getHostelName(activeHostelObj) : 'Hostel'} Room Inventory
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Click any room card to inspect detailed resident allocations, bed status, and monthly rental fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddRoomModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Hostel Tab Switcher */}
      {hostels.length > 1 && (
        <div className="flex border-b border-dark-border light:border-slate-200 gap-8 overflow-x-auto">
          {hostels.map(hostel => {
            const hId = getHostelId(hostel);
            const isActive = String(activeHostelId) === String(hId);
            return (
              <button
                key={hId}
                onClick={() => setSelectedHostelId(hId)}
                className={`pb-4 px-1 text-base font-bold font-heading transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                {getHostelName(hostel)} ({getHostelType(hostel)})
              </button>
            );
          })}
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 light:text-slate-500 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-500" />
            <p className="text-base font-semibold">No room records found for this hostel.</p>
            <button
              onClick={handleOpenAddRoomModal}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Create First Room
            </button>
          </div>
        ) : (
          filteredRooms.map(room => {
            const roomId = getRoomId(room);
            const capacity = getRoomCapacity(room);
            const occupied = getRoomOccupied(room);
            const freeBeds = Math.max(0, capacity - occupied);
            const isFull = freeBeds === 0;

            return (
              <div
                key={roomId}
                onClick={() => setSelectedRoom(room)}
                className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 light:text-slate-500">
                      Floor {room.floor_number || 1} • {room.room_type || 'Standard'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        isFull
                          ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isFull ? 'Fully Occupied' : `${freeBeds} Beds Free`}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold font-heading text-slate-100 light:text-slate-900 mb-2 group-hover:text-purple-400 transition-colors flex items-center justify-between">
                    <span>Room {room.room_number}</span>
                    <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
                  </h3>

                  {/* Bed Indicator Dots */}
                  <div className="flex items-center gap-2 mb-4">
                    {Array.from({ length: capacity }).map((_, idx) => {
                      const isOccupied = idx < occupied;
                      return (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                            isOccupied
                              ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-transparent text-white shadow-sm'
                              : 'bg-dark-input light:bg-slate-100 border-dark-border light:border-slate-300 text-slate-400'
                          }`}
                          title={isOccupied ? `Bed ${idx + 1}: Occupied` : `Bed ${idx + 1}: Available`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  {/* Room Rent & Footer */}
                  <div className="border-t border-dark-border light:border-slate-200 pt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400 light:text-slate-500 font-medium">Monthly Rent</span>
                    <span className="text-base font-extrabold font-mono text-slate-100 light:text-slate-900">
                      {formatLKR(getRoomRent(room))}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 text-[11px] font-bold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1 bg-purple-500/10 rounded-lg py-1 border border-purple-500/20">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Click to View Room Details & Residents</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ROOM DETAILS MODAL */}
      {selectedRoom && (
        <Modal
          isOpen={Boolean(selectedRoom)}
          onClose={() => setSelectedRoom(null)}
          title={`Room ${selectedRoom.room_number} Details & Resident List`}
          subtitle={`${selectedRoom.hostel_name || 'Girls Hostel'} • Floor ${selectedRoom.floor_number || 1} • ${selectedRoom.room_type || 'Standard Room'}`}
          icon={BedDouble}
          themeClass="from-pink-600 via-purple-600 to-indigo-600"
        >
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-dark-input light:bg-slate-100 rounded-xl border border-dark-border light:border-slate-200 text-center">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Total Capacity</span>
                <span className="text-lg font-bold text-slate-100 light:text-slate-900">{getRoomCapacity(selectedRoom)} Beds</span>
              </div>
              <div className="p-3 bg-dark-input light:bg-slate-100 rounded-xl border border-dark-border light:border-slate-200 text-center">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Occupied</span>
                <span className="text-lg font-bold text-purple-400">{getRoomOccupied(selectedRoom)} Occupied</span>
              </div>
              <div className="p-3 bg-dark-input light:bg-slate-100 rounded-xl border border-dark-border light:border-slate-200 text-center">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Available</span>
                <span className="text-lg font-bold text-emerald-400">{Math.max(0, getRoomCapacity(selectedRoom) - getRoomOccupied(selectedRoom))} Free</span>
              </div>
              <div className="p-3 bg-dark-input light:bg-slate-100 rounded-xl border border-dark-border light:border-slate-200 text-center">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Monthly Rent</span>
                <span className="text-sm font-extrabold font-mono text-purple-400">{formatLKR(getRoomRent(selectedRoom))}</span>
              </div>
            </div>

            {/* Resident Bed Allocation List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Bed Allocation & Assigned Residents</span>
              </h4>

              <div className="space-y-3">
                {Array.from({ length: getRoomCapacity(selectedRoom) }).map((_, idx) => {
                  const bedNum = idx + 1;
                  const roomAllocated = allocations.filter(a => String(a.room_id) === String(getRoomId(selectedRoom)) && a.status === 'Active');
                  const allocation = roomAllocated.find(a => Number(a.bed_number) === bedNum) || roomAllocated[idx];
                  const student = allocation ? students.find(s => String(s.student_id || s.id) === String(allocation.student_id)) : null;

                  return (
                    <div
                      key={bedNum}
                      className="p-4 bg-dark-card light:bg-slate-50 border border-dark-border light:border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                          allocation
                            ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-md'
                            : 'bg-dark-input light:bg-slate-200 text-slate-400 border border-dark-border light:border-slate-300'
                        }`}>
                          B{bedNum}
                        </div>

                        <div>
                          {allocation || student ? (
                            <div>
                              <div className="font-bold text-sm text-slate-100 light:text-slate-900 flex items-center gap-2">
                                <span>{allocation?.student_name || student?.full_name || 'Resident Assigned'}</span>
                                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                                  {student?.gender || 'Female'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 light:text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                                <span>ID: <strong className="text-slate-300 light:text-slate-700">{allocation?.admission_no || student?.admission_no || 'STU'}</strong></span>
                                {student?.course && <span>• {student.course}</span>}
                                {student?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-purple-400" />{student.phone}</span>}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Vacant Bed Available
                              </span>
                              <span className="text-xs text-slate-500 block mt-0.5">Ready for resident room allocation</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {allocation ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Occupied
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Features & Amenities */}
            <div className="p-4 bg-dark-input/50 light:bg-slate-100 rounded-2xl border border-dark-border light:border-slate-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Girls Hostel Room Amenities</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium text-slate-300 light:text-slate-700">
                <div className="flex items-center gap-1.5">✓ High-Speed Wi-Fi</div>
                <div className="flex items-center gap-1.5">✓ Individual Study Desk</div>
                <div className="flex items-center gap-1.5">✓ Wardrobe & Storage Locker</div>
                <div className="flex items-center gap-1.5">✓ 24/7 Security Entry</div>
                <div className="flex items-center gap-1.5">✓ Housekeeping & Sanitation</div>
                <div className="flex items-center gap-1.5">✓ Ceiling Fan & Ventilation</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-dark-border light:border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-200 light:text-slate-800 font-bold text-sm hover:bg-slate-700 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD ROOM MODAL */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title="Add New Room"
        subtitle="Specify room number, capacity, floor, and monthly rental rate"
        icon={BedDouble}
        themeClass="from-purple-600 to-indigo-600"
      >
        <form onSubmit={handleRoomSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 104"
                value={roomForm.room_number}
                onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Select Hostel Block <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={roomForm.hostel_id}
                onChange={(e) => setRoomForm({ ...roomForm, hostel_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              >
                {hostels.map(h => (
                  <option key={getHostelId(h)} value={getHostelId(h)}>
                    {getHostelName(h)} ({getHostelType(h)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Bed Capacity
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Floor Number
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={roomForm.floor_number}
                onChange={(e) => setRoomForm({ ...roomForm, floor_number: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Room Type
              </label>
              <select
                value={roomForm.room_type}
                onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Deluxe">Deluxe Suite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Monthly Rental Rate (LKR)
            </label>
            <input
              type="number"
              step="500"
              value={roomForm.monthly_rent}
              onChange={(e) => setRoomForm({ ...roomForm, monthly_rent: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-semibold text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-500/20"
            >
              Create Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
