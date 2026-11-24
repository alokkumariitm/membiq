import React, { useState } from 'react';
import { X, UserPlus, Armchair, Phone, User, Clock, Calendar } from 'lucide-react';
import '../../styles/modal.css';

export const AddMemberModal = ({
  isOpen,
  onClose,
  onRegisterStudent,
  seats = [],
}) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [shift, setShift] = useState('Morning (06:00 AM – 12:00 PM)');
  const [feeRate, setFeeRate] = useState(800);
  const [monthsCount, setMonthsCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Student full name is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('WhatsApp / Phone number is required.');
      return;
    }

    const today = new Date();
    const expDate = new Date(today.getTime() + monthsCount * 30 * 24 * 60 * 60 * 1000);

    const newStudent = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      fatherName: fatherName.trim() || null,
      phone: phone.trim(),
      seatNumber: seatNumber.trim() || 'Floating Desk',
      shift,
      feeRate: Number(feeRate),
      totalFee: Number(feeRate) * monthsCount,
      joiningDate: today.toISOString().split('T')[0],
      expiryDate: expDate.toISOString().split('T')[0],
      status: 'active',
    };

    onRegisterStudent(newStudent);

    // Reset & Close
    setName('');
    setFatherName('');
    setPhone('');
    setSeatNumber('');
    onClose();
  };

  const availableSeats = seats.filter((s) => s.status === 'active');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>
            <UserPlus size={20} color="var(--color-primary)" />
            <span>Add New Member</span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Father's Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Sharma"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Assign Seat</label>
                <select
                  className="form-select"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                >
                  <option value="">Floating Desk</option>
                  {availableSeats.map((seat) => (
                    <option key={seat.id} value={seat.name}>
                      Seat {seat.name} (Available)
                    </option>
                  ))}
                  {seats.length === 0 && <option value="S-01">Seat S-01</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Shift Slot</label>
                <select
                  className="form-select"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option value="Morning (06:00 AM – 12:00 PM)">Morning</option>
                  <option value="Afternoon (12:00 PM – 06:00 PM)">Afternoon</option>
                  <option value="Evening (06:00 PM – 11:59 PM)">Evening</option>
                  <option value="Full Day (24 Hours)">Full Day (24h)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Monthly Fee (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="50"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Validity (Months)</label>
                <select
                  className="form-select"
                  value={monthsCount}
                  onChange={(e) => setMonthsCount(Number(e.target.value))}
                >
                  <option value="1">1 Month (30 Days)</option>
                  <option value="2">2 Months (60 Days)</option>
                  <option value="3">3 Months (90 Days)</option>
                  <option value="6">6 Months</option>
                  <option value="12">1 Year</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#0e1015', border: '1px solid #1f232d', borderRadius: '10px', padding: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', color: '#9ca3af' }}>Total Fee Payable:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                ₹{Number(feeRate) * monthsCount}
              </strong>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }}>
              <UserPlus size={16} />
              <span>Admit Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
