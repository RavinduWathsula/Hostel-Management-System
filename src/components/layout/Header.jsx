import React from 'react';
import { Menu, Search, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({ onMobileMenuClick, searchTerm, setSearchTerm, dbOnline = true }) {
  const { admin } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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

        <div className="relative flex items-center w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, rooms, or receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
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
