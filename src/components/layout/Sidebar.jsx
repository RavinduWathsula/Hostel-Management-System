import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  CreditCard,
  AlertCircle,
  UserCheck,
  CalendarDays,
  UserPlus,
  ClipboardCheck,
  Sun,
  Moon,
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentView, setCurrentView = () => {}, counts = {}, mobileOpen = false, setMobileOpen = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Hostels & Rooms', icon: Building2 },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'allocations', label: 'Room Allocations', icon: KeyRound },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'complaints', label: 'Complaints Desk', icon: AlertCircle, badge: counts.complaints, badgeColor: 'bg-rose-500/20 text-rose-400' },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'leaves', label: 'Leave Applications', icon: CalendarDays, badge: counts.leaves, badgeColor: 'bg-purple-500/20 text-purple-400' },
    { id: 'visitors', label: 'Visitors Log', icon: UserPlus },
    { id: 'attendance', label: 'Daily Attendance', icon: ClipboardCheck },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 h-screen max-h-screen bg-dark-sidebar light:bg-white border-r border-dark-border light:border-slate-200 flex flex-col transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-dark-border light:border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-heading tracking-tight text-slate-100 light:text-slate-900 leading-none">
                AEGIS
              </h1>
              <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">
                Hostel System
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-100 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 min-h-0 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 shadow-sm'
                    : 'text-slate-400 light:text-slate-600 hover:bg-dark-hover light:hover:bg-slate-100 hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                      item.badgeColor || 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Logout */}
        <div className="p-4 border-t border-dark-border light:border-slate-200 space-y-2 mt-auto shrink-0 bg-dark-sidebar light:bg-white">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-dark-border light:border-slate-300 text-slate-400 light:text-slate-600 hover:bg-dark-hover light:hover:bg-slate-100 transition-colors text-sm font-semibold cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[11px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-800 light:bg-slate-200">
              {theme}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
