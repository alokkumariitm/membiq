import React, { useState } from 'react';
import { Users, Search, MessageSquare, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import BulkWhatsAppModal from './BulkWhatsAppModal';
import AddMemberModal from './AddMemberModal';
import '../../styles/admission.css';

export const MemberDirectoryTab = ({
  students,
  libraryName,
  seats = [],
  onRegisterStudent,
}) => {
  const { t } = useLanguage();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'active' | 'expiring' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

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
      (st.fatherName && st.fatherName.toLowerCase().includes(q)) ||
      (st.phone && st.phone.includes(q)) ||
      (st.seatNumber && st.seatNumber.toLowerCase().includes(q));

    return statusMatch && searchMatch;
  });

  const dueStudentsList = students.filter((st) => {
    const days = getDaysLeft(st.expiryDate);
    return st.status === 'due' || (days >= 0 && days <= 5) || st.status === 'expired' || days < 0;
  });

  // Direct WhatsApp reminder link with pre-filled message
  const createSingleReminderUrl = (student) => {
    const phoneFormatted = (student.phone || '').replace(/\D/g, '');
    const cleanPhone = phoneFormatted.startsWith('91') ? phoneFormatted : `91${phoneFormatted}`;
    const days = getDaysLeft(student.expiryDate);
    const isExpired = days < 0 || student.status === 'expired';

    const message = `Hello ${student.name}, this is a gentle reminder from ${libraryName || 'membiQ'}. Your reading hall membership for Seat ${student.seatNumber || 'Floating Desk'} (${student.shift || 'General Slot'}) is ${isExpired ? 'expired on' : 'expiring on'} ${student.expiryDate || 'soon'}. Please renew your fee (₹${student.feeRate || student.totalFee || 800}) to retain your seat. Thank you!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="member-mgmt-page">
      {/* Main Directory Container Card */}
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

        {/* Primary Action Button: Opens Add Member Modal directly */}
        <button
          type="button"
          className="btn-primary-action-pill"
          onClick={() => setShowAddMemberModal(true)}
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
            placeholder="Search by name, seat, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members Table - Clean 3 Columns: Student Name, Seat No., WhatsApp Action */}
        <div className="modern-table-responsive">
          <table className="modern-directory-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>SEAT NO.</th>
                <th>WHATSAPP ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
                    <Users size={44} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>No members found</div>
                    <div style={{ fontSize: '0.84rem', color: '#9ca3af' }}>
                      {students.length === 0
                        ? 'Click "+ Add Member" above to admit your first student!'
                        : 'No members matching the selected filter.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <strong style={{ color: '#ffffff', fontSize: '0.96rem', display: 'block' }}>{st.name}</strong>
                      {st.fatherName && <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>S/o {st.fatherName}</span>}
                    </td>
                    <td>
                      <span className="badge badge-seat">
                        {st.seatNumber || 'Floating'}
                      </span>
                    </td>
                    <td>
                      <a
                        href={createSingleReminderUrl(st)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-pill"
                        title="Send WhatsApp Message"
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onRegisterStudent={onRegisterStudent}
        seats={seats}
      />

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
