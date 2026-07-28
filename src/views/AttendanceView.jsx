import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, Save, BarChart3, User, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function AttendanceView({ students = [], onSaveAttendance, onLoadStudentChart }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
  const [rollcallState, setRollcallState] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [chartDays, setChartDays] = useState(14);
  const [chartData, setChartData] = useState(null);

  // Initialize rollcall state for students
  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate, students]);

  const fetchAttendanceForDate = async (dateStr) => {
    try {
      const res = await fetch(`/api/attendance/daily?date=${dateStr}`);
      const data = await res.json();
      const map = {};
      
      // Default all active students to Present
      students.forEach(st => {
        map[st.id] = 'Present';
      });

      if (data.success && data.records) {
        data.records.forEach(rec => {
          map[rec.student_id] = rec.status;
        });
      }
      setRollcallState(map);
    } catch (err) {
      console.error('Error loading daily attendance:', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRollcallState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const payload = Object.keys(rollcallState).map(stId => ({
      student_id: Number(stId),
      status: rollcallState[stId]
    }));
    await onSaveAttendance(selectedDate, payload);
  };

  const handleSelectStudentForChart = async (stId) => {
    setSelectedStudentId(stId);
    if (!stId) {
      setChartData(null);
      return;
    }
    const data = await onLoadStudentChart(stId, chartDays);
    if (data && data.success) {
      setChartData(data);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      handleSelectStudentForChart(selectedStudentId);
    }
  }, [chartDays]);

  // Compute daily stats badges
  const presentCount = Object.values(rollcallState).filter(s => s === 'Present').length;
  const absentCount = Object.values(rollcallState).filter(s => s === 'Absent').length;
  const leaveCount = Object.values(rollcallState).filter(s => s === 'Leave').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Daily Attendance & Rollcall
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Mark daily resident presence and analyze individual attendance trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 light:text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Rollcall</span>
          </button>
        </div>
      </div>

      {/* Two Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Rollcall Table (7 cols) */}
        <div className="lg:col-span-7 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-dark-border light:border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold font-heading text-base text-slate-100 light:text-slate-900">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              <span>Resident Rollcall</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                P: {presentCount}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/20">
                A: {absentCount}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                L: {leaveCount}
              </span>
            </div>
          </div>

          <div className="max-h-[550px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-dark-border light:border-slate-200">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border light:divide-slate-200">
                {students.map(st => {
                  const currentStatus = rollcallState[st.id] || 'Present';
                  return (
                    <tr key={st.id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-100 light:text-slate-900">{st.full_name}</div>
                        <div className="text-xs text-slate-400 light:text-slate-500 font-mono">
                          {st.admission_no} • {st.hostel_name ? `${st.hostel_name} R-${st.room_number}` : 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex rounded-xl border border-dark-border light:border-slate-300 p-0.5 bg-dark-input light:bg-slate-100">
                          {['Present', 'Absent', 'Leave'].map(stt => {
                            const isSelected = currentStatus === stt;
                            const colorMap = {
                              Present: isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
                              Absent: isSelected ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
                              Leave: isSelected ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
                            };
                            return (
                              <button
                                key={stt}
                                type="button"
                                onClick={() => handleStatusChange(st.id, stt)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${colorMap[stt]}`}
                              >
                                {stt}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Per-Student Attendance Graph (5 cols) */}
        <div className="lg:col-span-5 bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border light:border-slate-200 pb-4">
            <div className="flex items-center gap-2 font-bold font-heading text-base text-slate-100 light:text-slate-900">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span>Student Attendance Graph</span>
            </div>
          </div>

          {/* Student Picker & Time Range */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600">
              Select Student to View History
            </label>
            <div className="flex gap-3">
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectStudentForChart(e.target.value)}
                className="flex-1 px-3 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Choose Student --</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.full_name} ({st.admission_no})</option>
                ))}
              </select>

              <select
                value={chartDays}
                onChange={(e) => setChartDays(Number(e.target.value))}
                className="px-3 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-purple-500"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>

          {/* Chart Display */}
          {chartData ? (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 light:text-slate-900">
                  {chartData.student.full_name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                  {chartData.student.admission_no}
                </span>
              </div>

              <div className="h-64">
                <Bar
                  data={{
                    labels: chartData.data.map(d => d.date.substring(5)),
                    datasets: [{
                      label: 'Status',
                      data: chartData.data.map(d => d.status === 'Present' ? 1 : d.status === 'Leave' ? 0.5 : 0),
                      backgroundColor: chartData.data.map(d =>
                        d.status === 'Present' ? '#10b981' : d.status === 'Leave' ? '#f59e0b' : '#ef4444'
                      ),
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        ticks: {
                          callback: (val) => val === 1 ? 'Present' : val === 0.5 ? 'Leave' : 'Absent',
                          color: '#64748b',
                          font: { size: 10 }
                        },
                        min: 0,
                        max: 1.1
                      },
                      x: { ticks: { color: '#64748b', font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 light:text-slate-500 border border-dashed border-dark-border light:border-slate-200 rounded-xl">
              <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold">Select a student above to render attendance history graph.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
