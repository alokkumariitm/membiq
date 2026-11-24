import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, ShieldCheck, ExternalLink, Sparkles, Copyright } from 'lucide-react';
import '../styles/footer.css';

export const Footer = ({
  openCopyrightModal,
  openAddrexModal,
  openTermsModal,
  openPrivacyModal,
  openRefundModal
}) => {
  const { t } = useLanguage();

  return (
    <footer className="global-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-title">
              <img
                src="/membiqlogopic.png"
                alt="membiQ Logo"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </div>
            <p className="footer-brand-desc">{t('footer_tagline')}</p>
            <div className="footer-version-text" style={{ fontSize: '0.84rem', color: '#9ca3af', fontWeight: '600' }}>
              Version 2.0
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-links-title">Legal & Compliance / कानूनी नीतियां</div>
            <ul className="footer-nav-list inline">
              <li>
                <button
                  type="button"
                  className="footer-btn-link"
                  onClick={openTermsModal}
                >
                  {t('footer_terms')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-btn-link"
                  onClick={openPrivacyModal}
                >
                  {t('footer_privacy')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-btn-link"
                  onClick={openRefundModal}
                >
                  {t('footer_refund')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          {/* Plain unboxed footer text */}
          <span className="footer-copyright-plain" style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
            © All Rights Reserved - membiQ
          </span>

          {/* Clean unboxed clickable link pointing to AddreX Solution */}
          <a
            href="https://alokkumariitm.github.io/addrex-solution/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-powered-plain-link"
            style={{ color: 'var(--color-primary)', fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Powered by AddreX Solution</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
