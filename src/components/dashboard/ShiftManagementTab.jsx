import React, { useState } from 'react';
import { Clock, Plus, Edit2, CheckCircle2, Moon, Sun, Sunrise, Sunset } from 'lucide-react';

const INITIAL_SHIFTS = [
  { id: 'sh-1', name: 'Morning', timing: '06:00 AM – 12:00 PM', status: 'active', icon: Sunrise },
  { id: 'sh-2', name: 'Afternoon', timing: '12:00 PM – 06:00 PM', status: 'active', icon: Sun },
  { id: 'sh-3', name: 'Evening', timing: '06:00 PM – 11:59 PM', status: 'active', icon: Sunset },
  { id: 'sh-4', name: 'Night Owl / 24 Hours', timing: '10:00 PM – 06:00 AM', status: 'active', icon: Moon },
];

export const ShiftManagementTab = () => {
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [shiftsEnabled, setShiftsEnabled] = useState(true);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('07:00 AM');
  const [newShiftEnd, setNewShiftEnd] = useState('02:00 PM');

  const handleAddShift = (e) => {
    e.preventDefault();
    if (!newShiftName.trim()) return;

    const newShift = {
      id: `sh-${Date.now()}`,
      name: newShiftName.trim(),
      timing: `${newShiftStart} – ${newShiftEnd}`,
      status: 'active',
      icon: Clock,
    };

    setShifts((prev) => [...prev, newShift]);
    setNewShiftName('');
    setShowAddShiftModal(false);
  };

  return (
    <div className="shift-mgmt-page">
      {/* Title & Subtitle */}
      <div className="tab-title-header">
        <h2 className="tab-main-heading">Shift Management</h2>
        <p className="tab-sub-heading">
          Optimize library capacity by assigning different members to study desks across scheduled shifts.
        </p>
      </div>

      {/* Primary Purple Action Button */}
      <button
        type="button"
        className="btn-primary-purple-pill"
        onClick={() => setShowAddShiftModal(true)}
      >
        <Plus size={20} />
        <span>Add Custom Shift</span>
      </button>

      {/* Enable Shift-Based Seating Card with iOS Toggle */}
      <div className="shift-toggle-card">
        <div className="shift-toggle-left">
          <div className="shift-clock-icon">
            <Clock size={20} color="#7c3aed" />
          </div>
          <div>
            <strong>Enable Shift-Based Seating</strong>
            <p>
              When enabled, desks can be assigned to different patrons in Morning, Afternoon, or Evening batches.
            </p>
          </div>
        </div>

        <label className="ios-toggle-switch">
          <input
            type="checkbox"
            checked={shiftsEnabled}
            onChange={(e) => setShiftsEnabled(e.target.checked)}
          />
          <span className="slider-round"></span>
        </label>
      </div>

      {/* Shift Slots List */}
      <div className="shift-cards-list">
        {shifts.map((shift) => {
          const Icon = shift.icon || Clock;
          return (
            <div key={shift.id} className="shift-card-item">
              <div className="shift-card-header">
                <div className="shift-card-title-group">
                  <div className="shift-item-icon">
                    <Icon size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <h4 className="shift-item-name">{shift.name}</h4>
                    <span className="shift-item-badge">ACTIVE</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="shift-edit-btn"
                  title="Edit shift timing"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="shift-timing-box">
                <span className="timing-label">Timing:</span>
                <strong className="timing-value">{shift.timing}</strong>
              </div>

              <div className="shift-card-footer">
                <span>Configured for Library</span>
                <span>{shift.timing}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Shift Modal */}
      {showAddShiftModal && (
        <div className="modal-backdrop" onClick={() => setShowAddShiftModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Create Custom Shift</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddShiftModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddShift} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Shift Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Early Bird / Full Day"
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    placeholder="07:00 AM"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newShiftEnd}
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    placeholder="02:00 PM"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowAddShiftModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagementTab;
