// 개인정보 및 보안 설정
'use client';

import styles from './LanguageSettings.module.css';

export default function PrivacySettings({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({
      ...settings,
      privacy: { ...settings.privacy, [field]: value }
    });
  };

  return (
    <div className={styles.container}>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 데이터 수집</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.analytics ?? true}
              onChange={(e) => handleChange('analytics', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>사용 통계 수집 (익명)</span>
              <p>서비스 개선을 위해 익명 사용 통계를 수집합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.errorReports ?? true}
              onChange={(e) => handleChange('errorReports', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>오류 보고서 자동 전송</span>
              <p>오류 발생 시 자동으로 보고서를 전송합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.performanceData ?? false}
              onChange={(e) => handleChange('performanceData', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>성능 데이터 수집</span>
              <p>페이지 로딩 속도 등 성능 데이터를 수집합니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🍪 쿠키 정책</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="cookiePolicy"
              value="essential"
              checked={settings.privacy?.cookiePolicy === 'essential'}
              onChange={(e) => handleChange('cookiePolicy', e.target.value)}
              className={styles.radio}
            />
            <span>필수 쿠키만</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="cookiePolicy"
              value="functional"
              checked={(settings.privacy?.cookiePolicy ?? 'functional') === 'functional'}
              onChange={(e) => handleChange('cookiePolicy', e.target.value)}
              className={styles.radio}
            />
            <span>필수 + 기능 쿠키</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="cookiePolicy"
              value="all"
              checked={settings.privacy?.cookiePolicy === 'all'}
              onChange={(e) => handleChange('cookiePolicy', e.target.value)}
              className={styles.radio}
            />
            <span>모든 쿠키 허용</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🔒 개인정보 설정</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.publicProfile ?? true}
              onChange={(e) => handleChange('publicProfile', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>프로필을 다른 사용자에게 공개</span>
              <p>다른 사용자가 내 프로필을 볼 수 있습니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.publicActivity ?? false}
              onChange={(e) => handleChange('publicActivity', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>활동 내역 공개</span>
              <p>스터디 참여, 댓글 등 활동 내역을 공개합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.searchable ?? true}
              onChange={(e) => handleChange('searchable', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>검색 결과에 표시</span>
              <p>다른 사용자가 나를 검색할 수 있습니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🛡️ 보안</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.twoFactor ?? false}
              onChange={(e) => handleChange('twoFactor', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>2단계 인증 (추천)</span>
              <p>로그인 시 추가 인증 단계를 거칩니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.privacy?.loginAlerts ?? true}
              onChange={(e) => handleChange('loginAlerts', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>의심스러운 로그인 알림</span>
              <p>새로운 기기에서 로그인 시 알림을 받습니다</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

