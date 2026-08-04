export const initialHostels = [
  {
    hostel_id: 1,
    hostel_name: 'Aegis Girls Hostel - Main Block',
    hostel_type: 'Girls',
    address: '14 University Avenue, Girls Main Block',
    total_floors: 4
  },
  {
    hostel_id: 2,
    hostel_name: 'Aegis Girls Hostel - Annex Block',
    hostel_type: 'Girls',
    address: '18 University Avenue, Girls Annex Block',
    total_floors: 4
  }
];

export const initialRooms = [
  { room_id: 1, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: '101', capacity: 2, occupied_seats: 2, floor_number: 1, room_type: 'Single Deluxe', monthly_rent: 7500.00 },
  { room_id: 2, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: '102', capacity: 3, occupied_seats: 2, floor_number: 1, room_type: 'Double Sharing', monthly_rent: 5500.00 },
  { room_id: 3, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: '201', capacity: 2, occupied_seats: 1, floor_number: 2, room_type: 'Single Deluxe', monthly_rent: 7500.00 },
  { room_id: 4, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: 'G-101', capacity: 2, occupied_seats: 2, floor_number: 1, room_type: 'Single Deluxe', monthly_rent: 8000.00 },
  { room_id: 5, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: 'G-102', capacity: 3, occupied_seats: 1, floor_number: 1, room_type: 'Double Sharing', monthly_rent: 6000.00 },
  { room_id: 6, hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', room_number: 'E-301', capacity: 1, occupied_seats: 1, floor_number: 3, room_type: 'Suite', monthly_rent: 12000.00 },
  { room_id: 7, hostel_id: 2, hostel_name: 'Aegis Girls Hostel - Annex Block', room_number: 'A-101', capacity: 2, occupied_seats: 1, floor_number: 1, room_type: 'Single Deluxe', monthly_rent: 7500.00 },
  { room_id: 8, hostel_id: 2, hostel_name: 'Aegis Girls Hostel - Annex Block', room_number: 'A-102', capacity: 3, occupied_seats: 2, floor_number: 1, room_type: 'Double Sharing', monthly_rent: 5500.00 }
];

export const initialStudents = [
  {
    student_id: 1,
    admission_no: 'STU202601',
    full_name: 'Kaveesha Perera',
    gender: 'Female',
    dob: '2002-05-14',
    phone: '+94771234567',
    email: 'kaveesha@student.edu',
    course: 'Computer Science',
    year_of_study: 3,
    address: '45 Temple Rd, Colombo',
    guardian_name: 'Nimali Perera',
    guardian_phone: '+94712345678',
    status: 'Active',
    room_number: 'A-101',
    hostel_name: 'Aegis Girls Hostel - Annex Block'
  },
  {
    student_id: 2,
    admission_no: 'STU202602',
    full_name: 'Ananya Sharma',
    gender: 'Female',
    dob: '2003-08-22',
    phone: '+94772345678',
    email: 'ananya@student.edu',
    course: 'Information Technology',
    year_of_study: 2,
    address: '78 Park Rd, Kandy',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '+94718765432',
    status: 'Active',
    room_number: 'G-101',
    hostel_name: 'Aegis Girls Hostel - Main Block'
  },
  {
    student_id: 3,
    admission_no: 'STU202603',
    full_name: 'Tharushi Fernando',
    gender: 'Female',
    dob: '2001-11-03',
    phone: '+94773456789',
    email: 'tharushi@student.edu',
    course: 'Software Engineering',
    year_of_study: 4,
    address: '12 Main St, Galle',
    guardian_name: 'Sunitha Fernando',
    guardian_phone: '+94719876543',
    status: 'Active',
    room_number: 'A-102',
    hostel_name: 'Aegis Girls Hostel - Annex Block'
  },
  {
    student_id: 4,
    admission_no: 'STU202604',
    full_name: 'Dilini Silva',
    gender: 'Female',
    dob: '2003-02-17',
    phone: '+94774567890',
    email: 'dilini@student.edu',
    course: 'Data Science',
    year_of_study: 2,
    address: '89 Hill St, Nuwara Eliya',
    guardian_name: 'Kamal Silva',
    guardian_phone: '+94716543210',
    status: 'Active',
    room_number: 'G-101',
    hostel_name: 'Aegis Girls Hostel - Main Block'
  }
];

export const initialAllocations = [
  { allocation_id: 1, student_id: 1, student_name: 'Kaveesha Perera', admission_no: 'STU202601', room_id: 7, room_number: 'A-101', hostel_id: 2, hostel_name: 'Aegis Girls Hostel - Annex Block', bed_number: 1, allocated_date: '2026-01-10', status: 'Active' },
  { allocation_id: 2, student_id: 2, student_name: 'Ananya Sharma', admission_no: 'STU202602', room_id: 4, room_number: 'G-101', hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', bed_number: 1, allocated_date: '2026-01-12', status: 'Active' },
  { allocation_id: 3, student_id: 3, student_name: 'Tharushi Fernando', admission_no: 'STU202603', room_id: 8, room_number: 'A-102', hostel_id: 2, hostel_name: 'Aegis Girls Hostel - Annex Block', bed_number: 1, allocated_date: '2026-01-15', status: 'Active' },
  { allocation_id: 4, student_id: 4, student_name: 'Dilini Silva', admission_no: 'STU202604', room_id: 4, room_number: 'G-101', hostel_id: 1, hostel_name: 'Aegis Girls Hostel - Main Block', bed_number: 2, allocated_date: '2026-01-18', status: 'Active' }
];

export const initialFeePayments = [
  { payment_id: 1, student_id: 1, student_name: 'Kaveesha Perera', room_number: 'A-101', receipt_no: 'REC-2026-001', amount: 7500.00, payment_date: '2026-02-01', month_for: 'February 2026', payment_mode: 'Bank Transfer', remarks: 'Paid in full' },
  { payment_id: 2, student_id: 2, student_name: 'Ananya Sharma', room_number: 'G-101', receipt_no: 'REC-2026-002', amount: 8000.00, payment_date: '2026-02-02', month_for: 'February 2026', payment_mode: 'Online Portal', remarks: 'Paid via Card' },
  { payment_id: 3, student_id: 3, student_name: 'Tharushi Fernando', room_number: 'A-102', receipt_no: 'REC-2026-003', amount: 5500.00, payment_date: '2026-02-03', month_for: 'February 2026', payment_mode: 'Cash', remarks: 'Paid at Warden desk' },
  { payment_id: 4, student_id: 4, student_name: 'Dilini Silva', room_number: 'G-101', receipt_no: 'REC-2026-004', amount: 8000.00, payment_date: '2026-02-04', month_for: 'February 2026', payment_mode: 'Bank Transfer', remarks: 'Paid in full' }
];

export const initialFeeSummaries = [
  { student_id: 1, student_name: 'Kaveesha Perera', admission_no: 'STU202601', room_number: 'A-101', monthly_rent: 7500.00, total_paid: 7500.00, pending_dues: 0.00, status: 'Paid' },
  { student_id: 2, student_name: 'Ananya Sharma', admission_no: 'STU202602', room_number: 'G-101', monthly_rent: 8000.00, total_paid: 8000.00, pending_dues: 0.00, status: 'Paid' },
  { student_id: 3, student_name: 'Tharushi Fernando', admission_no: 'STU202603', room_number: 'A-102', monthly_rent: 5500.00, total_paid: 5500.00, pending_dues: 0.00, status: 'Paid' },
  { student_id: 4, student_name: 'Dilini Silva', admission_no: 'STU202604', room_number: 'G-101', monthly_rent: 8000.00, total_paid: 8000.00, pending_dues: 0.00, status: 'Paid' }
];

export const initialComplaints = [
  { complaint_id: 1, student_id: 2, student_name: 'Ananya Sharma', room_number: 'G-101', title: 'A/C Remote Not Working', description: 'Air conditioner remote battery dead and display flickering.', category: 'Electrical', status: 'In Progress', filed_date: '2026-02-01', priority: 'Medium' },
  { complaint_id: 2, student_id: 1, student_name: 'Kaveesha Perera', room_number: 'A-101', title: 'Study Lamp Replacement', description: 'Desk lamp bulb burned out.', category: 'Furniture', status: 'Pending', filed_date: '2026-02-03', priority: 'Low' },
  { complaint_id: 3, student_id: 3, student_name: 'Tharushi Fernando', room_number: 'A-102', title: 'Bathroom Tap Leakage', description: 'Water dripping continuously from wash basin tap.', category: 'Plumbing', status: 'Resolved', filed_date: '2026-01-28', priority: 'High' }
];

export const initialStaff = [
  { staff_id: 1, full_name: 'Maheshwari Bandara', role: 'Chief Lady Warden', phone: '+94775551122', email: 'maheshwari@aegis.com', status: 'Active', shift: 'Day' },
  { staff_id: 2, full_name: 'Malini Jayasinghe', role: 'Assistant Lady Warden', phone: '+94775553344', email: 'malini@aegis.com', status: 'Active', shift: 'Evening' },
  { staff_id: 3, full_name: 'Sanduni Kumara', role: 'Hostel Supervisor', phone: '+94775555566', email: 'sanduni@aegis.com', status: 'Active', shift: 'Day' }
];

export const initialLeaves = [
  { leave_id: 1, student_id: 1, student_name: 'Kaveesha Perera', room_number: 'A-101', start_date: '2026-02-10', end_date: '2026-02-14', reason: 'Family function at home', destination: 'Colombo', status: 'Approved', requested_date: '2026-02-01' },
  { leave_id: 2, student_id: 2, student_name: 'Ananya Sharma', room_number: 'G-101', start_date: '2026-02-15', end_date: '2026-02-18', reason: 'Medical appointment', destination: 'Kandy', status: 'Pending', requested_date: '2026-02-03' }
];

export const initialVisitors = [
  { visitor_id: 1, student_id: 1, student_name: 'Kaveesha Perera', visitor_name: 'Nimali Perera', relation: 'Mother', phone: '+94712345678', visit_date: '2026-02-02', time_in: '10:30 AM', time_out: '12:00 PM', purpose: 'Delivering study materials', status: 'Checked Out' },
  { visitor_id: 2, student_id: 2, student_name: 'Ananya Sharma', visitor_name: 'Rajesh Sharma', relation: 'Father', phone: '+94718765432', visit_date: '2026-02-04', time_in: '02:00 PM', time_out: '03:30 PM', purpose: 'Monthly visit', status: 'Checked Out' }
];

export const initialStats = {
  total_students: 4,
  total_hostels: 2,
  total_rooms: 8,
  total_capacity: 16,
  occupied_seats: 10,
  occupancy_rate: 62.5,
  monthly_revenue: 29000.00,
  pending_complaints: 2,
  open_leaves: 1
};
