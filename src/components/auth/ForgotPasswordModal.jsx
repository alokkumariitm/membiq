import React, { useState } from 'react';
import Modal from '../Modal';
import { Key, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/auth.css';

export const ForgotPasswordModal = ({ isOpen, onClose, onPasswordResetSuccess }) => {
  const { t } = useLanguage();
  const { requestPasswordReset, verifyAndResetPassword, pendingPasswordReset, setPendingPasswordReset } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = requestPasswordReset(email);
    if (res.success) {
      setActiveOtpCode(res.otp);
      setStep(2);
    } else {
      setErrorMsg(res.error || 'Failed to request recovery code.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check.');
      return;
    }

    const res = verifyAndResetPassword(otpInput, newPassword);
    if (res.success) {
      setStep(3);
    } else {
      setErrorMsg(res.error || 'Password reset failed.');
    }
  };

  const handleFinish = () => {
    setStep(1);
    setEmail('');
    setOtpInput('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setPendingPasswordReset(null);
    onClose();
    if (onPasswordResetSuccess) onPasswordResetSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleFinish}
      title="Recover Library Password / पासवर्ड रिकवरी"
      icon={Key}
    >
      <div className="otp-container">
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="otp-icon-header">
              <Mail size={32} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>
              Reset Your Library Account Password
            </h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Enter your registered library owner email address. We'll issue a 6-digit recovery code.
            </p>

            {errorMsg && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="forgotEmailInput">
                Registered Email Address
              </label>
              <input
                id="forgotEmailInput"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., owner@readinghall.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
              <span>Send 6-Digit Recovery Code</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="otp-icon-header">
              <Lock size={32} />
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem' }}>
              Enter OTP & Set New Password
            </h3>
            <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
              Recovery code sent to: <span className="otp-email-highlight">{email}</span>
            </p>

            {/* Simulated OTP Code Display for Testing */}
            <div className="otp-simulation-badge">
              <strong>⚡ Simulated Reset Inbox:</strong>
              Your Password Reset OTP is: <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.15em', color: '#1e3a8a' }}>{activeOtpCode}</span>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', margin: '10px 0' }}>
                {errorMsg}
              </div>
            )}

            <div className="form-group" style={{ alignItems: 'center', marginTop: '12px' }}>
              <label className="form-label" htmlFor="forgotOtpInput">
                6-Digit Recovery Code
              </label>
              <input
                id="forgotOtpInput"
                type="text"
                maxLength={6}
                className="form-input otp-single-input"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassInput">
                New Password
              </label>
              <input
                id="newPassInput"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassInput">
                Confirm New Password
              </label>
              <input
                id="confirmPassInput"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={otpInput.length < 6}
              >
                <CheckCircle2 size={20} />
                <span>Save New Password & Secure Account</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setStep(1)}
              >
                Back to Email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.35rem', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Password Reset Successfully!
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Your new password is now active. All previous sessions across all devices have been securely revoked. You may now log in with your updated credentials.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              onClick={handleFinish}
            >
              Proceed to Login
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
