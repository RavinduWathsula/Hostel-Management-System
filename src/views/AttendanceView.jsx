import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Calendar, Save, BarChart3, User, CheckCircle2, XCircle, Clock, 
  Search, Sparkles, Filter, ShieldCheck, AlertCircle, TrendingUp
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { StudentSearchSelect } from '../components/common/StudentSearchSelect';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function AttendanceView({ students = [], onSaveAttendance, onLoadStudentChart }) {
  const getLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
  const [rollcallState, setRollcallState] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [chartDays, setChartDays] = useState(14);
  const [chartData, setChartData] = useState(null);
  const [rollcallSearch, setRollcallSearch] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Fetch attendance for selected date
  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate, students]);

  const fetchAttendanceForDate = async (dateStr) => {
    try {
      const res = await fetch(`/api/attendance/daily?date=${dateStr}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : { success: false };
      const map = {};
      
      const localStr = localStorage.getItem(`aegis_attendance_${dateStr}`);
      const localMap = localStr ? JSON.parse(localStr) : {};

      // Default all active students to Present, overlay with DB, then overlay with Local Storage
      students.forEach(st => {
        const studentId = st.id || st.student_id;
        let stt = null;

        if (data.success && data.records) {
          const dbRec = data.records.find(r => String(r.student_id) === String(studentId));
          if (dbRec && dbRec.status) stt = dbRec.status;
        }

        if (localMap[studentId]) {
          stt = localMap[studentId];
        }

        if (stt === 'On Leave') stt = 'Leave';
        map[studentId] = stt;
      });

      setRollcallState(map);
    } catch (err) {
      console.error('Error loading daily attendance:', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRollcallState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const payload = Object.keys(rollcallState)
      .filter(stId => rollcallState[stId] !== null)
      .map(stId => ({
        student_id: Number(stId),
        status: rollcallState[stId] === 'Leave' ? 'On Leave' : rollcallState[stId]
      }));
    
    // Save to local storage as source of truth for frontend
    const localMap = {};
    payload.forEach(p => {
      localMap[p.student_id] = p.status === 'On Leave' ? 'Leave' : p.status;
    });
    localStorage.setItem(`aegis_attendance_${selectedDate}`, JSON.stringify(localMap));

    const res = await onSaveAttendance(selectedDate, payload);
    if (res && res.success) {
      await fetchAttendanceForDate(selectedDate);
      if (selectedStudentId) {
        handleSelectStudentForChart(selectedStudentId);
      }
      setToastMsg({ type: 'success', text: 'Daily rollcall successfully verified and saved! ✨' });
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      setToastMsg({ type: 'error', text: res?.error || 'Failed to save attendance records.' });
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleSelectStudentForChart = async (stId) => {
    setSelectedStudentId(stId);
    if (!stId) {
      setChartData(null);
      return;
    }
    
    const dbData = await onLoadStudentChart(stId, chartDays);
    
    const dataArray = [];
    const today = new Date();
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let totalMarked = 0;

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      let status = 'Not Marked';
      
      if (dbData && dbData.success && dbData.data) {
        const dbRec = dbData.data.find(r => r.date === dateStr);
        if (dbRec && dbRec.status) status = dbRec.status;
      }
      
      const localStr = localStorage.getItem(`aegis_attendance_${dateStr}`);
      if (localStr) {
        const localMap = JSON.parse(localStr);
        if (localMap[stId]) {
          status = localMap[stId];
        }
      }
      
      if (status === 'On Leave') status = 'Leave';
      dataArray.push({ date: dateStr, status });
      
      totalMarked++;
      if (status === 'Present') presentCount++;
      if (status === 'Absent') absentCount++;
      if (status === 'Leave') leaveCount++;
    }
    
    const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;
    
    setChartData({
      success: true,
      student: students.find(s => String(s.id || s.student_id) === String(stId)),
      summary: { totalMarked, totalPresent: presentCount, totalAbsent: absentCount, totalLeave: leaveCount, attendanceRate },
      data: dataArray
    });
  };

  useEffect(() => {
    if (selectedStudentId) {
      handleSelectStudentForChart(selectedStudentId);
    }
  }, [chartDays]);

  // Compute daily stats badges
  const presentCount = Object.values(rollcallState).filter(s => s === 'Present').length;
  const absentCount = Object.values(rollcallState).filter(s => s === 'Absent').length;
  const leaveCount = Object.values(rollcallState).filter(s => s === 'Leave' || s === 'On Leave').length;

  // Filter students for rollcall search bar
  const query = rollcallSearch.toLowerCase().trim();
  const filteredStudents = students.filter(st => {
    if (!query) return true;
    return (
      (st.full_name || '').toLowerCase().includes(query) ||
      (st.admission_no || '').toLowerCase().includes(query) ||
      (st.course || '').toLowerCase().includes(query) ||
      (st.room_number || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Daily Attendance & Rollcall
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Mark daily resident presence and analyze individual student attendance trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-dark-card light:bg-white border border-dark-border light:border-slate-300 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-100 light:text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Save Rollcall</span>
          </button>
        </div>
      </div>

      {/* Attendance Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Residents */}
        <div className="p-4 rounded-2xl bg-dark-card light:bg-white border border-dark-border light:border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">Total Residents</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-slate-100 light:text-slate-900">{students.length}</span>
            <span className="text-xs font-medium text-slate-400 light:text-slate-500">Active Students</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-2xl bg-dark-card light:bg-white border border-emerald-500/30 ring-1 ring-emerald-500/10 bg-emerald-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Present Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-emerald-400">{presentCount}</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-extrabold">
              {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}% Rate
            </span>
          </div>
        </div>

        {/* Absent Today */}
        <div className="p-4 rounded-2xl bg-dark-card light:bg-white border border-rose-500/30 ring-1 ring-rose-500/10 bg-rose-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Absent Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 border border-rose-500/30">
              <XCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-rose-400">{absentCount}</span>
            <span className="text-xs font-medium text-rose-400/80">Unexcused</span>
          </div>
        </div>

        {/* On Leave Today */}
        <div className="p-4 rounded-2xl bg-dark-card light:bg-white border border-amber-500/30 ring-1 ring-amber-500/10 bg-amber-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              On Leave Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-heading text-amber-400">{leaveCount}</span>
            <span className="text-xs font-medium text-amber-400/80">Approved Leave</span>
          </div>
        </div>
      </div>

      {/* Two Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Rollcall Table (7 cols) */}
        <div className="lg:col-span-7 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-lg space-y-0">
          <div className="p-4 bg-slate-900/80 light:bg-slate-100 border-b border-dark-border light:border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-extrabold font-heading text-base text-slate-100 light:text-slate-900">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              <span>Resident Rollcall List</span>
            </div>
          </div>

          {/* Quick Rollcall Filter Input */}
          <div className="p-3 border-b border-dark-border light:border-slate-200 bg-slate-900/30 light:bg-slate-50">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resident student by name or room..."
                value={rollcallSearch}
                onChange={(e) => setRollcallSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-dark-input light:bg-white border border-dark-border light:border-slate-300 rounded-xl text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-dark-border light:border-slate-200">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border light:divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-5 py-8 text-center text-slate-400 light:text-slate-500">
                      No resident students found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(st => {
                    const studentId = st.id || st.student_id;
                    const currentStatus = rollcallState[studentId] || null;
                    return (
                      <tr key={studentId} className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {(st.full_name || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 light:text-slate-900">{st.full_name}</div>
                              <div className="text-xs text-slate-400 light:text-slate-500 font-mono">
                                {st.admission_no} • {st.hostel_name ? `${st.hostel_name} R-${st.room_number}` : 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex rounded-xl border border-dark-border light:border-slate-300 p-0.5 bg-dark-input light:bg-slate-100">
                            {['Present', 'Absent', 'Leave'].map(stt => {
                              const isSelected = currentStatus === stt || (stt === 'Leave' && currentStatus === 'On Leave');
                              const colorMap = {
                                Present: isSelected ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200',
                                Absent: isSelected ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200',
                                Leave: isSelected ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200',
                              };
                              return (
                                <button
                                  key={stt}
                                  type="button"
                                  onClick={() => handleStatusChange(studentId, stt)}
                                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${colorMap[stt]}`}
                                >
                                  {stt}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Per-Student Attendance Graph (5 cols) */}
        <div className="lg:col-span-5 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-dark-border light:border-slate-200 pb-3">
            <div className="flex items-center gap-2 font-extrabold font-heading text-base text-slate-100 light:text-slate-900">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Student Attendance Graph</span>
            </div>
          </div>

          {/* Searchable Student Combobox & Time Range */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600">
              Select Student to View History
            </label>

            <StudentSearchSelect
              students={students}
              value={selectedStudentId}
              onChange={(val) => handleSelectStudentForChart(val)}
              placeholder="-- Type Student Name or Select Resident --"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">History Window</span>
              <div className="flex items-center gap-1 bg-dark-input light:bg-slate-100 p-0.5 rounded-lg border border-dark-border light:border-slate-200">
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setChartDays(days)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      chartDays === days
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Display */}
          {chartData ? (
            <div className="space-y-4 pt-1">
              {/* Student Summary Info Banner */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-slate-100 light:text-slate-900">
                    {chartData.student?.full_name || 'Resident Student'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Admission #{chartData.student?.admission_no}
                  </div>
                </div>
                {chartData.summary && (
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-extrabold">
                      {chartData.summary.attendanceRate}% Present
                    </span>
                  </div>
                )}
              </div>

              {/* Chart Bar */}
              <div className="h-60 pt-2">
                <Bar
                  data={{
                    labels: chartData.data.map(d => d.date.substring(5)),
                    datasets: [{
                      label: 'Status',
                      data: chartData.data.map(d => {
                        if (d.status === 'Present') return 3;
                        if (d.status === 'Leave' || d.status === 'On Leave') return 2;
                        if (d.status === 'Absent') return 1;
                        return 0.2;
                      }),
                      backgroundColor: chartData.data.map(d => {
                        if (d.status === 'Present') return '#10b981';
                        if (d.status === 'Leave' || d.status === 'On Leave') return '#f59e0b';
                        if (d.status === 'Absent') return '#ef4444';
                        return '#475569';
                      }),
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const val = context.raw;
                            const statusStr = val === 3 ? 'Present' : val === 2 ? 'On Leave' : val === 1 ? 'Absent' : 'Not Marked';
                            return `Status: ${statusStr}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (val) => {
                            if (val === 3) return 'Present';
                            if (val === 2) return 'On Leave';
                            if (val === 1) return 'Absent';
                            return '';
                          },
                          color: '#94a3b8',
                          font: { size: 10, weight: 'bold' }
                        },
                        min: 0,
                        max: 3.5
                      },
                      x: { ticks: { color: '#94a3b8', font: { size: 10 } } }
                    }
                  }}
                />
              </div>

              {/* Attendance Breakdown Pills Legend */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dark-border light:border-slate-200">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="text-[10px] font-bold uppercase text-emerald-400">Present</div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    {chartData.data.filter(d => d.status === 'Present').length} Days
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <div className="text-[10px] font-bold uppercase text-rose-400">Absent</div>
                  <div className="text-sm font-extrabold text-rose-400">
                    {chartData.data.filter(d => d.status === 'Absent').length} Days
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-[10px] font-bold uppercase text-amber-400">On Leave</div>
                  <div className="text-sm font-extrabold text-amber-400">
                    {chartData.data.filter(d => d.status === 'Leave' || d.status === 'On Leave').length} Days
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 light:text-slate-500 border border-dashed border-dark-border light:border-slate-200 rounded-xl">
              <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40 text-indigo-400" />
              <p className="text-sm font-semibold">Select a student above to render attendance history graph.</p>
            </div>
          )}
        </div>
      </div>

      {/* Creative Toast Notification Overlay */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in" style={{ animationDuration: '0.3s' }}>
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${
            toastMsg.type === 'success' 
              ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-500/20 backdrop-blur-xl'
              : 'bg-slate-900/95 border-rose-500/50 shadow-rose-500/20 backdrop-blur-xl'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              toastMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-100">{toastMsg.type === 'success' ? 'Rollcall Saved' : 'Update Failed'}</h4>
              <p className={`text-xs font-semibold ${toastMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {toastMsg.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
