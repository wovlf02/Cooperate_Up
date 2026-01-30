# 근무자 홈 화면 (WorkerHomeScreen) - Production Ready v2.0

## 개요

근무자가 앱에 로그인 후 처음 보는 홈 화면입니다.
토스, 카카오뱅크 등의 대시보드 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

- **사업장 선택**: 여러 사업장에서 근무 시 상단에서 사업장 전환
- **대시보드**: 선택된 사업장의 오늘 근무 현황을 한눈에 파악
- **자동 로그인**: 앱 재실행 시 마지막 선택한 사업장이 자동 선택됨

---

## 🎨 디자인 원칙

### UX 목표

- **한눈에 파악**: 오늘 근무 상태를 3초 이내 인지
- **원탭 액션**: 출퇴근을 한 번의 터치로 완료
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
│  ║      사업장 선택 (드롭다운)        (알림)             ║
│  ║                                                       ║
│  ║  ─────────────────────────────────────────────────── ║
│  ║                                                       ║
│  ║  👋 안녕하세요, 김근무님                              ║
│  ║      displaySmall, white                              ║
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
│  │  🕐 오늘의 근무                         Hero Card   │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │     ┌─────────────────┬─────────────────┐          │  │
│  │     │                 │                 │          │  │
│  │     │    출근         │    퇴근         │          │  │
│  │     │    20:00       │    --:--        │          │  │
│  │     │    ● 정상      │    대기중       │          │  │
│  │     │                 │                 │          │  │
│  │     └─────────────────┴─────────────────┘          │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  🟢 근무중 • 4시간 32분                       │  │  │
│  │  │      실시간 카운터, 1초마다 업데이트          │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ⚠️ 급여는 예정 시간(20:00)부터 계산됩니다        │  │
│  │     (조기 출근 시 안내)                            │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │           🚪 퇴근하기                         │  │  │
│  │  │                                               │  │  │
│  │  │   Primary Button (error color)                │  │  │
│  │  │   체크리스트 미완료 시 비활성화               │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  borderRadius: xl (20px)                            │  │
│  │  padding: 24px                                      │  │
│  │  ⚡ Large shadow                                    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Quick Stats Grid (2열)                                   │
│  ┌───────────────────┐  ┌───────────────────┐            │
│  │                   │  │                   │            │
│  │  💰 12월 급여     │  │  📋 체크리스트    │            │
│  │  ₩1,234,560      │  │     15/22        │            │
│  │  +₩85,000 오늘   │  │     68% 완료     │            │
│  │                   │  │                   │            │
│  └───────────────────┘  └───────────────────┘            │
│                                                           │
│  gap: 12px                                                │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  📢 공지사항                                   더보기 > │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  🔴 12월 급여일 안내                       12/20   │  │
│  │      중요 공지 (빨간 점)                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📌 연말 근무 일정 변경                     12/18   │  │
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
    paddingHorizontal: space3,
    paddingVertical: space2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  workplaceIcon: {
    size: ms(18),
    color: colors.white,
    marginRight: space2,
  },
  
  workplaceName: {
    ...typography.titleSmall,
    color: colors.white,
    marginRight: space1,
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
  
  // 인사말
  greeting: {
    marginTop: space5,
  },
  
  greetingText: {
    ...typography.displaySmall,
    color: colors.white,
  },
  
  dateText: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: space1,
  },
};
```

### 2. Today Work Card (Hero Card)

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  🕐 오늘의 근무                                     │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │     ⏰                      ⏰              │    │  │
│  │  │   출근                    퇴근              │    │  │
│  │  │                                             │    │  │
│  │  │   20:00                  --:--             │    │  │
│  │  │   displayMedium          displayMedium     │    │  │
│  │  │   brand500               neutral400        │    │  │
│  │  │                                             │    │  │
│  │  │   🟢 정상 출근            대기중            │    │  │
│  │  │   captionLarge           captionLarge      │    │  │
│  │  │   success                neutral400        │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🟢  근무중 • 4시간 32분 15초               │    │  │
│  │  │                                             │    │  │
│  │  │  Pulsing dot + Counting timer               │    │  │
│  │  │  headlineSmall, brand500                    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ⚠️ 급여는 예정 시간(20:00)부터 계산됩니다        │  │
│  │  bodySmall, warning                                │  │
│  │  backgroundColor: warningLight                     │  │
│  │  borderRadius: sm                                  │  │
│  │  padding: 12px                                     │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │         🚪 퇴근하기                         │    │  │
│  │  │                                             │    │  │
│  │  │  PrimaryButton                              │    │  │
│  │  │  backgroundColor: gradient(sunset)          │    │  │
│  │  │  colors: [#F97316, #EF4444]                 │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 스타일 스펙

```typescript
const todayWorkCardStyles = {
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: space6,
    marginHorizontal: layout.screenPadding,
    marginTop: hp(-8), // 헤더 오버랩
    ...shadows.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space4,
  },
  
  headerIcon: {
    size: ms(24),
    color: colors.brand500,
    marginRight: space2,
  },
  
  headerTitle: {
    ...typography.headlineSmall,
    color: colors.textPrimary,
  },
  
  // 출퇴근 시간 그리드
  timeGrid: {
    flexDirection: 'row',
    gap: space4,
    marginBottom: space4,
  },
  
  timeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  
  timeLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: space1,
  },
  
  timeValue: {
    ...typography.displayMedium,
    fontVariant: ['tabular-nums'],
  },
  
  timeValueActive: {
    color: colors.brand500,
  },
  
  timeValuePending: {
    color: colors.neutral400,
  },
  
  timeStatus: {
    ...typography.captionLarge,
    marginTop: space1,
  },
  
  timeStatusSuccess: {
    color: colors.success,
  },
  
  timeStatusPending: {
    color: colors.neutral400,
  },
  
  // 실시간 카운터
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space3,
    marginBottom: space3,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  statusDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: colors.success,
    marginRight: space2,
    // Pulsing animation
  },
  
  statusText: {
    ...typography.headlineSmall,
    color: colors.brand500,
  },
  
  // 조기출근 안내
  earlyCheckInNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: space3,
    borderRadius: borderRadius.sm,
    marginBottom: space4,
  },
  
  noticeIcon: {
    size: ms(18),
    color: colors.warning,
    marginRight: space2,
  },
  
  noticeText: {
    ...typography.bodySmall,
    color: colors.warningDark,
    flex: 1,
  },
  
  // 퇴근 버튼
  checkOutButton: {
    marginTop: space2,
  },
};
```

#### 상태별 표시

```typescript
const workStatusStates = {
  // 미출근
  notCheckedIn: {
    statusDot: colors.neutral400,
    statusText: '미출근',
    button: {
      title: '출근하기',
      gradient: gradients.brand,
      icon: 'clock-in',
    },
  },
  
  // 근무중
  working: {
    statusDot: colors.success,
    statusText: `근무중 • ${formatDuration(elapsedTime)}`,
    button: {
      title: '퇴근하기',
      gradient: gradients.sunset,
      icon: 'clock-out',
      disabled: !checklistCompleted,
    },
  },
  
  // 퇴근완료
  checkedOut: {
    statusDot: colors.neutral500,
    statusText: `퇴근완료 • 총 ${formatDuration(totalTime)} 근무`,
    button: null, // 버튼 없음
  },
};
```

#### 애니메이션

```typescript
// 상태 점 펄싱 (근무중)
const pulsingDotAnimation = {
  scale: {
    from: 1,
    to: 1.3,
    duration: 1000,
    repeat: -1,
    repeatReverse: true,
  },
  opacity: {
    from: 1,
    to: 0.5,
    duration: 1000,
    repeat: -1,
    repeatReverse: true,
  },
};

// 시간 카운터 틱
const timerTick = {
  interval: 1000, // 1초
  format: 'HH:mm:ss' // or 'H시간 mm분'
};

// 출퇴근 버튼 프레스
const buttonPressAnimation = {
  scale: { to: 0.96 },
  duration: 100,
  haptic: 'medium',
};

// 출퇴근 성공 피드백
const successFeedback = {
  scale: {
    to: 1.05,
    return: 1,
    duration: 200,
  },
  haptic: 'success',
  confetti: true, // 선택적
};
```

### 3. Quick Stats Grid

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌───────────────────┐  ┌───────────────────┐            │
│  │                   │  │                   │            │
│  │  💰               │  │  📋               │            │
│  │                   │  │                   │            │
│  │  12월 급여        │  │  오늘 체크리스트  │            │
│  │  labelMedium      │  │  labelMedium      │            │
│  │                   │  │                   │            │
│  │  ₩1,234,560      │  │     15/22        │            │
│  │  headlineLarge    │  │  headlineLarge    │            │
│  │  brand500         │  │  brand500         │            │
│  │                   │  │                   │            │
│  │  +₩85,000 오늘   │  │  ████████░░ 68%  │            │
│  │  captionLarge     │  │  Progress bar     │            │
│  │  success          │  │                   │            │
│  │                   │  │                   │            │
│  │           >       │  │           >       │            │
│  │                   │  │                   │            │
│  └───────────────────┘  └───────────────────┘            │
│                                                           │
│  flex: 1 each                                             │
│  gap: 12px                                                │
│  Touchable → Navigate                                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 스타일 스펙

```typescript
const quickStatsStyles = {
  container: {
    flexDirection: 'row',
    gap: space3,
    marginTop: space4,
    paddingHorizontal: layout.screenPadding,
  },
  
  card: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: space4,
    ...shadows.sm,
  },
  
  cardPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.xs,
  },
  
  icon: {
    size: ms(28),
    marginBottom: space2,
  },
  
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: space1,
  },
  
  value: {
    ...typography.headlineLarge,
    color: colors.brand500,
    fontVariant: ['tabular-nums'],
  },
  
  subtext: {
    ...typography.captionLarge,
    marginTop: space2,
  },
  
  subtextPositive: {
    color: colors.success,
  },
  
  // 진행률 바 (체크리스트)
  progressBar: {
    height: ms(6),
    backgroundColor: colors.neutral200,
    borderRadius: ms(3),
    marginTop: space2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand500,
    borderRadius: ms(3),
  },
  
  chevron: {
    position: 'absolute',
    right: space3,
    bottom: space3,
    size: ms(16),
    color: colors.neutral400,
  },
};
```

### 4. Announcement Section

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  📢 공지사항                                   더보기 > │
│  headlineSmall                                 labelLarge │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  🔴 12월 급여일 안내                       12/20   │  │
│  │     중요 공지 (빨간 점)                             │  │
│  │                                                     │  │
│  │  borderBottomWidth: 1                               │  │
│  │  borderBottomColor: borderLight                     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  📌 연말 근무 일정 변경                     12/18   │  │
│  │     일반 공지 (핀 아이콘)                           │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 스타일 스펙

```typescript
const announcementStyles = {
  container: {
    marginTop: space5,
    paddingHorizontal: layout.screenPadding,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space3,
  },
  
  headerTitle: {
    ...typography.headlineSmall,
    color: colors.textPrimary,
  },
  
  moreButton: {
    ...typography.labelLarge,
    color: colors.brand500,
  },
  
  list: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space4,
    paddingHorizontal: space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  itemLast: {
    borderBottomWidth: 0,
  },
  
  importantDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.error,
    marginRight: space2,
  },
  
  itemTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
  },
  
  itemDate: {
    ...typography.captionLarge,
    color: colors.textTertiary,
    marginLeft: space2,
  },
  
  chevron: {
    size: ms(16),
    color: colors.neutral400,
    marginLeft: space1,
  },
};
```

---

## 상태 관리

```typescript
interface WorkerHomeState {
  // 사용자 정보
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  
  // 사업장
  workplaces: Workplace[];
  selectedWorkplace: Workplace | null;
  
  // 오늘 근무
  todayAttendance: {
    checkInTime: Date | null;
    checkOutTime: Date | null;
    scheduledStart: Date;
    scheduledEnd: Date;
    status: 'not_checked_in' | 'working' | 'checked_out';
    elapsedSeconds: number; // 실시간 업데이트
  };
  
  // 이번 달 급여
  monthlySalary: {
    amount: number;
    todayEarning: number;
    workDays: number;
    workHours: number;
  };
  
  // 체크리스트
  checklist: {
    completed: number;
    total: number;
    isAllCompleted: boolean;
  };
  
  // 공지사항
  announcements: Array<{
    id: string;
    title: string;
    date: Date;
    isImportant: boolean;
    isRead: boolean;
  }>;
  
  // UI 상태
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}
```

---

## 실시간 업데이트

```typescript
const realtimeUpdates = {
  // 근무 시간 카운터
  workTimer: {
    interval: 1000, // 1초
    update: (state) => {
      if (state.status === 'working') {
        return state.elapsedSeconds + 1;
      }
    },
  },
  
  // 체크리스트 (Firebase)
  checklist: {
    type: 'realtime',
    listener: 'onSnapshot',
  },
  
  // 공지사항 (Firebase)
  announcements: {
    type: 'realtime',
    listener: 'onSnapshot',
    limit: 3, // 최근 3개만
  },
  
  // 급여 (화면 진입 시)
  salary: {
    type: 'fetch',
    trigger: 'onFocus',
  },
};
```

---

## 인터랙션

### Pull to Refresh

```typescript
const pullToRefresh = {
  enabled: true,
  colors: [colors.brand500],
  
  onRefresh: async () => {
    await Promise.all([
      fetchTodayAttendance(),
      fetchMonthlySalary(),
      fetchAnnouncements(),
    ]);
  },
  
  animation: {
    spinner: 'default', // or 'custom'
    duration: 1000,
  },
};
```

### 사업장 선택

```typescript
const workplaceSelector = {
  trigger: 'press',
  
  // 바텀 시트로 열기
  openBottomSheet: true,
  
  // 선택 시
  onSelect: async (workplace) => {
    await AsyncStorage.setItem('lastWorkplace', workplace.id);
    // 데이터 다시 로드
    await loadHomeData(workplace.id);
  },
  
  // 애니메이션
  animation: {
    rotate: {
      from: '0deg',
      to: '180deg',
      duration: 200,
    },
  },
};
```

### 출퇴근 버튼

```typescript
const attendanceButton = {
  // 출근
  checkIn: {
    onPress: async () => {
      // 1. 위치 확인 (선택적)
      const location = await getCurrentLocation();
      
      // 2. API 호출
      await checkIn({ location });
      
      // 3. 성공 피드백
      Haptics.notificationAsync(NotificationFeedbackType.Success);
      
      // 4. 상태 업데이트
      setStatus('working');
    },
    
    loading: {
      showSpinner: true,
      text: '출근 처리중...',
    },
  },
  
  // 퇴근
  checkOut: {
    // 체크리스트 미완료 시
    disabled: !checklist.isAllCompleted,
    
    onPress: async () => {
      // 체크리스트 확인
      if (!checklist.isAllCompleted) {
        showAlert({
          title: '체크리스트 미완료',
          message: '모든 체크리스트를 완료해야 퇴근할 수 있습니다.',
          actions: [
            { text: '체크리스트 보기', onPress: navigateToChecklist },
            { text: '확인' },
          ],
        });
        return;
      }
      
      // API 호출
      await checkOut();
      
      // 성공 피드백
      Haptics.notificationAsync(NotificationFeedbackType.Success);
    },
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  // 헤더
  header: {
    workplaceSelector: {
      accessibilityRole: 'button',
      accessibilityLabel: `현재 사업장: ${workplaceName}. 다른 사업장 선택하려면 두 번 탭하세요.`,
    },
    notification: {
      accessibilityLabel: `알림 ${notificationCount}개. 두 번 탭하여 확인`,
    },
  },
  
  // 근무 카드
  workCard: {
    accessibilityLabel: `오늘 근무 현황. 출근 ${checkInTime || '미출근'}, 퇴근 ${checkOutTime || '미퇴근'}. ${statusText}`,
    button: {
      accessibilityRole: 'button',
      accessibilityLabel: isWorking ? '퇴근하기' : '출근하기',
      accessibilityHint: isWorking && !checklistCompleted 
        ? '체크리스트를 먼저 완료해야 합니다' 
        : undefined,
    },
  },
  
  // 통계 카드
  statsCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (card) => 
      `${card.label}: ${card.value}. 두 번 탭하여 상세 보기`,
  },
};
```

---

## 전체 코드 예시

```typescript
// screens/Home/WorkerHomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { TodayWorkCard } from './components/TodayWorkCard';
import { QuickStatsGrid } from './components/QuickStatsGrid';
import { AnnouncementSection } from './components/AnnouncementSection';
import { WorkplaceSelector } from './components/WorkplaceSelector';

import { useHomeData } from './hooks/useHomeData';
import { useWorkTimer } from './hooks/useWorkTimer';

import { colors, gradients, layout, spacing } from '@/styles/theme';
import { hp, wp, ms } from '@/utils/responsive';

export const WorkerHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refresh } = useHomeData();
  const { elapsedTime, isRunning } = useWorkTimer(data?.todayAttendance);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWorkplaceSheet, setShowWorkplaceSheet] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };
  
  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={gradients.brand.colors}
        start={gradients.brand.start}
        end={gradients.brand.end}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <Header
          variant="transparent"
          leftElement={
            <WorkplaceSelector
              workplace={data?.selectedWorkplace}
              onPress={() => setShowWorkplaceSheet(true)}
            />
          }
          rightElement={
            <NotificationButton count={data?.unreadNotifications || 0} />
          }
        />
        
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            👋 안녕하세요, {data?.user.name}님
          </Text>
          <Text style={styles.dateText}>
            {formatDate(new Date(), 'M월 d일 EEEE')}
          </Text>
        </View>
      </LinearGradient>
      
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand500}
          />
        }
      >
        {/* Today Work Card (Hero) */}
        <TodayWorkCard
          attendance={data?.todayAttendance}
          elapsedTime={elapsedTime}
          checklist={data?.checklist}
        />
        
        {/* Quick Stats */}
        <QuickStatsGrid
          salary={data?.monthlySalary}
          checklist={data?.checklist}
        />
        
        {/* Announcements */}
        <AnnouncementSection
          announcements={data?.announcements}
          onViewAll={() => navigate('Announcements')}
        />
        
        {/* Bottom Padding */}
        <View style={{ height: layout.tabBarHeight + insets.bottom + space8 }} />
      </ScrollView>
      
      {/* Workplace Selector Bottom Sheet */}
      <WorkplaceSelectorSheet
        visible={showWorkplaceSheet}
        workplaces={data?.workplaces}
        selected={data?.selectedWorkplace}
        onSelect={handleWorkplaceSelect}
        onClose={() => setShowWorkplaceSheet(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerGradient: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: hp(12),
  },
  greeting: {
    marginTop: spacing.space5,
  },
  greetingText: {
    ...typography.displaySmall,
    color: colors.white,
  },
  dateText: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.space1,
  },
  scrollView: {
    flex: 1,
    marginTop: hp(-8),
  },
  scrollContent: {
    paddingTop: 0,
  },
});
```
