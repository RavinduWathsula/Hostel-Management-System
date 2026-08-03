import React, { useState } from 'react';
import { Building2, Plus, BedDouble, Users, Home, DollarSign, Eye, CheckCircle2, Phone, Sparkles, User, Info, Heart, Trash2, ArrowLeftRight, LogOut, Pencil } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StudentSearchSelect } from '../components/common/StudentSearchSelect';

export function RoomsView({ hostels = [], rooms = [], students = [], allocations = [], onAddRoom, onEditRoom, onAddHostel, onDeleteRoom, onVacateRoom, onChangeBed, onAllocateRoom, onNavigateToAllocation, searchTerm = '' }) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [changeBedModal, setChangeBedModal] = useState(null);
  const [editRoomModal, setEditRoomModal] = useState(null);
  const [quickAllocateModal, setQuickAllocateModal] = useState(null);

  const getHostelId = (h) => h.hostel_id || h.id;
  const getHostelName = (h) => h.hostel_name || h.name || `Hostel ${getHostelId(h)}`;
  const getHostelType = (h) => h.hostel_type || h.gender_type || h.type || 'Girls';

  const getRoomId = (r) => r.room_id || r.id;
  const getRoomCapacity = (r) => Number(r.capacity || 2);
  const getRoomOccupied = (r) => Number(r.occupied_seats ?? r.occupied_beds ?? r.occupied ?? 0);
  const getRoomRent = (r) => Number(r.monthly_rent || r.rent || 0);

  // Default to Girls Hostel if available, otherwise first hostel
  // Default to ALL hostels so all room inventory is visible
  const [selectedHostelId, setSelectedHostelId] = useState('ALL');

  const activeHostelId = selectedHostelId;
  const activeHostelObj = hostels.find(h => String(getHostelId(h)) === String(activeHostelId)) || hostels[0];

  const query = searchTerm.toLowerCase().trim();
  const filteredRooms = rooms.filter(r => {
    const matchesHostel = !selectedHostelId || selectedHostelId === 'ALL' || query
      ? true
      : String(r.hostel_id) === String(selectedHostelId);
    const matchesSearch = !query ? true : (
      String(r.room_number || '').toLowerCase().includes(query) ||
      String(r.room_type || '').toLowerCase().includes(query) ||
      String(r.hostel_name || '').toLowerCase().includes(query)
    );
    return matchesHostel && matchesSearch;
  });

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

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOpenAddRoomModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Hostel Tab Switcher */}
      <div className="flex border-b border-dark-border light:border-slate-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setSelectedHostelId('ALL')}
          className={`pb-4 px-2 text-base font-bold font-heading transition-all whitespace-nowrap border-b-2 ${
            selectedHostelId === 'ALL'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
          }`}
        >
          All Rooms ({rooms.length})
        </button>
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
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 light:text-slate-500">
                      Floor {room.floor_number || 1} • {room.room_type || 'Standard'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-full whitespace-nowrap shadow-sm ${
                          isFull
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isFull ? 'Fully Occupied' : freeBeds === 1 ? '1 Bed Free' : `${freeBeds} Beds Free`}
                      </span>
                      <button
                        type="button"
                        title="Delete Room"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteRoom) onDeleteRoom(roomId);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 hover:text-rose-300 border border-rose-500/30 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

                  <div className="mt-3 px-3 py-2 text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-2 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl border border-purple-500/20 text-center leading-snug transition-all">
                    <Eye className="w-4 h-4 shrink-0 text-purple-400" />
                    <span>View Room Details & Residents</span>
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
                  const allocation = roomAllocated.find(a => Number(a.bed_number) === bedNum);
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
                                {student?.status === 'Suspended' ? (
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    Suspended
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                                    {student?.gender || 'Female'}
                                  </span>
                                )}
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

                      <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                        {allocation ? (
                          <>
                            <button
                              type="button"
                              title="Change Bed / Transfer Resident"
                              onClick={() => {
                                const currentRId = getRoomId(selectedRoom);
                                const currentRoomNum = selectedRoom.room_number;
                                const firstTargetRoom = rooms.find(r => String(getRoomId(r)) !== String(currentRId)) || rooms[0];
                                const targetRId = firstTargetRoom ? getRoomId(firstTargetRoom) : '';
                                setSelectedRoom(null);
                                setChangeBedModal({
                                  allocation_id: allocation.allocation_id || allocation.id,
                                  student_name: allocation?.student_name || student?.full_name || 'Resident',
                                  current_room: currentRoomNum,
                                  current_bed: bedNum,
                                  new_room_id: targetRId,
                                  new_bed_number: 1
                                });
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 flex items-center gap-1.5 transition-all"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Change Bed</span>
                            </button>
                            <button
                              type="button"
                              title="Vacate Resident from Bed"
                              onClick={() => {
                                const allocId = allocation.allocation_id || allocation.id;
                                setSelectedRoom(null);
                                if (onVacateRoom) onVacateRoom(allocId);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 flex items-center gap-1.5 transition-all"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Vacate Bed</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            title="Allocate Resident to Bed"
                            onClick={() => {
                              const currentRId = getRoomId(selectedRoom);
                              const currentRoomNum = selectedRoom.room_number;
                              setSelectedRoom(null);
                              setQuickAllocateModal({
                                student_id: '',
                                room_id: currentRId,
                                room_number: currentRoomNum,
                                bed_number: bedNum,
                                allocated_from: new Date().toISOString().substring(0, 10)
                              });
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Allocate Bed</span>
                          </button>
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
            <div className="flex items-center justify-between pt-3 border-t border-dark-border light:border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const roomToEdit = { ...selectedRoom };
                    setSelectedRoom(null);
                    setEditRoomModal({
                      room_id: getRoomId(roomToEdit),
                      room_number: roomToEdit.room_number,
                      hostel_id: roomToEdit.hostel_id,
                      capacity: getRoomCapacity(roomToEdit),
                      floor_number: roomToEdit.floor_number || 1,
                      room_type: roomToEdit.room_type || 'Standard',
                      monthly_rent: getRoomRent(roomToEdit)
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 light:text-purple-600 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rId = getRoomId(selectedRoom);
                    setSelectedRoom(null);
                    if (onDeleteRoom) onDeleteRoom(rId);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 light:text-rose-600 font-bold text-xs border border-rose-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Room</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 light:bg-slate-100 text-slate-200 light:text-slate-800 font-bold text-sm hover:bg-slate-700 light:hover:bg-slate-200 border border-slate-700 light:border-slate-300 transition-all"
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

      {/* CHANGE BED MODAL */}
      {changeBedModal && (() => {
        const selectedTargetRoom = rooms.find(r => String(getRoomId(r)) === String(changeBedModal.new_room_id)) || rooms[0];
        const targetCapacity = selectedTargetRoom ? getRoomCapacity(selectedTargetRoom) : 2;
        const occupiedBedsInTargetRoom = allocations
          .filter(a => String(a.room_id) === String(changeBedModal.new_room_id) && a.status === 'Active')
          .map(a => Number(a.bed_number));

        return (
          <Modal
            isOpen={Boolean(changeBedModal)}
            onClose={() => setChangeBedModal(null)}
            title={`Change Bed Spot - ${changeBedModal.student_name}`}
            subtitle={`Currently in Room ${changeBedModal.current_room} • Bed ${changeBedModal.current_bed}`}
            icon={ArrowLeftRight}
            themeClass="from-purple-600 to-indigo-600"
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!changeBedModal.new_room_id) return;
                if (onChangeBed) {
                  await onChangeBed(
                    changeBedModal.allocation_id,
                    Number(changeBedModal.new_room_id),
                    Number(changeBedModal.new_bed_number || 1)
                  );
                }
                setChangeBedModal(null);
              }}
              className="space-y-4 font-body"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Select Target Room <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={changeBedModal.new_room_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const targetRoom = rooms.find(r => String(getRoomId(r)) === String(selectedId));
                    const cap = targetRoom ? getRoomCapacity(targetRoom) : 2;
                    const targetOccupiedBeds = allocations
                      .filter(a => String(a.room_id) === String(selectedId) && a.status === 'Active')
                      .map(a => Number(a.bed_number));
                    
                    let firstFree = 1;
                    for (let b = 1; b <= cap; b++) {
                      if (!targetOccupiedBeds.includes(b)) {
                        firstFree = b;
                        break;
                      }
                    }
                    setChangeBedModal(prev => ({
                      ...prev,
                      new_room_id: selectedId,
                      new_bed_number: firstFree
                    }));
                  }}
                  className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  {rooms.map(r => {
                    const rId = getRoomId(r);
                    const free = getRoomCapacity(r) - getRoomOccupied(r);
                    return (
                      <option key={rId} value={rId}>
                        Room {r.room_number} ({r.hostel_name || 'Hostel'}) - {getRoomCapacity(r)} beds total ({free > 0 ? `${free} free` : 'Full'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Select Bed Spot Number ({targetCapacity} Beds Total in Room {selectedTargetRoom?.room_number || ''})
                </label>
                <select
                  value={changeBedModal.new_bed_number}
                  onChange={(e) => setChangeBedModal({ ...changeBedModal, new_bed_number: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                >
                  {Array.from({ length: targetCapacity }, (_, i) => i + 1).map(b => {
                    const isOccupied = occupiedBedsInTargetRoom.includes(b);
                    const occupyingAlloc = allocations.find(a => String(a.room_id) === String(changeBedModal.new_room_id) && Number(a.bed_number) === b && a.status === 'Active');
                    const occupantName = occupyingAlloc ? (occupyingAlloc.student_name || 'Occupied') : null;
                    return (
                      <option key={b} value={b} disabled={isOccupied}>
                        Bed Spot {b} {isOccupied ? `(Occupied by ${occupantName})` : '(Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
                <button
                  type="button"
                  onClick={() => setChangeBedModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 transition-all"
                >
                  Confirm Bed Transfer
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* EDIT ROOM MODAL */}
      {editRoomModal && (
        <Modal
          isOpen={Boolean(editRoomModal)}
          onClose={() => setEditRoomModal(null)}
          title={`Edit Room ${editRoomModal.room_number}`}
          subtitle="Modify room number, capacity, floor, type, and monthly rent"
          icon={Pencil}
          themeClass="from-purple-600 to-indigo-600"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (onEditRoom) {
                await onEditRoom(editRoomModal.room_id, editRoomModal);
              }
              setEditRoomModal(null);
              setSelectedRoom(null);
            }}
            className="space-y-4 font-body"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Room Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editRoomModal.room_number}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, room_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Hostel Block <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editRoomModal.hostel_id}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, hostel_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  {hostels.map(h => (
                    <option key={getHostelId(h)} value={getHostelId(h)}>
                      {getHostelName(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Capacity (Beds)
                </label>
                <select
                  value={editRoomModal.capacity}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value={1}>1 Bed</option>
                  <option value={2}>2 Beds</option>
                  <option value={3}>3 Beds</option>
                  <option value={4}>4 Beds</option>
                  <option value={5}>5 Beds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editRoomModal.floor_number}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, floor_number: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Room Type
                </label>
                <select
                  value={editRoomModal.room_type}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, room_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Single Deluxe">Single Deluxe</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Monthly Rent (LKR)
              </label>
              <input
                type="number"
                step="500"
                value={editRoomModal.monthly_rent}
                onChange={(e) => setEditRoomModal({ ...editRoomModal, monthly_rent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
              <button
                type="button"
                onClick={() => setEditRoomModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QUICK ALLOCATE BED MODAL */}
      {quickAllocateModal && (
        <Modal
          isOpen={Boolean(quickAllocateModal)}
          onClose={() => setQuickAllocateModal(null)}
          title={`Assign Bed Spot - Room ${quickAllocateModal.room_number}`}
          subtitle={`Assigning Bed ${quickAllocateModal.bed_number} spot to a registered resident`}
          icon={Plus}
          themeClass="from-emerald-600 to-teal-600"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!quickAllocateModal.student_id) {
                alert('Please select a student');
                return;
              }
              if (onAllocateRoom) {
                await onAllocateRoom({
                  student_id: Number(quickAllocateModal.student_id),
                  room_id: Number(quickAllocateModal.room_id),
                  bed_number: Number(quickAllocateModal.bed_number),
                  allocated_from: quickAllocateModal.allocated_from
                });
              }
              setQuickAllocateModal(null);
            }}
            className="space-y-4 font-body"
          >
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Select Resident Student <span className="text-rose-500">*</span>
              </label>
              <StudentSearchSelect
                students={students}
                value={quickAllocateModal.student_id}
                onChange={(val) => setQuickAllocateModal({ ...quickAllocateModal, student_id: val })}
                required
                placeholder="-- Type Student Name or Choose Student --"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Allocation Start Date
              </label>
              <input
                type="date"
                required
                value={quickAllocateModal.allocated_from}
                onChange={(e) => setQuickAllocateModal({ ...quickAllocateModal, allocated_from: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
              <button
                type="button"
                onClick={() => setQuickAllocateModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                Assign Bed Spot
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
