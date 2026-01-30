# 공지사항 목록 화면 (AnnouncementListScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

사업장의 모든 공지사항을 목록으로 보여주는 화면입니다. 중요 공지는 상단에 고정되며, 최신순으로 정렬됩니다.

### 🎯 UX 목표
- **명확한 우선순위**: 중요 공지 상단 고정으로 중요 정보 우선 전달
- **빠른 스캔**: 제목, 작성자, 날짜를 한눈에 확인
- **읽음 표시**: 읽지 않은 공지 시각적 구분

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   공지사항                   [+]  │ │
│ │                          관리자 전용 │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Important Section (중요 공지)          │
│ ┌─────────────────────────────────────┐ │
│ │  📌 중요 공지                       │ │
│ │  typography.labelMedium, brand500   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📌 12월 급여 지급 안내   🔴│    │ │
│ │  │                              │    │ │
│ │  │ 12월 급여일이 변경되었...   │    │ │
│ │  │ typography.bodySmall         │    │ │
│ │  │ numberOfLines: 1             │    │ │
│ │  │                              │    │ │
│ │  │ 👤 김사장 • 12/20  12:30     │    │ │
│ │  │ typography.labelSmall        │    │ │
│ │  │ color: textTertiary          │    │ │
│ │  │                          >  │    │ │
│ │  │                              │    │ │
│ │  │ backgroundColor: brand50     │    │ │
│ │  │ borderLeftWidth: 4           │    │ │
│ │  │ borderLeftColor: brand500    │    │ │
│ │  │ borderRadius: borderRadius.xl│    │ │
│ │  │ shadows.sm                   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Divider                                │
│ ┌─────────────────────────────────────┐ │
│ │  ───────────────────────────        │ │
│ │  marginVertical: spacing.space4     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Recent Section (일반 공지)             │
│ ┌─────────────────────────────────────┐ │
│ │  📋 전체 공지                       │ │
│ │  typography.labelMedium             │ │
│ │  color: textSecondary               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Announcement List (FlatList)           │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 휴무일 안내               🔴│    │ │
│ │  │                              │    │ │
│ │  │ 이번 주 토요일은...         │    │ │
│ │  │                              │    │ │
│ │  │ 👤 김사장 • 12/15          >│    │ │
│ │  │                              │    │ │
│ │  │ backgroundColor: white       │    │ │
│ │  │ borderRadius: borderRadius.xl│    │ │
│ │  │ shadows.sm                   │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  gap: spacing.space3                │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 신규 직원 환영합니다        │    │ │
│ │  │                              │    │ │
│ │  │ 12월부터 새로 함께하게...   │    │ │
│ │  │                              │    │ │
│ │  │ 👤 김사장 • 12/01          >│    │ │
│ │  │                              │    │ │
│ │  │ (이미 읽은 공지 - 회색 톤)  │    │ │
│ │  │ opacity: 0.7                 │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ BottomTabBar                            │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const listScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  
  sectionIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  sectionTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  sectionTitleImportant: {
    color: colors.brand500,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.neutral200,
    marginVertical: spacing.space4,
  },
};

// 일반 공지사항 카드
const announcementCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space3,
    ...shadows.sm,
  },
  
  containerUnread: {
    // 읽지 않은 공지
  },
  
  containerRead: {
    opacity: 0.7,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.space2,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.space2,
  },
  
  unreadDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.error,
    marginTop: ms(6),
  },
  
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.space3,
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  metaIcon: {
    fontSize: ms(12),
    marginRight: spacing.space1,
  },
  
  metaText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  chevron: {
    color: colors.neutral300,
  },
};

// 중요 공지사항 카드
const importantCardStyles = {
  container: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand500,
    padding: spacing.space5,
    marginBottom: spacing.space2,
    ...shadows.sm,
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.space2,
  },
  
  badgeIcon: {
    fontSize: ms(14),
    marginRight: spacing.space1,
  },
  
  badgeText: {
    ...typography.labelSmall,
    color: colors.brand600,
    fontWeight: '600',
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.brand700,
    fontWeight: '600',
    marginBottom: spacing.space2,
  },
  
  preview: {
    ...typography.bodySmall,
    color: colors.brand600,
    marginBottom: spacing.space3,
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  metaText: {
    ...typography.labelSmall,
    color: colors.brand500,
  },
};

// 빈 상태
const emptyStateStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.space10,
  },
  
  icon: {
    fontSize: ms(64),
    marginBottom: spacing.space4,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  message: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textAlign: 'center',
  },
};
```

---

## 읽음 표시 로직

```typescript
const readStatusLogic = {
  // 읽지 않은 공지 표시
  unreadIndicator: {
    show: !isRead,
    color: colors.error,
    size: ms(8),
  },
  
  // 읽은 공지 스타일
  readStyle: {
    opacity: 0.7,
    titleColor: colors.textSecondary,
  },
  
  // 읽음 처리 시점
  markAsRead: 'onDetailView', // 상세 화면 진입 시
};
```

---

## 애니메이션

```typescript
const screenAnimations = {
  sectionEntry: (index: number) => ({
    entering: FadeInDown.delay(100 + index * 50).duration(400).springify(),
  }),
  
  cardEntry: (index: number) => ({
    entering: FadeInUp.delay(100 + index * 30).duration(300).springify(),
  }),
  
  cardPress: {
    scale: withSpring(0.98, { damping: 15, stiffness: 200 }),
    backgroundColor: colors.neutral50,
  },
  
  unreadDot: {
    scale: withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      3,
      false
    ),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  announcementCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (title, author, date, isRead, isImportant) =>
      `${isImportant ? '중요 ' : ''}공지사항: ${title}. ${author}. ${date}. ${isRead ? '읽음' : '읽지 않음'}`,
    accessibilityHint: '두 번 탭하여 상세 내용 보기',
  },
  
  unreadDot: {
    accessibilityRole: 'text',
    accessibilityLabel: '읽지 않은 공지사항',
  },
  
  createButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '새 공지사항 작성',
  },
  
  emptyState: {
    accessibilityRole: 'text',
    accessibilityLabel: '등록된 공지사항이 없습니다',
  },
};
```

---

## 상태 관리

```typescript
interface AnnouncementListState {
  // 공지사항 목록
  importantAnnouncements: Announcement[];
  regularAnnouncements: Announcement[];
  
  // 읽음 상태
  readIds: Set<string>;
  unreadCount: number;
  
  // 페이지네이션
  page: number;
  hasMore: boolean;
  
  // UI
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

interface Announcement {
  id: string;
  title: string;
  preview: string;
  authorName: string;
  createdAt: Date;
  isImportant: boolean;
  isRead: boolean;
  hasAttachment: boolean;
  commentCount: number;
}
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    title: '공지사항을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  refreshError: {
    type: 'toast',
    message: '새로고침에 실패했습니다',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  flatListConfig: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 5,
    removeClippedSubviews: true,
    getItemLayout: (data, index) => ({
      length: ms(100),
      offset: ms(100) * index,
      index,
    }),
  },
  
  pagination: {
    pageSize: 20,
    threshold: 0.5,
  },
  
  memoizedComponents: [
    'AnnouncementCard',
    'ImportantCard',
    'SectionHeader',
  ],
};
```
