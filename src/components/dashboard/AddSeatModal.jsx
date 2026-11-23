import React, { useState } from 'react';
import Modal from '../Modal';
import { Armchair, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AddSeatModal = ({ isOpen, onClose, onAddSeat, existingSeatNames }) => {
  const { t } = useLanguage();
  const [seatName, setSeatName] = useState('');
  const [zone, setZone] = useState('Hall A (AC)');
  const [seatType, setSeatType] = useState('fixed');
  const [status, setStatus] = useState('active'); // 'active' | 'filled' | 'inactive'
  const [assignedStudent, setAssignedStudent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = seatName.trim().toUpperCase();
    if (!cleanName) {
      setErrorMsg('Please enter a seat name or code (e.g. F-01, A-10).');
      return;
    }

    if (existingSeatNames.includes(cleanName)) {
      setErrorMsg(`Seat "${cleanName}" already exists. Please choose a unique name.`);
      return;
    }

    const newSeatObj = {
      id: cleanName,
      name: cleanName,
      zone,
      type: seatType, // 'fixed' | 'floating'
      status, // 'active' | 'filled' | 'inactive'
      student: status === 'filled' ? assignedStudent.trim() || 'Assigned Student' : null,
      nearAc: zone.includes('AC'),
    };

    onAddSeat(newSeatObj);
    setSeatName('');
    setAssignedStudent('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('seat_modal_title')}
      icon={Armchair}
    >
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {errorMsg && (
          <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="newSeatNameInput">
            {t('seat_label_input')} *
          </label>
          <input
            id="newSeatNameInput"
            type="text"
            className="form-input"
            value={seatName}
            onChange={(e) => setSeatName(e.target.value)}
            placeholder="e.g. F-01, F-02, A-10, B-12"
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newSeatZoneInput">
            {t('seat_zone_input')}
          </label>
          <select
            id="newSeatZoneInput"
            className="form-select"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            <option value="Hall A (AC Silence Zone)">Hall A (AC Silence Zone)</option>
            <option value="Hall B (AC Discussion Pods)">Hall B (AC Discussion Pods)</option>
            <option value="Cubicle Section">Cubicle Section</option>
            <option value="Floating Reading Area">Floating Reading Area</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newSeatTypeSelect">
            {t('seat_type_select')}
          </label>
          <select
            id="newSeatTypeSelect"
            className="form-select"
            value={seatType}
            onChange={(e) => setSeatType(e.target.value)}
          >
            <option value="fixed">{t('adm_type_fixed')}</option>
            <option value="floating">{t('adm_type_floating')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newSeatStatusSelect">
            Initial Seat Status
          </label>
          <select
            id="newSeatStatusSelect"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">{t('seat_status_active')}</option>
            <option value="filled">{t('seat_status_filled')}</option>
            <option value="inactive">{t('seat_status_inactive')}</option>
          </select>
        </div>

        {status === 'filled' && (
          <div className="form-group">
            <label className="form-label" htmlFor="newSeatStudentInput">
              {t('seat_assigned_to')}
            </label>
            <input
              id="newSeatStudentInput"
              type="text"
              className="form-input"
              value={assignedStudent}
              onChange={(e) => setAssignedStudent(e.target.value)}
              placeholder="e.g. Rohit Kumar"
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            {t('modal_close')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Add Custom Seat</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSeatModal;
