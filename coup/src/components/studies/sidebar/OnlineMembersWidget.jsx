'use client'

import styles from './Widget.module.css'

export default function OnlineMembersWidget({ studyId }) {
  // TODO: WebSocket으로 실시간 온라인 상태 가져오기
  const onlineMembers = [
    { id: 1, name: '김철수', role: 'OWNER', status: '채팅 중' },
    { id: 2, name: '이영희', role: 'ADMIN', status: '파일 탭' },
    { id: 3, name: '박민수', role: 'MEMBER', status: '캘린더 탭' }
  ]

  const totalMembers = { current: 12, max: 20 }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        👥 온라인 멤버 ({onlineMembers.length}명)
      </div>
      <div className={styles.widgetContent}>
        {onlineMembers.map(member => (
          <div key={member.id} className={styles.memberItem}>
            <div className={styles.onlineIndicator} />
            <div className={styles.memberInfo}>
              <div className={styles.memberHeader}>
                <span className={styles.memberName}>
                  {member.name}
                </span>
                {member.role === 'OWNER' && (
                  <span className={`${styles.badge} ${styles.badgePrimary}`}>
                    {member.role}
                  </span>
                )}
              </div>
              <div className={styles.memberStatus}>
                {member.status}
              </div>
            </div>
          </div>
        ))}

        <div className={styles.memberFooter}>
          <span className={styles.totalMembers}>
            📊 전체 멤버 ({totalMembers.current}/{totalMembers.max})
          </span>
          <a href={`/studies/${studyId}/members`} className={styles.linkButton}>
            전체보기 →
          </a>
        </div>
      </div>
    </div>
  )
}
