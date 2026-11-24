import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Lock background scroll and listen to Escape when menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
    <>
      <header className="top-navbar">
        <div className="container nav-container">
          {/* Brand with /membiqlogopic.png */}
          <button
            type="button"
            className="nav-brand"
            onClick={() => handleNavClick('home')}
            aria-label="membiQ Home"
          >
            <img
              src="/membiqlogopic.png"
              alt="membiQ Logo"
              className="nav-logo-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
            />
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

          {/* Right Actions: User Profile Pill + Mobile Toggle */}
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

            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Backdrop Blur Overlay Modal mounted to document.body via Portal */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div className="mobile-menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <img
                src="/membiqlogopic.png"
                alt="membiQ Logo"
                className="mobile-menu-logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
              />
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {currentUser && currentSession && (
              <div className="mobile-user-status-card">
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>{currentUser.name}</div>
                  <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>{currentUser.libraryName}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    logoutOwner();
                    setMobileMenuOpen(false);
                  }}
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
                      {item.id === 'superadmin' && isSuperAdmin && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginLeft: 'auto' }} title="Super Admin Logged In" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mobile-lang-wrapper">
              <LanguageSwitcher prominent />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
