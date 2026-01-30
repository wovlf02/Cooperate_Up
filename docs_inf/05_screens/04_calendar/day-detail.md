# 일별 상세 화면 (DayDetailScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

특정 날짜의 근무 상세 내역을 보여주는 화면입니다.

### 🎯 UX 목표
- **명확한 정보**: 해당 일자의 모든 근무 정보를 한눈에
- **시각적 표현**: 타임라인 바로 근무 구간 시각화
- **빠른 액션**: 수정 요청 등 후속 작업 용이

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←      12월 22일 (일)               │ │
│ │ back   typography.titleLarge        │ │
│ │        fontWeight: 600              │ │
│ └─────────────────────────────────────┘ │
│ height: ms(56)                          │
│ borderBottomWidth: 1                    │
│ borderBottomColor: neutral100           │
├─────────────────────────────────────────┤
│                                         │
│  ScrollView                             │
│  paddingHorizontal: layout.screenPadding│
│  paddingTop: spacing.space4             │
│  contentContainerStyle: { gap: spacing.space4 }
│                                         │
│  근무 타임라인 카드                     │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📋 근무 정보                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │     20:00 ────────── 04:30  │    │ │
│ │  │      출근             퇴근  │    │ │
│ │  │                             │    │ │
│ │  │   typography.titleMedium    │    │ │
│ │  │   fontWeight: 700           │    │ │
│ │  │   textSecondary (label)     │    │ │
│ │  │                             │    │ │
│ │  │   ━━━━━━●━━━━━━━━━━●━━━     │    │ │
│ │  │        ██████████████       │    │ │
│ │  │        근무 구간             │    │ │
│ │  │   18:00          06:00      │    │ │
│ │  │                             │    │ │
│ │  │   Timeline Bar:             │    │ │
│ │  │   - height: ms(8)           │    │ │
│ │  │   - borderRadius: full      │    │ │
│ │  │   - track: neutral200       │    │ │
│ │  │   - progress: brand500      │    │ │
│ │  │   - marker: ms(16) circle   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  근무 시간 상세 카드                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ⏱️ 근무 시간                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌──────────┬──────────┐     │    │ │
│ │  │ │실제 출근 │급여기준출│     │    │ │
│ │  │ │  20:00  │  20:00   │     │    │ │
│ │  │ │textSeco │ brand600 │     │    │ │
│ │  │ │ndary    │ bold     │     │    │ │
│ │  │ └──────────┴──────────┘     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ℹ️ 20시 이전 출근은 20시    │    │ │
│ │  │    부터 급여가 계산됩니다.  │    │ │
│ │  │                             │    │ │
│ │  │  typography.labelSmall      │    │ │
│ │  │  color: info700             │    │ │
│ │  │  backgroundColor: info50    │    │ │
│ │  │  borderRadius: borderRadius.md   │ │
│ │  │  padding: spacing.space3    │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │  separator: neutral100              │ │
│ │  marginVertical: spacing.space4     │ │
│ │                                     │ │
│ │  총 근무 시간                       │ │
│ │  typography.labelMedium             │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │                                     │ │
│ │       8시간 30분                    │ │
│ │       typography.displaySmall       │ │
│ │       fontWeight: 700               │ │
│ │       textAlign: center             │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  급여 정보 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  💰 급여 정보                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 시급                ₩10,030 │    │ │
│ │  │ bodyMedium      bodyMedium  │    │ │
│ │  │ textSecondary   textPrimary │    │ │
│ │  ├─────────────────────────────┤    │ │
│ │  │ 근무 시간          8.5시간  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │  double line separator              │ │
│ │                                     │ │
│ │  일급                               │ │
│ │  typography.labelMedium             │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │                                     │ │
│ │       ₩85,255                      │ │
│ │       typography.headlineMedium     │ │
│ │       fontWeight: 700               │ │
│ │       color: brand600               │ │
│ │       textAlign: center             │ │
│ │                                     │ │
│ │  10,030 × 8.5 = 85,255             │ │
│ │  typography.labelSmall              │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │                                     │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  (수정 요청 중인 경우)                  │
│  수정 요청 상태 카드                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ⏳ 수정 요청 중                    │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  출근: 20:00 → 19:30                │ │
│ │  퇴근: 04:00 → 04:30                │ │
│ │  typography.bodyMedium              │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🟡 승인 대기 중              │    │ │
│ │  │                             │    │ │
│ │  │  typography.labelMedium     │    │ │
│ │  │  color: warning700          │    │ │
│ │  │  textAlign: center          │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginTop: spacing.space3          │ │
│ │                                     │ │
│ │  backgroundColor: warning50         │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  borderWidth: 1                     │ │
│ │  borderColor: warning200            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  수정 요청 버튼                         │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │     ✏️ 근태 수정 요청       │    │ │
│ │  │                             │    │ │
│ │  │  height: ms(48)             │    │ │
│ │  │  backgroundColor: white     │    │ │
│ │  │  borderWidth: 1             │    │ │
│ │  │  borderColor: neutral200    │    │ │
│ │  │  borderRadius: borderRadius.lg   │ │
│ │  │                             │    │ │
│ │  │  typography.labelLarge      │    │ │
│ │  │  color: textSecondary       │    │ │
│ │  │  fontWeight: 600            │    │ │
│ │  └─────────────────────────────┘    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: safeAreaBottom + spacing.space4
│                                         │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const dayDetailStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: safeAreaBottom + spacing.space4,
    gap: spacing.space4,
  },
  
  // Card Base
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    ...shadows.sm,
  },
  
  cardHighlight: {
    backgroundColor: colors.brand50,
    ...shadows.none,
  },
  
  cardWarning: {
    backgroundColor: colors.warning50,
    borderWidth: 1,
    borderColor: colors.warning200,
    ...shadows.none,
  },
  
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
  },
  
  // Timeline
  timelineContainer: {
    paddingVertical: spacing.space4,
  },
  
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  
  timelineTimeItem: {
    alignItems: 'center',
  },
  
  timelineTime: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  timelineLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  
  timelineBar: {
    height: ms(8),
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral200,
    marginTop: spacing.space4,
    position: 'relative',
  },
  
  timelineProgress: {
    position: 'absolute',
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.brand500,
  },
  
  timelineMarker: {
    position: 'absolute',
    width: ms(16),
    height: ms(16),
    borderRadius: borderRadius.full,
    backgroundColor: colors.brand500,
    borderWidth: 3,
    borderColor: colors.white,
    top: -ms(4),
    ...shadows.sm,
  },
  
  timelineScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.space2,
  },
  
  timelineScaleText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  // Time Grid
  timeGrid: {
    flexDirection: 'row',
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  
  timeGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space3,
  },
  
  timeGridDivider: {
    width: 1,
    backgroundColor: colors.neutral200,
  },
  
  // Info Notice
  infoNotice: {
    flexDirection: 'row',
    backgroundColor: colors.info50,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    gap: spacing.space2,
    marginTop: spacing.space3,
  },
  
  infoNoticeText: {
    flex: 1,
    ...typography.labelSmall,
    color: colors.info700,
    lineHeight: ms(18),
  },
  
  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  
  doubleSeparator: {
    height: 2,
    backgroundColor: colors.neutral200,
    marginVertical: spacing.space4,
  },
  
  // Total Display
  totalLabel: {
    ...typography.labelMedium,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.space1,
  },
  
  totalValue: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Salary
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  salaryLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  salaryValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  
  salaryTotal: {
    ...typography.headlineMedium,
    color: colors.brand600,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.space2,
  },
  
  salaryFormula: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.space1,
  },
  
  // Edit Request Button
  editButton: {
    height: ms(48),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.space2,
  },
  
  editButtonText: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    fontWeight: '600',
  },
};
```

---

## 애니메이션

```typescript
const animations = {
  cardAppear: {
    entering: FadeInDown.delay(100).duration(300).springify(),
  },
  
  timelineProgress: {
    entering: FadeIn.delay(200).duration(400),
    width: withSpring,
  },
  
  markerAppear: {
    entering: ZoomIn.delay(400).duration(200).springify(),
  },
  
  salaryCount: {
    entering: FadeIn.duration(200),
    // AnimatedNumber component for counting effect
  },
};
```

---

## 상태 관리

```typescript
interface DayDetailState {
  // 데이터
  date: Date;
  attendance: AttendanceRecord | null;
  pendingEdit: EditRequest | null;
  
  // 계산 데이터
  actualCheckIn: Date | null;
  actualCheckOut: Date | null;
  payableCheckIn: Date | null;  // 급여 기준 출근시간
  workHours: number;
  dailySalary: number;
  hourlyRate: number;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
}
```

---

## 접근성

```typescript
const accessibility = {
  timeline: {
    accessibilityRole: 'image',
    accessibilityLabel: (checkIn: string, checkOut: string) =>
      `근무 시간: ${checkIn}부터 ${checkOut}까지`,
  },
  
  workHours: {
    accessibilityRole: 'text',
    accessibilityLabel: (hours: number, minutes: number) =>
      `총 근무 시간: ${hours}시간 ${minutes}분`,
  },
  
  salary: {
    accessibilityRole: 'text',
    accessibilityLabel: (amount: number) =>
      `일급: ${amount.toLocaleString()}원`,
  },
  
  editButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '근태 수정 요청',
    accessibilityHint: '두 번 탭하여 수정 요청 화면으로 이동',
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
    title: '정보를 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: {
      label: '다시 시도',
      onPress: 'retry',
    },
  },
  
  noRecord: {
    type: 'fullScreen',
    icon: '📅',
    title: '근무 기록이 없습니다',
    message: '해당 날짜에 근무 기록이 없습니다',
    action: {
      label: '수동 입력하기',
      onPress: 'navigateToManualInput',
    },
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'TimelineBar',
    'SalaryCard',
    'PendingEditCard',
  ],
  
  calculations: {
    memoized: ['workHours', 'dailySalary'],
  },
};
```
