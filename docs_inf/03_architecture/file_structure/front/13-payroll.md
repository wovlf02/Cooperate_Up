// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\13-payroll.md
# 급여 도메인 파일 구조 (Payroll Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

급여 관리 및 조회 관련 화면입니다.
- **급여 명세**: 근무자 본인 급여 확인
- **급여 관리**: 관리자 급여 지급 관리
- **급여 상세**: 상세 내역 및 공제 정보 (원 단위 전체 표시)

---

## 디렉토리 구조

```
src/features/payroll/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~6 lines)
│   │
│   ├── PayrollMainScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollMainScreen.tsx       # 급여 메인 (근무자) (~80 lines)
│   │   └── PayrollMainScreen.styles.ts # (~50 lines)
│   │
│   ├── PayrollDetailScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollDetailScreen.tsx     # 급여 상세 (~85 lines)
│   │   └── PayrollDetailScreen.styles.ts # (~55 lines)
│   │
│   ├── PayrollManagementScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollManagementScreen.tsx # 급여 관리 (관리자) (~85 lines)
│   │   └── PayrollManagementScreen.styles.ts # (~50 lines)
│   │
│   └── PayrollHistoryScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── PayrollHistoryScreen.tsx    # 급여 내역 (~75 lines)
│       └── PayrollHistoryScreen.styles.ts # (~45 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~14 lines)
│   │
│   ├── PayrollSummaryCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollSummaryCard.tsx      # 급여 요약 카드 (~55 lines)
│   │   └── PayrollSummaryCard.styles.ts # (~50 lines)
│   │
│   ├── PayrollBreakdown/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollBreakdown.tsx        # 급여 내역 (~55 lines)
│   │   ├── PayrollBreakdown.styles.ts  # (~45 lines)
│   │   └── BreakdownItem.tsx           # 내역 항목 (~35 lines)
│   │
│   ├── DeductionSection/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── DeductionSection.tsx        # 공제 항목 (~50 lines)
│   │   └── DeductionSection.styles.ts  # (~40 lines)
│   │
│   ├── WorkSummary/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkSummary.tsx             # 근무 요약 (~45 lines)
│   │   └── WorkSummary.styles.ts       # (~35 lines)
│   │
│   ├── PayrollHistoryItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PayrollHistoryItem.tsx      # 급여 내역 항목 (~45 lines)
│   │   └── PayrollHistoryItem.styles.ts # (~40 lines)
│   │
│   ├── EmployeePayrollCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeePayrollCard.tsx     # 직원 급여 카드 (~50 lines)
│   │   └── EmployeePayrollCard.styles.ts # (~45 lines)
│   │
│   └── PaymentStatusBadge/
│       ├── index.ts                    # (~3 lines)
│       ├── PaymentStatusBadge.tsx      # 지급 상태 배지 (~35 lines)
│       └── PaymentStatusBadge.styles.ts # (~30 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~9 lines)
│   ├── usePayroll.ts                   # 급여 조회 (~55 lines)
│   ├── usePayrollDetail.ts             # 급여 상세 (~50 lines)
│   ├── usePayrollManagement.ts         # 급여 관리 (목록) (~55 lines)
│   ├── usePayrollHistory.ts            # 급여 내역 (~45 lines)
│   ├── usePayrollCalculate.ts          # 급여 계산 (미리보기) (~45 lines)
│   ├── usePayrollGenerate.ts           # 급여 생성 (~45 lines)
│   ├── usePayrollConfirm.ts            # 급여 확정 (~40 lines)
│   └── usePayrollPaid.ts               # 지급완료 처리 (~40 lines)
│
├── types/
│   └── payroll.types.ts                # 급여 타입 정의 (~55 lines)
│
├── constants/
│   └── payroll.constants.ts            # 급여 상수 (~25 lines)
│
└── utils/
    └── payrollCalculator.ts            # 급여 계산 유틸 (~60 lines)
```

---

## 스크린 상세

### PayrollMainScreen.tsx (~80 lines)

```typescript
import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, EmptyState } from '@components/common';
import { MonthSelector } from '@features/admin/components';
import { PayrollSummaryCard, PayrollBreakdown, WorkSummary } from '../components';
import { usePayroll } from '../hooks';
import { styles } from './PayrollMainScreen.styles';

const PayrollMainScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const {
    currentMonth,
    setCurrentMonth,
    payrollData,
    isLoading,
    refresh,
    isRefreshing,
  } = usePayroll();

  const handleViewDetail = () => {
    navigation.navigate('PayrollDetail', { month: currentMonth.toISOString() });
  };

  const handleViewHistory = () => {
    navigation.navigate('PayrollHistory');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="급여" 
        rightElement={
          <TextButton title="내역" onPress={handleViewHistory} />
        }
      />
      
      <MonthSelector
        currentMonth={currentMonth}
        onChange={setCurrentMonth}
      />
      
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        {payrollData ? (
          <>
            <PayrollSummaryCard
              totalSalary={payrollData.totalSalary}
              netSalary={payrollData.netSalary}
              paymentStatus={payrollData.paymentStatus}
              paymentDate={payrollData.paymentDate}
              onPress={handleViewDetail}
            />
            
            <WorkSummary
              workDays={payrollData.workDays}
              totalHours={payrollData.totalHours}
              nightHours={payrollData.nightHours}
            />
            
            <PayrollBreakdown
              items={[
                { label: '기본급', amount: payrollData.baseSalary },
                { label: '야간수당', amount: payrollData.nightAllowance },
                { label: '주휴수당', amount: payrollData.weeklyAllowance },
              ]}
            />
          </>
        ) : (
          <EmptyState
            icon="💰"
            title="급여 정보가 없습니다"
            description="해당 월에 근무 기록이 없습니다"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default PayrollMainScreen;
```

### PayrollDetailScreen.tsx (~85 lines)

```typescript
import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, BaseCard, IconButton } from '@components/common';
import { CurrencyDisplay } from '@components/shared';
import {
  PayrollBreakdown,
  DeductionSection,
  WorkSummary,
  PaymentStatusBadge,
} from '../components';
import { usePayrollDetail } from '../hooks';
import { styles } from './PayrollDetailScreen.styles';

interface RouteParams {
  month: string;
}

const PayrollDetailScreen = (): JSX.Element => {
  const route = useRoute();
  const { month } = route.params as RouteParams;
  const selectedMonth = new Date(month);
  
  const { payrollDetail, downloadPdf, isLoading } = usePayrollDetail(selectedMonth);

  const formatMonthTitle = () => {
    return selectedMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  };

  const handleDownloadPdf = async () => {
    await downloadPdf();
  };

  if (!payrollDetail) {
    return (
      <View style={styles.container}>
        <Header title="급여 상세" />
        <View style={styles.loading}>
          <Text>로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${formatMonthTitle()} 급여`}
        rightElement={
          <IconButton icon="download" onPress={handleDownloadPdf} />
        }
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* 총 급여 */}
        <BaseCard style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>실수령액</Text>
            <PaymentStatusBadge status={payrollDetail.paymentStatus} />
          </View>
          <CurrencyDisplay
            amount={payrollDetail.netSalary}
            style={styles.totalAmount}
          />
          {payrollDetail.paymentDate && (
            <Text style={styles.paymentDate}>
              지급일: {payrollDetail.paymentDate.toLocaleDateString('ko-KR')}
            </Text>
          )}
        </BaseCard>

        {/* 근무 요약 */}
        <WorkSummary
          workDays={payrollDetail.workDays}
          totalHours={payrollDetail.totalHours}
          nightHours={payrollDetail.nightHours}
        />

        {/* 급여 항목 */}
        <BaseCard style={styles.section}>
          <Text style={styles.sectionTitle}>💵 급여 항목</Text>
          <PayrollBreakdown
            items={[
              {
                label: '기본급',
                amount: payrollDetail.baseSalary,
                description: `₩${payrollDetail.hourlyWage.toLocaleString()}/시간 × ${payrollDetail.totalHours}시간`,
              },
              {
                label: '야간수당 (50%)',
                amount: payrollDetail.nightAllowance,
                description: `야간 ${payrollDetail.nightHours}시간`,
              },
              {
                label: '주휴수당',
                amount: payrollDetail.weeklyAllowance,
              },
            ]}
            showTotal
          />
        </BaseCard>

        {/* 공제 항목 */}
        <DeductionSection
          insurance={payrollDetail.insurance}
          tax={payrollDetail.tax}
          totalDeduction={payrollDetail.totalDeduction}
        />
      </ScrollView>
    </View>
  );
};

export default PayrollDetailScreen;
```

---

## 컴포넌트 상세

### PayrollSummaryCard.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { CurrencyDisplay } from '@components/shared';
import { PaymentStatusBadge } from '../PaymentStatusBadge';
import { PaymentStatus } from '../types/payroll.types';
import { styles } from './PayrollSummaryCard.styles';

interface PayrollSummaryCardProps {
  totalSalary: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  onPress: () => void;
}

const PayrollSummaryCard = ({
  totalSalary,
  netSalary,
  paymentStatus,
  paymentDate,
  onPress,
}: PayrollSummaryCardProps): JSX.Element => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 이번 달 급여</Text>
        <PaymentStatusBadge status={paymentStatus} />
      </View>
      
      <View style={styles.salaryRow}>
        <View style={styles.salaryItem}>
          <Text style={styles.salaryLabel}>총 급여</Text>
          <CurrencyDisplay amount={totalSalary} style={styles.totalSalary} />
        </View>
        
        <View style={styles.arrow}>
          <Text>→</Text>
        </View>
        
        <View style={styles.salaryItem}>
          <Text style={styles.salaryLabel}>실수령액</Text>
          <CurrencyDisplay amount={netSalary} style={styles.netSalary} />
        </View>
      </View>
      
      {paymentDate && paymentStatus === 'paid' && (
        <Text style={styles.paymentDate}>
          {paymentDate.toLocaleDateString('ko-KR')} 지급됨
        </Text>
      )}
      
      <Text style={styles.viewDetail}>상세 내역 보기 ›</Text>
    </TouchableOpacity>
  );
};

export default PayrollSummaryCard;
```

### DeductionSection.tsx (~50 lines)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { BaseCard } from '@components/common';
import { CurrencyDisplay } from '@components/shared';
import { styles } from './DeductionSection.styles';

interface DeductionSectionProps {
  insurance: number;
  tax: number;
  totalDeduction: number;
}

const DeductionSection = ({
  insurance,
  tax,
  totalDeduction,
}: DeductionSectionProps): JSX.Element => {
  return (
    <BaseCard style={styles.container}>
      <Text style={styles.title}>📉 공제 항목</Text>
      
      <View style={styles.itemRow}>
        <Text style={styles.itemLabel}>4대보험</Text>
        <CurrencyDisplay 
          amount={-insurance} 
          style={styles.itemAmount}
          showSign
        />
      </View>
      
      <View style={styles.itemRow}>
        <Text style={styles.itemLabel}>소득세</Text>
        <CurrencyDisplay 
          amount={-tax} 
          style={styles.itemAmount}
          showSign
        />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>총 공제액</Text>
        <CurrencyDisplay 
          amount={-totalDeduction} 
          style={styles.totalAmount}
          showSign
        />
      </View>
    </BaseCard>
  );
};

export default DeductionSection;
```

---

## 타입 정의

### payroll.types.ts (~55 lines)

```typescript
export type PaymentStatus = 'pending' | 'scheduled' | 'paid';

export interface PayrollData {
  id: string;
  employeeId: string;
  month: Date;
  workDays: number;
  totalHours: number;
  nightHours: number;
  hourlyWage: number;
  baseSalary: number;
  nightAllowance: number;
  weeklyAllowance: number;
  totalSalary: number;
  insurance: number;
  tax: number;
  totalDeduction: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollSummary {
  totalSalary: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  workDays: number;
  totalHours: number;
  nightHours: number;
  baseSalary: number;
  nightAllowance: number;
  weeklyAllowance: number;
}

export interface PayrollHistoryItem {
  id: string;
  month: Date;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
}

export interface EmployeePayrollSummary {
  employeeId: string;
  employeeName: string;
  profileImage?: string;
  netSalary: number;
  paymentStatus: PaymentStatus;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| PayrollMainScreen.tsx | 80 | 급여 메인 |
| PayrollDetailScreen.tsx | 85 | 급여 상세 |
| PayrollManagementScreen.tsx | 85 | 급여 관리 |
| PayrollHistoryScreen.tsx | 75 | 급여 내역 |
| **Components** | | |
| PayrollSummaryCard.tsx | 55 | 급여 요약 |
| PayrollBreakdown.tsx | 55 | 급여 내역 |
| BreakdownItem.tsx | 35 | 내역 항목 |
| DeductionSection.tsx | 50 | 공제 항목 |
| WorkSummary.tsx | 45 | 근무 요약 |
| PayrollHistoryItem.tsx | 45 | 급여 내역 항목 |
| EmployeePayrollCard.tsx | 50 | 직원 급여 카드 |
| PaymentStatusBadge.tsx | 35 | 지급 상태 배지 |
| **Hooks** | | |
| usePayroll.ts | 50 | 급여 조회 |
| usePayrollDetail.ts | 50 | 급여 상세 |
| usePayrollManagement.ts | 55 | 급여 관리 |
| usePayrollHistory.ts | 45 | 급여 내역 |

**총 파일 수**: 스크린 8개 + 컴포넌트 16개 + 훅 4개 + 타입/상수/유틸 3개 = **31개 파일**

