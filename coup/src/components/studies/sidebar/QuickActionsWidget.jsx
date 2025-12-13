'use client'

import { useRouter } from 'next/navigation'
import styles from './Widget.module.css'

export default function QuickActionsWidget({ studyId }) {
  const router = useRouter()
  const isAdmin = false // TODO: 실제 권한 체크

  const actions = [
    {
      label: '💬 채팅',
      action: () => router.push(`/studies/${studyId}/chat`)
    },
    {
      label: '📹 화상',
      action: () => window.open(`/studies/${studyId}/video-call`, '_blank')
    },
    {
      label: '📤 초대',
      action: () => {
        // TODO: 초대 모달 열기
        alert('초대 기능 구현 예정')
      }
    },
    {
      label: '📊 통계',
      action: () => router.push(`/studies/${studyId}/stats`)
    }
  ]

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        ⚡ 빠른 액션
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.buttonGroup}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={styles.actionButton}
            >
              {action.label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() => router.push(`/studies/${studyId}/settings`)}
            className={`${styles.actionButton} ${styles.secondary} ${styles.fullWidthButton}`}
          >
            ⚙️ 설정
          </button>
        )}
      </div>
    </div>
  )
}
