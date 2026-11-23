import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/payment/PaymentModal';
import SeatManagementTab from '../components/dashboard/SeatManagementTab';
import AdmissionFormTab from '../components/dashboard/AdmissionFormTab';
import MemberDirectoryTab from '../components/dashboard/MemberDirectoryTab';

import {
  Armchair,
  Wind,
  Volume2,
  Clock,
  UserCheck,
  CreditCard,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  RefreshCw,
  QrCode,
  UserPlus,
  Users
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/admission.css';

const STORAGE_KEY_SEATS = 'membiq_seats_store';
const STORAGE_KEY_STUDENTS = 'membiq_students_store';

// Helper for initial dates
const getFutureDate = (days) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const getPastDate = (days) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

// Initial realistic custom seats
const INITIAL_SEATS = [
  { id: 'F-01', name: 'F-01', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'filled', student: 'Rohan Sharma', nearAc: true },
  { id: 'F-02', name: 'F-02', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'filled', student: 'Priya Verma', nearAc: true },
  { id: 'F-03', name: 'F-03', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'active', student: null, nearAc: true },
  { id: 'F-04', name: 'F-04', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'inactive', student: null, nearAc: false }, // Maintenance
  { id: 'A-01', name: 'A-01', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'filled', student: 'Aman Gupta', nearAc: true },
  { id: 'A-02', name: 'A-02', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'active', student: null, nearAc: false },
  { id: 'A-10', name: 'A-10', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'filled', student: 'Deepak Patel', nearAc: true },
  { id: 'A-11', name: 'A-11', zone: 'Hall A (AC Silence Zone)', type: 'fixed', status: 'active', student: null, nearAc: false },

  { id: 'B-01', name: 'B-01', zone: 'Hall B (Discussion Pods)', type: 'floating', status: 'active', student: null, nearAc: true },
  { id: 'B-02', name: 'B-02', zone: 'Hall B (Discussion Pods)', type: 'floating', status: 'filled', student: 'Ananya Roy', nearAc: false },
  { id: 'B-03', name: 'B-03', zone: 'Hall B (Discussion Pods)', type: 'floating', status: 'active', student: null, nearAc: true },
  { id: 'B-04', name: 'B-04', zone: 'Hall B (Discussion Pods)', type: 'floating', status: 'inactive', student: null, nearAc: false },
  { id: 'FL-01', name: 'FL-01', zone: 'Floating Area', type: 'floating', status: 'filled', student: 'Karan Mehra', nearAc: false },
  { id: 'FL-02', name: 'FL-02', zone: 'Floating Area', type: 'floating', status: 'active', student: null, nearAc: false },
  { id: 'FL-03', name: 'FL-03', zone: 'Floating Area', type: 'floating', status: 'active', student: null, nearAc: true },
  { id: 'FL-04', name: 'FL-04', zone: 'Floating Area', type: 'floating', status: 'active', student: null, nearAc: false },
];

// Initial realistic students
const INITIAL_STUDENTS = [
  {
    id: 'st-1',
    name: 'Rohan Sharma',
    fatherName: 'Manoj Sharma',
    address: 'Flat 102, Shanti Kunj, Patna',
    phone: '9811223344',
    studentType: 'fixed',
    seatNumber: 'F-01',
    shift: 'Morning 06:00 AM – 02:00 PM',
    paidMonths: ['Nov 2026', 'Dec 2026'],
    feeRate: 800,
    totalFee: 1600,
    joiningDate: '2026-10-01',
    expiryDate: getFutureDate(22), // Active (22 days left)
    status: 'active',
  },
  {
    id: 'st-2',
    name: 'Priya Verma',
    fatherName: 'Rajesh Verma',
    address: 'Near Old Bus Stand',
    phone: '9876543210',
    studentType: 'fixed',
    seatNumber: 'F-02',
    shift: 'Evening 02:00 PM – 10:00 PM',
    paidMonths: ['Nov 2026'],
    feeRate: 800,
    totalFee: 800,
    joiningDate: '2026-10-28',
    expiryDate: getFutureDate(3), // Due Soon (Expires in 3 days!)
    status: 'due',
  },
  {
    id: 'st-3',
    name: 'Aman Gupta',
    fatherName: 'Sanjay Gupta',
    address: 'Aspirants Hostel, Room 4',
    phone: '9826011223',
    studentType: 'fixed',
    seatNumber: 'A-01',
    shift: 'Full Day 24 Hours',
    paidMonths: ['Nov 2026'],
    feeRate: 1400,
    totalFee: 1400,
    joiningDate: '2026-10-29',
    expiryDate: getFutureDate(4), // Due Soon (Expires in 4 days!)
    status: 'due',
  },
  {
    id: 'st-4',
    name: 'Deepak Patel',
    fatherName: 'Ramesh Patel',
    address: 'Civil Lines',
    phone: '9792045678',
    studentType: 'fixed',
    seatNumber: 'A-10',
    shift: 'Night Owl 10:00 PM – 06:00 AM',
    paidMonths: ['Oct 2026'],
    feeRate: 750,
    totalFee: 750,
    joiningDate: '2026-09-15',
    expiryDate: getPastDate(3), // Expired 3 days ago!
    status: 'expired',
  },
  {
    id: 'st-5',
    name: 'Ananya Roy',
    fatherName: 'Debashis Roy',
    address: 'Kankarbagh Colony',
    phone: '9431098765',
    studentType: 'floating',
    seatNumber: 'Floating Desk',
    shift: 'Morning 06:00 AM – 02:00 PM',
    paidMonths: ['Nov 2026'],
    feeRate: 600,
    totalFee: 600,
    joiningDate: '2026-11-01',
    expiryDate: getFutureDate(14), // Active
    status: 'active',
  },
  {
    id: 'st-6',
    name: 'Karan Mehra',
    fatherName: 'Sunil Mehra',
    address: 'Boring Road',
    phone: '9829012345',
    studentType: 'floating',
    seatNumber: 'Floating Desk',
    shift: 'Evening 02:00 PM – 10:00 PM',
    paidMonths: ['Oct 2026'],
    feeRate: 600,
    totalFee: 600,
    joiningDate: '2026-09-20',
    expiryDate: getPastDate(6), // Expired 6 days ago!
    status: 'expired',
  },
];

export const DashboardView = ({ setActiveView }) => {
  const { t } = useLanguage();
  const {
    currentUser,
    isSubscriptionActive,
    getDaysRemaining,
    simulate28DayExpiry
  } = useAuth();

  // Dashboard Sub-Tab: 'seats' | 'admission' | 'members'
  const [activeSubTab, setActiveSubTab] = useState('seats');

  // Seats State
  const [seats, setSeats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading seats from storage:', e);
    }
    return INITIAL_SEATS;
  });

  // Students State
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading students from storage:', e);
    }
    return INITIAL_STUDENTS;
  });

  // Persist seats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(seats));
    } catch (e) {
      console.warn('Error persisting seats:', e);
    }
  }, [seats]);

  // Persist students
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Error persisting students:', e);
    }
  }, [students]);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPay, setSelectedPlanForPay] = useState({ name: 'Pro Growth', price: 199 });

  const hasActiveSub = isSubscriptionActive(currentUser);
  const daysRemaining = getDaysRemaining(currentUser);

  const libraryName = currentUser?.libraryName || 'membiQ Self-Study Reading Hall';

  // Handler when a new student is admitted
  const handleRegisterStudent = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);

    // If seat was assigned, mark seat as Filled
    if (newStudent.seatNumber && newStudent.seatNumber !== 'Floating Desk') {
      setSeats((prev) =>
        prev.map((s) =>
          s.name.toUpperCase() === newStudent.seatNumber.toUpperCase()
            ? { ...s, status: 'filled', student: newStudent.name }
            : s
        )
      );
    }
  };

  // Requirement 4: Automated 28-Day Expiry Check & Lock Screen
  if (currentUser && !hasActiveSub) {
    return (
      <div className="dashboard-view">
        <div className="container" style={{ maxWidth: '680px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', border: '3px solid #ef4444', borderRadius: '16px', padding: '40px 24px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={36} />
            </div>

            <span className="badge badge-amber" style={{ marginBottom: '12px' }}>
              Automated 28-Day Cycle Locked
            </span>

            <h2 style={{ fontSize: '1.75rem', color: '#991b1b', marginBottom: '10px', fontWeight: '800' }}>
              Library Dashboard Access Locked
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Your 28-day SaaS subscription for <strong>{currentUser.libraryName}</strong> has ended.
              To eliminate manual follow-up calls, membiQ automatically locks desk allocation and attendance tools until renewed.
            </p>

            <div style={{ backgroundColor: 'var(--color-bg-alt)', borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Library Branch:</span>
                <strong>{currentUser.libraryName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                <span style={{ color: '#dc2626', fontWeight: '700' }}>28-Day Cycle Expired</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Accepted Payment:</span>
                <strong>Razorpay Checkout / Direct UPI QR</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                onClick={() => {
                  if (setActiveView) setActiveView('plans');
                }}
              >
                <CreditCard size={20} />
                <span>View Plans & Pay (₹199 / ₹499)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setSelectedPlanForPay({ name: 'Pro Growth', price: 199 });
                  setShowPaymentModal(true);
                }}
              >
                <QrCode size={18} />
                <span>Instant Quick Pay (Pro Growth — ₹199)</span>
              </button>
            </div>
          </div>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlanForPay}
          onPaymentSuccess={() => setShowPaymentModal(false)}
        />
      </div>
    );
  }

  // Active Seat Stats
  const activeVacantCount = seats.filter((s) => s.status === 'active').length;
  const occupiedCount = seats.filter((s) => s.status === 'filled').length;
  const totalSeatsCount = seats.length;
  const totalStudentsCount = students.length;

  return (
    <div className="dashboard-view">
      <div className="container">
        {/* Top Branch Header & 28-Day Cycle Status */}
        <div className="dash-top-bar">
          <div className="dash-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-green">
                🟢 28-Day Plan Active ({daysRemaining} Days Left)
              </span>
              <span className="badge badge-blue">
                Plan: {currentUser?.plan || 'Enterprise Elite'}
              </span>
            </div>
            <h1>{libraryName}</h1>
            <p>
              {currentUser?.name ? `Owner: ${currentUser.name} | ` : ''}
              Subscription Expiry: <strong>{currentUser?.expiryDate || 'Active'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="dash-env-badges">
              <span className="badge badge-ac">
                <Wind size={15} />
                {t('dash_stat_ac_status')}
              </span>
              <span className="badge badge-green">
                <Volume2 size={15} />
                {t('dash_stat_noise_level')}
              </span>
            </div>

            {/* Test Simulation Button */}
            {currentUser && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#ef4444', color: '#b91c1c', fontSize: '0.78rem' }}
                onClick={() => simulate28DayExpiry(currentUser.email)}
                title="Simulate 28-day expiration to test the automatic lock"
              >
                🧪 Simulate 28-Day Expiry Lock
              </button>
            )}
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">{t('dash_stat_total_seats')}</span>
              <Armchair size={20} color="var(--color-primary)" />
            </div>
            <div className="metric-value">{totalSeatsCount}</div>
            <span className="metric-sub">{activeVacantCount} Vacant • {occupiedCount} Filled</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">{t('dash_stat_occupied')}</span>
              <UserCheck size={20} color="var(--color-secondary)" />
            </div>
            <div className="metric-value">{occupiedCount}</div>
            <span className="metric-sub">
              {totalSeatsCount > 0 ? Math.round((occupiedCount / totalSeatsCount) * 100) : 0}% Occupancy
            </span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Enrolled Students</span>
              <Users size={20} color="var(--color-primary)" />
            </div>
            <div className="metric-value">{totalStudentsCount}</div>
            <span className="metric-sub">
              {students.filter((s) => s.studentType === 'fixed').length} Fixed • {students.filter((s) => s.studentType === 'floating').length} Floating
            </span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">{t('dash_stat_fees_collected')}</span>
              <CreditCard size={20} color="var(--color-success)" />
            </div>
            <div className="metric-value">
              ₹{students.reduce((acc, curr) => acc + (curr.totalFee || 0), 0).toLocaleString('en-IN')}
            </div>
            <span className="metric-sub">Monthly Fee Volume</span>
          </div>
        </div>

        {/* Dashboard Sub-Tabs Ribbon */}
        <div className="dash-subtabs-bar" role="tablist">
          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'seats' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('seats')}
          >
            <Armchair size={18} />
            <span>{t('dash_tab_seats')}</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'admission' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('admission')}
          >
            <UserPlus size={18} />
            <span>{t('dash_tab_admission')}</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('members')}
          >
            <Users size={18} />
            <span>{t('dash_tab_members')}</span>
          </button>
        </div>

        {/* Tab 1: Seat Management */}
        {activeSubTab === 'seats' && (
          <SeatManagementTab
            seats={seats}
            setSeats={setSeats}
          />
        )}

        {/* Tab 2: New Student Admission Form */}
        {activeSubTab === 'admission' && (
          <AdmissionFormTab
            seats={seats}
            onRegisterStudent={handleRegisterStudent}
            libraryName={libraryName}
          />
        )}

        {/* Tab 3: Member Directory & Bulk Reminders */}
        {activeSubTab === 'members' && (
          <MemberDirectoryTab
            students={students}
            libraryName={libraryName}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardView;
