# 🧩 프로필 컴포넌트

## 개요

사용자 프로필 표시 및 수정과 관련된 컴포넌트입니다.

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| `HeroProfile` | `HeroProfile.jsx` | 프로필 헤더 영역 |
| `QuickStats` | `QuickStats.jsx` | 빠른 통계 카드 |
| `ProfileSection` | `ProfileSection.jsx` | 프로필 정보 섹션 |
| `ProfileEditForm` | `ProfileEditForm.jsx` | 프로필 수정 폼 |
| `ActivityStats` | `ActivityStats.jsx` | 활동 통계 표시 |

---

## HeroProfile

### 경로

`src/components/my-page/HeroProfile.jsx`

### 설명

마이페이지 상단의 프로필 헤더 영역입니다. 아바타, 이름, 자기소개를 표시합니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | object | ✓ | 사용자 정보 |

### 사용 예시

```jsx
<HeroProfile user={user} />
```

### 내부 구조

```jsx
<div className={styles.heroProfile}>
  <div className={styles.avatar}>
    <Image src={user.avatar || defaultAvatar} alt="프로필" />
    <button className={styles.editAvatarBtn}>수정</button>
  </div>
  <div className={styles.info}>
    <h1 className={styles.name}>{user.name}</h1>
    <p className={styles.bio}>{user.bio || '자기소개가 없습니다.'}</p>
    <span className={styles.email}>{user.email}</span>
  </div>
</div>
```

---

## QuickStats

### 경로

`src/components/my-page/QuickStats.jsx`

### 설명

핵심 통계를 빠르게 보여주는 카드 그룹입니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `stats` | object | - | 통계 데이터 |
| `user` | object | - | 사용자 정보 (가입일) |

### 통계 항목

| 항목 | 데이터 경로 | 기본값 |
|------|-------------|--------|
| 참여 스터디 | `stats.total.studyCount` | 0 |
| 완료 할일 | `stats.total.completedTasks` | 0 |
| 출석률 | `stats.total.averageAttendance` | 0% |
| 가입 기간 | `stats.total.joinedDays` | 1일 |

### 사용 예시

```jsx
<QuickStats stats={userStats} user={user} />
```

---

## ProfileSection

### 경로

`src/components/my-page/ProfileSection.jsx`

### 설명

프로필 정보를 섹션 형태로 표시합니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✓ | 섹션 제목 |
| `children` | node | ✓ | 섹션 콘텐츠 |

### 사용 예시

```jsx
<ProfileSection title="기본 정보">
  <p>이름: {user.name}</p>
  <p>이메일: {user.email}</p>
</ProfileSection>
```

---

## ProfileEditForm

### 경로

`src/components/my-page/ProfileEditForm.jsx`

### 설명

프로필 수정 폼 컴포넌트입니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | object | ✓ | 현재 사용자 정보 |
| `onSave` | function | - | 저장 성공 콜백 |
| `onCancel` | function | - | 취소 콜백 |

### 내부 상태

```javascript
const [name, setName] = useState(user.name || '')
const [bio, setBio] = useState(user.bio || '')
const [avatar, setAvatar] = useState(user.avatar)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

### 저장 처리

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, avatar })
    })
    
    if (response.ok) {
      onSave?.()
    }
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### 사용 예시

```jsx
<ProfileEditForm 
  user={user}
  onSave={() => {
    queryClient.invalidateQueries(['me'])
    setIsEditing(false)
  }}
  onCancel={() => setIsEditing(false)}
/>
```

---

## ActivityStats

### 경로

`src/components/my-page/ActivityStats.jsx`

### 설명

사용자 활동 통계를 시각적으로 표시합니다.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `stats` | object | ✓ | 통계 데이터 |

### 표시 항목

```jsx
<div className={styles.activityStats}>
  <div className={styles.statItem}>
    <span className={styles.label}>이번 주 완료 할일</span>
    <span className={styles.value}>{stats.thisWeek.completedTasks}</span>
  </div>
  <div className={styles.statItem}>
    <span className={styles.label}>이번 주 공지</span>
    <span className={styles.value}>{stats.thisWeek.createdNotices}</span>
  </div>
  <div className={styles.statItem}>
    <span className={styles.label}>이번 주 파일</span>
    <span className={styles.value}>{stats.thisWeek.uploadedFiles}</span>
  </div>
  <div className={styles.statItem}>
    <span className={styles.label}>이번 주 채팅</span>
    <span className={styles.value}>{stats.thisWeek.chatMessages}</span>
  </div>
</div>
```

---

## 스타일 구조

### CSS 모듈

| 파일 | 컴포넌트 |
|------|---------|
| `HeroProfile.module.css` | HeroProfile |
| `QuickStats.module.css` | QuickStats |
| `ProfileSection.module.css` | ProfileSection |
| `ProfileEditForm.module.css` | ProfileEditForm |
| `ActivityStats.module.css` | ActivityStats |

### 공통 스타일 패턴

```css
.container {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.statItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
}

.label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

---

## 관련 문서

- [마이페이지 화면](./screens-my-page.md) - 전체 화면 구조
- [설정 컴포넌트](./components-settings.md) - 설정 관련
- [사용자 API](./api.md) - API 엔드포인트

