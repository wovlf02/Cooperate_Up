'use client'

import { useRouter } from 'next/navigation'
import styles from './Widget.module.css'

export default function UpcomingEventsWidget({ studyId }) {
  const router = useRouter()
  
  // TODO: 실제 데이터는 API에서 가져오기
  const upcomingEvents = [
    {
      id: 1,
      title: '주간 회의',
      date: '11/7 (목)',
      time: '14:00',
      dDay: 1
    },
    {
      id: 2,
      title: '과제 제출 마감',
      date: '11/10 (일)',
      time: '23:59',
      dDay: 4
    }
  ]

  if (upcomingEvents.length === 0) return null

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        📅 다가오는 일정
      </div>
      <div className={styles.widgetContent}>
        {upcomingEvents.map(event => (
          <div key={event.id} className={styles.eventItem}>
            <div className={styles.eventDate}>
              {event.date} {event.time}
            </div>
            <div className={styles.eventTitle}>
              {event.title} (D-{event.dDay})
            </div>
          </div>
        ))}

        <a 
          href={`/studies/${studyId}/calendar`}
          className={styles.linkButton}
        >
          캘린더 보기 →
        </a>
      </div>
    </div>
  )
}
