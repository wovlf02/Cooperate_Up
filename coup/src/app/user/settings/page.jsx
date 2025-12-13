// 설정 페이지 메인
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfileEdit from './components/ProfileEdit';
import PasswordChange from './components/PasswordChange';
import NotificationSettings from './components/NotificationSettings';
import ThemeSettings from './components/ThemeSettings';
import AccountDeletion from './components/AccountDeletion';
import styles from './page.module.css';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // 로그인 체크
  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const menuItems = [
    {
      id: 'account',
      label: '📱 계정',
      children: [
        { id: 'profile', label: '프로필 편집', icon: '👤' },
        { id: 'password', label: '비밀번호 변경', icon: '🔒' },
        { id: 'deletion', label: '계정 삭제', icon: '🗑️' },
      ]
    },
    {
      id: 'notifications',
      label: '🔔 알림',
      children: [
        { id: 'notification', label: '알림 설정', icon: '🔔' },
      ]
    },
    {
      id: 'appearance',
      label: '🎨 테마',
      children: [
        { id: 'theme', label: '화면 설정', icon: '🎨' },
      ]
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileEdit user={session?.user} />;
      case 'password':
        return <PasswordChange />;
      case 'deletion':
        return <AccountDeletion user={session?.user} />;
      case 'notification':
        return <NotificationSettings />;
      case 'theme':
        return <ThemeSettings />;
      default:
        return <ProfileEdit user={session?.user} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1 className={styles.title}>⚙️ 설정</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 좌측 사이드바 */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {menuItems.map((group) => (
              <div key={group.id} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>{group.label}</div>
                {group.children.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className={styles.navItemIcon}>{item.icon}</span>
                    <span className={styles.navItemLabel}>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* 우측 콘텐츠 */}
        <main className={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

