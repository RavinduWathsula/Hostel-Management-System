import React, { useState } from 'react';
import { Building2, Plus, BedDouble, Users, Home, DollarSign } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function RoomsView({ hostels = [], rooms = [], onAddRoom, onAddHostel }) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);

  const getHostelId = (h) => h.hostel_id || h.id;
  const getHostelName = (h) => h.hostel_name || h.name || `Hostel ${getHostelId(h)}`;
  const getHostelType = (h) => h.hostel_type || h.gender_type || h.type || 'General';

  const getRoomId = (r) => r.room_id || r.id;
  const getRoomCapacity = (r) => Number(r.capacity || 2);
  const getRoomOccupied = (r) => Number(r.occupied_seats ?? r.occupied_beds ?? r.occupied ?? 0);
  const getRoomRent = (r) => Number(r.monthly_rent || r.rent || 0);

  const [selectedHostelId, setSelectedHostelId] = useState(() => {
    return hostels.length > 0 ? getHostelId(hostels[0]) : '';
  });

  const activeHostelId = selectedHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : null);

  const filteredRooms = activeHostelId
    ? rooms.filter(r => String(r.hostel_id) === String(activeHostelId))
    : rooms;

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Form States
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    hostel_id: activeHostelId || (hostels.length > 0 ? getHostelId(hostels[0]) : ''),
    capacity: 2,
    floor_number: 1,
    room_type: 'Double',
    monthly_rent: 8000
  });

  const [hostelForm, setHostelForm] = useState({
    hostel_name: '',
    hostel_type: 'Boys',
    capacity: 100
  });

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.room_number || !roomForm.hostel_id) return;
    await onAddRoom(roomForm);
    setIsRoomModalOpen(false);
    setRoomForm({ ...roomForm, room_number: '' });
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    if (!hostelForm.hostel_name) return;
    await onAddHostel(hostelForm);
    setIsHostelModalOpen(false);
    setHostelForm({ hostel_name: '', hostel_type: 'Boys', capacity: 100 });
  };

  return (
    <div className="space-y-8 animate-fade-in font-body">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Hostels & Room Inventory
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Explore room layouts, bed availability, and manage hostel structures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsHostelModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-200 light:text-slate-800 font-semibold text-sm hover:bg-slate-700 light:hover:bg-slate-300 transition-all border border-dark-border light:border-slate-300"
          >
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>+ Add Hostel</span>
          </button>

          <button
            onClick={() => setIsRoomModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Room</span>
          </button>
        </div>
      </div>

      {/* Hostel Tab Switcher */}
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
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
              }`}
            >
              {getHostelName(hostel)} ({getHostelType(hostel)})
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 light:text-slate-500 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-500" />
            <p className="text-base font-semibold">No room records found for this hostel.</p>
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              + Create First Room
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
                className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
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

                  <h3 className="text-2xl font-extrabold font-heading text-slate-100 light:text-slate-900 mb-2">
                    Room {room.room_number}
                  </h3>

                  {/* Bed Indicator Dots */}
                  <div className="flex items-center gap-2 mb-6">
                    {Array.from({ length: capacity }).map((_, idx) => {
                      const isOccupied = idx < occupied;
                      return (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                            isOccupied
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-sm'
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

                {/* Room Rent & Footer */}
                <div className="border-t border-dark-border light:border-slate-200 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 light:text-slate-500 font-medium">Monthly Rent</span>
                  <span className="text-base font-extrabold font-mono text-slate-100 light:text-slate-900">
                    {formatLKR(getRoomRent(room))}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD ROOM MODAL */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title="Add New Room"
        subtitle="Specify room number, capacity, floor, and monthly rental rate"
        icon={BedDouble}
        themeClass="from-blue-600 to-indigo-600"
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
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Select Hostel <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={roomForm.hostel_id}
                onChange={(e) => setRoomForm({ ...roomForm, hostel_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
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
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
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
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Room Type
              </label>
              <select
                value={roomForm.room_type}
                onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
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
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20"
            >
              Create Room
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD HOSTEL MODAL */}
      <Modal
        isOpen={isHostelModalOpen}
        onClose={() => setIsHostelModalOpen(false)}
        title="Add New Hostel Block"
        subtitle="Register a new building or wing into the hostel system"
        icon={Building2}
        themeClass="from-purple-600 to-pink-600"
      >
        <form onSubmit={handleHostelSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Hostel / Building Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Phoenix Hall"
              value={hostelForm.hostel_name}
              onChange={(e) => setHostelForm({ ...hostelForm, hostel_name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Category / Gender Type
              </label>
              <select
                value={hostelForm.hostel_type}
                onChange={(e) => setHostelForm({ ...hostelForm, hostel_type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              >
                <option value="Boys">Boys Hostel</option>
                <option value="Girls">Girls Hostel</option>
                <option value="Co-ed">Co-ed Hostel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Total Capacity (Beds)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={hostelForm.capacity}
                onChange={(e) => setHostelForm({ ...hostelForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsHostelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-semibold text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-500/20"
            >
              Register Hostel Block
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
