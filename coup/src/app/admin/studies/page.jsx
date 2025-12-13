/**
 * 관리자 - 스터디 목록 페이지
 * /admin/studies
 */

import StudyList from './_components/StudyList'
import styles from './page.module.css'

export default function AdminStudiesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>스터디 관리</h1>
          <p className={styles.description}>
            플랫폼의 모든 스터디를 조회하고 관리합니다
          </p>
        </div>
      </div>

      <StudyList />
    </div>
  )
}

