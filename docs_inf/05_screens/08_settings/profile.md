# 프로필 수정 화면 (ProfileScreen) - Production Ready v2.0

## 개요

사용자 프로필 정보를 수정하는 화면입니다.
프로필 사진을 중심으로 한 중앙 정렬 레이아웃을 적용하여 집중도를 높입니다.
토스, 카카오 등의 프로필 설정 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **프로필 중심 레이아웃**: 프로필 사진을 중앙 상단에 배치하여 개인화 강조
- **명확한 상호작용**: 편집 가능한 영역과 불가능한 영역을 시각적으로 구분
- **실시간 피드백**: 변경사항 발생 시 저장 버튼 활성화
- **미디어 최적화**: 이미지 선택/촬영/편집의 부드러운 흐름

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header (투명, 백 버튼만)                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←                                                   │ │
│  │  size: 44x44                                         │ │
│  │  paddingHorizontal: screenPadding                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  KeyboardAvoidingView                                     │
│  ScrollView                                               │
│  contentContainerStyle:                                   │
│    flexGrow: 1                                            │
│    paddingHorizontal: screenPadding                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  marginTop: space6                                  │  │
│  │                                                     │  │
│  │                  ┌──────────────┐                   │  │
│  │                  │              │                   │  │
│  │                  │              │                   │  │
│  │                  │     👤       │                   │  │
│  │                  │              │                   │  │
│  │                  │              │                   │  │
│  │                  └──────────────┘                   │  │
│  │                  width: 120px                       │  │
│  │                  height: 120px                      │  │
│  │                  borderRadius: 60px (원형)          │  │
│  │                  backgroundColor: neutral100        │  │
│  │                  border: 3px, white                 │  │
│  │                  ⚡ Shadow md                        │  │
│  │                                                     │  │
│  │                       ┌────┐                        │  │
│  │                       │ 📷 │  Camera badge          │  │
│  │                       └────┘                        │  │
│  │                       width: 36px                   │  │
│  │                       height: 36px                  │  │
│  │                       borderRadius: 18px            │  │
│  │                       backgroundColor: brand500     │  │
│  │                       iconColor: white              │  │
│  │                       iconSize: 18px                │  │
│  │                       position: absolute            │  │
│  │                       bottom: 0, right: 0           │  │
│  │                       border: 3px, white            │  │
│  │                       ⚡ Press scale animation       │  │
│  │                                                     │  │
│  │                  사진 변경                          │  │
│  │                  labelMedium, brand500              │  │
│  │                  marginTop: space3                  │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  기본 정보                                          │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space3                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  이름 *                                     │    │  │
│  │  │  labelMedium, textSecondary                 │    │  │
│  │  │  marginBottom: space2                       │    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  👤   홍길동                          │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  height: 56px                         │  │    │  │
│  │  │  │  backgroundColor: neutral100          │  │    │  │
│  │  │  │  borderRadius: 12px                   │  │    │  │
│  │  │  │  (focused) borderWidth: 2             │  │    │  │
│  │  │  │            borderColor: brand500      │  │    │  │
│  │  │  │            backgroundColor: white     │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  marginTop: space4                                  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  이메일 (수정 불가)                         │    │  │
│  │  │  labelMedium, textSecondary                 │    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  ✉️   example@email.com               │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  height: 56px                         │  │    │  │
│  │  │  │  backgroundColor: neutral50           │  │    │  │
│  │  │  │  borderRadius: 12px                   │  │    │  │
│  │  │  │  color: textTertiary                  │  │    │  │
│  │  │  │  disabled: true                       │  │    │  │
│  │  │  │  🔒 아이콘 표시 (우측)                 │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  │  💡 이메일은 계정 보안을 위해 변경할 수 없어요 │    │  │
│  │  │  captionMedium, textTertiary                │    │  │
│  │  │  marginTop: space2                          │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  marginTop: space4                                  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  연락처                                     │    │  │
│  │  │  labelMedium, textSecondary                 │    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  📱   010-1234-5678                   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  height: 56px                         │  │    │  │
│  │  │  │  keyboardType: phone-pad              │  │    │  │
│  │  │  │  autoFormat: true (010-0000-0000)     │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  역할 정보                                          │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space3                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  현재 역할                                  │    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  👔  관리자                         │    │    │  │
│  │  │  │  또는                               │    │    │  │
│  │  │  │  👷  근무자                         │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  height: 56px                       │    │    │  │
│  │  │  │  backgroundColor: brand50           │    │    │  │
│  │  │  │  borderRadius: 12px                 │    │    │  │
│  │  │  │  color: brand600                    │    │    │  │
│  │  │  │  fontWeight: 600                    │    │    │  │
│  │  │  │  disabled: true                     │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: hp(15) + safeArea (버튼 영역 확보)         │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Bottom Button (Fixed)                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  paddingHorizontal: screenPadding                   │  │
│  │  paddingTop: space4                                 │  │
│  │  paddingBottom: safeAreaBottom + space4             │  │
│  │  borderTopWidth: 1                                  │  │
│  │  borderTopColor: neutral100                         │  │
│  │  ⚡ Shadow (subtle top shadow)                       │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │                    저장                       │  │  │
│  │  │                                               │  │  │
│  │  │  PrimaryButton                                │  │  │
│  │  │  height: 56px                                 │  │  │
│  │  │  borderRadius: 12px                           │  │  │
│  │  │  backgroundColor: brand500                    │  │  │
│  │  │  ⚡ Brand shadow                               │  │  │
│  │  │                                               │  │  │
│  │  │  disabled: !hasChanges || !isValid            │  │  │
│  │  │  loading: isSaving                            │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Profile Image Section

```typescript
const profileImageStyles = {
  container: {
    alignItems: 'center',
    marginTop: spacing.space6,
  },
  
  imageWrapper: {
    position: 'relative',
  },
  
  image: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: colors.neutral100,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  
  placeholder: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  
  placeholderIcon: {
    size: ms(48),
    color: colors.neutral400,
  },
  
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  
  cameraBadgeIcon: {
    size: ms(18),
    color: colors.white,
  },
  
  changeText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginTop: spacing.space3,
  },
  
  // 터치 영역 확장
  touchArea: {
    padding: spacing.space2,
  },
};
```

### 2. Input Fields

```typescript
const inputStyles = {
  sectionTitle: {
    ...typography.labelMedium,
    color: colors.textTertiary,
    marginBottom: spacing.space3,
    marginTop: spacing.space8,
  },
  
  inputWrapper: {
    marginTop: spacing.space4,
  },
  
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.space4,
    borderWidth: 0,
  },
  
  inputContainerFocused: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand500,
    ...shadows.brand,
  },
  
  inputContainerDisabled: {
    backgroundColor: colors.neutral50,
  },
  
  icon: {
    size: ms(20),
    color: colors.neutral400,
    marginRight: spacing.space3,
  },
  
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  
  inputDisabled: {
    color: colors.textTertiary,
  },
  
  lockIcon: {
    size: ms(16),
    color: colors.neutral400,
  },
  
  helperText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space2,
  },
};
```

### 3. Role Badge

```typescript
const roleBadgeStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.space4,
  },
  
  icon: {
    size: ms(24),
    marginRight: spacing.space3,
  },
  
  text: {
    ...typography.titleMedium,
    color: colors.brand600,
    fontWeight: '600',
  },
  
  roles: {
    admin: {
      icon: '👔',
      text: '관리자',
    },
    worker: {
      icon: '👷',
      text: '근무자',
    },
  },
};
```

### 4. Save Button (Fixed Bottom)

```typescript
const saveButtonStyles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    paddingBottom: safeAreaBottom + spacing.space4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    // Subtle top shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  
  button: {
    height: ms(56),
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.brand,
  },
  
  buttonDisabled: {
    backgroundColor: colors.neutral300,
    shadowOpacity: 0,
  },
  
  buttonText: {
    ...typography.titleLarge,
    color: colors.white,
    fontWeight: '600',
  },
};
```

---

## 이미지 변경 ActionSheet

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  (배경 어둡게 처리)                                        │
│  ⚡ FadeIn animation                                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  프로필 사진                                        │  │
│  │  titleMedium, textPrimary, fontWeight: 600          │  │
│  │  textAlign: center                                  │  │
│  │  paddingVertical: space4                            │  │
│  │                                                     │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  1px, neutral200                                    │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  📷  사진 촬영                                │  │  │
│  │  │                                               │  │  │
│  │  │  height: 56px                                 │  │  │
│  │  │  titleMedium, textPrimary                     │  │  │
│  │  │  ⚡ Highlight on press                         │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  🖼️  갤러리에서 선택                          │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  (현재 사진이 있을 때만)                            │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  🗑️  현재 사진 삭제                           │  │  │
│  │  │                                               │  │  │
│  │  │  color: error                                 │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  borderRadius: 16px (top)                           │  │
│  │  backgroundColor: white                             │  │
│  │  marginHorizontal: space3                           │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space2                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │                     취소                            │  │
│  │                                                     │  │
│  │  height: 56px                                       │  │
│  │  titleMedium, brand500                              │  │
│  │  fontWeight: 600                                    │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: 16px                                 │  │
│  │  marginHorizontal: space3                           │  │
│  │  marginBottom: safeAreaBottom + space3              │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ⚡ SlideUp animation                                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 애니메이션

### 프로필 이미지 변경

```typescript
const profileImageAnimation = {
  // 카메라 배지 프레스
  cameraBadgePress: {
    scale: { to: 0.9 },
    duration: 100,
    spring: { damping: 15, stiffness: 200 },
  },
  
  // 이미지 변경 시
  imageChange: {
    // 기존 이미지 페이드 아웃
    fadeOut: {
      opacity: { to: 0 },
      scale: { to: 0.9 },
      duration: 150,
    },
    // 새 이미지 페이드 인
    fadeIn: {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.9, to: 1 },
      duration: 300,
      easing: 'easeOut',
    },
  },
};
```

### 입력 필드 포커스

```typescript
const inputFocusAnimation = {
  borderColor: {
    from: colors.transparent,
    to: colors.brand500,
    duration: 150,
  },
  
  backgroundColor: {
    from: colors.neutral100,
    to: colors.white,
    duration: 150,
  },
  
  shadow: {
    from: 0,
    to: shadows.brand.shadowOpacity,
    duration: 200,
  },
};
```

### 저장 버튼

```typescript
const saveButtonAnimation = {
  // 변경사항 감지 시
  appear: {
    opacity: { from: 0.5, to: 1 },
    duration: 200,
  },
  
  press: {
    scale: { to: 0.97 },
    duration: 100,
  },
  
  success: {
    scale: [1, 1.05, 1],
    duration: 300,
    haptic: 'success',
  },
};
```

### ActionSheet

```typescript
const actionSheetAnimation = {
  // 배경
  overlay: {
    opacity: { from: 0, to: 1 },
    duration: 200,
  },
  
  // 시트 슬라이드
  sheet: {
    translateY: { from: 300, to: 0 },
    duration: 300,
    easing: 'easeOut',
  },
  
  // 닫기
  close: {
    translateY: { to: 300 },
    opacity: { to: 0 },
    duration: 200,
  },
};
```

---

## 유효성 검사

```typescript
const validation = {
  name: {
    required: {
      message: '이름을 입력해주세요',
    },
    minLength: {
      value: 2,
      message: '이름은 2자 이상 입력해주세요',
    },
    maxLength: {
      value: 20,
      message: '이름은 20자 이하로 입력해주세요',
    },
  },
  
  phone: {
    pattern: {
      value: /^010-\d{4}-\d{4}$/,
      message: '올바른 연락처 형식을 입력해주세요',
    },
    optional: true,
  },
};
```

---

## 저장 버튼 활성화 조건

```typescript
const isSaveEnabled = 
  hasChanges &&              // 변경사항 있음
  name.length >= 2 &&        // 이름 2자 이상
  (phone === '' || isValidPhone(phone));  // 연락처 비어있거나 유효
```

---

## 변경사항 확인

```typescript
// 변경사항 있는지 확인
const hasChanges = 
  name !== originalName ||
  phone !== originalPhone ||
  profileImage !== originalProfileImage;
```

---

## 뒤로가기 경고 모달

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  (배경 어둡게 처리)                                        │
│                                                           │
│     ┌───────────────────────────────────────────────┐     │
│     │                                               │     │
│     │                                               │     │
│     │                  ┌────────┐                   │     │
│     │                  │        │                   │     │
│     │                  │   ⚠️   │                   │     │
│     │                  │        │                   │     │
│     │                  └────────┘                   │     │
│     │                  width: 64px                  │     │
│     │                  height: 64px                 │     │
│     │                  backgroundColor: warning100  │     │
│     │                  borderRadius: 32px           │     │
│     │                                               │     │
│     │            변경사항이 있습니다                 │     │
│     │            titleLarge, textPrimary            │     │
│     │            fontWeight: 600                    │     │
│     │            marginTop: space4                  │     │
│     │                                               │     │
│     │         저장하지 않고 나가시겠습니까?          │     │
│     │            bodyMedium, textSecondary          │     │
│     │            marginTop: space2                  │     │
│     │                                               │     │
│     │                                               │     │
│     │     ┌─────────────────┐ ┌─────────────────┐   │     │
│     │     │                 │ │                 │   │     │
│     │     │     나가기      │ │      저장       │   │     │
│     │     │                 │ │                 │   │     │
│     │     │  SecondaryBtn   │ │  PrimaryBtn     │   │     │
│     │     │  height: 48px   │ │  height: 48px   │   │     │
│     │     │                 │ │                 │   │     │
│     │     └─────────────────┘ └─────────────────┘   │     │
│     │                                               │     │
│     │     gap: space3                               │     │
│     │     marginTop: space6                         │     │
│     │                                               │     │
│     │  paddingHorizontal: space6                    │     │
│     │  paddingVertical: space8                      │     │
│     │  borderRadius: 24px                           │     │
│     │  backgroundColor: white                       │     │
│     │  marginHorizontal: space5                     │     │
│     │                                               │     │
│     └───────────────────────────────────────────────┘     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 저장 완료 피드백

```typescript
const saveSuccessFeedback = {
  // 토스트 메시지
  toast: {
    message: '프로필이 저장되었습니다',
    type: 'success',
    duration: 2000,
    position: 'bottom',
    icon: 'check-circle',
  },
  
  // 햅틱 피드백
  haptic: 'success',
  
  // 버튼 상태
  button: {
    text: '저장됨 ✓',
    duration: 1500,
    then: 'goBack',
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  profileImage: {
    accessibilityRole: 'button',
    accessibilityLabel: '프로필 사진 변경',
    accessibilityHint: '두 번 탭하여 사진을 변경하세요',
  },
  
  cameraBadge: {
    accessibilityRole: 'button',
    accessibilityLabel: '프로필 사진 변경',
    accessibilityHint: '두 번 탭하여 사진을 촬영하거나 선택하세요',
  },
  
  nameInput: {
    accessibilityLabel: '이름 입력',
    accessibilityHint: '이름을 입력하세요',
    accessibilityState: { required: true },
  },
  
  emailInput: {
    accessibilityLabel: '이메일',
    accessibilityHint: '이메일은 변경할 수 없습니다',
    accessibilityState: { disabled: true },
  },
  
  phoneInput: {
    accessibilityLabel: '연락처 입력',
    accessibilityHint: '연락처를 입력하세요',
  },
  
  saveButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '저장',
    accessibilityState: {
      disabled: !hasChanges || !isValid,
      busy: isSaving,
    },
  },
};
```

---

## 상태 관리

```typescript
interface ProfileState {
  // 폼 데이터
  name: string;
  email: string;  // 읽기 전용
  phone: string;
  profileImage: string | null;
  role: 'admin' | 'worker';  // 읽기 전용
  
  // 원본 데이터 (변경 감지용)
  originalName: string;
  originalPhone: string;
  originalProfileImage: string | null;
  
  // UI 상태
  isLoading: boolean;
  isSaving: boolean;
  showActionSheet: boolean;
  showDiscardModal: boolean;
  errors: Record<string, string>;
}
```

---

## 키보드 동작

```typescript
const keyboardBehavior = {
  keyboardAvoidingView: {
    behavior: Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
  },
  
  fields: {
    name: {
      returnKeyType: 'next',
      onSubmitEditing: () => phoneRef.current?.focus(),
    },
    phone: {
      returnKeyType: 'done',
      keyboardType: 'phone-pad',
      onSubmitEditing: Keyboard.dismiss,
    },
  },
  
  dismissOnTap: true,
};
```

---

## 전체 코드 예시

```typescript
// screens/Settings/ProfileScreen.tsx

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextInput } from '@/components/Input';
import { PrimaryButton } from '@/components/Button';
import { ActionSheet } from '@/components/ActionSheet';
import { Modal } from '@/components/Modal';
import { Header } from '@/components/Header';

import { useUser } from '@/hooks/useUser';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatPhoneNumber } from '@/utils/format';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useUser();
  
  // State
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [isSaving, setIsSaving] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  // Refs
  const phoneRef = useRef<TextInput>(null);
  
  // Original values for change detection
  const originalValues = useMemo(() => ({
    name: user.name,
    phone: user.phone || '',
    profileImage: user.profileImage,
  }), [user]);
  
  // Change detection
  const hasChanges = 
    name !== originalValues.name ||
    phone !== originalValues.phone ||
    profileImage !== originalValues.profileImage;
  
  // Validation
  const isValid = name.length >= 2 && 
    (phone === '' || /^010-\d{4}-\d{4}$/.test(phone));
  
  // Phone number formatting
  const handlePhoneChange = (text: string) => {
    setPhone(formatPhoneNumber(text));
  };
  
  // Image picker
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowActionSheet(false);
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowActionSheet(false);
  };
  
  const handleDeleteImage = () => {
    setProfileImage(null);
    setShowActionSheet(false);
  };
  
  // Save
  const handleSave = async () => {
    if (!hasChanges || !isValid) return;
    
    setIsSaving(true);
    
    try {
      await updateProfile({ name, phone, profileImage });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Toast + navigate back
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Back handler
  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="" showBackButton onBackPress={handleBack} />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Image Section */}
            <Animated.View
              style={styles.profileSection}
              entering={FadeIn.delay(100).duration(400)}
            >
              <TouchableOpacity
                onPress={() => setShowActionSheet(true)}
                activeOpacity={0.8}
              >
                <View style={styles.imageWrapper}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.image} />
                  ) : (
                    <View style={styles.placeholder}>
                      <Icon name="user" size={ms(48)} color={colors.neutral400} />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Icon name="camera" size={ms(18)} color={colors.white} />
                  </View>
                </View>
                <Text style={styles.changeText}>사진 변경</Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Form Section */}
            <Animated.View
              style={styles.formSection}
              entering={FadeInDown.delay(200).duration(400)}
            >
              <Text style={styles.sectionTitle}>기본 정보</Text>
              
              {/* Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>이름 *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="이름을 입력하세요"
                  leftIcon="user"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
              
              {/* Email (Disabled) */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>이메일 (수정 불가)</Text>
                <TextInput
                  value={user.email}
                  placeholder="이메일"
                  leftIcon="mail"
                  rightIcon="lock"
                  disabled
                />
                <Text style={styles.helperText}>
                  💡 이메일은 계정 보안을 위해 변경할 수 없어요
                </Text>
              </View>
              
              {/* Phone */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>연락처</Text>
                <TextInput
                  ref={phoneRef}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="010-0000-0000"
                  leftIcon="phone"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>
              
              {/* Role Section */}
              <Text style={styles.sectionTitle}>역할 정보</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>현재 역할</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleIcon}>
                    {user.role === 'admin' ? '👔' : '👷'}
                  </Text>
                  <Text style={styles.roleText}>
                    {user.role === 'admin' ? '관리자' : '근무자'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      {/* Save Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.space4 }]}>
        <PrimaryButton
          title="저장"
          onPress={handleSave}
          disabled={!hasChanges || !isValid}
          loading={isSaving}
        />
      </View>
      
      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="프로필 사진"
        options={[
          { label: '📷  사진 촬영', onPress: handleTakePhoto },
          { label: '🖼️  갤러리에서 선택', onPress: handlePickImage },
          ...(profileImage ? [
            { label: '🗑️  현재 사진 삭제', onPress: handleDeleteImage, destructive: true },
          ] : []),
        ]}
      />
      
      {/* Discard Modal */}
      <Modal
        visible={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="변경사항이 있습니다"
        message="저장하지 않고 나가시겠습니까?"
        icon="alert-triangle"
        iconColor={colors.warning}
        actions={[
          { label: '나가기', onPress: () => navigation.goBack(), type: 'secondary' },
          { label: '저장', onPress: handleSave, type: 'primary' },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: hp(15),
  },
  profileSection: {
    alignItems: 'center',
    marginTop: spacing.space6,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  placeholder: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  changeText: {
    ...typography.labelMedium,
    color: colors.brand500,
    marginTop: spacing.space3,
  },
  formSection: {
    marginTop: spacing.space8,
  },
  sectionTitle: {
    ...typography.labelMedium,
    color: colors.textTertiary,
    marginBottom: spacing.space3,
    marginTop: spacing.space8,
  },
  inputWrapper: {
    marginTop: spacing.space4,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  helperText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.space4,
  },
  roleIcon: {
    fontSize: ms(24),
    marginRight: spacing.space3,
  },
  roleText: {
    ...typography.titleMedium,
    color: colors.brand600,
    fontWeight: '600',
  },
  buttonContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
});
````
