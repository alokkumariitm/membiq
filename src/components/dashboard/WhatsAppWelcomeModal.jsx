import React from 'react';
import Modal from '../Modal';
import { MessageSquare, ExternalLink, CheckCircle2, User, Phone, Armchair, Clock, Calendar, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WhatsAppWelcomeModal = ({ isOpen, onClose, student, libraryName }) => {
  const { t } = useLanguage();

  if (!isOpen || !student) return null;

  const phoneDigits = student.phone.replace(/\D/g, '');
  const cleanPhone = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;

  const welcomeMessage = `*🎉 WELCOME RECEIPT — ${libraryName}*
---------------------------------------
Dear *${student.name}*${student.fatherName ? ` (S/D of ${student.fatherName})` : ''},
Welcome to *${libraryName}*! Your self-study reading hall desk admission has been confirmed.

📋 *Admission Details:*
• *Student Type:* ${student.studentType === 'fixed' ? 'Fixed Assigned Desk' : 'Non-Fixed (Floating Desk)'}
• *Seat Number:* ${student.seatNumber ? student.seatNumber : 'Floating / Any Vacant Desk'}
• *Shift Timing:* ${student.shift ? student.shift : 'Full Study Access'}
• *Paid Months:* ${student.paidMonths && student.paidMonths.length > 0 ? student.paidMonths.join(', ') : 'Current Month'}
• *Total Fee Paid:* ₹${student.totalFee}
• *Admission Date:* ${student.joiningDate}
• *Valid Until:* ${student.expiryDate}

📖 *Reading Hall Guidelines:*
• Please maintain 100% pin-drop silence in the air-conditioned study hall.
• Always keep phones on silent mode.

We wish you immense success in your studies and upcoming exams! 🌟`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(welcomeMessage)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adm_success_title')}
      icon={CheckCircle2}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={32} />
        </div>

        <h3 style={{ fontSize: '1.35rem', color: 'var(--color-text-primary)', marginBottom: '8px', fontWeight: '800' }}>
          Student Admission Successful!
        </h3>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '16px' }}>
          <strong>{student.name}</strong> is now enrolled at <strong>{libraryName}</strong>.
          Send the official digital welcome receipt directly to their WhatsApp.
        </p>

        {/* Receipt Preview Box */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '20px', fontSize: '0.86rem', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Student Name:</span>
            <strong>{student.name} {student.fatherName ? `(S/D of ${student.fatherName})` : ''}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>WhatsApp Number:</span>
            <strong>+91 {student.phone}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Desk Category:</span>
            <span className="badge badge-blue">
              {student.studentType === 'fixed' ? 'Fixed Seat' : 'Non-Fixed (Floating)'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Seat & Shift:</span>
            <strong>{student.seatNumber || 'Floating Desk'} • {student.shift || 'General'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Paid Months:</span>
            <strong>{student.paidMonths ? student.paidMonths.join(', ') : '1 Month'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Total Fee Received:</span>
            <strong style={{ color: 'var(--color-success)', fontSize: '1rem' }}>₹{student.totalFee}</strong>
          </div>
        </div>

        {/* WhatsApp Send Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg"
            style={{ backgroundColor: '#25d366', color: '#ffffff', borderColor: '#1da851', textDecoration: 'none' }}
            onClick={onClose}
          >
            <MessageSquare size={20} />
            <span>{t('adm_whatsapp_btn')}</span>
            <ExternalLink size={16} />
          </a>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close & View Directory
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppWelcomeModal;
