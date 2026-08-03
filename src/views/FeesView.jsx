import React, { useState } from 'react';
import { CreditCard, Plus, Receipt, Wallet, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { KpiCard } from '../components/common/KpiCard';

export function FeesView({ feeSummary = [], feePayments = [], students = [], onRecordFee, searchTerm = '' }) {
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'dues'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    student_id: '',
    fee_type: 'Hostel Fee',
    amount: '',
    payment_mode: 'Cash',
    payment_date: new Date().toISOString().substring(0, 10),
    month_for: '',
    receipt_no: '',
    remarks: ''
  });

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const totalCollected = feePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalDue = feeSummary.reduce((acc, s) => acc + Number(s.total_due || 0), 0);

  const handleOpenModal = (studentId = '') => {
    setFormData({
      student_id: studentId,
      fee_type: 'Hostel Fee',
      amount: '',
      payment_mode: 'Cash',
      payment_date: new Date().toISOString().substring(0, 10),
      month_for: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      receipt_no: `RCPT-${Date.now().toString().slice(-6)}`,
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.amount) {
      alert('Please select a student and enter a valid amount.');
      return;
    }
    const res = await onRecordFee(formData);
    if (res && res.success !== false) {
      setIsModalOpen(false);
    }
  };

  const effectiveSearch = (searchTerm || searchQuery).toLowerCase().trim();

  // Filter payments
  const filteredPayments = feePayments.filter(p => {
    const query = effectiveSearch;
    if (!query) return true;
    const studentName = (p.student_name || p.full_name || '').toLowerCase();
    const admissionNo = (p.admission_no || '').toLowerCase();
    const receiptNo = (p.receipt_no || '').toLowerCase();
    const feeType = (p.fee_type || '').toLowerCase();
    return studentName.includes(query) || admissionNo.includes(query) || receiptNo.includes(query) || feeType.includes(query);
  });

  // Filter summaries
  const filteredSummaries = feeSummary.filter(s => {
    const query = effectiveSearch;
    if (!query) return true;
    const studentName = (s.full_name || '').toLowerCase();
    const admissionNo = (s.admission_no || '').toLowerCase();
    return studentName.includes(query) || admissionNo.includes(query);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 light:text-slate-900 tracking-tight">
            Fee & Payment Management
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
            Track student monthly dues, payment receipts, and revenue records.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Total Revenue Collected" value={formatLKR(totalCollected)} icon={Wallet} color="green" />
        <KpiCard title="Total Outstanding Dues" value={formatLKR(totalDue)} icon={AlertCircle} color="amber" />
        <KpiCard title="Transactions Logged" value={feePayments.length} icon={Receipt} color="purple" />
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-dark-card light:bg-white p-4 border border-dark-border light:border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-900/60 light:bg-slate-100 p-1 rounded-xl border border-dark-border light:border-slate-200">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 light:text-slate-600 hover:text-slate-200'
            }`}
          >
            Payment Logs ({feePayments.length})
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'dues'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 light:text-slate-600 hover:text-slate-200'
            }`}
          >
            Student Dues & Profiles ({feeSummary.length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, receipt, or fee type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-200 rounded-xl text-xs md:text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TAB 1: Payment History Data Table */}
      {activeTab === 'payments' && (
        <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-dark-border light:border-slate-200 font-bold font-heading text-lg text-slate-100 light:text-slate-900 flex items-center justify-between">
            <span>Recent Payment Logs</span>
            <span className="text-xs text-slate-400 font-normal">Showing {filteredPayments.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
                <tr>
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Fee Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Month For</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border light:divide-slate-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                      {searchQuery ? 'No payment records match your search query.' : 'No payment records logged yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.payment_id || p.id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400 light:text-blue-600">
                        {p.receipt_no || `REC-${p.payment_id || p.id}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-100 light:text-slate-900">
                        {p.student_name || p.full_name || 'N/A'} <span className="text-xs text-slate-400">({p.admission_no || 'N/A'})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 light:bg-blue-100 light:text-blue-700">
                          {p.fee_type || 'Hostel Fee'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-500 font-mono">
                        {formatLKR(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300 light:text-slate-700">
                        {p.payment_mode || 'Cash'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 light:text-slate-600">
                        {p.month_for || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 light:text-slate-600">
                        {p.payment_date ? p.payment_date.substring(0, 10) : (p.created_at ? p.created_at.substring(0, 10) : 'N/A')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Student Dues & Billing Summary */}
      {activeTab === 'dues' && (
        <div className="bg-dark-card light:bg-white border border-dark-border light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-dark-border light:border-slate-200 font-bold font-heading text-lg text-slate-100 light:text-slate-900 flex items-center justify-between">
            <span>Student Billing & Dues Summary</span>
            <span className="text-xs text-slate-400 font-normal">Showing {filteredSummaries.length} billing profiles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-dark-border light:border-slate-200">
                <tr>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Total Paid</th>
                  <th className="px-6 py-4">Outstanding Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border light:divide-slate-200">
                {filteredSummaries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 light:text-slate-500">
                      {searchQuery ? 'No student billing profiles match your search query.' : 'No student billing data available.'}
                    </td>
                  </tr>
                ) : (
                  filteredSummaries.map(s => {
                    const paid = Number(s.total_paid || 0);
                    const due = Number(s.total_due || 0);
                    const isSettled = due === 0;

                    return (
                      <tr key={s.student_id} className="hover:bg-dark-hover light:hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-300 light:text-slate-700">
                          {s.admission_no}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-100 light:text-slate-900">
                          {s.full_name}
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                          {formatLKR(paid)}
                        </td>
                        <td className={`px-6 py-4 font-mono font-semibold ${due > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatLKR(due)}
                        </td>
                        <td className="px-6 py-4">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 light:bg-emerald-100 light:text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-700">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenModal(s.student_id.toString())}
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-medium text-xs transition-colors"
                          >
                            Collect Fee
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Fee Payment Receipt"
        subtitle="Log student fee collection and issue receipt"
        icon={Receipt}
        themeClass="from-blue-600 to-purple-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
              Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Student --</option>
              {students.map(st => (
                <option key={st.student_id || st.id} value={st.student_id || st.id}>
                  {st.full_name} ({st.admission_no || `ID: ${st.student_id || st.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Fee Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.fee_type}
                onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Hostel Fee">Hostel Monthly Fee</option>
                <option value="Mess Fee">Mess & Food Fee</option>
                <option value="Caution Deposit">Caution / Security Deposit</option>
                <option value="Utility Fee">Electricity & Utility Fee</option>
                <option value="Other">Other / Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Amount (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Payment Mode <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Online / Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Month For
              </label>
              <input
                type="text"
                placeholder="e.g. July 2026"
                value={formData.month_for}
                onChange={(e) => setFormData({ ...formData, month_for: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receipt_no}
                onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm font-mono text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 light:text-slate-600 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-input light:bg-slate-50 border border-dark-border light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border light:border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-semibold text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20"
            >
              Log Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
