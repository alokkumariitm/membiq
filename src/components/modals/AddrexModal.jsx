import React from 'react';
import Modal from '../Modal';
import { Building2, ExternalLink, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AddrexModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_addrex_title')}
      icon={Building2}
    >
      <div className="modal-badge-row">
        <span className="badge badge-blue">Official Technology Provider</span>
        <span className="badge badge-green">Enterprise SaaS</span>
      </div>

      <p>{t('modal_addrex_desc')}</p>

      <div className="modal-card">
        <strong>Core Capabilities & Expertise</strong>
        <p>{t('modal_addrex_services')}</p>
      </div>

      <div className="modal-card">
        <strong>Direct Contact & Support</strong>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
          <Mail size={18} color="var(--color-primary)" />
          <span>Email: <a href="mailto:support@addrex.in" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>support@addrex.in</a></span>
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
          <Globe size={18} color="var(--color-primary)" />
          <span>Website: <a href="https://www.addrex.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>www.addrex.in</a></span>
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Corporate Office: AddreX Solution Tech Hub, India. Dedicated to powering education infrastructure.
        </p>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <a
          href="https://www.addrex.in"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '320px' }}
        >
          <ExternalLink size={18} />
          {t('modal_addrex_website')}
        </a>
      </div>
    </Modal>
  );
};

export default AddrexModal;
