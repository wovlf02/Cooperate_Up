# 공지사항 상세 화면 (AnnouncementDetailScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

공지사항의 전체 내용을 보여주는 상세 화면입니다. 조회수, 읽은 사람 확인, 댓글/대댓글 기능을 포함합니다.

### 🎯 UX 목표
- **완전한 정보**: 제목, 내용, 첨부파일 등 모든 정보 표시
- **상호작용**: 댓글/대댓글로 양방향 소통 지원
- **관리 기능**: 읽음 확인, 수정, 삭제 (관리자)

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   공지사항                   (⋮) │ │
│ │                          관리자 전용 │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  ScrollView                             │
│  paddingHorizontal: layout.screenPadding│
│                                         │
│  Title Section                          │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌────────────┐                     │ │
│ │  │ 📌 중요    │                     │ │
│ │  │ brand50    │                     │ │
│ │  └────────────┘                     │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  12월 급여일 안내                   │ │
│ │  typography.displaySmall            │ │
│ │  fontWeight: 700                    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  2024.12.20 14:30 • 김사장          │ │
│ │  typography.bodySmall               │ │
│ │  color: textTertiary                │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  👁️ 조회 15 • 읽은 사람 3/5명       │ │
│ │  typography.labelSmall              │ │
│ │  color: textTertiary                │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ │  padding: spacing.space5            │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Content Section                        │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  12월 급여 지급 안내드립니다.       │ │
│ │                                     │ │
│ │  지급일: 2024년 12월 25일 (수)      │ │
│ │  지급방법: 계좌 이체                 │ │
│ │                                     │ │
│ │  문의사항이 있으시면 연락주세요.     │ │
│ │                                     │ │
│ │  typography.bodyMedium              │ │
│ │  lineHeight: ms(26)                 │ │
│ │  color: textPrimary                 │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ │  padding: spacing.space5            │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Attachments Section (첨부파일 있을 때) │
│ ┌─────────────────────────────────────┐ │
│ │  📎 첨부파일 (1)                    │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📄 급여명세서_12월.pdf      │    │ │
│ │  │    2.3MB               ⬇️  │    │ │
│ │  │    backgroundColor: neutral50   │ │
│ │  │    borderRadius: borderRadius.lg │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ │  padding: spacing.space5            │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Comments Section                       │
│ ┌─────────────────────────────────────┐ │
│ │  💬 댓글 (3)                        │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────┐ 김직원   12/20 10:30 │    │ │
│ │  │ │ 👤 │                      │    │ │
│ │  │ └────┘ 확인했습니다!        │    │ │
│ │  │        [답글]               │    │ │
│ │  │        color: brand500      │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────┐ 이직원   12/21 09:15 │    │ │
│ │  │ │ 👤 │                      │    │ │
│ │  │ └────┘ 감사합니다~          │    │ │
│ │  │        [답글]               │    │ │
│ │  │                             │    │ │
│ │  │  ↳ 대댓글                   │    │ │
│ │  │  ┌─────────────────────┐    │    │ │
│ │  │  │ 👤 김사장  12/21 09:30   │   │ │
│ │  │  │ @이직원 네, 확인됐어요!  │   │ │
│ │  │  │ backgroundColor: neutral50   │ │
│ │  │  └─────────────────────┘    │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ │  padding: spacing.space5            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(12) + safeArea       │
│                                         │
├─────────────────────────────────────────┤
│  Comment Input (Fixed Bottom)           │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  (답글 모드일 때)                   │ │
│ │  @이직원에게 답글 작성 중    ✕      │ │
│ │  borderTopColor: neutral100         │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌────────────────────────┐ ┌────┐  │ │
│ │  │ 댓글을 입력하세요...   │ │ ➤  │  │ │
│ │  │                        │ │    │  │ │
│ │  │ borderRadius.full      │ │    │  │ │
│ │  └────────────────────────┘ └────┘  │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  paddingVertical: spacing.space3    │ │
│ │  paddingHorizontal: layout.screenPadding
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const detailScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
  },
  
  // Title Section
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.brand50,
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.full,
    marginBottom: spacing.space2,
  },
  
  importantIcon: {
    fontSize: ms(12),
    marginRight: spacing.space1,
  },
  
  importantText: {
    ...typography.labelSmall,
    color: colors.brand600,
    fontWeight: '600',
  },
  
  title: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space3,
  },
  
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  metaText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statsText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  // Content Section
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  contentText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    lineHeight: ms(26),
  },
  
  // Attachments Section
  attachmentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
  },
  
  attachmentIcon: {
    fontSize: ms(24),
    marginRight: spacing.space3,
  },
  
  attachmentInfo: {
    flex: 1,
  },
  
  attachmentName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.space1,
  },
  
  attachmentSize: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  downloadButton: {
    padding: spacing.space2,
  },
  
  // Comments Section
  commentsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  commentItem: {
    marginBottom: spacing.space4,
  },
  
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  commentAvatar: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
  },
  
  commentName: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  commentDate: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginLeft: spacing.space2,
  },
  
  commentContent: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginLeft: ms(40),
    marginBottom: spacing.space2,
  },
  
  replyButton: {
    marginLeft: ms(40),
  },
  
  replyButtonText: {
    ...typography.labelSmall,
    color: colors.brand500,
    fontWeight: '600',
  },
  
  // Reply (nested comment)
  replyContainer: {
    marginLeft: ms(40),
    marginTop: spacing.space3,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    padding: spacing.space3,
  },
  
  replyArrow: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    marginRight: spacing.space2,
  },
  
  // Comment Input
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.space3,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    ...shadows.md,
  },
  
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.space2,
    marginBottom: spacing.space2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  replyIndicatorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    maxHeight: ms(100),
  },
  
  sendButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendButtonDisabled: {
    backgroundColor: colors.neutral200,
  },
};
```

---

## 관리자 메뉴

```typescript
const adminMenuItems = [
  {
    icon: '👁️',
    label: '읽은 사람 확인',
    action: 'showReadStatus',
  },
  {
    icon: '✏️',
    label: '수정하기',
    action: 'edit',
  },
  {
    icon: '🗑️',
    label: '삭제하기',
    action: 'delete',
    destructive: true,
  },
];
```

---

## 애니메이션

```typescript
const screenAnimations = {
  cardEntry: (index: number) => ({
    entering: FadeInDown.delay(100 + index * 100).duration(400).springify(),
  }),
  
  commentEntry: (index: number) => ({
    entering: FadeInUp.delay(100 + index * 50).duration(300).springify(),
  }),
  
  replyIndicator: {
    entering: SlideInUp.duration(200),
    exiting: SlideOutDown.duration(200),
  },
  
  sendButton: {
    press: {
      scale: withSpring(0.9, { damping: 15, stiffness: 200 }),
    },
    success: {
      scale: withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 150 })
      ),
    },
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  importantBadge: {
    accessibilityRole: 'text',
    accessibilityLabel: '중요 공지사항',
  },
  
  attachment: {
    accessibilityRole: 'button',
    accessibilityLabel: (name, size) => `첨부파일 ${name}, ${size}`,
    accessibilityHint: '두 번 탭하여 다운로드',
  },
  
  comment: {
    accessibilityRole: 'article',
    accessibilityLabel: (author, content, date) =>
      `${author}님의 댓글: ${content}. ${date}`,
  },
  
  replyButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '답글 달기',
  },
  
  commentInput: {
    accessibilityLabel: '댓글 입력',
    accessibilityHint: '댓글을 입력하세요',
  },
  
  sendButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '댓글 전송',
    accessibilityState: { disabled: !hasContent },
  },
};
```

---

## 상태 관리

```typescript
interface AnnouncementDetailState {
  // 공지사항
  announcement: {
    id: string;
    title: string;
    content: string;
    isImportant: boolean;
    authorName: string;
    createdAt: Date;
    viewCount: number;
    readCount: number;
    totalMembers: number;
    attachments: Attachment[];
  };
  
  // 댓글
  comments: Comment[];
  
  // 입력
  commentInput: string;
  replyTo: Comment | null;
  
  // UI
  isLoading: boolean;
  isSubmitting: boolean;
  showAdminMenu: boolean;
  showReadStatusModal: boolean;
  showDeleteConfirm: boolean;
  
  // 에러
  error: string | null;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: Date;
  parentId: string | null;
  replies?: Comment[];
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
  
  commentError: {
    type: 'toast',
    message: '댓글 등록에 실패했습니다',
  },
  
  downloadError: {
    type: 'toast',
    message: '파일 다운로드에 실패했습니다',
  },
  
  deleteError: {
    type: 'toast',
    message: '삭제에 실패했습니다',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  commentList: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 5,
  },
  
  attachmentPreview: {
    thumbnailSize: { width: 100, height: 100 },
    caching: 'disk',
  },
  
  memoizedComponents: [
    'CommentItem',
    'AttachmentItem',
    'HeaderCard',
  ],
  
  inputDebounce: {
    comment: 100,
  },
};
```
