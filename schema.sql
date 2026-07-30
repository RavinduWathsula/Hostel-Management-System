-- Hostel Management System - Complete MySQL Database Schema & Seed Data
-- Compatible with XAMPP / MariaDB / MySQL 5.7+ / MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hostel_management_system;
USE hostel_management_system;

-- Safe initialization (Tables created if not existing, seed data inserted if not existing)
SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS vw_open_complaints;
DROP VIEW IF EXISTS vw_room_occupancy;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Hostel Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin User (Username: admin, Password: admin123)
INSERT IGNORE INTO admin_users (admin_id, full_name, username, email, password_hash, role) VALUES
(1, 'System Warden Admin', 'admin', 'admin@aegis.com', '902dab4ffe2654b18358662c4c48fad148d41b2bbffd39e3ec8ffc0f5613a0e7a1f20fb9965639134c7ac9b358cd6f48f449348d484d43cad2dcde6a042e4be9', 'Super Admin');

-- 2. Hostel Table
CREATE TABLE IF NOT EXISTS hostel (
  hostel_id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_name VARCHAR(100) NOT NULL,
  hostel_type ENUM('Boys', 'Girls', 'Co-ed') NOT NULL DEFAULT 'Boys',
  address TEXT,
  total_floors INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO hostel (hostel_id, hostel_name, hostel_type, address, total_floors) VALUES
(1, 'Aegis Girls Hostel', 'Girls', '14 University Avenue, Girls Block', 4);

-- 3. Room Table
CREATE TABLE IF NOT EXISTS room (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  occupied_seats INT DEFAULT 0,
  floor_number INT DEFAULT 1,
  room_type VARCHAR(50) DEFAULT 'Standard',
  monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO room (room_id, hostel_id, room_number, capacity, occupied_seats, floor_number, room_type, monthly_rent) VALUES
(1, 1, '101', 2, 2, 1, 'Single Deluxe', 7500.00),
(2, 1, '102', 3, 2, 1, 'Double Sharing', 5500.00),
(3, 1, '201', 2, 1, 2, 'Single Deluxe', 7500.00),
(4, 1, 'G-101', 2, 2, 1, 'Single Deluxe', 8000.00),
(5, 1, 'G-102', 3, 1, 1, 'Double Sharing', 6000.00),
(6, 1, 'E-301', 1, 1, 3, 'Suite', 12000.00);

-- 4. Student Table
CREATE TABLE IF NOT EXISTS student (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  admission_no VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  dob DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  course VARCHAR(100),
  year_of_study INT,
  address TEXT,
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO student (student_id, admission_no, full_name, gender, dob, phone, email, course, year_of_study, address, guardian_name, guardian_phone, status) VALUES
(2, 'STU202602', 'Ananya Sharma', 'Female', '2003-08-22', '+94772345678', 'ananya@student.edu', 'Information Technology', 2, '78 Park Rd, Kandy', 'Rajesh Sharma', '+94718765432', 'Active'),
(4, 'STU202604', 'Dilini Silva', 'Female', '2003-02-17', '+94774567890', 'dilini@student.edu', 'Data Science', 2, '89 Hill St, Nuwara Eliya', 'Kamal Silva', '+94716543210', 'Active');

-- 5. Room Allocation Table
CREATE TABLE IF NOT EXISTS room_allocation (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  room_id INT NOT NULL,
  bed_number INT DEFAULT 1,
  allocated_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('Active', 'Vacated', 'Transferred') DEFAULT 'Active',
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO room_allocation (allocation_id, student_id, room_id, bed_number, allocated_date, status) VALUES
(2, 2, 4, 1, '2026-01-12', 'Active'),
(4, 4, 4, 2, '2026-01-18', 'Active');

-- 6. Staff Table
CREATE TABLE IF NOT EXISTS staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  hostel_id INT,
  salary DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO staff (staff_id, full_name, designation, phone, email, hostel_id, salary) VALUES
(1, 'Mahesh Bandara', 'Senior Warden', '+94770000001', 'mahesh@aegis.com', 1, 85000.00),
(2, 'Kumari Wickramasinghe', 'Lady Warden', '+94770000002', 'kumari@aegis.com', 2, 85000.00),
(3, 'Saman Kumara', 'Maintenance Supervisor', '+94770000003', 'saman@aegis.com', 1, 55000.00),
(4, 'Priyani Ratnayake', 'Security In-Charge', '+94770000004', 'priyani@aegis.com', 3, 60000.00);

-- 7. Complaint Table
CREATE TABLE IF NOT EXISTS complaint (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  room_id INT,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  assigned_staff_id INT,
  status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
  complaint_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_date DATE DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO complaint (complaint_id, student_id, room_id, category, description, assigned_staff_id, status, complaint_date) VALUES
(1, 1, 1, 'Plumbing', 'Leaking bathroom tap in room 101', 3, 'In Progress', '2026-07-25 10:30:00'),
(2, 2, 4, 'Electrical', 'Ceiling fan light flickers continuously', 3, 'Pending', '2026-07-28 14:15:00'),
(3, 4, 4, 'Wi-Fi / Internet', 'No internet access on 1st floor North block', NULL, 'Pending', '2026-07-29 09:00:00');

-- 8. Fee Payment Table
CREATE TABLE IF NOT EXISTS fee_payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fee_type VARCHAR(50) NOT NULL DEFAULT 'Monthly Rent',
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_mode VARCHAR(50) DEFAULT 'Online',
  month_for VARCHAR(50),
  receipt_no VARCHAR(50) UNIQUE,
  status ENUM('Paid', 'Pending', 'Overdue') DEFAULT 'Paid',
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO fee_payment (payment_id, student_id, fee_type, amount, payment_date, payment_mode, month_for, receipt_no, status) VALUES
(1, 1, 'Monthly Rent', 7500.00, '2026-07-01 10:00:00', 'Online Bank Transfer', 'July 2026', 'REC-202607-001', 'Paid'),
(2, 2, 'Monthly Rent', 8000.00, '2026-07-02 11:30:00', 'Credit Card', 'July 2026', 'REC-202607-002', 'Paid'),
(3, 3, 'Monthly Rent', 7500.00, '2026-07-05 09:45:00', 'Cash', 'July 2026', 'REC-202607-003', 'Paid'),
(4, 4, 'Hostel Deposit', 15000.00, '2026-01-18 15:20:00', 'Online Bank Transfer', 'Admission', 'REC-202601-004', 'Paid');

-- 9. Visitor Log Table
CREATE TABLE IF NOT EXISTS visitor_log (
  visitor_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  visitor_name VARCHAR(100) NOT NULL,
  relation VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  visit_date DATE DEFAULT (CURRENT_DATE),
  time_in TIME DEFAULT (CURRENT_TIME),
  time_out TIME DEFAULT NULL,
  purpose TEXT,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO visitor_log (visitor_id, student_id, visitor_name, relation, phone, visit_date, time_in, purpose) VALUES
(1, 1, 'Sunil Perera', 'Father', '+94719876543', '2026-07-28', '14:00:00', 'Delivering books and supplies'),
(2, 2, 'Rajesh Sharma', 'Father', '+94718765432', '2026-07-29', '10:30:00', 'Parent Visit');

-- 10. Leave Application Table
CREATE TABLE IF NOT EXISTS leave_application (
  leave_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approved_by INT,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO leave_application (leave_id, student_id, from_date, to_date, reason, status, approved_by) VALUES
(1, 1, '2026-08-01', '2026-08-05', 'Family Function', 'Approved', 1),
(2, 2, '2026-08-10', '2026-08-12', 'Medical Appointment', 'Pending', NULL);

-- 11. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'On Leave') DEFAULT 'Present',
  marked_by INT,
  UNIQUE KEY unique_student_date (student_id, attendance_date),
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO attendance (attendance_id, student_id, attendance_date, status, marked_by) VALUES
(1, 1, '2026-07-29', 'Present', 1),
(2, 2, '2026-07-29', 'Present', 2),
(3, 3, '2026-07-29', 'Present', 1),
(4, 4, '2026-07-29', 'Absent', 2),
(5, 5, '2026-07-29', 'Present', 1);

-- 12. VIEWS

-- View: Room Occupancy
CREATE OR REPLACE VIEW vw_room_occupancy AS
SELECT 
  r.room_id, 
  r.room_number, 
  h.hostel_name, 
  r.capacity, 
  (SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active') AS occupied_seats, 
  (r.capacity - (SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active')) AS available_seats,
  r.monthly_rent,
  r.room_type,
  r.floor_number
FROM room r
JOIN hostel h ON r.hostel_id = h.hostel_id;

-- View: Open Complaints
CREATE OR REPLACE VIEW vw_open_complaints AS
SELECT 
  c.complaint_id, 
  c.category, 
  c.description, 
  c.status, 
  c.complaint_date,
  s.student_id,
  s.full_name AS student_name, 
  s.admission_no, 
  r.room_number, 
  st.full_name AS assigned_staff_name
FROM complaint c
JOIN student s ON c.student_id = s.student_id
LEFT JOIN room r ON c.room_id = r.room_id
LEFT JOIN staff st ON c.assigned_staff_id = st.staff_id
WHERE c.status != 'Resolved';
