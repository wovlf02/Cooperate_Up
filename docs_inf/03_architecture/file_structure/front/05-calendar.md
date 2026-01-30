// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\05-calendar.md
# 캘린더 도메인 파일 구조 (Calendar Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

월별 근무 현황을 캘린더 형태로 보여주는 화면입니다.
- **월간 캘린더**: 스와이프로 월 이동, 날짜별 근무 시간 표시
- **일별 상세**: 선택한 날짜의 상세 근무 정보

---

## 디렉토리 구조

```
src/features/calendar/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~4 lines)
│   │
│   ├── CalendarMainScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── CalendarMainScreen.tsx      # 캘린더 메인 화면 (~85 lines)
│   │   └── CalendarMainScreen.styles.ts # (~50 lines)
│   │
│   └── DayDetailScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── DayDetailScreen.tsx         # 일별 상세 화면 (~75 lines)
│       └── DayDetailScreen.styles.ts   # (~45 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~12 lines)
│   │
│   ├── MonthSelector/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MonthSelector.tsx           # 월 선택기 (~45 lines)
│   │   └── MonthSelector.styles.ts     # (~35 lines)
│   │
│   ├── WeekdayHeader/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WeekdayHeader.tsx           # 요일 헤더 (~35 lines)
│   │   └── WeekdayHeader.styles.ts     # (~30 lines)
│   │
│   ├── CalendarGrid/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── CalendarGrid.tsx            # 캘린더 그리드 (~55 lines)
│   │   └── CalendarGrid.styles.ts      # (~45 lines)
│   │
│   ├── CalendarDay/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── CalendarDay.tsx             # 개별 날짜 셀 (~50 lines)
│   │   └── CalendarDay.styles.ts       # (~45 lines)
│   │
│   ├── MonthlySummaryCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MonthlySummaryCard.tsx      # 월간 요약 카드 (~50 lines)
│   │   └── MonthlySummaryCard.styles.ts # (~45 lines)
│   │
│   ├── DayWorkDetail/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── DayWorkDetail.tsx           # 일별 근무 상세 (~50 lines)
│   │   └── DayWorkDetail.styles.ts     # (~40 lines)
│   │
│   └── HolidayBadge/
│       ├── index.ts                    # (~3 lines)
│       ├── HolidayBadge.tsx            # 공휴일 배지 (~30 lines)
│       └── HolidayBadge.styles.ts      # (~25 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~7 lines)
│   ├── useCalendarData.ts              # 월별 캘린더 데이터 (~60 lines)
│   ├── useDayDetail.ts                 # 일별 상세 데이터 (~50 lines)
│   ├── useMonthlySummary.ts            # 월별 요약 조회 (~45 lines)
│   └── useMonthNavigation.ts           # 월 네비게이션 (~40 lines)
│
├── types/
│   └── calendar.types.ts               # 캘린더 타입 정의 (~40 lines)
│
├── constants/
│   └── calendar.constants.ts           # 캘린더 상수 (~20 lines)
│
└── utils/
    └── calendarUtils.ts                # 캘린더 유틸 (~50 lines)
```

---

## 스크린 상세

### CalendarMainScreen.tsx (~85 lines)

```typescript
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@components/common';
import {
  MonthSelector,
  WeekdayHeader,
  CalendarGrid,
  MonthlySummaryCard,
} from '../components';
import { useCalendarData, useMonthNavigation } from '../hooks';
import { styles } from './CalendarMainScreen.styles';

const CalendarMainScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { currentMonth, goToPrevMonth, goToNextMonth, goToToday } = useMonthNavigation();
  const { workDays, monthlySummary, isLoading } = useCalendarData(currentMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    navigation.navigate('DayDetail', { date: date.toISOString() });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      goToNextMonth();
    } else {
      goToPrevMonth();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="캘린더" />
      
      <MonthSelector
        currentMonth={currentMonth}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      
      <WeekdayHeader />
      
      <ScrollView style={styles.scrollView}>
        <CalendarGrid
          currentMonth={currentMonth}
          workDays={workDays}
          selectedDate={selectedDate}
          onDayPress={handleDayPress}
          onSwipe={handleSwipe}
        />
        
        <MonthlySummaryCard
          workDays={monthlySummary.workDays}
          totalHours={monthlySummary.totalHours}
          estimatedSalary={monthlySummary.estimatedSalary}
        />
      </ScrollView>
    </View>
  );
};

export default CalendarMainScreen;
```

### DayDetailScreen.tsx (~75 lines)

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, BaseCard, EmptyState } from '@components/common';
import { DayWorkDetail } from '../components';
import { useDayDetail } from '../hooks';
import { styles } from './DayDetailScreen.styles';

interface RouteParams {
  date: string;
}

const DayDetailScreen = (): JSX.Element => {
  const route = useRoute();
  const { date } = route.params as RouteParams;
  const selectedDate = new Date(date);
  
  const { dayData, isLoading } = useDayDetail(selectedDate);

  const formatDateHeader = (): string => {
    return selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <View style={styles.container}>
      <Header title={formatDateHeader()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {dayData ? (
          <DayWorkDetail
            checkInTime={dayData.checkInTime}
            checkOutTime={dayData.checkOutTime}
            totalHours={dayData.totalHours}
            earnedAmount={dayData.earnedAmount}
            status={dayData.status}
            notes={dayData.notes}
          />
        ) : (
          <EmptyState
            icon="📅"
            title="근무 기록이 없습니다"
            description="이 날짜에는 근무 기록이 없습니다."
          />
        )}
      </ScrollView>
    </View>
  );
};

export default DayDetailScreen;
```

---

## 컴포넌트 상세

### CalendarDay.tsx (~50 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { HolidayBadge } from './HolidayBadge';
import { DayWorkData } from '../types/calendar.types';
import { styles } from './CalendarDay.styles';

interface CalendarDayProps {
  date: Date;
  workData?: DayWorkData;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  onPress: (date: Date) => void;
}

const CalendarDay = ({
  date,
  workData,
  isToday,
  isSelected,
  isCurrentMonth,
  isHoliday,
  holidayName,
  onPress,
}: CalendarDayProps): JSX.Element => {
  const dayNumber = date.getDate();
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isToday && styles.today,
        isSelected && styles.selected,
        !isCurrentMonth && styles.otherMonth,
      ]}
      onPress={() => onPress(date)}
    >
      <Text style={[
        styles.dayNumber,
        isSunday && styles.sunday,
        isSaturday && styles.saturday,
        isHoliday && styles.holiday,
        !isCurrentMonth && styles.otherMonthText,
      ]}>
        {dayNumber}
      </Text>
      
      {workData && (
        <View style={styles.workTime}>
          <Text style={styles.timeText}>{workData.checkInTime}</Text>
          <Text style={styles.timeText}>{workData.checkOutTime}</Text>
        </View>
      )}
      
      {isHoliday && <HolidayBadge name={holidayName} />}
    </TouchableOpacity>
  );
};

export default CalendarDay;
```

### MonthlySummaryCard.tsx (~50 lines)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { BaseCard } from '@components/common';
import { CurrencyDisplay } from '@components/shared';
import { styles } from './MonthlySummaryCard.styles';

interface MonthlySummaryCardProps {
  workDays: number;
  totalHours: number;
  estimatedSalary: number;
}

const MonthlySummaryCard = ({
  workDays,
  totalHours,
  estimatedSalary,
}: MonthlySummaryCardProps): JSX.Element => {
  return (
    <BaseCard style={styles.container}>
      <Text style={styles.title}>📊 월간 근무 요약</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>근무일</Text>
          <Text style={styles.statValue}>{workDays}일</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 근무시간</Text>
          <Text style={styles.statValue}>{totalHours}시간</Text>
        </View>
      </View>
      
      <View style={styles.salarySection}>
        <Text style={styles.salaryLabel}>💰 예상 급여</Text>
        <CurrencyDisplay 
          amount={estimatedSalary} 
          style={styles.salaryValue} 
        />
      </View>
    </BaseCard>
  );
};

export default MonthlySummaryCard;
```

---

## 훅 상세

### useCalendarData.ts (~55 lines)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '@services/calendar/calendarService';
import { DayWorkData, MonthlySummary } from '../types/calendar.types';

interface UseCalendarDataReturn {
  workDays: Map<string, DayWorkData>;
  monthlySummary: MonthlySummary;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCalendarData = (currentMonth: Date): UseCalendarDataReturn => {
  const [workDays, setWorkDays] = useState<Map<string, DayWorkData>>(new Map());
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    workDays: 0,
    totalHours: 0,
    estimatedSalary: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const data = await calendarService.getMonthlyData(year, month);
      
      const workDaysMap = new Map<string, DayWorkData>();
      data.records.forEach((record) => {
        const dateKey = record.date.toISOString().split('T')[0];
        workDaysMap.set(dateKey, record);
      });
      
      setWorkDays(workDaysMap);
      setMonthlySummary(data.summary);
    } catch (err) {
      setError('데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    workDays,
    monthlySummary,
    isLoading,
    error,
    refresh: fetchData,
  };
};
```

---

## 타입 정의

### calendar.types.ts (~40 lines)

```typescript
export interface DayWorkData {
  date: Date;
  checkInTime: string;
  checkOutTime: string;
  totalHours: number;
  earnedAmount: number;
  status: 'normal' | 'late' | 'early_leave' | 'absent';
  notes?: string;
}

export interface MonthlySummary {
  workDays: number;
  totalHours: number;
  estimatedSalary: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
}

export interface Holiday {
  date: Date;
  name: string;
  isNational: boolean;
}

export interface CalendarData {
  records: DayWorkData[];
  summary: MonthlySummary;
  holidays: Holiday[];
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| CalendarMainScreen.tsx | 85 | 캘린더 메인 |
| DayDetailScreen.tsx | 75 | 일별 상세 |
| **Components** | | |
| MonthSelector.tsx | 45 | 월 선택기 |
| WeekdayHeader.tsx | 35 | 요일 헤더 |
| CalendarGrid.tsx | 55 | 캘린더 그리드 |
| CalendarDay.tsx | 50 | 날짜 셀 |
| MonthlySummaryCard.tsx | 50 | 월간 요약 |
| DayWorkDetail.tsx | 50 | 일별 상세 |
| HolidayBadge.tsx | 30 | 공휴일 배지 |
| **Hooks** | | |
| useCalendarData.ts | 55 | 캘린더 데이터 |
| useDayDetail.ts | 45 | 일별 상세 |
| useMonthNavigation.ts | 40 | 월 네비게이션 |

**총 파일 수**: 스크린 4개 + 컴포넌트 14개 + 훅 3개 + 타입/상수/유틸 3개 = **24개 파일**

