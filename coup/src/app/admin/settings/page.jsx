import SettingsForm from './_components/SettingsForm'
import SettingsHistory from './_components/SettingsHistory'
import styles from './page.module.css'

export const metadata = {
  title: '시스템 설정 | CoUp 관리자',
  description: '시스템 설정 관리'
}

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ 시스템 설정</h1>
        <p className={styles.description}>
          시스템 전반의 설정을 관리할 수 있습니다.
        </p>
      </div>

      <div className={styles.content}>
        <SettingsForm />
        <SettingsHistory />
      </div>
    </div>
  )
}

