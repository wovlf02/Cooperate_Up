# 네비게이션 컴포넌트 (Navigation Components) - Production Ready v2.0

## 개요

프로덕션급 UX를 위한 네비게이션 컴포넌트입니다.
부드러운 전환, 제스처 지원, 인터랙티브 피드백 등 세련된 사용자 경험을 제공합니다.

---

## 🎨 디자인 원칙

### 네비게이션 UX

- **명확한 현재 위치**: 사용자가 어디에 있는지 항상 인지
- **예측 가능한 동작**: 일관된 제스처와 트랜지션
- **부드러운 전환**: 60fps 애니메이션
- **접근성 우선**: 스크린 리더, 터치 타겟 고려

---

## 1. Header (앱 헤더)

화면 상단 헤더 컴포넌트입니다.

### 기본 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (safe area)                                     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  ┌────┐                                     ┌────┐   │ │
│  │  │ ←  │        제목                         │ ⚙️ │   │ │
│  │  │    │    headlineSmall                    │    │   │ │
│  │  │    │    center or left                   │    │   │ │
│  │  └────┘                                     └────┘   │ │
│  │                                                      │ │
│  │  height: 56px (hp(7))                                │ │
│  │  paddingHorizontal: 16px                             │ │
│  │  backgroundColor: background (#FFFFFF)               │ │
│  │                                                      │ │
│  │  Border or Shadow (선택)                             │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 헤더 변형

```typescript
const headerVariants = {
  // 기본 (구분선)
  default: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  // 그림자
  elevated: {
    backgroundColor: colors.background,
    ...shadows.xs,
    borderBottomWidth: 0,
  },
  
  // 투명 (히어로 이미지 위)
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // 아이콘/텍스트 색상 반전
  },
  
  // 라지 타이틀 (iOS 스타일)
  largeTitle: {
    // 스크롤 시 축소
    collapsible: true,
    expandedHeight: ms(96),
    collapsedHeight: ms(56),
  },
  
  // 검색 헤더
  search: {
    // 검색 바 포함
    showSearchBar: true,
    searchPlaceholder: '검색',
  },
};
```

### Large Title Header

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  확장 상태 (스크롤 맨 위)                                  │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  ┌────┐                                     ┌────┐   │ │
│  │  │ ←  │                                     │ ⚙️ │   │ │
│  │  └────┘                                     └────┘   │ │
│  │                                                      │ │
│  │  설정                                                │ │
│  │  displayMedium (28px)                                │ │
│  │  paddingHorizontal: 20px                             │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  축소 상태 (스크롤 중)                                    │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ┌────┐        설정             ┌────┐               │ │
│  │  │ ←  │    headlineSmall (18px)  │ ⚙️ │               │ │
│  │  └────┘                         └────┘               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스크롤 연동 애니메이션

```typescript
// Large Title 축소 애니메이션
const scrollAnimation = {
  // 제목 크기
  titleSize: {
    expanded: fs(28),
    collapsed: fs(18),
    threshold: 50, // 스크롤 픽셀
  },
  
  // 헤더 높이
  headerHeight: {
    expanded: ms(96),
    collapsed: ms(56),
  },
  
  // 블러 효과 (iOS)
  blur: {
    from: 0,
    to: 20,
    threshold: 30,
  },
  
  // 보간
  interpolation: {
    inputRange: [0, 50],
    outputRange: [28, 18],
    extrapolate: 'clamp',
  },
};
```

### 스타일 스펙

```typescript
const headerStyles = {
  container: {
    height: ms(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.background,
  },
  
  leftButton: {
    width: ms(44),
    height: ms(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: ms(-8), // 시각적 정렬
  },
  
  title: {
    flex: 1,
    ...typography.headlineSmall,
    color: colors.textPrimary,
    textAlign: 'center', // or 'left'
    marginHorizontal: space2,
  },
  
  rightButton: {
    width: ms(44),
    height: ms(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(-8),
  },
  
  icon: {
    size: ms(24),
    color: colors.textPrimary,
  },
};
```

### Props Interface

```typescript
interface HeaderProps {
  // 제목
  title?: string;
  subtitle?: string;
  titleAlign?: 'left' | 'center';
  
  // 왼쪽 요소
  showBack?: boolean;
  onBack?: () => void;
  leftIcon?: IconName;
  leftElement?: ReactNode;
  
  // 오른쪽 요소
  rightIcon?: IconName;
  rightElement?: ReactNode;
  rightActions?: Array<{
    icon: IconName;
    onPress: () => void;
    badge?: number;
  }>;

  // 스타일
  variant?: 'default' | 'elevated' | 'transparent' | 'largeTitle';
  backgroundColor?: string;
  tintColor?: string; // 아이콘/텍스트 색상
  
  // 검색
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
}
```

---

## 2. Bottom Tab Bar

하단 네비게이션 탭 바입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │                                                       │ │
│ │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │ │
│ │  │     │  │     │  │     │  │     │  │     │         │ │
│ │  │ 🏠  │  │ ⏰  │  │ 📅  │  │ 📋  │  │ ⚙️  │         │ │
│ │  │     │  │     │  │     │  │     │  │     │         │ │
│ │  │ 홈  │  │출퇴근│  │캘린더│  │체크 │  │설정 │         │ │
│ │  │     │  │ (3) │  │     │  │     │  │     │         │ │
│ │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘         │ │
│ │                                                       │ │
│ │  height: 64px + safeAreaBottom                        │ │
│ │  각 탭 width: 균등 분할                               │ │
│ │  backgroundColor: background                          │ │
│ │                                                       │ │
│ │  Shadow or Border (상단)                              │ │
│ │                                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│ │ Safe Area Bottom                                      │ │
└───────────────────────────────────────────────────────────┘
```

### 탭 아이템 상세

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  비활성 탭              활성 탭                           │
│                                                           │
│  ┌─────────┐            ┌─────────┐                      │
│  │         │            │         │                      │
│  │   📋    │            │   📋    │  아이콘: brand500    │
│  │  gray   │            │  brand  │  (fill 스타일)       │
│  │         │            │    ●    │  indicator dot      │
│  │  체크   │            │  체크   │  라벨: brand500      │
│  │  gray   │            │  brand  │                      │
│  │         │            │         │                      │
│  └─────────┘            └─────────┘                      │
│                                                           │
│  iconSize: 24px                                           │
│  labelSize: 11px                                          │
│  gap: 4px                                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const tabBarStyles = {
  container: {
    flexDirection: 'row',
    height: ms(64) + safeAreaBottom,
    paddingTop: space2,
    paddingBottom: safeAreaBottom + space1,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    // 또는 그림자
    // ...shadows.sm,
  },
  
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: space1,
  },
  
  tabActive: {
    // 활성 탭 스타일
  },
  
  icon: {
    size: ms(24),
    marginBottom: ms(4),
  },
  
  iconActive: {
    color: colors.brand500,
  },
  
  iconInactive: {
    color: colors.neutral400,
  },
  
  label: {
    ...typography.captionSmall,
    fontWeight: '500',
  },
  
  labelActive: {
    color: colors.brand500,
  },
  
  labelInactive: {
    color: colors.neutral400,
  },
  
  // 활성 인디케이터 (점)
  indicator: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: colors.brand500,
    marginTop: ms(4),
  },
  
  // 뱃지
  badge: {
    position: 'absolute',
    top: ms(-2),
    right: ms(-8),
    minWidth: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
};
```

### 애니메이션

```typescript
// 탭 전환 애니메이션
const tabAnimation = {
  // 아이콘 바운스
  iconBounce: {
    from: { scale: 1 },
    to: { scale: 1.15 },
    return: { scale: 1 },
    duration: 200,
    type: 'spring',
    damping: 10,
  },
  
  // 인디케이터 페이드
  indicator: {
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1 },
    duration: 150,
  },
  
  // 슬라이딩 인디케이터 (선택적)
  slidingIndicator: {
    // 바닥에 슬라이딩 바
    height: ms(3),
    translateX: 'animated',
    duration: 200,
    easing: 'easeInOut',
  },
};

// 햅틱 피드백
const tabHaptic = {
  onPress: () => Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Light
  ),
};
```

### Props Interface

```typescript
interface BottomTabBarProps {
  tabs: Array<{
    key: string;
    label: string;
    icon: IconName;
    activeIcon?: IconName; // fill 버전
    badge?: number;
    badgeDot?: boolean; // 숫자 없이 점만
  }>;
  
  activeTab: string;
  onTabPress: (key: string) => void;
  
  // 스타일
  variant?: 'default' | 'elevated' | 'floating';
  showLabels?: boolean;
  showIndicator?: boolean;
  indicatorType?: 'dot' | 'bar' | 'background';
  
  // 피드백
  hapticFeedback?: boolean;
}
```

---

## 3. Top Tab Bar (세그먼트)

상단 필터/세그먼트 탭입니다.

### 스크롤 탭

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  [ 전체 ]   안읽음 (3)    중요    ➜ 스크롤 가능      │ │
│  │   ━━━━━                                              │ │
│  │                                                      │ │
│  │  height: 44px                                        │ │
│  │  paddingHorizontal: screenPadding                    │ │
│  │  gap: 20px                                           │ │
│  │                                                      │ │
│  │  Active:                                             │ │
│  │    - color: brand500                                 │ │
│  │    - fontWeight: 600                                 │ │
│  │    - underline indicator                             │ │
│  │                                                      │ │
│  │  Inactive:                                           │ │
│  │    - color: neutral500                               │ │
│  │    - fontWeight: 400                                 │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 필 탭 (Pill Tabs)

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐       │ │
│  │  │  [전체]    │ │  안읽음    │ │   중요     │       │ │
│  │  │  brand bg  │ │  neutral   │ │  neutral   │       │ │
│  │  └────────────┘ └────────────┘ └────────────┘       │ │
│  │                                                      │ │
│  │  height: 36px                                        │ │
│  │  borderRadius: full (18px)                           │ │
│  │  gap: 8px                                            │ │
│  │                                                      │ │
│  │  Active:                                             │ │
│  │    - backgroundColor: brand500                       │ │
│  │    - color: white                                    │ │
│  │                                                      │ │
│  │  Inactive:                                           │ │
│  │    - backgroundColor: neutral100                     │ │
│  │    - color: neutral600                               │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const topTabStyles = {
  // 스크롤 탭 (underline)
  scrollTab: {
    container: {
      height: ms(44),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    
    tab: {
      paddingHorizontal: ms(4),
      paddingVertical: ms(12),
      marginHorizontal: ms(10),
    },
    
    label: {
      ...typography.titleSmall,
    },
    
    labelActive: {
      color: colors.brand500,
      fontWeight: '600',
    },
    
    labelInactive: {
      color: colors.textSecondary,
      fontWeight: '400',
    },
    
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: ms(2),
      backgroundColor: colors.brand500,
      borderRadius: ms(1),
    },
  },
  
  // 필 탭
  pillTab: {
    container: {
      flexDirection: 'row',
      padding: ms(4),
      backgroundColor: colors.neutral100,
      borderRadius: borderRadius.full,
    },
    
    tab: {
      flex: 1,
      height: ms(36),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.full,
    },
    
    tabActive: {
      backgroundColor: colors.brand500,
    },
    
    label: {
      ...typography.labelMedium,
    },
    
    labelActive: {
      color: colors.white,
    },
    
    labelInactive: {
      color: colors.textSecondary,
    },
  },
};
```

### 애니메이션

```typescript
// 인디케이터 슬라이드 (underline 스타일)
const indicatorAnimation = {
  // 위치 이동
  translateX: {
    duration: 200,
    easing: 'easeInOut',
  },
  
  // 너비 변경
  width: {
    duration: 200,
    easing: 'easeInOut',
  },
};

// 필 탭 배경 이동
const pillBackgroundAnimation = {
  type: 'spring',
  damping: 15,
  stiffness: 150,
};
```

---

## 4. Floating Tab Bar (플로팅)

화면 위에 떠있는 탭 바입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                                                           │
│                                                           │
│        ┌─────────────────────────────────────┐            │
│        │                                     │            │
│        │  🏠    ⏰    📅    📋    ⚙️        │            │
│        │                                     │            │
│        └─────────────────────────────────────┘            │
│                                                           │
│  position: absolute                                       │
│  bottom: hp(3) + safeAreaBottom                           │
│  alignSelf: center                                        │
│                                                           │
│  backgroundColor: white                                   │
│  borderRadius: full (28px)                                │
│  paddingHorizontal: 8px                                   │
│  height: 56px                                             │
│                                                           │
│  ⚡ Large shadow                                           │
│  ⚡ blur background (optional)                             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const floatingTabStyles = {
  container: {
    position: 'absolute',
    bottom: hp(3) + safeAreaBottom,
    alignSelf: 'center',
    flexDirection: 'row',
    height: ms(56),
    paddingHorizontal: space2,
    backgroundColor: colors.background,
    borderRadius: ms(28),
    ...shadows.lg,
  },
  
  tab: {
    width: ms(56),
    height: ms(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tabActive: {
    // 활성 배경 (원형)
    backgroundColor: colors.brand100,
    borderRadius: ms(28),
  },
  
  icon: {
    size: ms(24),
  },
  
  // 라벨 없음 (아이콘만)
};
```

---

## 5. Breadcrumb

경로 표시 컴포넌트입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  홈  >  설정  >  알림 설정                                 │
│                                                           │
│  - 현재 위치: bold, textPrimary                           │
│  - 이전 위치: regular, textSecondary, 터치 가능           │
│  - 구분자: >, neutral400                                  │
│                                                           │
│  fontSize: 13px (labelMedium)                             │
│  gap: 8px                                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 6. Stepper

단계 표시 컴포넌트입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ●━━━━━━━━●━━━━━━━━○━━━━━━━━○                             │
│  1        2        3        4                             │
│ 정보입력  인증    계약     완료                            │
│ completed current  upcoming upcoming                      │
│                                                           │
│  stepSize: 28px                                           │
│  lineHeight: 3px                                          │
│  gap: flexible (flex: 1)                                  │
│                                                           │
│  completed: brand500 (fill), brand500 line                │
│  current: brand500 (border), pulsing animation            │
│  upcoming: neutral300 (fill), neutral200 line             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 수직 Stepper

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ●━━ 1. 기본 정보 입력 ✓                                  │
│  ┃   이름, 연락처 입력 완료                               │
│  ┃                                                        │
│  ●━━ 2. 본인 인증                                         │
│  ┃   휴대폰 인증 진행 중                                  │
│  ┃                                                        │
│  ○━━ 3. 근로계약서 작성                                   │
│  ┃   아직 시작하지 않음                                   │
│  ┃                                                        │
│  ○━━ 4. 가입 완료                                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const stepperStyles = {
  // 수평
  horizontal: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    step: {
      alignItems: 'center',
    },
    
    stepCircle: {
      width: ms(28),
      height: ms(28),
      borderRadius: ms(14),
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    stepCompleted: {
      backgroundColor: colors.brand500,
    },
    
    stepCurrent: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.brand500,
    },
    
    stepUpcoming: {
      backgroundColor: colors.neutral200,
    },
    
    line: {
      flex: 1,
      height: ms(3),
      marginHorizontal: ms(4),
    },
    
    lineCompleted: {
      backgroundColor: colors.brand500,
    },
    
    lineUpcoming: {
      backgroundColor: colors.neutral200,
    },
    
    label: {
      ...typography.captionLarge,
      marginTop: ms(8),
    },
  },
  
  // 수직
  vertical: {
    container: {
      paddingLeft: space4,
    },
    
    step: {
      flexDirection: 'row',
      marginBottom: space6,
    },
    
    verticalLine: {
      width: ms(3),
      backgroundColor: colors.neutral200,
      marginLeft: ms(12),
      marginTop: ms(4),
      marginBottom: ms(4),
    },
    
    content: {
      marginLeft: space3,
      flex: 1,
    },
  },
};

// 현재 단계 펄스 애니메이션
const currentStepAnimation = {
  scale: {
    from: 1,
    to: 1.1,
    duration: 1000,
    repeat: -1,
    repeatReverse: true,
    easing: 'easeInOut',
  },
  
  borderColor: {
    from: colors.brand500,
    to: colors.brand300,
    duration: 1000,
    repeat: -1,
    repeatReverse: true,
  },
};
```

---

## 7. Page Indicator (Dots)

페이지/슬라이드 인디케이터입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│              ●    ○    ○    ○    ○                       │
│                                                           │
│  dotSize: 8px                                             │
│  gap: 8px                                                 │
│                                                           │
│  active: brand500                                         │
│  inactive: neutral300                                     │
│                                                           │
│  확장 스타일:                                             │
│              ━━━━   ○    ○    ○    ○                     │
│              width: 24px (active)                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const pageIndicatorStyles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(8),
  },
  
  // 기본 (원형)
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  
  dotActive: {
    backgroundColor: colors.brand500,
  },
  
  dotInactive: {
    backgroundColor: colors.neutral300,
  },
  
  // 확장 (활성 시 긴 바)
  expandable: {
    dotActive: {
      width: ms(24),
      borderRadius: ms(4),
    },
  },
  
  // 애니메이션
  animation: {
    width: {
      duration: 200,
      easing: 'easeOut',
    },
    opacity: {
      from: 0.5,
      to: 1,
    },
  },
};
```

---

## 8. 접근성

### 요구사항

```typescript
const navigationAccessibility = {
  // 탭 바
  tabBar: {
    accessibilityRole: 'tablist',
    tab: {
      accessibilityRole: 'tab',
      accessibilityState: {
        selected: boolean,
      },
      accessibilityHint: '두 번 탭하여 이동',
    },
  },
  
  // 헤더 뒤로가기
  backButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '뒤로 가기',
  },
  
  // 스테퍼
  stepper: {
    accessibilityRole: 'list',
    step: {
      accessibilityRole: 'listitem',
      accessibilityLabel: (step) => 
        `${step.number}단계: ${step.label}, ${step.status}`,
    },
  },
};
```

---

## 9. 전체 코드 예시

```typescript
// components/Navigation/BottomTabBar.tsx

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, shadows } from '@/styles/theme';
import { ms, hp } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Tab {
  key: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
}

interface BottomTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabPress(tab.key);
          }}
        />
      ))}
    </View>
  );
};

const TabItem: React.FC<{
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };
  
  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={animatedIconStyle}>
        <Icon
          name={isActive ? (tab.activeIcon || tab.icon) : tab.icon}
          size={ms(24)}
          color={isActive ? colors.brand500 : colors.neutral400}
        />
        {tab.badge && tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </Animated.View>
      
      <Text
        style={[
          styles.label,
          isActive ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {tab.label}
      </Text>
      
      {isActive && <View style={styles.indicator} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: ms(64),
    paddingTop: ms(8),
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.captionSmall,
    marginTop: ms(4),
  },
  labelActive: {
    color: colors.brand500,
    fontWeight: '600',
  },
  labelInactive: {
    color: colors.neutral400,
  },
  indicator: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: colors.brand500,
    marginTop: ms(4),
  },
  badge: {
    position: 'absolute',
    top: ms(-4),
    right: ms(-8),
    minWidth: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(4),
  },
  badgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
    fontSize: ms(10),
  },
});
```
