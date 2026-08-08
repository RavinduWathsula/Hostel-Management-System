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
import {
  initialHostels,
  initialRooms,
  initialStudents,
  initialAllocations,
  initialFeePayments,
  initialFeeSummaries,
  initialComplaints,
  initialStaff,
  initialLeaves,
  initialVisitors,
  initialStats
} from './data/initialData';

// Local storage helper
const getStoredData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) return parsed;
    }
  } catch (e) {}
  return fallback;
};

const setStoredData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

const dedupeStudents = (list) => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const seenAdmissions = new Set();
  const seenNamesAndPhones = new Set();
  const result = [];

  for (const item of list) {
    if (!item) continue;
    const idStr = String(item.student_id || item.id || '');
    const admStr = String(item.admission_no || '').trim().toLowerCase();
    const namePhoneStr = `${String(item.full_name || '').trim().toLowerCase()}_${String(item.phone || '').trim()}`;

    if (admStr && seenAdmissions.has(admStr)) {
      continue;
    }
    if (idStr && seenIds.has(idStr)) {
      continue;
    }
    if (namePhoneStr.length > 1 && seenNamesAndPhones.has(namePhoneStr)) {
      continue;
    }

    if (admStr) seenAdmissions.add(admStr);
    if (idStr) seenIds.add(idStr);
    if (namePhoneStr.length > 1) seenNamesAndPhones.add(namePhoneStr);
    result.push(item);
  }
  return result;
};

const dedupeAllocations = (list) => {
  if (!Array.isArray(list)) return [];
  const seenStudentIds = new Set();
  const seenAdmissions = new Set();
  const result = [];
  const sorted = [...list].sort((a, b) => Number(b.allocation_id || b.id || 0) - Number(a.allocation_id || a.id || 0));

  for (const item of sorted) {
    if (!item) continue;
    if (item.status === 'Vacated' || item.status === 'Inactive' || item.status === 'Transferred') {
      result.push(item);
      continue;
    }
    const stId = String(item.student_id || '');
    const admNo = String(item.admission_no || '').trim().toLowerCase();

    if (stId && seenStudentIds.has(stId)) {
      continue;
    }
    if (admNo && seenAdmissions.has(admNo)) {
      continue;
    }

    if (stId) seenStudentIds.add(stId);
    if (admNo) seenAdmissions.add(admNo);
    result.push(item);
  }
  return result;
};

export function AppContent() {
  const { admin, loading: authLoading } = useAuth();
  const [currentView, setCurrentViewState] = useState(() => {
    return localStorage.getItem('aegis_current_view') || 'dashboard';
  });

  const setCurrentView = (view) => {
    setCurrentViewState(view);
    localStorage.setItem('aegis_current_view', view);
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dbOnline, setDbOnline] = useState(true);

  const isDummyStudent = (s) => {
    if (!s) return false;
    const adm = String(s.admission_no || '');
    const name = String(s.full_name || s.student_name || '');
    return adm.startsWith('STU2026') || name.includes('Kaveesha') || name.includes('Ananya') || name.includes('Tharushi') || name.includes('Dilini') || name.includes('Kasun') || name.includes('Ruwan');
  };

  // Application Data States initialized with LocalStorage or Initial Seed Data
  const [stats, setStats] = useState(() => getStoredData('aegis_stats', initialStats));
  const [hostels, setHostels] = useState(() => getStoredData('aegis_hostels', initialHostels));
  const [rooms, setRooms] = useState(() => getStoredData('aegis_rooms', initialRooms));
  const [students, setStudents] = useState(() => dedupeStudents(getStoredData('aegis_students', []).filter(s => !isDummyStudent(s))));
  const [allocations, setAllocations] = useState(() => dedupeAllocations(getStoredData('aegis_allocations', []).filter(a => !isDummyStudent(a))));
  const [feeSummary, setFeeSummary] = useState(() => getStoredData('aegis_fee_summary', []));
  const [feePayments, setFeePayments] = useState(() => getStoredData('aegis_fee_payments', []));
  const [complaints, setComplaints] = useState(() => getStoredData('aegis_complaints', []));
  const [staff, setStaff] = useState(() => getStoredData('aegis_staff', initialStaff));
  const [leaves, setLeaves] = useState(() => getStoredData('aegis_leaves', []));
  const [visitors, setVisitors] = useState(() => getStoredData('aegis_visitors', []));

  useEffect(() => {
    if (admin) {
      fetchAllData();
      const interval = setInterval(() => {
        fetchAllData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const safeFetchJson = async (url) => {
    try {
      const token = sessionStorage.getItem('aegis_token');
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

      if (statsRes.success) {
        const fetchedStats = statsRes.kpis || statsRes.stats || {};
        if (Object.keys(fetchedStats).length > 0) {
          setStats(fetchedStats);
          setStoredData('aegis_stats', fetchedStats);
        }
      }

      if (hostelsRes.success) {
        const fetchedHostels = hostelsRes.data || hostelsRes.hostels || [];
        if (fetchedHostels.length > 0) {
          setHostels(fetchedHostels);
          setStoredData('aegis_hostels', fetchedHostels);
        }
      }

      if (roomsRes.success) {
        const fetchedRooms = roomsRes.data || roomsRes.rooms || [];
        if (fetchedRooms.length > 0) {
          setRooms(prev => {
            const saved = getStoredData('aegis_rooms', null);
            if (saved && Array.isArray(saved)) {
              const savedIds = saved.map(r => String(r.room_id || r.id));
              const synced = fetchedRooms.filter(r => savedIds.includes(String(r.room_id || r.id)));
              const fetchedIds = fetchedRooms.map(r => String(r.room_id || r.id));
              const localOnly = saved.filter(r => !fetchedIds.includes(String(r.room_id || r.id)));
              const combined = [...synced, ...localOnly];
              setStoredData('aegis_rooms', combined);
              return combined;
            }
            setStoredData('aegis_rooms', fetchedRooms);
            return fetchedRooms;
          });
        }
      }

      if (studentsRes.success) {
        const fetchedStudents = (studentsRes.data || studentsRes.students || []).filter(s => !isDummyStudent(s));
        setStudents(prev => {
          const saved = (getStoredData('aegis_students', []) || []).filter(s => !isDummyStudent(s));
          const baseList = fetchedStudents.length > 0 ? fetchedStudents : saved;
          const baseIds = new Set(baseList.map(s => String(s.student_id || s.id)));
          const baseAdmissions = new Set(baseList.map(s => String(s.admission_no || '').toLowerCase()).filter(Boolean));
          const baseEmails = new Set(baseList.map(s => String(s.email || '').toLowerCase()).filter(Boolean));
          const baseNamesPhones = new Set(baseList.map(s => `${String(s.full_name || '').trim().toLowerCase()}_${String(s.phone || '').trim()}`).filter(x => x.length > 1));

          const localOnly = saved.filter(s => {
            const sId = String(s.student_id || s.id);
            const sAdm = String(s.admission_no || '').toLowerCase();
            const sEmail = String(s.email || '').toLowerCase();
            const sNP = `${String(s.full_name || '').trim().toLowerCase()}_${String(s.phone || '').trim()}`;

            if (baseIds.has(sId)) return false;
            if (sAdm && baseAdmissions.has(sAdm)) return false;
            if (sEmail && baseEmails.has(sEmail)) return false;
            if (sNP.length > 1 && baseNamesPhones.has(sNP)) return false;
            return true;
          });

          const combined = dedupeStudents([...baseList, ...localOnly]);
          setStoredData('aegis_students', combined);
          return combined;
        });
      }

      if (allocationsRes.success) {
        const fetchedAllocations = (allocationsRes.data || allocationsRes.allocations || []).filter(a => !isDummyStudent(a));
        setAllocations(prev => {
          const saved = (getStoredData('aegis_allocations', []) || []).filter(a => !isDummyStudent(a));
          const baseList = fetchedAllocations.length > 0 ? fetchedAllocations : saved;
          const combined = dedupeAllocations(baseList);
          setStoredData('aegis_allocations', combined);
          return combined;
        });
      }

      if (feesRes.success) {
        const fetchedSummary = feesRes.summaries || feesRes.data || [];
        const fetchedPayments = feesRes.payments || feesRes.data || [];
        if (fetchedSummary.length > 0) {
          setFeeSummary(fetchedSummary);
          setStoredData('aegis_fee_summary', fetchedSummary);
        }
        if (fetchedPayments.length > 0) {
          setFeePayments(fetchedPayments);
          setStoredData('aegis_fee_payments', fetchedPayments);
        }
      }

      if (complaintsRes.success) {
        const fetchedComplaints = complaintsRes.data || complaintsRes.complaints || [];
        if (fetchedComplaints.length > 0) {
          setComplaints(fetchedComplaints);
          setStoredData('aegis_complaints', fetchedComplaints);
        }
      }

      if (staffRes.success) {
        const fetchedStaff = staffRes.data || staffRes.staff || [];
        if (fetchedStaff.length > 0) {
          setStaff(fetchedStaff);
          setStoredData('aegis_staff', fetchedStaff);
        }
      }

      if (leavesRes.success) {
        const fetchedLeaves = leavesRes.data || leavesRes.leaves || [];
        if (fetchedLeaves.length > 0) {
          setLeaves(fetchedLeaves);
          setStoredData('aegis_leaves', fetchedLeaves);
        }
      }

      if (visitorsRes.success) {
        const fetchedVisitors = visitorsRes.data || visitorsRes.visitors || [];
        if (fetchedVisitors.length > 0) {
          setVisitors(fetchedVisitors);
          setStoredData('aegis_visitors', fetchedVisitors);
        }
      }
    } catch (err) {
      console.error('Failed to load API data:', err);
      setDbOnline(false);
    }
  };

  // Student Handlers
  const handleAddStudent = async (studentData) => {
    const newSt = {
      student_id: Date.now(),
      id: Date.now(),
      admission_no: studentData.admission_no || `HS${Date.now().toString().slice(-6)}`,
      full_name: studentData.full_name,
      gender: studentData.gender || 'Female',
      dob: studentData.dob || '',
      phone: studentData.phone,
      email: studentData.email || '',
      course: studentData.course || 'General',
      year_of_study: studentData.year_of_study || 1,
      address: studentData.address || '',
      guardian_name: studentData.guardian_name || '',
      guardian_phone: studentData.guardian_phone || '',
      status: 'Active'
    };

    setStudents(prev => {
      const filtered = prev.filter(s => 
        String(s.student_id || s.id) !== String(newSt.id) &&
        (!newSt.admission_no || String(s.admission_no).toLowerCase() !== String(newSt.admission_no).toLowerCase())
      );
      const updated = dedupeStudents([newSt, ...filtered]);
      setStoredData('aegis_students', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data, studentId: data.studentId || data.id || newSt.id };
    } catch (err) {
      console.warn('Network error adding student, fallback to local state:', err);
      return { success: true, studentId: newSt.id };
    }
  };

  const handleEditStudent = async (id, studentData) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      } else {
        setStudents(prev => prev.map(s => String(s.student_id || s.id) === String(id) ? { ...s, ...studentData } : s));
      }
      return data;
    } catch (err) {
      setStudents(prev => prev.map(s => String(s.student_id || s.id) === String(id) ? { ...s, ...studentData } : s));
      return { success: true };
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resident?')) return;
    const targetStudent = students.find(s => String(s.student_id || s.id) === String(id));
    const targetAdm = targetStudent ? targetStudent.admission_no : null;

    setStudents(prev => {
      const updated = prev.filter(s => String(s.student_id || s.id) !== String(id));
      setStoredData('aegis_students', updated);
      return updated;
    });

    setAllocations(prev => {
      const updated = prev.filter(a => 
        String(a.student_id) !== String(id) &&
        (!targetAdm || !a.admission_no || String(a.admission_no).toLowerCase() !== String(targetAdm).toLowerCase())
      );
      setStoredData('aegis_allocations', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) await fetchAllData();
      return data;
    } catch (err) {
      return { success: true };
    }
  };

  // Room & Allocation Handlers
  const handleAddRoom = async (roomData) => {
    const hostelObj = hostels.find(h => String(h.hostel_id || h.id) === String(roomData.hostel_id)) || hostels[0];
    const newRoom = {
      room_id: Date.now(),
      id: Date.now(),
      hostel_id: roomData.hostel_id || (hostelObj ? (hostelObj.hostel_id || hostelObj.id) : 1),
      hostel_name: hostelObj ? (hostelObj.hostel_name || hostelObj.name) : 'Aegis Girls Hostel - Main Block',
      room_number: roomData.room_number,
      capacity: Number(roomData.capacity || 2),
      occupied_seats: 0,
      floor_number: Number(roomData.floor_number || 1),
      room_type: roomData.room_type || 'Double Sharing',
      monthly_rent: Number(roomData.monthly_rent || 8000)
    };

    setRooms(prev => {
      const updated = [newRoom, ...prev];
      setStoredData('aegis_rooms', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data, roomId: newRoom.room_id };
    } catch (err) {
      console.warn('Network error adding room, fallback to local state:', err);
      return { success: true, roomId: newRoom.room_id };
    }
  };

  const handleAddHostel = async (hostelData) => {
    try {
      const token = sessionStorage.getItem('aegis_token');
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
    const stObj = students.find(s => String(s.student_id || s.id) === String(allocationData.student_id));
    const rmObj = rooms.find(r => String(r.room_id || r.id) === String(allocationData.room_id));
    const newAlloc = {
      allocation_id: Date.now(),
      id: Date.now(),
      student_id: Number(allocationData.student_id),
      student_name: stObj ? (stObj.full_name || stObj.name) : 'Resident Student',
      admission_no: stObj ? stObj.admission_no : 'STU2026',
      room_id: Number(allocationData.room_id),
      room_number: rmObj ? rmObj.room_number : '101',
      hostel_id: rmObj ? rmObj.hostel_id : 1,
      hostel_name: rmObj ? rmObj.hostel_name : 'Aegis Girls Hostel - Main Block',
      bed_number: Number(allocationData.bed_number || 1),
      allocated_date: allocationData.allocated_from || new Date().toISOString().substring(0, 10),
      status: 'Active'
    };

    setAllocations(prev => {
      const filtered = prev.filter(a => String(a.student_id) !== String(newAlloc.student_id));
      const updated = [newAlloc, ...filtered];
      setStoredData('aegis_allocations', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data, allocation_id: newAlloc.allocation_id };
    } catch (err) {
      console.warn('Network error allocating room, fallback to local state:', err);
      return { success: true, allocation_id: newAlloc.allocation_id };
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    setRooms(prev => {
      const updated = prev.filter(r => String(r.room_id || r.id) !== String(roomId));
      setStoredData('aegis_rooms', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
      const res = await fetch(`/api/rooms/${roomId}`, { 
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error deleting room, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleEditRoom = async (roomId, roomData) => {
    setRooms(prev => {
      const updated = prev.map(r => {
        if (String(r.room_id || r.id) === String(roomId)) {
          return { ...r, ...roomData };
        }
        return r;
      });
      setStoredData('aegis_rooms', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error updating room, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleVacateRoom = async (allocationId) => {
    if (!window.confirm('Are you sure you want to vacate this resident from the room bed?')) return;
    setAllocations(prev => {
      const updated = prev.map(a => {
        if (String(a.allocation_id || a.id) === String(allocationId)) {
          return { ...a, status: 'Vacated' };
        }
        return a;
      });
      setStoredData('aegis_allocations', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error vacating room, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleChangeBed = async (allocationId, newRoomId, newBedNumber) => {
    const targetRoom = rooms.find(r => String(r.room_id || r.id) === String(newRoomId));
    setAllocations(prev => {
      const updated = prev.map(a => {
        if (String(a.allocation_id || a.id) === String(allocationId)) {
          return {
            ...a,
            room_id: Number(newRoomId),
            room_number: targetRoom ? targetRoom.room_number : a.room_number,
            hostel_id: targetRoom ? targetRoom.hostel_id : a.hostel_id,
            hostel_name: targetRoom ? targetRoom.hostel_name : a.hostel_name,
            bed_number: Number(newBedNumber)
          };
        }
        return a;
      });
      setStoredData('aegis_allocations', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error changing bed, fallback to local state:', err);
      return { success: true };
    }
  };

  // Fee Payment Handler
  const handleRecordFee = async (feeData) => {
    const stObj = students.find(s => String(s.student_id || s.id) === String(feeData.student_id));
    const newPayment = {
      payment_id: Date.now(),
      id: Date.now(),
      student_id: Number(feeData.student_id),
      student_name: stObj ? (stObj.full_name || stObj.name) : 'Resident Student',
      admission_no: stObj ? stObj.admission_no : 'STU2026',
      room_number: stObj ? (stObj.room_number || '101') : '101',
      fee_type: feeData.fee_type || 'Hostel Monthly Fee',
      amount: Number(feeData.amount || 0),
      payment_mode: feeData.payment_mode || 'Cash',
      payment_date: feeData.payment_date || new Date().toISOString().substring(0, 10),
      month_for: feeData.month_for || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      receipt_no: feeData.receipt_no || `RCPT-${Date.now().toString().slice(-6)}`,
      remarks: feeData.remarks || 'Paid in full',
      status: 'Paid'
    };

    setFeePayments(prev => {
      const updated = [newPayment, ...prev];
      setStoredData('aegis_fee_payments', updated);
      return updated;
    });

    try {
      let res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error recording fee payment, fallback to local state:', err);
      return { success: true };
    }
  };

  // Complaint Handlers
  const handleLogComplaint = async (complaintData) => {
    const studentObj = students.find(s => String(s.student_id || s.id) === String(complaintData.student_id));
    const newRecord = {
      id: Date.now(),
      complaint_id: Date.now(),
      category: complaintData.category || 'Maintenance',
      title: complaintData.title || complaintData.category || 'Complaint',
      description: complaintData.description || 'No details provided',
      priority: complaintData.priority || 'Medium',
      status: 'Pending',
      student_name: studentObj ? (studentObj.full_name || studentObj.name) : 'Anonymous Resident'
    };
    setComplaints(prev => [newRecord, ...prev]);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
      return data;
    } catch (err) {
      return { success: true };
    }
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    setComplaints(prev => prev.map(c => (String(c.complaint_id || c.id) === String(id) ? { ...c, status } : c)));
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) fetchAllData();
      return data;
    } catch (err) {
      return { success: true };
    }
  };

  const handleUpdateComplaintPriority = async (id, priority) => {
    setComplaints(prev => prev.map(c => (String(c.complaint_id || c.id) === String(id) ? { ...c, priority } : c)));
    try {
      const res = await fetch(`/api/complaints/${id}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      const data = await res.json();
      if (data.success) fetchAllData();
      return data;
    } catch (err) {
      return { success: true };
    }
  };

  // Staff Handlers
  const handleAddStaff = async (staffData) => {
    const newStaff = {
      staff_id: Date.now(),
      id: Date.now(),
      full_name: staffData.full_name,
      role: staffData.role || staffData.designation || 'Lady Warden',
      phone: staffData.phone,
      email: staffData.email || '',
      status: 'Active',
      shift: staffData.shift || 'Day'
    };

    setStaff(prev => {
      const updated = [newStaff, ...prev];
      setStoredData('aegis_staff', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error adding staff member, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleEditStaff = async (id, staffData) => {
    setStaff(prev => {
      const updated = prev.map(s => String(s.staff_id || s.id) === String(id) ? { ...s, ...staffData } : s);
      setStoredData('aegis_staff', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error updating staff member, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    setStaff(prev => {
      const updated = prev.filter(s => String(s.id || s.staff_id) !== String(id));
      setStoredData('aegis_staff', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error deleting staff member, fallback to local state:', err);
      return { success: true };
    }
  };

  // Leave Handlers
  const handleRequestLeave = async (leaveData) => {
    const studentObj = students.find(s => 
      String(s.id || s.student_id) === String(leaveData.student_id) ||
      String(s.admission_no) === String(leaveData.student_id)
    );
    const newLeave = {
      id: Date.now(),
      leave_id: Date.now(),
      student_id: leaveData.student_id,
      student_name: studentObj ? (studentObj.full_name || studentObj.name) : 'Resident Student',
      admission_no: studentObj ? studentObj.admission_no : 'STU2026',
      from_date: leaveData.from_date,
      to_date: leaveData.to_date,
      reason: leaveData.reason || 'Leave request',
      emergency_contact: leaveData.emergency_contact || 'N/A',
      status: 'Pending'
    };

    setLeaves(prev => {
      const updated = [newLeave, ...prev];
      setStoredData('aegis_leaves', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(leaveData)
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        await fetchAllData();
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error submitting leave request, fallback to local state:', err);
      return { success: true };
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    setLeaves(prev => {
      const updated = prev.map(l => (String(l.id || l.leave_id) === String(id) ? { ...l, status } : l));
      setStoredData('aegis_leaves', updated);
      return updated;
    });

    try {
      const token = sessionStorage.getItem('aegis_token');
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
      }
      return { success: true, ...data };
    } catch (err) {
      console.warn('Network error updating leave status, fallback to local state:', err);
      return { success: true };
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
      const token = sessionStorage.getItem('aegis_token');
      const res = await fetch(`/api/visitors/${id}/checkout`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id })
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
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
    try {
      const token = sessionStorage.getItem('aegis_token');
      const res = await fetch('/api/attendance/daily', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ date, records })
      });
      const text = await res.text();
      let data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        fetchAllData();
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleLoadStudentChart = async (studentId, days) => {
    try {
      const res = await fetch(`/api/attendance/student/${studentId}?days=${days}`);
      const text = await res.text();
      return text ? JSON.parse(text) : { success: false };
    } catch (err) {
      console.warn('Error loading student attendance chart:', err);
      return { success: false };
    }
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
