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
              <BookOpen size={24} color="#60a5fa" />
              <span>{t('brand_name')}</span>
            </div>
            <p className="footer-brand-desc">{t('footer_tagline')}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Razorpay KYC Ready</span>
              <span className="badge badge-green">ISO 27001 Cloud</span>
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
          {/* Requirement 4.a: © All Rights Reserved — membiQ */}
          <button
            type="button"
            className="footer-copyright-btn"
            onClick={openCopyrightModal}
            title="Click to view Platform & Copyright Info"
          >
            <Copyright size={18} />
            <span>{t('footer_copyright')}</span>
          </button>

          {/* Requirement 4.b: Powered by AddreX Solution */}
          <button
            type="button"
            className="footer-powered-btn"
            onClick={openAddrexModal}
            title="Click to view AddreX Solution company details"
          >
            <Sparkles size={18} color="#93c5fd" />
            <span>{t('footer_powered_by')}</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
