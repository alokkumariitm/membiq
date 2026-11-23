import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/payment/PaymentModal';
import SeatManagementTab from '../components/dashboard/SeatManagementTab';
import AdmissionFormTab from '../components/dashboard/AdmissionFormTab';
import MemberDirectoryTab from '../components/dashboard/MemberDirectoryTab';
import ShiftManagementTab from '../components/dashboard/ShiftManagementTab';

import {
  Armchair,
  Users,
  Clock,
  UserPlus,
  BarChart2,
  Lock,
  CreditCard,
  QrCode,
  Bell,
  LogOut,
  ChevronRight,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/admission.css';

const STORAGE_KEY_SEATS = 'membiq_seats_store';
const STORAGE_KEY_STUDENTS = 'membiq_students_store';

const INITIAL_SEATS = [];
const INITIAL_STUDENTS = [];

export const DashboardView = ({ setActiveView }) => {
  const { t } = useLanguage();
  const {
    currentUser,
    logoutOwner,
    isSubscriptionActive,
    getDaysRemaining,
  } = useAuth();

  // Active Tab: 'seats' | 'members' | 'overview' | 'shifts' | 'admission'
  const [activeSubTab, setActiveSubTab] = useState('seats');

  // Seats State
  const [seats, setSeats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const demoSeatIds = ['F-01','F-02','F-03','F-04','A-01','A-02','A-10','A-11','B-01','B-02','B-03','B-04','FL-01','FL-02','FL-03','FL-04'];
        return Array.isArray(parsed) ? parsed.filter((s) => !demoSeatIds.includes(s.id)) : [];
      }
    } catch (e) {
      console.warn('Error reading seats from storage:', e);
    }
    return INITIAL_SEATS;
  });

  // Students State
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const demoStudentIds = ['st-1', 'st-2', 'st-3', 'st-4', 'st-5', 'st-6'];
        return Array.isArray(parsed) ? parsed.filter((st) => !demoStudentIds.includes(st.id)) : [];
      }
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
  const ownerInitial = (currentUser?.name || 'O').charAt(0).toUpperCase();

  // Helper to calculate student expiries for Screenshot 1 summary
  const getDaysLeft = (expiryDateStr) => {
    if (!expiryDateStr) return 0;
    const exp = new Date(expiryDateStr).getTime();
    const now = Date.now();
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  };

  const activeMembersCount = students.filter((s) => {
    const days = getDaysLeft(s.expiryDate);
    return s.status === 'active' && days > 5;
  }).length;

  const expiring5DaysCount = students.filter((s) => {
    const days = getDaysLeft(s.expiryDate);
    return s.status === 'due' || (days >= 0 && days <= 5);
  }).length;

  const expiredMembersCount = students.filter((s) => {
    const days = getDaysLeft(s.expiryDate);
    return s.status === 'expired' || days < 0;
  }).length;

  const totalMembersCount = students.length;

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
    setActiveSubTab('members');
  };

  // Automated 28-Day Expiry Check & Lock Screen
  if (currentUser && !hasActiveSub) {
    return (
      <div className="dashboard-view">
        <div className="container" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid #ef4444', borderRadius: '16px', padding: '36px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={32} />
            </div>

            <span className="badge badge-amber" style={{ marginBottom: '12px' }}>
              28-Day Subscription Expired
            </span>

            <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
              Dashboard Access Locked
            </h2>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Your 28-day SaaS cycle for <strong>{currentUser.libraryName}</strong> has ended.
              Renew your subscription to continue managing reading desks and admissions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary-purple-pill"
                onClick={() => {
                  setSelectedPlanForPay({ name: 'Pro Growth', price: 199 });
                  setShowPaymentModal(true);
                }}
              >
                <CreditCard size={18} />
                <span>Renew Pro Growth Plan (₹199 / 28 Days)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  if (setActiveView) setActiveView('plans');
                }}
              >
                <span>View All Plans</span>
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

  return (
    <div className="dashboard-view">
      <div className="container" style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Top Header Matching Screenshots */}
        <div className="dash-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 18px', borderBottom: '1px solid #f1f5f9', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '1.1rem' }}>
              m
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                {libraryName}
              </h1>
              <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: '700' }}>
                ● Active ({daysRemaining} days left)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="dash-icon-btn"
              title="Notifications"
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <Bell size={18} />
            </button>

            <div
              title={`Logged in as ${currentUser?.name || 'Owner'}`}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', cursor: 'default' }}
            >
              {ownerInitial}
            </div>

            <button
              type="button"
              onClick={logoutOwner}
              title="Sign Out"
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#b91c1c' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard Sub-Tabs Ribbon (Screenshots 1, 2, 3, 4) */}
        <div className="dash-subtabs-bar" role="tablist" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'seats' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('seats')}
          >
            <Armchair size={17} />
            <span>Seats & Layout</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('members')}
          >
            <Users size={17} />
            <span>Members ({students.length})</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <BarChart2 size={17} />
            <span>Summary</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'shifts' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('shifts')}
          >
            <Clock size={17} />
            <span>Shifts</span>
          </button>

          <button
            type="button"
            className={`dash-subtab-btn ${activeSubTab === 'admission' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('admission')}
          >
            <UserPlus size={17} />
            <span>+ Admission</span>
          </button>
        </div>

        {/* TAB 1: Seat Availability & Layout (Screenshot 3) */}
        {activeSubTab === 'seats' && (
          <SeatManagementTab
            seats={seats}
            setSeats={setSeats}
          />
        )}

        {/* TAB 2: Member Management (Screenshot 2) */}
        {activeSubTab === 'members' && (
          <MemberDirectoryTab
            students={students}
            libraryName={libraryName}
            onAddMemberClick={() => setActiveSubTab('admission')}
          />
        )}

        {/* TAB 3: Summary & Analytics Stack (Screenshot 1) */}
        {activeSubTab === 'overview' && (
          <div className="overview-page">
            <div className="tab-title-header">
              <h2 className="tab-main-heading">Overview & Membership Stats</h2>
              <p className="tab-sub-heading">
                High-level operational health and subscription billing status.
              </p>
            </div>

            <div className="screenshot1-summary-stack">
              {/* Active Members Card */}
              <div
                className="screenshot1-card"
                onClick={() => setActiveSubTab('members')}
              >
                <div className="screenshot1-top-row">
                  <span className="screenshot1-title">ACTIVE MEMBERS</span>
                  <div className="screenshot1-icon-badge badge-green-light">
                    <UserCheck size={16} />
                  </div>
                </div>
                <div className="screenshot1-middle-row">
                  <span className="screenshot1-big-num">{activeMembersCount}</span>
                  <span className="screenshot1-subtext">Valid memberships</span>
                </div>
                <div className="screenshot1-bottom-link">
                  <span className="bottom-link-dot">
                    <span className="indicator-dot green-dot"></span>
                    Click to filter table
                  </span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Expiring in 5 Days Card */}
              <div
                className="screenshot1-card"
                onClick={() => setActiveSubTab('members')}
              >
                <div className="screenshot1-top-row">
                  <span className="screenshot1-title">EXPIRING IN 5 DAYS</span>
                  <div className="screenshot1-icon-badge badge-amber-light">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="screenshot1-middle-row">
                  <span className="screenshot1-big-num" style={{ color: expiring5DaysCount > 0 ? '#b45309' : '#0f172a' }}>
                    {expiring5DaysCount}
                  </span>
                  <span className="screenshot1-subtext">Needs prompt renewal</span>
                </div>
                <div className="screenshot1-bottom-link">
                  <span className="bottom-link-dot">
                    <span className="indicator-dot red-dot" style={{ background: '#f59e0b' }}></span>
                    Click to filter table
                  </span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Expired Members Card */}
              <div
                className="screenshot1-card"
                onClick={() => setActiveSubTab('members')}
              >
                <div className="screenshot1-top-row">
                  <span className="screenshot1-title">EXPIRED MEMBERS</span>
                  <div className="screenshot1-icon-badge badge-red-light">
                    <Users size={16} />
                  </div>
                </div>
                <div className="screenshot1-middle-row">
                  <span className="screenshot1-big-num" style={{ color: expiredMembersCount > 0 ? '#b91c1c' : '#0f172a' }}>
                    {expiredMembersCount}
                  </span>
                  <span className="screenshot1-subtext">Seat released</span>
                </div>
                <div className="screenshot1-bottom-link">
                  <span className="bottom-link-dot">
                    <span className="indicator-dot red-dot"></span>
                    Click to filter table
                  </span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Total Members Card (Purple Border) */}
              <div
                className="screenshot1-card screenshot1-card-purple-active"
                onClick={() => setActiveSubTab('members')}
              >
                <div className="screenshot1-top-row">
                  <span className="screenshot1-title" style={{ color: '#7c3aed' }}>TOTAL MEMBERS</span>
                  <div className="screenshot1-icon-badge badge-purple-light">
                    <Users size={16} />
                  </div>
                </div>
                <div className="screenshot1-middle-row">
                  <span className="screenshot1-big-num">{totalMembersCount}</span>
                  <span className="screenshot1-subtext">Registered lifetime</span>
                </div>
                <div className="screenshot1-bottom-link">
                  <span className="bottom-link-dot">
                    <span className="indicator-dot" style={{ background: '#7c3aed' }}></span>
                    Click to filter table
                  </span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Seat Occupancy Card */}
              <div
                className="screenshot1-card"
                onClick={() => setActiveSubTab('seats')}
              >
                <div className="screenshot1-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Armchair size={18} color="#7c3aed" />
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Seat Occupancy Overview</strong>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '8px', textAlign: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 6px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>TOTAL</span>
                    <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{seats.length}</strong>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px 6px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'block' }}>AVAILABLE</span>
                    <strong style={{ fontSize: '1.25rem', color: '#10b981' }}>{seats.filter(s => s.status === 'active').length}</strong>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '10px 6px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', display: 'block' }}>OCCUPIED</span>
                    <strong style={{ fontSize: '1.25rem', color: '#ef4444' }}>{seats.filter(s => s.status === 'filled').length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Shift Management (Screenshot 4) */}
        {activeSubTab === 'shifts' && (
          <ShiftManagementTab />
        )}

        {/* TAB 5: New Admission Form */}
        {activeSubTab === 'admission' && (
          <AdmissionFormTab
            seats={seats}
            onRegisterStudent={handleRegisterStudent}
            libraryName={libraryName}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardView;
