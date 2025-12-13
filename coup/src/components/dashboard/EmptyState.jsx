import Link from 'next/link'
import styles from './EmptyState.module.css'

export default function EmptyState({
  type = 'studies',
  icon,
  title,
  description,
  actionText,
  actionHref
}) {
  const content = {
    studies: {
      emoji: '📚',
      title: '아직 참여 중인 스터디가 없어요',
      description: '지금 바로 스터디를 찾아보세요!',
      buttonText: '스터디 둘러보기',
      link: '/studies/explore'
    },
    activities: {
      emoji: '🔔',
      title: '아직 활동 내역이 없어요',
      description: '스터디에 참여하고 활동을 시작해보세요!',
      buttonText: '스터디 찾기',
      link: '/studies/explore'
    },
    notifications: {
      emoji: '📭',
      title: '알림이 없습니다',
      description: '새로운 알림이 오면 여기에 표시됩니다',
      buttonText: null,
      link: null
    }
  }

  const data = content[type] || content.studies

  // 커스텀 props가 있으면 우선 사용
  const displayEmoji = icon || data.emoji
  const displayTitle = title || data.title
  const displayDescription = description || data.description

  // actionText/actionHref가 명시적으로 전달된 경우만 사용, 그렇지 않으면 기본값 사용
  // 단, icon/title/description 같은 커스텀 props가 전달되었다면 버튼은 표시하지 않음
  const hasCustomProps = icon || title || description
  const displayButtonText = actionText || (hasCustomProps ? null : data.buttonText)
  const displayLink = actionHref || (hasCustomProps ? null : data.link)

  return (
    <div className={styles.emptyState}>
      <div className={styles.emoji}>{displayEmoji}</div>
      <h3 className={styles.title}>{displayTitle}</h3>
      <p className={styles.description}>{displayDescription}</p>
      {displayButtonText && displayLink && (
        <Link href={displayLink} className={styles.button}>
          {displayButtonText} →
        </Link>
      )}
    </div>
  )
}

