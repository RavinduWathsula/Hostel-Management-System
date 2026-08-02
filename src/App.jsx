import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { RoomsView } from './views/RoomsView';
import { StudentsView } from './views/StudentsView';
import { AllocationsView } from './views/AllocationsView';
import { FeesView } from './views/FeesView';
import { ComplaintsView } from './views/ComplaintsView';
import { StaffView } from './views/StaffView';
import { LeavesView } from './views/LeavesView';
import { VisitorsView } from './views/VisitorsView';
import { AttendanceView } from './views/AttendanceView';

export function AppContent() {
  const { admin, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dbOnline, setDbOnline] = useState(true);

  // Application Data States
  const [stats, setStats] = useState({});
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [feeSummary, setFeeSummary] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    if (admin) {
      fetchAllData();
      const interval = setInterval(() => {
        fetchAllData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const safeFetchJson = async (url) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      const text = await res.text();
      return text ? JSON.parse(text) : { success: false };
    } catch (e) {
      console.warn(`Fetch error for ${url}:`, e);
      return { success: false };
    }
  };

  const fetchAllData = async () => {
    try {
      const [
        statsRes,
        hostelsRes,
        roomsRes,
        studentsRes,
        allocationsRes,
        feesRes,
        complaintsRes,
        staffRes,
        leavesRes,
        visitorsRes
      ] = await Promise.all([
        safeFetchJson('/api/dashboard/stats'),
        safeFetchJson('/api/hostels'),
        safeFetchJson('/api/rooms'),
        safeFetchJson('/api/students'),
        safeFetchJson('/api/allocations/active'),
        safeFetchJson('/api/payments'),
        safeFetchJson('/api/complaints'),
        safeFetchJson('/api/staff'),
        safeFetchJson('/api/leaves'),
        safeFetchJson('/api/visitors')
      ]);

      const isConnected = Boolean(statsRes.success || hostelsRes.success || studentsRes.success || roomsRes.success);
      setDbOnline(isConnected);
      if (statsRes.success) setStats(statsRes.kpis || statsRes.stats || {});
      if (hostelsRes.success) setHostels(hostelsRes.data || hostelsRes.hostels || []);
      if (roomsRes.success) setRooms(roomsRes.data || roomsRes.rooms || []);
      if (studentsRes.success) setStudents(studentsRes.data || studentsRes.students || []);
      if (allocationsRes.success) setAllocations(allocationsRes.data || allocationsRes.allocations || []);
      if (feesRes.success) {
        setFeeSummary(feesRes.summaries || feesRes.data || []);
        setFeePayments(feesRes.payments || feesRes.data || []);
      }
      if (complaintsRes.success) setComplaints(complaintsRes.data || complaintsRes.complaints || []);
      if (staffRes.success) setStaff(staffRes.data || staffRes.staff || []);
      if (leavesRes.success) setLeaves(leavesRes.data || leavesRes.leaves || []);
      if (visitorsRes.success) setVisitors(visitorsRes.data || visitorsRes.visitors || []);
    } catch (err) {
      console.error('Failed to load API data:', err);
      setDbOnline(false);
    }
  };

  // Student Handlers
  const handleAddStudent = async (studentData) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  const handleEditStudent = async (id, studentData) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resident?')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  // Room & Allocation Handlers
  const handleAddRoom = async (roomData) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(roomData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to add room');
      }
      return data;
    } catch (err) {
      alert('Error adding room: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleAddHostel = async (hostelData) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/hostels', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(hostelData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to add hostel');
      }
      return data;
    } catch (err) {
      alert('Error adding hostel: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleAllocateRoom = async (allocationData) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(allocationData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to allocate room bed');
      }
      return data;
    } catch (err) {
      alert('Error allocating room: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`/api/rooms/${roomId}`, { 
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        setRooms(prev => prev.filter(r => String(r.room_id || r.id) !== String(roomId)));
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to delete room');
      }
      return data;
    } catch (err) {
      alert('Error deleting room: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleEditRoom = async (roomId, roomData) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(roomData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to update room');
      }
      return data;
    } catch (err) {
      alert('Error updating room: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleVacateRoom = async (allocationId) => {
    if (!window.confirm('Are you sure you want to vacate this resident from the room bed?')) return;
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/allocations/vacate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ allocation_id: allocationId })
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to vacate room bed');
      }
      return data;
    } catch (err) {
      alert('Error vacating room bed: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleChangeBed = async (allocationId, newRoomId, newBedNumber) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/allocations/change-bed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ allocation_id: allocationId, new_room_id: newRoomId, new_bed_number: newBedNumber })
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to change bed');
      }
      return data;
    } catch (err) {
      alert('Error changing bed: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Fee Payment Handler
  const handleRecordFee = async (feeData) => {
    try {
      let res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeData)
      });

      if (res.status === 404) {
        res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feeData)
        });
      }

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { success: false };
      } catch (e) {
        console.error('Server non-JSON response:', text);
        alert(`Server response error (${res.status}): ${text.substring(0, 150)}`);
        return { success: false, error: 'Invalid response from server' };
      }

      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to record fee payment.');
      }
      return data;
    } catch (err) {
      console.error('Record fee error:', err);
      alert(`Connection error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  // Complaint Handlers
  const handleLogComplaint = async (complaintData) => {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });
    const data = await res.json();
    if (data.success) {
      const studentObj = students.find(s => String(s.student_id || s.id) === String(complaintData.student_id));
      const newRecord = {
        id: data.insertId || Date.now(),
        complaint_id: data.insertId || Date.now(),
        category: complaintData.category || 'Maintenance',
        title: complaintData.title || complaintData.category || 'Complaint',
        description: complaintData.description || 'No details provided',
        priority: complaintData.priority || 'Medium',
        status: 'Open',
        student_name: studentObj ? (studentObj.full_name || studentObj.name) : 'Anonymous Resident'
      };
      setComplaints(prev => [newRecord, ...prev]);
      fetchAllData();
    }
    return data;
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    setComplaints(prev => prev.map(c => (String(c.complaint_id || c.id) === String(id) ? { ...c, status } : c)));
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  const handleUpdateComplaintPriority = async (id, priority) => {
    setComplaints(prev => prev.map(c => (String(c.complaint_id || c.id) === String(id) ? { ...c, priority } : c)));
    const res = await fetch(`/api/complaints/${id}/priority`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  // Staff Handlers
  const handleAddStaff = async (staffData) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to add staff member');
      }
      return data;
    } catch (err) {
      alert('Error adding staff member: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleEditStaff = async (id, staffData) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to update staff member');
      }
      return data;
    } catch (err) {
      alert('Error updating staff member: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.filter(s => String(s.id || s.staff_id) !== String(id)));
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to delete staff member');
      }
      return data;
    } catch (err) {
      alert('Error deleting staff member: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Leave Handlers
  const handleRequestLeave = async (leaveData) => {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(leaveData)
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { success: false, error: 'Server returned empty response' };
      } catch (parseErr) {
        console.error('Non-JSON server response text:', text);
        data = { success: false, error: 'Server error: ' + (text.substring(0, 100) || 'Invalid response format') };
      }

      if (data.success) {
        const studentObj = students.find(s => 
          String(s.id || s.student_id) === String(leaveData.student_id) ||
          String(s.admission_no) === String(leaveData.student_id)
        );
        const newLeave = {
          id: data.insertId || data.leave_id || Date.now(),
          leave_id: data.insertId || data.leave_id || Date.now(),
          student_id: leaveData.student_id,
          student_name: studentObj ? (studentObj.full_name || studentObj.name) : 'Student',
          admission_no: studentObj ? studentObj.admission_no : '',
          from_date: leaveData.from_date,
          to_date: leaveData.to_date,
          reason: leaveData.reason,
          emergency_contact: leaveData.emergency_contact || 'N/A',
          status: 'Pending'
        };
        setLeaves(prev => [newLeave, ...prev]);
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to submit leave request');
      }
      return data;
    } catch (err) {
      alert('Error submitting leave request: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      setLeaves(prev => prev.map(l => (String(l.id || l.leave_id) === String(id) ? { ...l, status } : l)));
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to update leave status');
        await fetchAllData();
      }
      return data;
    } catch (err) {
      alert('Error updating leave status: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Visitor Handlers
  const handleLogVisitor = async (visitorData) => {
    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to log visitor entry');
      }
      return data;
    } catch (err) {
      alert('Error logging visitor entry: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const handleCheckoutVisitor = async (id) => {
    try {
      const res = await fetch(`/api/visitors/${id}/checkout`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to check out visitor');
      }
      return data;
    } catch (err) {
      alert('Error checking out visitor: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Attendance Handlers
  const handleSaveAttendance = async (date, records) => {
    const res = await fetch('/api/attendance/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, records })
    });
    const data = await res.json();
    if (data.success) fetchAllData();
    return data;
  };

  const handleLoadStudentChart = async (studentId, days) => {
    const res = await fetch(`/api/attendance/student/${studentId}?days=${days}`);
    return await res.json();
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <AuthView />;
  }

  const pendingComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="flex min-h-screen bg-dark-bg light:bg-slate-50 transition-colors">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        counts={{
          students: students.length,
          complaints: pendingComplaintsCount,
          leaves: pendingLeavesCount
        }}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMobileMenuClick={() => setMobileOpen(true)}
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
          onNavigate={setCurrentView}
          students={students}
          rooms={rooms}
          staff={staff}
          feePayments={feePayments}
          dbOnline={dbOnline}
        />

        <main className="p-6 md:p-10 flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              hostels={hostels}
              rooms={rooms}
              students={students}
              allocations={allocations}
              complaints={complaints}
              payments={feePayments}
              onQuickAction={(action) => {
                if (action === 'add-student') setCurrentView('students');
                if (action === 'allocate-room') setCurrentView('allocations');
                if (action === 'record-fee') setCurrentView('fees');
                if (action === 'log-complaint') setCurrentView('complaints');
                if (action === 'attendance') setCurrentView('attendance');
                if (action === 'visitors') setCurrentView('visitors');
              }}
            />
          )}

          {currentView === 'rooms' && (
            <RoomsView
              hostels={hostels}
              rooms={rooms}
              students={students}
              allocations={allocations}
              searchTerm={globalSearch}
              onAddRoom={handleAddRoom}
              onEditRoom={handleEditRoom}
              onAddHostel={handleAddHostel}
              onDeleteRoom={handleDeleteRoom}
              onVacateRoom={handleVacateRoom}
              onChangeBed={handleChangeBed}
              onAllocateRoom={handleAllocateRoom}
              onNavigateToAllocation={() => setCurrentView('allocations')}
            />
          )}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              hostels={hostels}
              searchTerm={globalSearch}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {currentView === 'allocations' && (
            <AllocationsView
              allocations={allocations}
              students={students}
              hostels={hostels}
              rooms={rooms}
              searchTerm={globalSearch}
              onAllocateRoom={handleAllocateRoom}
            />
          )}

          {currentView === 'fees' && (
            <FeesView
              feeSummary={feeSummary}
              feePayments={feePayments}
              students={students}
              searchTerm={globalSearch}
              onRecordFee={handleRecordFee}
            />
          )}

          {currentView === 'complaints' && (
            <ComplaintsView
              complaints={complaints}
              students={students}
              searchTerm={globalSearch}
              onLogComplaint={handleLogComplaint}
              onUpdateComplaintStatus={handleUpdateComplaintStatus}
              onUpdateComplaintPriority={handleUpdateComplaintPriority}
            />
          )}

          {currentView === 'staff' && (
            <StaffView
              hostels={hostels}
              staff={staff}
              searchTerm={globalSearch}
              onAddStaff={handleAddStaff}
              onEditStaff={handleEditStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentView === 'leaves' && (
            <LeavesView
              leaves={leaves}
              students={students}
              searchTerm={globalSearch}
              onRequestLeave={handleRequestLeave}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
            />
          )}

          {currentView === 'visitors' && (
            <VisitorsView
              visitors={visitors}
              students={students}
              searchTerm={globalSearch}
              onLogVisitor={handleLogVisitor}
              onCheckoutVisitor={handleCheckoutVisitor}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              students={students}
              searchTerm={globalSearch}
              onSaveAttendance={handleSaveAttendance}
              onLoadStudentChart={handleLoadStudentChart}
            />
          )}
        </main>
      </div>
    </div>
  );
}
