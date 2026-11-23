import React from 'react';
import Modal from '../Modal';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TermsModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_terms_title')}
      icon={FileText}
    >
      <div className="modal-badge-row">
        <span className="badge badge-blue">Razorpay KYC Compliant</span>
        <span className="badge badge-green">Last Updated: 2026</span>
      </div>

      <p>{t('modal_terms_p1')}</p>
      <p>{t('modal_terms_p2')}</p>
      <p>{t('modal_terms_p3')}</p>
      <p>{t('modal_terms_p4')}</p>

      <div className="modal-card">
        <strong>Governing Law & Dispute Resolution</strong>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with membiQ platform services shall be subject to the exclusive jurisdiction of the competent courts in India.
        </p>
      </div>
    </Modal>
  );
};

export default TermsModal;
