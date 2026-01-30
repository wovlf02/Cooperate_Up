# 근태 수정 요청 화면 (EditRequestScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

이미 기록된 출퇴근 시간을 수정 요청하는 화면입니다.

### 🎯 UX 목표
- **명확한 비교**: 기존 기록과 수정 요청 내용을 명확히 비교
- **예상 결과**: 변경 시 예상 급여 변화를 실시간 표시
- **간편한 입력**: 직관적인 시간 선택 UI

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ✕      근태 수정 요청               │ │
│ │ close  typography.titleLarge        │ │
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
│  Info Banner                            │
│ ┌─────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐   │ │
│ │ │ ℹ️                            │   │ │
│ │ │                               │   │ │
│ │ │ 출퇴근 시간이 실제와 다르게   │   │ │
│ │ │ 기록된 경우 수정을 요청할 수  │   │ │
│ │ │ 있습니다.                     │   │ │
│ │ │                               │   │ │
│ │ │ 관리자 승인 후 급여에         │   │ │
│ │ │ 반영됩니다.                   │   │ │
│ │ │                               │   │ │
│ │ │ typography.bodySmall          │   │ │
│ │ │ color: info700                │   │ │
│ │ │ backgroundColor: info50       │   │ │
│ │ │ borderRadius: borderRadius.lg │   │ │
│ │ │ padding: spacing.space4       │   │ │
│ │ └───────────────────────────────┘   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  날짜 선택 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  수정할 날짜 *                      │ │
│ │  typography.labelMedium             │ │
│ │  color: textSecondary               │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📅 2024년 12월 21일 (토)  ▼│    │ │
│ │  │                             │    │ │
│ │  │ height: ms(52)              │    │ │
│ │  │ borderRadius: borderRadius.lg    │ │
│ │  │ borderWidth: 1              │    │ │
│ │  │ borderColor: neutral200     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  (날짜 선택 후 표시)                    │
│  기존 기록 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📋 기존 기록                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌──────────┬──────────┐     │    │ │
│ │  │ │   출근   │   퇴근   │     │    │ │
│ │  │ │  20:00  │  04:00   │     │    │ │
│ │  │ │ fs(20)  │  fs(20)  │     │    │ │
│ │  │ │ bold    │  bold    │     │    │ │
│ │  │ └──────────┴──────────┘     │    │ │
│ │  │                             │    │ │
│ │  │ 근무: 8시간 • ₩80,240       │    │ │
│ │  │ typography.bodySmall        │    │ │
│ │  │ color: textTertiary         │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: neutral50         │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  수정 요청 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ✏️ 수정 요청                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  출근 시간 수정 *                   │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🕐 19:30                  ▼│    │ │
│ │  │ height: ms(52)              │    │ │
│ │  │ borderColor: brand500       │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 20:00 → 19:30 (−30분)       │    │ │
│ │  │ typography.labelSmall       │    │ │
│ │  │ color: success              │    │ │
│ │  │ backgroundColor: success50  │    │ │
│ │  │ padding: spacing.space2     │    │ │
│ │  │ borderRadius: borderRadius.md    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginTop: spacing.space2          │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  퇴근 시간 수정 *                   │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🕐 04:30                  ▼│    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 04:00 → 04:30 (+30분)       │    │ │
│ │  │ color: brand500             │    │ │
│ │  │ backgroundColor: brand50    │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  변경 예상 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📊 변경 예상                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 근무시간                    │    │ │
│ │  │ 8시간 → 9시간               │    │ │
│ │  │ color: textSecondary → brand500  │ │
│ │  │                             │    │ │
│ │  │ ──────────────────────      │    │ │
│ │  │                             │    │ │
│ │  │ 급여                        │    │ │
│ │  │ ₩80,240 → ₩90,270           │    │ │
│ │  │ color: textSecondary → brand500  │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 차이: +1시간, +₩10,030      │    │ │
│ │  │ typography.bodyMedium       │    │ │
│ │  │ color: brand600             │    │ │
│ │  │ fontWeight: 600             │    │ │
│ │  │ textAlign: center           │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  사유 입력                              │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  사유 *                             │ │
│ │  typography.labelMedium             │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │  수정 요청 사유를           │    │ │
│ │  │  입력해주세요...            │    │ │
│ │  │                             │    │ │
│ │  │  minHeight: ms(120)         │    │ │
│ │  │  textAlignVertical: top     │    │ │
│ │  │                             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                              0/200  │ │
│ │  typography.labelSmall              │ │
│ │  color: textTertiary                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(15)                  │
│                                         │
├─────────────────────────────────────────┤
│  Fixed Bottom Button                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │         수정 요청           │    │ │
│ │  │   height: ms(52)            │    │ │
│ │  │   backgroundColor: brand500 │    │ │
│ │  │   borderRadius: borderRadius.lg  │ │
│ │  │   typography.labelLarge     │    │ │
│ │  │   fontWeight: 600           │    │ │
│ │  │   color: white              │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  paddingHorizontal: layout.screenPadding
│ │  paddingTop: spacing.space3         │ │
│ │  paddingBottom: safeAreaBottom + spacing.space3
│ │  backgroundColor: white             │ │
│ │  borderTopWidth: 1                  │ │
│ │  borderTopColor: neutral100         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const editRequestStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: hp(15),
    gap: spacing.space4,
  },
  
  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: colors.info50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    gap: spacing.space3,
  },
  
  infoBannerIcon: {
    fontSize: ms(20),
  },
  
  infoBannerText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.info700,
    lineHeight: ms(20),
  },
  
  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    ...shadows.sm,
  },
  
  cardNeutral: {
    backgroundColor: colors.neutral50,
    ...shadows.none,
  },
  
  cardHighlight: {
    backgroundColor: colors.brand50,
    ...shadows.none,
  },
  
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
  },
  
  // Time Display Grid
  timeGrid: {
    flexDirection: 'row',
    gap: spacing.space3,
    marginBottom: spacing.space3,
  },
  
  timeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space3,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  
  timeLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  timeValue: {
    ...typography.headlineSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  // Time Change Indicator
  timeChangeIndicator: {
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.md,
    marginTop: spacing.space2,
    alignSelf: 'flex-start',
  },
  
  timeChangePositive: {
    backgroundColor: colors.success50,
  },
  
  timeChangeNegative: {
    backgroundColor: colors.error50,
  },
  
  timeChangeText: {
    ...typography.labelSmall,
    fontWeight: '500',
  },
  
  timeChangeTextPositive: {
    color: colors.success700,
  },
  
  timeChangeTextNegative: {
    color: colors.error700,
  },
  
  // Summary Row
  summaryRow: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  
  // Change Preview
  changePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  changePreviewLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  changePreviewValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  changePreviewValueNew: {
    ...typography.bodyMedium,
    color: colors.brand600,
    fontWeight: '600',
  },
  
  changePreviewDiff: {
    ...typography.bodyMedium,
    color: colors.brand600,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.space4,
  },
  
  // Fixed Bottom
  fixedBottom: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space3,
    paddingBottom: safeAreaBottom + spacing.space3,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  
  submitButton: {
    height: ms(52),
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  submitButtonDisabled: {
    backgroundColor: colors.neutral200,
  },
  
  submitButtonText: {
    ...typography.labelLarge,
    color: colors.white,
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
  
  changeIndicator: {
    entering: FadeIn.duration(200),
    scale: withSequence(
      withTiming(1.05, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
  
  previewUpdate: {
    entering: FadeIn.duration(200),
    layout: Layout.springify(),
  },
  
  buttonPress: {
    scale: withSequence(
      withTiming(0.98, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
};
```

---

## 유효성 검사

| 필드 | 규칙 | 에러 메시지 |
|------|------|------------|
| 날짜 | 필수 | "날짜를 선택해주세요" |
| 날짜 | 수정 가능 기간 내 | "수정 가능 기간이 지났습니다" |
| 출근 시간 | 필수 | "출근 시간을 선택해주세요" |
| 퇴근 시간 | 필수 | "퇴근 시간을 선택해주세요" |
| 시간 변경 | 최소 1개 변경 | "변경된 시간이 없습니다" |
| 사유 | 10자 이상 | "사유는 10자 이상 입력해주세요" |

---

## 상태 관리

```typescript
interface EditRequestState {
  // 폼 데이터
  selectedDate: Date | null;
  originalRecord: AttendanceRecord | null;
  newCheckIn: Date | null;
  newCheckOut: Date | null;
  reason: string;
  
  // 계산 데이터
  originalWorkHours: number;
  newWorkHours: number;
  originalSalary: number;
  newSalary: number;
  
  // UI 상태
  isLoading: boolean;
  isSubmitting: boolean;
  showDatePicker: boolean;
  showTimePicker: 'checkIn' | 'checkOut' | null;
  
  // 유효성
  errors: Record<string, string>;
  isValid: boolean;
}
```

---

## 접근성

```typescript
const accessibility = {
  header: {
    accessibilityRole: 'header',
    accessibilityLabel: '근태 수정 요청 화면',
  },
  
  dateSelector: {
    accessibilityRole: 'button',
    accessibilityLabel: '수정할 날짜 선택',
    accessibilityHint: '두 번 탭하여 달력 열기',
  },
  
  timeSelector: {
    accessibilityRole: 'button',
    accessibilityLabel: (type: string, time: string) =>
      `${type} 시간: ${time}`,
    accessibilityHint: '두 번 탭하여 시간 변경',
  },
  
  changeIndicator: {
    accessibilityRole: 'text',
    accessibilityLabel: (before: string, after: string, diff: string) =>
      `${before}에서 ${after}로 변경, ${diff}`,
  },
  
  submitButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '수정 요청 제출',
    accessibilityState: { disabled: !isValid },
  },
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    type: 'alert',
    title: '기록을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  submitError: {
    type: 'toast',
    message: '수정 요청에 실패했습니다. 다시 시도해주세요.',
  },
  
  alreadyPending: {
    type: 'alert',
    title: '수정 요청 대기 중',
    message: '이미 수정 요청이 진행 중인 날짜입니다.',
  },
  
  submitSuccess: {
    type: 'toast',
    message: '수정 요청이 제출되었습니다.',
    onDismiss: 'navigateBack',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'InfoBanner',
    'OriginalRecordCard',
    'TimeChangeIndicator',
    'ChangePreviewCard',
  ],
  
  debouncedCalculation: {
    delay: 300,
    functions: ['calculateWorkHours', 'calculateSalary'],
  },
  
  lazyLoading: [
    'DatePicker',
    'TimePicker',
  ],
};
```
