import React, { useState } from 'react';
import { Armchair, PlusCircle, Filter, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AddSeatModal from './AddSeatModal';
import SeatActionModal from './SeatActionModal';
import '../../styles/admission.css';

export const SeatManagementTab = ({
  seats,
  setSeats,
  onSeatClick
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'filled' | 'inactive'
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSeat, setActionSeat] = useState(null);

  // Filtered seats
  const filteredSeats = seats.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const activeCount = seats.filter((s) => s.status === 'active').length;
  const filledCount = seats.filter((s) => s.status === 'filled').length;
  const inactiveCount = seats.filter((s) => s.status === 'inactive').length;

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
    <div>
      {/* Controls Bar: Filters & Add Seat Button */}
      <div className="seat-controls-header">
        <div className="seat-filter-pills">
          <button
            type="button"
            className={`seat-status-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>{t('seat_filter_all')}</span>
            <span style={{ opacity: 0.85 }}>({seats.length})</span>
          </button>

          <button
            type="button"
            className={`seat-status-pill ${statusFilter === 'active' ? 'active' : ''}`}
            style={{ borderColor: '#86efac', color: statusFilter === 'active' ? '#fff' : '#15803d' }}
            onClick={() => setStatusFilter('active')}
          >
            <CheckCircle2 size={16} />
            <span>{t('seat_status_active')}</span>
            <span style={{ fontWeight: '800' }}>({activeCount})</span>
          </button>

          <button
            type="button"
            className={`seat-status-pill ${statusFilter === 'filled' ? 'active' : ''}`}
            style={{ borderColor: '#93c5fd', color: statusFilter === 'filled' ? '#fff' : '#1e40af' }}
            onClick={() => setStatusFilter('filled')}
          >
            <UserCheck size={16} />
            <span>{t('seat_status_filled')}</span>
            <span style={{ fontWeight: '800' }}>({filledCount})</span>
          </button>

          <button
            type="button"
            className={`seat-status-pill ${statusFilter === 'inactive' ? 'active' : ''}`}
            style={{ borderColor: '#cbd5e1', color: statusFilter === 'inactive' ? '#fff' : '#64748b' }}
            onClick={() => setStatusFilter('inactive')}
          >
            <AlertTriangle size={16} />
            <span>{t('seat_status_inactive')}</span>
            <span style={{ fontWeight: '800' }}>({inactiveCount})</span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusCircle size={18} />
          <span>{t('seat_add_btn')}</span>
        </button>
      </div>

      {/* Grid of Seats */}
      <div style={{ backgroundColor: '#ffffff', border: '2px solid var(--color-border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
              Interactive Floor Map (Click any seat to quick-switch status)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Green: Vacant • Blue: Filled • Gray: Maintenance
            </span>
          </div>

          <span className="badge badge-blue">
            {filteredSeats.length} Seats Shown
          </span>
        </div>

        {filteredSeats.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Armchair size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No seats found matching the filter "{statusFilter}".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
            {filteredSeats.map((seat) => (
              <div
                key={seat.id}
                className={`seat-card status-${seat.status}`}
                onClick={() => setActionSeat(seat)}
                title={`${seat.name} - ${seat.status.toUpperCase()} ${seat.student ? `(${seat.student})` : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="seat-name-text">{seat.name}</span>
                  {seat.nearAc && <span title="Near AC Unit" style={{ fontSize: '0.65rem' }}>❄️</span>}
                </div>

                <div className="seat-status-label">
                  {seat.status === 'active' && 'Vacant'}
                  {seat.status === 'filled' && 'Filled'}
                  {seat.status === 'inactive' && 'Maintenance'}
                </div>

                {seat.status === 'filled' && seat.student ? (
                  <div className="seat-student-badge">
                    {seat.student}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>
                    {seat.type === 'fixed' ? 'Fixed' : 'Floating'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Seat Modal */}
      <AddSeatModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSeat={handleAddSeat}
        existingSeatNames={existingSeatNames}
      />

      {/* Quick Action Toggle Modal */}
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
