import React, { useState } from 'react';
import Modal from '../Modal';
import { Armchair, CheckCircle2, UserX, AlertTriangle, Trash2, Edit3, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SeatActionModal = ({ isOpen, onClose, seat, onUpdateStatus, onDeleteSeat }) => {
  const { t } = useLanguage();
  const [studentName, setStudentName] = useState(seat?.student || '');

  if (!isOpen || !seat) return null;

  const handleSetStatus = (newStatus) => {
    onUpdateStatus(seat.id, newStatus, newStatus === 'filled' ? (studentName.trim() || 'Assigned Student') : null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Seat Options: ${seat.name}`}
      icon={Armchair}
    >
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-alt)', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{seat.name}</h4>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Zone: {seat.zone || 'Hall A'} • {seat.type === 'fixed' ? 'Fixed Seat' : 'Floating Desk'}
            </span>
          </div>

          <div>
            {seat.status === 'active' && <span className="badge badge-green">{t('seat_status_active')}</span>}
            {seat.status === 'filled' && <span className="badge badge-blue">{t('seat_status_filled')}</span>}
            {seat.status === 'inactive' && <span className="badge badge-amber">{t('seat_status_inactive')}</span>}
          </div>
        </div>

        {seat.status === 'filled' && seat.student && (
          <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            <strong>Occupied by:</strong> {seat.student}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ marginBottom: '6px' }}>
            {t('seat_quick_toggle')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${seat.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderColor: '#86efac', color: seat.status === 'active' ? '#fff' : '#15803d' }}
              onClick={() => handleSetStatus('active')}
            >
              <CheckCircle2 size={16} />
              <span>{t('seat_status_active')}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${seat.status === 'filled' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderColor: '#93c5fd', color: seat.status === 'filled' ? '#fff' : '#1e40af' }}
              onClick={() => handleSetStatus('filled')}
            >
              <UserCheck size={16} />
              <span>{t('seat_status_filled')}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${seat.status === 'inactive' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderColor: '#cbd5e1', color: seat.status === 'inactive' ? '#fff' : '#64748b' }}
              onClick={() => handleSetStatus('inactive')}
            >
              <AlertTriangle size={16} />
              <span>{t('seat_status_inactive')}</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="editAssignedStudent">
            Assign / Edit Student Name:
          </label>
          <input
            id="editAssignedStudent"
            type="text"
            className="form-input"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Aditya Verma"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            onClick={() => {
              if (onDeleteSeat) onDeleteSeat(seat.id);
              onClose();
            }}
          >
            <Trash2 size={14} />
            <span>Remove Seat</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSetStatus(seat.status)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SeatActionModal;
