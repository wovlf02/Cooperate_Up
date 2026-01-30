# 수동 근태 입력 화면 (ManualInputScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

출퇴근 버튼을 누르지 못한 경우 수동으로 근태를 입력하는 화면입니다.

### 🎯 UX 목표
- **간편한 입력**: 최소 단계로 근태 입력 완료
- **명확한 안내**: 입력 가이드 및 제약사항 명시
- **실시간 계산**: 예상 근무시간/급여 실시간 표시

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ✕      수동 근태 입력               │ │
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
│ │ │ 출퇴근 버튼을 누르지 못한 경우│   │ │
│ │ │ 수동으로 근태를 입력할 수     │   │ │
│ │ │ 있습니다.                     │   │ │
│ │ │                               │   │ │
│ │ │ 입력된 내용은 관리자 승인 후  │   │ │
│ │ │ 급여에 반영됩니다.            │   │ │
│ │ │                               │   │ │
│ │ │ typography.bodySmall          │   │ │
│ │ │ color: info700                │   │ │
│ │ │ backgroundColor: info50       │   │ │
│ │ │ borderRadius: borderRadius.lg │   │ │
│ │ │ padding: spacing.space4       │   │ │
│ │ └───────────────────────────────┘   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  입력 폼 카드                           │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📝 근태 정보 입력                  │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  날짜 *                             │ │
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
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────┬─────────────┐      │ │
│ │  │ 출근 시간 * │ 퇴근 시간 * │      │ │
│ │  │             │             │      │ │
│ │  │ ┌─────────┐ │ ┌─────────┐ │      │ │
│ │  │ │🕐 20:00▼│ │ │🕐 04:30▼│ │      │ │
│ │  │ └─────────┘ │ └─────────┘ │      │ │
│ │  │             │             │      │ │
│ │  │ gap: spacing.space3       │      │ │
│ │  └─────────────┴─────────────┘      │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  예상 근무 정보 카드                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📊 예상 근무 정보                  │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌──────────┬──────────┐     │    │ │
│ │  │ │ 근무시간 │ 예상급여 │     │    │ │
│ │  │ │labelSmall│labelSmall│     │    │ │
│ │  │ │textTertia│textTertia│     │    │ │
│ │  │ │          │          │     │    │ │
│ │  │ │  8.5시간 │ ₩85,255  │     │    │ │
│ │  │ │ titleLarg│ titleLarg│     │    │ │
│ │  │ │ bold     │ brand600 │     │    │ │
│ │  │ └──────────┴──────────┘     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ⚠️ 20시 이전 출근은         │    │ │
│ │  │    20시부터 계산됩니다.     │    │ │
│ │  │                             │    │ │
│ │  │  typography.labelSmall      │    │ │
│ │  │  color: warning700          │    │ │
│ │  │  backgroundColor: warning50 │    │ │
│ │  │  borderRadius: borderRadius.md   │ │
│ │  │  padding: spacing.space3    │    │ │
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
│ │  color: textSecondary               │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │  수동 입력 사유를           │    │ │
│ │  │  입력해주세요...            │    │ │
│ │  │                             │    │ │
│ │  │  예: 휴대폰 배터리 방전으로 │    │ │
│ │  │  출퇴근 버튼을 누르지 못함  │    │ │
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
│ │  │           제출              │    │ │
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
const manualInputStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
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
  
  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    ...shadows.sm,
  },
  
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
  },
  
  // Time Row
  timeRow: {
    flexDirection: 'row',
    gap: spacing.space3,
    marginBottom: spacing.space4,
  },
  
  timeColumn: {
    flex: 1,
  },
  
  // Preview Card
  previewCard: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
  },
  
  previewGrid: {
    flexDirection: 'row',
    marginBottom: spacing.space4,
  },
  
  previewItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space3,
  },
  
  previewLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  previewValue: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  
  previewValueHours: {
    color: colors.textPrimary,
  },
  
  previewValueSalary: {
    color: colors.brand600,
  },
  
  // Warning Notice
  warningNotice: {
    flexDirection: 'row',
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    gap: spacing.space2,
  },
  
  warningText: {
    flex: 1,
    ...typography.labelSmall,
    color: colors.warning700,
    lineHeight: ms(18),
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

## 유효성 검사

| 필드 | 규칙 | 에러 메시지 |
|------|------|------------|
| 날짜 | 필수 | "날짜를 선택해주세요" |
| 날짜 | 과거 7일 이내 | "7일 이전 날짜는 입력할 수 없습니다" |
| 날짜 | 미래 불가 | "미래 날짜는 입력할 수 없습니다" |
| 날짜 | 중복 확인 | "해당 날짜에 이미 근무 기록이 있습니다" |
| 출근 시간 | 필수 | "출근 시간을 선택해주세요" |
| 퇴근 시간 | 필수 | "퇴근 시간을 선택해주세요" |
| 퇴근 시간 | 출근 후 | "퇴근 시간은 출근 시간 이후여야 합니다" |
| 사유 | 10자 이상 | "사유는 10자 이상 입력해주세요" |

---

## 날짜/시간 선택 제한

```typescript
const dateTimeConstraints = {
  date: {
    minDate: subDays(new Date(), 7),  // 7일 전
    maxDate: new Date(),              // 오늘
    disabledDates: existingAttendanceDates,
  },
  
  checkInTime: {
    minTime: '18:00',
    maxTime: '23:59',
    defaultTime: '20:00',
    interval: 30,  // 30분 단위
  },
  
  checkOutTime: {
    minTime: (checkIn) => addHours(checkIn, 1),
    maxTime: '08:00',  // 익일
    defaultTime: '04:00',
    interval: 30,
  },
};
```

---

## 상태 관리

```typescript
interface ManualInputState {
  // 폼 데이터
  selectedDate: Date | null;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  reason: string;
  
  // 계산 데이터
  workHours: number;
  expectedSalary: number;
  
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

## 애니메이션

```typescript
const animations = {
  cardAppear: {
    entering: FadeInDown.delay(100).duration(300).springify(),
  },
  
  previewUpdate: {
    entering: FadeIn.duration(200),
    value: withSpring,
  },
  
  buttonPress: {
    scale: withSequence(
      withTiming(0.98, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
  },
  
  warningAppear: {
    entering: FadeInUp.duration(200),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  dateSelector: {
    accessibilityRole: 'button',
    accessibilityLabel: (date: string) => `날짜 선택: ${date}`,
    accessibilityHint: '두 번 탭하여 달력 열기',
  },
  
  timeSelector: {
    accessibilityRole: 'button',
    accessibilityLabel: (type: string, time: string) =>
      `${type} 시간: ${time}`,
    accessibilityHint: '두 번 탭하여 시간 선택',
  },
  
  previewInfo: {
    accessibilityRole: 'text',
    accessibilityLabel: (hours: number, salary: number) =>
      `예상 근무시간 ${hours}시간, 예상 급여 ${salary}원`,
  },
  
  submitButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '근태 입력 제출',
    accessibilityState: { disabled: !isValid },
  },
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  dateConflict: {
    type: 'alert',
    title: '기록 중복',
    message: '해당 날짜에 이미 근무 기록이 있습니다.\n수정을 원하시면 근태 수정 요청을 이용해주세요.',
    confirmText: '확인',
  },
  
  submitError: {
    type: 'toast',
    message: '제출에 실패했습니다. 다시 시도해주세요.',
  },
  
  submitSuccess: {
    type: 'toast',
    message: '근태 입력이 완료되었습니다. 관리자 승인을 기다려주세요.',
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
    'PreviewCard',
    'WarningNotice',
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
