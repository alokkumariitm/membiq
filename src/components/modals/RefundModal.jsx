import React from 'react';
import Modal from '../Modal';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RefundModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_refund_title')}
      icon={RotateCcw}
    >
      <div className="modal-badge-row">
        <span className="badge badge-green">7-Day Money-Back Guarantee</span>
        <span className="badge badge-blue">Razorpay Verified Policy</span>
      </div>

      <p>{t('modal_refund_p1')}</p>
      <p>{t('modal_refund_p2')}</p>
      <p>{t('modal_refund_p3')}</p>
      <p>{t('modal_refund_p4')}</p>

      <div className="modal-card">
        <strong>Support & Cancellation Contact</strong>
        <p>
          For billing questions, subscription plan upgrades, downgrades, or refund status requests, please write to <strong>billing@membiq.com</strong> or raise a ticket from your Library Dashboard.
        </p>
      </div>
    </Modal>
  );
};

export default RefundModal;
