import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Phone, Mail, User, Contact, Calendar, BookOpen, GraduationCap, Home } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function StudentsView({ students = [], hostels = [], onAddStudent, onEditStudent, onDeleteStudent, searchTerm: externalSearchTerm = '' }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = externalSearchTerm || localSearchTerm;
  const [hostelFilter, setHostelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    admission_no: '',
    full_name: '',
    gender: 'Female',
    dob: '',
    phone: '',
    email: '',
    course: '',
    year_of_study: 1,
    address: '',
    guardian_name: '',
    guardian_phone: '',
    status: 'Active'
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      admission_no: `HS${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      gender: 'Female',
      dob: '',
      phone: '',
      email: '',
      course: '',
      year_of_study: 1,
      address: '',
      guardian_name: '',
      guardian_phone: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      admission_no: student.admission_no || '',
      full_name: student.full_name || '',
      gender: student.gender || 'Female',
      dob: student.dob ? String(student.dob).substring(0, 10) : '',
      phone: student.phone || '',
      email: student.email || '',
      course: student.course || '',
      year_of_study: student.year_of_study || 1,
      address: student.address || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      status: student.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const stId = editingStudent.student_id || editingStudent.id;
        await onEditStudent(stId, formData);
      } else {
        await onAddStudent(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving resident:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const query = String(searchTerm || '').toLowerCase().trim();
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const matchesSearch = !query ||
      (student.full_name || '').toLowerCase().includes(query) ||
      (student.admission_no || '').toLowerCase().includes(query) ||
      (student.email || '').toLowerCase().includes(query) ||
      (student.course || '').toLowerCase().includes(query);
    const matchesHostel = hostelFilter === 'ALL' || !hostelFilter || !student.hostel_id || String(student.hostel_id) === String(hostelFilter);
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesHostel && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Student Resident Directory
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Manage student profiles, emergency contacts, academic details, and residency state.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add New Resident</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-card light:bg-white p-4 rounded-2xl border border-dark-border light:border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student by name, admission no, or email..."
            value={searchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-dark-input light:bg-slate-100 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Vacated">Vacated</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Course / Year</th>
                <th className="px-6 py-4">Status & Action</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border light:divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const studentId = st.student_id || st.id;
                  return (
                    <tr key={studentId} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                            {st.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 light:text-slate-900">{st.full_name}</div>
                            <div className="text-xs text-slate-400 light:text-slate-500">{st.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-400 light:text-blue-600">
                        {st.admission_no}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-200 light:text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {st.phone}
                        </div>
                        <div className="text-xs text-slate-400 light:text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {st.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300 light:text-slate-700">
                        {st.course || 'General'} (Yr {st.year_of_study || 1})
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const currentStatus = (st.status && ['Active', 'Suspended', 'Vacated'].includes(st.status)) ? st.status : 'Active';
                          return (
                            <select
                              value={currentStatus}
                              onChange={(e) => onEditStudent(studentId, { ...st, status: e.target.value })}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer transition-all ${
                                currentStatus === 'Active'
                                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                                  : currentStatus === 'Suspended'
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              }`}
                            >
                              <option value="Active" className="bg-slate-900 text-emerald-400">Active</option>
                              <option value="Suspended" className="bg-slate-900 text-rose-400">Suspended</option>
                              <option value="Vacated" className="bg-slate-900 text-amber-400">Vacated</option>
                            </select>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            className="w-8 h-8 rounded-lg border border-dark-border light:border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/40 transition-colors"
                            title="Edit Student Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(studentId)}
                            className="w-8 h-8 rounded-lg border border-dark-border light:border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Modify Resident Details' : 'Register New Resident'}
        subtitle="Provide student profile, academic, and emergency contact details"
        icon={Contact}
        themeClass="from-blue-600 to-indigo-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest border-b border-dark-border light:border-slate-200 pb-1 mb-2">
            1. Personal Profile
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Admission No <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Contact className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.admission_no}
                  onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Student's Full Name"
                  className="w-full pl-9 pr-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Mobile Contact"
                  className="w-full pl-9 pr-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest border-b border-dark-border light:border-slate-200 pb-1 pt-2 mb-2">
            2. Academic Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Course / Department
              </label>
              <div className="relative flex items-center">
                <BookOpen className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="BSc Computer Science"
                  className="w-full pl-9 pr-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Year of Study
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest border-b border-dark-border light:border-slate-200 pb-1 pt-2 mb-2">
            3. Guardian & Residence
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Permanent Home Address"
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  placeholder="Parent or Guardian"
                  className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                  Guardian Phone
                </label>
                <input
                  type="tel"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  placeholder="Emergency Phone"
                  className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {editingStudent && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Resident Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Vacated">Vacated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-semibold text-sm hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Saving...' : (editingStudent ? 'Save Changes' : 'Register Student')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
