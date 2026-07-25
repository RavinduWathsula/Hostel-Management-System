const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Middleware helper
const checkDbConnection = async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    connection.release();
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed. Please make sure MySQL is running and the database hostel_management_system exists.',
      details: error.message
    });
  }
};

// Apply database connection check for all APIs
app.use('/api', checkDbConnection);

// ==========================================
// 1. DASHBOARD METRICS API
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Total Students
    const [studentsResult] = await db.query(
      "SELECT COUNT(*) as count FROM student WHERE status = 'Active'"
    );
    
    // Room occupancy
    const [occupancyResult] = await db.query(
      "SELECT SUM(capacity) as total_capacity, SUM(occupied_seats) as occupied_seats FROM room"
    );
    
    // Open Complaints
    const [complaintsResult] = await db.query(
      "SELECT COUNT(*) as count FROM complaint WHERE status != 'Resolved'"
    );
    
    // Fee Collection summary (Current month or total)
    const [feesResult] = await db.query(`
      SELECT 
        SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status IN ('Pending', 'Overdue') THEN amount ELSE 0 END) as total_due
      FROM fee_payment
    `);

    // Hostel-wise distribution
    const [hostelsResult] = await db.query(`
      SELECT h.hostel_name, COUNT(r.room_id) as total_rooms, SUM(r.occupied_seats) as occupied
      FROM hostel h
      LEFT JOIN room r ON h.hostel_id = r.hostel_id
      GROUP BY h.hostel_id, h.hostel_name
    `);

    res.json({
      success: true,
      stats: {
        totalStudents: studentsResult[0].count,
        totalCapacity: parseInt(occupancyResult[0].total_capacity || 0),
        occupiedSeats: parseInt(occupancyResult[0].occupied_seats || 0),
        openComplaints: complaintsResult[0].count,
        totalPaidFees: parseFloat(feesResult[0].total_paid || 0),
        totalDueFees: parseFloat(feesResult[0].total_due || 0),
        hostels: hostelsResult
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. STUDENTS API
// ==========================================
app.get('/api/students', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = "SELECT * FROM student WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (full_name LIKE ? OR admission_no LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY student_id DESC";
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const {
      admission_no, full_name, gender, dob, phone, email,
      course, year_of_study, address, guardian_name, guardian_phone
    } = req.body;

    if (!admission_no || !full_name || !gender || !phone) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    const [result] = await db.query(
      `INSERT INTO student (admission_no, full_name, gender, dob, phone, email, course, year_of_study, address, guardian_name, guardian_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [admission_no, full_name, gender, dob || null, phone, email || null, course || null, year_of_study || null, address || null, guardian_name || null, guardian_phone || null]
    );

    res.status(201).json({ success: true, message: 'Student added successfully', studentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      admission_no, full_name, gender, dob, phone, email,
      course, year_of_study, address, guardian_name, guardian_phone, status
    } = req.body;

    await db.query(
      `UPDATE student SET 
        admission_no = ?, full_name = ?, gender = ?, dob = ?, phone = ?, 
        email = ?, course = ?, year_of_study = ?, address = ?, 
        guardian_name = ?, guardian_phone = ?, status = ?
       WHERE student_id = ?`,
      [admission_no, full_name, gender, dob || null, phone, email || null, course || null, year_of_study || null, address || null, guardian_name || null, guardian_phone || null, status, id]
    );

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM student WHERE student_id = ?", [id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ROOMS & ALLOCATIONS API
// ==========================================
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.hostel_name, h.hostel_type 
      FROM room r
      JOIN hostel h ON r.hostel_id = h.hostel_id
      ORDER BY h.hostel_name, r.room_number
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/allocations/occupancy', async (req, res) => {
  try {
    // Select from view vw_room_occupancy
    const [rows] = await db.query("SELECT * FROM vw_room_occupancy");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/allocations/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, s.full_name as student_name, s.admission_no, r.room_number, h.hostel_name
      FROM room_allocation ra
      JOIN student s ON ra.student_id = s.student_id
      JOIN room r ON ra.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
      WHERE ra.status = 'Active'
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Allocate room using stored procedure `sp_allocate_room`
app.post('/api/allocations', async (req, res) => {
  try {
    const { student_id, room_id, bed_number } = req.body;
    if (!student_id || !room_id || !bed_number) {
      return res.status(400).json({ success: false, error: 'Student, Room, and Bed number are required' });
    }

    // Call stored procedure sp_allocate_room
    const [result] = await db.query(
      "CALL sp_allocate_room(?, ?, ?)",
      [student_id, room_id, bed_number]
    );
    
    // In mysql2 CALL returns an array of result sets, the first element contains the output variables/select result
    const msg = result[0][0].message;
    
    if (msg.includes('successfully')) {
      res.json({ success: true, message: msg });
    } else {
      res.status(400).json({ success: false, error: msg });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vacate room using stored procedure `sp_vacate_room`
postVacate = async (req, res) => {
  try {
    const { allocation_id } = req.body;
    if (!allocation_id) {
      return res.status(400).json({ success: false, error: 'Allocation ID is required' });
    }

    const [result] = await db.query(
      "CALL sp_vacate_room(?)",
      [allocation_id]
    );

    const msg = result[0][0].message;
    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.post('/api/allocations/vacate', postVacate);

// ==========================================
// 4. COMPLAINTS API
// ==========================================
app.get('/api/complaints', async (req, res) => {
  try {
    // Select open complaints from view `vw_open_complaints`
    const [openRows] = await db.query("SELECT * FROM vw_open_complaints");
    
    // Select all complaints with detail for full list
    const [allRows] = await db.query(`
      SELECT c.*, s.full_name as student_name, r.room_number, st.full_name as staff_name
      FROM complaint c
      JOIN student s ON c.student_id = s.student_id
      LEFT JOIN room r ON c.room_id = r.room_id
      LEFT JOIN staff st ON c.assigned_staff_id = st.staff_id
      ORDER BY c.complaint_id DESC
    `);

    res.json({
      success: true,
      openComplaints: openRows,
      allComplaints: allRows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { student_id, room_id, category, description, assigned_staff_id } = req.body;
    if (!student_id || !category || !description) {
      return res.status(400).json({ success: false, error: 'Student, category, and description are required' });
    }

    await db.query(
      `INSERT INTO complaint (student_id, room_id, category, description, assigned_staff_id)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, room_id || null, category, description, assigned_staff_id || null]
    );

    res.status(201).json({ success: true, message: 'Complaint raised successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/complaints/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE complaint SET status = 'Resolved', resolved_date = CURRENT_DATE WHERE complaint_id = ?",
      [id]
    );
    res.json({ success: true, message: 'Complaint marked as Resolved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/complaints/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;
    await db.query(
      "UPDATE complaint SET assigned_staff_id = ?, status = 'In Progress' WHERE complaint_id = ?",
      [staff_id, id]
    );
    res.json({ success: true, message: 'Staff member assigned and complaint set to In Progress' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. FEE PAYMENTS API
// ==========================================
app.get('/api/payments', async (req, res) => {
  try {
    // Summaries from view `vw_fee_summary`
    const [summaries] = await db.query("SELECT * FROM vw_fee_summary");

    // All payments detailed
    const [payments] = await db.query(`
      SELECT fp.*, s.full_name, s.admission_no
      FROM fee_payment fp
      JOIN student s ON fp.student_id = s.student_id
      ORDER BY fp.payment_id DESC
    `);

    res.json({
      success: true,
      summaries: summaries,
      payments: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { student_id, fee_type, amount, payment_mode, month_for, receipt_no, status } = req.body;
    if (!student_id || !fee_type || !amount || !payment_mode) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    await db.query(
      `INSERT INTO fee_payment (student_id, fee_type, amount, payment_mode, month_for, receipt_no, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, fee_type, amount, payment_mode, month_for || null, receipt_no || `RCPT-${Date.now()}`, status || 'Paid']
    );

    res.status(201).json({ success: true, message: 'Fee payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. VISITOR LOG API
// ==========================================
app.get('/api/visitors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, s.full_name as student_name, s.admission_no
      FROM visitor_log v
      JOIN student s ON v.student_id = s.student_id
      ORDER BY v.visitor_id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/visitors', async (req, res) => {
  try {
    const { student_id, visitor_name, relation, phone, purpose } = req.body;
    if (!student_id || !visitor_name || !phone) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    await db.query(
      `INSERT INTO visitor_log (student_id, visitor_name, relation, phone, time_in, purpose)
       VALUES (?, ?, ?, ?, CURRENT_TIME, ?)`,
      [student_id, visitor_name, relation || null, phone, purpose || null]
    );

    res.status(201).json({ success: true, message: 'Visitor checked in successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/visitors/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE visitor_log SET time_out = CURRENT_TIME WHERE visitor_id = ?",
      [id]
    );
    res.json({ success: true, message: 'Visitor checked out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. STAFF API
// ==========================================
app.get('/api/staff', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, h.hostel_name 
      FROM staff s
      LEFT JOIN hostel h ON s.hostel_id = h.hostel_id
      ORDER BY s.staff_id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { full_name, designation, phone, email, hostel_id, salary } = req.body;
    if (!full_name || !designation || !phone) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    await db.query(
      `INSERT INTO staff (full_name, designation, phone, email, hostel_id, salary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, designation, phone, email || null, hostel_id || null, salary || null]
    );

    res.status(201).json({ success: true, message: 'Staff added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. LEAVE APPLICATIONS API
// ==========================================
app.get('/api/leaves', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, s.full_name as student_name, s.admission_no, st.full_name as approved_by_name
      FROM leave_application l
      JOIN student s ON l.student_id = s.student_id
      LEFT JOIN staff st ON l.approved_by = st.staff_id
      ORDER BY l.leave_id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const { student_id, from_date, to_date, reason } = req.body;
    if (!student_id || !from_date || !to_date) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    await db.query(
      `INSERT INTO leave_application (student_id, from_date, to_date, reason)
       VALUES (?, ?, ?, ?)`,
      [student_id, from_date, to_date, reason || null]
    );

    res.status(201).json({ success: true, message: 'Leave application submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/leaves/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by } = req.body; // status: 'Approved' or 'Rejected'
    if (!status || !approved_by) {
      return res.status(400).json({ success: false, error: 'Status and Approving Warden ID are required' });
    }

    await db.query(
      "UPDATE leave_application SET status = ?, approved_by = ? WHERE leave_id = ?",
      [status, approved_by, id]
    );
    res.json({ success: true, message: `Leave application status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. ATTENDANCE API
// ==========================================
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Fetch student list with attendance for targetDate
    const [rows] = await db.query(`
      SELECT s.student_id, s.full_name, s.admission_no, 
             a.attendance_id, COALESCE(a.status, 'Absent') as status, a.attendance_date,
             st.full_name as marked_by_name
      FROM student s
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.attendance_date = ?
      LEFT JOIN staff st ON a.marked_by = st.staff_id
      WHERE s.status = 'Active'
      ORDER BY s.full_name
    `, [targetDate]);

    res.json({ success: true, date: targetDate, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { attendance_date, records, marked_by } = req.body; // records: [{student_id, status}]
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Records array is required' });
    }

    const date = attendance_date || new Date().toISOString().split('T')[0];

    // Bulk upsert records
    for (const rec of records) {
      await db.query(`
        INSERT INTO attendance (student_id, attendance_date, status, marked_by)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
      `, [rec.student_id, date, rec.status, marked_by || null]);
    }

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
