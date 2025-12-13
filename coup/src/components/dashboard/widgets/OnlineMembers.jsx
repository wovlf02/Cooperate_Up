/**
 * OnlineMembers.jsx
 *
 * 온라인 멤버 위젯 (메모이제이션)
 * - 현재 온라인 멤버 목록
 * - 아바타 표시 (에러 처리 포함)
 * - 역할 배지
 *
 * @module components/dashboard/widgets/OnlineMembers
 */

'use client'

import { memo, useMemo, useState } from 'react'
import styles from './Widget.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { OnlineMembersSkeleton } from './WidgetSkeleton'

/**
 * 멤버 아바타 컴포넌트 (이미지 로딩 실패 처리)
 */
const MemberAvatar = memo(function MemberAvatar({ member }) {
  const [imageError, setImageError] = useState(false)

  if (!member.avatar || imageError) {
    return (
      <div className={styles.avatarPlaceholder}>
        {member.name?.[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <Image 
      src={member.avatar} 
      alt={member.name || '멤버'}
      width={32}
      height={32}
      onError={() => setImageError(true)}
    />
  )
})

/**
 * 온라인 멤버 위젯 컴포넌트
 */
function OnlineMembersComponent({ members = [], totalMembers = 0, isLoading = false }) {
  // 로딩 상태
  if (isLoading) {
    return <OnlineMembersSkeleton />
  }

  // useMemo로 온라인 멤버 필터링 최적화
  const onlineMembers = useMemo(() => {
    return (members || []).filter(m => m.isOnline)
  }, [members])
  
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>👥 온라인 멤버</h3>
        <span className={styles.badge}>{onlineMembers.length}명</span>
      </div>

      {onlineMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>현재 온라인인 멤버가 없습니다</p>
        </div>
      ) : (
        <div className={styles.membersList}>
          {onlineMembers.slice(0, 5).map((member) => (
            <div key={member.id} className={styles.memberItem}>
              <div className={styles.memberAvatar}>
                <MemberAvatar member={member} />
                <span className={styles.onlineIndicator}>🟢</span>
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.name || '알 수 없음'}
                  {member.role === 'OWNER' && (
                    <span className={styles.roleBadge}>👑</span>
                  )}
                </div>
                {member.currentActivity && (
                  <div className={styles.memberActivity}>
                    {member.currentActivity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalMembers > 0 && (
        <Link href="/members" className={styles.widgetLink}>
          📊 전체 멤버 ({totalMembers}명) →
        </Link>
      )}
    </div>
  )
}

/**
 * Props 비교 함수
 * members 배열과 totalMembers만 비교
 */
const arePropsEqual = (prevProps, nextProps) => {
  // 로딩 상태 비교
  if (prevProps.isLoading !== nextProps.isLoading) return false

  // totalMembers 비교
  if (prevProps.totalMembers !== nextProps.totalMembers) return false

  const prevMembers = prevProps.members || []
  const nextMembers = nextProps.members || []

  // 배열 길이가 다르면 다름
  if (prevMembers.length !== nextMembers.length) return false

  // 온라인 멤버의 id와 isOnline 상태만 비교
  for (let i = 0; i < prevMembers.length; i++) {
    const prev = prevMembers[i]
    const next = nextMembers[i]

    if (
      prev?.id !== next?.id ||
      prev?.isOnline !== next?.isOnline ||
      prev?.name !== next?.name ||
      prev?.avatar !== next?.avatar ||
      prev?.role !== next?.role ||
      prev?.currentActivity !== next?.currentActivity
    ) {
      return false
    }
  }

  return true
}

/**
 * 메모이제이션된 OnlineMembers 컴포넌트
 */
export default memo(OnlineMembersComponent, arePropsEqual)
