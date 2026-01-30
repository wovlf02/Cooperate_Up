# 체크리스트 모니터링 화면 (Admin - ChecklistMonitorScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

관리자가 전체 근무자의 체크리스트 진행률을 모니터링하고, 체크리스트 템플릿을 관리하며 근무자에게 할당하는 화면입니다.

### 🎯 UX 목표
- **한눈에 파악**: 전체 현황과 주의 필요 인원 즉시 확인
- **빠른 접근**: 개별 근무자 상세로 원터치 이동
- **시각적 상태**: 진행률에 따른 색상 구분

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←      체크리스트 현황              │ │
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
│  전체 현황 요약 카드                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📊 전체 현황                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌──────────┬──────────┐     │    │ │
│ │  │ │ 평균     │ 주의     │     │    │ │
│ │  │ │ 진행률   │ 필요     │     │    │ │
│ │  │ │labelSmall│labelSmall│     │    │ │
│ │  │ │textTertia│textTertia│     │    │ │
│ │  │ │          │          │     │    │ │
│ │  │ │   72%    │   1명    │     │    │ │
│ │  │ │ headlineM│ headlineM│     │    │ │
│ │  │ │ brand600 │ warning  │     │    │ │
│ │  │ │ bold     │ bold     │     │    │ │
│ │  │ └──────────┴──────────┘     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  현재 출근자: 3명                    │ │
│ │  typography.bodySmall               │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4           │
│                                         │
│  Section Header                         │
│ ┌─────────────────────────────────────┐ │
│ │  현재 근무 중                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space3       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Worker List (ScrollView)               │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  Worker Card - Good Status          │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ ┌────┐                   │    │ │
│ │  │ ██ │ 👤 │ 김철수        85% │    │ │
│ │  │ ██ │ms40│ 22:00 출근  양호  │    │ │
│ │  │ ██ └────┘                   │    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ [██████████████████░░]   │    │ │
│ │  │ ██                          │    │ │
│ │  │ borderLeftWidth: ms(4)      │    │ │
│ │  │ borderLeftColor: success    │    │ │
│ │  │ backgroundColor: white      │    │ │
│ │  │ borderRadius: borderRadius.xl    │ │
│ │  │ padding: spacing.space4     │    │ │
│ │  │ shadows.sm                  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  Worker Card - Normal Status        │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ ┌────┐                   │    │ │
│ │  │ ██ │ 👤 │ 박영희        72% │    │ │
│ │  │ ██ │    │ 20:30 출근  보통  │    │ │
│ │  │ ██ └────┘                   │    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ [█████████████░░░░░░░]   │    │ │
│ │  │ ██                          │    │ │
│ │  │ borderLeftColor: brand500   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  Worker Card - Warning Status       │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ ┌────┐                   │    │ │
│ │  │ ██ │ 👤 │ ⚠️ 이민수    45% │    │ │
│ │  │ ██ │    │ 21:00 출근  주의  │    │ │
│ │  │ ██ └────┘                   │    │ │
│ │  │ ██                          │    │ │
│ │  │ ██ [████████░░░░░░░░░░░░]   │    │ │
│ │  │ ██                          │    │ │
│ │  │ borderLeftColor: warning    │    │ │
│ │  │ backgroundColor: warning50  │    │ │
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
const checklistMonitorStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: safeAreaBottom + tabBarHeight,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  summaryTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
  },
  
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: spacing.space3,
  },
  
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space2,
  },
  
  summaryItemLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  summaryItemValue: {
    ...typography.headlineMedium,
    fontWeight: '700',
  },
  
  summaryItemValuePrimary: {
    color: colors.brand600,
  },
  
  summaryItemValueWarning: {
    color: colors.warning,
  },
  
  summarySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  
  // Section Header
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space3,
  },
  
  // Worker Card
  workerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    borderLeftWidth: ms(4),
    ...shadows.sm,
  },
  
  workerCardWarning: {
    backgroundColor: colors.warning50,
  },
  
  workerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  workerAvatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  workerAvatarText: {
    fontSize: ms(18),
  },
  
  workerInfo: {
    flex: 1,
  },
  
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space1,
  },
  
  workerName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  warningIcon: {
    fontSize: ms(14),
  },
  
  workerMeta: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  
  workerProgress: {
    alignItems: 'flex-end',
  },
  
  workerProgressValue: {
    ...typography.titleMedium,
    fontWeight: '700',
    marginBottom: spacing.space1,
  },
  
  workerStatusBadge: {
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.full,
  },
  
  workerStatusText: {
    ...typography.labelSmall,
    fontWeight: '500',
  },
  
  // Progress Bar
  progressBarContainer: {
    marginTop: spacing.space3,
  },
  
  progressBar: {
    height: ms(6),
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
};

// Status Colors
const statusConfig = {
  good: {
    borderColor: colors.success,
    progressColor: colors.success,
    textColor: colors.success700,
    bgColor: colors.success50,
    label: '양호',
  },
  normal: {
    borderColor: colors.brand500,
    progressColor: colors.brand500,
    textColor: colors.brand600,
    bgColor: colors.brand50,
    label: '보통',
  },
  warning: {
    borderColor: colors.warning,
    progressColor: colors.warning,
    textColor: colors.warning700,
    bgColor: colors.warning50,
    label: '주의',
  },
};

// Progress thresholds
const getStatusByProgress = (progress: number) => {
  if (progress >= 70) return 'good';
  if (progress >= 50) return 'normal';
  return 'warning';
};
```

---

## 애니메이션

```typescript
const animations = {
  summaryCardAppear: {
    entering: FadeInDown.delay(100).duration(300).springify(),
  },
  
  workerCardAppear: {
    entering: FadeInUp.delay(200).duration(300).springify(),
  },
  
  progressBarFill: {
    width: withSpring,
    duration: 500,
  },
  
  cardPress: {
    scale: withSequence(
      withTiming(0.98, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
  
  warningPulse: withRepeat(
    withSequence(
      withTiming(1.1, { duration: 500 }),
      withTiming(1, { duration: 500 })
    ),
    3,
    true
  ),
};
```

---

## 상태 관리

```typescript
interface ChecklistMonitorState {
  // 전체 현황
  overallStats: {
    averageProgress: number;
    lowProgressCount: number;  // 50% 미만
    totalWorkers: number;
  };
  
  // 근무자 목록
  workers: WorkerProgress[];
  
  // UI 상태
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface WorkerProgress {
  id: string;
  name: string;
  profileImage: string | null;
  checkInTime: Date;
  progress: number;
  status: 'good' | 'normal' | 'warning';
  completedItems: number;
  totalItems: number;
}
```

---

## 접근성

```typescript
const accessibility = {
  summaryCard: {
    accessibilityRole: 'summary',
    accessibilityLabel: (avg: number, warning: number, total: number) =>
      `전체 현황: 평균 진행률 ${avg}%, 주의 필요 ${warning}명, 총 ${total}명 근무 중`,
  },
  
  workerCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (name: string, progress: number, status: string) =>
      `${name}, 진행률 ${progress}%, 상태 ${status}`,
    accessibilityHint: '두 번 탭하여 상세 보기',
  },
  
  progressBar: {
    accessibilityRole: 'progressbar',
    accessibilityValue: { now: progress, min: 0, max: 100 },
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
    title: '현황을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: {
      label: '다시 시도',
      onPress: 'retry',
    },
  },
  
  noWorkers: {
    type: 'empty',
    icon: '👥',
    title: '현재 근무 중인 직원이 없습니다',
    message: '출근한 직원이 있을 때 모니터링할 수 있습니다',
  },
};
```

---

## 카드 탭 → 상세 화면 네비게이션

```typescript
const handleWorkerPress = (workerId: string) => {
  navigation.navigate('WorkerChecklistDetail', { workerId });
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'SummaryCard',
    'WorkerCard',
    'ProgressBar',
  ],
  
  listOptimization: {
    initialNumToRender: 5,
    maxToRenderPerBatch: 10,
    windowSize: 5,
    removeClippedSubviews: true,
  },
  
  refreshInterval: 30000,  // 30초마다 자동 새로고침
};
```
