# 캘린더 화면 (CalendarScreen) - Production Ready v2.0

## 개요

월별 근무 현황을 캘린더 형태로 보여주는 화면입니다.
네이버 캘린더, 구글 캘린더 등의 UX를 참고하여 직관적인 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **한눈에 파악**: 한 달 근무 현황을 시각적으로 빠르게 인지
- **자연스러운 네비게이션**: 스와이프로 월 이동
- **상세 정보 접근**: 날짜 탭으로 상세 정보 확인
- **요약 정보**: 월간 총 근무시간, 급여 요약 제공

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←             캘린더                                │ │
│  │                titleMedium, fontWeight: 600          │ │
│  │                height: 56px                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Month Selector                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │     ←        2024년 12월        →                    │ │
│  │              displaySmall                             │ │
│  │              fontWeight: 700                          │ │
│  │                                                      │ │
│  │  height: 64px                                         │ │
│  │  ← → 버튼: 44x44px                                   │ │
│  │  ⚡ Swipe gesture for month change                    │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  Weekday Headers                                     │ │
│  │                                                      │ │
│  │   일    월    화    수    목    금    토             │ │
│  │  error       ——— neutral600 ———    brand500          │ │
│  │                                                      │ │
│  │  height: 40px                                        │ │
│  │  labelMedium, fontWeight: 600                        │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  Calendar Grid                                       │ │
│  │                                                      │ │
│  │   1    2    3    4    5    6    7                    │ │
│  │                         ┌────┐                       │ │
│  │       20:00 20:00       │    │      20:00           │ │
│  │       04:00 04:00       │    │      04:00           │ │
│  │                         └────┘                       │ │
│  │                          오늘                        │ │
│  │                                                      │ │
│  │   8    9   10   11   12   13   14                    │ │
│  │  20:00                                               │ │
│  │  04:00                                               │ │
│  │                                                      │ │
│  │  15   16   17   18   19   20   21                    │ │
│  │                                                      │ │
│  │  22   23   24   25   26   27   28                    │ │
│  │                        크리스마스                    │ │
│  │                        (공휴일)                      │ │
│  │                                                      │ │
│  │  29   30   31                                        │ │
│  │                                                      │ │
│  │  Cell Size: (screenWidth - padding) / 7              │ │
│  │  Cell Height: ~hp(11) for time display               │ │
│  │  ⚡ FlatList with snapToInterval                      │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  marginTop: space4                                        │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  Monthly Summary Card                                │ │
│  │                                                      │ │
│  │  📊 12월 근무 요약                                   │ │
│  │  ─────────────────────────────────────────────────── │ │
│  │                                                      │ │
│  │     ┌─────────────────┬─────────────────┐            │ │
│  │     │                 │                 │            │ │
│  │     │    근무일       │   총 근무시간   │            │ │
│  │     │      18일       │     153시간     │            │ │
│  │     │    brand500     │    brand500     │            │ │
│  │     │    fs(28)       │    fs(28)       │            │ │
│  │     │                 │                 │            │ │
│  │     └─────────────────┴─────────────────┘            │ │
│  │                                                      │ │
│  │  ─────────────────────────────────────────────────── │ │
│  │                                                      │ │
│  │  💰 예상 급여                                        │ │
│  │                                                      │ │
│  │             ₩1,534,590                               │ │
│  │             displaySmall, brand500, fontWeight: 700  │ │
│  │                                                      │ │
│  │  backgroundColor: white                              │ │
│  │  borderRadius: xl                                    │ │
│  │  padding: space5                                     │ │
│  │  ⚡ Shadow sm                                         │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  paddingBottom: tabBarHeight + safeArea                   │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ BottomTabBar                                              │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Month Selector

```typescript
const monthSelectorStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(64),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
  },
  
  navButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  navButtonPressed: {
    backgroundColor: colors.neutral200,
  },
  
  navIcon: {
    size: ms(24),
    color: colors.textPrimary,
  },
  
  monthText: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  // 스와이프 제스처
  gesture: {
    horizontal: true,
    threshold: 50,
  },
  
  // 월 변경 애니메이션
  animation: {
    slide: {
      duration: 300,
      easing: 'easeOut',
    },
    fade: {
      duration: 200,
    },
  },
};
```

### 2. Weekday Headers

```typescript
const weekdayHeaderStyles = {
  container: {
    flexDirection: 'row',
    height: ms(40),
    paddingHorizontal: spacing.space1,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  text: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  sundayText: {
    color: colors.error,
  },
  
  saturdayText: {
    color: colors.brand500,
  },
  
  weekdayText: {
    color: colors.neutral600,
  },
};
```

### 3. Calendar Day Cell

```typescript
const dayCellStyles = {
  container: {
    width: cellWidth,
    height: ms(80),
    padding: spacing.space1,
    alignItems: 'center',
  },
  
  // 날짜 표시
  dateContainer: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.space1,
  },
  
  dateText: {
    ...typography.titleSmall,
    fontWeight: '500',
  },
  
  // 오늘
  todayContainer: {
    backgroundColor: colors.brand500,
  },
  
  todayText: {
    color: colors.white,
    fontWeight: '600',
  },
  
  // 선택됨
  selectedContainer: {
    backgroundColor: colors.brand100,
    borderWidth: 2,
    borderColor: colors.brand500,
  },
  
  selectedText: {
    color: colors.brand500,
    fontWeight: '600',
  },
  
  // 요일별 색상
  sundayText: {
    color: colors.error,
  },
  
  saturdayText: {
    color: colors.brand500,
  },
  
  holidayText: {
    color: colors.error,
  },
  
  // 근무 시간 표시
  timeContainer: {
    alignItems: 'center',
    gap: 1,
  },
  
  timeText: {
    ...typography.captionSmall,
    color: colors.neutral500,
    fontSize: fs(9),
    fontVariant: ['tabular-nums'],
  },
  
  // 근무 있는 날
  hasWorkIndicator: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: colors.brand500,
    position: 'absolute',
    bottom: ms(4),
  },
  
  // 공휴일
  holidayBadge: {
    position: 'absolute',
    bottom: ms(2),
    paddingHorizontal: spacing.space1,
    paddingVertical: 1,
    backgroundColor: colors.error50,
    borderRadius: borderRadius.xs,
  },
  
  holidayBadgeText: {
    ...typography.captionSmall,
    color: colors.error,
    fontSize: fs(8),
  },
  
  // 이전/다음 달 날짜
  otherMonthText: {
    color: colors.neutral300,
  },
};
```

### 4. Monthly Summary Card

```typescript
const summaryCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginTop: spacing.space4,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  
  headerIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  statValue: {
    fontSize: fs(28),
    fontWeight: '700',
    color: colors.brand500,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  
  salarySection: {
    alignItems: 'center',
  },
  
  salaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  salaryLabelIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  salaryLabelText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  salaryValue: {
    ...typography.displaySmall,
    color: colors.brand500,
    fontWeight: '700',
  },
};
```

---

## 애니메이션

### 월 전환

```typescript
const monthTransitionAnimation = {
  // 다음 달로 이동
  next: {
    entering: SlideInRight.duration(300).springify(),
    exiting: SlideOutLeft.duration(300).springify(),
  },
  
  // 이전 달로 이동
  previous: {
    entering: SlideInLeft.duration(300).springify(),
    exiting: SlideOutRight.duration(300).springify(),
  },
  
  // 월 텍스트
  monthText: {
    entering: FadeIn.duration(200),
    exiting: FadeOut.duration(150),
  },
};
```

### 날짜 선택

```typescript
const dateSelectionAnimation = {
  select: {
    scale: { from: 1, to: 0.95, to: 1 },
    duration: 150,
  },
  
  highlight: {
    backgroundColor: {
      duration: 200,
    },
  },
  
  haptic: 'light',
};
```

### 서머리 카드

```typescript
const summaryAnimation = {
  entering: FadeInDown.delay(200).duration(400).springify(),
  
  valueChange: {
    opacity: { from: 0.5, to: 1 },
    scale: { from: 0.95, to: 1 },
    duration: 300,
  },
};
```

---

## 날짜별 색상 규칙

| 날짜 타입 | 색상 | 비고 |
|-----------|------|------|
| 일요일 | error | 항상 적용 |
| 토요일 | brand500 | 항상 적용 |
| 공휴일 | error | 공휴일 배지 표시 |
| 평일 | neutral700 | 기본 |
| 오늘 | white (brand500 bg) | 원형 배경 |
| 선택됨 | brand500 (brand100 bg) | 테두리 포함 |
| 이전/다음 달 | neutral300 | 투명도 낮음 |

---

## 접근성

```typescript
const accessibility = {
  monthSelector: {
    accessibilityRole: 'adjustable',
    accessibilityLabel: (month) => `${month}`,
    accessibilityHint: '좌우로 스와이프하여 월 변경',
    accessibilityActions: [
      { name: 'increment', label: '다음 달' },
      { name: 'decrement', label: '이전 달' },
    ],
  },
  
  navButton: {
    accessibilityRole: 'button',
    accessibilityLabel: (direction) => 
      direction === 'prev' ? '이전 달' : '다음 달',
  },
  
  dayCell: {
    accessibilityRole: 'button',
    accessibilityLabel: (date, hasWork, isHoliday) => {
      let label = formatAccessibleDate(date);
      if (hasWork) label += ', 근무 기록 있음';
      if (isHoliday) label += ', 공휴일';
      return label;
    },
    accessibilityHint: '두 번 탭하여 상세 보기',
    accessibilityState: {
      selected: isSelected,
    },
  },
  
  summary: {
    accessibilityRole: 'summary',
    accessibilityLabel: (days, hours, salary) =>
      `${days}일 근무, 총 ${hours}시간, 예상 급여 ${salary}원`,
  },
};
```

---

## 상태 관리

```typescript
interface CalendarState {
  // 현재 보고 있는 월
  currentMonth: Date;
  
  // 선택된 날짜
  selectedDate: Date | null;
  
  // 근무 기록
  workRecords: Map<string, WorkRecord>; // key: 'YYYY-MM-DD'
  
  // 공휴일
  holidays: Map<string, string>; // key: 'YYYY-MM-DD', value: 공휴일명
  
  // 월간 요약
  summary: {
    workDays: number;
    totalHours: number;
    expectedSalary: number;
  };
  
  // UI 상태
  isLoading: boolean;
}

interface WorkRecord {
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
  status: 'normal' | 'late' | 'early_leave' | 'absent';
}
```

---

## 전체 코드 예시

```typescript
// screens/Calendar/CalendarScreen.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { useCalendar } from '@/hooks/useCalendar';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatCurrency, getMonthName, getWeekdays } from '@/utils/format';

const CELL_WIDTH = (wp(100) - layout.screenPadding * 2) / 7;

export const CalendarScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    currentMonth,
    selectedDate,
    workRecords,
    holidays,
    summary,
    goToPreviousMonth,
    goToNextMonth,
    selectDate,
    isLoading,
  } = useCalendar();
  
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > 50) {
        setSwipeDirection('right');
        goToPreviousMonth();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (event.translationX < -50) {
        setSwipeDirection('left');
        goToNextMonth();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
  
  const handleDatePress = (date: Date) => {
    selectDate(date);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const getDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: Date[] = [];
    
    // 이전 달 날짜
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // 현재 달 날짜
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // 다음 달 날짜
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentMonth]);
  
  const renderDayCell = ({ item: date }: { item: Date }) => {
    const dateKey = date.toISOString().slice(0, 10);
    const work = workRecords.get(dateKey);
    const holiday = holidays.get(dateKey);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isSunday = date.getDay() === 0;
    const isSaturday = date.getDay() === 6;
    
    return (
      <TouchableOpacity
        style={styles.dayCell}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.dateContainer,
          isToday && styles.todayContainer,
          isSelected && !isToday && styles.selectedContainer,
        ]}>
          <Text style={[
            styles.dateText,
            isToday && styles.todayText,
            isSelected && !isToday && styles.selectedText,
            !isCurrentMonth && styles.otherMonthText,
            isSunday && isCurrentMonth && styles.sundayText,
            isSaturday && isCurrentMonth && styles.saturdayText,
            holiday && isCurrentMonth && styles.holidayText,
          ]}>
            {date.getDate()}
          </Text>
        </View>
        
        {work && isCurrentMonth && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{work.checkInTime}</Text>
            <Text style={styles.timeText}>{work.checkOutTime || '--:--'}</Text>
          </View>
        )}
        
        {holiday && isCurrentMonth && (
          <View style={styles.holidayBadge}>
            <Text style={styles.holidayBadgeText} numberOfLines={1}>
              {holiday}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header title="캘린더" showBack />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + hp(10) }}
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              setSwipeDirection('right');
              goToPreviousMonth();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icon name="chevron-left" size={ms(24)} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <Animated.Text
            style={styles.monthText}
            entering={swipeDirection === 'left' ? SlideInRight : SlideInLeft}
            key={currentMonth.toISOString()}
          >
            {currentMonth.getFullYear()}년 {getMonthName(currentMonth)}월
          </Animated.Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              setSwipeDirection('left');
              goToNextMonth();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icon name="chevron-right" size={ms(24)} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {getWeekdays().map((day, index) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={[
                styles.weekdayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Calendar Grid */}
        <GestureDetector gesture={swipeGesture}>
          <Animated.View
            style={styles.calendarGrid}
            entering={swipeDirection === 'left' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
            key={currentMonth.toISOString()}
          >
            <FlatList
              data={getDays}
              renderItem={renderDayCell}
              keyExtractor={(item) => item.toISOString()}
              numColumns={7}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </GestureDetector>
        
        {/* Monthly Summary */}
        <Animated.View
          style={styles.summaryCard}
          entering={FadeInDown.delay(200).duration(400).springify()}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryTitle}>
              {currentMonth.getMonth() + 1}월 근무 요약
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>근무일</Text>
              <Text style={styles.statValue}>{summary.workDays}일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 근무시간</Text>
              <Text style={styles.statValue}>{summary.totalHours}시간</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.salarySection}>
            <View style={styles.salaryLabel}>
              <Text style={styles.salaryLabelIcon}>💰</Text>
              <Text style={styles.salaryLabelText}>예상 급여</Text>
            </View>
            <Text style={styles.salaryValue}>
              {formatCurrency(summary.expectedSalary)}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(64),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
  },
  navButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  weekdayHeader: {
    flexDirection: 'row',
    height: ms(40),
    paddingHorizontal: spacing.space1,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  weekdayCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: {
    ...typography.labelMedium,
    fontWeight: '600',
    color: colors.neutral600,
  },
  calendarGrid: {
    paddingHorizontal: spacing.space1,
    backgroundColor: colors.white,
  },
  dayCell: {
    width: CELL_WIDTH,
    height: ms(80),
    padding: spacing.space1,
    alignItems: 'center',
  },
  dateContainer: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.space1,
  },
  dateText: {
    ...typography.titleSmall,
    fontWeight: '500',
    color: colors.neutral700,
  },
  todayContainer: {
    backgroundColor: colors.brand500,
  },
  todayText: {
    color: colors.white,
    fontWeight: '600',
  },
  selectedContainer: {
    backgroundColor: colors.brand100,
    borderWidth: 2,
    borderColor: colors.brand500,
  },
  selectedText: {
    color: colors.brand500,
    fontWeight: '600',
  },
  otherMonthText: {
    color: colors.neutral300,
  },
  sundayText: {
    color: colors.error,
  },
  saturdayText: {
    color: colors.brand500,
  },
  holidayText: {
    color: colors.error,
  },
  timeContainer: {
    alignItems: 'center',
    gap: 1,
  },
  timeText: {
    ...typography.captionSmall,
    color: colors.neutral500,
    fontSize: fs(9),
    fontVariant: ['tabular-nums'],
  },
  holidayBadge: {
    position: 'absolute',
    bottom: ms(2),
    paddingHorizontal: spacing.space1,
    paddingVertical: 1,
    backgroundColor: colors.error50,
    borderRadius: borderRadius.xs,
  },
  holidayBadgeText: {
    ...typography.captionSmall,
    color: colors.error,
    fontSize: fs(8),
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginTop: spacing.space4,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  summaryIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  summaryTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  statValue: {
    fontSize: fs(28),
    fontWeight: '700',
    color: colors.brand500,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  salarySection: {
    alignItems: 'center',
  },
  salaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  salaryLabelIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  salaryLabelText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  salaryValue: {
    ...typography.displaySmall,
    color: colors.brand500,
    fontWeight: '700',
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 데이터 로딩 실패
  loadError: {
    message: '근무 기록을 불러올 수 없습니다',
    action: 'retry',
  },
  
  // 빈 상태
  emptyStates: {
    noRecords: {
      icon: '📅',
      title: '근무 기록이 없습니다',
      subtitle: '출퇴근을 하면 여기에 기록됩니다',
    },
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  // 메모이제이션
  memoizedComponents: [
    'DayCell',
    'SummaryCard',
  ],
  
  // 가상화
  virtualization: {
    enabled: false, // 달력은 고정 42개 셀이라 불필요
  },
  
  // 데이터 캐싱
  caching: {
    workRecords: 'monthly', // 월별 캐싱
    holidays: 'yearly', // 연별 캐싱
  },
};
```
