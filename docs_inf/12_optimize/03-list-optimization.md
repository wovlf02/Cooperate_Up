# 대용량 리스트 최적화

## 1. FlatList vs FlashList

### 1.1 비교

| 특성 | FlatList | FlashList |
|------|----------|-----------|
| 제공처 | React Native 기본 | Shopify |
| 메모리 효율 | 보통 | 우수 (재활용) |
| 초기 렌더링 | 느림 | 빠름 |
| 스크롤 성능 | 보통 | 우수 |
| 설정 복잡도 | 간단 | estimatedItemSize 필수 |

### 1.2 FlashList 설치 및 기본 사용

```bash
npm install @shopify/flash-list
```

```typescript
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent';
}

interface AttendanceListProps {
  data: AttendanceRecord[];
  onItemPress: (id: string) => void;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  data,
  onItemPress,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: AttendanceRecord }) => (
      <AttendanceItem
        item={item}
        onPress={() => onItemPress(item.id)}
      />
    ),
    [onItemPress]
  );

  const keyExtractor = useCallback(
    (item: AttendanceRecord) => item.id,
    []
  );

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={72}  // ⚠️ 필수: 예상 아이템 높이
      showsVerticalScrollIndicator={false}
    />
  );
};
```

---

## 2. FlatList 최적화

### 2.1 핵심 Props 설정

```typescript
import React, { useCallback, useMemo } from 'react';
import { FlatList, View, Text } from 'react-native';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface EmployeeListProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onSelect,
}) => {
  // ✅ keyExtractor 메모이제이션
  const keyExtractor = useCallback((item: Employee) => item.id, []);

  // ✅ renderItem 메모이제이션
  const renderItem = useCallback(
    ({ item }: { item: Employee }) => (
      <EmployeeItem employee={item} onPress={onSelect} />
    ),
    [onSelect]
  );

  // ✅ getItemLayout으로 아이템 위치 계산 스킵 (고정 높이일 때)
  const ITEM_HEIGHT = 80;
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // ✅ ListEmptyComponent 메모이제이션
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>직원이 없습니다.</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={employees}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      // 성능 최적화 Props
      removeClippedSubviews={true}      // 화면 밖 컴포넌트 언마운트
      maxToRenderPerBatch={10}          // 배치당 렌더링 개수
      updateCellsBatchingPeriod={50}    // 배치 간격 (ms)
      windowSize={5}                     // 렌더링 윈도우 크기
      initialNumToRender={10}           // 초기 렌더링 개수
    />
  );
};

// 메모이제이션된 아이템 컴포넌트
interface EmployeeItemProps {
  employee: Employee;
  onPress: (employee: Employee) => void;
}

const EmployeeItem = React.memo<EmployeeItemProps>(({ employee, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(employee);
  }, [employee, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.item}>
      <Text style={styles.name}>{employee.name}</Text>
      <Text style={styles.department}>{employee.department}</Text>
    </TouchableOpacity>
  );
});
```

### 2.2 성능 Props 상세 설명

| Prop | 기본값 | 권장값 | 설명 |
|------|--------|--------|------|
| `windowSize` | 21 | 5-10 | 화면 높이의 배수로 렌더링 범위 결정 |
| `initialNumToRender` | 10 | 화면에 보이는 개수 | 첫 렌더링 아이템 수 |
| `maxToRenderPerBatch` | 10 | 5-10 | 배치당 렌더링 개수 |
| `updateCellsBatchingPeriod` | 50 | 50-100 | 배치 간격 (ms) |
| `removeClippedSubviews` | false | true | 화면 밖 뷰 언마운트 |

---

## 3. 무한 스크롤 구현

### 3.1 React Query + FlatList

```typescript
import React, { useCallback } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface PageData {
  data: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

const fetchMessages = async ({ pageParam }: { pageParam?: string }): Promise<PageData> => {
  const response = await api.get('/messages', {
    params: { cursor: pageParam, limit: 20 },
  });
  return response.data;
};

export const ChatMessageList: React.FC<{ roomId: string }> = ({ roomId }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['messages', roomId],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });

  // 모든 페이지의 메시지를 평탄화
  const messages = React.useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageItem message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const ListFooterComponent = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <ErrorScreen onRetry={refetch} />;
  }

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}  // 리스트 끝 50% 지점에서 트리거
      ListFooterComponent={ListFooterComponent}
      inverted  // 채팅은 역순
      removeClippedSubviews
      maxToRenderPerBatch={15}
      windowSize={7}
    />
  );
};
```

### 3.2 Pull-to-Refresh 구현

```typescript
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';

export const RefreshableList: React.FC = () => {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={['#007AFF']}  // Android
          tintColor="#007AFF"   // iOS
        />
      }
    />
  );
};
```

---

## 4. 섹션 리스트

### 4.1 SectionList 최적화

```typescript
import React, { useCallback, useMemo } from 'react';
import { SectionList, Text, View, StyleSheet } from 'react-native';

interface Announcement {
  id: string;
  title: string;
  createdAt: string;
  category: string;
}

interface Section {
  title: string;
  data: Announcement[];
}

interface AnnouncementSectionListProps {
  announcements: Announcement[];
}

export const AnnouncementSectionList: React.FC<AnnouncementSectionListProps> = ({
  announcements,
}) => {
  // 카테고리별 그룹화
  const sections: Section[] = useMemo(() => {
    const grouped = announcements.reduce<Record<string, Announcement[]>>(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {}
    );

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, [announcements]);

  const renderItem = useCallback(
    ({ item }: { item: Announcement }) => <AnnouncementItem item={item} />,
    []
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length}개</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: Announcement) => item.id, []);

  // 섹션 간 구분자
  const SectionSeparator = useCallback(
    () => <View style={styles.sectionSeparator} />,
    []
  );

  // 아이템 간 구분자
  const ItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    []
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      SectionSeparatorComponent={SectionSeparator}
      ItemSeparatorComponent={ItemSeparator}
      stickySectionHeadersEnabled
      // 성능 최적화
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};
```

---

## 5. 가상화 리스트 디버깅

### 5.1 렌더링 모니터링

```typescript
import React, { useCallback, useRef } from 'react';
import { FlatList } from 'react-native';

interface DebugFlatListProps<T> extends FlatListProps<T> {
  debugName: string;
}

export function DebugFlatList<T>({
  debugName,
  onViewableItemsChanged,
  ...props
}: DebugFlatListProps<T>) {
  const renderCountRef = useRef(0);
  const viewableRangeRef = useRef({ start: 0, end: 0 });

  // 뷰포트 내 아이템 추적
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems, changed }) => {
      if (__DEV__) {
        const indices = viewableItems.map(item => item.index);
        viewableRangeRef.current = {
          start: Math.min(...indices),
          end: Math.max(...indices),
        };
        
        console.log(`[${debugName}] Viewable range:`, viewableRangeRef.current);
      }
      
      onViewableItemsChanged?.({ viewableItems, changed });
    },
    [debugName, onViewableItemsChanged]
  );

  // 렌더링 횟수 추적
  const wrappedRenderItem = useCallback(
    (info: ListRenderItemInfo<T>) => {
      if (__DEV__) {
        renderCountRef.current++;
        console.log(
          `[${debugName}] Render #${renderCountRef.current}, index: ${info.index}`
        );
      }
      return props.renderItem(info);
    },
    [debugName, props.renderItem]
  );

  return (
    <FlatList
      {...props}
      renderItem={wrappedRenderItem}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100,
      }}
    />
  );
}
```

### 5.2 성능 지표 측정

```typescript
import { InteractionManager } from 'react-native';

// 리스트 렌더링 완료 시간 측정
export const measureListPerformance = async (
  listName: string,
  dataLength: number
) => {
  const startTime = performance.now();

  await new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`[Performance] ${listName}`);
      console.log(`  데이터 개수: ${dataLength}`);
      console.log(`  렌더링 시간: ${renderTime.toFixed(2)}ms`);
      console.log(`  아이템당 평균: ${(renderTime / dataLength).toFixed(2)}ms`);
      
      resolve();
    });
  });
};
```

---

## 6. 고급 최적화 기법

### 6.1 리스트 아이템 메모리 최적화

```typescript
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';

interface HeavyListItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

// ✅ 렌더링에 필요한 최소 데이터만 아이템에 전달
interface LightweightItemProps {
  id: string;
  imageUrl: string;
  title: string;
  onPress: (id: string) => void;
}

const LightweightItem = React.memo<LightweightItemProps>(({
  id,
  imageUrl,
  title,
  onPress,
}) => {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.item}>
      <FastImage source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
});

export const OptimizedList: React.FC<{ items: HeavyListItem[] }> = ({ items }) => {
  const handleItemPress = useCallback((id: string) => {
    // 전체 데이터에서 id로 조회
    const item = items.find(i => i.id === id);
    if (item) {
      navigateToDetail(item);
    }
  }, [items]);

  const renderItem = useCallback(
    ({ item }: { item: HeavyListItem }) => (
      <LightweightItem
        id={item.id}
        imageUrl={item.imageUrl}
        title={item.title}
        onPress={handleItemPress}
      />
    ),
    [handleItemPress]
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      estimatedItemSize={80}
    />
  );
};
```

### 6.2 리스트 상태 분리

```typescript
// ✅ 리스트 아이템 상태를 개별 관리
import { atom, useAtom } from 'jotai';

// 각 아이템의 선택 상태를 개별 atom으로 관리
const selectedItemsAtom = atom<Set<string>>(new Set());

const itemSelectedAtom = (id: string) =>
  atom(
    (get) => get(selectedItemsAtom).has(id),
    (get, set, selected: boolean) => {
      const current = new Set(get(selectedItemsAtom));
      if (selected) {
        current.add(id);
      } else {
        current.delete(id);
      }
      set(selectedItemsAtom, current);
    }
  );

// 아이템 컴포넌트
const SelectableItem: React.FC<{ id: string; title: string }> = ({ id, title }) => {
  const [isSelected, setIsSelected] = useAtom(itemSelectedAtom(id));
  
  // 다른 아이템 선택 시에도 이 컴포넌트는 리렌더링되지 않음
  return (
    <TouchableOpacity
      onPress={() => setIsSelected(!isSelected)}
      style={[styles.item, isSelected && styles.selected]}
    >
      <Text>{title}</Text>
      {isSelected && <CheckIcon />}
    </TouchableOpacity>
  );
};
```

