'use client'

import { useRouter } from 'next/navigation'
import styles from './Widget.module.css'

export default function MyActivityWidget({ studyId }) {
  const router = useRouter()

  // TODO: 실제 데이터는 API에서 가져오기
  const myActivity = {
    attendance: { current: 5, total: 7 },
    completedTasks: 8,
    chatMessages: 42
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        📈 나의 활동
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.activitySection}>
          <div className={styles.activityWeek}>
            이번 주
          </div>
          <div className={styles.activityList}>
            <div>• 출석: {myActivity.attendance.current}/{myActivity.attendance.total}일</div>
            <div>• 완료 할일: {myActivity.completedTasks}개</div>
            <div>• 채팅 메시지: {myActivity.chatMessages}개</div>
          </div>
        </div>

        <a
          href={`/studies/${studyId}/my-stats`}
          className={styles.linkButton}
        >
          내 통계 자세히 →
        </a>
      </div>
    </div>
  )
}
