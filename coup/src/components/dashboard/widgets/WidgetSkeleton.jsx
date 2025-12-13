/**
 * WidgetSkeleton.jsx
 *
 * 위젯 로딩 스켈레톤 컴포넌트
 * 각 위젯의 크기와 레이아웃에 맞는 스켈레톤 제공
 *
 * @module components/dashboard/widgets/WidgetSkeleton
 */

import styles from './WidgetSkeleton.module.css'

/**
 * 공통 스켈레톤 라인
 */
function SkeletonLine({ width = '100%', height = '16px', marginBottom = '8px' }) {
  return (
    <div
      className={styles.skeleton}
      style={{
        width,
        height,
        marginBottom
      }}
    />
  )
}

/**
 * 공통 스켈레톤 원형
 */
function SkeletonCircle({ size = '40px' }) {
  return (
    <div
      className={styles.skeleton}
      style={{
        width: size,
        height: size,
        borderRadius: '50%'
      }}
    />
  )
}

/**
 * StudyStatus 위젯 스켈레톤
 */
export function StudyStatusSkeleton() {
  return (
    <div className={styles.widgetContainer}>
      <SkeletonLine width="120px" height="20px" marginBottom="16px" />

      {/* 출석률 섹션 */}
      <div className={styles.statSection}>
        <SkeletonLine width="60px" height="14px" marginBottom="8px" />
        <div className={styles.progressBar}>
          <div className={styles.skeleton} style={{ height: '8px', borderRadius: '4px' }} />
        </div>
        <SkeletonLine width="80px" height="12px" marginBottom="0" />
      </div>

      {/* 과제 완성률 섹션 */}
      <div className={styles.statSection}>
        <SkeletonLine width="80px" height="14px" marginBottom="8px" />
        <div className={styles.progressBar}>
          <div className={styles.skeleton} style={{ height: '8px', borderRadius: '4px' }} />
        </div>
        <SkeletonLine width="80px" height="12px" marginBottom="0" />
      </div>

      {/* 연속 출석 */}
      <div className={styles.statSection}>
        <SkeletonLine width="70px" height="14px" marginBottom="8px" />
        <SkeletonLine width="100px" height="24px" marginBottom="0" />
      </div>
    </div>
  )
}

/**
 * UrgentTasks 위젯 스켈레톤
 */
export function UrgentTasksSkeleton() {
  return (
    <div className={styles.widgetContainer}>
      <SkeletonLine width="100px" height="20px" marginBottom="16px" />

      {/* 할일 목록 */}
      <div className={styles.taskList}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.taskItem}>
            <SkeletonCircle size="20px" />
            <div className={styles.taskContent}>
              <SkeletonLine width="80%" height="14px" marginBottom="4px" />
              <SkeletonLine width="60%" height="12px" marginBottom="0" />
            </div>
            <SkeletonLine width="40px" height="20px" marginBottom="0" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * OnlineMembers 위젯 스켈레톤
 */
export function OnlineMembersSkeleton() {
  return (
    <div className={styles.widgetContainer}>
      <SkeletonLine width="120px" height="20px" marginBottom="16px" />

      {/* 멤버 목록 */}
      <div className={styles.memberList}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.memberItem}>
            <SkeletonCircle size="40px" />
            <div className={styles.memberInfo}>
              <SkeletonLine width="80px" height="14px" marginBottom="4px" />
              <SkeletonLine width="60px" height="12px" marginBottom="0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * PinnedNotice 위젯 스켈레톤
 */
export function PinnedNoticeSkeleton() {
  return (
    <div className={styles.widgetContainer}>
      <SkeletonLine width="100px" height="20px" marginBottom="16px" />

      {/* 공지사항 내용 */}
      <div className={styles.noticeContent}>
        <SkeletonLine width="100%" height="14px" marginBottom="8px" />
        <SkeletonLine width="100%" height="14px" marginBottom="8px" />
        <SkeletonLine width="70%" height="14px" marginBottom="16px" />

        <div className={styles.noticeMeta}>
          <SkeletonLine width="60px" height="12px" marginBottom="0" />
          <SkeletonLine width="80px" height="12px" marginBottom="0" />
        </div>
      </div>
    </div>
  )
}

/**
 * QuickActions 위젯 스켈레톤
 */
export function QuickActionsSkeleton() {
  return (
    <div className={styles.widgetContainer}>
      <SkeletonLine width="100px" height="20px" marginBottom="16px" />

      {/* 액션 버튼들 */}
      <div className={styles.actionsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.actionItem}>
            <SkeletonCircle size="32px" />
            <SkeletonLine width="60px" height="12px" marginBottom="0" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 통계 카드 스켈레톤
 */
export function StatCardSkeleton() {
  return (
    <div className={styles.statCard}>
      <SkeletonCircle size="32px" />
      <SkeletonLine width="80px" height="14px" marginBottom="8px" />
      <SkeletonLine width="40px" height="32px" marginBottom="0" />
    </div>
  )
}

/**
 * 스터디 카드 스켈레톤
 */
export function StudyCardSkeleton() {
  return (
    <div className={styles.studyCard}>
      <SkeletonCircle size="48px" />
      <SkeletonLine width="100%" height="20px" marginBottom="8px" />
      <SkeletonLine width="70%" height="14px" marginBottom="4px" />
      <SkeletonLine width="50%" height="12px" marginBottom="16px" />

      <div className={styles.studyMeta}>
        <SkeletonLine width="60px" height="12px" marginBottom="0" />
        <SkeletonLine width="80px" height="12px" marginBottom="0" />
      </div>
    </div>
  )
}

/**
 * 활동 아이템 스켈레톤
 */
export function ActivityItemSkeleton() {
  return (
    <div className={styles.activityItem}>
      <SkeletonLine width="60px" height="20px" marginBottom="0" />
      <div className={styles.activityContent}>
        <SkeletonLine width="100%" height="14px" marginBottom="0" />
      </div>
      <SkeletonLine width="60px" height="12px" marginBottom="0" />
    </div>
  )
}

/**
 * 일정 아이템 스켈레톤
 */
export function EventItemSkeleton() {
  return (
    <div className={styles.eventItem}>
      <div className={styles.eventDate}>
        <SkeletonLine width="40px" height="24px" marginBottom="0" />
      </div>
      <div className={styles.eventContent}>
        <SkeletonLine width="100%" height="16px" marginBottom="4px" />
        <SkeletonLine width="60%" height="12px" marginBottom="0" />
      </div>
    </div>
  )
}

/**
 * 범용 위젯 스켈레톤
 * 특정 위젯이 없을 때 사용
 */
export default function WidgetSkeleton({
  lines = 3,
  hasTitle = true,
  hasIcon = false
}) {
  return (
    <div className={styles.widgetContainer}>
      {hasTitle && (
        <div className={styles.header}>
          {hasIcon && <SkeletonCircle size="24px" />}
          <SkeletonLine width="120px" height="20px" marginBottom="16px" />
        </div>
      )}

      <div className={styles.content}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '70%' : '100%'}
            height="14px"
            marginBottom="8px"
          />
        ))}
      </div>
    </div>
  )
}

