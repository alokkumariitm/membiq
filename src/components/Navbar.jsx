import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  BookOpen,
  Home,
  CreditCard,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import '../styles/navigation.css';

export const Navbar = ({ activeView, setActiveView }) => {
  const { t } = useLanguage();
  const { currentUser, currentSession, logoutOwner, isSuperAdmin, logoutSuperAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav_home'), icon: Home },
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'superadmin', label: t('nav_superadmin'), icon: ShieldAlert },
  ];

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="top-navbar">
      <div className="container nav-container">
        {/* Brand */}
        <button
          type="button"
          className="nav-brand"
          onClick={() => handleNavClick('home')}
          aria-label="membiQ Home"
        >
          <div className="brand-icon-box">
            <BookOpen size={24} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">membi<span className="brand-accent">Q</span></span>
            <span className="brand-sub">Reading Hall SaaS</span>
          </div>
        </button>

        {/* Desktop Menu */}
        <nav className="nav-menu-desktop" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'superadmin' && isSuperAdmin && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginLeft: '2px' }} title="Super Admin Logged In" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: User Profile Pill + Language Switcher + Mobile Toggle */}
        <div className="nav-actions">
          {/* Active Owner Status Pill (Desktop) */}
          {currentUser && currentSession && (
            <div style={{ display: 'none', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bg-alt)', padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--color-border)' }} className="desktop-user-pill">
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {currentUser.name.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={logoutOwner}
                title="Sign out of this device"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {/* Super Admin status badge */}
          {isSuperAdmin && (
            <div style={{ display: 'none', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#15803d' }} className="desktop-admin-badge">
              <ShieldCheck size={14} />
              <span>Admin</span>
            </div>
          )}

          {/* Prominent Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {currentUser && currentSession && (
            <div style={{ padding: '0 var(--space-4) var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                👤 {currentUser.name} ({currentUser.libraryName})
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={logoutOwner}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}

          <ul className="mobile-menu-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mobile-lang-wrapper">
            <LanguageSwitcher prominent />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
