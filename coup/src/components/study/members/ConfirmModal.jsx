// 확인 모달 컴포넌트
'use client';

import styles from './ConfirmModal.module.css';

/**
 * 확인 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {string} props.title - 모달 제목
 * @param {string} props.message - 모달 메시지
 * @param {string} props.reasonLabel - 사유 입력 라벨
 * @param {string} props.reason - 사유 내용
 * @param {Function} props.onReasonChange - 사유 변경 핸들러
 * @param {Function} props.onConfirm - 확인 핸들러
 * @param {Function} props.onCancel - 취소 핸들러
 * @param {string} props.confirmText - 확인 버튼 텍스트
 * @param {string} props.confirmVariant - 확인 버튼 스타일 ('danger' | 'primary')
 * @param {boolean} props.isProcessing - 처리 중 상태
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  reasonLabel = '사유 (선택사항)',
  reason = '',
  onReasonChange,
  onConfirm,
  onCancel,
  confirmText = '확인',
  confirmVariant = 'danger',
  isProcessing = false
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        
        {onReasonChange && (
          <div className={styles.modalInput}>
            <label>{reasonLabel}</label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="사유를 입력하세요..."
              rows={3}
              disabled={isProcessing}
            />
          </div>
        )}
        
        <div className={styles.modalActions}>
          <button
            className={styles.modalCancelBtn}
            onClick={onCancel}
            disabled={isProcessing}
          >
            취소
          </button>
          <button
            className={`${styles.modalConfirmBtn} ${styles[confirmVariant]}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
