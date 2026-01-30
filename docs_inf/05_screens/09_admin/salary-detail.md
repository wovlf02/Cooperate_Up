# 급여 명세서 화면 (SalaryDetailScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

근무자별 월간 급여 상세 내역을 보여주고 PDF로 내보내는 화면입니다.

### 🎯 UX 목표
- **명확한 정보**: 급여 계산 내역을 투명하게 표시
- **편리한 공유**: PDF 내보내기 및 공유 기능
- **상세 내역**: 일별 근무 기록 확인 가능

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←  김철수 급여 명세서      [📄 PDF]│ │
│ │ back typography.titleLarge  action  │ │
│ │      fontWeight: 600                │ │
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
│  기본 정보 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📋 기본 정보                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 이름              김철수    │    │ │
│ │  ├─────────────────────────────┤    │ │
│ │  │ 정산 기간         2024.12.01│    │ │
│ │  │                  ~ 12.31    │    │ │
│ │  ├─────────────────────────────┤    │ │
│ │  │ 시급             ₩10,500    │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  row style:                         │ │
│ │  - paddingVertical: spacing.space3  │ │
│ │  - borderBottomWidth: 1             │ │
│ │  - borderBottomColor: neutral100    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  근무 요약 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📊 근무 요약                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌──────────┬──────────┐     │    │ │
│ │  │ │  근무일  │총 근무시간│     │    │ │
│ │  │ │labelSmall│labelSmall│     │    │ │
│ │  │ │textTertia│textTertia│     │    │ │
│ │  │ │          │          │     │    │ │
│ │  │ │   18일   │  153시간 │     │    │ │
│ │  │ │ displayS │ displayS │     │    │ │
│ │  │ │ bold     │ bold     │     │    │ │
│ │  │ └──────────┴──────────┘     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  급여 계산 카드                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  💰 급여 계산                       │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  시급 × 근무시간                    │ │
│ │  typography.bodyMedium              │ │
│ │  color: textSecondary               │ │
│ │                                     │ │
│ │  ₩10,500 × 153시간                 │ │
│ │  typography.bodyLarge               │ │
│ │  color: textPrimary                 │ │
│ │  marginTop: spacing.space1          │ │
│ │                                     │ │
│ │  ════════════════════════           │ │
│ │  double line separator              │ │
│ │  marginVertical: spacing.space4     │ │
│ │                                     │ │
│ │  총 급여                            │ │
│ │  typography.labelMedium             │ │
│ │  color: textTertiary                │ │
│ │  textAlign: center                  │ │
│ │                                     │ │
│ │       ₩1,606,500                   │ │
│ │       typography.displayMedium      │ │
│ │       fontWeight: 700               │ │
│ │       color: brand600               │ │
│ │       textAlign: center             │ │
│ │                                     │ │
│ │  backgroundColor: brand50           │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  일별 근무 내역 카드                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  📅 일별 근무 내역                  │ │
│ │  typography.titleSmall              │ │
│ │  fontWeight: 600                    │ │
│ │  marginBottom: spacing.space4       │ │
│ │                                     │ │
│ │  Table Header                       │ │
│ │  ┌──────┬──────┬──────┬─────┬─────┐│ │
│ │  │ 날짜 │ 출근 │ 퇴근 │시간 │ 급여││ │
│ │  │      │      │      │     │     ││ │
│ │  │labelS│labelS│labelS│labS│labS ││ │
│ │  │textTe│textTe│textTe│texT│texT ││ │
│ │  └──────┴──────┴──────┴─────┴─────┘│ │
│ │  backgroundColor: neutral50         │ │
│ │  paddingVertical: spacing.space2    │ │
│ │                                     │ │
│ │  Table Rows                         │ │
│ │  ┌──────┬──────┬──────┬─────┬──────┐ │
│ │  │12/01 │20:00 │04:00 │ 8h  │₩84,000│ │
│ │  ├──────┼──────┼──────┼─────┼──────┤ │
│ │  │12/02 │20:30 │04:30 │ 8h  │₩84,000│ │
│ │  ├──────┼──────┼──────┼─────┼──────┤ │
│ │  │12/03 │21:00 │05:00 │ 8h  │₩84,000│ │
│ │  ├──────┼──────┼──────┼─────┼──────┤ │
│ │  │ ...  │ ...  │ ...  │ ... │ ...  │ │
│ │  └──────┴──────┴──────┴─────┴──────┘ │
│ │  row height: ms(44)                 │ │
│ │  typography.labelSmall              │ │
│ │                                     │ │
│ │  Table Footer                       │ │
│ │  ┌──────┬──────┬──────┬─────┬──────┐ │
│ │  │ 합계 │  -   │  -   │153h │₩1,606,500│
│ │  └──────┴──────┴──────┴─────┴──────┘ │
│ │  backgroundColor: neutral50         │ │
│ │  fontWeight: 600                    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  padding: spacing.space4            │ │
│ │  shadows.sm                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: safeAreaBottom + spacing.space4
│                                         │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const salaryDetailStyles = {
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
  
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space4,
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  infoRowLast: {
    borderBottomWidth: 0,
  },
  
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  
  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
  },
  
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space3,
  },
  
  summaryLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  summaryValue: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  // Calculation
  calculationFormula: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  calculationValues: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.space1,
  },
  
  doubleSeparator: {
    height: 2,
    backgroundColor: colors.neutral200,
    marginVertical: spacing.space4,
  },
  
  totalLabel: {
    ...typography.labelMedium,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.space1,
  },
  
  totalValue: {
    ...typography.displayMedium,
    color: colors.brand600,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Table
  tableContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral50,
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space2,
  },
  
  tableHeaderCell: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  tableCell: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: colors.neutral50,
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space2,
  },
  
  tableFooterCell: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Column widths (flex ratios)
  colDate: { flex: 1.2 },
  colTime: { flex: 1 },
  colHours: { flex: 0.8 },
  colSalary: { flex: 1.3 },
  
  // PDF Button
  pdfButton: {
    padding: spacing.space2,
    marginRight: -spacing.space2,
  },
  
  pdfButtonText: {
    ...typography.labelMedium,
    color: colors.brand500,
    fontWeight: '600',
  },
};
```

---

## PDF 내보내기 모달

```
┌─────────────────────────────────────────┐
│                                         │
│         (Backdrop)                      │
│                                         │
│      ┌─────────────────────────┐        │
│      │                         │        │
│      │         📄               │        │
│      │                         │        │
│      │    PDF 내보내기          │        │
│      │  typography.titleLarge   │        │
│      │                         │        │
│      │  급여 명세서를 PDF로     │        │
│      │  저장하시겠습니까?       │        │
│      │  typography.bodyMedium   │        │
│      │  color: textSecondary    │        │
│      │                         │        │
│      │  ┌───────┐  ┌───────┐   │        │
│      │  │ 취소  │  │ 저장  │   │        │
│      │  │neutral│  │primary│   │        │
│      │  └───────┘  └───────┘   │        │
│      │                         │        │
│      └─────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

---

## PDF 생성 완료 모달

```
┌─────────────────────────────────────────┐
│                                         │
│      ┌─────────────────────────┐        │
│      │                         │        │
│      │         ✅               │        │
│      │                         │        │
│      │    저장 완료             │        │
│      │                         │        │
│      │  김철수_2024년12월_      │        │
│      │  급여명세서.pdf          │        │
│      │  typography.bodySmall    │        │
│      │  color: textSecondary    │        │
│      │                         │        │
│      │  ┌───────┐  ┌───────┐   │        │
│      │  │ 확인  │  │ 공유  │   │        │
│      │  │neutral│  │primary│   │        │
│      │  └───────┘  └───────┘   │        │
│      │                         │        │
│      └─────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 애니메이션

```typescript
const animations = {
  cardAppear: {
    entering: FadeInDown.delay(100).duration(300).springify(),
  },
  
  totalValueCount: {
    // AnimatedNumber for counting up effect
    duration: 800,
    easing: Easing.out(Easing.cubic),
  },
  
  tableRowAppear: {
    entering: FadeIn.delay((index) => 200 + index * 50).duration(200),
  },
};
```

---

## 상태 관리

```typescript
interface SalaryDetailState {
  // 데이터
  employeeInfo: {
    id: string;
    name: string;
    hourlyRate: number;
  };
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    workDays: number;
    totalHours: number;
    totalSalary: number;
  };
  dailyRecords: DailyRecord[];
  
  // UI 상태
  isLoading: boolean;
  isPdfGenerating: boolean;
  showExportModal: boolean;
  showSuccessModal: boolean;
  pdfFilePath: string | null;
  error: string | null;
}

interface DailyRecord {
  date: Date;
  checkIn: Date;
  checkOut: Date;
  hours: number;
  salary: number;
}
```

---

## 접근성

```typescript
const accessibility = {
  pdfButton: {
    accessibilityRole: 'button',
    accessibilityLabel: 'PDF로 내보내기',
    accessibilityHint: '두 번 탭하여 급여 명세서를 PDF로 저장',
  },
  
  totalSalary: {
    accessibilityRole: 'text',
    accessibilityLabel: (amount: number) =>
      `총 급여: ${amount.toLocaleString()}원`,
  },
  
  tableRow: {
    accessibilityRole: 'text',
    accessibilityLabel: (record: DailyRecord) =>
      `${format(record.date, 'M월 d일')}: ${record.hours}시간 근무, ${record.salary.toLocaleString()}원`,
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
    title: '명세서를 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: {
      label: '다시 시도',
      onPress: 'retry',
    },
  },
  
  pdfError: {
    type: 'toast',
    message: 'PDF 생성에 실패했습니다. 다시 시도해주세요.',
  },
  
  shareError: {
    type: 'toast',
    message: '공유에 실패했습니다.',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'InfoCard',
    'SummaryCard',
    'CalculationCard',
    'TableRow',
  ],
  
  tableOptimization: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 5,
  },
};
```
