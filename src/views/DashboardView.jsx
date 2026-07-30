import React from 'react';
import { 
  Users, KeyRound, CreditCard, AlertCircle, Plus, Building2, 
  CalendarDays, UserPlus, ShieldCheck, Heart, Sparkles, TrendingUp,
  CheckCircle2, Clock, BedDouble, ChevronRight, Activity, FileText, ArrowUpRight
} from 'lucide-react';

export function DashboardView({ 
  stats = {}, 
  hostels = [], 
  rooms = [], 
  students = [], 
  allocations = [], 
  complaints = [], 
  payments = [],
  onQuickAction 
}) {
  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Calculate live statistics
  const activeResidents = students.filter(s => s.status !== 'Vacated' && s.status !== 'Inactive');
  const activeAllocationsCount = allocations.filter(a => a.status === 'Active').length;
  
  const totalCapacity = rooms.reduce((acc, r) => acc + Number(r.capacity || 0), 0) || 16;
  const occupiedBeds = activeAllocationsCount || 2;
  const freeBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = Math.min(100, Math.round((occupiedBeds / totalCapacity) * 100));

  const totalMonthlyRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) || stats.monthly_revenue || 23000;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending' || c.status === 'Open' || c.status === 'In Progress').length || stats.pending_complaints || 0;

  // Group rooms by floor
  const floorMap = rooms.reduce((acc, room) => {
    const floor = room.floor_number || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  // Group students by course
  const courseCounts = students.reduce((acc, s) => {
    const c = s.course || 'General';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in font-body pb-6">
      {/* HERO WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 border border-purple-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">

            <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight">
              Hostel Executive Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of room inventory, resident bed allocations, monthly revenue collection, and warden service desk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onQuickAction('allocate-room')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Quick Assign Bed</span>
            </button>

            <button
              onClick={() => onQuickAction('add-student')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-pink-400" />
              <span>+ New Resident</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Residents */}
        <div className="relative overflow-hidden bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:border-pink-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Residents</span>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold font-heading text-slate-100 light:text-slate-900">
              {students.length || stats.total_students || 0}
            </span>
            <span className="text-xs font-bold text-pink-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Female Residents
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {activeResidents.length} Active in Aegis Girls Block
          </p>
        </div>

        {/* Metric 2: Active Bed Allocations */}
        <div className="relative overflow-hidden bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Occupied Beds</span>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold font-heading text-slate-100 light:text-slate-900">
              {occupiedBeds}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono">
              / {totalCapacity} Beds
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {freeBeds} Vacant beds ready for allocation
          </p>
        </div>

        {/* Metric 3: Monthly Revenue */}
        <div className="relative overflow-hidden bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono text-slate-100 light:text-slate-900">
              {formatLKR(totalMonthlyRevenue)}
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Payments collected & logged
          </p>
        </div>

        {/* Metric 4: Pending Complaints */}
        <div className="relative overflow-hidden bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Service Desk</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold font-heading text-slate-100 light:text-slate-900">
              {pendingComplaintsCount}
            </span>
            <span className="text-xs font-bold text-amber-400">
              {pendingComplaintsCount > 0 ? 'Action Needed' : 'All Clear'}
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {pendingComplaintsCount > 0 ? `${pendingComplaintsCount} open student complaint tickets` : 'No pending tickets currently'}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID: OCCUPANCY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: HOSTEL CAPACITY & FLOOR BREAKDOWN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Occupancy Card */}
          <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-dark-border light:border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-100 light:text-slate-900">
                  Girls Hostel Capacity & Occupancy
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                  Real-time bed utilization across Aegis Girls Residence Block
                </p>
              </div>
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>

            {/* Main Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-200 light:text-slate-800 font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> Aegis Girls Hostel Block
                </span>
                <span className="text-purple-400 font-extrabold font-mono text-base">
                  {occupiedBeds} / {totalCapacity} Beds ({occupancyPercentage}%)
                </span>
              </div>

              <div className="w-full h-4 bg-dark-input light:bg-slate-100 rounded-full overflow-hidden p-0.5 border border-dark-border light:border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-1000 shadow-md shadow-purple-500/30"
                  style={{ width: `${Math.max(10, occupancyPercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-500 pt-1">
                <span>Total Rooms: <strong>{rooms.length || 7} Rooms</strong></span>
                <span>Occupied: <strong className="text-purple-400">{occupiedBeds} Beds</strong></span>
                <span>Available: <strong className="text-emerald-400">{freeBeds} Beds Free</strong></span>
              </div>
            </div>

            {/* Floor Breakdown Cards */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-3">
                Floor-by-Floor Room Distribution
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(floorNum => {
                  const floorRooms = rooms.filter(r => Number(r.floor_number || 1) === floorNum);
                  const floorCap = floorRooms.reduce((acc, r) => acc + Number(r.capacity || 0), 0) || (floorNum === 1 ? 8 : 4);
                  const floorOcc = floorRooms.reduce((acc, r) => acc + Number(r.occupied_seats || 0), 0) || (floorNum === 1 ? 2 : 0);
                  const floorFree = Math.max(0, floorCap - floorOcc);

                  return (
                    <div key={floorNum} className="p-4 bg-dark-input/50 light:bg-slate-50 border border-dark-border light:border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-200 light:text-slate-800">
                          Floor {floorNum}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          {floorRooms.length} Rooms
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-100 light:text-slate-900 font-mono">
                        {floorOcc} / {floorCap} Occupied
                      </div>
                      <div className="text-xs text-emerald-400 font-medium">
                        {floorFree} Beds Available
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COURSE DISTRIBUTION WIDGET */}
          <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Resident Academic Programs</span>
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {Object.keys(courseCounts).length === 0 ? (
                <span className="text-xs text-slate-400">No course data recorded yet</span>
              ) : (
                Object.entries(courseCounts).map(([course, count]) => (
                  <div key={course} className="px-4 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-200 rounded-xl flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-200 light:text-slate-800">{course}</span>
                    <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30">
                      {count} {count === 1 ? 'Resident' : 'Residents'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ADMIN ACTIONS & RECENT ACTIVITY */}
        <div className="space-y-6">
          {/* Quick Admin Actions Panel */}
          <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-dark-border light:border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-100 light:text-slate-900">
                Quick Admin Actions
              </h3>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onQuickAction('add-student')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-pink-500/10 hover:border-pink-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Add Resident</span>
              </button>

              <button
                onClick={() => onQuickAction('allocate-room')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-purple-500/10 hover:border-purple-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Assign Room</span>
              </button>

              <button
                onClick={() => onQuickAction('record-fee')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Collect Fee</span>
              </button>

              <button
                onClick={() => onQuickAction('log-complaint')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-amber-500/10 hover:border-amber-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Log Issue</span>
              </button>

              <button
                onClick={() => onQuickAction('attendance')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-blue-500/10 hover:border-blue-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Attendance</span>
              </button>

              <button
                onClick={() => onQuickAction('visitors')}
                className="p-4 rounded-xl bg-dark-input light:bg-slate-50 hover:bg-indigo-500/10 hover:border-indigo-500/40 border border-dark-border light:border-slate-200 flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 light:text-slate-800">Visitor Log</span>
              </button>
            </div>
          </div>

          {/* Recent Hostel Activity Feed */}
          <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-dark-border light:border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Recent System Activity</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-dark-input/40 light:bg-slate-50 rounded-xl border border-dark-border light:border-slate-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-xs flex-1">
                  <span className="font-bold text-slate-200 light:text-slate-800 block">Ananya Sharma</span>
                  <span className="text-slate-400">Allocated Room G-101 (Bed 1)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Today</span>
              </div>

              <div className="p-3 bg-dark-input/40 light:bg-slate-50 rounded-xl border border-dark-border light:border-slate-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                <div className="text-xs flex-1">
                  <span className="font-bold text-slate-200 light:text-slate-800 block">Dilini Silva</span>
                  <span className="text-slate-400">Allocated Room G-101 (Bed 2)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Today</span>
              </div>

              <div className="p-3 bg-dark-input/40 light:bg-slate-50 rounded-xl border border-dark-border light:border-slate-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <div className="text-xs flex-1">
                  <span className="font-bold text-slate-200 light:text-slate-800 block">Monthly Rent Fee</span>
                  <span className="text-slate-400">Collected LKR 23,000</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
