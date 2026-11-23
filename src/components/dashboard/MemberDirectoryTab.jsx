import React, { useState } from 'react';
import { Users, Search, MessageSquare, Plus, ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import BulkWhatsAppModal from './BulkWhatsAppModal';
import '../../styles/admission.css';

export const MemberDirectoryTab = ({
  students,
  libraryName,
  onAddMemberClick,
}) => {
  const { t } = useLanguage();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'active' | 'expiring' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Helper to check days remaining for student fee
  const getDaysLeft = (expiryDateStr) => {
    if (!expiryDateStr) return 0;
    const exp = new Date(expiryDateStr).getTime();
    const now = Date.now();
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  };

  // Filter students
  const filteredStudents = students.filter((st) => {
    const days = getDaysLeft(st.expiryDate);

    let statusMatch = true;
    if (filterType === 'active') {
      statusMatch = st.status === 'active' && days > 5;
    } else if (filterType === 'expiring') {
      statusMatch = st.status === 'due' || (days >= 0 && days <= 5);
    } else if (filterType === 'expired') {
      statusMatch = st.status === 'expired' || days < 0;
    }

    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      st.name.toLowerCase().includes(q) ||
      (st.id && st.id.toLowerCase().includes(q)) ||
      (st.phone && st.phone.includes(q)) ||
      (st.seatNumber && st.seatNumber.toLowerCase().includes(q)) ||
      (st.shift && st.shift.toLowerCase().includes(q));

    return statusMatch && searchMatch;
  });

  const dueStudentsList = students.filter((st) => {
    const days = getDaysLeft(st.expiryDate);
    return st.status === 'due' || (days >= 0 && days <= 5) || st.status === 'expired' || days < 0;
  });

  // Individual student reminder link
  const createSingleReminderUrl = (student) => {
    const phoneFormatted = (student.phone || '').replace(/\D/g, '');
    const cleanPhone = phoneFormatted.startsWith('91') ? phoneFormatted : `91${phoneFormatted}`;
    const days = getDaysLeft(student.expiryDate);
    const isExpired = days < 0 || student.status === 'expired';

    const message = `Hello ${student.name}, this is a gentle reminder from ${libraryName}. Your reading hall membership for Seat ${student.seatNumber || 'Floating Desk'} (${student.shift || 'General Slot'}) is ${isExpired ? 'expired on' : 'expiring on'} ${student.expiryDate}. Please renew your monthly fee (₹${student.feeRate || student.totalFee || 800}) to retain your seat. Thank you!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="member-mgmt-page">
      {/* Title & Subtitle */}
      <div className="tab-title-header">
        <h2 className="tab-main-heading">Member Management</h2>
        <p className="tab-sub-heading">
          Comprehensive directory of library patrons, active memberships, seats, and renewals.
        </p>
      </div>

      {/* Main White Directory Container Card */}
      <div className="modern-section-card">
        <div className="card-top-header">
          <div>
            <div className="card-title-row">
              <h3 className="card-inner-title">Members Directory</h3>
              <span className="member-count-pill">{students.length} members</span>
            </div>
            <p className="card-inner-sub">
              Manage memberships, seat allocations, fees, and renewals.
            </p>
          </div>

          {dueStudentsList.length > 0 && (
            <button
              type="button"
              className="btn-bulk-whatsapp"
              onClick={() => setShowBulkModal(true)}
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              <MessageSquare size={16} />
              <span>Send WhatsApp All ({dueStudentsList.length})</span>
            </button>
          )}
        </div>

        {/* Primary Purple Action Button: + Add Member */}
        <button
          type="button"
          className="btn-primary-purple-pill"
          onClick={onAddMemberClick}
        >
          <Plus size={20} />
          <span>Add Member</span>
        </button>

        {/* Filter Pills */}
        <div className="modern-pills-bar">
          <button
            type="button"
            className={`modern-pill ${filterType === 'all' ? 'pill-active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Members
          </button>

          <button
            type="button"
            className={`modern-pill ${filterType === 'active' ? 'pill-active' : ''}`}
            onClick={() => setFilterType('active')}
          >
            Active
          </button>

          <button
            type="button"
            className={`modern-pill ${filterType === 'expiring' ? 'pill-active' : ''}`}
            onClick={() => setFilterType('expiring')}
          >
            Expiring Soon
          </button>

          <button
            type="button"
            className={`modern-pill ${filterType === 'expired' ? 'pill-active' : ''}`}
            onClick={() => setFilterType('expired')}
          >
            Expired
          </button>
        </div>

        {/* Search Bar */}
        <div className="modern-search-box">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-pill"
            placeholder="Search by name, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members Table */}
        <div className="modern-table-responsive">
          <table className="modern-directory-table">
            <thead>
              <tr>
                <th>MEMBER ID</th>
                <th>NAME ⇅</th>
                <th>WHATSAPP</th>
                <th>SEAT</th>
                <th>SHIFT</th>
                <th>VALIDITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                    <Users size={44} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#475569' }}>No members found</div>
                    <div style={{ fontSize: '0.84rem' }}>
                      {students.length === 0
                        ? 'Click "+ Add Member" above to admit your first student!'
                        : 'No members matching the selected filter.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const days = getDaysLeft(st.expiryDate);
                  const isExpired = days < 0 || st.status === 'expired';
                  const isDue = (days >= 0 && days <= 5) || st.status === 'due';

                  return (
                    <tr key={st.id}>
                      <td style={{ fontWeight: '600', color: '#64748b', fontSize: '0.82rem' }}>
                        {st.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{st.name}</strong>
                        {st.fatherName && <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>S/o {st.fatherName}</span>}
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/91${(st.phone || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MessageSquare size={14} />
                          <span>{st.phone}</span>
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-seat">
                          {st.seatNumber || 'Floating'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: '#475569' }}>
                        {st.shift || 'General'}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isExpired ? '#b91c1c' : isDue ? '#b45309' : '#15803d' }}>
                          {st.expiryDate || 'N/A'}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: isExpired ? '#b91c1c' : isDue ? '#b45309' : '#15803d' }}>
                          {isExpired ? `Expired ${Math.abs(days)}d ago` : `${days} days left`}
                        </span>
                      </td>
                      <td>
                        <a
                          href={createSingleReminderUrl(st)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp-pill"
                          title="Send WhatsApp Fee Reminder"
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
