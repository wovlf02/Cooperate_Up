# 직원 초대 화면 (EmployeeInviteScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

사업주가 새 직원을 사업장에 초대하기 위한 코드를 공유하는 화면입니다.

### 🎯 UX 목표
- **간편한 공유**: 코드 복사, 공유하기 원터치 지원
- **명확한 안내**: 직원 가입 절차 안내 포함
- **코드 관리**: 코드 재발급, 활성화/비활성화 옵션

---

## 레이아웃 - 중앙 정렬

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   직원 초대                       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  중앙 정렬 레이아웃                     │
│  flex: 1                                │
│  justifyContent: center                 │
│  alignItems: center                     │
│  paddingHorizontal: layout.screenPadding│
│                                         │
│  Icon & Title                           │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │            🔗                       │ │
│ │        fontSize: ms(64)             │ │
│ │                                     │ │
│ │    아래 코드를 직원에게 공유하세요  │ │
│ │    typography.titleMedium           │ │
│ │    textAlign: center                │ │
│ │    marginTop: spacing.space4        │ │
│ │    marginBottom: spacing.space6     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Invite Code Card                       │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         A1B2C3                      │ │
│ │    displayLarge, brand500           │ │
│ │    letterSpacing: ms(8)             │ │
│ │    fontWeight: 700                  │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │    사업장: 00카페 강남점            │ │
│ │    typography.bodyMedium            │ │
│ │    color: textSecondary             │ │
│ │                                     │ │
│ │    만료일: 2024.12.31               │ │
│ │    typography.labelSmall            │ │
│ │    color: textTertiary              │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ │  padding: spacing.space6            │ │
│ │  width: wp(85)                      │ │
│ │  alignItems: center                 │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space6          │
│                                         │
│  Action Buttons                         │
│ ┌─────────────────────────────────────┐ │
│ │  ┌──────────────┐ ┌──────────────┐  │ │
│ │  │   📋 복사    │ │   📤 공유    │  │ │
│ │  │   outline    │ │   primary    │  │ │
│ │  └──────────────┘ └──────────────┘  │ │
│ │  gap: spacing.space3                │ │
│ │  width: wp(85)                      │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space6          │
│                                         │
│  Guide Section                          │
│ ┌─────────────────────────────────────┐ │
│ │  📝 직원 가입 방법                  │ │
│ │                                     │ │
│ │  1. 앱 다운로드 후 회원가입         │ │
│ │  2. "사업장 참여" 선택              │ │
│ │  3. 초대 코드 입력                  │ │
│ │                                     │ │
│ │  backgroundColor: neutral50         │ │
│ │  borderRadius: borderRadius.lg      │ │
│ │  padding: spacing.space4            │ │
│ │  width: wp(85)                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  (하단)                                 │
│  ┌─────────────────────────────────────┐
│ │  🔄 코드 재발급                     │ │
│ │  color: textTertiary                │ │
│ │  typography.labelMedium             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(4) + safeArea        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

```typescript
const inviteScreenStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    paddingHorizontal: layout.screenPadding,
  },
  
  icon: {
    fontSize: ms(64),
    marginBottom: spacing.space4,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.space6,
  },
  
  codeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    width: wp(85),
    alignItems: 'center',
    marginBottom: spacing.space6,
    ...shadows.md,
  },
  
  codeText: {
    ...typography.displayLarge,
    color: colors.brand500,
    fontWeight: '700',
    letterSpacing: ms(8),
    marginBottom: spacing.space4,
  },
  
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.neutral200,
    marginBottom: spacing.space4,
  },
  
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  expiryLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.space3,
    width: wp(85),
    marginBottom: spacing.space6,
  },
  
  copyButton: {
    flex: 1,
    paddingVertical: spacing.space4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.space2,
  },
  
  copyButtonText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  shareButton: {
    flex: 1,
    paddingVertical: spacing.space4,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.brand500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.space2,
  },
  
  shareButtonText: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: '600',
  },
  
  guideCard: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    width: wp(85),
    marginBottom: spacing.space6,
  },
  
  guideTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.space3,
  },
  
  guideStep: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
    lineHeight: ms(20),
  },
  
  regenerateButton: {
    paddingVertical: spacing.space3,
  },
  
  regenerateText: {
    ...typography.labelMedium,
    color: colors.textTertiary,
  },
};
```

---

## 공유 메시지 템플릿

```typescript
const shareTemplate = {
  title: '사업장 초대',
  message: (workplaceName: string, inviteCode: string) => 
`[Biz One] 사업장 초대

${workplaceName}에서 함께 일하실 분을 찾습니다!

📱 앱 다운로드 후 초대 코드를 입력하세요.

초대 코드: ${inviteCode}

App Store: [링크]
Play Store: [링크]`,
};
```

---

## 애니메이션

```typescript
const screenAnimations = {
  codeCard: {
    entering: FadeInDown.delay(100).duration(400).springify(),
  },
  
  buttons: {
    entering: FadeInUp.delay(200).duration(400).springify(),
  },
  
  guide: {
    entering: FadeIn.delay(400).duration(300),
  },
  
  copySuccess: {
    scale: withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    ),
    haptic: 'success',
  },
  
  codeRefresh: {
    rotate: withTiming('360deg', { duration: 500 }),
    opacity: withSequence(
      withTiming(0.5, { duration: 250 }),
      withTiming(1, { duration: 250 })
    ),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  inviteCode: {
    accessibilityRole: 'text',
    accessibilityLabel: (code) => `초대 코드: ${code.split('').join(' ')}`,
  },
  
  copyButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '초대 코드 복사',
    accessibilityHint: '두 번 탭하여 클립보드에 복사',
  },
  
  shareButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '초대 코드 공유',
    accessibilityHint: '두 번 탭하여 공유 옵션 열기',
  },
  
  regenerateButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '코드 재발급',
    accessibilityHint: '두 번 탭하여 새로운 초대 코드 생성',
  },
};
```

---

## 상태 관리

```typescript
interface EmployeeInviteState {
  // 초대 코드
  inviteCode: string;
  workplaceName: string;
  expiresAt: Date;
  
  // UI
  isLoading: boolean;
  isRegenerating: boolean;
  isCopied: boolean;
  
  // 에러
  error: string | null;
}
```

---

## 에러 처리

```typescript
const errorHandling = {
  loadError: {
    title: '초대 코드를 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  regenerateError: {
    type: 'toast',
    message: '코드 재발급에 실패했습니다',
  },
  
  shareError: {
    type: 'toast',
    message: '공유하기에 실패했습니다',
  },
  
  copySuccess: {
    type: 'toast',
    message: '초대 코드가 복사되었습니다',
  },
};
```

---

## 재발급 확인 모달

```
┌─────────────────────────────────────┐
│                                     │
│           🔄                        │
│                                     │
│     코드를 재발급할까요?            │
│     typography.titleLarge           │
│                                     │
│   기존 코드는 더 이상               │
│   사용할 수 없게 됩니다.            │
│   typography.bodyMedium             │
│   color: textSecondary              │
│   textAlign: center                 │
│                                     │
│  ┌───────────┐  ┌───────────┐       │
│  │   취소    │  │  재발급   │       │
│  │  neutral  │  │  primary  │       │
│  └───────────┘  └───────────┘       │
│                                     │
│  borderRadius: borderRadius.xl      │
│  padding: spacing.space6            │
│                                     │
└─────────────────────────────────────┘
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  memoizedComponents: [
    'CodeCard',
    'GuideSection',
  ],
  
  hapticFeedback: {
    copy: 'selection',
    share: 'impactLight',
    regenerate: 'impactMedium',
  },
};
```
