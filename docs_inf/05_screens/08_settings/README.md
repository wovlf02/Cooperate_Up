# 설정 화면 (Settings Screens) - Production Ready v2.0

## 📁 파일 구조

```
08_settings/
├── README.md                    # 개요 (이 파일)
├── settings-main.md             # 설정 메인 화면
├── profile.md                   # 프로필 수정 화면
├── notification-settings.md     # 알림 설정 화면
└── change-password.md           # 비밀번호 변경 화면
```

---

## 🎨 디자인 원칙

### 공통 UX 목표

- **명확한 그룹화**: 관련 설정 항목을 시각적으로 그룹화하여 탐색 용이
- **중앙 집중 레이아웃**: 폼 중심 화면(비밀번호 변경, 프로필 수정)은 중앙 정렬
- **즉각적 피드백**: 모든 토글/입력에 즉시 시각적 피드백
- **부드러운 전환**: 화면 간 자연스러운 애니메이션
- **접근성 우선**: 큰 터치 타겟, 명확한 레이블

### 레이아웃 유형

| 화면 유형 | 레이아웃 | 예시 |
|-----------|----------|------|
| 메뉴 리스트 | 전체 스크롤 | 설정 메인, 알림 설정 |
| 폼 입력 | 중앙 정렬 | 비밀번호 변경, 프로필 수정 |

---

## 화면 목록

| 화면 | 파일 | 설명 | 레이아웃 |
|------|------|------|---------|
| 설정 메인 | [settings-main.md](./settings-main.md) | 설정 메뉴 목록, 프로필 카드 | 전체 스크롤 |
| 프로필 수정 | [profile.md](./profile.md) | 사용자 정보 및 프로필 사진 수정 | 프로필 중심 |
| 알림 설정 | [notification-settings.md](./notification-settings.md) | 푸시 알림 ON/OFF 설정 | 전체 스크롤 |
| 비밀번호 변경 | [change-password.md](./change-password.md) | 비밀번호 변경, 강도 표시 | 중앙 정렬 |

---

## 네비게이션 흐름

```
┌─────────────────────────┐
│       설정 메인         │
│  [프로필 카드 표시]      │
└────────────┬────────────┘
             │
    ┌────────┼────────┬────────────┐
    ▼        ▼        ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
│프로필  │ │알림    │ │비밀번호  │ │관리자 설정 │
│수정    │ │설정    │ │변경      │ │(관리자만)  │
└────────┘ └────────┘ └──────────┘ └────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                   ┌──────────┐  ┌──────────┐  ┌──────────┐
                   │근무자    │  │승인요청  │  │급여관리  │
                   │관리      │  │관리      │  │          │
                   └──────────┘  └──────────┘  └──────────┘
```

---

## 설정 그룹

### 🔔 알림 설정

| 설정 | 설명 | 기본값 |
|------|------|--------|
| 전체 알림 | 모든 알림 마스터 토글 | ON |
| 채팅 알림 | 새 메시지 알림 | ON |
| 공지사항 알림 | 새 공지 알림 | ON |
| 승인 결과 알림 | 근태 승인/거부 알림 | ON |
| 새 요청 알림 | 근무자 요청 알림 (관리자) | ON |

### 👤 계정

| 설정 | 설명 |
|------|------|
| 비밀번호 변경 | 현재 비밀번호 확인 후 새 비밀번호 설정 |
| 로그아웃 | 앱에서 로그아웃 |

### ⚙️ 관리자 전용

| 설정 | 설명 |
|------|------|
| 근무자 관리 | 근무자 목록, 초대, 삭제 |
| 승인 요청 관리 | 대기 중인 근태 요청 승인/거부 |
| 급여 관리 | 급여 설정, 정산 |
| 매장 위치 설정 | GPS 기반 출퇴근 인증 위치 설정 |

### ℹ️ 앱 정보

| 설정 | 설명 |
|------|------|
| 이용약관 | 서비스 이용약관 보기 |
| 개인정보처리방침 | 개인정보 처리방침 보기 |
| 앱 버전 | 현재 버전 및 업데이트 확인 |

---

## 공통 컴포넌트

### 1. Settings Group

```typescript
// 설정 그룹 헤더 + 아이템 컨테이너
<SettingsGroup title="알림" icon="🔔">
  <SettingsItem ... />
  <SettingsItem ... />
</SettingsGroup>
```

### 2. Settings Item

```typescript
// 네비게이션 타입
<SettingsItem 
  icon="🔐" 
  label="비밀번호 변경" 
  onPress={() => navigate('ChangePassword')} 
/

// 토글 타입
<SettingsItem 
  icon="🔔" 
  label="전체 알림" 
  type="toggle"
  value={isEnabled}
  onValueChange={setIsEnabled}
/>

// 값 표시 타입
<SettingsItem 
  icon="📱" 
  label="앱 버전" 
  value="v1.0.0"
/>
```

### 3. Profile Card

```typescript
// 설정 메인 상단의 프로필 카드
<ProfileCard
  name={user.name}
  email={user.email}
  profileImage={user.profileImage}
  role={user.role}
  onEditPress={() => navigate('Profile')}
/>
```

---

## 스타일 토큰

### 설정 아이템

```typescript
const settingsItemStyles = {
  height: ms(56),
  paddingHorizontal: spacing.space4,
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
};
```

### 설정 그룹

```typescript
const settingsGroupStyles = {
  marginTop: spacing.space6,
  headerIcon: { fontSize: ms(14) },
  headerTitle: typography.labelMedium,
  itemsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
};
```

---

## 접근성

모든 설정 화면은 다음 접근성 요구사항을 준수합니다:

- **역할 명시**: 토글은 `switch`, 네비게이션은 `button` 역할
- **레이블**: 모든 항목에 명확한 `accessibilityLabel`
- **힌트**: 동작을 설명하는 `accessibilityHint`
- **상태**: 토글 상태, 비활성화 상태 명시
- **터치 타겟**: 최소 44x44pt
