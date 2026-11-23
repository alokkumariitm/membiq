import React, { useState } from 'react';
import { UserCheck, Armchair, Clock, Calendar, CheckSquare, MessageSquare, Sparkles, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import WhatsAppWelcomeModal from './WhatsAppWelcomeModal';
import '../../styles/admission.css';

export const AdmissionFormTab = ({
  seats,
  onRegisterStudent,
  libraryName
}) => {
  const { t } = useLanguage();

  const [studentType, setStudentType] = useState('fixed'); // 'fixed' | 'floating'
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [shift, setShift] = useState('Morning 06:00 AM – 02:00 PM');
  const [feeRatePerMonth, setFeeRatePerMonth] = useState(800);

  // Month Checkboxes (Multi-Select)
  const MONTHS_LIST = [
    'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026',
    'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026',
    'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'
  ];

  const [selectedMonths, setSelectedMonths] = useState(['Nov 2026']);
  const [errorMsg, setErrorMsg] = useState('');

  // Newly registered student for the WhatsApp modal
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const toggleMonth = (month) => {
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((m) => m !== month));
      }
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const totalFeeCalculated = selectedMonths.length * feeRatePerMonth;

  // Compute expiry date roughly from the last selected month
  const computeExpiryDate = () => {
    const today = new Date();
    // Default 30 days * selectedMonths.length
    const expDate = new Date(today.getTime() + selectedMonths.length * 30 * 24 * 60 * 60 * 1000);
    return expDate.toISOString().split('T')[0];
  };

  const handleAdmissionSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Student full name is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('WhatsApp / Phone number is required for digital receipts.');
      return;
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      fatherName: fatherName.trim() || null,
      address: address.trim() || null,
      phone: phone.trim(),
      studentType, // 'fixed' | 'floating'
      seatNumber: seatNumber.trim() || (studentType === 'fixed' ? 'Unassigned' : 'Floating Desk'),
      shift: shift.trim() || 'General Shift',
      paidMonths: selectedMonths,
      feeRate: feeRatePerMonth,
      totalFee: totalFeeCalculated,
      joiningDate: new Date().toISOString().split('T')[0],
      expiryDate: computeExpiryDate(),
      status: 'active', // 'active' | 'due' | 'expired'
    };

    onRegisterStudent(newStudent);

    // Prompt the Instant WhatsApp Welcome Receipt
    setRegisteredStudent(newStudent);
    setShowWelcomeModal(true);

    // Reset Form
    setName('');
    setFatherName('');
    setAddress('');
    setPhone('');
    setSeatNumber('');
  };

  // Available seats for dropdown
  const vacantSeats = seats.filter((s) => s.status === 'active');

  return (
    <div>
      <div className="admission-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
            {t('adm_title')}
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
            {t('adm_subtitle')}
          </p>
        </div>

        {/* 1. Student Type Selection */}
        <div className="student-type-selector">
          <button
            type="button"
            className={`type-select-btn ${studentType === 'fixed' ? 'active' : ''}`}
            onClick={() => setStudentType('fixed')}
          >
            <Armchair size={18} />
            <span>{t('adm_type_fixed')}</span>
          </button>

          <button
            type="button"
            className={`type-select-btn ${studentType === 'floating' ? 'active' : ''}`}
            onClick={() => setStudentType('floating')}
          >
            <Clock size={18} />
            <span>{t('adm_type_floating')}</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdmissionSubmit}>
          <div className="form-grid-2col">
            {/* Student Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="admNameInput">
                {t('adm_name_label')}
              </label>
              <input
                id="admNameInput"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikas Sharma"
                required
              />
            </div>

            {/* Father's Name (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="admFatherInput">
                {t('adm_father_label')}
              </label>
              <input
                id="admFatherInput"
                type="text"
                className="form-input"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Shri Rajesh Sharma"
              />
            </div>

            {/* WhatsApp Number (Required for WhatsApp Receipt) */}
            <div className="form-group">
              <label className="form-label" htmlFor="admPhoneInput">
                {t('adm_whatsapp_label')}
              </label>
              <input
                id="admPhoneInput"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9811223344"
                required
              />
            </div>

            {/* Seat Number (Optional/Not forced) */}
            <div className="form-group">
              <label className="form-label" htmlFor="admSeatSelect">
                {t('adm_seat_label')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="admSeatSelect"
                  type="text"
                  className="form-input"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder={studentType === 'fixed' ? 'e.g. F-01 or choose vacant' : 'Leave blank for Floating'}
                />
                {vacantSeats.length > 0 && studentType === 'fixed' && (
                  <select
                    className="form-select"
                    style={{ maxWidth: '140px' }}
                    onChange={(e) => {
                      if (e.target.value) setSeatNumber(e.target.value);
                    }}
                    value=""
                  >
                    <option value="">Choose Vacant</option>
                    {vacantSeats.map((vs) => (
                      <option key={vs.id} value={vs.name}>
                        {vs.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Shift Timing (Free-text input, Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="admShiftInput">
                {t('adm_shift_label')}
              </label>
              <input
                id="admShiftInput"
                type="text"
                className="form-input"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder="e.g. Morning 06:00 AM – 02:00 PM, 12 Hours, Night Owl"
              />
            </div>

            {/* Address (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="admAddressInput">
                {t('adm_address_label')}
              </label>
              <input
                id="admAddressInput"
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Room #204, Student Lodge, Rajendra Nagar"
              />
            </div>
          </div>

          {/* Monthly Fee Checkboxes (Multi-Select Months) */}
          <div style={{ marginTop: '20px' }}>
            <label className="form-label">
              {t('adm_fee_months_label')}
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Tick all months for which the student is paying upfront (Multi-select enabled).
            </span>

            <div className="months-selection-grid">
              {MONTHS_LIST.map((m) => {
                const isChecked = selectedMonths.includes(m);
                return (
                  <label
                    key={m}
                    className={`month-checkbox-label ${isChecked ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMonth(m)}
                    />
                    <span>{m}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Fee Calculation Callout */}
          <div className="fee-summary-callout">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: '700' }}>
                  {t('adm_fee_per_month')}:
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '130px', minHeight: '38px', padding: '4px 10px', fontWeight: '700' }}
                  value={feeRatePerMonth}
                  onChange={(e) => setFeeRatePerMonth(Number(e.target.value))}
                  step="50"
                  min="200"
                />
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-end', paddingBottom: '4px' }}>
                × <strong>{selectedMonths.length} Months Selected</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                {t('adm_fee_total')}
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-success)' }}>
                ₹{totalFeeCalculated.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
          >
            <UserCheck size={20} />
            <span>{t('adm_submit_btn')}</span>
          </button>
        </form>
      </div>

      {/* Instant WhatsApp Welcome Modal */}
      <WhatsAppWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        student={registeredStudent}
        libraryName={libraryName}
      />
    </div>
  );
};

export default AdmissionFormTab;
