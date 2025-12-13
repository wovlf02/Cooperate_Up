import styles from './StudiesSkeleton.module.css'

export default function StudiesSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.studiesGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className={styles.studyCard}>
            <div className={styles.emojiSkeleton}></div>
            <div className={styles.titleSkeleton}></div>
            <div className={styles.descriptionSkeleton}></div>
            <div className={styles.descriptionSkeleton} style={{ width: '80%' }}></div>
            <div className={styles.metaSkeleton}></div>
            <div className={styles.ownerSkeleton}></div>
            <div className={styles.tagsSkeleton}>
              <div className={styles.tagSkeleton}></div>
              <div className={styles.tagSkeleton}></div>
              <div className={styles.tagSkeleton}></div>
            </div>
            <div className={styles.buttonSkeleton}></div>
          </div>
        ))}
      </div>
    </div>
  )
}
