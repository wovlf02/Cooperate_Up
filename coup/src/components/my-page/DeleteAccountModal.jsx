'use client'

import { useState } from 'react'
import styles from './DeleteAccountModal.module.css'

export default function DeleteAccountModal({ onClose, onConfirm }) {
  const [inputValue, setInputValue] = useState('')
  const isConfirmEnabled = inputValue === '삭제'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isConfirmEnabled) {
      onConfirm()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>계정 삭제 확인</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.warningText}>
            정말로 계정을 삭제하시겠습니까?
          </p>

          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>삭제되는 데이터:</h3>
            <ul className={styles.infoList}>
              <li>프로필 정보 (이름, 이미지, 자기소개 등)</li>
              <li>참여 중인 모든 스터디 (OWNER인 스터디 포함)</li>
              <li>작성한 공지사항, 파일, 댓글, 채팅 메시지 등</li>
              <li>활동 기록 및 통계</li>
            </ul>
          </div>

          <p className={styles.dangerText}>
            ⚠️ 이 작업은 되돌릴 수 없습니다
          </p>

          <form onSubmit={handleSubmit}>
            <label className={styles.confirmLabel}>
              삭제하려면 아래에 <strong>"삭제"</strong>를 정확히 입력하세요:
            </label>
            <input
              type="text"
              className={styles.confirmInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="삭제"
              autoFocus
            />

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
              >
                취소
              </button>
              <button
                type="submit"
                className={styles.confirmButton}
                disabled={!isConfirmEnabled}
              >
                계정 삭제
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

