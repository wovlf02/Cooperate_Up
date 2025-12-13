'use client';

import { useRouter } from 'next/navigation';
import styles from './SettingsHeader.module.css';

export default function SettingsHeader({ hasChanges, onSave }) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← 뒤로
      </button>
      <div className={styles.headerInfo}>
        <h1 className={styles.title}>⚙️ 설정</h1>
        <p className={styles.subtitle}>앱 환경을 맞춤 설정하세요</p>
      </div>
      {hasChanges && (
        <button onClick={onSave} className={styles.saveButton}>
          저장
        </button>
      )}
    </header>
  );
}

