# 공통 컴포넌트 (Common Components)

> **Production Ready v2.0** - 프로덕션 수준의 UI 컴포넌트 라이브러리

## 📁 파일 구조

```
00_common/
├── README.md              # 개요 (이 파일)
├── responsive.md          # 반응형 유틸리티
├── buttons.md             # 버튼 컴포넌트
├── inputs.md              # 입력 컴포넌트
├── cards.md               # 카드 컴포넌트
├── modals.md              # 모달/바텀시트 컴포넌트
├── feedback.md            # 피드백 컴포넌트 (Toast, Loading 등)
├── badges.md              # 뱃지 및 태그
├── navigation.md          # 네비게이션 컴포넌트
└── design-system.md       # 색상, 타이포그래피, 간격 시스템
```

---

## 🎯 컴포넌트 설계 원칙

### 1. 일관성 (Consistency)
- 모든 컴포넌트가 동일한 디자인 시스템을 따름
- 색상, 간격, 타이포그래피 통일

### 2. 접근성 (Accessibility)
- 모든 컴포넌트에 적절한 `accessibilityRole`, `accessibilityLabel` 적용
- 충분한 터치 영역 확보 (최소 44px)
- 색상 대비 WCAG AA 기준 충족

### 3. 반응형 (Responsive)
- 다양한 화면 크기에 적응
- 태블릿 및 소형 기기 대응

### 4. 성능 (Performance)
- 컴포넌트 메모이제이션
- 불필요한 리렌더링 방지

---

## 반응형 설계 원칙

모든 크기 값은 화면 크기에 따라 비율로 계산됩니다.

### 크기 단위 표기법

| 단위 | 설명 | 예시 |
|------|------|------|
| `wp(n)` | 화면 너비의 n% | `wp(4)` = 화면 너비의 4% |
| `hp(n)` | 화면 높이의 n% | `hp(6.5)` = 화면 높이의 6.5% |
| `ms(n)` | moderate scale | `ms(12)` = 적당히 스케일된 12 |
| `fs(n)` | font scale | `fs(16)` = 폰트 스케일 16 |

### 기준 디자인

```typescript
// iPhone 14 Pro 기준
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
```

### 비율 계산 함수

```typescript
const wp = (percentage: number) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage: number) => (percentage / 100) * SCREEN_HEIGHT;
const ms = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const fs = (size: number) => ms(size, 0.3);
```

---

## 핵심 레이아웃 상수

```typescript
export const layout = {
  screenPadding: wp(4),        // 화면 좌우 여백
  headerHeight: ms(56),         // 헤더 높이
  tabBarHeight: ms(80),         // 탭바 높이
  buttonHeight: ms(52),         // 버튼 높이
  inputHeight: ms(52),          // 입력 필드 높이
};

export const spacing = {
  space1: ms(4),
  space2: ms(8),
  space3: ms(12),
  space4: ms(16),
  space5: ms(20),
  space6: ms(24),
  space8: ms(32),
};

export const borderRadius = {
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  '2xl': ms(24),
  full: 9999,
};
```

---

## 컴포넌트 목록

| 파일 | 컴포넌트 | 설명 |
|------|---------|------|
| `buttons.md` | Button, IconButton, FAB | 다양한 버튼 컴포넌트 |
| `inputs.md` | TextInput, PasswordInput, TextArea, Select, Checkbox, Radio, Switch | 입력 컴포넌트 |
| `cards.md` | Card, ListItem, SummaryCard | 카드 컴포넌트 |
| `modals.md` | BottomSheet, AlertModal, FullScreenModal, ActionSheet | 모달 컴포넌트 |
| `feedback.md` | Toast, LoadingIndicator, EmptyState, Progress | 피드백 컴포넌트 |
| `badges.md` | Badge, Tag, StatusBadge | 뱃지/태그 컴포넌트 |
| `navigation.md` | Header, TabBar, SegmentedControl | 네비게이션 컴포넌트 |
