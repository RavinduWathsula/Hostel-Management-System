import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Calendar, X, GraduationCap, DoorClosed, UserCog, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({
  onMobileMenuClick,
  searchTerm,
  setSearchTerm,
  onNavigate,
  students = [],
  rooms = [],
  staff = [],
  feePayments = []
}) {
  const { admin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const query = (searchTerm || '').trim().toLowerCase();

  const matchingStudents = query
    ? students.filter(s =>
        (s.full_name || '').toLowerCase().includes(query) ||
        (s.admission_no || '').toLowerCase().includes(query) ||
        (s.phone || '').toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchingRooms = query
    ? rooms.filter(r =>
        String(r.room_number || '').toLowerCase().includes(query) ||
        (r.hostel_name || '').toLowerCase().includes(query) ||
        (r.room_type || '').toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchingStaff = query
    ? staff.filter(s =>
        (s.full_name || '').toLowerCase().includes(query) ||
        (s.role || s.designation || '').toLowerCase().includes(query) ||
        (s.phone || '').toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchingPayments = query
    ? feePayments.filter(p =>
        (p.receipt_no || '').toLowerCase().includes(query) ||
        (p.student_name || '').toLowerCase().includes(query) ||
        (p.month_for || '').toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const totalMatches = matchingStudents.length + matchingRooms.length + matchingStaff.length + matchingPayments.length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (viewName) => {
    if (onNavigate) onNavigate(viewName);
    setIsOpen(false);
  };

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-dark-border light:border-slate-200 bg-dark-bg/80 light:bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden w-10 h-10 rounded-xl border border-dark-border light:border-slate-200 flex items-center justify-center text-slate-300 light:text-slate-700 hover:bg-dark-hover light:hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={containerRef} className="relative flex items-center w-64 md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, rooms, staff, receipts..."
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-10 pr-9 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setIsOpen(false);
              }}
              className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-200 light:hover:text-slate-700 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Dropdown Popup */}
          {isOpen && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 light:bg-white border border-dark-border light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto">
              {totalMatches === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 light:text-slate-500">
                  No matching records found for <span className="font-semibold text-slate-200 light:text-slate-800">"{searchTerm}"</span>
                </div>
              ) : (
                <div className="p-2 space-y-2 divide-y divide-slate-800 light:divide-slate-100">
                  {matchingStudents.length > 0 && (
                    <div className="pt-1">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase text-blue-400 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Students
                      </div>
                      {matchingStudents.map(s => (
                        <button
                          key={s.id || s.student_id}
                          onClick={() => handleSelectCategory('students')}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-100 light:text-slate-900">{s.full_name}</span>
                          <span className="text-[11px] text-slate-400">{s.admission_no}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingRooms.length > 0 && (
                    <div className="pt-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <DoorClosed className="w-3.5 h-3.5" /> Rooms
                      </div>
                      {matchingRooms.map(r => (
                        <button
                          key={r.id || r.room_id}
                          onClick={() => handleSelectCategory('rooms')}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-100 light:text-slate-900">Room {r.room_number}</span>
                          <span className="text-[11px] text-slate-400">{r.hostel_name || r.room_type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingStaff.length > 0 && (
                    <div className="pt-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase text-teal-400 flex items-center gap-1.5">
                        <UserCog className="w-3.5 h-3.5" /> Staff
                      </div>
                      {matchingStaff.map(st => (
                        <button
                          key={st.id || st.staff_id}
                          onClick={() => handleSelectCategory('staff')}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-100 light:text-slate-900">{st.full_name}</span>
                          <span className="text-[11px] text-slate-400">{st.role || st.designation}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingPayments.length > 0 && (
                    <div className="pt-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase text-purple-400 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" /> Receipts & Fees
                      </div>
                      {matchingPayments.map(p => (
                        <button
                          key={p.id || p.payment_id}
                          onClick={() => handleSelectCategory('fees')}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-100 light:text-slate-900">{p.receipt_no || p.student_name}</span>
                          <span className="text-[11px] text-slate-400">{p.month_for || p.fee_type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header Profile & Status Info */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>{currentDate}</span>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-2 border-slate-700 light:border-slate-200 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {admin?.full_name ? admin.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-slate-100 light:text-slate-900 leading-tight">
              {admin?.full_name || 'System Admin'}
            </h4>
            <span className="text-xs text-slate-400 light:text-slate-500 capitalize">
              {admin?.role || 'Hostel Director'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

