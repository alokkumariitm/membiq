import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogIn,
  LogOut,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Building,
  Key
} from 'lucide-react';
import '../styles/superadmin.css';

export const SuperAdminView = () => {
  const { t } = useLanguage();
  const { owners, isSuperAdmin, loginSuperAdmin, logoutSuperAdmin } = useAuth();

  // Super Admin Login form state
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'due_soon' | 'expired' | 'active'
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginSuperAdmin(adminId, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  // Filtered owners list
  const filteredOwners = owners.filter((owner) => {
    const matchesStatus = statusFilter === 'all' || owner.planStatus === statusFilter;
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.libraryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Helper to generate WhatsApp reminder link
  const createWhatsAppReminderUrl = (owner) => {
    const phoneFormatted = owner.phone.replace(/\D/g, '');
    const cleanPhone = phoneFormatted.startsWith('91') ? phoneFormatted : `91${phoneFormatted}`;

    const isExpired = owner.planStatus === 'expired';
    const message = `Hello ${owner.name}, this is an automated renewal notice from membiQ Platform. Your SaaS subscription for "${owner.libraryName}" (${owner.plan}) is ${isExpired ? 'expired on' : 'expiring on'} ${owner.expiryDate}. Please renew your plan to ensure uninterrupted desk allocation and attendance operations for your reading hall. Need help? Reply to this message.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // 1. If not logged in as Super Admin, display dedicated Super Admin login screen
  if (!isSuperAdmin) {
    return (
      <div className="superadmin-view">
        <div className="container">
          <div className="admin-login-wrapper">
            <div className="admin-login-header">
              <div className="admin-shield-icon">
                <ShieldAlert size={36} />
              </div>
              <h1 className="admin-login-title">Super Admin Portal</h1>
              <p className="admin-login-sub">
                Restricted Platform Authority • membiQ SaaS Operations
              </p>
            </div>

            {loginError && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '600' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="adminIdInput">
                  Super Admin ID
                </label>
                <input
                  id="adminIdInput"
                  type="text"
                  className="form-input"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Super Admin ID"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adminPassInput">
                  Super Admin Password
                </label>
                <input
                  id="adminPassInput"
                  type="password"
                  className="form-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  <Lock size={18} />
                  <span>Authenticate Super Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Super Admin Portal View
  return (
    <div className="superadmin-view">
      <div className="container">
        {/* Header */}
        <div className="admin-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-green">Super Admin Authenticated</span>
              <span className="badge badge-blue">Isolated Platform Console</span>
            </div>
            <h1 style={{ marginTop: '6px' }}>Library Owners Directory & SaaS Subscriptions</h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Oversee registered library owners, subscription health, and issue instant WhatsApp renewal reminders.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={logoutSuperAdmin}
          >
            <LogOut size={18} />
            <span>Exit Super Admin</span>
          </button>
        </div>

        {/* STRICT PRIVACY ISOLATION NOTICE */}
        <div className="admin-privacy-banner" role="region" aria-label="Tenant Privacy Policy">
          <ShieldCheck size={28} className="admin-privacy-icon" />
          <div className="admin-privacy-text">
            <h4>Strict Tenant Privacy Protocol Enforced</h4>
            <p>
              Under membiQ Data Protection Regulations, Super Administrators are <strong>strictly restricted</strong> from accessing student rosters, student attendance records, student personal contact numbers, or internal seat bookings. Only high-level Library Owner subscription metadata is accessible.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div className="admin-filters-bar" style={{ margin: 0 }}>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Library Owners ({owners.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'due_soon' ? 'active' : ''}`}
              onClick={() => setStatusFilter('due_soon')}
            >
              ⚠️ Due Soon ({owners.filter((o) => o.planStatus === 'due_soon').length})
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'expired' ? 'active' : ''}`}
              onClick={() => setStatusFilter('expired')}
            >
              🔴 Expired ({owners.filter((o) => o.planStatus === 'expired').length})
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              ✅ Active ({owners.filter((o) => o.planStatus === 'active').length})
            </button>
          </div>

          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '280px', minHeight: '38px', padding: '6px 12px' }}
            placeholder="Search by owner, library or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table of Registered Library Owners */}
        <div className="admin-table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Library Owner Name</th>
                  <th>Library Name</th>
                  <th>Phone / WhatsApp</th>
                  <th>SaaS Plan</th>
                  <th>Subscription Status</th>
                  <th>Expiry Date</th>
                  <th>Action / Reminders</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      No library owners match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => {
                    const isDue = owner.planStatus === 'due_soon' || owner.planStatus === 'expired';

                    return (
                      <tr key={owner.id}>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {owner.name}
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>
                            {owner.libraryName}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} color="var(--color-text-muted)" />
                            +91 {owner.phone}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-blue">{owner.plan}</span>
                        </td>
                        <td>
                          {owner.planStatus === 'active' && (
                            <span className="badge badge-green">Active</span>
                          )}
                          {owner.planStatus === 'due_soon' && (
                            <span className="badge badge-amber">Due Soon</span>
                          )}
                          {owner.planStatus === 'expired' && (
                            <span className="badge badge-red" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' }}>
                              Expired
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {owner.expiryDate}
                        </td>
                        <td>
                          {isDue ? (
                            <a
                              href={createWhatsAppReminderUrl(owner)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp"
                              title="Send pre-filled WhatsApp reminder"
                            >
                              <MessageSquare size={16} />
                              <span>Send WhatsApp Reminder</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: '600' }}>
                              ✓ Active (No Reminder Needed)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminView;
