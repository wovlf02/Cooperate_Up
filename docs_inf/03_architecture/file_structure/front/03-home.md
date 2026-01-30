// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\03-home.md
# 홈 도메인 파일 구조 (Home Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

앱 로그인 후 처음 보는 대시보드 화면입니다.
- **관리자 홈**: 실시간 출근 현황, 승인 대기, 급여/체크리스트 요약, 공지사항
- **근무자 홈**: 오늘 근무 현황, 출퇴근 버튼, 급여/체크리스트 요약, 공지사항

---

## 디렉토리 구조

```
src/features/home/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~5 lines)
│   │
│   ├── AdminHomeScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AdminHomeScreen.tsx         # 관리자 홈 화면 (~90 lines)
│   │   └── AdminHomeScreen.styles.ts   # (~55 lines)
│   │
│   └── WorkerHomeScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── WorkerHomeScreen.tsx        # 근무자 홈 화면 (~85 lines)
│       └── WorkerHomeScreen.styles.ts  # (~50 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~18 lines)
│   │
│   ├── HomeHeader/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── HomeHeader.tsx              # 그라데이션 헤더 (~50 lines)
│   │   └── HomeHeader.styles.ts        # (~45 lines)
│   │
│   ├── WorkplaceSelector/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceSelector.tsx       # 사업장 선택 드롭다운 (~50 lines)
│   │   └── WorkplaceSelector.styles.ts # (~40 lines)
│   │
│   ├── TodayWorkCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── TodayWorkCard.tsx           # 오늘 근무 카드 (근무자) (~55 lines)
│   │   ├── TodayWorkCard.styles.ts     # (~50 lines)
│   │   └── WorkingTimer.tsx            # 실시간 근무시간 타이머 (~40 lines)
│   │
│   ├── AttendanceStatusCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AttendanceStatusCard.tsx    # 출근 현황 카드 (관리자) (~55 lines)
│   │   ├── AttendanceStatusCard.styles.ts # (~50 lines)
│   │   └── AttendeeList.tsx            # 출근자 리스트 (~40 lines)
│   │
│   ├── ApprovalPendingCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ApprovalPendingCard.tsx     # 승인 대기 카드 (관리자) (~55 lines)
│   │   ├── ApprovalPendingCard.styles.ts # (~45 lines)
│   │   └── ApprovalItem.tsx            # 승인 항목 (~40 lines)
│   │
│   ├── QuickStatsGrid/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── QuickStatsGrid.tsx          # 통계 그리드 (~45 lines)
│   │   ├── QuickStatsGrid.styles.ts    # (~40 lines)
│   │   └── StatItem.tsx                # 개별 통계 항목 (~35 lines)
│   │
│   ├── AnnouncementPreview/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AnnouncementPreview.tsx     # 공지사항 미리보기 (~50 lines)
│   │   ├── AnnouncementPreview.styles.ts # (~40 lines)
│   │   └── AnnouncementItem.tsx        # 공지사항 항목 (~35 lines)
│   │
│   └── AttendanceButton/
│       ├── index.ts                    # (~3 lines)
│       ├── AttendanceButton.tsx        # 출퇴근 버튼 (~55 lines)
│       └── AttendanceButton.styles.ts  # (~50 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useAdminHome.ts                 # 관리자 홈 데이터 (~55 lines)
│   ├── useWorkerHome.ts                # 근무자 홈 데이터 (~50 lines)
│   ├── useWorkingTimer.ts              # 근무 시간 타이머 (~45 lines)
│   ├── useApprovalPending.ts           # 승인 대기 목록 (~45 lines)
│   ├── useInvitations.ts               # 받은 초대 목록 (~45 lines)
│   └── useInvitationAction.ts          # 초대 수락/거부 (~40 lines)
│
├── types/
│   └── home.types.ts                   # 홈 타입 정의 (~45 lines)
│
└── constants/
    └── home.constants.ts               # 홈 상수 (~20 lines)
```

---

## 스크린 상세

### AdminHomeScreen.tsx (~90 lines)

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  HomeHeader,
  WorkplaceSelector,
  AttendanceStatusCard,
  ApprovalPendingCard,
  QuickStatsGrid,
  AnnouncementPreview,
} from '../components';
import { useAdminHome } from '../hooks';
import { styles } from './AdminHomeScreen.styles';

const AdminHomeScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const {
    workplace,
    attendanceStatus,
    approvalPending,
    stats,
    announcements,
    isLoading,
    refresh,
    isRefreshing,
  } = useAdminHome();

  const handleSelectWorkplace = (workplaceId: string) => {
    // 사업장 변경 로직
  };

  const handleViewAllApprovals = () => {
    navigation.navigate('ApprovalList');
  };

  const handleViewAllAnnouncements = () => {
    navigation.navigate('AnnouncementList');
  };

  const handleCreateAnnouncement = () => {
    navigation.navigate('AnnouncementCreate');
  };

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={workplace?.adminName ?? ''}
        date={new Date()}
        rightElement={
          <WorkplaceSelector
            selectedWorkplace={workplace}
            onSelect={handleSelectWorkplace}
          />
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <AttendanceStatusCard
          present={attendanceStatus.present}
          absent={attendanceStatus.absent}
          attendees={attendanceStatus.attendees}
        />
        
        {approvalPending.count > 0 && (
          <ApprovalPendingCard
            items={approvalPending.items}
            totalCount={approvalPending.count}
            onViewAll={handleViewAllApprovals}
          />
        )}
        
        <QuickStatsGrid
          items={[
            { label: '12월 급여', value: stats.monthlySalary, icon: 'wallet' },
            { label: '체크리스트', value: stats.checklistProgress, icon: 'checklist' },
          ]}
        />
        
        <AnnouncementPreview
          items={announcements}
          onViewAll={handleViewAllAnnouncements}
          onCreateNew={handleCreateAnnouncement}
        />
      </ScrollView>
    </View>
  );
};

export default AdminHomeScreen;
```

### WorkerHomeScreen.tsx (~85 lines)

```typescript
import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  HomeHeader,
  WorkplaceSelector,
  TodayWorkCard,
  AttendanceButton,
  QuickStatsGrid,
  AnnouncementPreview,
} from '../components';
import { useWorkerHome, useWorkingTimer } from '../hooks';
import { styles } from './WorkerHomeScreen.styles';

const WorkerHomeScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const {
    workplace,
    todayWork,
    stats,
    announcements,
    isLoading,
    refresh,
    isRefreshing,
  } = useWorkerHome();
  
  const { elapsedTime, isRunning } = useWorkingTimer(todayWork?.checkInTime);

  const handleAttendance = () => {
    navigation.navigate('Attendance');
  };

  const handleViewAnnouncements = () => {
    navigation.navigate('AnnouncementList');
  };

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={workplace?.workerName ?? ''}
        date={new Date()}
        rightElement={
          <WorkplaceSelector
            selectedWorkplace={workplace}
            onSelect={(id) => { /* 사업장 변경 */ }}
          />
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <TodayWorkCard
          checkInTime={todayWork?.checkInTime}
          checkOutTime={todayWork?.checkOutTime}
          status={todayWork?.status}
          elapsedTime={elapsedTime}
          isRunning={isRunning}
        >
          <AttendanceButton
            status={todayWork?.status ?? 'not_checked_in'}
            onPress={handleAttendance}
          />
        </TodayWorkCard>
        
        <QuickStatsGrid
          items={[
            { label: '12월 급여', value: stats.monthlySalary, icon: 'wallet', subValue: stats.todayEarnings },
            { label: '체크리스트', value: stats.checklistProgress, icon: 'checklist' },
          ]}
        />
        
        <AnnouncementPreview
          items={announcements}
          onViewAll={handleViewAnnouncements}
        />
      </ScrollView>
    </View>
  );
};

export default WorkerHomeScreen;
```

---

## 컴포넌트 상세

### TodayWorkCard.tsx (~55 lines)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { BaseCard, Badge } from '@components/common';
import { TimeDisplay } from '@components/shared';
import { WorkingTimer } from './WorkingTimer';
import { AttendanceStatus } from '../types/home.types';
import { styles } from './TodayWorkCard.styles';

interface TodayWorkCardProps {
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  elapsedTime: string;
  isRunning: boolean;
  children?: React.ReactNode;
}

const TodayWorkCard = ({
  checkInTime,
  checkOutTime,
  status,
  elapsedTime,
  isRunning,
  children,
}: TodayWorkCardProps): JSX.Element => {
  const getStatusBadge = () => {
    switch (status) {
      case 'working':
        return <Badge text="근무중" variant="success" />;
      case 'checked_out':
        return <Badge text="퇴근완료" variant="neutral" />;
      default:
        return <Badge text="미출근" variant="warning" />;
    }
  };

  return (
    <BaseCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕐 오늘의 근무</Text>
        {getStatusBadge()}
      </View>
      
      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>출근</Text>
          <TimeDisplay time={checkInTime} placeholder="--:--" style={styles.timeValue} />
          {checkInTime && <Text style={styles.timeStatus}>● 정상</Text>}
        </View>
        <View style={styles.timeDivider} />
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>퇴근</Text>
          <TimeDisplay time={checkOutTime} placeholder="--:--" style={styles.timeValue} />
        </View>
      </View>
      
      {isRunning && (
        <WorkingTimer elapsedTime={elapsedTime} />
      )}
      
      {children}
    </BaseCard>
  );
};

export default TodayWorkCard;
```

### AttendanceStatusCard.tsx (~55 lines)

```typescript
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BaseCard } from '@components/common';
import { ProfileImage } from '@components/shared';
import { AttendeeList } from './AttendeeList';
import { Attendee } from '../types/home.types';
import { styles } from './AttendanceStatusCard.styles';

interface AttendanceStatusCardProps {
  present: number;
  absent: number;
  attendees: Attendee[];
}

const AttendanceStatusCard = ({
  present,
  absent,
  attendees,
}: AttendanceStatusCardProps): JSX.Element => {
  return (
    <BaseCard style={styles.container}>
      <Text style={styles.title}>👥 현재 출근 현황</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{present}명</Text>
          <Text style={styles.statLabel}>출근자</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueMuted]}>{absent}명</Text>
          <Text style={styles.statLabel}>미출근</Text>
        </View>
      </View>
      
      <AttendeeList attendees={attendees} />
    </BaseCard>
  );
};

export default AttendanceStatusCard;
```

---

## 훅 상세

### useWorkerHome.ts (~50 lines)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@store/hooks';
import { selectCurrentWorkplace } from '@store/slices/workplaceSlice';
import { homeService } from '@services/home/homeService';
import { WorkerHomeData } from '../types/home.types';

interface UseWorkerHomeReturn {
  workplace: WorkerHomeData['workplace'] | null;
  todayWork: WorkerHomeData['todayWork'] | null;
  stats: WorkerHomeData['stats'];
  announcements: WorkerHomeData['announcements'];
  isLoading: boolean;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const useWorkerHome = (): UseWorkerHomeReturn => {
  const currentWorkplace = useAppSelector(selectCurrentWorkplace);
  const [data, setData] = useState<WorkerHomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentWorkplace?.id) return;
    
    try {
      const response = await homeService.getWorkerHomeData(currentWorkplace.id);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch worker home data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkplace?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  return {
    workplace: data?.workplace ?? null,
    todayWork: data?.todayWork ?? null,
    stats: data?.stats ?? { monthlySalary: 0, todayEarnings: 0, checklistProgress: '0%' },
    announcements: data?.announcements ?? [],
    isLoading,
    refresh,
    isRefreshing,
  };
};
```

### useWorkingTimer.ts (~45 lines)

```typescript
import { useState, useEffect, useRef } from 'react';
import { formatDuration } from '@utils/dateUtils';

interface UseWorkingTimerReturn {
  elapsedTime: string;
  elapsedSeconds: number;
  isRunning: boolean;
}

export const useWorkingTimer = (startTime?: Date | null): UseWorkingTimerReturn => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = !!startTime;

  useEffect(() => {
    if (!startTime) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const now = new Date();
      const start = new Date(startTime);
      return Math.floor((now.getTime() - start.getTime()) / 1000);
    };

    setElapsedSeconds(calculateElapsed());

    intervalRef.current = setInterval(() => {
      setElapsedSeconds(calculateElapsed());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime]);

  const elapsedTime = formatDuration(elapsedSeconds);

  return {
    elapsedTime,
    elapsedSeconds,
    isRunning,
  };
};
```

---

## 타입 정의

### home.types.ts (~45 lines)

```typescript
export type AttendanceStatus = 'not_checked_in' | 'working' | 'checked_out';

export interface Attendee {
  id: string;
  name: string;
  profileImage?: string;
  checkInTime: Date;
}

export interface ApprovalItem {
  id: string;
  type: 'manual_input' | 'edit_request';
  employeeName: string;
  description: string;
  date: Date;
}

export interface Announcement {
  id: string;
  title: string;
  isImportant: boolean;
  createdAt: Date;
}

export interface WorkerHomeData {
  workplace: {
    id: string;
    name: string;
    workerName: string;
  };
  todayWork: {
    checkInTime?: Date;
    checkOutTime?: Date;
    status: AttendanceStatus;
  };
  stats: {
    monthlySalary: number;
    todayEarnings: number;
    checklistProgress: string;
  };
  announcements: Announcement[];
}

export interface AdminHomeData {
  workplace: {
    id: string;
    name: string;
    adminName: string;
  };
  attendanceStatus: {
    present: number;
    absent: number;
    attendees: Attendee[];
  };
  approvalPending: {
    count: number;
    items: ApprovalItem[];
  };
  stats: {
    monthlySalary: number;
    checklistProgress: string;
  };
  announcements: Announcement[];
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| AdminHomeScreen.tsx | 90 | 관리자 홈 화면 |
| WorkerHomeScreen.tsx | 85 | 근무자 홈 화면 |
| **Components** | | |
| HomeHeader.tsx | 50 | 그라데이션 헤더 |
| WorkplaceSelector.tsx | 50 | 사업장 선택 |
| TodayWorkCard.tsx | 55 | 오늘 근무 카드 |
| WorkingTimer.tsx | 40 | 근무 타이머 |
| AttendanceStatusCard.tsx | 55 | 출근 현황 카드 |
| AttendeeList.tsx | 40 | 출근자 리스트 |
| ApprovalPendingCard.tsx | 55 | 승인 대기 카드 |
| ApprovalItem.tsx | 40 | 승인 항목 |
| QuickStatsGrid.tsx | 45 | 통계 그리드 |
| StatItem.tsx | 35 | 통계 항목 |
| AnnouncementPreview.tsx | 50 | 공지사항 미리보기 |
| AttendanceButton.tsx | 55 | 출퇴근 버튼 |
| **Hooks** | | |
| useAdminHome.ts | 55 | 관리자 홈 데이터 |
| useWorkerHome.ts | 50 | 근무자 홈 데이터 |
| useWorkingTimer.ts | 45 | 근무 타이머 |
| useApprovalPending.ts | 45 | 승인 대기 |

**총 파일 수**: 스크린 4개 + 컴포넌트 26개 + 훅 4개 + 타입/상수 2개 = **36개 파일**

