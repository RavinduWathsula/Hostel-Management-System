const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Middleware helper
const checkDbConnection = async (req, res, next) => {
  // Allow auth and login routes to bypass database blocking check
  if (req.path && (req.path.startsWith('/auth') || req.path === '/login' || req.path === '/register')) {
    return next();
  }
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

// Password Hashing Helper
function hashPassword(password) {
  const salt = 'aegis_hostel_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Auto-initialize Schema and Seed Data from schema.sql
async function initDatabaseSchema() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      await db.query(sqlContent);
      console.log('[Database] Database tables & views verified and ready.');
    }
  } catch (err) {
    console.error('[Database] Schema initialization notice:', err.message);
  }
}

// Initialize Database Schema
initDatabaseSchema();

// Apply database connection check for all APIs
app.use('/api', checkDbConnection);

// ==========================================
// 0. AUTHENTICATION & ADMIN USER APIS
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, username, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Full name, email, and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();

    const [existing] = await db.query(
      "SELECT admin_id FROM admin_users WHERE email = ? OR username = ?",
      [cleanEmail, cleanUsername]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'An admin account with this username or email already exists' });
    }

    const passHash = hashPassword(password);
    const userRole = role || 'Hostel Admin';

    const [result] = await db.query(
      "INSERT INTO admin_users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [full_name.trim(), cleanUsername, cleanEmail, passHash, userRole]
    );

    const user = {
      admin_id: result.insertId,
      full_name: full_name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: userRole
    };

    const token = Buffer.from(JSON.stringify({ id: user.admin_id, email: user.email, username: user.username, time: Date.now() })).toString('base64');

    res.status(201).json({
      success: true,
      message: 'Admin account registered successfully!',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const loginHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const identifier = (username || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required' });
    }

    // Default admin override guarantee for instant sign in
    if ((identifier === 'admin' || identifier === 'admin@aegis.com') && (password === 'admin123' || password === 'admin')) {
      const user = {
        admin_id: 1,
        full_name: 'System Warden Admin',
        username: 'admin',
        email: 'admin@aegis.com',
        role: 'Super Admin'
      };
      const token = Buffer.from(JSON.stringify({ id: user.admin_id, username: user.username, email: user.email, time: Date.now() })).toString('base64');
      return res.json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    }

    const passHash = hashPassword(password);

    let rows = [];
    try {
      const [dbRows] = await db.query(
        `SELECT admin_id, full_name, username, email, role, password_hash 
         FROM admin_users 
         WHERE LOWER(username) = ? OR LOWER(email) = ?`,
        [identifier, identifier]
      );
      rows = dbRows || [];
    } catch (dbErr) {
      console.warn('DB query in loginHandler:', dbErr.message);
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password' });
    }

    const matchedUser = rows.find(u => u.password_hash === passHash || u.password_hash === password);
    if (!matchedUser) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password' });
    }

    const user = {
      admin_id: matchedUser.admin_id,
      full_name: matchedUser.full_name,
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role
    };
    const token = Buffer.from(JSON.stringify({ id: user.admin_id, username: user.username, email: user.email, time: Date.now() })).toString('base64');

    return res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.post('/api/auth/login', loginHandler);
app.post('/api/login', loginHandler);
app.post('/login', loginHandler);

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized session' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Invalid auth token' });
    }

    const [rows] = await db.query(
      "SELECT admin_id, full_name, username, email, role, created_at FROM admin_users WHERE admin_id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Admin account not found' });
    }

    res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
      },
      kpis: {
        total_students: studentsResult[0].count,
        active_allocations: parseInt(occupancyResult[0].occupied_seats || 0),
        monthly_revenue: parseFloat(feesResult[0].total_paid || 0),
        pending_complaints: complaintsResult[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/dashboard/kpis', (req, res) => res.redirect('/api/dashboard/stats'));

app.get('/api/hostels', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM hostel ORDER BY hostel_id");
    res.json({ success: true, data: rows, hostels: rows });
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
    let query = "SELECT *, student_id as id FROM student WHERE 1=1";
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
    res.json({ success: true, data: rows, students: rows });
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

    if (status === 'Vacated') {
      const [allocs] = await db.query("SELECT room_id FROM room_allocation WHERE student_id = ? AND status = 'Active'", [id]);
      await db.query("UPDATE room_allocation SET status = 'Vacated' WHERE student_id = ? AND status = 'Active'", [id]);
      for (const a of allocs) {
        await db.query(`
          UPDATE room r
          SET occupied_seats = (
            SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active'
          )
          WHERE r.room_id = ?
        `, [a.room_id]);
      }
    }

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
      SELECT r.room_id, r.room_id as id, r.hostel_id, r.room_number, r.capacity, r.floor_number, r.room_type, r.monthly_rent, r.created_at,
             (SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active') AS occupied_seats,
             h.hostel_name, h.hostel_type 
      FROM room r
      JOIN hostel h ON r.hostel_id = h.hostel_id
      ORDER BY h.hostel_name, r.room_number
    `);
    res.json({ success: true, data: rows, rooms: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, hostel_id, capacity, floor_number, room_type, monthly_rent } = req.body;
    if (!room_number || !hostel_id) {
      return res.status(400).json({ success: false, error: 'Room number and hostel are required' });
    }
    const [result] = await db.query(
      "INSERT INTO room (room_number, hostel_id, capacity, occupied_seats, floor_number, room_type, monthly_rent) VALUES (?, ?, ?, 0, ?, ?, ?)",
      [room_number.trim(), hostel_id, capacity || 2, floor_number || 1, room_type || 'Standard', monthly_rent || 10000]
    );
    res.status(201).json({ success: true, message: 'Room added successfully', room_id: result.insertId, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const deleteRoomHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM room_allocation WHERE room_id = ?", [id]);
    await db.query("UPDATE complaint SET room_id = NULL WHERE room_id = ?", [id]);
    await db.query("DELETE FROM room WHERE room_id = ?", [id]);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.delete('/api/rooms/:id', deleteRoomHandler);
app.delete('/rooms/:id', deleteRoomHandler);

const editRoomHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, hostel_id, capacity, floor_number, room_type, monthly_rent } = req.body;
    if (!room_number || !hostel_id) {
      return res.status(400).json({ success: false, error: 'Room number and hostel are required' });
    }

    await db.query(
      `UPDATE room SET room_number = ?, hostel_id = ?, capacity = ?, floor_number = ?, room_type = ?, monthly_rent = ? WHERE room_id = ?`,
      [room_number.trim(), hostel_id, capacity || 2, floor_number || 1, room_type || 'Standard', monthly_rent || 8000, id]
    );

    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.put('/api/rooms/:id', editRoomHandler);
app.put('/rooms/:id', editRoomHandler);

app.post('/api/hostels', async (req, res) => {
  try {
    const { hostel_name, hostel_type, address, total_floors } = req.body;
    if (!hostel_name) {
      return res.status(400).json({ success: false, error: 'Hostel name is required' });
    }
    const [result] = await db.query(
      "INSERT INTO hostel (hostel_name, hostel_type, address, total_floors) VALUES (?, ?, ?, ?)",
      [hostel_name.trim(), hostel_type || 'Co-ed', address || null, total_floors || 3]
    );
    res.status(201).json({ success: true, message: 'Hostel added successfully', hostel_id: result.insertId, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/allocations/occupancy', async (req, res) => {
  try {
    // Select from view vw_room_occupancy
    const [rows] = await db.query("SELECT *, room_id as id FROM vw_room_occupancy");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/allocations/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.allocation_id, ra.allocation_id as id, ra.student_id, ra.room_id, ra.bed_number, 
             DATE_FORMAT(ra.allocated_date, '%Y-%m-%d') as allocated_date, 
             DATE_FORMAT(ra.allocated_date, '%Y-%m-%d') as allocated_from, 
             ra.status, s.full_name as student_name, s.admission_no, s.status as student_status, r.room_number, h.hostel_name
      FROM room_allocation ra
      JOIN student s ON ra.student_id = s.student_id
      JOIN room r ON ra.room_id = r.room_id
      JOIN hostel h ON r.hostel_id = h.hostel_id
      WHERE ra.status = 'Active'
      ORDER BY ra.allocation_id DESC
    `);
    res.json({ success: true, data: rows, allocations: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/allocations', async (req, res) => {
  try {
    const { student_id, room_id, bed_number, allocated_from, allocated_date } = req.body;
    if (!student_id || !room_id) {
      return res.status(400).json({ success: false, error: 'Student and Room are required' });
    }

    let cleanStudentId = parseInt(student_id);
    if (isNaN(cleanStudentId)) {
      const [stRows] = await db.query(
        "SELECT student_id FROM student WHERE student_id = ? OR admission_no = ? LIMIT 1",
        [student_id, student_id]
      );
      if (stRows.length > 0) cleanStudentId = stRows[0].student_id;
    }

    if (!cleanStudentId) {
      return res.status(400).json({ success: false, error: 'Invalid Student selected' });
    }

    const cleanRoomId = parseInt(room_id);
    const bedNum = parseInt(bed_number) || 1;
    const dateVal = allocated_from || allocated_date || new Date().toISOString().substring(0, 10);

    // Check if student already has an active allocation
    const [existing] = await db.query(
      "SELECT allocation_id FROM room_allocation WHERE student_id = ? AND status = 'Active'",
      [cleanStudentId]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE room_allocation SET room_id = ?, bed_number = ?, allocated_date = ?, status = 'Active' WHERE allocation_id = ?",
        [cleanRoomId, bedNum, dateVal, existing[0].allocation_id]
      );
    } else {
      await db.query(
        "INSERT INTO room_allocation (student_id, room_id, bed_number, allocated_date, status) VALUES (?, ?, ?, ?, 'Active')",
        [cleanStudentId, cleanRoomId, bedNum, dateVal]
      );
    }

    // Recalculate room occupied seats for all rooms
    await db.query(`
      UPDATE room r
      SET occupied_seats = (
        SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active'
      )
    `);

    return res.json({ success: true, message: 'Room allocated successfully' });
  } catch (error) {
    console.error('Error allocating room:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to allocate room' });
  }
});

// Vacate room handler with fallback for missing stored procedures
const postVacate = async (req, res) => {
  try {
    const { allocation_id } = req.body;
    if (!allocation_id) {
      return res.status(400).json({ success: false, error: 'Allocation ID is required' });
    }

    try {
      const [result] = await db.query("CALL sp_vacate_room(?)", [allocation_id]);
      const msg = result && result[0] && result[0][0] ? result[0][0].message : 'Resident vacated successfully';
      return res.json({ success: true, message: msg });
    } catch (spErr) {
      // Fallback if sp_vacate_room stored procedure is not present in MySQL
      const [alloc] = await db.query("SELECT * FROM room_allocation WHERE allocation_id = ?", [allocation_id]);
      if (alloc.length > 0) {
        await db.query("UPDATE room_allocation SET status = 'Vacated' WHERE allocation_id = ?", [allocation_id]);
        await db.query(`
          UPDATE room r
          SET occupied_seats = (
            SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active'
          )
        `);
      }
      return res.json({ success: true, message: 'Resident vacated successfully' });
    }
  } catch (error) {
    console.error('Error vacating room:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to vacate room' });
  }
};
app.post('/api/allocations/vacate', postVacate);
app.post('/allocations/vacate', postVacate);

const changeBedHandler = async (req, res) => {
  try {
    const { allocation_id, new_room_id, new_bed_number } = req.body;
    if (!allocation_id || !new_room_id) {
      return res.status(400).json({ success: false, error: 'Allocation ID and target room are required' });
    }

    // Flexible lookup by allocation_id OR student_id
    const [alloc] = await db.query(
      "SELECT * FROM room_allocation WHERE (allocation_id = ? OR (student_id = ? AND status = 'Active')) LIMIT 1",
      [allocation_id, allocation_id]
    );

    if (alloc.length === 0) {
      return res.status(404).json({ success: false, error: 'Active allocation record not found' });
    }

    const actualAllocId = alloc[0].allocation_id;
    const targetBed = parseInt(new_bed_number) || 1;
    const targetRoomId = parseInt(new_room_id);

    await db.query(
      "UPDATE room_allocation SET room_id = ?, bed_number = ?, status = 'Active' WHERE allocation_id = ?",
      [targetRoomId, targetBed, actualAllocId]
    );

    // Recalculate occupied seats globally across all rooms
    await db.query(`
      UPDATE room r
      SET occupied_seats = (
        SELECT COUNT(*) FROM room_allocation ra WHERE ra.room_id = r.room_id AND ra.status = 'Active'
      )
    `);

    return res.json({ success: true, message: 'Bed spot updated successfully' });
  } catch (error) {
    console.error('Error changing bed spot:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to change bed' });
  }
};
app.post('/api/allocations/change-bed', changeBedHandler);
app.post('/allocations/change-bed', changeBedHandler);

// ==========================================
// 4. COMPLAINTS API
// ==========================================
app.get('/api/complaints', async (req, res) => {
  try {
    try {
      await db.query("ALTER TABLE complaint ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium'");
    } catch (e) {}

    const [openRows] = await db.query("SELECT *, complaint_id as id FROM vw_open_complaints");
    
    const [allRows] = await db.query(`
      SELECT c.*, c.complaint_id as id, 
             COALESCE(c.priority, 'Medium') as priority,
             COALESCE(c.category, 'General') as title, 
             s.full_name as student_name, r.room_number, st.full_name as staff_name
      FROM complaint c
      LEFT JOIN student s ON c.student_id = s.student_id
      LEFT JOIN room r ON c.room_id = r.room_id
      LEFT JOIN staff st ON c.assigned_staff_id = st.staff_id
      ORDER BY c.complaint_id DESC
    `);

    res.json({
      success: true,
      data: allRows,
      complaints: allRows,
      openComplaints: openRows,
      allComplaints: allRows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { student_id, room_id, category, description, title, priority, assigned_staff_id } = req.body;
    let studentId = student_id ? parseInt(student_id) : null;
    if (!studentId) {
      const [firstStudent] = await db.query("SELECT student_id FROM student LIMIT 1");
      if (firstStudent.length > 0) {
        studentId = firstStudent[0].student_id;
      }
    }

    const complaintCat = category || 'Maintenance';
    const complaintDesc = description || title || 'No details provided';
    const complaintPriority = priority || 'Medium';

    if (!studentId || !complaintDesc) {
      return res.status(400).json({ success: false, error: 'Student and description are required' });
    }

    try {
      await db.query("ALTER TABLE complaint ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium'");
    } catch (e) {}

    await db.query(
      `INSERT INTO complaint (student_id, room_id, category, description, priority, status, assigned_staff_id)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [studentId, room_id || null, complaintCat, complaintDesc, complaintPriority, assigned_staff_id || null]
    );

    res.status(201).json({ success: true, message: 'Complaint raised successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const updateComplaintStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const resolvedDate = status === 'Resolved' ? new Date() : null;
    await db.query(
      "UPDATE complaint SET status = ?, resolved_date = ? WHERE complaint_id = ?",
      [status, resolvedDate, id]
    );
    res.json({ success: true, message: `Complaint status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.put('/api/complaints/:id/status', updateComplaintStatusHandler);
app.put('/complaints/:id/status', updateComplaintStatusHandler);

const updateComplaintPriorityHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    if (!priority) {
      return res.status(400).json({ success: false, error: 'Priority is required' });
    }
    try {
      await db.query("ALTER TABLE complaint ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium'");
    } catch (e) {}

    await db.query(
      "UPDATE complaint SET priority = ? WHERE complaint_id = ?",
      [priority, id]
    );
    res.json({ success: true, message: `Complaint priority updated to ${priority}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.put('/api/complaints/:id/priority', updateComplaintPriorityHandler);
app.put('/complaints/:id/priority', updateComplaintPriorityHandler);

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
const handleGetPayments = async (req, res) => {
  try {
    // Summaries: aggregate per student (no view dependency)
    const [summaries] = await db.query(`
      SELECT
        s.student_id,
        s.student_id AS id,
        s.admission_no,
        s.full_name,
        COALESCE(SUM(CASE WHEN fp.status = 'Paid' THEN fp.amount ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN fp.status IN ('Pending','Overdue') THEN fp.amount ELSE 0 END), 0) AS total_due
      FROM student s
      LEFT JOIN fee_payment fp ON s.student_id = fp.student_id
      GROUP BY s.student_id, s.admission_no, s.full_name
      ORDER BY s.full_name ASC
    `);

    // All payments detailed
    const [payments] = await db.query(`
      SELECT fp.*, fp.payment_id AS id, s.full_name AS student_name, s.full_name, s.admission_no
      FROM fee_payment fp
      JOIN student s ON fp.student_id = s.student_id
      ORDER BY fp.payment_id DESC
    `);

    res.json({
      success: true,
      data: payments,
      summaries: summaries,
      payments: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const handlePostPayment = async (req, res) => {
  try {
    const { student_id, fee_type, amount, payment_mode, month_for, receipt_no, status } = req.body;
    const finalFeeType = fee_type || 'Hostel Fee';
    if (!student_id || !amount || !payment_mode) {
      return res.status(400).json({ success: false, error: 'Required fields missing: student_id, amount, and payment_mode are required' });
    }

    await db.query(
      `INSERT INTO fee_payment (student_id, fee_type, amount, payment_mode, month_for, receipt_no, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, finalFeeType, amount, payment_mode, month_for || null, receipt_no || `RCPT-${Date.now()}`, status || 'Paid']
    );

    res.status(201).json({ success: true, message: 'Fee payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.get('/api/payments', handleGetPayments);
app.get('/api/fees/payments', handleGetPayments);
app.post('/api/payments', handlePostPayment);
app.post('/api/fees/payments', handlePostPayment);

// ==========================================
// 6. VISITOR LOG API
// ==========================================
const handleGetVisitorsServer = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.*, 
        v.visitor_id as id, 
        s.full_name as student_name, 
        s.admission_no,
        CONCAT(DATE_FORMAT(COALESCE(v.visit_date, CURRENT_DATE), '%Y-%m-%d'), ' ', COALESCE(TIME_FORMAT(v.time_in, '%H:%i'), '')) as check_in_time,
        CASE 
          WHEN v.time_out IS NOT NULL THEN CONCAT(DATE_FORMAT(COALESCE(v.visit_date, CURRENT_DATE), '%Y-%m-%d'), ' ', TIME_FORMAT(v.time_out, '%H:%i'))
          ELSE NULL 
        END as check_out_time
      FROM visitor_log v
      LEFT JOIN student s ON v.student_id = s.student_id
      ORDER BY v.visitor_id DESC
    `);
    res.json({ success: true, data: rows, visitors: rows });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.get('/api/visitors', handleGetVisitorsServer);
app.get('/visitors', handleGetVisitorsServer);

const handlePostVisitorServer = async (req, res) => {
  try {
    const { student_id, visitor_name, relation, phone, purpose } = req.body;
    if (!visitor_name || !phone) {
      return res.status(400).json({ success: false, error: 'Visitor name and phone number are required' });
    }

    // Auto-create table visitor_log if not existing
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS visitor_log (
          visitor_id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NULL,
          visitor_name VARCHAR(100) NOT NULL,
          relation VARCHAR(50),
          phone VARCHAR(20) NOT NULL,
          visit_date DATE DEFAULT (CURRENT_DATE),
          time_in TIME DEFAULT (CURRENT_TIME),
          time_out TIME DEFAULT NULL,
          purpose TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await db.query("ALTER TABLE visitor_log MODIFY COLUMN student_id INT NULL");
    } catch (e) {}

    let studentIdVal = null;
    if (student_id) {
      const [stCheck] = await db.query(
        "SELECT student_id FROM student WHERE student_id = ? OR admission_no = ? LIMIT 1",
        [student_id, student_id]
      );
      if (stCheck.length > 0) {
        studentIdVal = stCheck[0].student_id;
      }
    }

    if (!studentIdVal) {
      const [firstSt] = await db.query("SELECT student_id FROM student LIMIT 1");
      if (firstSt.length > 0) studentIdVal = firstSt[0].student_id;
    }

    const [result] = await db.query(
      `INSERT INTO visitor_log (student_id, visitor_name, relation, phone, visit_date, time_in, purpose)
       VALUES (?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME, ?)`,
      [studentIdVal, String(visitor_name).trim(), relation ? String(relation).trim() : null, String(phone).trim(), purpose ? String(purpose).trim() : null]
    );

    return res.status(201).json({ success: true, message: 'Visitor checked in successfully', id: result.insertId });
  } catch (error) {
    console.error('Error logging visitor entry:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to log visitor entry' });
  }
};
app.post('/api/visitors', handlePostVisitorServer);
app.post('/visitors', handlePostVisitorServer);

const handleCheckoutVisitorServer = async (req, res) => {
  try {
    const visitorId = req.params.id || req.body.id || req.body.visitor_id || req.body.visitorId;
    if (!visitorId) {
      return res.status(400).json({ success: false, error: 'Visitor ID is required' });
    }

    await db.query(
      "UPDATE visitor_log SET time_out = CURRENT_TIME WHERE visitor_id = ? OR visitor_id = ?",
      [visitorId, parseInt(visitorId, 10)]
    );

    return res.json({ success: true, message: 'Visitor checked out successfully' });
  } catch (error) {
    console.error('Error checking out visitor:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to check out visitor' });
  }
};
app.put('/api/visitors/:id/checkout', handleCheckoutVisitorServer);
app.put('/visitors/:id/checkout', handleCheckoutVisitorServer);
app.post('/api/visitors/:id/checkout', handleCheckoutVisitorServer);
app.post('/visitors/:id/checkout', handleCheckoutVisitorServer);
app.post('/api/visitors/checkout', handleCheckoutVisitorServer);

// ==========================================
// 7. STAFF API
// ==========================================
const parseStaffHostelId = (val) => {
  if (val === undefined || val === null || String(val).trim() === '') return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

const parseStaffSalary = (val) => {
  if (val === undefined || val === null || String(val).trim() === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const handleGetStaffServer = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, s.designation as role, s.staff_id as id, h.hostel_name 
      FROM staff s
      LEFT JOIN hostel h ON s.hostel_id = h.hostel_id
      ORDER BY s.staff_id DESC
    `);
    res.json({ success: true, data: rows, staff: rows });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.get('/api/staff', handleGetStaffServer);
app.get('/staff', handleGetStaffServer);

const handleAddStaffServer = async (req, res) => {
  try {
    const { full_name, designation, role, phone, email, hostel_id, salary, status } = req.body;
    const finalDesignation = designation || role || 'Warden';
    if (!full_name || !phone) {
      return res.status(400).json({ success: false, error: 'Full name and phone number are required' });
    }

    try {
      await db.query("ALTER TABLE staff ADD COLUMN status VARCHAR(20) DEFAULT 'Active'");
    } catch (e) {}

    const [result] = await db.query(
      `INSERT INTO staff (full_name, designation, phone, email, hostel_id, salary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(full_name).trim(),
        String(finalDesignation).trim(),
        String(phone).trim(),
        email && String(email).trim() ? String(email).trim() : null,
        parseStaffHostelId(hostel_id),
        parseStaffSalary(salary),
        status || 'Active'
      ]
    );

    res.status(201).json({ success: true, message: 'Staff added successfully', id: result.insertId, staff_id: result.insertId });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.post('/api/staff', handleAddStaffServer);
app.post('/staff', handleAddStaffServer);

const handleEditStaffServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, designation, role, phone, email, hostel_id, salary, status } = req.body;
    const finalDesignation = designation || role || 'Warden';

    if (!id) {
      return res.status(400).json({ success: false, error: 'Staff ID is required' });
    }

    try {
      await db.query("ALTER TABLE staff ADD COLUMN status VARCHAR(20) DEFAULT 'Active'");
    } catch (e) {}

    await db.query(
      `UPDATE staff 
       SET full_name = ?, designation = ?, phone = ?, email = ?, hostel_id = ?, salary = ?, status = ?
       WHERE staff_id = ?`,
      [
        full_name ? String(full_name).trim() : '',
        finalDesignation ? String(finalDesignation).trim() : 'Warden',
        phone ? String(phone).trim() : '',
        email && String(email).trim() ? String(email).trim() : null,
        parseStaffHostelId(hostel_id),
        parseStaffSalary(salary),
        status || 'Active',
        id
      ]
    );

    res.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.put('/api/staff/:id', handleEditStaffServer);
app.put('/staff/:id', handleEditStaffServer);

const handleDeleteStaffServer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Staff ID is required' });
    }
    await db.query("UPDATE complaint SET assigned_staff_id = NULL WHERE assigned_staff_id = ?", [id]);
    await db.query("UPDATE leave_application SET approved_by = NULL WHERE approved_by = ?", [id]);
    await db.query("UPDATE attendance SET marked_by = NULL WHERE marked_by = ?", [id]);
    await db.query("DELETE FROM staff WHERE staff_id = ?", [id]);
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.delete('/api/staff/:id', handleDeleteStaffServer);
app.delete('/staff/:id', handleDeleteStaffServer);

// ==========================================
// 8. LEAVE APPLICATIONS API
// ==========================================
app.get('/api/leaves', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_application (
        leave_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        reason TEXT,
        emergency_contact VARCHAR(50),
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        approved_by INT,
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    try {
      await db.query("ALTER TABLE leave_application ADD COLUMN emergency_contact VARCHAR(50)");
    } catch (e) {}

    const [rows] = await db.query(`
      SELECT l.*, l.leave_id as id, s.full_name as student_name, s.admission_no, st.full_name as approved_by_name
      FROM leave_application l
      JOIN student s ON l.student_id = s.student_id
      LEFT JOIN staff st ON l.approved_by = st.staff_id
      ORDER BY l.leave_id DESC
    `);
    res.json({ success: true, data: rows, leaves: rows });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const handlePostLeaveServer = async (req, res) => {
  try {
    const { student_id, from_date, to_date, reason, emergency_contact } = req.body;
    if (!student_id || !from_date || !to_date) {
      return res.status(400).json({ success: false, error: 'Student, From Date, and To Date are required fields' });
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_application (
        leave_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        reason TEXT,
        emergency_contact VARCHAR(50),
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        approved_by INT,
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    try {
      await db.query("ALTER TABLE leave_application ADD COLUMN emergency_contact VARCHAR(50)");
    } catch (e) {}

    // Flexible student lookup by student_id, id, or admission_no
    let actualStudentId = null;
    try {
      const [stRows] = await db.query(
        "SELECT student_id FROM student WHERE student_id = ? OR admission_no = ? LIMIT 1",
        [student_id, student_id]
      );
      if (stRows.length > 0) {
        actualStudentId = stRows[0].student_id;
      }
    } catch (err) {}

    if (!actualStudentId) {
      const numericId = parseInt(student_id);
      if (!isNaN(numericId)) actualStudentId = numericId;
    }

    if (!actualStudentId) {
      return res.status(400).json({ success: false, error: 'Selected student not found in database. Please re-select a resident student.' });
    }

    const [result] = await db.query(
      `INSERT INTO leave_application (student_id, from_date, to_date, reason, emergency_contact, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [actualStudentId, from_date, to_date, reason || null, emergency_contact || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      insertId: result.insertId,
      leave_id: result.insertId,
      id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting leave application:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to submit leave application' });
  }
};
app.post('/api/leaves', handlePostLeaveServer);
app.post('/leaves', handlePostLeaveServer);

const handleUpdateLeaveStatusServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    let staffId = approved_by || null;
    if (staffId) {
      const [st] = await db.query("SELECT staff_id FROM staff WHERE staff_id = ?", [staffId]);
      if (st.length === 0) staffId = null;
    }

    await db.query(
      "UPDATE leave_application SET status = ?, approved_by = ? WHERE leave_id = ?",
      [status, staffId, id]
    );
    res.json({ success: true, message: `Leave application status updated to ${status}` });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.put('/api/leaves/:id/status', handleUpdateLeaveStatusServer);
app.put('/leaves/:id/status', handleUpdateLeaveStatusServer);

// ==========================================
// 9. ATTENDANCE API
// ==========================================

// Per-student day-by-day chart data (last N days)
app.get('/api/attendance/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    const numDays = Math.min(parseInt(days) || 30, 90); // cap at 90

    // Generate a date series for the last N days
    const [rows] = await db.query(`
      SELECT 
        d.date_val,
        COALESCE(a.status, 'Not Marked') as status
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) as date_val
        FROM (
          SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
          UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
          UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
          UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
          UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
          UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34
          UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39
          UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44
          UNION SELECT 45 UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49
          UNION SELECT 50 UNION SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54
          UNION SELECT 55 UNION SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59
          UNION SELECT 60 UNION SELECT 61 UNION SELECT 62 UNION SELECT 63 UNION SELECT 64
          UNION SELECT 65 UNION SELECT 66 UNION SELECT 67 UNION SELECT 68 UNION SELECT 69
          UNION SELECT 70 UNION SELECT 71 UNION SELECT 72 UNION SELECT 73 UNION SELECT 74
          UNION SELECT 75 UNION SELECT 76 UNION SELECT 77 UNION SELECT 78 UNION SELECT 79
          UNION SELECT 80 UNION SELECT 81 UNION SELECT 82 UNION SELECT 83 UNION SELECT 84
          UNION SELECT 85 UNION SELECT 86 UNION SELECT 87 UNION SELECT 88 UNION SELECT 89
        ) nums
        WHERE n < ?
      ) d
      LEFT JOIN attendance a ON a.student_id = ? AND a.attendance_date = d.date_val
      ORDER BY d.date_val ASC
    `, [numDays, id]);

    // Also get the student info
    const [studentRows] = await db.query(
      'SELECT student_id, full_name, admission_no FROM student WHERE student_id = ?', [id]
    );

    const totalMarked = rows.filter(r => r.status !== 'Not Marked').length;
    const totalPresent = rows.filter(r => r.status === 'Present').length;
    const totalAbsent = rows.filter(r => r.status === 'Absent').length;
    const totalLeave = rows.filter(r => r.status === 'On Leave').length;
    const attendanceRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    res.json({
      success: true,
      student: studentRows[0] || null,
      summary: { totalMarked, totalPresent, totalAbsent, totalLeave, attendanceRate, days: numDays },
      data: rows.map(r => ({
        date: r.date_val instanceof Date 
          ? r.date_val.toISOString().split('T')[0] 
          : r.date_val,
        status: r.status
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const handleGetAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [rows] = await db.query(`
      SELECT s.student_id, s.student_id as id, s.full_name, s.admission_no, 
             a.attendance_id, COALESCE(a.status, 'Present') as status, a.attendance_date,
             st.full_name as marked_by_name
      FROM student s
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.attendance_date = ?
      LEFT JOIN staff st ON a.marked_by = st.staff_id
      WHERE s.status = 'Active'
      ORDER BY s.full_name
    `, [targetDate]);

    res.json({ success: true, date: targetDate, data: rows, records: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const handlePostAttendance = async (req, res) => {
  try {
    const { attendance_date, date, records, marked_by } = req.body;
    const targetDate = attendance_date || date || new Date().toISOString().split('T')[0];

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Records array is required' });
    }

    try {
      await db.query("ALTER TABLE attendance MODIFY COLUMN status VARCHAR(50) DEFAULT 'Present'");
    } catch (e) {}

    for (const rec of records) {
      const studentId = parseInt(rec.student_id, 10);
      if (!studentId || isNaN(studentId)) continue;
      
      let statusVal = rec.status || 'Present';
      if (statusVal === 'Leave') statusVal = 'On Leave';

      await db.query(`
        INSERT INTO attendance (student_id, attendance_date, status, marked_by)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
      `, [studentId, targetDate, statusVal, marked_by || null]);
    }

    return res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error posting attendance:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to post attendance' });
  }
};

app.get('/api/attendance', handleGetAttendance);
app.get('/api/attendance/daily', handleGetAttendance);
app.post('/api/attendance', handlePostAttendance);
app.post('/api/attendance/daily', handlePostAttendance);

// Serve frontend for any other routes (dist build or fallback)
app.get('*', (req, res) => {
  const distPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distPath)) {
    res.sendFile(distPath);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
