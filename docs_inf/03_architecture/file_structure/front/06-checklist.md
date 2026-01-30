// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\06-checklist.md
# 체크리스트 도메인 파일 구조 (Checklist Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

시간대별 업무 체크리스트 관리 화면입니다.
- **근무자 화면**: 할당된 시간대별 업무 체크, 진행률 확인
- **관리자 화면**: 전체 근무자 체크리스트 진행률 모니터링, 템플릿 관리

---

## 디렉토리 구조

```
src/features/checklist/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~4 lines)
│   │
│   ├── ChecklistWorkerScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ChecklistWorkerScreen.tsx   # 근무자 체크리스트 (~80 lines)
│   │   └── ChecklistWorkerScreen.styles.ts  # (~50 lines)
│   │
│   └── ChecklistMonitorScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── ChecklistMonitorScreen.tsx  # 관리자 모니터링 (~85 lines)
│       └── ChecklistMonitorScreen.styles.ts # (~50 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~14 lines)
│   │
│   ├── ProgressCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ProgressCard.tsx            # 진행률 카드 (~50 lines)
│   │   └── ProgressCard.styles.ts      # (~45 lines)
│   │
│   ├── TimeSlotTabs/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── TimeSlotTabs.tsx            # 시간대 탭 (~50 lines)
│   │   ├── TimeSlotTabs.styles.ts      # (~40 lines)
│   │   └── TimeSlotTab.tsx             # 개별 탭 (~35 lines)
│   │
│   ├── ChecklistItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ChecklistItem.tsx           # 체크리스트 항목 (~55 lines)
│   │   └── ChecklistItem.styles.ts     # (~50 lines)
│   │
│   ├── TimeSlotHeader/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── TimeSlotHeader.tsx          # 시간대 헤더 (~35 lines)
│   │   └── TimeSlotHeader.styles.ts    # (~30 lines)
│   │
│   ├── SummaryCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SummaryCard.tsx             # 전체 현황 요약 (~45 lines)
│   │   └── SummaryCard.styles.ts       # (~40 lines)
│   │
│   ├── WorkerCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkerCard.tsx              # 근무자별 카드 (~50 lines)
│   │   ├── WorkerCard.styles.ts        # (~45 lines)
│   │   └── ProgressBar.tsx             # 진행률 바 (~30 lines)
│   │
│   └── ReasonInputModal/
│       ├── index.ts                    # (~3 lines)
│       ├── ReasonInputModal.tsx        # 미완료 사유 입력 (~50 lines)
│       └── ReasonInputModal.styles.ts  # (~40 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~8 lines)
│   ├── useWorkerChecklist.ts           # 근무자 체크리스트 (~60 lines)
│   ├── useTodayTasks.ts                # 오늘 할 일 목록 (~50 lines)
│   ├── useChecklistMonitor.ts          # 관리자 모니터링 (~55 lines)
│   ├── useChecklistItem.ts             # 개별 항목 체크/스킵 (~50 lines)
│   ├── useChecklistTemplate.ts         # 템플릿 목록 (관리자) (~45 lines)
│   ├── useChecklistCreate.ts           # 템플릿 생성 (관리자) (~50 lines)
│   └── useChecklistUpdate.ts           # 템플릿 수정 (관리자) (~45 lines)
│
├── types/
│   └── checklist.types.ts              # 체크리스트 타입 정의 (~45 lines)
│
└── constants/
    └── checklist.constants.ts          # 체크리스트 상수 (~20 lines)
```

---

## 스크린 상세

### ChecklistWorkerScreen.tsx (~80 lines)

```typescript
import React, { useState, useCallback } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Header } from '@components/common';
import {
  ProgressCard,
  TimeSlotTabs,
  TimeSlotHeader,
  ChecklistItem,
  ReasonInputModal,
} from '../components';
import { useWorkerChecklist, useChecklistItem } from '../hooks';
import { ChecklistItemData } from '../types/checklist.types';
import { styles } from './ChecklistWorkerScreen.styles';

const ChecklistWorkerScreen = (): JSX.Element => {
  const {
    progress,
    timeSlots,
    currentSlot,
    setCurrentSlot,
    items,
    isLoading,
    refresh,
  } = useWorkerChecklist();

  const { toggleItem, submitReason } = useChecklistItem();

  const [selectedItem, setSelectedItem] = useState<ChecklistItemData | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  const handleToggleItem = useCallback(async (item: ChecklistItemData) => {
    if (item.completed) {
      // 완료 해제 시 사유 입력 필요
      setSelectedItem(item);
      setShowReasonModal(true);
    } else {
      await toggleItem(item.id, true);
    }
  }, [toggleItem]);

  const handleSubmitReason = async (reason: string) => {
    if (selectedItem) {
      await submitReason(selectedItem.id, reason);
      setShowReasonModal(false);
      setSelectedItem(null);
    }
  };

  const renderItem = ({ item }: { item: ChecklistItemData }) => (
    <ChecklistItem
      item={item}
      onToggle={() => handleToggleItem(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Header title="체크리스트" />
      
      <ScrollView stickyHeaderIndices={[1]}>
        <ProgressCard
          percentage={progress.percentage}
          completed={progress.completed}
          total={progress.total}
        />
        
        <TimeSlotTabs
          slots={timeSlots}
          currentSlot={currentSlot}
          onSelectSlot={setCurrentSlot}
        />
        
        <TimeSlotHeader
          slot={currentSlot}
          completed={items.filter(i => i.completed).length}
          total={items.length}
        />
        
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
      
      <ReasonInputModal
        visible={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSubmit={handleSubmitReason}
        minLength={3}
      />
    </View>
  );
};

export default ChecklistWorkerScreen;
```

### ChecklistMonitorScreen.tsx (~85 lines)

```typescript
import React from 'react';
import { View, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, EmptyState } from '@components/common';
import { SummaryCard, WorkerCard } from '../components';
import { useChecklistMonitor } from '../hooks';
import { styles } from './ChecklistMonitorScreen.styles';

const ChecklistMonitorScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const {
    summary,
    workers,
    isLoading,
    refresh,
    isRefreshing,
  } = useChecklistMonitor();

  const handleWorkerPress = (workerId: string) => {
    navigation.navigate('WorkerChecklistDetail', { workerId });
  };

  const getStatusVariant = (progress: number) => {
    if (progress >= 80) return 'good';
    if (progress >= 50) return 'normal';
    return 'warning';
  };

  return (
    <View style={styles.container}>
      <Header title="체크리스트 현황" />
      
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <SummaryCard
          averageProgress={summary.averageProgress}
          warningCount={summary.warningCount}
          totalWorkers={summary.totalWorkers}
        />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>현재 근무 중</Text>
        </View>
        
        {workers.length > 0 ? (
          workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              name={worker.name}
              profileImage={worker.profileImage}
              checkInTime={worker.checkInTime}
              progress={worker.progress}
              statusVariant={getStatusVariant(worker.progress)}
              onPress={() => handleWorkerPress(worker.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="👥"
            title="근무 중인 직원이 없습니다"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ChecklistMonitorScreen;
```

---

## 컴포넌트 상세

### ChecklistItem.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChecklistItemData } from '../types/checklist.types';
import { styles } from './ChecklistItem.styles';

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: () => void;
}

const ChecklistItem = ({ item, onToggle }: ChecklistItemProps): JSX.Element => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        item.completed && styles.containerCompleted,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {item.completed ? (
          <View style={styles.checkboxChecked}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          item.completed && styles.titleCompleted,
        ]}>
          {item.title}
        </Text>
        
        {item.completed && item.completedAt && (
          <Text style={styles.completedTime}>
            ✓ {item.completedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 완료
          </Text>
        )}
        
        {!item.completed && (
          <Text style={styles.status}>미완료</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChecklistItem;
```

### WorkerCard.tsx (~50 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ProfileImage } from '@components/shared';
import { ProgressBar } from './ProgressBar';
import { styles } from './WorkerCard.styles';

interface WorkerCardProps {
  name: string;
  profileImage?: string;
  checkInTime: string;
  progress: number;
  statusVariant: 'good' | 'normal' | 'warning';
  onPress: () => void;
}

const WorkerCard = ({
  name,
  profileImage,
  checkInTime,
  progress,
  statusVariant,
  onPress,
}: WorkerCardProps): JSX.Element => {
  const getStatusLabel = () => {
    switch (statusVariant) {
      case 'good': return '양호';
      case 'normal': return '보통';
      case 'warning': return '주의';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, styles[`container_${statusVariant}`]]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ProfileImage uri={profileImage} size={40} />
      
      <View style={styles.info}>
        <View style={styles.nameRow}>
          {statusVariant === 'warning' && <Text style={styles.warningIcon}>⚠️</Text>}
          <Text style={styles.name}>{name}</Text>
          <Text style={[styles.progress, styles[`progress_${statusVariant}`]]}>
            {progress}%
          </Text>
        </View>
        <Text style={styles.checkInTime}>{checkInTime} 출근</Text>
        <Text style={[styles.status, styles[`status_${statusVariant}`]]}>
          {getStatusLabel()}
        </Text>
      </View>
      
      <ProgressBar progress={progress} variant={statusVariant} />
    </TouchableOpacity>
  );
};

export default WorkerCard;
```

---

## 훅 상세

### useWorkerChecklist.ts (~55 lines)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { checklistService } from '@services/checklist/checklistService';
import { ChecklistItemData, TimeSlot, ChecklistProgress } from '../types/checklist.types';

interface UseWorkerChecklistReturn {
  progress: ChecklistProgress;
  timeSlots: TimeSlot[];
  currentSlot: TimeSlot | null;
  setCurrentSlot: (slot: TimeSlot) => void;
  items: ChecklistItemData[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useWorkerChecklist = (): UseWorkerChecklistReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const [items, setItems] = useState<ChecklistItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await checklistService.getTodayChecklist();
      setTimeSlots(data.timeSlots);
      
      // 현재 시간에 해당하는 슬롯 자동 선택
      const currentHour = new Date().getHours();
      const activeSlot = data.timeSlots.find(
        slot => slot.hour === currentHour
      ) || data.timeSlots[0];
      
      setCurrentSlot(activeSlot);
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentSlot) {
      checklistService.getSlotItems(currentSlot.id).then(setItems);
    }
  }, [currentSlot]);

  const progress: ChecklistProgress = {
    percentage: items.length > 0 
      ? Math.round((items.filter(i => i.completed).length / items.length) * 100)
      : 0,
    completed: items.filter(i => i.completed).length,
    total: items.length,
  };

  return {
    progress,
    timeSlots,
    currentSlot,
    setCurrentSlot,
    items,
    isLoading,
    refresh: fetchData,
  };
};
```

---

## 타입 정의

### checklist.types.ts (~45 lines)

```typescript
export interface TimeSlot {
  id: string;
  hour: number;
  label: string;
  completed: boolean;
  itemCount: number;
}

export interface ChecklistItemData {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  reason?: string;
  slotId: string;
}

export interface ChecklistProgress {
  percentage: number;
  completed: number;
  total: number;
}

export interface WorkerChecklistStatus {
  id: string;
  name: string;
  profileImage?: string;
  checkInTime: string;
  progress: number;
}

export interface ChecklistSummary {
  averageProgress: number;
  warningCount: number;
  totalWorkers: number;
}

export type ChecklistStatusVariant = 'good' | 'normal' | 'warning';
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| ChecklistWorkerScreen.tsx | 80 | 근무자 체크리스트 |
| ChecklistMonitorScreen.tsx | 85 | 관리자 모니터링 |
| **Components** | | |
| ProgressCard.tsx | 50 | 진행률 카드 |
| TimeSlotTabs.tsx | 50 | 시간대 탭 |
| TimeSlotTab.tsx | 35 | 개별 탭 |
| ChecklistItem.tsx | 55 | 체크리스트 항목 |
| TimeSlotHeader.tsx | 35 | 시간대 헤더 |
| SummaryCard.tsx | 45 | 전체 현황 요약 |
| WorkerCard.tsx | 50 | 근무자별 카드 |
| ProgressBar.tsx | 30 | 진행률 바 |
| ReasonInputModal.tsx | 50 | 사유 입력 모달 |
| **Hooks** | | |
| useWorkerChecklist.ts | 55 | 근무자 체크리스트 |
| useChecklistMonitor.ts | 50 | 관리자 모니터링 |
| useChecklistItem.ts | 45 | 개별 항목 체크 |

**총 파일 수**: 스크린 4개 + 컴포넌트 18개 + 훅 3개 + 타입/상수 2개 = **27개 파일**

