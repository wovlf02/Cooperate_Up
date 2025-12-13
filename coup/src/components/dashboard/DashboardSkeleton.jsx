import styles from './DashboardSkeleton.module.css'

export default function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      {/* 환영 메시지 스켈레톤 */}
      <div className={styles.welcomeSkeleton}></div>

      {/* 통계 카드 스켈레톤 */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCardSkeleton}>
            <div className={styles.iconSkeleton}></div>
            <div className={styles.labelSkeleton}></div>
            <div className={styles.valueSkeleton}></div>
          </div>
        ))}
      </div>

      {/* 내 스터디 스켈레톤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderSkeleton}></div>
        <div className={styles.studiesGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.studyCardSkeleton}>
              <div className={styles.studyEmojiSkeleton}></div>
              <div className={styles.studyNameSkeleton}></div>
              <div className={styles.studyMetaSkeleton}></div>
              <div className={styles.studyActivitySkeleton}></div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 스켈레톤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderSkeleton}></div>
        <div className={styles.activitiesList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.activityItemSkeleton}>
              <div className={styles.badgeSkeleton}></div>
              <div className={styles.contentSkeleton}></div>
              <div className={styles.timeSkeleton}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

