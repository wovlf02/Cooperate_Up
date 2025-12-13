// 고급 설정
'use client';

import styles from './AdvancedSettings.module.css';

export default function AdvancedSettings({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({
      ...settings,
      advanced: { ...settings.advanced, [field]: value }
    });
  };

  const handleExportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('설정이 내보내졌습니다.');
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          onUpdate(imported);
          localStorage.setItem('systemSettings', JSON.stringify(imported));
          alert('설정을 가져왔습니다. 페이지를 새로고침하세요.');
        } catch (error) {
          alert('설정 파일이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const copyDebugInfo = () => {
    const info = `
버전: 1.0.0
빌드: ${new Date().toISOString().split('T')[0]}
환경: ${process.env.NODE_ENV || 'production'}
브라우저: ${navigator.userAgent}
화면: ${window.screen.width}x${window.screen.height}
언어: ${navigator.language}
    `.trim();

    navigator.clipboard.writeText(info).then(() => {
      alert('디버그 정보가 클립보드에 복사되었습니다.');
    });
  };

  return (
    <div className={styles.container}>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>👨‍💻 개발자 모드</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.devMode ?? false}
              onChange={(e) => handleChange('devMode', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>개발자 모드 활성화</span>
              <p>개발자 도구 및 디버그 기능을 사용합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.consoleLogs ?? false}
              onChange={(e) => handleChange('consoleLogs', e.target.checked)}
              className={styles.checkbox}
              disabled={!settings.advanced?.devMode}
            />
            <div className={styles.checkboxLabel}>
              <span>콘솔 로그 표시</span>
              <p>브라우저 콘솔에 로그를 출력합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.networkLogs ?? false}
              onChange={(e) => handleChange('networkLogs', e.target.checked)}
              className={styles.checkbox}
              disabled={!settings.advanced?.devMode}
            />
            <div className={styles.checkboxLabel}>
              <span>네트워크 요청 표시</span>
              <p>API 요청 및 응답을 콘솔에 표시합니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🧪 실험적 기능</h3>
        <div className={styles.warning}>
          ⚠️ 실험적 기능은 불안정할 수 있습니다
        </div>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.betaFeatures ?? false}
              onChange={(e) => handleChange('betaFeatures', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>베타 기능 활성화</span>
              <p>출시 예정인 새로운 기능을 미리 사용합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.newUI ?? false}
              onChange={(e) => handleChange('newUI', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>새로운 UI 미리보기</span>
              <p>리뉴얼된 사용자 인터페이스를 사용합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.advanced?.experimentalAPI ?? false}
              onChange={(e) => handleChange('experimentalAPI', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>실험적 API 사용</span>
              <p>새로운 API 기능을 사용합니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🔧 디버그 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>버전</span>
            <span className={styles.infoValue}>1.0.0</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>빌드</span>
            <span className={styles.infoValue}>{new Date().toISOString().split('T')[0]}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>환경</span>
            <span className={styles.infoValue}>{process.env.NODE_ENV || 'production'}</span>
          </div>
        </div>
        <button onClick={copyDebugInfo} className={styles.actionButton}>
          📋 디버그 정보 복사
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🗄️ 백업 및 복원</h3>
        <div className={styles.buttonGroup}>
          <button onClick={handleExportSettings} className={styles.actionButton}>
            📤 설정 내보내기
          </button>
          <button onClick={handleImportSettings} className={styles.actionButton}>
            📥 설정 가져오기
          </button>
        </div>
        <p className={styles.hint}>
          설정을 JSON 파일로 저장하거나 불러올 수 있습니다
        </p>
      </div>
    </div>
  );
}

