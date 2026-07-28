import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, subtitle, icon: Icon, themeClass = 'from-blue-600 to-indigo-600', children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-slate-900 dark:bg-dark-card light:bg-white border border-slate-800 dark:border-dark-border light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden transform transition-all`}>
        {/* Modal Gradient Header */}
        <div className={`relative px-6 py-5 bg-gradient-to-r ${themeClass} text-white flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-lg">
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold font-heading tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-white/80 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900 dark:bg-dark-card light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
}
