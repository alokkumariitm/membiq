import React from 'react';
import Modal from '../Modal';
import { ShieldCheck, Copyright, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CopyrightModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_copyright_title')}
      icon={Copyright}
    >
      <div className="modal-badge-row">
        <span className="badge badge-blue">membiQ v1.0.0</span>
        <span className="badge badge-green">Registered SaaS Brand</span>
        <span className="badge badge-amber">Proprietary IP</span>
      </div>

      <p>{t('modal_copyright_body')}</p>

      <div className="modal-card">
        <strong>Platform Governance & Intellectual Rights</strong>
        <p>
          Copyright © 2026 AddreX Solution. All rights reserved. membiQ™, the membiQ logo, the desk shift allocation engine, and interactive seat-grid interfaces are trademarks of AddreX Solution.
        </p>
      </div>

      <div className="modal-card">
        <strong>Authorized Usage</strong>
        <p>
          Access is granted strictly to registered library operators and licensed educational study centers under active subscription agreements.
        </p>
      </div>
    </Modal>
  );
};

export default CopyrightModal;
