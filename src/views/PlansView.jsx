import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/payment/PaymentModal';
import {
  Check,
  Zap,
  ShieldCheck,
  Calculator,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  Lock,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import '../styles/plans.css';

export const PlansView = ({
  setActiveView,
  openTermsModal,
  openRefundModal,
  paywallReason
}) => {
  const { t } = useLanguage();
  const { currentUser, isSubscriptionActive, getDaysRemaining, simulate28DayExpiry } = useAuth();

  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ROI Calculator states
  const [seatCount, setSeatCount] = useState(80);
  const [shiftsCount, setShiftsCount] = useState(3);
  const [feePerShift, setFeePerShift] = useState(900);

  const singleShiftRevenue = seatCount * feePerShift;
  const multiShiftRevenue = seatCount * shiftsCount * feePerShift;
  const additionalGain = multiShiftRevenue - singleShiftRevenue;

  const hasActiveSub = isSubscriptionActive(currentUser);
  const daysLeft = getDaysRemaining(currentUser);

  // The 2 specific SaaS plans required by user specification:
  const plans = [
    {
      id: 'pro-growth',
      name: 'Pro Growth',
      tagline: 'Ideal for Standalone Reading Halls & Single AC Centers',
      price: 199,
      cycle: '28 Days Automated',
      badge: 'Starter Choice',
      features: [
        'Up to 80 Fixed & Floating Study Desks',
        '2 Daily Shifts (Morning & Evening)',
        'AC Hall & Noise-Free Zone Monitoring',
        'Automated Fee Due Reminders & Receipts',
        'Automated 28-Day Renewal Lock Protection',
        'Razorpay & Direct UPI QR Checkout',
      ],
      popular: false,
    },
    {
      id: 'enterprise-elite',
      name: 'Enterprise Elite',
      tagline: 'For High-Volume Study Centers, Multi-Shift & Library Chains',
      price: 499,
      cycle: '28 Days Automated',
      badge: 'Most Popular for Reading Halls',
      features: [
        'Unlimited Fixed & Floating Study Desks',
        'All 4 Shifts (Morning, Evening, Night Owl & 24/7)',
        'Locker & Key Number Allocation Engine',
        'Visual Floor Map with Live Attendance QR Sync',
        'Priority Phone & WhatsApp Support',
        'Single-Device Enterprise Security Lock',
        'Razorpay & Direct UPI QR Checkout',
      ],
      popular: true,
    },
  ];

  const handlePayNowClick = (plan) => {
    setSelectedPlanForPayment(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (res) => {
    setTimeout(() => {
      setActiveView('dashboard');
    }, 500);
  };

  return (
    <div className="plans-view">
      <div className="container">
        {/* 28-Day Lock Warning Banner if expired or redirected */}
        {(!hasActiveSub || paywallReason) && currentUser && (
          <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px', animation: 'shake 300ms ease' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={22} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h4 style={{ margin: '0 0 2px', color: '#991b1b', fontSize: '1.05rem', fontWeight: '800' }}>
                Subscription Required / 28-Day Billing Cycle Expired
              </h4>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.88rem' }}>
                Access to your reading hall management dashboard is locked. Please click <strong>"Pay Now"</strong> on either plan below to activate your 28-day subscription and eliminate manual follow-up calls.
              </p>
            </div>
          </div>
        )}

        {/* Active Subscription Status Banner if already active */}
        {hasActiveSub && currentUser && (
          <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>
                  Current Active Plan
                </span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#14532d' }}>
                  {currentUser.plan} — {daysLeft} Days Remaining
                </h4>
                <span style={{ fontSize: '0.82rem', color: '#166534' }}>
                  28-Day Cycle Valid Until: {currentUser.expiryDate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#ef4444', color: '#b91c1c' }}
                onClick={() => simulate28DayExpiry(currentUser.email)}
                title="Simulate 28 days passing to test the automatic paywall lock"
              >
                🧪 Simulate 28-Day Expiry Lock
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveView('dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="plans-head">
          <span className="badge badge-blue">SaaS 28-Day Billing Cycle</span>
          <h1>Automated 28-Day Subscription Plans</h1>
          <p>
            Select your reading hall tier. Payments are processed securely via <strong>Razorpay Checkout</strong> or <strong>Direct UPI QR Code</strong> with automatic 28-day renewal tracking.
          </p>
        </div>

        {/* The Two Required Plans Grid */}
        <div className="plans-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', maxWidth: '900px', margin: '0 auto' }}>
          {plans.map((p) => (
            <div key={p.id} className={`pricing-card ${p.popular ? 'featured' : ''}`}>
              {p.popular && <span className="popular-badge">{p.badge}</span>}

              <div className="card-top">
                <h2 className="plan-name">{p.name}</h2>
                <p className="plan-desc">{p.tagline}</p>
                <div className="plan-price-box">
                  <span className="plan-price">₹{p.price}</span>
                  <span className="plan-period">/ 28 days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                  <Clock size={14} />
                  <span>Automated 28-Day Billing Cycle</span>
                </div>
              </div>

              <ul className="plan-features-list">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="plan-feature-item">
                    <Check size={18} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-lg btn-block`}
                onClick={() => handlePayNowClick(p)}
              >
                <CreditCard size={20} />
                <span>Pay Now — ₹{p.price}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Razorpay & UPI QR Readiness Notice */}
        <div className="compliance-banner">
          <div className="compliance-text">
            <h3>✅ Razorpay Checkout & Direct UPI QR Enabled</h3>
            <p>
              Environment variable <code>VITE_RAZORPAY_KEY_ID</code> is pre-wired for instant live or test keys. Also includes instant UPI QR Code payment with 12-digit UTR confirmation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={openRefundModal}
            >
              {t('footer_refund')}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={openTermsModal}
            >
              {t('footer_terms')}
            </button>
          </div>
        </div>

        {/* ROI Calculator for Reading Hall Owners */}
        <div className="calc-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={28} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>
              Multi-Shift Reading Hall Revenue Calculator
            </h3>
          </div>
          <p style={{ marginTop: '6px', color: 'var(--color-text-secondary)' }}>
            See how investing ₹199 or ₹499 in membiQ multi-shift management generates massive return on investment!
          </p>

          <div className="calc-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="calcSeats">
                  Total Hall Desks / Seats: <strong>{seatCount} Desks</strong>
                </label>
                <input
                  id="calcSeats"
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={seatCount}
                  onChange={(e) => setSeatCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '8px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="calcShifts">
                  Active Shifts Managed: <strong>{shiftsCount} Shifts Daily</strong>
                </label>
                <input
                  id="calcShifts"
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={shiftsCount}
                  onChange={(e) => setShiftsCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '8px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="calcFee">
                  Average Student Fee Per Shift: <strong>₹{feePerShift} / month</strong>
                </label>
                <input
                  id="calcFee"
                  type="range"
                  min="400"
                  max="2500"
                  step="50"
                  value={feePerShift}
                  onChange={(e) => setFeePerShift(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '8px' }}
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-alt)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Single Shift Revenue (Traditional):</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                  ₹{singleShiftRevenue.toLocaleString('en-IN')} / month
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>membiQ Multi-Shift Potential ({shiftsCount} Shifts):</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-success)' }}>
                  ₹{multiShiftRevenue.toLocaleString('en-IN')} / month
                </div>
              </div>

              <div style={{ padding: '10px', backgroundColor: 'var(--color-success-bg)', borderRadius: '8px', border: '1px solid var(--color-success-border)', fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: '700' }}>
                🚀 Extra Profit Potential: +₹{additionalGain.toLocaleString('en-IN')} / month!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlanForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PlansView;
