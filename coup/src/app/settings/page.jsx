// 시스템 설정 메인 페이지
'use client';

import { Suspense } from 'react';
import SettingsContent from './components/SettingsContent';
import styles from './page.module.css';

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>설정을 불러오는 중...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
