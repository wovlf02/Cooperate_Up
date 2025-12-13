'use client'

import styles from './LoadingState.module.css'

export default function LoadingState() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>프로필을 불러오는 중...</p>
    </div>
  )
}

