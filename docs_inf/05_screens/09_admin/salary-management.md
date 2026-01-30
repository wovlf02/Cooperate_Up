# 급여 관리 화면 (SalaryScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

관리자가 월별 전체 급여 현황을 관리하는 화면입니다.

### 🎯 UX 목표
- **한눈에 파악**: 월별 총 급여와 근무자별 급여 현황
- **빠른 탐색**: 월 간 이동 및 개별 상세 조회
- **명확한 정보**: 근무일수, 시간, 급여 등 핵심 정보 표시

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←      급여 관리                    │ │
│ │ back   typography.titleLarge        │ │
│ │        fontWeight: 600              │ │
│ └─────────────────────────────────────┘ │
│ height: ms(56)                          │
│ borderBottomWidth: 1                    │
│ borderBottomColor: neutral100           │
├─────────────────────────────────────────┤
│                                         │
│  paddingHorizontal: layout.screenPadding│
│  paddingTop: spacing.space4             │
│                                         │
│  Month Selector                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     <    2024년 12월    >           │ │
│ │   prev  typography.titleLarge  next │ │
│ │         fontWeight: 700             │ │
│ │                                     │ │
│ │  button size: ms(44)                │ │
│ │  icon color: textSecondary          │ │
│ │  height: ms(56)                     │ │
│ │  justifyContent: center             │ │
│ │  alignItems: center                 │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4           │
│                                         │
│  Total Summary Card                     │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  💰 12월 총 급여                    │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │       ₩5,436,260                   │ │
│ │       typography.displayLarge       │ │
│ │       fontWeight: 700               │ │
│ │       color: brand600               │ │
│ │       textAlign: center             │ │
│ │                                     │ │
│ │  5명 • 542시간 근무                 │ │
│ │  typography.bodyMedium              │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │  marginTop: spacing.space2          │ │
│ │                                     │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space5            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4           │
│                                         │
│  Section Header                         │
│ ┌─────────────────────────────────────┐ │
│ │  근무자별 급여                      │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space3       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Employee Salary List (ScrollView)      │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  Employee Salary Item               │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │ ┌────┐  김철수          >   │    │ │
│ │  │ │ 👤 │  18일 • 153시간      │    │ │
│ │  │ │ms44│                      │    │ │
│ │  │ └────┘  ₩1,606,500          │    │ │
│ │  │         typography.titleLarge    │ │
│ │  │         fontWeight: 700     │    │ │
│ │  │         color: brand600     │    │ │
│ │  │                             │    │ │
│ │  │  backgroundColor: white     │    │ │
│ │  │  borderRadius: borderRadius.xl   │ │
│ │  │  padding: spacing.space4    │    │ │
│ │  │  shadows.sm                 │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │ ┌────┐  박영희          >   │    │ │
│ │  │ │ 👤 │  15일 • 128시간      │    │ │
│ │  │ │    │                      │    │ │
│ │  │ └────┘  ₩1,283,840          │    │ │
│ │  │                             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │ ┌────┐  이민수          >   │    │ │
│ │  │ │ 👤 │  12일 • 98시간       │    │ │
│ │  │ │    │                      │    │ │
│ │  │ └────┘  ₩982,940            │    │ │
│ │  │                             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: safeAreaBottom + tabBarHeight
│                                         │
├─────────────────────────────────────────┤
│ BottomTabBar                            │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const salaryManagementStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: safeAreaBottom + tabBarHeight,
  },
  
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space4,
  },
  
  monthButton: {
    width: ms(44),
    height: ms(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  
  monthButtonPressed: {
    backgroundColor: colors.neutral100,
  },
  
  monthButtonDisabled: {
    opacity: 0.3,
  },
  
  monthIcon: {
    fontSize: ms(24),
    color: colors.textSecondary,
  },
  
  monthText: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  // Total Summary Card
  summaryCard: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    alignItems: 'center',
  },
  
  summaryTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
    alignSelf: 'flex-start',
  },
  
  summaryAmount: {
    ...typography.displayLarge,
    color: colors.brand600,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  summaryMeta: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.space2,
  },
  
  // Section Header
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space3,
  },
  
  // Employee Salary Item
  employeeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  
  employeeAvatar: {
    width: ms(44),
    height: ms(44),
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  employeeAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
  },
  
  employeeAvatarText: {
    fontSize: ms(18),
  },
  
  employeeInfo: {
    flex: 1,
  },
  
  employeeName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  employeeMeta: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  
  employeeSalary: {
    ...typography.titleLarge,
    color: colors.brand600,
    fontWeight: '700',
  },
  
  chevronIcon: {
    fontSize: ms(20),
    color: colors.textTertiary,
    marginLeft: spacing.space2,
  },
};
```

---

## 애니메이션

```typescript
const animations = {
  monthChange: {
    exiting: FadeOut.duration(150),
    entering: FadeIn.duration(200),
  },
  
  summaryCardAppear: {
    entering: FadeInDown.delay(100).duration(300).springify(),
  },
  
  employeeCardAppear: {
    entering: FadeInUp.delay(200).duration(300).springify(),
  },
  
  amountCount: {
    // AnimatedNumber for counting effect
    duration: 600,
    easing: Easing.out(Easing.cubic),
  },
  
  cardPress: {
    scale: withSequence(
      withTiming(0.98, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
  
  monthButtonPress: {
    scale: withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
};
```

---

## 월 이동

```typescript
const monthNavigation = {
  // 제스처
  swipeLeft: () => goToNextMonth(),
  swipeRight: () => goToPreviousMonth(),
  
  // 버튼
  onPrevious: () => goToPreviousMonth(),
  onNext: () => goToNextMonth(),
  
  // 범위 제한
  minMonth: subMonths(new Date(), 12),  // 12개월 전
  maxMonth: new Date(),                  // 현재 달
  
  // 버튼 비활성화 조건
  isPreviousDisabled: currentMonth <= minMonth,
  isNextDisabled: currentMonth >= maxMonth,
};
```

---

## 정렬

```typescript
// 급여 높은 순으로 정렬 (내림차순)
const sortedEmployees = employees.sort((a, b) => b.salary - a.salary);
```

---

## 상태 관리

```typescript
interface SalaryManagementState {
  // 현재 월
  currentMonth: Date;
  
  // 요약 정보
  summary: {
    totalSalary: number;
    employeeCount: number;
    totalHours: number;
  };
  
  // 직원별 급여 목록
  employees: EmployeeSalary[];
  
  // UI 상태
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface EmployeeSalary {
  id: string;
  name: string;
  profileImage: string | null;
  workDays: number;
  totalHours: number;
  salary: number;
}
```

---

## 접근성

```typescript
const accessibility = {
  monthSelector: {
    accessibilityRole: 'adjustable',
    accessibilityLabel: (month: string) => `선택된 월: ${month}`,
    accessibilityHint: '좌우로 스와이프하여 월 변경',
    accessibilityActions: [
      { name: 'increment', label: '다음 달' },
      { name: 'decrement', label: '이전 달' },
    ],
  },
  
  previousButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '이전 달',
    accessibilityState: { disabled: isPreviousDisabled },
  },
  
  nextButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '다음 달',
    accessibilityState: { disabled: isNextDisabled },
  },
  
  summaryCard: {
    accessibilityRole: 'summary',
    accessibilityLabel: (month: string, total: number, count: number, hours: number) =>
      `${month} 총 급여: ${total.toLocaleString()}원, ${count}명, ${hours}시간 근무`,
  },
  
  employeeCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (name: string, days: number, hours: number, salary: number) =>
      `${name}, ${days}일 ${hours}시간 근무, 급여 ${salary.toLocaleString()}원`,
    accessibilityHint: '두 번 탭하여 상세 보기',
  },
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    type: 'fullScreen',
    icon: '⚠️',
    title: '급여 현황을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: {
      label: '다시 시도',
      onPress: 'retry',
    },
  },
  
  noData: {
    type: 'empty',
    icon: '📊',
    title: '급여 내역이 없습니다',
    message: '해당 월에 근무 기록이 없습니다',
  },
};
```

---

## 네비게이션

```typescript
// 직원 카드 탭 → 급여 명세서 화면
const handleEmployeePress = (employeeId: string) => {
  navigation.navigate('SalaryDetail', {
    employeeId,
    month: currentMonth,
  });
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'MonthSelector',
    'SummaryCard',
    'EmployeeSalaryItem',
  ],
  
  listOptimization: {
    initialNumToRender: 5,
    maxToRenderPerBatch: 10,
    windowSize: 5,
  },
  
  caching: {
    // 월별 데이터 캐싱
    monthlyDataCache: new Map(),
    cacheExpiry: 5 * 60 * 1000,  // 5분
  },
};
```
