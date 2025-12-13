/**
 * QuickActions.jsx
 *
 * 빠른 액션 위젯 (메모이제이션)
 * - 채팅, 화상 통화, 초대 등 빠른 작업
 * - 클립보드 API 폴백 처리
 *
 * @module components/dashboard/widgets/QuickActions
 */

'use client'

import { memo, useState, useCallback } from 'react'
import styles from './Widget.module.css'
import Link from 'next/link'
import { QuickActionsSkeleton } from './WidgetSkeleton'

/**
 * QuickActions 내부 컴포넌트
 */
const QuickActionsContent = memo(function QuickActionsContent({ isAdmin = false }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleVideoCall = useCallback(async () => {
    try {
      setIsLoading(true)
      alert('화상 스터디 기능은 준비 중입니다')
    } catch (error) {
      console.error('화상 통화 시작 실패:', error)
      alert('화상 통화를 시작할 수 없습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInvite = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const inviteLink = `${window.location.origin}/invite?code=SAMPLE`
      
      try {
        await navigator.clipboard.writeText(inviteLink)
        alert('초대 링크가 복사되었습니다!')
      } catch (clipboardError) {
        const textarea = document.createElement('textarea')
        textarea.value = inviteLink
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        
        alert('초대 링크가 복사되었습니다!')
      }
    } catch (error) {
      console.error('초대 링크 복사 실패:', error)
      alert('초대 링크를 복사할 수 없습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
      
      <div className={styles.actionButtons}>
        <Link href="/chat" className={styles.actionButton}>
          💬 채팅 시작
        </Link>
        
        <button 
          onClick={handleVideoCall}
          className={styles.actionButton}
          disabled={isLoading}
        >
          📹 화상 스터디
        </button>
        
        <button 
          onClick={handleInvite}
          className={styles.actionButton}
          disabled={isLoading}
        >
          📤 멤버 초대
        </button>
        
        <Link href="/my-studies/stats" className={styles.actionButton}>
          📊 통계 보기
        </Link>
        
        {isAdmin && (
          <Link href="/settings" className={styles.actionButton}>
            ⚙️ 설정
          </Link>
        )}
      </div>
    </div>
  )
})

/**
 * QuickActions 메인 컴포넌트 (로딩 상태 처리)
 */
function QuickActionsComponent({ isAdmin = false, isLoading = false }) {
  if (isLoading) {
    return <QuickActionsSkeleton />
  }

  return <QuickActionsContent isAdmin={isAdmin} />
}

/**
 * Props 비교 함수
 */
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.isAdmin === nextProps.isAdmin &&
    prevProps.isLoading === nextProps.isLoading
  )
}

export default memo(QuickActionsComponent, arePropsEqual)

