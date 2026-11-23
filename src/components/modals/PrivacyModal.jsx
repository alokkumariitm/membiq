import React from 'react';
import Modal from '../Modal';
import { Shield, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PrivacyModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_privacy_title')}
      icon={Shield}
    >
      <div className="modal-badge-row">
        <span className="badge badge-blue">Strict Data Protection</span>
        <span className="badge badge-green">Zero Third-Party Sharing</span>
      </div>

      <p>{t('modal_privacy_p1')}</p>
      <p>{t('modal_privacy_p2')}</p>
      <p>{t('modal_privacy_p3')}</p>
      <p>{t('modal_privacy_p4')}</p>

      <div className="modal-card">
        <strong>Information Security Protocol</strong>
        <p>
          All reading-hall databases, student rosters, and fee payment histories are isolated per tenant with role-based access control (RBAC), HTTPS TLS 1.3 transit encryption, and encrypted cloud storage.
        </p>
      </div>
    </Modal>
  );
};

export default PrivacyModal;
