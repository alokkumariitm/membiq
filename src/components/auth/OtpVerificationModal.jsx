import React, { useState } from 'react';
import Modal from '../Modal';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/auth.css';

export const OtpVerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { pendingRegistration, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();

  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendNotice, setResendNotice] = useState('');

  if (!isOpen || !pendingRegistration) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await verifyRegistrationOtp(otpInput);
    if (res.success) {
      setOtpInput('');
      if (onSuccess) onSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Invalid OTP code.');
    }
  };

  const handleResend = () => {
    const newOtp = resendRegistrationOtp();
    if (newOtp) {
      setResendNotice(`A new 6-digit OTP code has been generated!`);
      setTimeout(() => setResendNotice(''), 4000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Library Email Address / ईमेल सत्यापन"
      icon={Mail}
    >
      <div className="otp-container">
        <div className="otp-icon-header">
          <KeyRound size={32} />
        </div>

        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
          Enter 6-Digit Email Verification Code
        </h3>

        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          We have dispatched an activation code to:
          <br />
          <span className="otp-email-highlight">{pendingRegistration.email}</span>
        </p>

        <div
          className="otp-simulation-badge"
          style={{ cursor: 'pointer', background: '#f5f3ff', border: '1px solid #ddd6fe' }}
          onClick={() => setOtpInput(pendingRegistration.otp)}
          title="Click to auto-fill code"
        >
          <strong style={{ color: '#6d28d9' }}>🔐 Verification Code (OTP):</strong>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.25em', color: '#7c3aed', margin: '6px 0' }}>
            {pendingRegistration.otp}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: '700' }}>
            ⚡ Tap to auto-fill into box
          </span>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        {resendNotice && (
          <div style={{ padding: '10px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '8px', color: 'var(--color-success)', fontSize: '0.88rem' }}>
            {resendNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
          <div className="form-group" style={{ alignItems: 'center' }}>
            <label className="form-label" htmlFor="regOtpInput" style={{ textAlign: 'center' }}>
              Type 6-Digit Verification Code
            </label>
            <input
              id="regOtpInput"
              type="text"
              maxLength={6}
              className="form-input otp-single-input"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={otpInput.length < 6}
            >
              <CheckCircle2 size={20} />
              <span>Verify & Activate Library Account</span>
            </button>

            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
            >
              Didn't receive code? Resend Email OTP
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OtpVerificationModal;
