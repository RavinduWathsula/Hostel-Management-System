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

export const initialStudents = [];

export const initialAllocations = [];

export const initialFeePayments = [];

export const initialFeeSummaries = [];

export const initialComplaints = [];

export const initialStaff = [
  { staff_id: 1, full_name: 'Maheshwari Bandara', role: 'Chief Lady Warden', phone: '+94775551122', email: 'maheshwari@aegis.com', status: 'Active', shift: 'Day' },
  { staff_id: 2, full_name: 'Malini Jayasinghe', role: 'Assistant Lady Warden', phone: '+94775553344', email: 'malini@aegis.com', status: 'Active', shift: 'Evening' },
  { staff_id: 3, full_name: 'Sanduni Kumara', role: 'Hostel Supervisor', phone: '+94775555566', email: 'sanduni@aegis.com', status: 'Active', shift: 'Day' }
];

export const initialLeaves = [];

export const initialVisitors = [];

export const initialStats = {
  total_students: 0,
  total_hostels: 2,
  total_rooms: 8,
  total_capacity: 16,
  occupied_seats: 0,
  occupancy_rate: 0,
  monthly_revenue: 0.00,
  pending_complaints: 0,
  open_leaves: 0
};
