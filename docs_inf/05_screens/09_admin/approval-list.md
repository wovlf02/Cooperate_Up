# 승인 요청 목록 화면 (ApprovalListScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

관리자가 모든 승인 대기 요청을 처리하는 화면입니다.

### 🎯 UX 목표
- **빠른 처리**: 승인/거부를 즉시 처리할 수 있는 인라인 액션
- **명확한 정보**: 요청 유형, 기간, 사유를 한눈에 파악
- **상태 필터**: 대기/승인/거부 상태별 빠른 필터링

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   승인 요청                       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Filter Tabs (필터 탭)                  │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────┬─────────┬─────────┐    │ │
│ │  │대기 (3) │ 승인됨  │ 거부됨  │    │ │
│ │  │ active  │         │         │    │ │
│ │  └─────────┴─────────┴─────────┘    │ │
│ │  backgroundColor: neutral50         │ │
│ │  borderRadius: borderRadius.lg      │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Request List (FlatList)                │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────────────────────────┐  │    │ │
│ │  │ │ 🔵 수동 근태 입력      │  │    │ │
│ │  │ │ backgroundColor: brand50│  │    │ │
│ │  │ └────────────────────────┘  │    │ │
│ │  │                             │    │ │
│ │  │ 김철수                       │    │ │
│ │  │ typography.titleMedium      │    │ │
│ │  │                             │    │ │
│ │  │ 📅 2024.12.21 (토)          │    │ │
│ │  │ ⏰ 20:00 ~ 04:30 (8.5시간)  │    │ │
│ │  │ typography.bodyMedium       │    │ │
│ │  │                             │    │ │
│ │  │ 💬 사유: 휴대폰 배터리 방전 │    │ │
│ │  │ typography.bodySmall        │    │ │
│ │  │ numberOfLines: 2            │    │ │
│ │  │                             │    │ │
│ │  │ ─────────────────────────   │    │ │
│ │  │                             │    │ │
│ │  │ ┌─────────┐  ┌─────────┐    │    │ │
│ │  │ │  거부   │  │  승인   │    │    │ │
│ │  │ │ outline │  │ primary │    │    │ │
│ │  │ └─────────┘  └─────────┘    │    │ │
│ │  │                             │    │ │
│ │  │ borderRadius: borderRadius.xl    │ │
│ │  │ shadows.sm                  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  gap: spacing.space3                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ BottomTabBar                            │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

### 1. Filter Tabs

```typescript
const filterTabStyles = {
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    padding: spacing.space1,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    marginBottom: spacing.space4,
  },
  
  tab: {
    flex: 1,
    paddingVertical: spacing.space3,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  
  tabText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  tabTextActive: {
    color: colors.brand500,
    fontWeight: '600',
  },
  
  badge: {
    ...typography.labelSmall,
    color: colors.brand500,
    fontWeight: '600',
  },
};
```

### 2. Approval Request Card

```typescript
const requestCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.space3,
  },
  
  typeBadgeManual: {
    backgroundColor: colors.brand50,
  },
  
  typeBadgeEdit: {
    backgroundColor: colors.warning50,
  },
  
  typeBadgeText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  
  typeBadgeTextManual: {
    color: colors.brand600,
  },
  
  typeBadgeTextEdit: {
    color: colors.warning600,
  },
  
  employeeName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space3,
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
  
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  changeLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: ms(60),
  },
  
  changeOriginal: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  
  changeArrow: {
    ...typography.bodyMedium,
    color: colors.neutral400,
    marginHorizontal: spacing.space2,
  },
  
  changeNew: {
    ...typography.bodyMedium,
    color: colors.brand500,
    fontWeight: '600',
  },
  
  reasonContainer: {
    marginTop: spacing.space2,
  },
  
  reasonLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  reasonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: ms(20),
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  
  rejectButton: {
    flex: 1,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  
  rejectButtonText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  approveButton: {
    flex: 1,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.brand500,
    alignItems: 'center',
  },
  
  approveButtonText: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: '600',
  },
};
```

### 3. Edit Request Detail

```typescript
const editDetailStyles = {
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  changeLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: ms(60),
  },
  
  changeOriginal: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  
  changeArrow: {
    ...typography.bodyMedium,
    color: colors.neutral400,
    marginHorizontal: spacing.space2,
  },
  
  changeNew: {
    ...typography.bodyMedium,
    color: colors.brand500,
    fontWeight: '600',
  },
  
  changeDiff: {
    ...typography.labelSmall,
    color: colors.success,
    marginLeft: spacing.space2,
  },
};
```

---

## 승인 확인 모달

```
┌─────────────────────────────────────┐
│                                     │
│           ✅                        │
│                                     │
│     승인하시겠습니까?               │
│     typography.titleLarge           │
│                                     │
│   김철수님의 수동 근태 입력을       │
│   승인합니다.                       │
│   typography.bodyMedium             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  📅 2024.12.21              │   │
│   │  ⏰ 20:00 ~ 04:30 (8.5시간) │   │
│   │  💰 예상 급여: ₩85,255      │   │
│   │  backgroundColor: brand50   │   │
│   └─────────────────────────────┘   │
│                                     │
│  ┌───────────┐  ┌───────────┐       │
│  │   취소    │  │   승인    │       │
│  │  neutral  │  │  primary  │       │
│  └───────────┘  └───────────┘       │
│                                     │
│  borderRadius: borderRadius.xl      │
│  padding: spacing.space6            │
│                                     │
└─────────────────────────────────────┘
```

---

## 거부 사유 입력 모달

```
┌─────────────────────────────────────┐
│                                     │
│           ❌                        │
│                                     │
│     거부 사유 입력                  │
│     typography.titleLarge           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │  거부 사유를 입력해주세요    │    │
│  │  placeholder                │    │
│  │                             │    │
│  │  minHeight: hp(15)          │    │
│  │  borderRadius: borderRadius.lg   │
│  │  multiline: true            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                              0/200  │
│                                     │
│  ┌───────────┐  ┌───────────┐       │
│  │   취소    │  │   거부    │       │
│  │  neutral  │  │   error   │       │
│  └───────────┘  └───────────┘       │
│                                     │
│  borderRadius: borderRadius.xl      │
│  padding: spacing.space6            │
│                                     │
└─────────────────────────────────────┘
```

---

## 애니메이션

### 화면 진입

```typescript
const screenAnimations = {
  filterTabs: {
    entering: FadeIn.duration(300),
  },
  
  listItem: (index: number) => ({
    entering: FadeInUp.delay(100 + index * 50).duration(400).springify(),
  }),
};
```

### 탭 전환

```typescript
const tabAnimations = {
  indicator: {
    transform: withSpring(tabPosition, {
      damping: 15,
      stiffness: 150,
    }),
  },
};
```

### 카드 상호작용

```typescript
const cardAnimations = {
  approval: {
    scale: withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    ),
    opacity: withTiming(0, { duration: 300 }),
    height: withTiming(0, { duration: 300 }),
    marginBottom: withTiming(0, { duration: 300 }),
  },
  
  buttonPress: {
    scale: withSpring(0.95, { damping: 15, stiffness: 200 }),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  filterTab: {
    accessibilityRole: 'tab',
    accessibilityState: { selected: isActive },
    accessibilityLabel: (status, count) => 
      `${status} 요청 ${count}건`,
  },
  
  requestCard: {
    accessibilityRole: 'article',
    accessibilityLabel: (type, name, date, hours) =>
      `${name}님의 ${type} 요청. ${date}, ${hours}시간`,
  },
  
  approveButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '승인하기',
    accessibilityHint: '두 번 탭하여 승인 확인 창 열기',
  },
  
  rejectButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '거부하기',
    accessibilityHint: '두 번 탭하여 거부 사유 입력 창 열기',
  },
};
```

---

## 상태 관리

```typescript
interface ApprovalListState {
  // 필터
  filter: 'pending' | 'approved' | 'rejected';
  
  // 요청 목록
  requests: ApprovalRequest[];
  
  // 카운트
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  
  // 선택된 요청
  selectedRequest: ApprovalRequest | null;
  
  // 모달 상태
  showApproveModal: boolean;
  showRejectModal: boolean;
  rejectReason: string;
  
  // UI 상태
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

interface ApprovalRequest {
  id: string;
  type: 'manual_input' | 'edit_request';
  employeeId: string;
  employeeName: string;
  date: Date;
  originalCheckIn?: Date;
  originalCheckOut?: Date;
  requestedCheckIn: Date;
  requestedCheckOut: Date;
  workHours: number;
  expectedWage: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
```

---

## 전체 코드 예시

```typescript
// screens/Admin/ApprovalListScreen.tsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  Layout,
  SlideOutLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';

import { useApprovalRequests } from '@/hooks/useApprovalRequests';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatDate, formatTime, formatHours } from '@/utils/date';

type FilterType = 'pending' | 'approved' | 'rejected';

export const ApprovalListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const {
    requests,
    counts,
    isLoading,
    approveRequest,
    rejectRequest,
  } = useApprovalRequests();
  
  // 필터된 요청 목록
  const filteredRequests = useMemo(() => 
    requests.filter(req => req.status === filter),
    [requests, filter]
  );
  
  // 승인 처리
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      await approveRequest(selectedRequest.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', message: '승인되었습니다' });
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', message: '승인에 실패했습니다' });
    }
  };
  
  // 거부 처리
  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    
    try {
      await rejectRequest(selectedRequest.id, rejectReason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', message: '거부되었습니다' });
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', message: '거부에 실패했습니다' });
    }
  };
  
  // 타입 배지 스타일
  const getTypeBadgeStyle = (type: string) => ({
    container: type === 'manual_input' 
      ? styles.typeBadgeManual 
      : styles.typeBadgeEdit,
    text: type === 'manual_input'
      ? styles.typeBadgeTextManual
      : styles.typeBadgeTextEdit,
    label: type === 'manual_input' ? '수동 근태 입력' : '근태 수정 요청',
  });
  
  // 요청 카드 렌더링
  const renderRequestCard = useCallback(({ item, index }) => {
    const typeStyle = getTypeBadgeStyle(item.type);
    
    return (
      <Animated.View
        entering={FadeInUp.delay(100 + index * 50).duration(400).springify()}
        exiting={SlideOutLeft.duration(300)}
        layout={Layout.springify()}
      >
        <View style={styles.requestCard}>
          <View style={[styles.typeBadge, typeStyle.container]}>
            <Text style={[styles.typeBadgeText, typeStyle.text]}>
              {item.type === 'manual_input' ? '🔵' : '🟠'} {typeStyle.label}
            </Text>
          </View>
          
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={styles.infoText}>
              {formatTime(item.requestedCheckIn)} ~ {formatTime(item.requestedCheckOut)} 
              ({formatHours(item.workHours)})
            </Text>
          </View>
          
          {item.type === 'edit_request' && (
            <>
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>출근:</Text>
                <Text style={styles.changeOriginal}>
                  {formatTime(item.originalCheckIn)}
                </Text>
                <Text style={styles.changeArrow}>→</Text>
                <Text style={styles.changeNew}>
                  {formatTime(item.requestedCheckIn)}
                </Text>
              </View>
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>퇴근:</Text>
                <Text style={styles.changeOriginal}>
                  {formatTime(item.originalCheckOut)}
                </Text>
                <Text style={styles.changeArrow}>→</Text>
                <Text style={styles.changeNew}>
                  {formatTime(item.requestedCheckOut)}
                </Text>
              </View>
            </>
          )}
          
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>💬 사유</Text>
            <Text style={styles.reasonText} numberOfLines={2}>
              {item.reason}
            </Text>
          </View>
          
          {item.status === 'pending' && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    setSelectedRequest(item);
                    setShowRejectModal(true);
                  }}
                >
                  <Text style={styles.rejectButtonText}>거부</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => {
                    setSelectedRequest(item);
                    setShowApproveModal(true);
                  }}
                >
                  <Text style={styles.approveButtonText}>승인</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    );
  }, []);
  
  // 필터 탭 렌더링
  const renderFilterTabs = () => (
    <Animated.View 
      style={styles.filterContainer}
      entering={FadeIn.duration(300)}
    >
      {(['pending', 'approved', 'rejected'] as FilterType[]).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterTab,
            filter === status && styles.filterTabActive,
          ]}
          onPress={() => setFilter(status)}
        >
          <Text style={[
            styles.filterTabText,
            filter === status && styles.filterTabTextActive,
          ]}>
            {status === 'pending' && `대기 (${counts.pending})`}
            {status === 'approved' && '승인됨'}
            {status === 'rejected' && '거부됨'}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      <Header title="승인 요청" showBack />
      
      {renderFilterTabs()}
      
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + hp(4) }
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title={`${filter === 'pending' ? '대기 중인' : filter === 'approved' ? '승인된' : '거부된'} 요청이 없습니다`}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* 승인 확인 모달 */}
      <Modal
        visible={showApproveModal}
        onClose={() => setShowApproveModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalIcon}>✅</Text>
          <Text style={styles.modalTitle}>승인하시겠습니까?</Text>
          <Text style={styles.modalMessage}>
            {selectedRequest?.employeeName}님의{'\n'}
            {selectedRequest?.type === 'manual_input' ? '수동 근태 입력' : '근태 수정 요청'}을 승인합니다.
          </Text>
          
          <View style={styles.modalInfo}>
            <Text style={styles.modalInfoText}>
              📅 {selectedRequest && formatDate(selectedRequest.date)}
            </Text>
            <Text style={styles.modalInfoText}>
              ⏰ {selectedRequest && `${formatTime(selectedRequest.requestedCheckIn)} ~ ${formatTime(selectedRequest.requestedCheckOut)}`}
            </Text>
            <Text style={styles.modalInfoText}>
              💰 예상 급여: ₩{selectedRequest?.expectedWage.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setShowApproveModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonApprove}
              onPress={handleApprove}
            >
              <Text style={styles.modalButtonApproveText}>승인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* 거부 사유 모달 */}
      <Modal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalIcon}>❌</Text>
          <Text style={styles.modalTitle}>거부 사유 입력</Text>
          
          <TextInput
            style={styles.reasonInput}
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="거부 사유를 입력해주세요"
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{rejectReason.length}/200</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              <Text style={styles.modalButtonCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButtonReject,
                !rejectReason.trim() && styles.modalButtonDisabled,
              ]}
              onPress={handleReject}
              disabled={!rejectReason.trim()}
            >
              <Text style={styles.modalButtonRejectText}>거부</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  listContent: {
    paddingTop: spacing.space2,
  },
  separator: {
    height: spacing.space3,
  },
  
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    padding: spacing.space1,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    marginBottom: spacing.space4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.space3,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  filterTabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  filterTabText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.brand500,
    fontWeight: '600',
  },
  
  // Request Card
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.space3,
  },
  typeBadgeManual: {
    backgroundColor: colors.brand50,
  },
  typeBadgeEdit: {
    backgroundColor: colors.warning50,
  },
  typeBadgeText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  typeBadgeTextManual: {
    color: colors.brand600,
  },
  typeBadgeTextEdit: {
    color: colors.warning600,
  },
  employeeName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space3,
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
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  changeLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: ms(60),
  },
  changeOriginal: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  changeArrow: {
    ...typography.bodyMedium,
    color: colors.neutral400,
    marginHorizontal: spacing.space2,
  },
  changeNew: {
    ...typography.bodyMedium,
    color: colors.brand500,
    fontWeight: '600',
  },
  reasonContainer: {
    marginTop: spacing.space2,
  },
  reasonLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  reasonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: ms(20),
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  rejectButtonText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.brand500,
    alignItems: 'center',
  },
  approveButtonText: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: '600',
  },
  
  // Modal
  modalContent: {
    alignItems: 'center',
    padding: spacing.space6,
  },
  modalIcon: {
    fontSize: ms(48),
    marginBottom: spacing.space4,
  },
  modalTitle: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space3,
  },
  modalMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.space4,
  },
  modalInfo: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    width: '100%',
    marginBottom: spacing.space5,
  },
  modalInfoText: {
    ...typography.bodyMedium,
    color: colors.brand600,
    marginBottom: spacing.space2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.space3,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalButtonApprove: {
    flex: 1,
    paddingVertical: spacing.space4,
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonApproveText: {
    ...typography.titleSmall,
    color: colors.white,
    fontWeight: '600',
  },
  modalButtonReject: {
    flex: 1,
    paddingVertical: spacing.space4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonRejectText: {
    ...typography.titleSmall,
    color: colors.white,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  reasonInput: {
    width: '100%',
    minHeight: hp(15),
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    padding: spacing.space4,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.space2,
  },
  charCount: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    alignSelf: 'flex-end',
    marginBottom: spacing.space4,
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    title: '요청 목록을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  approveError: {
    type: 'toast',
    message: '승인에 실패했습니다. 다시 시도해주세요',
  },
  
  rejectError: {
    type: 'toast',
    message: '거부에 실패했습니다. 다시 시도해주세요',
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
  
  memoizedComponents: [
    'RequestCard',
    'FilterTabs',
  ],
  
  useMemo: [
    'filteredRequests',
  ],
};
```
