# 공지사항 작성 화면 (AnnouncementCreateScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

관리자가 새 공지사항을 작성하는 화면입니다.

### 🎯 UX 목표
- **간편한 작성**: 제목과 내용만으로 빠른 공지 등록
- **유연한 옵션**: 중요 표시, 푸시 알림 옵션 제공
- **파일 첨부**: 최대 3개 파일 첨부 지원

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ✕   공지사항 작성              게시 │ │
│ │                          (primary)  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  ScrollView                             │
│  paddingHorizontal: layout.screenPadding│
│  paddingTop: spacing.space4             │
│                                         │
│  Title Input                            │
│ ┌─────────────────────────────────────┐ │
│ │  제목 *                             │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 공지사항 제목을 입력하세요  │    │ │
│ │  │                             │    │ │
│ │  │ height: ms(56)              │    │ │
│ │  │ maxLength: 100              │    │ │
│ │  │ borderRadius: borderRadius.lg    │ │
│ │  └─────────────────────────────┘    │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Content Input                          │
│ ┌─────────────────────────────────────┐ │
│ │  내용 *                             │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │  공지사항 내용을 입력하세요 │    │ │
│ │  │                             │    │ │
│ │  │                             │    │ │
│ │  │  minHeight: hp(25)          │    │ │
│ │  │  textAlignVertical: top     │    │ │
│ │  │  borderRadius: borderRadius.lg   │ │
│ │  │                             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                          0/2000     │ │
│ │  typography.labelSmall              │ │
│ │  color: textTertiary                │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Options Section                        │
│ ┌─────────────────────────────────────┐ │
│ │  ⚙️ 옵션                            │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📌 중요 공지로 설정    [OFF]│    │ │
│ │  │    상단에 고정됩니다        │    │ │
│ │  │    typography.bodySmall     │    │ │
│ │  │    color: textTertiary      │    │ │
│ │  ├─────────────────────────────┤    │ │
│ │  │ 🔔 푸시 알림 전송      [ON] │    │ │
│ │  │    모든 근무자에게 알림     │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space4          │
│                                         │
│  Attachments Section                    │
│ ┌─────────────────────────────────────┐ │
│ │  📎 첨부파일 (1/3)                  │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📄 급여명세서.pdf        ✕ │    │ │
│ │  │    2.3MB                    │    │ │
│ │  │    backgroundColor: neutral50   │ │
│ │  │    borderRadius: borderRadius.lg │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginBottom: spacing.space2       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │                             │    │ │
│ │  │     + 파일 추가             │    │ │
│ │  │     (최대 3개, 10MB)        │    │ │
│ │  │                             │    │ │
│ │  │     height: ms(80)          │    │ │
│ │  │     borderStyle: dashed     │    │ │
│ │  │     borderColor: neutral300 │    │ │
│ │  │     borderRadius: borderRadius.lg│ │
│ │  │                             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(4) + safeArea        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const createScreenStyles = {
  inputContainer: {
    marginBottom: spacing.space4,
  },
  
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  titleInput: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: spacing.space4,
    height: ms(56),
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  
  contentInput: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    padding: spacing.space4,
    minHeight: hp(25),
    ...typography.bodyMedium,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  
  charCount: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.space1,
  },
  
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space4,
    ...shadows.sm,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
    paddingBottom: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral50,
  },
  
  optionRowLast: {
    borderBottomWidth: 0,
  },
  
  optionLeft: {
    flex: 1,
  },
  
  optionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space1,
  },
  
  optionIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  optionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  
  optionHint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginLeft: ms(24),
  },
  
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginBottom: spacing.space2,
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
  },
  
  attachmentSize: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  attachmentRemove: {
    padding: spacing.space2,
  },
  
  addButton: {
    height: ms(80),
    borderWidth: 2,
    borderColor: colors.neutral300,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  addButtonText: {
    ...typography.bodyMedium,
    color: colors.brand500,
    marginBottom: spacing.space1,
  },
  
  addButtonHint: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
};
```

---

## 애니메이션

```typescript
const screenAnimations = {
  sectionEntry: (index: number) => ({
    entering: FadeInDown.delay(100 + index * 100).duration(400).springify(),
  }),
  
  attachmentAdd: {
    entering: FadeIn.duration(200),
    exiting: FadeOut.duration(200),
  },
  
  publishButton: {
    press: {
      scale: withSpring(0.95, { damping: 15, stiffness: 200 }),
    },
    
    success: {
      scale: withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 200 })
      ),
    },
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  titleInput: {
    accessibilityLabel: '공지사항 제목 입력',
    accessibilityHint: '공지사항의 제목을 입력하세요',
  },
  
  contentInput: {
    accessibilityLabel: '공지사항 내용 입력',
    accessibilityHint: '공지사항의 내용을 입력하세요',
  },
  
  importantToggle: {
    accessibilityRole: 'switch',
    accessibilityLabel: '중요 공지 설정',
    accessibilityHint: '중요 공지로 설정하면 목록 상단에 고정됩니다',
  },
  
  pushToggle: {
    accessibilityRole: 'switch',
    accessibilityLabel: '푸시 알림 전송',
    accessibilityHint: '활성화하면 모든 근무자에게 푸시 알림이 발송됩니다',
  },
  
  addAttachment: {
    accessibilityRole: 'button',
    accessibilityLabel: '파일 첨부',
    accessibilityHint: '두 번 탭하여 파일 선택',
  },
  
  publishButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '공지사항 게시',
  },
};
```

---

## 상태 관리

```typescript
interface AnnouncementCreateState {
  // 폼 데이터
  title: string;
  content: string;
  isImportant: boolean;
  sendPushNotification: boolean;
  
  // 첨부파일
  attachments: {
    uri: string;
    name: string;
    size: number;
    type: string;
  }[];
  
  // 업로드
  isUploading: boolean;
  uploadProgress: number;
  
  // 유효성 검사
  errors: {
    title?: string;
    content?: string;
  };
  
  // UI
  isSubmitting: boolean;
  showConfirmModal: boolean;
}
```

---

## 유효성 검사

```typescript
const validation = {
  title: {
    required: '제목을 입력해주세요',
    minLength: { value: 2, message: '제목은 2자 이상 입력해주세요' },
    maxLength: 100,
  },
  
  content: {
    required: '내용을 입력해주세요',
    minLength: { value: 10, message: '내용은 10자 이상 입력해주세요' },
    maxLength: 2000,
  },
  
  attachments: {
    maxCount: { value: 3, message: '첨부파일은 최대 3개까지 가능합니다' },
    maxSize: { value: 10 * 1024 * 1024, message: '파일 크기는 10MB를 초과할 수 없습니다' },
  },
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  submitError: {
    title: '게시에 실패했습니다',
    message: '잠시 후 다시 시도해주세요',
    action: 'retry',
  },
  
  uploadError: {
    type: 'toast',
    message: '파일 업로드에 실패했습니다',
  },
  
  fileSizeError: {
    type: 'toast',
    message: '파일 크기가 10MB를 초과합니다',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  inputDebounce: {
    content: 300,
  },
  
  imageCompression: {
    maxWidth: 1200,
    quality: 0.8,
  },
  
  memoizedComponents: [
    'OptionRow',
    'AttachmentItem',
  ],
};
```
