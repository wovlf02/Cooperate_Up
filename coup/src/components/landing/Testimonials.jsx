import styles from '@/styles/landing/testimonials.module.css'

export default function Testimonials() {
  const testimonials = [
    {
      quote: 'CoUp 덕분에 React를 체계적으로 공부할 수 있었어요. 스터디원들과 함께하니 포기하지 않고 끝까지 해낼 수 있었습니다!',
      name: '김민준',
      role: '프론트엔드 개발자',
      initial: '김'
    },
    {
      quote: '알고리즘 스터디에서 매일 문제를 풀고 리뷰하면서 실력이 많이 늘었어요. 화상 스터디 기능이 특히 좋아요!',
      name: '이서아',
      role: '취업 준비생',
      initial: '이'
    }
  ]

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>실제 사용자들의 이야기</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <p className={styles.quote}>"{testimonial.quote}"</p>
              
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={styles.star}>★</span>
                ))}
              </div>

              <div className={styles.author}>
                <div className={styles.avatar}>{testimonial.initial}</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
