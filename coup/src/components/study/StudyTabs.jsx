// 스터디 탭 네비게이션 컴포넌트
'use client';

import Link from 'next/link';
import styles from './StudyTabs.module.css';

export default function StudyTabs({ studyId, activeTab, userRole }) {
  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '일정', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' }, // 모든 멤버 접근 가능 (탈퇴 기능)
  ];

  return (
    <div className={styles.tabs}>
      {tabs
        .filter(tab => !tab.adminOnly || ['OWNER', 'ADMIN'].includes(userRole))
        .map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === activeTab ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
    </div>
  );
}

