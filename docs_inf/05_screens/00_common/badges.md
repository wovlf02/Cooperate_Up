# 뱃지 및 태그 컴포넌트 (Badge & Tag Components)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

상태, 카테고리, 알림 수량 등을 표시하는 뱃지와 태그 컴포넌트들입니다.

### 🎯 UX 목표
- **즉각적 인지**: 한눈에 상태/수량 파악
- **일관된 의미**: 색상별 의미 통일
- **적절한 강조**: 중요도에 따른 시각적 구분

---

## 1. Badge (뱃지)

숫자나 상태를 표시하는 작은 뱃지입니다.

### 1.1 Number Badge

```
┌─────────────────────────────────────────┐
│                                         │
│  Standard (1자리)        99+ (초과)     │
│  ┌─────┐                 ┌───────┐      │
│  │  3  │                 │  99+  │      │
│  └─────┘                 └───────┘      │
│                                         │
│  스타일 명세:                           │
│  - minWidth: ms(20)                     │
│  - height: ms(20)                       │
│  - paddingHorizontal: spacing.space2    │
│  - borderRadius: borderRadius.full      │
│  - backgroundColor: colors.error        │
│                                         │
│  텍스트 스타일:                         │
│  - typography.labelSmall                │
│  - fontWeight: 700                      │
│  - color: colors.white                  │
│  - textAlign: center                    │
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 Dot Badge

```
┌─────────────────────────────────────────┐
│                                         │
│  Dot Sizes                              │
│                                         │
│  small      medium      large           │
│  ┌──┐       ┌───┐       ┌────┐          │
│  │🔴│       │ 🔴│       │ 🔴 │          │
│  └──┘       └───┘       └────┘          │
│  6px        8px         10px            │
│                                         │
│  스타일 명세:                           │
│  - small: ms(6)                         │
│  - medium: ms(8)                        │
│  - large: ms(10)                        │
│  - borderRadius: borderRadius.full      │
│                                         │
│  색상 variants:                         │
│  - default: colors.error                │
│  - success: colors.success              │
│  - warning: colors.warning              │
│  - info: colors.info                    │
│                                         │
└─────────────────────────────────────────┘
```

### 1.3 아이콘과 함께 사용

```
┌─────────────────────────────────────────┐
│                                         │
│  Icon with Badge                        │
│                                         │
│  ┌────────────┐     ┌────────────┐      │
│  │    🔔      │     │    💬      │      │
│  │       ┌──┐ │     │       ┌──┐ │      │
│  │       │3 │ │     │       │🔴│ │      │
│  │       └──┘ │     │       └──┘ │      │
│  └────────────┘     └────────────┘      │
│   Number Badge       Dot Badge          │
│                                         │
│  Badge Position:                        │
│  - position: absolute                   │
│  - top: ms(-6)                          │
│  - right: ms(-6)                        │
│                                         │
│  Container Style:                       │
│  - position: relative                   │
│                                         │
└─────────────────────────────────────────┘
```

### 1.4 컴포넌트 스타일

```typescript
const badgeStyles = {
  // Number Badge
  numberBadge: {
    minWidth: ms(20),
    height: ms(20),
    paddingHorizontal: spacing.space2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  numberBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  
  // Dot Badge
  dotBadge: {
    borderRadius: borderRadius.full,
  },
  
  dotBadgeSmall: { width: ms(6), height: ms(6) },
  dotBadgeMedium: { width: ms(8), height: ms(8) },
  dotBadgeLarge: { width: ms(10), height: ms(10) },
  
  // Positioned Badge
  badgeContainer: {
    position: 'relative',
  },
  
  badgePosition: {
    position: 'absolute',
    top: ms(-6),
    right: ms(-6),
    zIndex: 1,
  },
};

// Color variants
const badgeColors = {
  error: colors.error,
  success: colors.success,
  warning: colors.warning,
  info: colors.info,
  brand: colors.brand500,
};
```

### 1.5 Props

```typescript
interface BadgeProps {
  // Number Badge
  count?: number;
  max?: number;           // default: 99 (99+ 표시)
  showZero?: boolean;     // 0일 때 표시 여부
  
  // Dot Badge
  dot?: boolean;
  dotSize?: 'small' | 'medium' | 'large';
  
  // Common
  color?: 'error' | 'success' | 'warning' | 'info' | 'brand';
  visible?: boolean;
  
  // For wrapper usage
  children?: ReactNode;
}
```

---

## 2. Tag / Chip (태그)

카테고리나 상태를 표시하는 태그입니다.

### 2.1 기본 레이아웃

```
┌─────────────────────────────────────────┐
│                                         │
│  Filled Tags                            │
│                                         │
│  ┌────────────┐  ┌────────────┐         │
│  │  관리자    │  │   직원     │         │
│  │  primary   │  │  secondary │         │
│  └────────────┘  └────────────┘         │
│                                         │
│  ┌────────────┐  ┌────────────┐         │
│  │  ✅ 승인   │  │  ⏳ 대기   │         │
│  │  success   │  │  warning   │         │
│  └────────────┘  └────────────┘         │
│                                         │
│  스타일 명세:                           │
│  - paddingHorizontal: spacing.space3    │
│  - paddingVertical: spacing.space1      │
│  - borderRadius: borderRadius.full      │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 Size Variants

```
┌─────────────────────────────────────────┐
│                                         │
│  small         medium        large      │
│  ┌───────┐     ┌─────────┐   ┌──────────┐
│  │ 태그  │     │  태그   │   │   태그   │
│  └───────┘     └─────────┘   └──────────┘
│                                         │
│  Size Specs:                            │
│  ┌────────────────────────────────────┐ │
│  │ Size   │ Typography  │ Padding H/V │ │
│  ├────────┼─────────────┼─────────────┤ │
│  │ small  │ labelSmall  │ space2/1    │ │
│  │ medium │ labelMedium │ space3/1.5  │ │
│  │ large  │ bodySmall   │ space4/2    │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 2.3 Variants (스타일 유형)

```
┌─────────────────────────────────────────┐
│                                         │
│  Filled (채움)                          │
│  ┌────────────┐                         │
│  │   관리자   │  backgroundColor: fill  │
│  └────────────┘  color: text            │
│                                         │
│  Outlined (선)                          │
│  ┌────────────┐                         │
│  │   관리자   │  backgroundColor: none  │
│  └────────────┘  borderColor: stroke    │
│                                         │
│  Soft (연한 배경)                       │
│  ┌────────────┐                         │
│  │   관리자   │  backgroundColor: soft  │
│  └────────────┘  color: strong          │
│                                         │
└─────────────────────────────────────────┘
```

### 2.4 Color Variants

```typescript
const tagColorVariants = {
  primary: {
    filled: { bg: colors.brand500, text: colors.white },
    outlined: { border: colors.brand500, text: colors.brand500 },
    soft: { bg: colors.brand50, text: colors.brand600 },
  },
  secondary: {
    filled: { bg: colors.neutral200, text: colors.neutral700 },
    outlined: { border: colors.neutral300, text: colors.neutral600 },
    soft: { bg: colors.neutral50, text: colors.neutral600 },
  },
  success: {
    filled: { bg: colors.success, text: colors.white },
    outlined: { border: colors.success, text: colors.success },
    soft: { bg: colors.success50, text: colors.success700 },
  },
  warning: {
    filled: { bg: colors.warning, text: colors.white },
    outlined: { border: colors.warning, text: colors.warning600 },
    soft: { bg: colors.warning50, text: colors.warning700 },
  },
  error: {
    filled: { bg: colors.error, text: colors.white },
    outlined: { border: colors.error, text: colors.error },
    soft: { bg: colors.error50, text: colors.error700 },
  },
  info: {
    filled: { bg: colors.info, text: colors.white },
    outlined: { border: colors.info, text: colors.info },
    soft: { bg: colors.info50, text: colors.info700 },
  },
};
```

### 2.5 With Icon & Closable

```
┌─────────────────────────────────────────┐
│                                         │
│  With Left Icon                         │
│  ┌────────────────┐                     │
│  │ ✅  승인 완료  │                     │
│  └────────────────┘                     │
│  iconSize: ms(14)                       │
│  gap: spacing.space1                    │
│                                         │
│  Closable (닫기 버튼)                   │
│  ┌────────────────┐                     │
│  │  필터명   ✕   │                     │
│  └────────────────┘                     │
│  closeIconSize: ms(12)                  │
│  closePadding: spacing.space1           │
│                                         │
│  With Icon + Closable                   │
│  ┌────────────────────┐                 │
│  │ 📍 강남구     ✕   │                 │
│  └────────────────────┘                 │
│                                         │
└─────────────────────────────────────────┘
```

### 2.6 컴포넌트 스타일

```typescript
const tagStyles = {
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  
  // Size variants
  small: {
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space1,
  },
  medium: {
    paddingHorizontal: spacing.space3,
    paddingVertical: ms(6),
  },
  large: {
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
  },
  
  // Typography by size
  textSmall: {
    ...typography.labelSmall,
    fontWeight: '500',
  },
  textMedium: {
    ...typography.labelMedium,
    fontWeight: '500',
  },
  textLarge: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  
  // Outlined variant
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  
  // Icon styles
  icon: {
    marginRight: spacing.space1,
  },
  
  // Close button
  closeButton: {
    marginLeft: spacing.space1,
    padding: spacing.space1,
  },
  closeIcon: {
    width: ms(12),
    height: ms(12),
  },
};
```

### 2.7 Props

```typescript
interface TagProps {
  label: string;
  variant?: 'filled' | 'outlined' | 'soft';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  icon?: string | ReactNode;
  closable?: boolean;
  onClose?: () => void;
  onPress?: () => void;
  disabled?: boolean;
}
```

---

## 3. Status Badge (상태 뱃지)

특정 상태를 명확히 표시하는 뱃지입니다.

### 3.1 레이아웃

```
┌─────────────────────────────────────────┐
│                                         │
│  Attendance Status                      │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ 🟢 출근 중   │  │ 🔴 퇴근     │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  Approval Status                        │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ ⏳ 대기 중   │  │ ✅ 승인됨   │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  ┌──────────────┐                       │
│  │ ❌ 거부됨   │                       │
│  └──────────────┘                       │
│                                         │
│  스타일 명세:                           │
│  - flexDirection: row                   │
│  - alignItems: center                   │
│  - gap: spacing.space1                  │
│  - paddingHorizontal: spacing.space3    │
│  - paddingVertical: spacing.space1      │
│  - borderRadius: borderRadius.full      │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 상태별 스타일

```typescript
const statusBadgeConfig = {
  // 출퇴근 상태
  attendance: {
    working: {
      icon: '🟢',
      label: '출근 중',
      bg: colors.success50,
      text: colors.success700,
    },
    offDuty: {
      icon: '🔴',
      label: '퇴근',
      bg: colors.neutral100,
      text: colors.neutral600,
    },
    notStarted: {
      icon: '⚪',
      label: '미출근',
      bg: colors.neutral50,
      text: colors.neutral500,
    },
  },
  
  // 승인 상태
  approval: {
    pending: {
      icon: '⏳',
      label: '대기 중',
      bg: colors.warning50,
      text: colors.warning700,
    },
    approved: {
      icon: '✅',
      label: '승인됨',
      bg: colors.success50,
      text: colors.success700,
    },
    rejected: {
      icon: '❌',
      label: '거부됨',
      bg: colors.error50,
      text: colors.error700,
    },
  },
  
  // 역할 상태
  role: {
    owner: {
      icon: '👑',
      label: '사업주',
      bg: colors.brand50,
      text: colors.brand600,
    },
    employee: {
      icon: '👤',
      label: '직원',
      bg: colors.neutral100,
      text: colors.neutral600,
    },
  },
};
```

---

## 애니메이션

```typescript
const badgeAnimations = {
  // Badge 등장
  appear: {
    entering: ZoomIn.duration(200).springify(),
  },
  
  // Badge 사라짐
  disappear: {
    exiting: ZoomOut.duration(150),
  },
  
  // 카운트 변경
  countChange: {
    scale: withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
  
  // Dot pulse (알림)
  pulse: withRepeat(
    withSequence(
      withTiming(1.3, { duration: 400 }),
      withTiming(1, { duration: 400 })
    ),
    -1,
    true
  ),
  
  // Tag close
  tagClose: {
    exiting: FadeOut.duration(150),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  numberBadge: {
    accessibilityRole: 'text',
    accessibilityLabel: (count: number, max: number) =>
      count > max ? `${max}개 이상의 알림` : `${count}개의 알림`,
  },
  
  dotBadge: {
    accessibilityRole: 'text',
    accessibilityLabel: '새 알림 있음',
  },
  
  tag: {
    accessibilityRole: 'button',
    accessibilityLabel: (label: string) => label,
    accessibilityHint: (closable: boolean) =>
      closable ? '두 번 탭하여 제거' : undefined,
  },
  
  statusBadge: {
    accessibilityRole: 'text',
    accessibilityLabel: (status: string) => `상태: ${status}`,
  },
};
```

---

## 사용 예시

```tsx
// Number Badge
<Badge count={5} />
<Badge count={100} max={99} />  // "99+" 표시
<Badge dot color="success" />

// Badge with Icon
<Badge count={3}>
  <BellIcon size={24} />
</Badge>

// Tags
<Tag label="관리자" color="primary" />
<Tag label="승인됨" color="success" icon="✅" variant="soft" />
<Tag label="필터" closable onClose={handleRemove} />

// Status Badge
<StatusBadge type="attendance" status="working" />
<StatusBadge type="approval" status="pending" />
```
