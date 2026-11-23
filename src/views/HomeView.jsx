import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import SessionKickedModal from '../components/auth/SessionKickedModal';
import {
  Wind,
  Armchair,
  Clock,
  Receipt,
  ScanLine,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  Smartphone,
  Laptop,
  AlertTriangle,
  Lock,
  LogOut
} from 'lucide-react';
import '../styles/home.css';
import '../styles/auth.css';

export const HomeView = ({ setActiveView }) => {
  const { t } = useLanguage();
  const {
    currentUser,
    currentSession,
    loginOwner,
    logoutOwner,
    startRegistration,
    simulateRemoteLogin,
    sessionKickedReason,
    clearSessionKickedReason
  } = useAuth();

  // Auth mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('rohit@rajendranagar.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regLibraryName, setRegLibraryName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Modals
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showKickedModal, setShowKickedModal] = useState(false);

  // Trigger kicked modal if reason exists
  React.useEffect(() => {
    if (sessionKickedReason) {
      setShowKickedModal(true);
    }
  }, [sessionKickedReason]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const res = loginOwner(loginEmail, loginPassword);
    if (res.success) {
      const user = res.user;
      const isActive = user.planStatus === 'active' && user.expiryDate && new Date(user.expiryDate + 'T23:59:59') > new Date();

      if (!isActive) {
        setLoginSuccess('Authentication successful! Directing to 28-day subscription plans...');
        setTimeout(() => {
          setActiveView('plans');
        }, 700);
      } else {
        setLoginSuccess('Authentication successful! Establishing single-device session...');
        setTimeout(() => {
          setActiveView('dashboard');
        }, 700);
      }
    } else {
      setLoginError(res.error || 'Login failed.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    const res = startRegistration({
      name: regName,
      libraryName: regLibraryName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });

    if (res.success) {
      setShowOtpModal(true);
    } else {
      setRegError(res.error || 'Registration failed.');
    }
  };

  const handleOtpSuccess = (user) => {
    setShowOtpModal(false);
    setLoginSuccess(`Welcome ${user.name}! Please choose a 28-day subscription plan to activate your reading hall.`);
    setTimeout(() => {
      setActiveView('plans');
    }, 700);
  };

  const handleAutoFillDemoOwner = () => {
    setLoginEmail('rohit@rajendranagar.com');
    setLoginPassword('password123');
    setLoginError('');
  };

  const features = [
    {
      icon: Wind,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: t('feature_ac_title'),
      desc: t('feature_ac_desc'),
    },
    {
      icon: Armchair,
      color: '#1d4ed8',
      bg: '#eff6ff',
      title: t('feature_seats_title'),
      desc: t('feature_seats_desc'),
    },
    {
      icon: Clock,
      color: '#b45309',
      bg: '#fef3c7',
      title: t('feature_shifts_title'),
      desc: t('feature_shifts_desc'),
    },
    {
      icon: Receipt,
      color: '#15803d',
      bg: '#dcfce7',
      title: t('feature_fees_title'),
      desc: t('feature_fees_desc'),
    },
    {
      icon: ScanLine,
      color: '#7c3aed',
      bg: '#f5f3ff',
      title: t('feature_biometric_title'),
      desc: t('feature_biometric_desc'),
    },
    {
      icon: KeyRound,
      color: '#0f766e',
      bg: '#f0fdfa',
      title: t('feature_lockers_title'),
      desc: t('feature_lockers_desc'),
    },
  ];

  return (
    <div className="home-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-content">
              {/* Top Bar with Prominent Language Switcher */}
              <div className="hero-top-bar">
                <div className="hero-badge-wrap">
                  <span className="badge badge-blue">{t('hero_badge')}</span>
                </div>
                {/* Prominent Language Switcher */}
                <LanguageSwitcher prominent />
              </div>

              <h1 className="hero-title">{t('hero_title')}</h1>
              <p className="hero-desc">{t('hero_description')}</p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => setActiveView('dashboard')}
                >
                  <span>{t('hero_cta_explore')}</span>
                  <ArrowRight size={20} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => setActiveView('plans')}
                >
                  <span>{t('hero_cta_plans')}</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="hero-stats-row">
                <div className="stat-item">
                  <span className="stat-val">450+</span>
                  <span className="stat-lbl">{t('hero_stat_halls')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">38,000+</span>
                  <span className="stat-lbl">{t('hero_stat_seats')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">45+</span>
                  <span className="stat-lbl">{t('hero_stat_cities')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">99.98%</span>
                  <span className="stat-lbl">{t('hero_stat_uptime')}</span>
                </div>
              </div>
            </div>

            {/* Right: Auth Card */}
            <div className="hero-auth-col">
              <div className="auth-card">
                {/* If user is ALREADY logged in */}
                {currentUser && currentSession ? (
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span className="badge badge-green">Logged In • Single Device Locked</span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={logoutOwner}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
                      Welcome, {currentUser.name}
                    </h2>
                    <p style={{ color: 'var(--color-primary)', fontWeight: '700', margin: '0 0 12px' }}>
                      {currentUser.libraryName}
                    </p>

                    <div style={{ backgroundColor: 'var(--color-bg-alt)', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '0.88rem' }}>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Active Device:</strong> {currentSession.deviceName}
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Subscription:</strong> {currentUser.plan} ({currentUser.planStatus.toUpperCase()})
                      </div>
                      <div>
                        <strong>Valid Until:</strong> {currentUser.expiryDate}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg"
                      onClick={() => setActiveView(currentUser.planStatus === 'active' ? 'dashboard' : 'plans')}
                      style={{ marginBottom: '12px' }}
                    >
                      <Armchair size={18} />
                      <span>{currentUser.planStatus === 'active' ? 'Open Library Dashboard' : 'Renew 28-Day Plan (Dashboard Locked)'}</span>
                    </button>

                    {/* Interactive Session Lock Tester */}
                    <div className="device-tester-card">
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#1e3a8a', display: 'block' }}>
                          🧪 Test Single-Device Session Lock
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          Simulate what happens when you log in from Device B.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ borderColor: '#ef4444', color: '#b91c1c' }}
                        onClick={() => simulateRemoteLogin(currentUser.email)}
                        title="Simulate someone else logging in to this account on a different device"
                      >
                        <Laptop size={14} />
                        <span>Simulate Device B Login</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* If NOT logged in: Show Login / Register tabs */
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Library Owner Portal</h2>
                      <p className="auth-subtitle">
                        {authMode === 'login'
                          ? 'Sign in to access your reading hall operations'
                          : 'Register your air-conditioned self-study center'}
                      </p>
                    </div>

                    {/* Tab Switcher: Sign In vs Sign Up */}
                    <div className="auth-tabs" role="tablist">
                      <button
                        type="button"
                        className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                        onClick={() => {
                          setAuthMode('login');
                          setLoginError('');
                          setRegError('');
                        }}
                      >
                        <LogIn size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        Library Owner Login
                      </button>

                      <button
                        type="button"
                        className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                        onClick={() => {
                          setAuthMode('register');
                          setLoginError('');
                          setRegError('');
                        }}
                      >
                        <UserPlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        New Owner Sign Up
                      </button>
                    </div>

                    {/* Alerts */}
                    {loginSuccess && (
                      <div style={{ padding: '10px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '8px', color: 'var(--color-success)', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                        ✓ {loginSuccess}
                      </div>
                    )}

                    {loginError && (
                      <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                        {loginError}
                      </div>
                    )}

                    {regError && (
                      <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                        {regError}
                      </div>
                    )}

                    {/* Form 1: LOGIN */}
                    {authMode === 'login' && (
                      <form onSubmit={handleLoginSubmit}>
                        <div className="auth-demo-helper">
                          <strong>💡 One-Click Demo Credentials:</strong>
                          Click "Auto-Fill Demo Credentials" below to populate a registered owner account instantly.
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="loginEmailInput">
                            Registered Email Address
                          </label>
                          <input
                            id="loginEmailInput"
                            type="email"
                            className="form-input"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="e.g., rohit@rajendranagar.com"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" htmlFor="loginPassInput" style={{ margin: 0 }}>
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowForgotModal(true)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <input
                            id="loginPassInput"
                            type="password"
                            className="form-input"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                          <button type="submit" className="btn btn-primary btn-block btn-lg">
                            <LogIn size={20} />
                            <span>Sign In (Single-Device Lock)</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-block"
                            onClick={handleAutoFillDemoOwner}
                          >
                            <Sparkles size={16} color="var(--color-primary)" />
                            <span>Auto-Fill Demo Credentials</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Form 2: REGISTER */}
                    {authMode === 'register' && (
                      <form onSubmit={handleRegisterSubmit}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="regNameInput">
                            Owner Full Name
                          </label>
                          <input
                            id="regNameInput"
                            type="text"
                            className="form-input"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g., Dr. Anjali Mehta"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="regLibNameInput">
                            Library / Study Center Name
                          </label>
                          <input
                            id="regLibNameInput"
                            type="text"
                            className="form-input"
                            value={regLibraryName}
                            onChange={(e) => setRegLibraryName(e.target.value)}
                            placeholder="e.g., Horizon AC Reading Hall"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="regEmailInput">
                            Official Email Address (Verification Code will be sent)
                          </label>
                          <input
                            id="regEmailInput"
                            type="email"
                            className="form-input"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="e.g., anjali@horizonlibrary.com"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="regPhoneInput">
                            Phone / WhatsApp Number
                          </label>
                          <input
                            id="regPhoneInput"
                            type="tel"
                            className="form-input"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="e.g., 9876543210"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="regPassInput">
                            Create Security Password
                          </label>
                          <input
                            id="regPassInput"
                            type="password"
                            className="form-input"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
                          <UserPlus size={20} />
                          <span>Send Email OTP & Continue</span>
                        </button>
                      </form>
                    )}

                    <div className="auth-footer-links">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color="var(--color-success)" />
                        <span>Single-Device Session Security & OTP Verification Active</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-head">
            <span className="badge badge-blue">Built for Self-Study Centers</span>
            <h2>{t('hero_title')}</h2>
            <p>{t('brand_subtagline')}</p>
          </div>

          <div className="features-grid">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="feature-card">
                  <div className="feature-icon-box" style={{ backgroundColor: f.bg, color: f.color }}>
                    <Icon size={26} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modals for Auth Flows */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onPasswordResetSuccess={() => {
          setAuthMode('login');
          setLoginSuccess('Password updated successfully! Please log in with your new password.');
        }}
      />

      <SessionKickedModal
        isOpen={showKickedModal}
        onClose={() => setShowKickedModal(false)}
        onRelogin={() => {
          setShowKickedModal(false);
          setAuthMode('login');
        }}
      />
    </div>
  );
};

export default HomeView;
