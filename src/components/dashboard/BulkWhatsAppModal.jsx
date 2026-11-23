import React, { useState } from 'react';
import Modal from '../Modal';
import { MessageSquare, ExternalLink, CheckCircle2, User, Phone, Clock, AlertTriangle, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const BulkWhatsAppModal = ({ isOpen, onClose, dueStudents, libraryName }) => {
  const { t } = useLanguage();
  const [sentMap, setSentMap] = useState({});

  if (!isOpen) return null;

  const createReminderUrl = (student) => {
    const phoneDigits = student.phone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;

    const reminderMessage = `*📢 FEE RENEWAL REMINDER — ${libraryName}*
---------------------------------------
Dear *${student.name}*,
This is a gentle reminder regarding your study desk subscription at *${libraryName}*.

📋 *Subscription Status:*
• *Desk Type:* ${student.studentType === 'fixed' ? `Fixed Seat (${student.seatNumber || 'Assigned'})` : 'Non-Fixed (Floating Desk)'}
• *Current Expiry Date:* *${student.expiryDate}*
• *Status:* Fee Renewal Due

To maintain your reserved study desk and uninterrupted access to the air-conditioned hall, kindly renew your monthly fee at your earliest convenience.

If you have already paid, please ignore this notice or share your payment screenshot. Thank you! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMessage)}`;
  };

  const handleMarkSent = (studentId) => {
    setSentMap((prev) => ({ ...prev, [studentId]: true }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('mem_bulk_modal_title')}
      icon={MessageSquare}
    >
      <div style={{ textAlign: 'left' }}>
        <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
          {t('mem_bulk_desc')} Total queued students: <strong>{dueStudents.length}</strong>
        </p>

        {dueStudents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-bg-alt)', borderRadius: '12px' }}>
            <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-primary)' }}>
              No members have pending fee dues in this filter!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {dueStudents.map((st) => {
              const isSent = !!sentMap[st.id];

              return (
                <div
                  key={st.id}
                  style={{
                    backgroundColor: isSent ? '#f0fdf4' : '#ffffff',
                    border: `2px solid ${isSent ? '#86efac' : 'var(--color-border)'}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      {st.name} {st.fatherName ? `(${st.fatherName})` : ''}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <span>📱 +91 {st.phone}</span>
                      <span>🪑 {st.seatNumber || 'Floating'}</span>
                      <span style={{ color: '#b91c1c', fontWeight: '700' }}>Due: {st.expiryDate}</span>
                    </div>
                  </div>

                  <a
                    href={createReminderUrl(st)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      backgroundColor: isSent ? '#15803d' : '#25d366',
                      color: '#ffffff',
                      borderColor: '#1da851',
                      textDecoration: 'none',
                    }}
                    onClick={() => handleMarkSent(st.id)}
                  >
                    <Send size={14} />
                    <span>{isSent ? 'Sent ✓ (Re-send)' : 'Send WhatsApp'}</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            {t('modal_close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkWhatsAppModal;
