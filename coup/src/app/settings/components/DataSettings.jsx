// 데이터 및 저장공간 설정
'use client';

import { useState, useMemo } from 'react';
import styles from './DataSettings.module.css';

// 초기 데이터 계산
function getInitialData() {
  if (typeof window === 'undefined') {
    return { cacheSize: 0, cookieCount: 0, storageSize: 0 };
  }

  // 쿠키 개수
  const cookies = document.cookie.split(';').filter(c => c.trim());
  const cookieCount = cookies.length;

  // 로컬 저장소 크기
  let total = 0;
  for (let key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length + key.length;
    }
  }
  const storageSize = parseFloat((total / 1024 / 1024).toFixed(2));

  return { cacheSize: 0, cookieCount, storageSize };
}

export default function DataSettings() {
  const initialData = useMemo(() => getInitialData(), []);

  const [cacheSize, setCacheSize] = useState(initialData.cacheSize);
  const [cookieCount, setCookieCount] = useState(initialData.cookieCount);
  const [storageSize, setStorageSize] = useState(initialData.storageSize);

  const handleClearCache = async () => {
    if (confirm('캐시를 지우시겠습니까?')) {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
        setCacheSize(0);
        alert('캐시가 삭제되었습니다.');
      }
    }
  };

  const handleClearCookies = () => {
    if (confirm('모든 쿠키를 삭제하시겠습니까?\n로그인 정보도 삭제될 수 있습니다.')) {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      setCookieCount(0);
      alert('쿠키가 삭제되었습니다.');
    }
  };

  const handleClearStorage = () => {
    if (confirm('로컬 저장소를 비우시겠습니까?\n저장된 설정도 삭제됩니다.')) {
      localStorage.clear();
      setStorageSize(0);
      alert('로컬 저장소가 삭제되었습니다.');
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ 경고: 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
        handleClearCache();
        handleClearCookies();
        handleClearStorage();
        alert('모든 데이터가 삭제되었습니다.');
      }
    }
  };

  const cachePercent = Math.min((cacheSize / 100) * 100, 100);
  const cookiePercent = Math.min((cookieCount / 50) * 100, 100);
  const storagePercent = Math.min((storageSize / 50) * 100, 100);

  return (
    <div className={styles.container}>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📦 캐시</h3>
        <p className={styles.usage}>사용 중: {cacheSize} MB / 100 MB</p>
        <button onClick={handleClearCache} className={styles.actionButton}>
          캐시 지우기
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🍪 쿠키</h3>
        <p className={styles.usage}>저장된 쿠키: {cookieCount}개</p>
        <button onClick={handleClearCookies} className={styles.actionButton}>
          쿠키 관리
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💾 로컬 저장소</h3>
        <p className={styles.usage}>사용 중: {storageSize} MB / 50 MB</p>
        <button onClick={handleClearStorage} className={styles.actionButton}>
          저장소 비우기
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 사용 현황</h3>
        <div className={styles.chartContainer}>
          <div className={styles.chartItem}>
            <div className={styles.chartLabel}>
              <span>캐시</span>
              <span className={styles.chartPercent}>{cachePercent.toFixed(0)}%</span>
            </div>
            <div className={styles.chartBar}>
              <div
                className={styles.chartFill}
                style={{ width: `${cachePercent}%`, backgroundColor: '#3B82F6' }}
              />
            </div>
          </div>

          <div className={styles.chartItem}>
            <div className={styles.chartLabel}>
              <span>쿠키</span>
              <span className={styles.chartPercent}>{cookiePercent.toFixed(0)}%</span>
            </div>
            <div className={styles.chartBar}>
              <div
                className={styles.chartFill}
                style={{ width: `${cookiePercent}%`, backgroundColor: '#10B981' }}
              />
            </div>
          </div>

          <div className={styles.chartItem}>
            <div className={styles.chartLabel}>
              <span>로컬 저장소</span>
              <span className={styles.chartPercent}>{storagePercent.toFixed(0)}%</span>
            </div>
            <div className={styles.chartBar}>
              <div
                className={styles.chartFill}
                style={{ width: `${storagePercent}%`, backgroundColor: '#F59E0B' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <button onClick={handleClearAll} className={styles.dangerButton}>
          ⚠️ 모든 데이터 삭제
        </button>
        <p className={styles.warning}>
          이 작업은 되돌릴 수 없습니다. 신중하게 결정하세요.
        </p>
      </div>
    </div>
  );
}

