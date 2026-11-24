import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import SessionKickedModal from '../components/auth/SessionKickedModal';
import {
  Armchair,
  CheckCircle2,
  LogIn,
  UserPlus,
  ShieldCheck,
  LogOut,
  Users,
  MessageSquare
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
    sessionKickedReason,
  } = useAuth();

  // Auth mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regLibraryName, setRegLibraryName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsSubmitting(true);

    try {
      const res = await loginOwner(loginEmail, loginPassword);
      if (res.success) {
        const user = res.user;
        const isActive = user.planStatus === 'active' && user.expiryDate && new Date(user.expiryDate + 'T23:59:59') > new Date();

        if (!isActive) {
          setLoginSuccess('Authentication successful! Directing to 28-day subscription plans...');
          setTimeout(() => {
            setActiveView('plans');
          }, 600);
        } else {
          setLoginSuccess('Authentication successful! Establishing single-device session...');
          setTimeout(() => {
            setActiveView('dashboard');
          }, 600);
        }
      } else {
        setLoginError(res.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await startRegistration({
        name: regName,
        libraryName: regLibraryName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      if (res.success) {
        setShowOtpModal(true);
      } else {
        setRegError(res.error || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSuccess = (user) => {
    setShowOtpModal(false);
    setLoginSuccess(`Welcome ${user.name}! Please choose a 28-day subscription plan to activate your reading hall.`);
    setTimeout(() => {
      setActiveView('plans');
    }, 600);
  };

  return (
    <div className="home-view">
      <div className="container app-portal-container">
        <div className="app-portal-layout">
          {/* Brand & Subtitle Area */}
          <div className="app-brand-col">
            <h1 className="portal-main-title">
              membi<span className="accent">Q</span>
            </h1>
            <p className="portal-sub-text">
              smart library management system
            </p>
          </div>

          {/* Clean Web App Auth Card */}
          <div className="app-auth-col">
            {/* Single-Device Session Lock Banner Placed Above Library Owner Portal */}
            <div className="portal-security-note-banner">
              <ShieldCheck size={18} color="#10b981" />
              <span>Single-Device Session Lock & 28-Day Automated Expiry Protection</span>
            </div>

            <div className="auth-card">
              {/* If user is ALREADY logged in */}
              {currentUser && currentSession ? (
                <div className="logged-in-box">
                  <div className="logged-in-header">
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

                  <h2 style={{ fontSize: '1.35rem', margin: '0 0 4px', color: '#0f172a' }}>
                    {currentUser.name}
                  </h2>
                  <p style={{ color: '#7c3aed', fontWeight: '700', margin: '0 0 16px', fontSize: '1.05rem' }}>
                    {currentUser.libraryName}
                  </p>

                  <div className="active-session-info">
                    <div><strong>Active Session:</strong> {currentSession.deviceName}</div>
                    <div><strong>Plan Status:</strong> <span style={{ textTransform: 'uppercase', color: currentUser.planStatus === 'active' ? '#15803d' : '#b91c1c' }}>{currentUser.planStatus}</span></div>
                    {currentUser.expiryDate && <div><strong>Valid Until:</strong> {currentUser.expiryDate}</div>}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => setActiveView(currentUser.planStatus === 'active' ? 'dashboard' : 'plans')}
                  >
                    <Armchair size={18} />
                    <span>{currentUser.planStatus === 'active' ? 'Open Library Dashboard' : 'Renew 28-Day Plan'}</span>
                  </button>
                </div>
              ) : (
                /* If NOT logged in: Show Login / Register tabs */
                <>
                  <div className="auth-header">
                    <h2 className="auth-title">Library Owner Portal</h2>
                    <p className="auth-subtitle">
                      {authMode === 'login' ? 'Sign in to access your reading hall' : 'Register your self-study reading hall'}
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
                      Owner Sign In
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
                      New Registration
                    </button>
                  </div>

                  {/* Alerts */}
                  {loginSuccess && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', color: '#15803d', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                      ✓ {loginSuccess}
                    </div>
                  )}

                  {loginError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                      {loginError}
                    </div>
                  )}

                  {regError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600' }}>
                      {regError}
                    </div>
                  )}

                  {/* Form 1: LOGIN */}
                  {authMode === 'login' && (
                    <form onSubmit={handleLoginSubmit}>
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
                          placeholder="Enter your registered email"
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
                            style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
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

                      <div style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
                          <LogIn size={18} />
                          <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
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
                          placeholder="e.g., Alok Kumar"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="regLibInput">
                          Library / Reading Hall Name
                        </label>
                        <input
                          id="regLibInput"
                          type="text"
                          className="form-input"
                          value={regLibraryName}
                          onChange={(e) => setRegLibraryName(e.target.value)}
                          placeholder="e.g., Apex Study Hall"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="regEmailInput">
                          Email Address (For Verification)
                        </label>
                        <input
                          id="regEmailInput"
                          type="email"
                          className="form-input"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="owner@studyhall.com"
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

                      <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }} disabled={isSubmitting}>
                        <UserPlus size={18} />
                        <span>{isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
