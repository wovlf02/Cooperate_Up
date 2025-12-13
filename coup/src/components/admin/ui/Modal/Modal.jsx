'use client'

import { useEffect } from 'react'
import PropTypes from 'prop-types'
import Button from '@/components/admin/ui/Button'
import styles from './Modal.module.css'

/**
 * Modal 컴포넌트
 * 접근성과 애니메이션이 개선된 모달
 */
export default function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  className = '',
}) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e) => {
      if (e.key === 'Escape' && closable) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, closable])

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalClass = `${styles.modal} ${styles[`modal--${size}`]} ${className}`.trim()

  return (
    <>
      <div className={styles.backdrop} onClick={closable ? onClose : undefined} />
      <div className={styles.container}>
        <div className={modalClass} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          {/* Header */}
          {(title || closable) && (
            <div className={styles.header}>
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {closable && (
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="닫기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={styles.content}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={styles.footer}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closable: PropTypes.bool,
  className: PropTypes.string,
}

// Confirm Modal 유틸리티
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className={styles.confirmMessage}>{message}</p>
    </Modal>
  )
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.string,
}
