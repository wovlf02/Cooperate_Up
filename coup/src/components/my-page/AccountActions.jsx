'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import DeleteAccountModal from './DeleteAccountModal'
import styles from './AccountActions.module.css'

export default function AccountActions() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return

    try {
      setIsLoggingOut(true)
      // React Query 캐시 전체 초기화 (이전 유저 데이터 제거)
      queryClient.clear()
      await signOut({
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃에 실패했습니다')
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('계정 삭제 실패')
      }

      alert('계정이 삭제되었습니다')
      setShowDeleteModal(false)

      // 로그아웃 후 홈으로 이동
      await handleLogout()
    } catch (error) {
      console.error('계정 삭제 실패:', error)
      alert('계정 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>5. 계정 관리</h2>

        <div className={styles.actionsContainer}>
          {/* 로그아웃 */}
          <div className={styles.actionCard}>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>로그아웃</h3>
              <p className={styles.actionDescription}>
                현재 기기에서 로그아웃합니다
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`${styles.actionButton} ${styles.logoutButton}`}
            >
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>

          {/* 계정 삭제 */}
          <div className={`${styles.actionCard} ${styles.dangerCard}`}>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>계정 삭제</h3>
              <p className={styles.actionDescription}>
                ⚠️ 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className={`${styles.actionButton} ${styles.deleteButton}`}
            >
              계정 삭제
            </button>
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}
