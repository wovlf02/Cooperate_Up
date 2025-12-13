# ⚙️ 설정 컴포넌트

## 개요

사용자 설정 및 계정 관리와 관련된 컴포넌트입니다.

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| `SettingsTab` | `SettingsTab.jsx` | 설정 탭 전체 |
| `AccountActions` | `AccountActions.jsx` | 계정 관리 액션 |
| `DeleteAccountModal` | `DeleteAccountModal.jsx` | 계정 삭제 확인 모달 |

---

## SettingsTab

### 경로

`src/components/my-page/SettingsTab.jsx`

### 설명

마이페이지 설정 탭의 전체 콘텐츠입니다.

### 구조

```jsx
<div className={styles.settingsTab}>
  <section className={styles.section}>
    <h2>프로필 수정</h2>
    <ProfileEditForm user={user} onSave={handleSave} />
  </section>
  
  <section className={styles.section}>
    <h2>계정 관리</h2>
    <AccountActions />
  </section>
</div>
```

### 내부 상태

```javascript
const [isEditing, setIsEditing] = useState(false)
const [showDeleteModal, setShowDeleteModal] = useState(false)
```

---

## AccountActions

### 경로

`src/components/my-page/AccountActions.jsx`

### 설명

비밀번호 변경, 계정 삭제 등 계정 관련 액션 버튼 그룹입니다.

### 액션 목록

| 액션 | 설명 |
|------|------|
| 비밀번호 변경 | 비밀번호 변경 모달 열기 |
| 계정 삭제 | 계정 삭제 확인 모달 열기 |

### 구조

```jsx
<div className={styles.accountActions}>
  <button 
    className={styles.actionButton}
    onClick={() => setShowPasswordModal(true)}
  >
    <LockIcon />
    비밀번호 변경
  </button>
  
  <button 
    className={`${styles.actionButton} ${styles.danger}`}
    onClick={() => setShowDeleteModal(true)}
  >
    <TrashIcon />
    계정 삭제
  </button>
</div>
```

---

## DeleteAccountModal

### 경로

`src/components/my-page/DeleteAccountModal.jsx`

### 설명

계정 삭제 전 확인을 받는 모달입니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✓ | 모달 표시 여부 |
| `onClose` | function | ✓ | 닫기 콜백 |
| `onConfirm` | function | ✓ | 삭제 확인 콜백 |

### 구조

```jsx
<Modal isOpen={isOpen} onClose={onClose}>
  <div className={styles.deleteModal}>
    <h2>⚠️ 계정 삭제</h2>
    <p>정말로 계정을 삭제하시겠습니까?</p>
    <p className={styles.warning}>
      이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
    </p>
    
    <div className={styles.confirmInput}>
      <label>확인을 위해 "삭제합니다"를 입력하세요:</label>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="삭제합니다"
      />
    </div>
    
    <div className={styles.actions}>
      <button onClick={onClose} className={styles.cancelBtn}>
        취소
      </button>
      <button 
        onClick={onConfirm}
        disabled={confirmText !== '삭제합니다' || loading}
        className={styles.deleteBtn}
      >
        {loading ? '삭제 중...' : '계정 삭제'}
      </button>
    </div>
  </div>
</Modal>
```

### 내부 상태

```javascript
const [confirmText, setConfirmText] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

### 삭제 처리

```javascript
const handleDelete = async () => {
  if (confirmText !== '삭제합니다') return
  
  setLoading(true)
  try {
    await fetch('/api/user/delete', { method: 'DELETE' })
    signOut({ callbackUrl: '/sign-in' })
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

---

## 탭 컴포넌트

### TabNavigation

### 경로

`src/components/my-page/TabNavigation.jsx`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activeTab` | string | ✓ | 현재 활성 탭 |
| `onTabChange` | function | ✓ | 탭 변경 콜백 |

### 탭 목록

```javascript
const tabs = [
  { id: 'overview', label: '개요', icon: '📊' },
  { id: 'studies', label: '스터디', icon: '📚' },
  { id: 'settings', label: '설정', icon: '⚙️' },
]
```

### 구조

```jsx
<nav className={styles.tabNavigation}>
  {tabs.map(tab => (
    <button
      key={tab.id}
      className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
      onClick={() => onTabChange(tab.id)}
    >
      <span className={styles.icon}>{tab.icon}</span>
      <span className={styles.label}>{tab.label}</span>
    </button>
  ))}
</nav>
```

---

## 스타일 구조

### CSS 모듈

| 파일 | 컴포넌트 |
|------|---------|
| `SettingsTab.module.css` | SettingsTab |
| `AccountActions.module.css` | AccountActions |
| `DeleteAccountModal.module.css` | DeleteAccountModal |
| `TabNavigation.module.css` | TabNavigation |

### 공통 스타일 패턴

```css
/* 섹션 */
.section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 액션 버튼 */
.actionButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.actionButton:hover {
  background: var(--bg-hover);
}

.actionButton.danger {
  color: var(--danger);
  border-color: var(--danger);
}

.actionButton.danger:hover {
  background: var(--danger-light);
}
```

---

## 관련 문서

- [마이페이지 화면](./screens-my-page.md) - 전체 화면 구조
- [프로필 컴포넌트](./components-profile.md) - 프로필 관련
- [사용자 API](./api.md) - API 엔드포인트

