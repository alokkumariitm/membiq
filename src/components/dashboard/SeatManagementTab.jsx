import React, { useState } from 'react';
import { Armchair, Plus, Search, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AddSeatModal from './AddSeatModal';
import SeatActionModal from './SeatActionModal';
import '../../styles/admission.css';

export const SeatManagementTab = ({
  seats,
  setSeats,
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'filled' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSeat, setActionSeat] = useState(null);

  // Counts
  const totalCount = seats.length;
  const availableCount = seats.filter((s) => s.status === 'active').length;
  const occupiedCount = seats.filter((s) => s.status === 'filled').length;
  const inactiveCount = seats.filter((s) => s.status === 'inactive').length;

  // Filtered seats
  const filteredSeats = seats.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.student && s.student.toLowerCase().includes(q)) ||
      (s.zone && s.zone.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleAddSeat = (newSeat) => {
    setSeats((prev) => [...prev, newSeat]);
  };

  const handleUpdateStatus = (seatId, newStatus, studentName) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === seatId
          ? {
              ...s,
              status: newStatus,
              student: newStatus === 'filled' ? studentName : null,
            }
          : s
      )
    );
  };

  const handleDeleteSeat = (seatId) => {
    setSeats((prev) => prev.filter((s) => s.id !== seatId));
  };

  const existingSeatNames = seats.map((s) => s.name.toUpperCase());

  return (
    <div className="seat-layout-page">
      {/* Title & Subtitle */}
      <div className="tab-title-header">
        <h2 className="tab-main-heading">Seat Availability & Layout</h2>
        <p className="tab-sub-heading">
          Real-time visual map of reading desks, occupancy status, and shift allocations.
        </p>
      </div>

      {/* Primary Purple Action Button */}
      <button
        type="button"
        className="btn-primary-purple-pill"
        onClick={() => setShowAddModal(true)}
      >
        <Plus size={20} />
        <span>Add Seat</span>
      </button>

      {/* 4 Stat Cards in 2x2 Grid */}
      <div className="seat-summary-grid">
        <div
          className={`seat-summary-card ${statusFilter === 'all' ? 'active-filter-card' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <span className="summary-card-label">TOTAL DESKS</span>
          <span className="summary-card-number number-purple">{totalCount}</span>
        </div>

        <div
          className={`seat-summary-card ${statusFilter === 'active' ? 'active-filter-card' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          <div className="card-label-with-icon">
            <span className="indicator-dot green-dot"></span>
            <span className="summary-card-label">AVAILABLE (GREEN)</span>
          </div>
          <span className="summary-card-number number-green">{availableCount}</span>
        </div>

        <div
          className={`seat-summary-card ${statusFilter === 'filled' ? 'active-filter-card' : ''}`}
          onClick={() => setStatusFilter('filled')}
        >
          <div className="card-label-with-icon">
            <span className="indicator-dot red-dot"></span>
            <span className="summary-card-label">OCCUPIED (RED)</span>
          </div>
          <span className="summary-card-number number-red">{occupiedCount}</span>
        </div>

        <div
          className={`seat-summary-card ${statusFilter === 'inactive' ? 'active-filter-card' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <div className="card-label-with-icon">
            <span className="indicator-dot gray-dot"></span>
            <span className="summary-card-label">INACTIVE (GREY)</span>
          </div>
          <span className="summary-card-number number-gray">{inactiveCount}</span>
        </div>
      </div>

      {/* Filter Pills Ribbon */}
      <div className="modern-pills-bar">
        <button
          type="button"
          className={`modern-pill ${statusFilter === 'all' ? 'pill-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({totalCount})
        </button>

        <button
          type="button"
          className={`modern-pill ${statusFilter === 'active' ? 'pill-active' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          Available ({availableCount})
        </button>

        <button
          type="button"
          className={`modern-pill ${statusFilter === 'filled' ? 'pill-active' : ''}`}
          onClick={() => setStatusFilter('filled')}
        >
          Occupied ({occupiedCount})
        </button>

        <button
          type="button"
          className={`modern-pill ${statusFilter === 'inactive' ? 'pill-active' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          Inactive ({inactiveCount})
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="modern-search-box">
        <Search size={18} className="search-icon-inside" />
        <input
          type="text"
          className="search-input-pill"
          placeholder="Search seat or member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Visual Desk Grid */}
      {filteredSeats.length === 0 ? (
        <div className="empty-state-card">
          <Armchair size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Seats Found</h3>
          <p>
            {seats.length === 0
              ? 'No seats added yet. Click "+ Add Seat" above to set up your library layout!'
              : `No seats matching the current filter "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="modern-desk-grid">
          {filteredSeats.map((seat) => (
            <div
              key={seat.id}
              className={`modern-seat-card card-status-${seat.status}`}
              onClick={() => setActionSeat(seat)}
              title="Click to change seat status or student"
            >
              <div className="seat-top-row">
                <div className="seat-left-brand">
                  <Armchair
                    size={18}
                    color={seat.status === 'active' ? '#10b981' : seat.status === 'filled' ? '#ef4444' : '#94a3b8'}
                  />
                  <strong className="seat-code-text">{seat.name}</strong>
                </div>
                <span
                  className={`status-circle-dot ${
                    seat.status === 'active' ? 'dot-active' : seat.status === 'filled' ? 'dot-filled' : 'dot-inactive'
                  }`}
                />
              </div>

              <div className="seat-middle-status">
                {seat.status === 'active' && <span className="status-label-available">✓ Available</span>}
                {seat.status === 'filled' && <span className="status-label-occupied">● Occupied</span>}
                {seat.status === 'inactive' && <span className="status-label-inactive">✕ Inactive</span>}
              </div>

              <div className="seat-bottom-row">
                <span className={`vacant-badge badge-${seat.status}`}>
                  {seat.status === 'filled' && seat.student ? seat.student : seat.status === 'active' ? 'VACANT' : 'BLOCKED'}
                </span>
                {seat.nearAc && <span title="Near AC Unit" className="ac-snowflake">❄️</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Seat Modal */}
      <AddSeatModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSeat={handleAddSeat}
        existingSeatNames={existingSeatNames}
      />

      {/* Seat Action Modal */}
      <SeatActionModal
        isOpen={!!actionSeat}
        onClose={() => setActionSeat(null)}
        seat={actionSeat}
        onUpdateStatus={handleUpdateStatus}
        onDeleteSeat={handleDeleteSeat}
      />
    </div>
  );
};

export default SeatManagementTab;
