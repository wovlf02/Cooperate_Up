import styles from '@/styles/landing/features.module.css'

export default function Features() {
  const features = [
    {
      icon: '💬',
      title: '실시간 채팅',
      description: '스터디원과 즉시 소통하며 질문하고 답변받으세요'
    },
    {
      icon: '📹',
      title: '화상 스터디',
      description: '얼굴을 보며 함께 공부하고 화면을 공유하세요'
    },
    {
      icon: '📁',
      title: '파일 공유',
      description: '학습 자료를 쉽게 공유하고 다운로드하세요'
    },
    {
      icon: '📅',
      title: '일정 관리',
      description: '모임 일정을 한눈에 확인하고 관리하세요'
    },
    {
      icon: '✅',
      title: '할 일 관리',
      description: '목표를 체계적으로 설정하고 달성하세요'
    },
    {
      icon: '🔔',
      title: '알림 시스템',
      description: '중요한 소식을 실시간으로 받아보세요'
    }
  ]

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>CoUp의 핵심 기능</h2>
          <p className={styles.description}>모든 학습 도구가 한곳에</p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
