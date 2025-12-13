'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/admin/ui/Card'
import styles from './QuickActions.module.css'

/**
 * QuickActions 컴포넌트
 * 빠른 작업 버튼들
 */
export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
      ),
      label: '사용자 추가',
      description: '새 사용자 등록',
      color: { bg: 'var(--pastel-purple-100)', fg: 'var(--pastel-purple-600)' },
      onClick: () => router.push('/admin/users/new'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
        </svg>
      ),
      label: '스터디 생성',
      description: '새 스터디 개설',
      color: { bg: 'var(--pastel-teal-100)', fg: 'var(--pastel-teal-600)' },
      onClick: () => router.push('/admin/studies/new'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      label: '신고 처리',
      description: '대기중인 신고 확인',
      color: { bg: 'var(--pastel-orange-100)', fg: 'var(--pastel-orange-600)' },
      onClick: () => router.push('/admin/reports'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z" clipRule="evenodd" />
        </svg>
      ),
      label: '데이터 내보내기',
      description: 'CSV 파일 생성',
      color: { bg: 'var(--pastel-blue-100)', fg: 'var(--pastel-blue-600)' },
      onClick: () => alert('내보내기 기능 준비중'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      label: '설정',
      description: '시스템 설정 관리',
      color: { bg: 'var(--pastel-indigo-100)', fg: 'var(--pastel-indigo-600)' },
      onClick: () => router.push('/admin/settings'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM15 5.75a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5zm-8.5 6a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zm4.5-4a.75.75 0 00-1.5 0v6.5a.75.75 0 001.5 0v-6.5z" clipRule="evenodd" />
        </svg>
      ),
      label: '통계 보기',
      description: '상세 분석 데이터',
      color: { bg: 'var(--pastel-green-100)', fg: 'var(--pastel-green-600)' },
      onClick: () => router.push('/admin/analytics'),
    },
  ]

  return (
    <Card variant="outlined">
      <CardHeader>
        <h3>빠른 작업</h3>
      </CardHeader>
      <CardContent>
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={styles.actionButton}
              onClick={action.onClick}
              style={{
                '--action-bg': action.color.bg,
                '--action-fg': action.color.fg,
              }}
            >
              <div className={styles.actionIcon}>
                {action.icon}
              </div>
              <div className={styles.actionContent}>
                <div className={styles.actionLabel}>{action.label}</div>
                <div className={styles.actionDescription}>{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

