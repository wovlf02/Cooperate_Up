# 급여 관리 화면 상세 설계

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 🎯 UX 목표
- **투명한 급여 정보**: 상세 산출식으로 급여 계산 과정 명확화
- **편리한 지급 관리**: 체크리스트 기반 간편한 지급 현황 관리
- **법적 준수**: 법정 수당(야간, 연장, 휴일) 자동 계산
- **다양한 추출**: PDF, Excel 형식 급여명세서 제공

---

## 1. PayrollListScreen (급여 목록)

### 1.1 화면 개요
| 항목 | 내용 |
|------|------|
| 경로 | /payroll |
| 권한 | 공통 |
| 설명 | 월별 급여 목록 조회 |

### 1.2 레이아웃 - 사업주 뷰

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   급여 관리              [Excel]  │ │
│ │                           download  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Month Selector                         │
│ ┌─────────────────────────────────────┐ │
│ │  ┌────┐                   ┌────┐    │ │
│ │  │ ◀  │   2024년 12월     │ ▶  │    │ │
│ │  └────┘  displaySmall     └────┘    │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Summary Card                           │
│ ┌─────────────────────────────────────┐ │
│ │  📊 월간 요약                       │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌───────────┬───────────┐          │ │
│ │  │ 총 급여   │총 근무시간│          │ │
│ │  │₩3,500,000 │  350시간  │          │ │
│ │  │  brand500 │  brand500 │          │ │
│ │  └───────────┴───────────┘          │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  Payroll List (FlatList)                │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 👤 김직원                   │    │ │
│ │  │                             │    │ │
│ │  │ 📅 근무: 120시간            │    │ │
│ │  │ 💰 시급: ₩10,030            │    │ │
│ │  │                             │    │ │
│ │  │ 💵 급여: ₩1,203,600     >   │    │ │
│ │  │    displaySmall, brand500   │    │ │
│ │  │                             │    │ │
│ │  │ borderRadius: borderRadius.xl    │ │
│ │  │ shadows.sm                  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  gap: spacing.space3                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 1.3 컴포넌트 스타일

```typescript
const monthSelectorStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  
  button: {
    width: ms(40),
    height: ms(40),
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonIcon: {
    color: colors.textSecondary,
  },
  
  monthText: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
};

const summaryCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.space5,
    ...shadows.md,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
    paddingBottom: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.lg,
  },
  
  statLabel: {
    ...typography.labelMedium,
    color: colors.brand600,
    marginBottom: spacing.space2,
  },
  
  statValue: {
    ...typography.titleLarge,
    color: colors.brand600,
    fontWeight: '700',
  },
};

const payrollCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  
  avatar: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  name: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  infoIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  
  infoText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.space3,
    paddingTop: spacing.space3,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  
  totalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  totalValue: {
    ...typography.displaySmall,
    color: colors.brand500,
    fontWeight: '700',
  },
  
  chevron: {
    color: colors.neutral300,
    marginLeft: spacing.space2,
  },
};
```

---

## 2. PayrollDetailScreen (급여 명세서)

### 2.1 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   급여 명세서              [PDF]  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  ScrollView                             │
│  paddingHorizontal: layout.screenPadding│
│                                         │
│  Document Header Card                   │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     ━━━━━━━━━━━━━━━━━━━━            │ │
│ │       급  여  명  세  서            │ │
│ │     ━━━━━━━━━━━━━━━━━━━━            │ │
│ │                                     │ │
│ │  사업장: 00카페 강남점              │ │
│ │  직원명: 김직원                     │ │
│ │  기  간: 2024년 12월 1일 ~ 31일     │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Payment Section (지급 내역)            │
│ ┌─────────────────────────────────────┐ │
│ │  💰 지급 내역 (산출식)              │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  기본급              ₩1,208,610     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 120시간 30분 × ₩10,030  │    │ │
│ │  │ backgroundColor: neutral50 │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  주휴수당              ₩200,600     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 (40h ÷ 5일) × 4주       │    │ │
│ │  │    × ₩10,030                │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  연장근로수당           ₩75,225     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 5시간 × ₩10,030 × 1.5   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  야간근로수당           ₩50,150     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 10시간 × ₩10,030 × 0.5  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │  지급 합계           ₩1,534,585     │ │
│ │  typography.titleLarge, brand600   │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Deduction Section (공제 내역)          │
│ ┌─────────────────────────────────────┐ │
│ │  📉 공제 내역 (산출식)              │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  국민연금               ₩69,057     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 ₩1,534,585 × 4.5%       │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  건강보험               ₩54,401     │ │
│ │  장기요양보험            ₩7,045     │ │
│ │  고용보험               ₩13,811     │ │
│ │  소득세                 ₩45,320     │ │
│ │  지방소득세              ₩4,532     │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │  공제 합계             ₩194,166     │ │
│ │  typography.titleLarge, error       │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Net Pay Card (실 지급액)               │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  💵 실 지급액                       │ │
│ │                                     │ │
│ │       ₩1,340,419                    │ │
│ │       displayMedium, brand500       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📐 ₩1,534,585 - ₩194,166   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(4) + safeArea        │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 컴포넌트 스타일

```typescript
const payrollDetailStyles = {
  documentHeader: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    marginTop: spacing.space4,
    alignItems: 'center',
    ...shadows.md,
  },
  
  documentTitle: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space4,
  },
  
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
    paddingBottom: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  
  paymentLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  paymentValue: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  formulaBox: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginTop: spacing.space1,
    marginBottom: spacing.space3,
  },
  
  formulaIcon: {
    fontSize: ms(12),
    marginRight: spacing.space1,
  },
  
  formulaText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.space3,
    paddingTop: spacing.space3,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  
  totalLabel: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  totalValue: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  
  netPayCard: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    alignItems: 'center',
    marginBottom: spacing.space4,
    ...shadows.md,
  },
  
  netPayLabel: {
    ...typography.titleMedium,
    color: colors.brand600,
    marginBottom: spacing.space2,
  },
  
  netPayValue: {
    ...typography.displayMedium,
    color: colors.brand500,
    fontWeight: '700',
  },
};
```

---

## 3. PayrollPaymentScreen (급여 지급 관리)

### 3.1 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   12월 급여 지급 관리             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Payment Summary Card                   │
│ ┌─────────────────────────────────────┐ │
│ │  📊 지급 현황                       │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌───────────┬───────────┐          │ │
│ │  │ 지급완료  │  미지급   │          │ │
│ │  │   3명     │   2명     │          │ │
│ │  │ ✅success │ ⏳warning │          │ │
│ │  └───────────┴───────────┘          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 총 급여      ₩5,436,260    │    │ │
│ │  │ 지급 완료    ₩3,256,480    │    │ │
│ │  │ 미지급       ₩2,179,780    │    │ │
│ │  │ backgroundColor: neutral50 │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  (급여 지급일 당일)                     │
│  Notice Banner                          │
│ ┌─────────────────────────────────────┐ │
│ │  🔔 오늘은 급여 지급일입니다        │ │
│ │     급여 지급 완료 후 체크해주세요   │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.lg      │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Payment Checklist                      │
│ ┌─────────────────────────────────────┐ │
│ │  📋 직원별 지급 체크리스트          │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ☑️ 김철수        ₩1,645,031 │    │ │
│ │  │ ✅ 지급완료 12/10 15:30     │    │ │
│ │  │ backgroundColor: success50  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  gap: spacing.space2                │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ⬜ 최지연        ₩1,456,780 │    │ │
│ │  │ ⏳ 미지급                   │    │ │
│ │  │ [지급 완료 체크]            │    │ │
│ │  │ backgroundColor: warning50  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(4) + safeArea        │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 컴포넌트 스타일

```typescript
const paymentStyles = {
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    ...shadows.md,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
    marginBottom: spacing.space4,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    borderRadius: borderRadius.lg,
  },
  
  statItemPaid: {
    backgroundColor: colors.success50,
  },
  
  statItemUnpaid: {
    backgroundColor: colors.warning50,
  },
  
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.space4,
  },
  
  checklistCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.space2,
  },
  
  checklistItemPaid: {
    backgroundColor: colors.success50,
  },
  
  checklistItemUnpaid: {
    backgroundColor: colors.warning50,
  },
  
  checkbox: {
    width: ms(24),
    height: ms(24),
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  
  checkboxUnchecked: {
    backgroundColor: colors.white,
    borderColor: colors.neutral300,
  },
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  itemAmount: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  itemStatus: {
    ...typography.labelSmall,
    marginTop: spacing.space1,
  },
  
  payButton: {
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.md,
  },
};
```

---

## 애니메이션

```typescript
const screenAnimations = {
  monthChange: {
    entering: FadeIn.duration(200),
    exiting: FadeOut.duration(150),
  },
  
  cardEntry: (index: number) => ({
    entering: FadeInUp.delay(100 + index * 50).duration(400).springify(),
  }),
  
  paymentCheck: {
    scale: withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
    backgroundColor: withTiming(colors.success50, { duration: 300 }),
  },
  
  netPayReveal: {
    entering: ZoomIn.delay(300).duration(500).springify(),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  monthSelector: {
    accessibilityRole: 'adjustable',
    accessibilityLabel: (year, month) => `${year}년 ${month}월`,
    accessibilityHint: '좌우로 스와이프하여 월 변경',
  },
  
  payrollCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (name, hours, wage) =>
      `${name}, ${hours}시간 근무, 급여 ${wage}원`,
    accessibilityHint: '두 번 탭하여 상세 내역 보기',
  },
  
  paymentCheckbox: {
    accessibilityRole: 'checkbox',
    accessibilityState: { checked: isPaid },
    accessibilityLabel: (name, amount) =>
      `${name}님 ${amount}원 ${isPaid ? '지급완료' : '미지급'}`,
  },
  
  pdfButton: {
    accessibilityRole: 'button',
    accessibilityLabel: 'PDF 다운로드',
  },
};
```

---

## 상태 관리

```typescript
interface PayrollState {
  // 기간
  selectedMonth: string; // "2024-12"
  
  // 목록
  payrolls: PayrollSummary[];
  
  // 상세
  detail: PayrollDetail | null;
  
  // 지급 관리
  payments: PaymentStatus[];
  paymentSummary: {
    total: number;
    paid: number;
    unpaid: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  
  // UI
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
}
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    title: '급여 정보를 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  exportError: {
    type: 'toast',
    message: 'PDF 생성에 실패했습니다',
  },
  
  paymentError: {
    type: 'toast',
    message: '지급 상태 변경에 실패했습니다',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  flatListConfig: {
    initialNumToRender: 5,
    maxToRenderPerBatch: 3,
    windowSize: 5,
    removeClippedSubviews: true,
  },
  
  pdfGeneration: {
    quality: 0.8,
    compression: true,
    async: true,
  },
  
  memoizedComponents: [
    'PayrollCard',
    'PaymentItem',
    'MonthSelector',
  ],
  
  useMemo: [
    'paymentSummary',
    'formattedPayrolls',
  ],
};
```
