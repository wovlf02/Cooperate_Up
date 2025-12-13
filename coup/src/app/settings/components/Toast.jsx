// 토스트 알림 컴포넌트
'use client';

import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type];

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{message}</span>
      <button onClick={onClose} className={styles.closeButton}>✕</button>
    </div>
  );
}

