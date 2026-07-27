// ==========================================================================
// AEGIS FRONTEND CONTROLLER (VANILLA JS SINGLE PAGE APPLICATION)
// ==========================================================================

const API_BASE = '/api';

// State Management
const state = {
  activeView: 'dashboard',
  theme: 'dark',
  token: localStorage.getItem('aegis_admin_token') || null,
  currentUser: null,
  students: [],
  rooms: [],
  staff: [],
  allocations: []
};

// ==========================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupNavigation();
  setupEventListeners();
  setupAuthEventListeners();
  setupMobileDrawer();
  checkAuth();
  startLiveDate();
});

// Authentication Checker
async function checkAuth() {
  const token = localStorage.getItem('aegis_admin_token');
  if (!token) {
    showAuthView();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.success && data.user) {
      state.currentUser = data.user;
      state.token = token;
      updateProfileUI(data.user);
      showMainLayout();
    } else {
      clearAuth();
      showAuthView();
    }
  } catch (err) {
    console.error('Auth verification check:', err);
    // If backend endpoint reachable but auth fails or offline
    showAuthView();
  }
}

function updateProfileUI(user) {
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role');
  if (nameEl) nameEl.textContent = user.full_name || 'System Admin';
  if (roleEl) roleEl.textContent = user.role || 'Hostel Admin';
}

function showAuthView() {
  const authContainer = document.getElementById('auth-container');
  const mainLayout = document.getElementById('app-main-layout');
  if (authContainer) authContainer.classList.remove('hidden');
  if (mainLayout) mainLayout.classList.add('hidden');
}

function showMainLayout() {
  const authContainer = document.getElementById('auth-container');
  const mainLayout = document.getElementById('app-main-layout');
  if (authContainer) authContainer.classList.add('hidden');
  if (mainLayout) mainLayout.classList.remove('hidden');
  switchView(state.activeView);
}

function clearAuth() {
  localStorage.removeItem('aegis_admin_token');
  state.token = null;
  state.currentUser = null;
}

// Authentication Forms & User Session Handlers
function setupAuthEventListeners() {
  // Toggle Password Visibility
  document.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
          input.type = 'password';
          btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
      }
    });
  });

  // Switch between Login and Register views
  const switchReg = document.getElementById('switch-to-register');
  const switchLogin = document.getElementById('switch-to-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authSubtitle = document.getElementById('auth-subtitle');

  if (switchReg) {
    switchReg.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      if (authSubtitle) authSubtitle.textContent = 'Create a new admin account to manage Aegis Hostel Hubs.';
    });
  }

  if (switchLogin) {
    switchLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      if (authSubtitle) authSubtitle.textContent = 'Welcome back! Sign in to access the hostel administration panel.';
    });
  }

  // Submit Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('btn-login-submit');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const res = await response.json();

        if (res.success) {
          localStorage.setItem('aegis_admin_token', res.token);
          state.token = res.token;
          state.currentUser = res.user;
          updateProfileUI(res.user);
          showToast('Welcome back, ' + res.user.full_name + '!', 'success');
          showMainLayout();
          loginForm.reset();
        } else {
          showToast(res.error || 'Invalid credentials', 'error');
        }
      } catch (err) {
        showToast('Login failed. Please check server connection.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Sign in';
      }
    });
  }

  // Submit Register Form
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('reg-fullname').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const btn = document.getElementById('btn-register-submit');

      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name, email, password })
        });
        const res = await response.json();

        if (res.success) {
          localStorage.setItem('aegis_admin_token', res.token);
          state.token = res.token;
          state.currentUser = res.user;
          updateProfileUI(res.user);
          showToast('Admin account registered successfully!', 'success');
          showMainLayout();
          registerForm.reset();
        } else {
          showToast(res.error || 'Registration failed', 'error');
        }
      } catch (err) {
        showToast('Registration error. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Create account';
      }
    });
  }

  // Logout actions
  const logoutHeaderBtn = document.getElementById('logout-btn');
  const logoutSidebarBtn = document.getElementById('sidebar-logout-btn');

  const handleLogout = () => {
    clearAuth();
    showAuthView();
    showToast('Logged out successfully', 'success');
  };

  if (logoutHeaderBtn) logoutHeaderBtn.addEventListener('click', handleLogout);
  if (logoutSidebarBtn) logoutSidebarBtn.addEventListener('click', handleLogout);
}

// Mobile Navigation Drawer Setup
function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');

  const openDrawer = () => {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('active');
  };

  const closeDrawer = () => {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

// Theme Setup
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  state.theme = savedTheme;
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    document.getElementById('theme-toggle-btn').innerHTML = '<i class="fa-solid fa-sun"></i><span>Light Mode</span>';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    document.getElementById('theme-toggle-btn').innerHTML = '<i class="fa-solid fa-moon"></i><span>Dark Mode</span>';
  }
}

// Navigation & Routing Setup
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });

  // Room view inner tabs
  const roomTabBtns = document.querySelectorAll('[data-rooms-tab]');
  roomTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roomTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-rooms-tab');
      document.getElementById('rooms-inventory-tab').classList.toggle('hidden', targetTab !== 'inventory');
      document.getElementById('rooms-allocations-tab').classList.toggle('hidden', targetTab !== 'allocations');
      if (targetTab === 'allocations') {
        loadAllocationsTable();
      } else {
        loadRoomsInventoryGrid();
      }
    });
  });

  // Fees view inner tabs
  const feeTabBtns = document.querySelectorAll('[data-fees-tab]');
  feeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      feeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-fees-tab');
      document.getElementById('fees-summary-tab').classList.toggle('hidden', targetTab !== 'summary');
      document.getElementById('fees-history-tab').classList.toggle('hidden', targetTab !== 'history');
      if (targetTab === 'history') {
        loadPaymentHistory();
      } else {
        loadFeeSummary();
      }
    });
  });
}

function switchView(viewName) {
  state.activeView = viewName;
  
  // Update nav UI active class
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewName);
  });

  // Hide all view sections
  document.querySelectorAll('.content-view').forEach(view => {
    view.classList.add('hidden');
  });

  // Show active view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Load view-specific data
  loadViewData(viewName);
}

// Global Event Listeners (Forms & Actions)
function setupEventListeners() {
  // Theme Toggle Button
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    if (state.theme === 'dark') {
      state.theme = 'light';
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.getElementById('theme-toggle-btn').innerHTML = '<i class="fa-solid fa-sun"></i><span>Light Mode</span>';
    } else {
      state.theme = 'dark';
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.getElementById('theme-toggle-btn').innerHTML = '<i class="fa-solid fa-moon"></i><span>Dark Mode</span>';
    }
    localStorage.setItem('theme', state.theme);
  });

  // Form Submissions
  setupFormSubmit('student-form', '/students', 'add-student-modal', () => switchView('students'));
  setupFormSubmit('allocate-form', '/allocations', 'allocate-room-modal', () => {
    switchView('rooms');
    document.querySelector('[data-rooms-tab="allocations"]').click();
  });
  setupFormSubmit('pay-fee-form', '/payments', 'pay-fee-modal', () => {
    switchView('fees');
    document.querySelector('[data-fees-tab="history"]').click();
  });

  setupFormSubmit('complaint-form', '/complaints', 'add-complaint-modal', () => switchView('complaints'));
  setupFormSubmit('staff-form', '/staff', 'add-staff-modal', () => switchView('staff'));
  setupFormSubmit('leave-form', '/leaves', 'apply-leave-modal', () => switchView('leaves'));
  setupFormSubmit('visitor-form', '/visitors', 'add-visitor-modal', () => switchView('visitors'));

  // Assign staff form
  document.getElementById('assign-staff-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const complaintId = document.getElementById('assign-complaint-id').value;
    const staffId = document.getElementById('assign-staff-select').value;
    try {
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId })
      });
      const res = await response.json();
      if (res.success) {
        showToast(res.message);
        closeModal('assign-staff-modal');
        loadComplaints();
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      showToast('Error assigning staff member', 'error');
    }
  });

  // Approve leave form
  document.getElementById('approve-leave-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const leaveId = document.getElementById('approve-leave-id').value;
    const status = document.getElementById('approve-leave-status').value;
    const wardenId = document.getElementById('approve-warden-select').value;
    try {
      const response = await fetch(`${API_BASE}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status, approved_by: wardenId })
      });
      const res = await response.json();
      if (res.success) {
        showToast(res.message);
        closeModal('approve-leave-modal');
        loadLeaves();
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      showToast('Error updating leave status', 'error');
    }
  });

  // Student list search & filters
  document.getElementById('student-search-input').addEventListener('input', debounce(filterStudents, 300));
  document.getElementById('student-status-filter').addEventListener('change', filterStudents);

  // Global search input in Header
  document.getElementById('global-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value;
      if (q.trim() !== '') {
        switchView('students');
        document.getElementById('student-search-input').value = q;
        filterStudents();
      }
    }
  });

  // Attendance date change
  document.getElementById('attendance-datepicker').addEventListener('change', (e) => {
    loadAttendanceSheet(e.target.value);
  });
  
  // Save attendance
  document.getElementById('save-attendance-btn').addEventListener('click', saveAttendanceSheet);

  // Attendance graph pickers
  setupAttendanceGraphListeners();
}

// Helper: Setup Standard Form Posts
function setupFormSubmit(formId, endpoint, modalId, onSuccess) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {};
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
      if (el.id) {
        // Strip out the prefix if exists, then convert dashes to underscores
        let key = el.id.replace(/^(student-|allocate-|fee-|complaint-|staff-|leave-|visitor-)/, '').replace(/-/g, '_');
        // Special fix: fee form's "type" field must map to "fee_type" for the API
        if (formId === 'pay-fee-form' && el.id === 'fee-type') {
          key = 'fee_type';
        }
        if (el.type === 'number') {
          formData[key] = parseFloat(el.value);
        } else {
          formData[key] = el.value === '' ? null : el.value;
        }
      }
    });

    // Check if it is a PUT edit or POST insert for student
    let method = 'POST';
    let url = `${API_BASE}${endpoint}`;
    if (formId === 'student-form' && formData['id']) {
      method = 'PUT';
      url = `${API_BASE}/students/${formData['id']}`;
    }

    // Show loading state on submit button
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const res = await response.json();
      if (res.success) {
        showToast(res.message || 'Record saved successfully');
        form.reset();
        closeModal(modalId);
        if (onSuccess) onSuccess();
      } else {
        showToast(res.error || 'Server error occurred', 'error');
      }
    } catch (err) {
      showToast('API communication failure', 'error');
      console.error(err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });
}


// ==========================================
// VIEW ROUTER DATA LOADER
// ==========================================
function loadViewData(view) {
  switch (view) {
    case 'dashboard':
      loadDashboardStats();
      break;
    case 'students':
      loadStudentsList();
      break;
    case 'rooms':
      const activeRoomsTab = document.querySelector('[data-rooms-tab].active').getAttribute('data-rooms-tab');
      if (activeRoomsTab === 'allocations') {
        loadAllocationsTable();
      } else {
        loadRoomsInventoryGrid();
      }
      break;
    case 'fees':
      const activeFeesTab = document.querySelector('[data-fees-tab].active').getAttribute('data-fees-tab');
      if (activeFeesTab === 'history') {
        loadPaymentHistory();
      } else {
        loadFeeSummary();
      }
      break;
    case 'complaints':
      loadComplaints();
      break;
    case 'attendance':
      // Default to today
      const todayStr = new Date().toISOString().split('T')[0];
      const picker = document.getElementById('attendance-datepicker');
      if (!picker.value) picker.value = todayStr;
      loadAttendanceSheet(picker.value);
      break;
    case 'leaves':
      loadLeaves();
      break;
    case 'visitors':
      loadVisitors();
      break;
    case 'staff':
      loadStaff();
      break;
  }
}

// ==========================================
// DATABASE ONLINE/OFFLINE VALIDATION
// ==========================================
async function checkDatabaseConnection() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const data = await res.json();
    if (res.status === 503 || !data.success) {
      showDbError(data.error || 'Connection Failed');
    } else {
      document.getElementById('db-error-overlay').classList.add('hidden');
      loadDashboardStats();
      preloadDropdownData();
    }
  } catch (err) {
    showDbError('Backend server is not reachable. Please start Node server first.');
  }
}

function showDbError(msg) {
  document.getElementById('db-error-overlay').classList.remove('hidden');
  document.getElementById('db-error-msg').innerText = msg;
}

// Preload list of students and rooms for various select fields
async function preloadDropdownData() {
  try {
    // 1. Get Students
    const resStudents = await fetch(`${API_BASE}/students?status=Active`);
    const studentsData = await resStudents.json();
    if (studentsData.success) {
      state.students = studentsData.data;
      populateStudentsDropdowns();
    }

    // 2. Get Rooms
    const resRooms = await fetch(`${API_BASE}/rooms`);
    const roomsData = await resRooms.json();
    if (roomsData.success) {
      state.rooms = roomsData.data;
      populateRoomsDropdowns();
    }

    // 3. Get Staff
    const resStaff = await fetch(`${API_BASE}/staff`);
    const staffData = await resStaff.json();
    if (staffData.success) {
      state.staff = staffData.data;
      populateStaffDropdowns();
    }
  } catch (err) {
    console.error('Error preloading dropdown details', err);
  }
}

function populateStudentsDropdowns() {
  const dropdownIds = ['allocate-student-id', 'fee-student-id', 'complaint-student-id', 'leave-student-id', 'visitor-student-id'];
  dropdownIds.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    
    const currVal = select.value;
    select.innerHTML = '<option value="">— Choose Student —</option>';
    state.students.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.student_id;
      opt.textContent = `${st.full_name} (${st.admission_no})`;
      select.appendChild(opt);
    });
    if (currVal) select.value = currVal;
  });
}

function populateRoomsDropdowns() {
  const select = document.getElementById('allocate-room-id');
  const complaintSelect = document.getElementById('complaint-room-id');
  
  if (select) {
    const currVal = select.value;
    select.innerHTML = '<option value="">— Choose Room —</option>';
    state.rooms.forEach(r => {
      const avail = r.capacity - r.occupied_seats;
      const opt = document.createElement('option');
      opt.value = r.room_id;
      opt.textContent = `${r.hostel_name} - Room ${r.room_number} (${avail} free)`;
      if (avail <= 0) opt.disabled = true;
      select.appendChild(opt);
    });
    if (currVal) select.value = currVal;
  }

  if (complaintSelect) {
    const currVal = complaintSelect.value;
    complaintSelect.innerHTML = '<option value="">— None / Select Room —</option>';
    state.rooms.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.room_id;
      opt.textContent = `${r.hostel_name} - Room ${r.room_number}`;
      complaintSelect.appendChild(opt);
    });
    if (currVal) complaintSelect.value = currVal;
  }
}

function populateStaffDropdowns() {
  const assignSelect = document.getElementById('assign-staff-select');
  const complaintFormStaffSelect = document.getElementById('complaint-assigned-staff-id');
  const wardenSelect = document.getElementById('approve-warden-select');

  if (assignSelect) {
    const currVal = assignSelect.value;
    assignSelect.innerHTML = '<option value="">— Select Staff Member —</option>';
    state.staff.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.staff_id;
      opt.textContent = `${s.full_name} (${s.designation})`;
      assignSelect.appendChild(opt);
    });
    if (currVal) assignSelect.value = currVal;
  }

  if (complaintFormStaffSelect) {
    const currVal = complaintFormStaffSelect.value;
    complaintFormStaffSelect.innerHTML = '<option value="">— Unassigned —</option>';
    state.staff.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.staff_id;
      opt.textContent = `${s.full_name} (${s.designation})`;
      complaintFormStaffSelect.appendChild(opt);
    });
    if (currVal) complaintFormStaffSelect.value = currVal;
  }

  if (wardenSelect) {
    const currVal = wardenSelect.value;
    wardenSelect.innerHTML = '<option value="">— Select Approving Warden —</option>';
    const wardens = state.staff.filter(s => s.designation.includes('Warden'));
    const listToUse = wardens.length > 0 ? wardens : state.staff;
    listToUse.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.staff_id;
      opt.textContent = `${s.full_name} (${s.designation})`;
      wardenSelect.appendChild(opt);
    });
    if (currVal) wardenSelect.value = currVal;
  }
}


// ==========================================
// VIEW 1: DASHBOARD PANEL
// ==========================================
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const data = await res.json();
    if (!data.success) return;

    const s = data.stats;
    document.getElementById('stat-students').innerText = s.totalStudents;
    document.getElementById('stat-occupancy').innerText = `${s.occupiedSeats} / ${s.totalCapacity}`;
    document.getElementById('stat-complaints').innerText = s.openComplaints;
    
    // Format currency LKR
    document.getElementById('stat-revenue').innerText = formatLKR(s.totalPaidFees);
    document.getElementById('stat-due').innerText = `${formatLKR(s.totalDueFees)} Outstanding`;

    // Highlight complaints badge in sidebar
    const badge = document.getElementById('complaints-alert-badge');
    if (s.openComplaints > 0) {
      badge.classList.remove('hidden');
      badge.innerText = s.openComplaints;
    } else {
      badge.classList.add('hidden');
    }

    // Set occupancy progress bar
    const occPerc = s.totalCapacity > 0 ? (s.occupiedSeats / s.totalCapacity) * 100 : 0;
    document.getElementById('occupancy-progress').style.width = `${occPerc}%`;

    // Render hostel building progress summaries
    const container = document.getElementById('hostel-distribution-list');
    container.innerHTML = '';
    s.hostels.forEach(h => {
      const totalSeats = parseInt(h.total_rooms || 0) * 2; // Approximate estimation
      const occPercHostel = h.total_rooms > 0 ? (parseInt(h.occupied || 0) / (h.total_rooms * 2)) * 100 : 0; // estimate
      
      const item = document.createElement('div');
      item.className = 'hostel-occupancy-item';
      item.innerHTML = `
        <div class="hostel-info-row">
          <span class="hostel-name-tag">${h.hostel_name}</span>
          <span class="hostel-occupancy-tag">${h.occupied || 0} active allocations</span>
        </div>
        <div class="hostel-progress-bar">
          <div class="hostel-progress-fill" style="width: ${Math.min(occPercHostel + 10, 100)}%"></div>
        </div>
      `;
      container.appendChild(item);
    });

  } catch (err) {
    console.error('Error fetching dashboard statistics', err);
  }
}

// ==========================================
// VIEW 2: STUDENTS DIRECTORY
// ==========================================
async function loadStudentsList() {
  try {
    const res = await fetch(`${API_BASE}/students`);
    const data = await res.json();
    if (data.success) {
      state.students = data.data;
      renderStudentsTable(state.students);
      populateStudentsDropdowns(); // Keep dropdowns fresh
    }
  } catch (err) {
    showToast('Failed to load student directory', 'error');
  }
}

function renderStudentsTable(list) {
  const tbody = document.getElementById('students-table-body');
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">No student records found.</td></tr>`;
    return;
  }

  list.forEach(st => {
    const tr = document.createElement('tr');
    
    // Status Badge
    let statusClass = 'badge-secondary';
    if (st.status === 'Active') statusClass = 'badge-success';
    else if (st.status === 'Suspended') statusClass = 'badge-danger';
    else if (st.status === 'Vacated') statusClass = 'badge-warning';

    tr.innerHTML = `
      <td><strong>${st.admission_no}</strong></td>
      <td>
        <div class="cell-student-info">
          <h5>${st.full_name}</h5>
        </div>
      </td>
      <td>
        <div>${st.gender}</div>
        <div class="cell-sub-info">${st.dob ? formatDate(st.dob) : 'No DOB'}</div>
      </td>
      <td>
        <div><i class="fa-solid fa-phone" style="font-size:11px; margin-right:4px;"></i> ${st.phone}</div>
        <div class="cell-sub-info"><i class="fa-solid fa-envelope" style="font-size:11px; margin-right:4px;"></i> ${st.email || 'N/A'}</div>
      </td>
      <td>
        <div>${st.course || 'N/A'}</div>
        <div class="cell-sub-info">Year ${st.year_of_study || 1}</div>
      </td>
      <td><span class="badge ${statusClass}">${st.status}</span></td>
      <td>
        <div class="action-buttons-cell">
          <button class="btn-icon edit" onclick="editStudent(${st.student_id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-icon delete" onclick="deleteStudent(${st.student_id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterStudents() {
  const searchVal = document.getElementById('student-search-input').value.toLowerCase();
  const statusFilter = document.getElementById('student-status-filter').value;

  const filtered = state.students.filter(st => {
    const matchesSearch = st.full_name.toLowerCase().includes(searchVal) ||
      st.admission_no.toLowerCase().includes(searchVal) ||
      (st.email && st.email.toLowerCase().includes(searchVal));
    const matchesStatus = statusFilter === '' || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  renderStudentsTable(filtered);
}

function editStudent(id) {
  const st = state.students.find(s => s.student_id === id);
  if (!st) return;

  // Fill form
  document.getElementById('student-id').value = st.student_id;
  document.getElementById('student-admission-no').value = st.admission_no;
  document.getElementById('student-full-name').value = st.full_name;
  document.getElementById('student-gender').value = st.gender;
  document.getElementById('student-dob').value = st.dob ? st.dob.split('T')[0] : '';
  document.getElementById('student-phone').value = st.phone;
  document.getElementById('student-email').value = st.email || '';
  document.getElementById('student-course').value = st.course || '';
  document.getElementById('student-year-of-study').value = st.year_of_study || 1;
  document.getElementById('student-address').value = st.address || '';
  document.getElementById('student-guardian-name').value = st.guardian_name || '';
  document.getElementById('student-guardian-phone').value = st.guardian_phone || '';
  
  // Show status select
  document.getElementById('student-status-group').classList.remove('hidden');
  document.getElementById('student-status').value = st.status;

  // Change heading and open
  document.querySelector('#add-student-modal h3').innerText = 'Modify Student details';
  openModal('add-student-modal');
}

async function deleteStudent(id) {
  if (confirm('Are you absolutely sure you want to permanently delete this student record? This action will impact attendance and fee logs.')) {
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadStudentsList();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Failed to delete student', 'error');
    }
  }
}

// ==========================================
// VIEW 3: ROOMS & ALLOCATIONS
// ==========================================
async function loadRoomsInventoryGrid() {
  try {
    const res = await fetch(`${API_BASE}/rooms`);
    const data = await res.json();
    if (!data.success) return;

    state.rooms = data.data;
    populateRoomsDropdowns();

    const grid = document.getElementById('room-inventory-grid');
    grid.innerHTML = '';

    state.rooms.forEach(r => {
      const card = document.createElement('div');
      card.className = 'room-card';
      
      // Determine status badge
      let statusClass = 'badge-success';
      if (r.status === 'Full') statusClass = 'badge-danger';
      else if (r.status === 'Maintenance') statusClass = 'badge-warning';

      // Generate bed spots representation
      let bedDots = '';
      for (let i = 1; i <= r.capacity; i++) {
        const isOccupied = i <= r.occupied_seats;
        bedDots += `<span class="bed-dot ${isOccupied ? 'occupied' : ''}" title="Bed ${i} - ${isOccupied ? 'Occupied' : 'Free'}"></span>`;
      }

      card.innerHTML = `
        <div class="room-card-header">
          <div>
            <span class="room-tag">${r.hostel_name}</span>
            <h4 class="room-number-title">Room ${r.room_number}</h4>
          </div>
          <span class="badge ${statusClass}">${r.status}</span>
        </div>
        <div class="room-card-body">
          <ul class="room-details-list">
            <li><i class="fa-solid fa-layer-group"></i> Floor ${r.floor_number}</li>
            <li><i class="fa-solid fa-arrows-to-eye"></i> ${r.room_type} sharing</li>
            <li><i class="fa-solid fa-users"></i> ${r.occupied_seats} / ${r.capacity} Occupied</li>
          </ul>
          <div class="room-beds-container">
            <span class="bed-spots-title">Bed Layout</span>
            <div class="bed-spots-grid">${bedDots}</div>
          </div>
        </div>
        <div class="room-card-footer">
          <div class="room-rent">${formatLKR(r.monthly_rent)}<span>/mo</span></div>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    showToast('Failed to load room layouts', 'error');
  }
}

async function loadAllocationsTable() {
  try {
    const res = await fetch(`${API_BASE}/allocations/active`);
    const data = await res.json();
    if (!data.success) return;

    state.allocations = data.data;

    const tbody = document.getElementById('allocations-table-body');
    tbody.innerHTML = '';

    if (state.allocations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">No active allocations found.</td></tr>`;
      return;
    }

    state.allocations.forEach(al => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${al.student_name}</strong></td>
        <td><code>${al.admission_no}</code></td>
        <td>${al.hostel_name}</td>
        <td>Room ${al.room_number}</td>
        <td>Bed #${al.bed_number}</td>
        <td>${formatDate(al.check_in_date)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="vacateAllocation(${al.allocation_id})">
            <i class="fa-solid fa-right-from-bracket"></i> Vacate Bed
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load allocations logs', 'error');
  }
}

async function vacateAllocation(id) {
  if (confirm('Are you sure you want to vacate this allocation? The bed will be marked free immediately.')) {
    try {
      const response = await fetch(`${API_BASE}/allocations/vacate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocation_id: id })
      });
      const res = await response.json();
      if (res.success) {
        showToast(res.message);
        loadAllocationsTable();
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      showToast('API communication error', 'error');
    }
  }
}

// ==========================================
// VIEW 4: FEE PAYMENTS
// ==========================================
async function loadFeeSummary() {
  try {
    const res = await fetch(`${API_BASE}/payments`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('fee-summary-table-body');
    tbody.innerHTML = '';

    data.summaries.forEach(sum => {
      const paid = parseFloat(sum.total_paid || 0);
      const due = parseFloat(sum.total_due || 0);
      const tr = document.createElement('tr');

      let statusBadge = '<span class="badge badge-success">Settle</span>';
      if (due > 0) {
        statusBadge = `<span class="badge badge-danger">${formatLKR(due)} Pending</span>`;
      }

      tr.innerHTML = `
        <td><code>${sum.admission_no}</code></td>
        <td><strong>${sum.full_name}</strong></td>
        <td style="color: var(--color-success); font-weight:600;">${formatLKR(paid)}</td>
        <td style="color: ${due > 0 ? 'var(--color-danger)' : 'var(--text-secondary)'}; font-weight:600;">${formatLKR(due)}</td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load fee summaries', 'error');
  }
}

async function loadPaymentHistory() {
  try {
    const res = await fetch(`${API_BASE}/payments`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('payment-history-table-body');
    tbody.innerHTML = '';

    if (data.payments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">No payment records recorded yet.</td></tr>`;
      return;
    }

    data.payments.forEach(p => {
      const tr = document.createElement('tr');
      
      let statusClass = 'badge-success';
      if (p.status === 'Pending') statusClass = 'badge-warning';
      else if (p.status === 'Overdue') statusClass = 'badge-danger';

      tr.innerHTML = `
        <td><strong>${p.receipt_no}</strong></td>
        <td>${p.full_name} <span class="cell-sub-info">(${p.admission_no})</span></td>
        <td><span class="badge badge-primary">${p.fee_type}</span></td>
        <td style="font-weight:600;">${formatLKR(p.amount)}</td>
        <td>${p.month_for || 'N/A'}</td>
        <td>${p.payment_mode}</td>
        <td>${formatDate(p.payment_date)}</td>
        <td><span class="badge ${statusClass}">${p.status}</span></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load payment log history', 'error');
  }
}

// ==========================================
// VIEW 5: COMPLAINTS & MAINTENANCE
// ==========================================
async function loadComplaints() {
  try {
    const res = await fetch(`${API_BASE}/complaints`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('complaints-table-body');
    tbody.innerHTML = '';

    if (data.allComplaints.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">No complaints logged.</td></tr>`;
      return;
    }

    data.allComplaints.forEach(c => {
      const tr = document.createElement('tr');
      
      let statusClass = 'badge-secondary';
      if (c.status === 'Open') statusClass = 'badge-danger';
      else if (c.status === 'In Progress') statusClass = 'badge-warning';
      else if (c.status === 'Resolved') statusClass = 'badge-success';

      const isResolved = c.status === 'Resolved';

      tr.innerHTML = `
        <td><span class="badge badge-primary">${c.category}</span></td>
        <td><strong>${c.student_name}</strong></td>
        <td>${c.room_number ? `Room ${c.room_number}` : 'Common Area'}</td>
        <td><p style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.description}">${c.description}</p></td>
        <td>${formatDate(c.date_raised)}</td>
        <td>${c.staff_name || '<em class="text-muted">Unassigned</em>'}</td>
        <td><span class="badge ${statusClass}">${c.status}</span></td>
        <td>
          <div class="action-buttons-cell">
            ${!isResolved ? `
              <button class="btn-icon edit" onclick="openAssignStaff(${c.complaint_id})" title="Assign Staff"><i class="fa-solid fa-user-plus"></i></button>
              <button class="btn-icon success" onclick="resolveComplaint(${c.complaint_id})" title="Resolve"><i class="fa-solid fa-circle-check"></i></button>
            ` : `<span class="cell-sub-info">Closed: ${formatDate(c.resolved_date)}</span>`}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load complaints log', 'error');
  }
}

async function resolveComplaint(id) {
  if (confirm('Resolve this complaint? The student will be notified and it will be archived.')) {
    try {
      const response = await fetch(`${API_BASE}/complaints/${id}/resolve`, { method: 'PUT' });
      const res = await response.json();
      if (res.success) {
        showToast(res.message);
        loadComplaints();
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      showToast('API communication error', 'error');
    }
  }
}

function openAssignStaff(id) {
  document.getElementById('assign-complaint-id').value = id;
  openModal('assign-staff-modal');
}

// ==========================================
// ==========================================
// VIEW 6: ATTENDANCE TRACKER (WITH GRAPH)
// ==========================================

let attChartInstance = null; // global Chart.js instance

async function loadAttendanceSheet(date) {
  try {
    const res = await fetch(`${API_BASE}/attendance?date=${date}`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';

    let presentCount = 0, absentCount = 0, leaveCount = 0;

    data.data.forEach(att => {
      const tr = document.createElement('tr');
      const pChecked = att.status === 'Present' ? 'checked' : '';
      const aChecked = att.status === 'Absent' ? 'checked' : '';
      const lChecked = att.status === 'On Leave' ? 'checked' : '';

      if (att.status === 'Present') presentCount++;
      else if (att.status === 'Absent') absentCount++;
      else if (att.status === 'On Leave') leaveCount++;

      tr.innerHTML = `
        <td><code>${att.admission_no}</code></td>
        <td><strong>${att.full_name}</strong></td>
        <td>
          <div class="attendance-switch-group">
            <input type="radio" name="att-${att.student_id}" id="p-${att.student_id}" value="Present" class="attendance-btn-radio" ${pChecked}>
            <label for="p-${att.student_id}" class="attendance-radio-label present">✓ Present</label>

            <input type="radio" name="att-${att.student_id}" id="a-${att.student_id}" value="Absent" class="attendance-btn-radio" ${aChecked}>
            <label for="a-${att.student_id}" class="attendance-radio-label absent">✗ Absent</label>

            <input type="radio" name="att-${att.student_id}" id="l-${att.student_id}" value="On Leave" class="attendance-btn-radio" ${lChecked}>
            <label for="l-${att.student_id}" class="attendance-radio-label leave">⏸ Leave</label>
          </div>
        </td>
      `;

      // Live update badge counters when radio changes
      tr.querySelectorAll('.attendance-btn-radio').forEach(radio => {
        radio.addEventListener('change', updateAttendanceBadges);
      });

      tbody.appendChild(tr);
    });

    // Populate the student chart picker dropdown too
    const picker = document.getElementById('att-student-picker');
    if (picker && picker.options.length <= 1) {
      picker.innerHTML = '<option value="">— Select a Student —</option>';
      data.data.forEach(att => {
        const opt = document.createElement('option');
        opt.value = att.student_id;
        opt.textContent = `${att.full_name} (${att.admission_no})`;
        picker.appendChild(opt);
      });
    }

    updateAttendanceBadges();
  } catch (err) {
    showToast('Failed to load attendance roll sheet', 'error');
  }
}

function updateAttendanceBadges() {
  const tbody = document.getElementById('attendance-table-body');
  const rows = tbody.querySelectorAll('tr');
  let present = 0, absent = 0, leave = 0;
  rows.forEach(tr => {
    const checked = tr.querySelector('input[type="radio"]:checked');
    if (!checked) return;
    if (checked.value === 'Present') present++;
    else if (checked.value === 'Absent') absent++;
    else if (checked.value === 'On Leave') leave++;
  });
  const el = id => document.getElementById(id);
  if (el('att-present-count')) el('att-present-count').textContent = present;
  if (el('att-absent-count')) el('att-absent-count').textContent = absent;
  if (el('att-leave-count')) el('att-leave-count').textContent = leave;
}

async function saveAttendanceSheet() {
  const date = document.getElementById('attendance-datepicker').value;
  const tbody = document.getElementById('attendance-table-body');
  const rows = tbody.querySelectorAll('tr');
  const records = [];

  rows.forEach(tr => {
    const radioChecked = tr.querySelector('input[type="radio"]:checked');
    if (radioChecked) {
      const studentId = radioChecked.name.replace('att-', '');
      records.push({ student_id: parseInt(studentId), status: radioChecked.value });
    }
  });

  if (records.length === 0) {
    showToast('No active student rolls to mark', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_date: date, records: records })
    });
    const res = await response.json();
    if (res.success) {
      showToast('✅ Attendance saved successfully!');
      loadAttendanceSheet(date);
      // Refresh chart if a student is selected
      const picker = document.getElementById('att-student-picker');
      if (picker && picker.value) {
        loadStudentAttendanceGraph(picker.value);
      }
    } else {
      showToast(res.error, 'error');
    }
  } catch (err) {
    showToast('API communication error saving rolls', 'error');
  }
}

// Load and render per-student day-by-day bar chart
async function loadStudentAttendanceGraph(studentId) {
  if (!studentId) return;
  const days = document.getElementById('att-days-picker')?.value || 30;

  try {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}?days=${days}`);
    const data = await res.json();
    if (!data.success) { showToast('Failed to load attendance graph', 'error'); return; }

    // Show summary cards
    const el = id => document.getElementById(id);
    el('att-graph-empty').classList.add('hidden');
    el('att-graph-stats').classList.remove('hidden');
    el('att-chart-container').classList.remove('hidden');

    const s = data.summary;
    el('att-stat-present').textContent = s.totalPresent;
    el('att-stat-absent').textContent = s.totalAbsent;
    el('att-stat-leave').textContent = s.totalLeave;
    el('att-stat-rate').textContent = `${s.attendanceRate}%`;

    // Update student name banner
    if (data.student) {
      el('att-chart-student-name').textContent = data.student.full_name;
      el('att-chart-admission-no').textContent = data.student.admission_no;
    }

    // Prepare Chart.js data
    const labels = data.data.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    });

    const statusToValue = s => s === 'Present' ? 1 : s === 'Absent' ? -1 : s === 'On Leave' ? 0.5 : 0;
    const barColors = data.data.map(d => {
      if (d.status === 'Present') return 'rgba(34, 197, 94, 0.85)';
      if (d.status === 'Absent') return 'rgba(239, 68, 68, 0.85)';
      if (d.status === 'On Leave') return 'rgba(251, 191, 36, 0.85)';
      return 'rgba(100, 116, 139, 0.4)';
    });
    const borderColors = data.data.map(d => {
      if (d.status === 'Present') return 'rgba(34, 197, 94, 1)';
      if (d.status === 'Absent') return 'rgba(239, 68, 68, 1)';
      if (d.status === 'On Leave') return 'rgba(251, 191, 36, 1)';
      return 'rgba(100, 116, 139, 0.6)';
    });

    const chartValues = data.data.map(d => {
      if (d.status === 'Present') return 3;
      if (d.status === 'Absent') return 1;
      if (d.status === 'On Leave') return 2;
      return 0;
    });

    const tooltipLabels = data.data.map(d => d.status);

    // Destroy existing chart
    if (attChartInstance) {
      attChartInstance.destroy();
      attChartInstance = null;
    }

    const canvas = el('att-bar-chart');
    const ctx = canvas.getContext('2d');

    attChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Attendance',
          data: chartValues,
          backgroundColor: barColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const rawStatus = tooltipLabels[context.dataIndex];
                return ` ${rawStatus}`;
              },
              title: (items) => {
                const idx = items[0].dataIndex;
                return data.data[idx].date;
              }
            },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              color: '#64748b',
              font: { size: 10, family: 'Outfit' },
              maxRotation: 45,
            }
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              color: '#64748b',
              stepSize: 1,
              font: { size: 11, family: 'Outfit' },
              callback: (v) => {
                if (v === 3) return '✓ Present';
                if (v === 2) return '⏸ Leave';
                if (v === 1) return '✗ Absent';
                if (v === 0) return 'No Data';
                return '';
              }
            },
            min: 0,
            max: 3.5,
          }
        }
      }
    });

  } catch (err) {
    showToast('Error loading attendance graph', 'error');
  }
}

// Wire up attendance graph pickers (called once)
function setupAttendanceGraphListeners() {
  const studentPicker = document.getElementById('att-student-picker');
  const daysPicker = document.getElementById('att-days-picker');

  if (studentPicker) {
    studentPicker.addEventListener('change', () => {
      if (studentPicker.value) loadStudentAttendanceGraph(studentPicker.value);
    });
  }

  if (daysPicker) {
    daysPicker.addEventListener('change', () => {
      const studentPicker = document.getElementById('att-student-picker');
      if (studentPicker && studentPicker.value) loadStudentAttendanceGraph(studentPicker.value);
    });
  }
}



// ==========================================
// VIEW 7: LEAVE APPLICATIONS
// ==========================================
async function loadLeaves() {
  try {
    const res = await fetch(`${API_BASE}/leaves`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('leaves-table-body');
    tbody.innerHTML = '';

    if (data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">No leave applications logged.</td></tr>`;
      return;
    }

    data.data.forEach(l => {
      const tr = document.createElement('tr');
      
      let statusClass = 'badge-secondary';
      if (l.status === 'Pending') statusClass = 'badge-warning';
      else if (l.status === 'Approved') statusClass = 'badge-success';
      else if (l.status === 'Rejected') statusClass = 'badge-danger';

      const isPending = l.status === 'Pending';

      tr.innerHTML = `
        <td><strong>${l.student_name}</strong></td>
        <td><code>${l.admission_no}</code></td>
        <td>${formatDate(l.from_date)} to ${formatDate(l.to_date)}</td>
        <td>${l.reason || 'N/A'}</td>
        <td>${formatDate(l.applied_on)}</td>
        <td>${l.approved_by_name || 'System Auto'}</td>
        <td><span class="badge ${statusClass}">${l.status}</span></td>
        <td>
          <div class="action-buttons-cell">
            ${isPending ? `
              <button class="btn btn-success btn-sm" onclick="openApproveLeave(${l.leave_id}, 'Approved')" title="Approve"><i class="fa-solid fa-check"></i> Approve</button>
              <button class="btn btn-danger btn-sm" onclick="openApproveLeave(${l.leave_id}, 'Rejected')" title="Reject"><i class="fa-solid fa-times"></i> Reject</button>
            ` : `Closed`}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load leave records', 'error');
  }
}

function openApproveLeave(leaveId, targetStatus) {
  document.getElementById('approve-leave-id').value = leaveId;
  document.getElementById('approve-leave-status').value = targetStatus;
  openModal('approve-leave-modal');
}

// ==========================================
// VIEW 8: VISITORS LOG REGISTRY
// ==========================================
async function loadVisitors() {
  try {
    const res = await fetch(`${API_BASE}/visitors`);
    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('visitors-table-body');
    tbody.innerHTML = '';

    if (data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 40px; color: var(--text-muted);">No visitor entries logged.</td></tr>`;
      return;
    }

    data.data.forEach(v => {
      const tr = document.createElement('tr');
      const isCheckedOut = v.time_out !== null;

      tr.innerHTML = `
        <td><strong>${v.visitor_name}</strong></td>
        <td>${v.student_name} <span class="cell-sub-info">(${v.admission_no})</span></td>
        <td>${v.relation || 'N/A'}</td>
        <td>${v.phone}</td>
        <td>${formatDate(v.visit_date)}</td>
        <td><code>${v.time_in}</code></td>
        <td><code>${isCheckedOut ? v.time_out : '--:--'}</code></td>
        <td>${v.purpose || 'N/A'}</td>
        <td>
          ${!isCheckedOut ? `
            <button class="btn btn-warning btn-sm" onclick="checkoutVisitor(${v.visitor_id})">
              <i class="fa-solid fa-clock"></i> Check Out
            </button>
          ` : `<span class="badge badge-success">Completed</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load visitor log registry', 'error');
  }
}

async function checkoutVisitor(id) {
  try {
    const response = await fetch(`${API_BASE}/visitors/${id}/checkout`, { method: 'PUT' });
    const res = await response.json();
    if (res.success) {
      showToast(res.message);
      loadVisitors();
    } else {
      showToast(res.error, 'error');
    }
  } catch (err) {
    showToast('API communication error checkout out visitor', 'error');
  }
}

// ==========================================
// VIEW 9: STAFF ROSTER
// ==========================================
async function loadStaff() {
  try {
    const res = await fetch(`${API_BASE}/staff`);
    const data = await res.json();
    if (!data.success) return;

    state.staff = data.data;
    populateStaffDropdowns(); // Keep lists fresh

    const tbody = document.getElementById('staff-table-body');
    tbody.innerHTML = '';

    state.staff.forEach(s => {
      const tr = document.createElement('tr');
      let statusClass = 'badge-secondary';
      if (s.status === 'Active') statusClass = 'badge-success';
      else if (s.status === 'On Leave') statusClass = 'badge-warning';
      else if (s.status === 'Resigned') statusClass = 'badge-danger';

      tr.innerHTML = `
        <td><code>STF-${String(s.staff_id).padStart(4, '0')}</code></td>
        <td><strong>${s.full_name}</strong></td>
        <td><span class="badge badge-primary">${s.designation}</span></td>
        <td>${s.phone}</td>
        <td>${s.email || 'N/A'}</td>
        <td>${s.hostel_name || 'All Hostels (Admin)'}</td>
        <td>${formatDate(s.joining_date)}</td>
        <td>${formatLKR(s.salary)}</td>
        <td><span class="badge ${statusClass}">${s.status}</span></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast('Failed to load staff roster', 'error');
  }
}

// ==========================================
// OVERLAYS / MODAL SYSTEM HELPERS
// ==========================================
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Ensure student, room, and staff dropdowns are loaded and populated
    preloadDropdownData();

    modal.classList.remove('hidden');
    
    // Customize Header context
    if (modalId === 'add-student-modal') {
      const studentIdInput = document.getElementById('student-id');
      if (studentIdInput && !studentIdInput.value) {
        document.getElementById('student-status-group').classList.add('hidden');
        const titleEl = document.querySelector('#add-student-modal .pm-header-title') || document.querySelector('#add-student-modal h3');
        if (titleEl) titleEl.innerText = 'Register New Student';
        document.getElementById('student-form').reset();
      }
    }
  }
};


window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
};

// ==========================================
// TOAST MESSAGING MODULE
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-check toast-icon"></i>';
  if (type === 'error') {
    icon = '<i class="fa-solid fa-circle-exclamation toast-icon"></i>';
  } else if (type === 'warning') {
    icon = '<i class="fa-solid fa-triangle-exclamation toast-icon"></i>';
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ==========================================
// CORE HELPERS & FORMATTING
// ==========================================
function formatLKR(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function startLiveDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const update = () => {
    const el = document.getElementById('live-date');
    if (el) el.innerText = new Date().toLocaleDateString('en-US', options);
  };
  update();
  setInterval(update, 60000);
}

// Interactive Pure JS Background Parallax Movement
document.addEventListener('mousemove', (e) => {
  const authContainer = document.getElementById('auth-container');
  if (authContainer && !authContainer.classList.contains('hidden')) {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    const orbs = authContainer.querySelectorAll('.decor-orb');
    orbs.forEach((orb, idx) => {
      const depth = (idx + 1) * 0.4;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  }
});
