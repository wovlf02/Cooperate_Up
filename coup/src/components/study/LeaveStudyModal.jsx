'use client'

import { useState } from 'react'
import styles from './LeaveStudyModal.module.css'

/**
 * 스터디 탈퇴 확인 모달
 * - 일반 멤버/관리자: 탈퇴 확인
 * - OWNER: 탈퇴 불가 안내 (권한 위임 필요)
 */
export default function LeaveStudyModal({
  isOpen,
  onClose,
  onConfirm,
  studyName,
  userRole,
  isLoading
}) {
  const [confirmText, setConfirmText] = useState('')
  const isOwner = userRole === 'OWNER'
  const canLeave = confirmText === '탈퇴'

  if (!isOpen) return null

  const handleConfirm = () => {
    if (canLeave && !isOwner) {
      onConfirm()
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {isOwner ? (
              <span className={styles.iconWarning}>👑</span>
            ) : (
              <span className={styles.iconDanger}>🚪</span>
            )}
          </div>
          <h2 className={styles.title}>
            {isOwner ? '스터디 탈퇴 불가' : '스터디 탈퇴'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className={styles.content}>
          {isOwner ? (
            // OWNER인 경우
            <>
              <div className={styles.ownerWarning}>
                <p className={styles.warningText}>
                  <strong>스터디장</strong>은 스터디를 탈퇴할 수 없습니다.
                </p>
                <p className={styles.warningSubtext}>
                  탈퇴를 원하시면 다른 멤버에게 스터디장 권한을 위임하거나,
                  스터디를 삭제해주세요.
                </p>
              </div>

              <div className={styles.optionCards}>
                <div className={styles.optionCard}>
                  <span className={styles.optionIcon}>👥</span>
                  <div className={styles.optionInfo}>
                    <h4>권한 위임</h4>
                    <p>다른 멤버에게 스터디장 권한을 넘기고 탈퇴할 수 있습니다.</p>
                  </div>
                </div>
                <div className={styles.optionCard}>
                  <span className={styles.optionIcon}>🗑️</span>
                  <div className={styles.optionInfo}>
                    <h4>스터디 삭제</h4>
                    <p>설정 → 위험 구역에서 스터디를 완전히 삭제할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // 일반 멤버/관리자인 경우
            <>
              <div className={styles.studyInfo}>
                <p className={styles.studyName}>{studyName}</p>
                <p className={styles.roleText}>
                  현재 역할: <span className={styles.roleBadge}>{userRole}</span>
                </p>
              </div>

              <div className={styles.warningBox}>
                <h4>⚠️ 탈퇴 시 주의사항</h4>
                <ul className={styles.warningList}>
                  <li>스터디의 모든 활동 기록에 접근할 수 없게 됩니다.</li>
                  <li>채팅, 파일, 일정 등 스터디 데이터를 볼 수 없습니다.</li>
                  <li>재가입을 원하시면 다시 가입 신청이 필요합니다.</li>
                </ul>
              </div>

              <div className={styles.confirmSection}>
                <label className={styles.confirmLabel}>
                  탈퇴를 확인하려면 <strong>&quot;탈퇴&quot;</strong>를 입력하세요
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="탈퇴"
                  className={styles.confirmInput}
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
          >
            {isOwner ? '확인' : '취소'}
          </button>

          {!isOwner && (
            <button
              className={`${styles.confirmButton} ${!canLeave ? styles.disabled : ''}`}
              onClick={handleConfirm}
              disabled={!canLeave || isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  탈퇴 중...
                </>
              ) : (
                '스터디 탈퇴'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

