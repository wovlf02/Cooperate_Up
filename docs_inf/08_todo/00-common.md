# 00. 공통 컴포넌트 TODO

> **Phase**: 기반 인프라  
> **우선순위**: 🔴 최우선 (모든 화면의 기반)

## 📊 진행 상황

**진행률**: 100% (완료)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 항목

#### 1. 스타일 시스템
- ✅ `colors.ts` - 색상 팔레트
- ✅ `typography.ts` - 타이포그래피 시스템
- ✅ `spacing.ts` - 간격 시스템
- ✅ `shadows.ts` - 그림자 스타일

#### 2. 유틸리티
- ✅ `responsive.ts` - 반응형 유틸리티 (wp, hp, ms)
- ✅ `dateUtils.ts` - 날짜 포맷팅
- ✅ `formatUtils.ts` - 통화, 전화번호 포맷
- ✅ `validators.ts` - 이메일, 전화번호, 비밀번호 검증

#### 3. 기본 컴포넌트
- ✅ `Button.tsx` - 기본 버튼
- ✅ `Input.tsx` - 텍스트 입력
- ✅ `Loading.tsx` - 로딩 인디케이터
- ✅ `ErrorMessage.tsx` - 에러 메시지

#### 4. Cards
- ✅ `BaseCard.tsx` - 기본 카드
- ✅ `ListItemCard.tsx` - 목록 아이템 카드
- ✅ `InfoCard.tsx` - 정보 카드
- ✅ `SummaryCard.tsx` - 요약 카드
- ✅ `StatCard.tsx` - 통계 카드
- ✅ `ActionCard.tsx` - 액션 카드
- ✅ `ExpandableCard.tsx` - 펼침/접힘 카드

#### 5. Feedback
- ✅ `EmptyState.tsx` - 빈 상태 표시
- ✅ `Toast.tsx` + `useToast.ts` - 토스트 메시지
- ✅ `Skeleton.tsx` - 스켈레톤 로딩
- ✅ `ProgressBar.tsx` - 진행률 바
- ✅ `LoadingIndicator.tsx` - 로딩 인디케이터

#### 6. Navigation
- ✅ `Header.tsx` - 공통 헤더
- ✅ `TabBar.tsx` - 탭 바
- ✅ `SegmentedControl.tsx` - 세그먼트 컨트롤
- ✅ `Stepper.tsx` - 단계 표시

#### 7. Buttons
- ✅ `IconButton.tsx` - 아이콘 버튼
- ✅ `FloatingActionButton.tsx` - FAB

#### 8. Layout
- ✅ `SafeAreaWrapper.tsx` - SafeArea 래퍼
- ✅ `ScreenContainer.tsx` - 화면 컨테이너
- ✅ `Divider.tsx` - 구분선
- ✅ `Spacer.tsx` - 여백

#### 9. Modals
- ✅ `BottomSheet.tsx` - 바텀 시트
- ✅ `AlertModal.tsx` - 알림 모달
- ✅ `ConfirmModal.tsx` - 확인 모달
- ✅ `FullScreenModal.tsx` - 전체화면 모달
- ✅ `ActionSheet.tsx` - 액션 시트
- ✅ `LoadingModal.tsx` - 로딩 모달

#### 10. Badges
- ✅ `Badge.tsx` - 숫자/도트 뱃지
- ✅ `Tag.tsx` - 태그/칩
- ✅ `StatusBadge.tsx` - 상태 뱃지
- ✅ `RoleBadge.tsx` - 역할 뱃지

#### 11. Inputs
- ✅ `Checkbox.tsx` - 체크박스
- ✅ `Switch.tsx` - 스위치
- ✅ `SearchInput.tsx` - 검색 입력
- ✅ `Select.tsx` - 드롭다운 선택

#### 12. Shared 컴포넌트
- ✅ `WorkplaceHeader.tsx` - 사업장 헤더

### 📝 상세 작업 목록

#### 1. Layout 컴포넌트 구현 (우선순위: 높음)

**파일 경로**: `front/src/components/common/layout/`

```typescript
// SafeAreaWrapper.tsx
interface SafeAreaWrapperProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

// ScreenContainer.tsx
interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  backgroundColor?: string;
  padding?: number;
}

// Divider.tsx
interface DividerProps {
  vertical?: boolean;
  thickness?: number;
  color?: string;
  margin?: number;
}

// Spacer.tsx
interface SpacerProps {
  size: number;
  horizontal?: boolean;
}

// KeyboardAvoidingWrapper.tsx
interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  behavior?: 'padding' | 'height' | 'position';
}
```

**예상 작업 시간**: 2-3시간

#### 2. 고급 Input 컴포넌트 구현 (우선순위: 중간)

**파일 경로**: `front/src/components/common/inputs/`

```typescript
// TextArea.tsx
interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
  disabled?: boolean;
}

// PasswordInput.tsx (표시/숨김 토글)
interface PasswordInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showStrength?: boolean;
}

// DatePicker.tsx
interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  mode?: 'date' | 'datetime' | 'time';
}

// Select.tsx
interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
}
```

**예상 작업 시간**: 3-4시간

#### 3. Modal 컴포넌트 구현 (우선순위: 높음)

**파일 경로**: `front/src/components/common/modals/`

```typescript
// BottomSheet.tsx (react-native-bottom-sheet 사용)
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
}

// AlertModal.tsx
interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

// ConfirmModal.tsx (위험한 액션용)
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  destructive?: boolean;
}

// ActionSheet.tsx
interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: {
    label: string;
    onPress: () => void;
    destructive?: boolean;
    icon?: string;
  }[];
  cancelText?: string;
}
```

**예상 작업 시간**: 4-5시간

#### 4. Feedback 컴포넌트 확장 (우선순위: 중간)

**파일 경로**: `front/src/components/common/feedback/`

```typescript
// Toast.tsx + useToast hook
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Skeleton.tsx
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  animation?: boolean;
}

// ProgressBar.tsx
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
}
```

**예상 작업 시간**: 3-4시간

#### 5. Badge 컴포넌트 구현 (우선순위: 낮음)

**파일 경로**: `front/src/components/common/badges/`

```typescript
// Badge.tsx
interface BadgeProps {
  count?: number;
  dot?: boolean;
  maxCount?: number;
  color?: string;
  children?: React.ReactNode;
}

// Tag.tsx
interface TagProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  selected?: boolean;
}

// StatusBadge.tsx
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  label: string;
  size?: 'small' | 'medium' | 'large';
}
```

**예상 작업 시간**: 2-3시간

#### 6. Shared 컴포넌트 구현 (우선순위: 높음)

**파일 경로**: `front/src/components/shared/`

```typescript
// ProfileImage.tsx
interface ProfileImageProps {
  uri?: string | null;
  name: string; // 이미지 없을 때 이니셜 표시
  size?: number;
  editable?: boolean;
  onPress?: () => void;
}

// AttendanceStatusDot.tsx
interface AttendanceStatusDotProps {
  status: 'working' | 'off' | 'pending';
  size?: number;
}

// TimeDisplay.tsx
interface TimeDisplayProps {
  time: Date | string;
  format?: string;
  showDate?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// CurrencyDisplay.tsx
interface CurrencyDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showUnit?: boolean;
}

// WorkplaceSelector.tsx
interface WorkplaceSelectorProps {
  currentWorkplace: Workplace;
  workplaces: Workplace[];
  onChange: (workplace: Workplace) => void;
}

// WorkplaceHeader.tsx
interface WorkplaceHeaderProps {
  workplace: Workplace;
  onWorkplaceChange?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}
```

**예상 작업 시간**: 4-5시간

---

## 📦 필요한 패키지

다음 패키지들이 필요할 수 있습니다:

```json
{
  "dependencies": {
    "@gorhom/bottom-sheet": "^4", // BottomSheet
    "react-native-date-picker": "^4", // DatePicker
    "react-native-picker-select": "^8", // Select
    "react-native-toast-message": "^2" // Toast (선택사항)
  }
}
```

---

## 🎯 우선순위 작업 순서

### Phase 1: 필수 레이아웃 (1-2일)
1. SafeAreaWrapper
2. ScreenContainer
3. KeyboardAvoidingWrapper
4. Divider, Spacer

### Phase 2: 비즈니스 공통 (1-2일)
1. ProfileImage
2. WorkplaceHeader
3. WorkplaceSelector
4. AttendanceStatusDot
5. TimeDisplay
6. CurrencyDisplay

### Phase 3: 필수 모달 (2-3일)
1. BottomSheet
2. AlertModal
3. ConfirmModal
4. LoadingModal

### Phase 4: 고급 Input (2일)
1. PasswordInput
2. TextArea
3. DatePicker
4. Select

### Phase 5: 피드백 & 뱃지 (1-2일)
1. Toast + useToast
2. Skeleton
3. ProgressBar
4. StatusBadge
5. Badge

---

## 🧪 테스트 체크리스트

각 컴포넌트 구현 후:
- [ ] Props 전달 테스트
- [ ] 다양한 상태 테스트 (loading, error, disabled 등)
- [ ] 반응형 동작 확인 (다양한 화면 크기)
- [ ] 접근성 확인 (accessibilityLabel, accessibilityRole)
- [ ] 다크모드 지원 (선택사항)

---

## ⏭️ 다음 단계

공통 컴포넌트 구현 완료 후:
1. → [01-auth.md](./01-auth.md) (인증 도메인)
2. → [12-workplace.md](./12-workplace.md) (사업장 - 앱 시작점)
3. → [02-home.md](./02-home.md) (홈 화면)

---

## 📚 참고 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 디자인 시스템 | `docs/05_screens/00_common/design-system.md` | 색상, 타이포그래피 |
| 버튼 명세 | `docs/05_screens/00_common/buttons.md` | 버튼 컴포넌트 상세 |
| 입력 명세 | `docs/05_screens/00_common/inputs.md` | 입력 컴포넌트 상세 |
| 카드 명세 | `docs/05_screens/00_common/cards.md` | 카드 컴포넌트 상세 |
| 모달 명세 | `docs/05_screens/00_common/modals.md` | 모달 컴포넌트 상세 |

