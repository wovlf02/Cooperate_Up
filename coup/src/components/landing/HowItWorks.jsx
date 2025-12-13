import { Fragment } from 'react'
import styles from '@/styles/landing/how-it-works.module.css'

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: '가입하기',
      description: '소셜 로그인으로 빠르게 시작하세요'
    },
    {
      number: '2',
      title: '스터디 찾기',
      description: '관심사에 맞는 그룹을 찾아보세요'
    },
    {
      number: '3',
      title: '함께 성장하기',
      description: '목표를 달성하고 성장하세요'
    }
  ]

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>시작하기 쉬워요</h2>
          <p className={styles.description}>3단계로 바로 시작하세요</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <Fragment key={step.number}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.arrow}>→</div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
