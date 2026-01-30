# 디자인 시스템 (Design System) - Production Ready v2.0

## 개요

프로덕션급 UX를 위한 현대적이고 세련된 디자인 시스템입니다.
토스, 카카오페이, 배달의민족, 당근마켓 등 국내 대표 앱들의 UX 패턴을 참고하여 설계되었습니다.

---

## 🎨 1. 컬러 시스템

### 1.1 브랜드 컬러 (Brand Colors)

| Name | Light Mode | Dark Mode | 용도 |
|------|------------|-----------|------|
| brand50 | `#F0F9FF` | `#0C1929` | 배경 (아주 연한) |
| brand100 | `#E0F2FE` | `#172554` | 배경 (연한) |
| brand200 | `#BAE6FD` | `#1E3A5F` | 배경 (활성) |
| brand300 | `#7DD3FC` | `#2563EB` | 보조 액센트 |
| brand400 | `#38BDF8` | `#3B82F6` | 호버/포커스 |
| **brand500** | `#0EA5E9` | `#60A5FA` | **메인 브랜드 컬러** |
| brand600 | `#0284C7` | `#93C5FD` | 활성 상태 |
| brand700 | `#0369A1` | `#BFDBFE` | 강조 텍스트 |
| brand800 | `#075985` | `#DBEAFE` | 진한 강조 |
| brand900 | `#0C4A6E` | `#EFF6FF` | 가장 진한 강조 |

### 1.2 뉴트럴 컬러 (Neutral Colors)

모던한 쿨그레이 기반의 뉴트럴 팔레트입니다.

| Name | Light Mode | Dark Mode | 용도 |
|------|------------|-----------|------|
| neutral50 | `#FAFAFA` | `#18181B` | 배경 (밝은) |
| neutral100 | `#F4F4F5` | `#27272A` | 배경/카드 |
| neutral200 | `#E4E4E7` | `#3F3F46` | 구분선/테두리 |
| neutral300 | `#D4D4D8` | `#52525B` | 비활성 테두리 |
| neutral400 | `#A1A1AA` | `#71717A` | 비활성 텍스트/아이콘 |
| neutral500 | `#71717A` | `#A1A1AA` | 보조 텍스트 |
| neutral600 | `#52525B` | `#D4D4D8` | 설명 텍스트 |
| neutral700 | `#3F3F46` | `#E4E4E7` | 본문 텍스트 |
| neutral800 | `#27272A` | `#F4F4F5` | 제목 텍스트 |
| neutral900 | `#18181B` | `#FAFAFA` | 강조 텍스트 |

### 1.3 시맨틱 컬러 (Semantic Colors)

| 상태 | Main | Light | Dark | 용도 |
|------|------|-------|------|------|
| Success | `#22C55E` | `#DCFCE7` | `#166534` | 성공, 완료, 승인 |
| Warning | `#F59E0B` | `#FEF3C7` | `#92400E` | 경고, 주의, 대기 |
| Error | `#EF4444` | `#FEE2E2` | `#B91C1C` | 에러, 삭제, 거부 |
| Info | `#3B82F6` | `#DBEAFE` | `#1D4ED8` | 정보, 알림 |

### 1.4 그라데이션 (Gradients)

```typescript
export const gradients = {
  // 브랜드 그라데이션 - 헤더, CTA 버튼에 사용
  brand: {
    colors: ['#0EA5E9', '#3B82F6'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // 프리미엄 그라데이션 - 중요 카드, 배지에 사용
  premium: {
    colors: ['#6366F1', '#8B5CF6'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  // 성공 그라데이션 - 완료 상태, 축하 메시지
  success: {
    colors: ['#22C55E', '#10B981'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  // 일몰 그라데이션 - 퇴근 관련
  sunset: {
    colors: ['#F97316', '#EF4444'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  // 배경 그라데이션 - 스플래시, 온보딩
  background: {
    colors: ['#F0F9FF', '#FFFFFF'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // 글래스 효과용
  glass: {
    colors: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
```

### 1.5 표면/배경 컬러 (Surface Colors)

| Name | Light Mode | Dark Mode | 용도 |
|------|------------|-----------|------|
| background | `#FFFFFF` | `#09090B` | 앱 기본 배경 |
| surface | `#FAFAFA` | `#18181B` | 섹션 배경 |
| surfaceElevated | `#FFFFFF` | `#27272A` | 카드, 모달 |
| surfaceOverlay | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | 오버레이 |

---

## 📐 2. 간격 시스템 (Spacing System)

8pt 그리드 기반의 일관된 간격 시스템입니다.

### 2.1 기본 간격 토큰

| Token | Value | 용도 |
|-------|-------|------|
| space0 | `0` | 없음 |
| space1 | `ms(4)` | 아이콘-텍스트 간격 |
| space2 | `ms(8)` | 요소 내부 간격 (좁은) |
| space3 | `ms(12)` | 요소 내부 간격 (기본) |
| space4 | `ms(16)` | 요소 간 간격 (좁은) |
| space5 | `ms(20)` | 요소 간 간격 (기본) |
| space6 | `ms(24)` | 섹션 내부 간격 |
| space8 | `ms(32)` | 섹션 간 간격 |
| space10 | `ms(40)` | 대형 섹션 간격 |
| space12 | `ms(48)` | 페이지 여백 |
| space16 | `ms(64)` | 특대형 간격 |

### 2.2 레이아웃 간격

```typescript
export const layout = {
  // 화면 좌우 패딩
  screenPadding: wp(5), // 20px @393
  
  // 카드 패딩
  cardPadding: {
    small: ms(12),
    medium: ms(16),
    large: ms(20),
  },
  
  // 섹션 간격
  sectionGap: hp(3), // 섹션 사이
  
  // 리스트 아이템 간격
  listItemGap: hp(1.5),
  
  // 버튼 그룹 간격
  buttonGap: ms(12),
  
  // 탭바 높이
  tabBarHeight: hp(7.5),
  
  // 헤더 높이
  headerHeight: hp(7),
};
```

---

## ✏️ 3. 타이포그래피 (Typography)

### 3.1 폰트 패밀리

```typescript
export const fontFamily = {
  // 시스템 기본 폰트
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
  }),
  
  // 가변 폰트 (권장)
  display: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
  }),
  
  text: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
  }),
  
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
  }),
};
```

### 3.2 타입 스케일 (Type Scale)

| Name | Size | Weight | LineHeight | LetterSpacing | 용도 |
|------|------|--------|------------|---------------|------|
| displayLarge | `fs(32)` | 700 | 1.2 | -0.5 | 대형 제목, 숫자 강조 |
| displayMedium | `fs(28)` | 700 | 1.25 | -0.5 | 페이지 제목 |
| displaySmall | `fs(24)` | 600 | 1.3 | -0.25 | 섹션 제목 |
| headlineLarge | `fs(22)` | 600 | 1.3 | 0 | 카드 제목 |
| headlineMedium | `fs(20)` | 600 | 1.35 | 0 | 서브 제목 |
| headlineSmall | `fs(18)` | 600 | 1.4 | 0 | 리스트 제목 |
| titleLarge | `fs(17)` | 600 | 1.4 | 0.1 | 버튼, 네비게이션 |
| titleMedium | `fs(16)` | 500 | 1.45 | 0.15 | 강조 본문 |
| titleSmall | `fs(15)` | 500 | 1.45 | 0.1 | 작은 제목 |
| bodyLarge | `fs(16)` | 400 | 1.5 | 0.5 | 본문 (기본) |
| bodyMedium | `fs(15)` | 400 | 1.5 | 0.25 | 본문 (서브) |
| bodySmall | `fs(14)` | 400 | 1.45 | 0.25 | 설명문 |
| labelLarge | `fs(14)` | 500 | 1.4 | 0.1 | 라벨, 버튼 (작은) |
| labelMedium | `fs(13)` | 500 | 1.35 | 0.5 | 뱃지, 캡션 |
| labelSmall | `fs(12)` | 500 | 1.35 | 0.5 | 타임스탬프 |
| captionLarge | `fs(12)` | 400 | 1.35 | 0.4 | 보조 정보 |
| captionSmall | `fs(11)` | 400 | 1.3 | 0.4 | 미니 텍스트 |

### 3.3 타이포그래피 코드

```typescript
// styles/typography.ts

import { fs } from '@/utils/responsive';

export const typography = {
  displayLarge: {
    fontSize: fs(32),
    fontWeight: '700',
    lineHeight: fs(38),
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: fs(28),
    fontWeight: '700',
    lineHeight: fs(35),
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: fs(24),
    fontWeight: '600',
    lineHeight: fs(31),
    letterSpacing: -0.25,
  },
  headlineLarge: {
    fontSize: fs(22),
    fontWeight: '600',
    lineHeight: fs(29),
  },
  headlineMedium: {
    fontSize: fs(20),
    fontWeight: '600',
    lineHeight: fs(27),
  },
  headlineSmall: {
    fontSize: fs(18),
    fontWeight: '600',
    lineHeight: fs(25),
  },
  titleLarge: {
    fontSize: fs(17),
    fontWeight: '600',
    lineHeight: fs(24),
    letterSpacing: 0.1,
  },
  titleMedium: {
    fontSize: fs(16),
    fontWeight: '500',
    lineHeight: fs(23),
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: fs(15),
    fontWeight: '500',
    lineHeight: fs(22),
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: fs(16),
    fontWeight: '400',
    lineHeight: fs(24),
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: fs(15),
    fontWeight: '400',
    lineHeight: fs(22),
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: fs(14),
    fontWeight: '400',
    lineHeight: fs(20),
    letterSpacing: 0.25,
  },
  labelLarge: {
    fontSize: fs(14),
    fontWeight: '500',
    lineHeight: fs(20),
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: fs(13),
    fontWeight: '500',
    lineHeight: fs(18),
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: fs(12),
    fontWeight: '500',
    lineHeight: fs(16),
    letterSpacing: 0.5,
  },
  captionLarge: {
    fontSize: fs(12),
    fontWeight: '400',
    lineHeight: fs(16),
    letterSpacing: 0.4,
  },
  captionSmall: {
    fontSize: fs(11),
    fontWeight: '400',
    lineHeight: fs(14),
    letterSpacing: 0.4,
  },
};
```

---

## 🔲 4. 그림자 시스템 (Shadow System)

### 4.1 Elevation 레벨

| Level | iOS Shadow | Android Elevation | 용도 |
|-------|------------|-------------------|------|
| none | - | 0 | 평평한 요소 |
| xs | 0 1px 2px rgba(0,0,0,0.05) | 1 | 미묘한 깊이 |
| sm | 0 1px 3px rgba(0,0,0,0.1) | 2 | 카드 기본 |
| md | 0 4px 6px rgba(0,0,0,0.1) | 4 | 호버된 카드 |
| lg | 0 10px 15px rgba(0,0,0,0.1) | 8 | 드롭다운, 팝오버 |
| xl | 0 20px 25px rgba(0,0,0,0.1) | 12 | 모달 |
| 2xl | 0 25px 50px rgba(0,0,0,0.2) | 16 | 대화상자 |

### 4.2 그림자 코드

```typescript
// styles/shadows.ts

import { Platform } from 'react-native';
import { ms } from '@/utils/responsive';

export const shadows = {
  none: {},
  
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(1) },
      shadowOpacity: 0.05,
      shadowRadius: ms(2),
    },
    android: { elevation: 1 },
  }),
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(1) },
      shadowOpacity: 0.1,
      shadowRadius: ms(3),
    },
    android: { elevation: 2 },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(4) },
      shadowOpacity: 0.1,
      shadowRadius: ms(6),
    },
    android: { elevation: 4 },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(10) },
      shadowOpacity: 0.1,
      shadowRadius: ms(15),
    },
    android: { elevation: 8 },
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(20) },
      shadowOpacity: 0.1,
      shadowRadius: ms(25),
    },
    android: { elevation: 12 },
  }),
  
  // 컬러 그림자 (브랜드)
  brand: Platform.select({
    ios: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: ms(4) },
      shadowOpacity: 0.3,
      shadowRadius: ms(8),
    },
    android: { elevation: 6 },
  }),
  
  // 컬러 그림자 (성공)
  success: Platform.select({
    ios: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: ms(4) },
      shadowOpacity: 0.3,
      shadowRadius: ms(8),
    },
    android: { elevation: 6 },
  }),
  
  // 컬러 그림자 (에러)
  error: Platform.select({
    ios: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: ms(4) },
      shadowOpacity: 0.3,
      shadowRadius: ms(8),
    },
    android: { elevation: 6 },
  }),
};
```

---

## 🔄 5. 모서리 반경 (Border Radius)

| Token | Value | 용도 |
|-------|-------|------|
| none | 0 | 각진 요소 |
| xs | `ms(4)` | 태그, 작은 뱃지 |
| sm | `ms(8)` | 작은 버튼, 칩 |
| md | `ms(12)` | 카드, 버튼 |
| lg | `ms(16)` | 큰 카드, 모달 |
| xl | `ms(20)` | 바텀시트 |
| 2xl | `ms(24)` | 대형 모달 |
| full | 9999 | 원형, 필 모양 |

```typescript
export const borderRadius = {
  none: 0,
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  '2xl': ms(24),
  full: 9999,
};
```

---

## 🎬 6. 애니메이션 (Animation)

### 6.1 Duration

| Name | Value | 용도 |
|------|-------|------|
| instant | 0ms | 즉시 |
| fast | 100ms | 마이크로 인터랙션 |
| normal | 200ms | 일반 트랜지션 |
| slow | 300ms | 화면 전환 |
| slower | 400ms | 복잡한 애니메이션 |
| slowest | 500ms | 풀스크린 전환 |

### 6.2 Easing

```typescript
import { Easing } from 'react-native-reanimated';

export const easing = {
  // 기본 이징
  linear: Easing.linear,
  
  // 자연스러운 움직임 (권장)
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  
  // 스프링 효과
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // 바운스 효과
  bounce: Easing.bounce,
  
  // 부드러운 감속
  decelerate: Easing.out(Easing.quad),
  
  // 빠른 시작
  accelerate: Easing.in(Easing.quad),
};
```

### 6.3 일반적인 애니메이션 패턴

```typescript
// 페이드 인
const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 200,
  easing: easing.easeOut,
};

// 슬라이드 업
const slideUp = {
  from: { translateY: 20, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration: 300,
  easing: easing.easeOut,
};

// 스케일 인
const scaleIn = {
  from: { scale: 0.9, opacity: 0 },
  to: { scale: 1, opacity: 1 },
  duration: 200,
  easing: easing.easeOut,
};

// 프레스 피드백
const pressScale = {
  pressed: { scale: 0.97 },
  normal: { scale: 1 },
  duration: 100,
};

// 스프링 바운스
const springBounce = {
  damping: 12,
  stiffness: 180,
  mass: 0.8,
};
```

---

## 🎯 7. 아이콘 시스템 (Icon System)

### 7.1 아이콘 라이브러리

**권장: Phosphor Icons** (React Native용)
- 일관된 선 두께
- 6가지 스타일 (thin, light, regular, bold, fill, duotone)
- 1,000+ 아이콘

### 7.2 아이콘 크기

| Size | Value | 용도 |
|------|-------|------|
| xs | `ms(12)` | 인라인 아이콘 |
| sm | `ms(16)` | 작은 아이콘, 버튼 내부 |
| md | `ms(20)` | 입력 필드 아이콘 |
| lg | `ms(24)` | 기본 아이콘, 네비게이션 |
| xl | `ms(28)` | 강조 아이콘 |
| 2xl | `ms(32)` | 대형 아이콘 |
| 3xl | `ms(40)` | 빈 상태 아이콘 |
| 4xl | `ms(48)` | 히어로 아이콘 |

### 7.3 아이콘 색상

```typescript
export const iconColors = {
  default: colors.neutral600,
  muted: colors.neutral400,
  brand: colors.brand500,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  onBrand: colors.white,
};
```

---

## 📱 8. 컴포넌트 스타일 가이드

### 8.1 버튼 스타일

```typescript
export const buttonStyles = {
  // Primary Button (CTA)
  primary: {
    backgroundColor: colors.brand500,
    color: colors.white,
    height: hp(6.5),
    borderRadius: borderRadius.md,
    paddingHorizontal: space6,
    ...shadows.brand,
    
    pressed: {
      backgroundColor: colors.brand600,
      transform: [{ scale: 0.98 }],
    },
    
    disabled: {
      backgroundColor: colors.neutral300,
      shadowOpacity: 0,
    },
  },
  
  // Secondary Button
  secondary: {
    backgroundColor: colors.brand100,
    color: colors.brand700,
    borderWidth: 0,
    
    pressed: {
      backgroundColor: colors.brand200,
    },
  },
  
  // Outline Button
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand500,
    color: colors.brand500,
    
    pressed: {
      backgroundColor: colors.brand50,
    },
  },
  
  // Ghost Button
  ghost: {
    backgroundColor: 'transparent',
    color: colors.brand500,
    
    pressed: {
      backgroundColor: colors.brand50,
    },
  },
  
  // Danger Button
  danger: {
    backgroundColor: colors.error,
    color: colors.white,
    ...shadows.error,
    
    pressed: {
      backgroundColor: '#DC2626',
    },
  },
};
```

### 8.2 카드 스타일

```typescript
export const cardStyles = {
  // 기본 카드
  base: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: space5,
    ...shadows.sm,
  },
  
  // 인터랙티브 카드
  interactive: {
    ...cardStyles.base,
    
    pressed: {
      transform: [{ scale: 0.99 }],
      ...shadows.xs,
    },
  },
  
  // 강조 카드 (그라데이션 테두리)
  highlighted: {
    borderWidth: 2,
    borderColor: colors.brand500,
    backgroundColor: colors.brand50,
  },
  
  // 글래스 카드
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};
```

### 8.3 입력 필드 스타일

```typescript
export const inputStyles = {
  // 기본
  default: {
    height: hp(6.5),
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    borderWidth: 0,
    paddingHorizontal: space4,
    fontSize: typography.bodyLarge.fontSize,
    color: colors.neutral900,
    
    placeholder: {
      color: colors.neutral400,
    },
  },
  
  // 포커스
  focused: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand500,
    ...shadows.brand,
  },
  
  // 에러
  error: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  
  // 성공
  success: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
};
```

---

## 🌙 9. 다크 모드 (Dark Mode)

### 9.1 다크 모드 색상

```typescript
export const darkColors = {
  background: '#09090B',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  
  // 텍스트 (반전)
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  
  // 브랜드 (밝게 조정)
  brand500: '#60A5FA',
  brand600: '#93C5FD',
  
  // 테두리
  border: '#3F3F46',
  borderLight: '#27272A',
};
```

### 9.2 다크 모드 그림자

다크 모드에서는 그림자 대신 글로우 효과나 테두리 사용

```typescript
export const darkShadows = {
  card: {
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  
  elevated: {
    borderWidth: 1,
    borderColor: darkColors.border,
    // 또는 미묘한 글로우
    shadowColor: darkColors.brand500,
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
  },
};
```

---

## ♿ 10. 접근성 (Accessibility)

### 10.1 터치 타겟

| 용도 | 최소 크기 | 권장 크기 |
|------|----------|----------|
| 버튼 | 44x44pt | 48x48pt |
| 아이콘 버튼 | 44x44pt | 48x48pt |
| 리스트 아이템 | 44pt 높이 | 56pt 높이 |
| 체크박스/라디오 | 44x44pt | 48x48pt |

### 10.2 색상 대비

| 용도 | 최소 대비 | 권장 대비 |
|------|----------|----------|
| 본문 텍스트 | 4.5:1 | 7:1 |
| 큰 텍스트 (18pt+) | 3:1 | 4.5:1 |
| UI 컴포넌트 | 3:1 | 4.5:1 |

### 10.3 폰트 스케일링

```typescript
export const textAccessibility = {
  // 시스템 폰트 크기 반영
  allowFontScaling: true,
  
  // 최대 스케일 제한
  maxFontSizeMultiplier: 1.5,
  
  // 최소 가독성 폰트 크기
  minimumFontSize: fs(12),
};
```

---

## 📦 11. 색상 코드 (전체)

```typescript
// styles/colors.ts

export const colors = {
  // Brand
  brand: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  
  // Neutral (Cool Gray)
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  
  // Semantic
  success: '#22C55E',
  successLight: '#DCFCE7',
  successDark: '#166534',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',
  
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#B91C1C',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',
  
  // Surface
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  
  // Text
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',
  textInverse: '#FFFFFF',
  
  // Border
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  borderDark: '#D4D4D8',
  
  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};
```

---

## 🔖 12. 테마 토큰 사용 예시

```typescript
// components/Card.tsx
import { colors, typography, shadows, borderRadius, spacing } from '@/styles/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.space5,
    ...shadows.sm,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.textPrimary,
    marginBottom: spacing.space2,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
```

---

## 📋 다음 단계

이 디자인 시스템을 기반으로 각 컴포넌트 문서를 업데이트합니다:
- `buttons.md` - 버튼 컴포넌트
- `inputs.md` - 입력 컴포넌트
- `cards.md` - 카드 컴포넌트
- `navigation.md` - 네비게이션 컴포넌트
- `modals.md` - 모달/바텀시트
- `feedback.md` - 피드백 컴포넌트
- `badges.md` - 뱃지/태그
