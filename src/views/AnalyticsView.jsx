import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Users, Building2, AlertCircle, DollarSign, Activity, CreditCard, PieChart, KeyRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export function AnalyticsView({
  stats = {},
  hostels = [],
  rooms = [],
  students = [],
  allocations = [],
  complaints = [],
  payments = [],
  staff = []
}) {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  
  // Chart Colors based on theme
  const colors = {
    primary: isDark ? '#3b82f6' : '#2563eb',     // Blue
    secondary: isDark ? '#8b5cf6' : '#7c3aed',   // Purple
    success: isDark ? '#10b981' : '#059669',     // Green
    warning: isDark ? '#f59e0b' : '#d97706',     // Amber
    danger: isDark ? '#ef4444' : '#dc2626',      // Red
    text: isDark ? '#94a3b8' : '#64748b',        // Slate 400/500
    grid: isDark ? '#334155' : '#e2e8f0',        // Slate 700/200
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f1f5f9' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
        ticks: {
          color: colors.text,
          font: {
            family: "'Inter', sans-serif",
          }
        }
      },
      y: {
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
        ticks: {
          color: colors.text,
          font: {
            family: "'Inter', sans-serif",
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Centered legend makes the doughnut perfectly centered horizontally
        labels: {
          color: colors.text,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      },
      tooltip: chartOptions.plugins.tooltip
    },
    cutout: '70%',
    borderWidth: 0,
    layout: {
      padding: {
        bottom: 20
      }
    }
  };

  // --- Derived Data for Charts ---

  // 1. Revenue over Time (Last 6 Months)
  const revenueData = useMemo(() => {
    const months = [];
    const revs = [];
    const now = new Date();
    
    // Create last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
      revs.push(0);
    }

    payments.forEach(p => {
      if (p.status === 'Paid') {
        const pd = new Date(p.payment_date);
        const diffMonths = (now.getFullYear() - pd.getFullYear()) * 12 + now.getMonth() - pd.getMonth();
        if (diffMonths >= 0 && diffMonths < 6) {
          revs[5 - diffMonths] += Number(p.amount) || 0;
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Revenue Collection (LKR)',
          data: revs,
          borderColor: colors.success,
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curve
          pointBackgroundColor: colors.success,
          pointBorderColor: isDark ? '#0f172a' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [payments, colors, isDark]);

  // 2. Room Occupancy by Hostel
  const occupancyData = useMemo(() => {
    const labels = [];
    const capacities = [];
    const occupied = [];

    hostels.forEach(h => {
      labels.push(h.hostel_name || h.name || 'Hostel');
      let hCap = 0;
      let hOcc = 0;
      
      const hRooms = rooms.filter(r => String(r.hostel_id) === String(h.id || h.hostel_id));
      hRooms.forEach(r => {
        hCap += Number(r.capacity || 0);
        // Count active allocations for this room
        const activeInRoom = allocations.filter(a => 
          String(a.room_id) === String(r.id || r.room_id) && 
          (a.status === 'Active' || a.status === 'Checked In')
        ).length;
        hOcc += activeInRoom;
      });

      capacities.push(hCap);
      occupied.push(hOcc);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Occupied Beds',
          data: occupied,
          backgroundColor: colors.primary,
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
        {
          label: 'Total Capacity',
          data: capacities,
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        }
      ]
    };
  }, [hostels, rooms, allocations, colors, isDark]);

  // 3. Complaints Breakdown
  const complaintsData = useMemo(() => {
    const categories = {};
    complaints.forEach(c => {
      const cat = c.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Default nice colors for doughnut
    const bgColors = [
      colors.danger, 
      colors.warning, 
      colors.primary, 
      colors.secondary, 
      colors.success,
      '#ec4899', // Pink
      '#06b6d4'  // Cyan
    ];

    return {
      labels: labels.length ? labels : ['No Complaints'],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: data.length ? bgColors.slice(0, labels.length) : [isDark ? '#334155' : '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4,
        }
      ]
    };
  }, [complaints, colors, isDark]);

  // 4. Revenue by Payment Mode
  const paymentModeData = useMemo(() => {
    const modes = {};
    payments.forEach(p => {
      if (p.status === 'Paid') {
        const mode = p.payment_mode || 'Cash';
        modes[mode] = (modes[mode] || 0) + Number(p.amount);
      }
    });

    const labels = Object.keys(modes);
    const data = Object.values(modes);
    const bgColors = [
      colors.success,
      colors.primary,
      colors.warning,
      colors.secondary
    ];

    return {
      labels: labels.length ? labels : ['No Data'],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: data.length ? bgColors.slice(0, labels.length) : [isDark ? '#334155' : '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4,
        }
      ]
    };
  }, [payments, colors, isDark]);

  // 5. Room Type Distribution
  const roomTypeData = useMemo(() => {
    const types = {};
    rooms.forEach(r => {
      const type = r.room_type || 'Standard';
      types[type] = (types[type] || 0) + 1;
    });

    const labels = Object.keys(types);
    const data = Object.values(types);
    const bgColors = [
      colors.secondary,
      colors.primary,
      '#ec4899', // Pink
      colors.warning
    ];

    return {
      labels: labels.length ? labels : ['No Data'],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: data.length ? bgColors.slice(0, labels.length) : [isDark ? '#334155' : '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4,
        }
      ]
    };
  }, [rooms, colors, isDark]);

  // Key Insights
  const totalRevenue = payments.reduce((sum, p) => p.status === 'Paid' ? sum + Number(p.amount) : sum, 0);
  const activeStudents = allocations.filter(a => a.status === 'Active').length;
  const resolutionRate = complaints.length > 0 
    ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 light:text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            System Analytics
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Comprehensive overview of hostel performance, revenue, and occupancy metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Revenue</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                LKR {totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Residents</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {activeStudents}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Hostels</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {hostels.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Issue Resolution</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {resolutionRate}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Revenue & Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Revenue Trend (Last 6 Months)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Payment Modes Doughnut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Revenue by Method
            </h3>
          </div>
          <div className="h-[280px] w-full relative flex items-center justify-center">
            <Doughnut data={paymentModeData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-10">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">LKR {(totalRevenue / 1000).toFixed(0)}k</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Occupancy & Room Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Hostel Occupancy & Capacity
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <Bar data={occupancyData} options={chartOptions} />
          </div>
        </div>

        {/* Room Types Doughnut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-500" />
              Room Type Distribution
            </h3>
          </div>
          <div className="h-[280px] w-full relative flex items-center justify-center">
            <Doughnut data={roomTypeData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-10">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{rooms.length}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Rooms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Complaints Doughnut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Complaints by Category
            </h3>
          </div>
          <div className="h-[280px] w-full relative flex items-center justify-center">
            <Doughnut data={complaintsData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-10">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{complaints.length}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Complaints</span>
            </div>
          </div>
        </div>

        {/* Creative System Summary Card */}
        <div className="group relative rounded-[2rem] shadow-2xl lg:col-span-2 flex flex-col justify-center overflow-hidden border border-slate-700/60 p-8 sm:p-10 transition-all duration-500 hover:shadow-blue-500/10 bg-slate-900">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-slate-900 z-0 mix-blend-overlay"></div>
          
          {/* Glowing Orbs */}
          <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-1000 ease-in-out z-0 pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[100px] group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-1000 ease-in-out z-0 pointer-events-none"></div>
          
          {/* Decorative Activity Line SVG */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none z-0 transform translate-x-12 group-hover:translate-x-8">
            <svg width="450" height="300" viewBox="0 0 450 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 150 H120 l40 -100 l50 200 l40 -140 l40 90 H450" stroke="white" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 mb-6 backdrop-blur-md shadow-lg shadow-black/20">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">System Live</span>
              </div>
              
              {/* Title & Description */}
              <h3 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 mb-4 tracking-tight drop-shadow-sm">
                Real-Time Summary
              </h3>
              <p className="text-slate-400 text-sm sm:text-base font-medium mb-8 max-w-xl leading-relaxed">
                Your Aegis platform is actively tracking <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{students.length}</span> students across <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{hostels.length}</span> hostel(s) and <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{rooms.length}</span> rooms. Below is your live operational data.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-auto">
              {/* Stat Block 1 */}
              <div className="group/stat relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover/stat:from-blue-500/10 group-hover/stat:to-transparent transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner border border-blue-500/20 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <p className="text-slate-300 text-sm font-semibold tracking-wide">Allocations</p>
                  </div>
                  <p className="text-white font-black text-4xl tracking-tight">{allocations.length}</p>
                </div>
              </div>

              {/* Stat Block 2 */}
              <div className="group/stat relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover/stat:from-emerald-500/10 group-hover/stat:to-transparent transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/20 group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-transform duration-300">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-slate-300 text-sm font-semibold tracking-wide">Payments</p>
                  </div>
                  <p className="text-white font-black text-4xl tracking-tight">{payments.length}</p>
                </div>
              </div>

              {/* Stat Block 3 */}
              <div className="group/stat relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/0 group-hover/stat:from-rose-500/10 group-hover/stat:to-transparent transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner border border-rose-500/20 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-slate-300 text-sm font-semibold tracking-wide">Pending Issues</p>
                  </div>
                  <p className="text-white font-black text-4xl tracking-tight">{complaints.filter(c => c.status !== 'Resolved').length}</p>
                </div>
              </div>

              {/* Stat Block 4 */}
              <div className="group/stat relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover/stat:from-amber-500/10 group-hover/stat:to-transparent transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner border border-amber-500/20 group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-transform duration-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-slate-300 text-sm font-semibold tracking-wide">Active Staff</p>
                  </div>
                  <p className="text-white font-black text-4xl tracking-tight">{staff.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
