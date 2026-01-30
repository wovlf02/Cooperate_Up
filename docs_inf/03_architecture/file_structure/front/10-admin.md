// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\10-admin.md
# 관리자 도메인 파일 구조 (Admin Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

관리자 전용 기능 관련 화면입니다.
- **근무자 관리**: 직원 목록, 상세, 초대
- **승인 관리**: 수동 입력/수정 요청 승인
- **급여 관리**: 급여 조회, 상세 (원 단위 전체 표시)

---

## 디렉토리 구조

```
src/features/admin/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~8 lines)
│   │
│   ├── EmployeeListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeListScreen.tsx      # 근무자 목록 (~80 lines)
│   │   └── EmployeeListScreen.styles.ts # (~50 lines)
│   │
│   ├── EmployeeDetailScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeDetailScreen.tsx    # 근무자 상세 (~90 lines)
│   │   └── EmployeeDetailScreen.styles.ts # (~55 lines)
│   │
│   ├── EmployeeInviteScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeInviteScreen.tsx    # 직원 초대 (~75 lines)
│   │   └── EmployeeInviteScreen.styles.ts # (~45 lines)
│   │
│   ├── ApprovalListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ApprovalListScreen.tsx      # 승인 대기 목록 (~80 lines)
│   │   └── ApprovalListScreen.styles.ts # (~50 lines)
│   │
│   ├── SalaryManagementScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SalaryManagementScreen.tsx  # 급여 관리 (~85 lines)
│   │   └── SalaryManagementScreen.styles.ts # (~50 lines)
│   │
│   └── SalaryDetailScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── SalaryDetailScreen.tsx      # 급여 상세 (~80 lines)
│       └── SalaryDetailScreen.styles.ts # (~50 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~16 lines)
│   │
│   ├── EmployeeSummaryCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeSummaryCard.tsx     # 직원 요약 카드 (~45 lines)
│   │   └── EmployeeSummaryCard.styles.ts # (~40 lines)
│   │
│   ├── EmployeeCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeCard.tsx            # 직원 카드 (~50 lines)
│   │   └── EmployeeCard.styles.ts      # (~45 lines)
│   │
│   ├── EmployeeInfoSection/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeInfoSection.tsx     # 직원 정보 섹션 (~50 lines)
│   │   └── EmployeeInfoSection.styles.ts # (~40 lines)
│   │
│   ├── WageEditModal/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WageEditModal.tsx           # 시급 수정 모달 (~55 lines)
│   │   └── WageEditModal.styles.ts     # (~40 lines)
│   │
│   ├── InviteForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── InviteForm.tsx              # 초대 폼 (~55 lines)
│   │   └── InviteForm.styles.ts        # (~40 lines)
│   │
│   ├── ApprovalCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ApprovalCard.tsx            # 승인 요청 카드 (~55 lines)
│   │   └── ApprovalCard.styles.ts      # (~45 lines)
│   │
│   ├── ApprovalDetailModal/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ApprovalDetailModal.tsx     # 승인 상세 모달 (~60 lines)
│   │   └── ApprovalDetailModal.styles.ts # (~50 lines)
│   │
│   ├── SalaryCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SalaryCard.tsx              # 급여 카드 (~50 lines)
│   │   └── SalaryCard.styles.ts        # (~45 lines)
│   │
│   ├── SalaryBreakdown/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SalaryBreakdown.tsx         # 급여 내역 (~55 lines)
│   │   └── SalaryBreakdown.styles.ts   # (~45 lines)
│   │
│   └── MonthSelector/
│       ├── index.ts                    # (~3 lines)
│       ├── MonthSelector.tsx           # 월 선택기 (~40 lines)
│       └── MonthSelector.styles.ts     # (~35 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~12 lines)
│   ├── useEmployeeList.ts              # 직원 목록 (~50 lines)
│   ├── useEmployeeDetail.ts            # 직원 상세 (~50 lines)
│   ├── useEmployeeInvite.ts            # 직원 초대 (~45 lines)
│   ├── useEmployeeUpdate.ts            # 직원 정보 수정 (~45 lines)
│   ├── useApprovalList.ts              # 승인 목록 (~55 lines)
│   ├── useApprovalPendingCount.ts      # 대기 중인 승인 수 (~35 lines)
│   ├── useApprovalAction.ts            # 승인/거부 처리 (~50 lines)
│   ├── useSalaryManagement.ts          # 급여 관리 (~55 lines)
│   ├── useSalaryDetail.ts              # 급여 상세 (~50 lines)
│   ├── useSalaryGenerate.ts            # 급여 생성 (~45 lines)
│   └── useSalaryConfirm.ts             # 급여 확정/지급완료 (~45 lines)
│
├── types/
│   └── admin.types.ts                  # 관리자 타입 정의 (~60 lines)
│
└── constants/
    └── admin.constants.ts              # 관리자 상수 (~25 lines)
```

---

## 스크린 상세

### EmployeeListScreen.tsx (~80 lines)

```typescript
import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, IconButton, EmptyState } from '@components/common';
import { EmployeeSummaryCard, EmployeeCard } from '../components';
import { useEmployeeList } from '../hooks';
import { styles } from './EmployeeListScreen.styles';

const EmployeeListScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const {
    summary,
    employees,
    isLoading,
    refresh,
    isRefreshing,
  } = useEmployeeList();

  const handleInvite = () => {
    navigation.navigate('EmployeeInvite');
  };

  const handleEmployeeDetail = (employeeId: string) => {
    navigation.navigate('EmployeeDetail', { employeeId });
  };

  return (
    <View style={styles.container}>
      <Header
        title="근무자 관리"
        rightElement={
          <IconButton icon="plus" onPress={handleInvite} />
        }
      />
      
      <FlatList
        data={employees}
        renderItem={({ item }) => (
          <EmployeeCard
            id={item.id}
            name={item.name}
            profileImage={item.profileImage}
            hourlyWage={item.hourlyWage}
            status={item.status}
            checkInTime={item.checkInTime}
            onPress={() => handleEmployeeDetail(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <EmployeeSummaryCard
            totalCount={summary.total}
            presentCount={summary.present}
          />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="등록된 직원이 없습니다"
            description="직원을 초대해보세요"
          />
        }
      />
    </View>
  );
};

export default EmployeeListScreen;
```

### SalaryDetailScreen.tsx (~80 lines)

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, BaseCard, EmptyState } from '@components/common';
import { CurrencyDisplay } from '@components/shared';
import { SalaryBreakdown, MonthSelector } from '../components';
import { useSalaryDetail } from '../hooks';
import { styles } from './SalaryDetailScreen.styles';

interface RouteParams {
  employeeId: string;
}

const SalaryDetailScreen = (): JSX.Element => {
  const route = useRoute();
  const { employeeId } = route.params as RouteParams;

  const {
    employeeName,
    currentMonth,
    setCurrentMonth,
    salaryData,
    isLoading,
  } = useSalaryDetail(employeeId);

  return (
    <View style={styles.container}>
      <Header title={`${employeeName} 급여`} />
      
      <MonthSelector
        currentMonth={currentMonth}
        onChange={setCurrentMonth}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {salaryData ? (
          <>
            <BaseCard style={styles.totalCard}>
              <Text style={styles.totalLabel}>총 급여</Text>
              <CurrencyDisplay
                amount={salaryData.totalSalary}
                style={styles.totalAmount}
              />
              <Text style={styles.workInfo}>
                {salaryData.workDays}일 • {salaryData.totalHours}시간
              </Text>
            </BaseCard>

            <SalaryBreakdown
              items={[
                {
                  label: '기본급',
                  amount: salaryData.baseSalary,
                  description: `시급 ₩${salaryData.hourlyWage.toLocaleString()} × ${salaryData.totalHours}시간`,
                },
                {
                  label: '야간수당',
                  amount: salaryData.nightAllowance,
                  description: `야간 ${salaryData.nightHours}시간`,
                },
                {
                  label: '주휴수당',
                  amount: salaryData.weeklyAllowance,
                },
              ]}
            />

            <BaseCard style={styles.deductionCard}>
              <Text style={styles.sectionTitle}>공제 항목</Text>
              <SalaryBreakdown
                items={[
                  { label: '4대보험', amount: -salaryData.insurance },
                  { label: '소득세', amount: -salaryData.tax },
                ]}
              />
            </BaseCard>
          </>
        ) : (
          <EmptyState
            icon="💰"
            title="급여 데이터가 없습니다"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default SalaryDetailScreen;
```

---

## 컴포넌트 상세

### EmployeeCard.tsx (~50 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ProfileImage, AttendanceStatusDot, CurrencyDisplay } from '@components/shared';
import { EmployeeStatus } from '../types/admin.types';
import { styles } from './EmployeeCard.styles';

interface EmployeeCardProps {
  id: string;
  name: string;
  profileImage?: string;
  hourlyWage: number;
  status: EmployeeStatus;
  checkInTime?: string;
  onPress: () => void;
}

const EmployeeCard = ({
  name,
  profileImage,
  hourlyWage,
  status,
  checkInTime,
  onPress,
}: EmployeeCardProps): JSX.Element => {
  const getStatusText = () => {
    switch (status) {
      case 'working':
        return `근무중 ${checkInTime}~`;
      case 'not_working':
        return '미출근';
      case 'day_off':
        return '휴무';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <ProfileImage uri={profileImage} size={52} />
      
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <AttendanceStatusDot status={status} />
        </View>
        <CurrencyDisplay amount={hourlyWage} suffix="/시간" style={styles.wage} />
        <Text style={styles.status}>{getStatusText()}</Text>
      </View>
      
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export default EmployeeCard;
```

### SalaryBreakdown.tsx (~55 lines)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { CurrencyDisplay } from '@components/shared';
import { styles } from './SalaryBreakdown.styles';

interface SalaryItem {
  label: string;
  amount: number;
  description?: string;
}

interface SalaryBreakdownProps {
  items: SalaryItem[];
  showTotal?: boolean;
}

const SalaryBreakdown = ({ items, showTotal = false }: SalaryBreakdownProps): JSX.Element => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{item.label}</Text>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
          </View>
          <CurrencyDisplay
            amount={item.amount}
            style={[
              styles.amount,
              item.amount < 0 && styles.amountNegative,
            ]}
          />
        </View>
      ))}
      
      {showTotal && (
        <>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>합계</Text>
            <CurrencyDisplay amount={total} style={styles.totalAmount} />
          </View>
        </>
      )}
    </View>
  );
};

export default SalaryBreakdown;
```

### ApprovalCard.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ProfileImage, RelativeTime } from '@components/shared';
import { Badge } from '@components/common';
import { ApprovalRequest } from '../types/admin.types';
import { styles } from './ApprovalCard.styles';

interface ApprovalCardProps {
  request: ApprovalRequest;
  onPress: () => void;
}

const ApprovalCard = ({ request, onPress }: ApprovalCardProps): JSX.Element => {
  const getTypeBadge = () => {
    switch (request.type) {
      case 'manual_input':
        return <Badge text="수동 입력" variant="info" />;
      case 'edit_request':
        return <Badge text="수정 요청" variant="warning" />;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <ProfileImage uri={request.employeeImage} size={44} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.employeeName}>{request.employeeName}</Text>
          {getTypeBadge()}
        </View>
        
        <Text style={styles.description} numberOfLines={1}>
          {request.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            {request.targetDate.toLocaleDateString('ko-KR')}
          </Text>
          <RelativeTime date={request.createdAt} style={styles.createdAt} />
        </View>
      </View>
      
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export default ApprovalCard;
```

---

## 타입 정의

### admin.types.ts (~60 lines)

```typescript
export type EmployeeStatus = 'working' | 'not_working' | 'day_off';
export type ApprovalRequestType = 'manual_input' | 'edit_request';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  hourlyWage: number;
  status: EmployeeStatus;
  checkInTime?: string;
  joinedAt: Date;
}

export interface EmployeeSummary {
  total: number;
  present: number;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalRequestType;
  employeeId: string;
  employeeName: string;
  employeeImage?: string;
  targetDate: Date;
  description: string;
  originalData?: {
    checkInTime?: Date;
    checkOutTime?: Date;
  };
  requestedData: {
    checkInTime?: Date;
    checkOutTime?: Date;
  };
  reason: string;
  status: ApprovalStatus;
  createdAt: Date;
}

export interface SalaryData {
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
  netSalary: number;
}

export interface InviteFormData {
  email: string;
  name: string;
  hourlyWage: number;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| EmployeeListScreen.tsx | 80 | 직원 목록 |
| EmployeeDetailScreen.tsx | 90 | 직원 상세 |
| EmployeeInviteScreen.tsx | 75 | 직원 초대 |
| ApprovalListScreen.tsx | 80 | 승인 목록 |
| SalaryManagementScreen.tsx | 85 | 급여 관리 |
| SalaryDetailScreen.tsx | 80 | 급여 상세 |
| **Components** | | |
| EmployeeSummaryCard.tsx | 45 | 직원 요약 |
| EmployeeCard.tsx | 50 | 직원 카드 |
| EmployeeInfoSection.tsx | 50 | 정보 섹션 |
| WageEditModal.tsx | 55 | 시급 수정 |
| InviteForm.tsx | 55 | 초대 폼 |
| ApprovalCard.tsx | 55 | 승인 카드 |
| ApprovalDetailModal.tsx | 60 | 승인 상세 |
| SalaryCard.tsx | 50 | 급여 카드 |
| SalaryBreakdown.tsx | 55 | 급여 내역 |
| **Hooks** | | |
| useEmployeeList.ts | 50 | 직원 목록 |
| useEmployeeDetail.ts | 50 | 직원 상세 |
| useApprovalList.ts | 50 | 승인 목록 |
| useSalaryManagement.ts | 55 | 급여 관리 |

**총 파일 수**: 스크린 12개 + 컴포넌트 20개 + 훅 6개 + 타입/상수 2개 = **40개 파일**

