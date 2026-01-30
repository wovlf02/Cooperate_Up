# 관리자 홈 화면 (AdminHomeScreen) - Production Ready v2.0

## 개요

관리자가 앱에 로그인 후 처음 보는 홈 화면입니다.
토스, 카카오페이 등의 대시보드 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

- **사업장 선택**: 여러 사업장 운영 시 상단에서 사업장 전환
- **대시보드**: 선택된 사업장의 실시간 요약 정보 표시
- **자동 로그인**: 앱 재실행 시 마지막 선택한 사업장이 자동 선택됨

---

## 🎨 디자인 원칙

### UX 목표

- **한눈에 파악**: 핵심 현황을 3초 이내 인지
- **우선순위 강조**: 승인 대기 등 주의가 필요한 항목 강조
- **시각적 계층**: 가장 중요한 정보가 가장 눈에 띔
- **부드러운 전환**: 모든 상태 변화에 애니메이션 적용

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (light-content on gradient)                     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ╔═══════════════════════════════════════════════════════╗
│  ║                                                       ║
│  ║  🏢 스타벅스 강남점 ▼              🔔                ║
│  ║      사업장 선택 (드롭다운)        (알림, 배지 표시)  ║
│  ║                                                       ║
│  ║  ─────────────────────────────────────────────────── ║
│  ║                                                       ║
│  ║  👋 안녕하세요, 김사장님                              ║
│  ║      displaySmall, white, fontWeight: 700             ║
│  ║                                                       ║
│  ║  12월 26일 목요일                                     ║
│  ║      bodyMedium, white/80%                            ║
│  ║                                                       ║
│  ╚═══════════════════════════════════════════════════════╝
│                                                           │
│  Gradient Header Background                               │
│  colors: [brand600, brand500]                             │
│  height: ~hp(25)                                          │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ScrollView (overlaps header)                             │
│  paddingTop: -hp(8) (오버랩)                              │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  👥 현재 출근 현황                      Hero Card   │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │     ┌─────────────────┬─────────────────┐          │  │
│  │     │                 │                 │          │  │
│  │     │    출근자       │    미출근       │          │  │
│  │     │      3명        │      2명        │          │  │
│  │     │    success      │    neutral400   │          │  │
│  │     │    fs(32)       │    fs(32)       │          │  │
│  │     │                 │                 │          │  │
│  │     └─────────────────┴─────────────────┘          │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  👤 김철수  👤 박영희  👤 이민수             │  │  │
│  │  │      아바타 (32px) + 이름                    │  │  │
│  │  │      가로 스크롤                             │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  borderRadius: xl (20px)                            │  │
│  │  padding: 24px                                      │  │
│  │  ⚡ Large shadow                                    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  (승인 대기 있을 때) marginTop: space4                    │
│  ⚡ Pulse animation on badge                              │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ⏳ 승인 대기                        ┌────────────┐ │  │
│  │                                      │  3건 대기  │ │  │
│  │                                      │  error bg  │ │  │
│  │                                      └────────────┘ │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🔵 김철수                                  │    │  │
│  │  │     수동 근태 입력                          │    │  │
│  │  │     12/21 20:00~04:30                    >  │    │  │
│  │  │                                             │    │  │
│  │  │  height: 72px                               │    │  │
│  │  │  touchable, borderBottom                    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🟠 박영희                                  │    │  │
│  │  │     근태 수정 요청                          │    │  │
│  │  │     12/20 출근시간 변경                  >  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │              전체 보기 (3건)               >  │  │  │
│  │  │              labelMedium, brand500            │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: xl                                   │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Quick Stats Grid (2열) marginTop: space4                 │
│  ┌───────────────────┐  ┌───────────────────┐            │
│  │                   │  │                   │            │
│  │  💰 12월 급여     │  │  ✅ 체크리스트    │            │
│  │  ₩5,436,260      │  │     평균 72%     │            │
│  │  5명 • 542시간   │  │     ⚠️ 1명 주의   │            │
│  │                   │  │                   │            │
│  │  터치 → 급여관리  │  │  터치 → 모니터링  │            │
│  │                   │  │                   │            │
│  └───────────────────┘  └───────────────────┘            │
│                                                           │
│  gap: 12px                                                │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│  marginTop: space6                                        │
│                                                           │
│  📢 최근 공지사항                        + 새 공지  >    │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📌 12월 급여일 안내                       12/20   │  │
│  │      중요 공지 (빨간 점)                           │  │
│  │      height: 60px                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📋 연말 근무 일정 변경                     12/18   │  │
│  │      일반 공지                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: tabBarHeight + safeArea                   │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ BottomTabBar                                              │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Gradient Header

```typescript
const gradientHeaderStyles = {
  container: {
    paddingTop: safeAreaTop,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: hp(12), // 오버랩 영역
  },
  
  gradient: {
    colors: [colors.brand600, colors.brand500],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // 사업장 선택
  workplaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  workplaceIcon: {
    size: ms(18),
    color: colors.white,
    marginRight: spacing.space2,
  },
  
  workplaceName: {
    ...typography.titleSmall,
    color: colors.white,
    marginRight: spacing.space1,
  },
  
  chevron: {
    size: ms(16),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // 알림 버튼
  notificationButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notificationBadge: {
    position: 'absolute',
    top: ms(6),
    right: ms(6),
    minWidth: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badgeText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
  },
  
  // 인사말
  greeting: {
    marginTop: spacing.space5,
  },
  
  greetingText: {
    ...typography.displaySmall,
    color: colors.white,
    fontWeight: '700',
  },
  
  dateText: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.space1,
  },
};
```

### 2. Attendance Status Card (Hero Card)

```typescript
const attendanceCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    marginHorizontal: layout.screenPadding,
    marginTop: hp(-8), // 오버랩
    ...shadows.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space5,
  },
  
  headerIcon: {
    fontSize: ms(20),
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
    fontSize: fs(32),
    fontWeight: '700',
  },
  
  statValuePresent: {
    color: colors.success,
  },
  
  statValueAbsent: {
    color: colors.neutral400,
  },
  
  // 출근자 아바타 리스트
  avatarList: {
    marginTop: spacing.space4,
  },
  
  avatarListScroll: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  
  avatarItem: {
    alignItems: 'center',
  },
  
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: colors.neutral100,
    marginBottom: spacing.space1,
  },
  
  avatarName: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
};
```

### 3. Pending Approval Card

```typescript
const approvalCardStyles = {
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
    justifyContent: 'space-between',
    marginBottom: spacing.space4,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.full,
  },
  
  badgeText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '600',
  },
  
  // 아이템
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  itemIcon: {
    fontSize: ms(16),
    marginRight: spacing.space3,
  },
  
  itemContent: {
    flex: 1,
  },
  
  itemName: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  itemType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space0_5,
  },
  
  itemMeta: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space0_5,
  },
  
  chevron: {
    size: ms(20),
    color: colors.neutral400,
  },
  
  // 전체 보기
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space3,
    marginTop: spacing.space2,
  },
  
  viewAllText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginRight: spacing.space1,
  },
  
  // 요청 타입 아이콘
  requestTypes: {
    manual: { icon: '🔵', label: '수동 근태 입력' },
    edit: { icon: '🟠', label: '근태 수정 요청' },
    leave: { icon: '🟢', label: '휴가 요청' },
  },
};
```

### 4. Quick Stats Grid

```typescript
const statsGridStyles = {
  container: {
    flexDirection: 'row',
    gap: spacing.space3,
    marginTop: spacing.space4,
    marginHorizontal: layout.screenPadding,
  },
  
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    ...shadows.sm,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  
  cardIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  cardTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  cardValue: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  cardSubtext: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  
  warningSubtext: {
    color: colors.warning,
    fontWeight: '600',
  },
};
```

### 5. Announcements Section

```typescript
const announcementsSectionStyles = {
  container: {
    marginTop: spacing.space6,
    marginHorizontal: layout.screenPadding,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space3,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.full,
  },
  
  addButtonText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginLeft: spacing.space1,
  },
  
  // 공지 아이템
  item: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space2,
    ...shadows.xs,
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  itemTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  pinIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  
  titleText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  
  itemDate: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
};
```

---

## 애니메이션

### 카드 진입

```typescript
const cardEntranceAnimation = {
  heroCard: {
    entering: FadeInDown.delay(100).duration(400).springify(),
  },
  
  approvalCard: {
    entering: FadeInDown.delay(200).duration(400).springify(),
  },
  
  statsGrid: {
    stagger: 50,
    entering: FadeInDown.duration(300).springify(),
  },
  
  announcements: {
    entering: FadeInDown.delay(300).duration(400),
  },
};
```

### 배지 펄스

```typescript
const badgePulseAnimation = {
  // 승인 대기 배지
  pulse: {
    scale: {
      from: 1,
      to: 1.1,
      duration: 500,
      loop: true,
      easing: 'easeInOut',
    },
    opacity: {
      from: 1,
      to: 0.8,
      duration: 500,
      loop: true,
    },
  },
};
```

### 사업장 드롭다운

```typescript
const dropdownAnimation = {
  open: {
    height: { from: 0, to: 'auto' },
    opacity: { from: 0, to: 1 },
    duration: 200,
    easing: 'easeOut',
  },
  
  close: {
    height: { to: 0 },
    opacity: { to: 0 },
    duration: 150,
    easing: 'easeIn',
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  workplaceSelector: {
    accessibilityRole: 'button',
    accessibilityLabel: (name) => `${name} 사업장 선택됨`,
    accessibilityHint: '두 번 탭하여 다른 사업장 선택',
  },
  
  notificationButton: {
    accessibilityRole: 'button',
    accessibilityLabel: (count) => 
      count > 0 ? `알림 ${count}건` : '알림 없음',
    accessibilityHint: '두 번 탭하여 알림 확인',
  },
  
  attendanceCard: {
    accessibilityRole: 'summary',
    accessibilityLabel: (present, absent) => 
      `현재 출근자 ${present}명, 미출근자 ${absent}명`,
  },
  
  approvalItem: {
    accessibilityRole: 'button',
    accessibilityLabel: (name, type, date) => 
      `${name}님의 ${type}, ${date}`,
    accessibilityHint: '두 번 탭하여 상세 확인',
  },
  
  statsCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (title, value) => `${title} ${value}`,
    accessibilityHint: '두 번 탭하여 상세 보기',
  },
};
```

---

## 상태 관리

```typescript
interface AdminHomeState {
  // 사업장
  selectedWorkplace: Workplace | null;
  workplaces: Workplace[];
  showWorkplaceDropdown: boolean;
  
  // 출근 현황
  attendance: {
    present: Employee[];
    absent: Employee[];
    total: number;
  };
  
  // 승인 대기
  pendingApprovals: ApprovalRequest[];
  
  // 급여 현황
  payroll: {
    totalAmount: number;
    employeeCount: number;
    totalHours: number;
  };
  
  // 체크리스트
  checklist: {
    averageProgress: number;
    lowProgressCount: number;
  };
  
  // 공지사항
  announcements: Announcement[];
  
  // 알림
  unreadNotifications: number;
  
  // UI 상태
  isLoading: boolean;
  isRefreshing: boolean;
}
```

---

## 전체 코드 예시

```typescript
// screens/Home/AdminHomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '@/hooks/useUser';
import { useWorkplace } from '@/hooks/useWorkplace';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

export const AdminHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { 
    selectedWorkplace, 
    workplaces, 
    attendance, 
    pendingApprovals,
    payroll,
    checklist,
    announcements,
  } = useWorkplace();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 배지 펄스 애니메이션
  const badgeScale = useSharedValue(1);
  
  useEffect(() => {
    if (pendingApprovals.length > 0) {
      badgeScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [pendingApprovals.length]);
  
  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refresh data
    setIsRefreshing(false);
  };
  
  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.brand600, colors.brand500]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        {/* Workplace Selector + Notification */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.workplaceSelector}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.workplaceIcon}>🏢</Text>
            <Text style={styles.workplaceName}>{selectedWorkplace?.name}</Text>
            <Icon name="chevron-down" size={ms(16)} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={ms(22)} color={colors.white} />
            {unreadNotifications > 0 && (
              <Animated.View style={[styles.notificationBadge, badgeAnimatedStyle]}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            안녕하세요, {user.name}님 👋
          </Text>
          <Text style={styles.dateText}>
            {formatDate(new Date())}
          </Text>
        </View>
      </LinearGradient>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Attendance Card */}
        <Animated.View
          style={styles.attendanceCard}
          entering={FadeInDown.delay(100).duration(400).springify()}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>👥</Text>
            <Text style={styles.cardHeaderTitle}>현재 출근 현황</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>출근자</Text>
              <Text style={[styles.statValue, styles.statValuePresent]}>
                {attendance.present.length}명
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>미출근</Text>
              <Text style={[styles.statValue, styles.statValueAbsent]}>
                {attendance.absent.length}명
              </Text>
            </View>
          </View>
          
          {/* Avatar List */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.avatarList}
            contentContainerStyle={styles.avatarListScroll}
          >
            {attendance.present.map((employee) => (
              <View key={employee.id} style={styles.avatarItem}>
                <Image
                  source={{ uri: employee.profileImage }}
                  style={styles.avatar}
                  defaultSource={require('@/assets/default-avatar.png')}
                />
                <Text style={styles.avatarName}>{employee.name}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <Animated.View
            style={styles.approvalCard}
            entering={FadeInDown.delay(200).duration(400).springify()}
          >
            <View style={styles.approvalHeader}>
              <View style={styles.approvalHeaderLeft}>
                <Text style={styles.approvalIcon}>⏳</Text>
                <Text style={styles.approvalTitle}>승인 대기</Text>
              </View>
              <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                <Text style={styles.badgeText}>{pendingApprovals.length}건 대기</Text>
              </Animated.View>
            </View>
            
            {pendingApprovals.slice(0, 2).map((item) => (
              <TouchableOpacity key={item.id} style={styles.approvalItem}>
                <Text style={styles.approvalItemIcon}>
                  {requestTypeIcons[item.type]}
                </Text>
                <View style={styles.approvalItemContent}>
                  <Text style={styles.approvalItemName}>{item.employeeName}</Text>
                  <Text style={styles.approvalItemType}>{item.typeLabel}</Text>
                  <Text style={styles.approvalItemMeta}>{item.date}</Text>
                </View>
                <Icon name="chevron-right" size={ms(20)} color={colors.neutral400} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                전체 보기 ({pendingApprovals.length}건)
              </Text>
              <Icon name="chevron-right" size={ms(16)} color={colors.brand500} />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View
            entering={FadeInDown.delay(250).duration(300).springify()}
          >
            <TouchableOpacity style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardIcon}>💰</Text>
                <Text style={styles.statCardTitle}>12월 급여</Text>
              </View>
              <Text style={styles.statCardValue}>
                ₩{payroll.totalAmount.toLocaleString()}
              </Text>
              <Text style={styles.statCardSubtext}>
                {payroll.employeeCount}명 • {payroll.totalHours}시간
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View
            entering={FadeInDown.delay(300).duration(300).springify()}
          >
            <TouchableOpacity style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardIcon}>✅</Text>
                <Text style={styles.statCardTitle}>체크리스트</Text>
              </View>
              <Text style={styles.statCardValue}>
                평균 {checklist.averageProgress}%
              </Text>
              {checklist.lowProgressCount > 0 && (
                <Text style={[styles.statCardSubtext, styles.warningSubtext]}>
                  ⚠️ {checklist.lowProgressCount}명 주의
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Announcements */}
        <Animated.View
          style={styles.announcementsSection}
          entering={FadeInDown.delay(350).duration(400)}
        >
          <View style={styles.announcementsHeader}>
            <View style={styles.announcementsHeaderLeft}>
              <Text style={styles.announcementsIcon}>📢</Text>
              <Text style={styles.announcementsTitle}>최근 공지사항</Text>
            </View>
            <TouchableOpacity style={styles.addAnnouncementButton}>
              <Icon name="plus" size={ms(14)} color={colors.brand500} />
              <Text style={styles.addAnnouncementText}>새 공지</Text>
            </TouchableOpacity>
          </View>
          
          {announcements.map((item) => (
            <TouchableOpacity key={item.id} style={styles.announcementItem}>
              <View style={styles.announcementHeader}>
                <View style={styles.announcementTitle}>
                  {item.isPinned && <Text style={styles.pinIcon}>📌</Text>}
                  <Text style={styles.announcementTitleText} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                <Text style={styles.announcementDate}>
                  {formatShortDate(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
      
      {/* Workplace Dropdown Modal */}
      {showDropdown && (
        <WorkplaceDropdown
          workplaces={workplaces}
          selectedId={selectedWorkplace?.id}
          onSelect={(workplace) => {
            setSelectedWorkplace(workplace);
            setShowDropdown(false);
          }}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: hp(12),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.space2,
  },
  workplaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.full,
  },
  workplaceIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  workplaceName: {
    ...typography.titleSmall,
    color: colors.white,
    marginRight: spacing.space1,
  },
  notificationButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: ms(6),
    right: ms(6),
    minWidth: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: fs(10),
  },
  greeting: {
    marginTop: spacing.space5,
  },
  greetingText: {
    ...typography.displaySmall,
    color: colors.white,
    fontWeight: '700',
  },
  dateText: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.space1,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  attendanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    marginHorizontal: layout.screenPadding,
    marginTop: hp(-8),
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space5,
  },
  cardHeaderIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  cardHeaderTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
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
    fontSize: fs(32),
    fontWeight: '700',
  },
  statValuePresent: {
    color: colors.success,
  },
  statValueAbsent: {
    color: colors.neutral400,
  },
  avatarList: {
    marginTop: spacing.space4,
  },
  avatarListScroll: {
    gap: spacing.space3,
  },
  avatarItem: {
    alignItems: 'center',
  },
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: colors.neutral100,
    marginBottom: spacing.space1,
  },
  avatarName: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  approvalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginTop: spacing.space4,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space4,
  },
  approvalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  approvalTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.full,
  },
  approvalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  approvalItemIcon: {
    fontSize: ms(16),
    marginRight: spacing.space3,
  },
  approvalItemContent: {
    flex: 1,
  },
  approvalItemName: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  approvalItemType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space0_5,
  },
  approvalItemMeta: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space0_5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space3,
    marginTop: spacing.space2,
  },
  viewAllText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginRight: spacing.space1,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    ...shadows.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  statCardIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  statCardTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  statCardValue: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statCardSubtext: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  warningSubtext: {
    color: colors.warning,
    fontWeight: '600',
  },
  announcementsSection: {
    marginTop: spacing.space6,
    marginHorizontal: layout.screenPadding,
  },
  announcementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space3,
  },
  announcementsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementsIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  announcementsTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.full,
  },
  addAnnouncementText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginLeft: spacing.space1,
  },
  announcementItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space2,
    ...shadows.xs,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  announcementTitleText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  announcementDate: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
});

const requestTypeIcons = {
  manual: '🔵',
  edit: '🟠',
  leave: '🟢',
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 네트워크 오류
  networkError: {
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  // 데이터 로딩 실패
  loadError: {
    message: '데이터를 불러올 수 없습니다',
    action: 'retry',
  },
  
  // 빈 상태
  emptyStates: {
    noWorkplace: {
      icon: '🏢',
      title: '등록된 사업장이 없습니다',
      subtitle: '사업장을 먼저 등록해주세요',
      action: '사업장 등록하기',
    },
    noEmployees: {
      icon: '👥',
      title: '등록된 직원이 없습니다',
      subtitle: '직원을 초대해주세요',
      action: '직원 초대하기',
    },
    noPendingApprovals: {
      hidden: true, // 승인 대기 없으면 카드 자체 숨김
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
    'AttendanceCard',
    'ApprovalItem', 
    'StatCard',
    'AnnouncementItem',
  ],
  
  // 지연 로딩
  lazyLoading: {
    announcements: 'onScroll', // 스크롤 시 추가 로드
    avatarImages: 'lazy',
  },
  
  // 실시간 업데이트 최적화
  realTimeUpdates: {
    attendance: { interval: 30000 }, // 30초마다
    pendingApprovals: { realtime: true }, // 실시간 구독
    checklist: { interval: 60000 }, // 1분마다
  },
  
  // 이미지 최적화
  imageOptimization: {
    avatarSize: { width: 80, height: 80 }, // 2x for retina
    caching: 'disk',
  },
};
```
