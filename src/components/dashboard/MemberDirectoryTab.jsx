import React, { useState } from 'react';
import { Users, AlertTriangle, Clock, CheckCircle2, Search, MessageSquare, Send, ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import BulkWhatsAppModal from './BulkWhatsAppModal';
import '../../styles/admission.css';

export const MemberDirectoryTab = ({
  students,
  libraryName
}) => {
  const { t } = useLanguage();

  const [memberSection, setMemberSection] = useState('active'); // 'active' | 'due' | 'expired'
  const [filter5DaysOnly, setFilter5DaysOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Helper to check days remaining for student fee
  const getDaysLeft = (expiryDateStr) => {
    if (!expiryDateStr) return 0;
    const exp = new Date(expiryDateStr).getTime();
    const now = Date.now();
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  };

  // Filter students by section, 5-day toggle, and search query
  const filteredStudents = students.filter((st) => {
    const days = getDaysLeft(st.expiryDate);

    // Section filtering
    let sectionMatch = false;
    if (memberSection === 'active') {
      sectionMatch = st.status === 'active' && days > 5;
    } else if (memberSection === 'due') {
      sectionMatch = st.status === 'due' || (days >= 0 && days <= 5);
      if (filter5DaysOnly) {
        sectionMatch = sectionMatch && days >= 0 && days <= 5;
      }
    } else if (memberSection === 'expired') {
      sectionMatch = st.status === 'expired' || days < 0;
    }

    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      st.name.toLowerCase().includes(q) ||
      (st.fatherName && st.fatherName.toLowerCase().includes(q)) ||
      st.phone.includes(q) ||
      (st.seatNumber && st.seatNumber.toLowerCase().includes(q)) ||
      (st.shift && st.shift.toLowerCase().includes(q));

    return sectionMatch && searchMatch;
  });

  const dueStudentsList = students.filter((st) => {
    const days = getDaysLeft(st.expiryDate);
    const isDue = st.status === 'due' || (days >= 0 && days <= 5) || st.status === 'expired' || days < 0;
    if (filter5DaysOnly) {
      return days >= 0 && days <= 5;
    }
    return isDue;
  });

  const activeCount = students.filter((st) => st.status === 'active' && getDaysLeft(st.expiryDate) > 5).length;
  const dueCount = students.filter((st) => st.status === 'due' || (getDaysLeft(st.expiryDate) >= 0 && getDaysLeft(st.expiryDate) <= 5)).length;
  const expiredCount = students.filter((st) => st.status === 'expired' || getDaysLeft(st.expiryDate) < 0).length;

  // Individual WhatsApp Reminder link creator
  const createSingleReminderUrl = (student) => {
    const phoneDigits = student.phone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;

    const reminderMsg = `*📢 FEE RENEWAL REMINDER — ${libraryName}*
---------------------------------------
Dear *${student.name}*,
This is a gentle reminder regarding your study desk booking at *${libraryName}*.

📋 *Student Record:*
• *Desk Type:* ${student.studentType === 'fixed' ? `Fixed Assigned Seat (${student.seatNumber || 'Assigned'})` : 'Non-Fixed (Floating Desk)'}
• *Current Expiry Date:* *${student.expiryDate}*
• *Status:* Fee Renewal Due

To maintain your reserved study desk and uninterrupted access to the air-conditioned library hall, kindly renew your monthly fee at your earliest convenience.

If you have already paid, please ignore this notice. Thank you! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMsg)}`;
  };

  return (
    <div>
      {/* Navigation Tabs Bar for Members */}
      <div className="members-tabs-bar">
        <div className="members-subnav">
          <button
            type="button"
            className={`member-tab-pill ${memberSection === 'active' ? 'active' : ''}`}
            onClick={() => {
              setMemberSection('active');
              setFilter5DaysOnly(false);
            }}
          >
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>{t('mem_tab_active')}</span>
            <span style={{ fontWeight: '800', marginLeft: '4px' }}>({activeCount})</span>
          </button>

          <button
            type="button"
            className={`member-tab-pill ${memberSection === 'due' ? 'active' : ''}`}
            style={{ borderColor: '#f59e0b', color: memberSection === 'due' ? '#fff' : '#b45309' }}
            onClick={() => setMemberSection('due')}
          >
            <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>{t('mem_tab_due')}</span>
            <span style={{ fontWeight: '800', marginLeft: '4px' }}>({dueCount})</span>
          </button>

          <button
            type="button"
            className={`member-tab-pill ${memberSection === 'expired' ? 'active' : ''}`}
            style={{ borderColor: '#fca5a5', color: memberSection === 'expired' ? '#fff' : '#b91c1c' }}
            onClick={() => {
              setMemberSection('expired');
              setFilter5DaysOnly(false);
            }}
          >
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>{t('mem_tab_expired')}</span>
            <span style={{ fontWeight: '800', marginLeft: '4px' }}>({expiredCount})</span>
          </button>

          {/* 5-Days Filter Button inside Due section */}
          {memberSection === 'due' && (
            <button
              type="button"
              className={`member-tab-pill filter-5days ${filter5DaysOnly ? 'active' : ''}`}
              onClick={() => setFilter5DaysOnly(!filter5DaysOnly)}
              title="Filter members whose fee expires within the next 5 days"
            >
              <span>{t('mem_filter_5days')}</span>
              {filter5DaysOnly ? ' [Active Filter]' : ''}
            </button>
          )}
        </div>

        {/* Bulk WhatsApp Reminder Button */}
        {(memberSection === 'due' || memberSection === 'expired') && (
          <button
            type="button"
            className="btn-bulk-whatsapp"
            onClick={() => setShowBulkModal(true)}
          >
            <MessageSquare size={18} />
            <span>{t('mem_bulk_whatsapp_btn')} ({dueStudentsList.length})</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', minHeight: '40px' }}
            placeholder={t('mem_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-muted)' }} />
        </div>

        <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
          Showing {filteredStudents.length} Students
        </span>
      </div>

      {/* Members Directory Table */}
      <div style={{ backgroundColor: '#ffffff', border: '2px solid var(--color-border)', borderRadius: '14px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('mem_col_student')}</th>
              <th>{t('mem_col_contact')}</th>
              <th>{t('mem_col_type')}</th>
              <th>{t('mem_col_seat')}</th>
              <th>{t('mem_col_shift')}</th>
              <th>{t('mem_col_paid_months')}</th>
              <th>{t('mem_col_expiry')}</th>
              <th>{t('mem_col_status')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                  No members found in this section.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => {
                const days = getDaysLeft(st.expiryDate);
                const isDue = days <= 5 && days >= 0;
                const isExpired = days < 0;

                return (
                  <tr key={st.id}>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{st.name}</strong>
                      {st.fatherName && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          S/D: {st.fatherName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>
                        +91 {st.phone}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${st.studentType === 'fixed' ? 'badge-blue' : 'badge-amber'}`}>
                        {st.studentType === 'fixed' ? 'Fixed Seat' : 'Floating'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{st.seatNumber || '—'}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem' }}>{st.shift || 'General'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                        {st.paidMonths ? st.paidMonths.join(', ') : 'Nov 2026'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: isExpired ? '#b91c1c' : isDue ? '#b45309' : '#15803d' }}>
                        {st.expiryDate}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: isExpired ? '#b91c1c' : isDue ? '#b45309' : '#15803d' }}>
                        {isExpired ? `Expired ${Math.abs(days)}d ago` : `${days} days left`}
                      </div>
                    </td>
                    <td>
                      {isExpired ? (
                        <span className="badge badge-amber" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                          Expired
                        </span>
                      ) : isDue ? (
                        <span className="badge badge-amber">
                          Due Soon
                        </span>
                      ) : (
                        <span className="badge badge-green">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <a
                        href={createSingleReminderUrl(st)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{ backgroundColor: '#25d366', color: '#ffffff', borderColor: '#1da851', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        title="Send individual WhatsApp fee reminder"
                      >
                        <MessageSquare size={14} />
                        <span>{t('mem_single_whatsapp_btn')}</span>
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk WhatsApp Reminder Modal */}
      <BulkWhatsAppModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        dueStudents={dueStudentsList}
        libraryName={libraryName}
      />
    </div>
  );
};

export default MemberDirectoryTab;
