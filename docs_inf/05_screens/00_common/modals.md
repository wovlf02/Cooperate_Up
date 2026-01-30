# 모달/바텀시트 컴포넌트 (Modal Components)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

오버레이 형태로 표시되는 모달 및 바텀시트 컴포넌트들입니다.

### 🎯 UX 목표
- **집중**: 핵심 작업에 사용자 집중 유도
- **자연스러운 동작**: 제스처 기반 인터랙션
- **명확한 계층**: 배경과의 시각적 분리

---

## 1. Bottom Sheet

하단에서 올라오는 시트 컴포넌트입니다.

### 1.1 레이아웃

```
┌─────────────────────────────────────────┐
│                                         │
│         Backdrop (tap to close)         │
│         backgroundColor: black          │
│         opacity: 0.5                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ═════════════════                  │ │
│ │  Handle Bar:                        │ │
│ │  - width: ms(40)                    │ │
│ │  - height: ms(4)                    │ │
│ │  - borderRadius: borderRadius.full  │ │
│ │  - backgroundColor: neutral300      │ │
│ │  - marginTop: spacing.space3        │ │
│ │  - marginBottom: spacing.space4     │ │
│ │  - alignSelf: center                │ │
│ │                                     │ │
│ │  Sheet Content                      │ │
│ │  paddingHorizontal: layout.screenPadding
│ │  paddingBottom: safeAreaBottom + spacing.space4
│ │                                     │ │
│ │  borderTopLeftRadius: borderRadius.2xl
│ │  borderTopRightRadius: borderRadius.2xl
│ │  backgroundColor: white             │ │
│ │                                     │ │
│ │  maxHeight: hp(90)                  │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 With Header

```
┌─────────────────────────────────────────┐
│                                         │
│         (Backdrop)                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  ═══════                            │ │
│ │                                     │ │
│ │  Sheet Header                       │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ✕      제목        [Action]│    │ │
│ │  │ close: 좌측               우측 액션 │ │
│ │  │ typography.titleLarge               │ │
│ │  │ height: ms(56)                      │ │
│ │  │ borderBottomWidth: 1                │ │
│ │  │ borderBottomColor: neutral100       │ │
│ │  └─────────────────────────────┘    │ │
│ │  height: ms(56)                     │ │
│ │  borderBottomWidth: 1               │ │
│ │  borderBottomColor: neutral100      │ │
│ │                                     │ │
│ │  Content                            │ │
│ │  ...                                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 1.3 Snap Points

```typescript
// 스냅 포인트 설정
const snapPoints = {
  small: hp(30),    // 30% 높이
  medium: hp(50),   // 50% 높이
  large: hp(80),    // 80% 높이
  full: hp(90),     // 90% 높이 (최대)
};

// 동적 스냅 포인트
const dynamicSnapPoints = [hp(30), hp(50), hp(80)];
```

### 1.4 컴포넌트 스타일

```typescript
const bottomSheetStyles = {
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: hp(90),
    ...shadows.xl,
  },
  
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.space3,
    paddingBottom: spacing.space4,
  },
  
  handle: {
    width: ms(40),
    height: ms(4),
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral300,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(56),
    paddingHorizontal: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  closeButton: {
    padding: spacing.space2,
    marginLeft: -spacing.space2,
  },
  
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: safeAreaBottom + spacing.space4,
  },
};
```

### 1.5 제스처

| 제스처 | 동작 |
|--------|------|
| Drag down | 닫기 또는 이전 스냅 포인트로 |
| Drag up | 다음 스냅 포인트로 |
| Tap backdrop | 닫기 |
| Velocity > threshold | 빠르게 닫기 |

### 1.6 Props

```typescript
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  
  // Snap
  snapPoints?: number[];
  initialSnapIndex?: number;
  
  // Header
  title?: string;
  showCloseButton?: boolean;
  headerAction?: ReactNode;
  
  // Behavior
  enableDragToClose?: boolean;
  enableBackdropPress?: boolean;
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
}
```

---

## 2. Alert Modal

경고/확인 다이얼로그입니다.

### 2.1 레이아웃 - 중앙 정렬

```
┌─────────────────────────────────────────┐
│                                         │
│         Backdrop (dim)                  │
│                                         │
│      ┌─────────────────────────┐        │
│      │                         │        │
│      │         ⚠️               │        │
│      │     (선택적 아이콘)      │        │
│      │                         │        │
│      │       삭제할까요?        │        │
│      │  typography.titleLarge   │        │
│      │  fontWeight: 600         │        │
│      │  textAlign: center       │        │
│      │                         │        │
│      │   이 항목을 삭제하면     │        │
│      │   복구할 수 없습니다.    │        │
│      │  typography.bodyMedium   │        │
│      │  color: textSecondary    │        │
│      │  textAlign: center       │        │
│      │                         │        │
│      │  ┌───────┐  ┌───────┐   │        │
│      │  │ 취소  │  │ 삭제  │   │        │
│      │  │neutral│  │danger │   │        │
│      │  └───────┘  └───────┘   │        │
│      │  gap: spacing.space3    │        │
│      │  marginTop: spacing.space6       │
│      │                         │        │
│      └─────────────────────────┘        │
│                                         │
│      Modal Container:                   │
│      - width: wp(85)                    │
│      - maxWidth: ms(340)                │
│      - borderRadius: borderRadius.2xl   │
│      - padding: spacing.space6          │
│      - backgroundColor: white           │
│      - shadows.xl                       │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 타입별 스타일

```typescript
const alertTypeStyles = {
  default: {
    icon: 'ℹ️',
    confirmButtonColor: colors.brand500,
  },
  danger: {
    icon: '⚠️',
    confirmButtonColor: colors.error,
  },
  success: {
    icon: '✅',
    confirmButtonColor: colors.success,
  },
  warning: {
    icon: '⚡',
    confirmButtonColor: colors.warning,
  },
};
```

### 2.3 컴포넌트 스타일

```typescript
const alertModalStyles = {
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  container: {
    width: wp(85),
    maxWidth: ms(340),
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.space6,
    alignItems: 'center',
    ...shadows.xl,
  },
  
  icon: {
    fontSize: ms(48),
    marginBottom: spacing.space4,
  },
  
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.space2,
  },
  
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: ms(22),
  },
  
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.space3,
    marginTop: spacing.space6,
    width: '100%',
  },
  
  button: {
    flex: 1,
    height: ms(48),
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  
  cancelButtonText: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  confirmButton: {
    backgroundColor: colors.brand500,
  },
  
  confirmButtonText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '600',
  },
};
```

### 2.4 Props

```typescript
interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string | ReactNode;
  
  // Buttons
  confirmText?: string;    // default: '확인'
  cancelText?: string;     // default: '취소'
  onConfirm: () => void;
  onCancel?: () => void;
  
  // Type
  type?: 'default' | 'danger' | 'success' | 'warning';
  showCancel?: boolean;    // default: true
  
  // Behavior
  closeOnBackdropPress?: boolean;  // default: false
}
```

---

## 3. Full Screen Modal

전체 화면 모달입니다.

### 3.1 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ✕      제목              [Action]  │ │
│ │                                     │ │
│ │ close: 좌측               우측 액션 │ │
│ │ typography.titleLarge               │ │
│ │ height: ms(56)                      │ │
│ │ borderBottomWidth: 1                │ │
│ │ borderBottomColor: neutral100       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Content                                │
│  flex: 1                                │
│  backgroundColor: white                 │
│                                         │
│  (children)                             │
│                                         │
├─────────────────────────────────────────┤
│  Footer (선택적)                        │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │         저장하기            │    │ │
│ │  │      PrimaryButton          │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  paddingBottom: safeAreaBottom      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3.2 컴포넌트 스타일

```typescript
const fullScreenModalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(56),
    paddingHorizontal: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  closeButton: {
    padding: spacing.space2,
    marginLeft: -spacing.space2,
  },
  
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  
  headerAction: {
    minWidth: ms(44),
    alignItems: 'flex-end',
  },
  
  content: {
    flex: 1,
  },
  
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: safeAreaBottom + spacing.space4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    backgroundColor: colors.white,
  },
};
```

---

## 4. Action Sheet

액션 선택 시트입니다.

### 4.1 레이아웃

```
┌─────────────────────────────────────────┐
│                                         │
│         (Backdrop)                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  ═══════                            │ │
│ │                                     │ │
│ │  제목 (선택적)                      │ │
│ │  typography.titleSmall              │ │
│ │  color: textSecondary               │ │
│ │  textAlign: center                  │ │
│ │  marginBottom: spacing.space3       │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📷  카메라로 촬영           │    │ │
│ │  │     height: ms(56)          │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🖼  앨범에서 선택           │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 📁  파일에서 선택           │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ─────────────────────────          │ │
│ │  separator: marginVertical space4   │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🗑  삭제                    │    │ │
│ │  │     color: error            │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │          취소               │    │ │
│ │  │    backgroundColor: white   │    │ │
│ │  │    fontWeight: 600          │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  marginTop: spacing.space2          │ │
│ │  borderRadius: borderRadius.xl      │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 컴포넌트 스타일

```typescript
const actionSheetStyles = {
  sheetContainer: {
    marginHorizontal: spacing.space2,
    marginBottom: safeAreaBottom + spacing.space2,
  },
  
  mainSheet: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  
  title: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.space4,
    paddingHorizontal: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  optionIcon: {
    fontSize: ms(20),
    marginRight: spacing.space3,
    color: colors.textSecondary,
  },
  
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  
  optionDestructive: {
    color: colors.error,
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.neutral200,
    marginVertical: spacing.space2,
  },
  
  cancelSheet: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginTop: spacing.space2,
  },
  
  cancelButton: {
    height: ms(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelText: {
    ...typography.bodyLarge,
    color: colors.brand500,
    fontWeight: '600',
  },
};
```

### 4.3 Props

```typescript
interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  cancelText?: string;  // default: '취소'
}

interface ActionSheetOption {
  icon?: string | ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}
```

---

## 애니메이션

```typescript
const modalAnimations = {
  // Bottom Sheet
  bottomSheet: {
    enter: {
      translateY: withSpring(0, {
        damping: 20,
        stiffness: 200,
      }),
    },
    exit: {
      translateY: withTiming(hp(100), { duration: 250 }),
    },
  },
  
  // Alert Modal
  alertModal: {
    enter: {
      scale: withSpring(1, { damping: 15, stiffness: 200 }),
      opacity: withTiming(1, { duration: 200 }),
    },
    exit: {
      scale: withTiming(0.9, { duration: 150 }),
      opacity: withTiming(0, { duration: 150 }),
    },
  },
  
  // Full Screen Modal
  fullScreenModal: {
    enter: {
      translateY: withSpring(0, {
        damping: 20,
        stiffness: 200,
      }),
    },
    exit: {
      translateY: withTiming(hp(100), { duration: 300 }),
    },
  },
  
  // Backdrop
  backdrop: {
    enter: withTiming(0.5, { duration: 200 }),
    exit: withTiming(0, { duration: 150 }),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  bottomSheet: {
    accessibilityRole: 'adjustable',
    accessibilityLabel: (title?: string) =>
      title ? `${title} 시트` : '바텀 시트',
    accessibilityHint: '아래로 스와이프하여 닫기',
  },
  
  alertModal: {
    accessibilityRole: 'alert',
    accessibilityLabel: (title: string, message?: string) =>
      message ? `${title}. ${message}` : title,
  },
  
  closeButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '닫기',
  },
  
  backdrop: {
    accessibilityRole: 'button',
    accessibilityLabel: '배경 탭하여 닫기',
  },
};
```

---

## 사용 예시

```tsx
// Bottom Sheet
<BottomSheet
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  title="옵션 선택"
  snapPoints={[hp(30), hp(50)]}
>
  <Content />
</BottomSheet>

// Alert Modal
<AlertModal
  visible={showAlert}
  type="danger"
  title="삭제할까요?"
  message="이 항목을 삭제하면 복구할 수 없습니다."
  confirmText="삭제"
  cancelText="취소"
  onConfirm={handleDelete}
  onCancel={() => setShowAlert(false)}
/>

// Full Screen Modal
<FullScreenModal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  title="새 항목 추가"
  headerAction={<SaveButton />}
>
  <Form />
</FullScreenModal>

// Action Sheet
<ActionSheet
  visible={showActions}
  onClose={() => setShowActions(false)}
  title="사진 선택"
  options={[
    { icon: '📷', label: '카메라로 촬영', onPress: handleCamera },
    { icon: '🖼', label: '앨범에서 선택', onPress: handleGallery },
    { icon: '🗑', label: '삭제', onPress: handleDelete, destructive: true },
  ]}
/>
```
