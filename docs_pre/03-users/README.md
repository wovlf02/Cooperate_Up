# 👤 사용자 도메인 개요

## 개요

사용자 프로필 관리, 마이페이지, 설정 등 사용자 관련 기능을 다루는 도메인입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 프로필 조회/수정 | 이름, 자기소개, 아바타 관리 |
| 통계 확인 | 스터디 수, 활동 지수, 할일 완료율 |
| 설정 관리 | 알림, 테마, 개인정보 설정 |
| 계정 관리 | 비밀번호 변경, 계정 삭제 |

---

## 관련 파일

### API

| 파일 | 경로 | 설명 |
|------|------|------|
| `profile/route.js` | `src/app/api/user/` | 프로필 조회/수정 |
| `stats/route.js` | `src/app/api/user/` | 통계 조회 |
| `route.js` | `src/app/api/auth/me/` | 현재 사용자 정보 |

### 페이지

| 파일 | 경로 | 설명 |
|------|------|------|
| `page.jsx` | `src/app/me/` | 마이페이지 |
| `page.jsx` | `src/app/settings/` | 설정 페이지 |
| `page.jsx` | `src/app/user/[id]/` | 사용자 프로필 (공개) |

### 컴포넌트

| 위치 | 설명 |
|------|------|
| `src/components/my-page/` | 마이페이지 컴포넌트 |

---

## 컴포넌트 구조

```
my-page/
├── HeroProfile.jsx          # 프로필 헤더 (아바타, 이름, 소개)
├── QuickStats.jsx           # 빠른 통계 카드
├── TabNavigation.jsx        # 탭 네비게이션
├── OverviewTab.jsx          # 개요 탭
├── StudiesTab.jsx           # 스터디 탭
├── SettingsTab.jsx          # 설정 탭
├── ProfileEditForm.jsx      # 프로필 수정 폼
├── ProfileSection.jsx       # 프로필 섹션
├── MyStudiesList.jsx        # 내 스터디 목록
├── ActivityStats.jsx        # 활동 통계
├── AccountActions.jsx       # 계정 관리 액션
├── DeleteAccountModal.jsx   # 계정 삭제 모달
├── LoadingState.jsx         # 로딩 상태
└── ErrorState.jsx           # 에러 상태
```

---

## 데이터 흐름

### 마이페이지 데이터 로드

```
1. 페이지 마운트
2. useMe() → /api/auth/me → 사용자 정보
3. useMyStudies() → /api/my-studies → 참여 스터디 목록
4. useUserStats() → /api/user/stats → 통계 정보
5. 컴포넌트 렌더링
```

### 프로필 수정 흐름

```
1. 폼 입력
2. PUT /api/user/profile
3. DB 업데이트
4. 캐시 무효화
5. UI 업데이트
```

---

## 관련 문서

- [API](./api.md) - 사용자 관련 API
- [마이페이지 화면](./screens-my-page.md) - 화면 레이아웃
- [프로필 컴포넌트](./components-profile.md) - 프로필 관련 컴포넌트
- [설정 컴포넌트](./components-settings.md) - 설정 관련 컴포넌트
- [헬퍼](./helpers.md) - 유틸리티 함수

