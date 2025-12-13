'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import DeleteAccountModal from './DeleteAccountModal'
import styles from './SettingsTab.module.css'

// 설정 아이템 컴포넌트
function SettingLink({ href, icon, name, description, badge }) {
  return (
    <Link href={href} className={styles.settingItem}>
      <span className={styles.settingIcon}>{icon}</span>
      <div className={styles.settingInfo}>
        <span className={styles.settingName}>
          {name}
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        <span className={styles.settingDesc}>{description}</span>
      </div>
      <span className={styles.settingArrow}>→</span>
    </Link>
  )
}

// 설정 그룹 컴포넌트
function SettingsGroup({ title, icon, children }) {
  return (
    <section className={styles.sectionCard}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.titleIcon}>{icon}</span>
        {title}
      </h3>
      <div className={styles.settingsList}>
        {children}
      </div>
    </section>
  )
}

export default function SettingsTab() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const queryClient = useQueryClient()

  // 로그아웃
  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return
    setIsLoggingOut(true)
    try {
      // React Query 캐시 전체 초기화 (이전 유저 데이터 제거)
      queryClient.clear()
      await signOut({ callbackUrl: '/', redirect: true })
    } catch {
      alert('로그아웃에 실패했습니다')
      setIsLoggingOut(false)
    }
  }

  // 계정 삭제
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('계정 삭제 실패')
      alert('계정이 삭제되었습니다')
      setShowDeleteModal(false)
      // React Query 캐시 전체 초기화
      queryClient.clear()
      await signOut({ callbackUrl: '/', redirect: true })
    } catch {
      alert('계정 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className={styles.container}>
      {/* 일반 설정 */}
      <SettingsGroup title="일반 설정" icon="⚙️">
        <SettingLink
          href="/settings"
          icon="🌍"
          name="언어 및 지역"
          description="언어, 시간대, 날짜 형식 설정"
        />
        <SettingLink
          href="/settings?tab=accessibility"
          icon="♿"
          name="접근성"
          description="화면 읽기, 키보드 탐색, 애니메이션"
        />
      </SettingsGroup>

      {/* 알림 설정 */}
      <SettingsGroup title="알림" icon="🔔">
        <SettingLink
          href="/settings?tab=notifications"
          icon="📱"
          name="알림 설정"
          description="푸시 알림, 이메일 알림 관리"
        />
        <SettingLink
          href="/notifications"
          icon="📬"
          name="알림함"
          description="받은 알림 확인 및 관리"
        />
      </SettingsGroup>

      {/* 개인정보 및 보안 */}
      <SettingsGroup title="개인정보 및 보안" icon="🔒">
        <SettingLink
          href="/settings?tab=privacy"
          icon="🛡️"
          name="개인정보 보호"
          description="프로필 공개 범위, 활동 표시 설정"
        />
        <SettingLink
          href="/settings?tab=data"
          icon="📊"
          name="데이터 관리"
          description="저장 공간, 데이터 내보내기"
        />
      </SettingsGroup>

      {/* 바로가기 */}
      <SettingsGroup title="바로가기" icon="⚡">
        <SettingLink
          href="/my-studies"
          icon="📚"
          name="내 스터디"
          description="참여 중인 모든 스터디 보기"
        />
        <SettingLink
          href="/tasks"
          icon="✅"
          name="할 일 목록"
          description="나에게 할당된 할 일 확인"
        />
        <SettingLink
          href="/studies"
          icon="🔍"
          name="스터디 탐색"
          description="새로운 스터디 찾아보기"
        />
      </SettingsGroup>

      {/* 계정 관리 */}
      <section className={`${styles.sectionCard} ${styles.dangerSection}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>🔐</span>
          계정 관리
        </h3>
        <div className={styles.accountActions}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutBtn}
          >
            <span className={styles.btnIcon}>🚪</span>
            <span className={styles.btnText}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteBtn}
          >
            <span className={styles.btnIcon}>⚠️</span>
            <div className={styles.btnContent}>
              <span className={styles.btnText}>계정 삭제</span>
              <span className={styles.btnWarning}>모든 데이터가 영구 삭제됩니다</span>
            </div>
          </button>
        </div>
      </section>

      {/* 앱 정보 */}
      <section className={styles.appInfo}>
        <p className={styles.appVersion}>CoUp v1.0.0</p>
        <div className={styles.appLinks}>
          <Link href="/terms" className={styles.appLink}>이용약관</Link>
          <span className={styles.linkDivider}>·</span>
          <Link href="/privacy" className={styles.appLink}>개인정보처리방침</Link>
          <span className={styles.linkDivider}>·</span>
          <Link href="/help" className={styles.appLink}>도움말</Link>
        </div>
      </section>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

