import React from 'react';
import Modal from '../Modal';
import { ShieldAlert, AlertTriangle, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const SessionKickedModal = ({ isOpen, onClose, onRelogin }) => {
  const { sessionKickedReason, clearSessionKickedReason } = useAuth();

  if (!isOpen || !sessionKickedReason) return null;

  const handleAcknowledge = () => {
    clearSessionKickedReason();
    if (onClose) onClose();
    if (onRelogin) onRelogin();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleAcknowledge}
      title="Single-Device Session Alert / सुरक्षा चेतावनी"
      icon={ShieldAlert}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Lock size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', color: '#991b1b', marginBottom: '12px', fontWeight: '800' }}>
          Account Logged In On Another Device
        </h3>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', margin: '0 0 20px 0', textAlign: 'left' }}>
          <p style={{ color: '#7f1d1d', margin: 0, fontSize: '0.92rem', lineHeight: '1.6' }}>
            {sessionKickedReason}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-alt)', borderRadius: '10px', padding: '12px', margin: '0 0 20px 0', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '4px' }}>
            Why did this happen?
          </strong>
          To safeguard library student fees, desk allocations, and operational security, membiQ strictly limits each Library Owner subscription to a single active concurrent device.
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={handleAcknowledge}
        >
          <LogIn size={20} />
          <span>I Understand — Re-Login on this Device</span>
        </button>
      </div>
    </Modal>
  );
};

export default SessionKickedModal;
