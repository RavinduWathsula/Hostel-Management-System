import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export function StudentSearchSelect({ 
  students = [], 
  value, 
  onChange, 
  placeholder = "-- Select Resident Student --",
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedStudent = students.find(s => String(s.student_id || s.id) === String(value));

  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase().trim();
    const name = (s.full_name || s.name || '').toLowerCase();
    const adm = (s.admission_no || '').toLowerCase();
    const course = (s.course || '').toLowerCase();
    return name.includes(query) || adm.includes(query) || course.includes(query);
  });

  const handleSelect = (sId) => {
    onChange(sId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native select for form validation if required */}
      {required && (
        <select
          required={required}
          value={value || ''}
          onChange={() => {}}
          tabIndex={-1}
          className="sr-only absolute pointer-events-none"
        >
          <option value="">{placeholder}</option>
          {students.map(s => (
            <option key={s.student_id || s.id} value={s.student_id || s.id}>
              {s.full_name || s.name}
            </option>
          ))}
        </select>
      )}

      {/* Select Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-3.5 py-2.5 bg-dark-input light:bg-slate-50 border rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
          isOpen 
            ? 'border-blue-500 ring-1 ring-blue-500/20' 
            : 'border-dark-border light:border-slate-300 hover:border-slate-500'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedStudent ? (
            <>
              <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                {(selectedStudent.full_name || selectedStudent.name || 'S')[0].toUpperCase()}
              </div>
              <span className="font-semibold text-slate-100 light:text-slate-900 truncate">
                {selectedStudent.full_name || selectedStudent.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                ({selectedStudent.admission_no || `ID: ${selectedStudent.student_id || selectedStudent.id}`})
              </span>
            </>
          ) : (
            <span className="text-slate-400 light:text-slate-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && (
            <span
              onClick={handleClear}
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
        </div>
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-slate-900 light:bg-white border border-slate-700 light:border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Search Bar Input */}
          <div className="p-2 border-b border-slate-800 light:border-slate-200 bg-slate-900/90 light:bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by student name, admission no, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-800 light:bg-white border border-slate-700 light:border-slate-300 rounded-lg text-xs text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/40 light:divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No resident student matching "{searchTerm}"
              </div>
            ) : (
              filteredStudents.map(s => {
                const sId = s.student_id || s.id;
                const isSelected = String(sId) === String(value);
                const isSuspended = s.status === 'Suspended';

                return (
                  <div
                    key={sId}
                    onClick={() => !isSuspended && handleSelect(sId)}
                    className={`px-3 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSuspended
                        ? 'opacity-50 cursor-not-allowed bg-slate-950/40'
                        : isSelected
                        ? 'bg-blue-600/20 text-blue-300 font-semibold'
                        : 'hover:bg-slate-800/80 light:hover:bg-slate-100 text-slate-200 light:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700'
                      }`}>
                        {(s.full_name || s.name || 'S')[0].toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>{s.full_name || s.name}</span>
                          {isSuspended && (
                            <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.admission_no || `ID: ${sId}`} {s.course ? `• ${s.course}` : ''}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
