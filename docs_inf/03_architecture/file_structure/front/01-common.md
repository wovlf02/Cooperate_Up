// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\01-common.md
# 공통 컴포넌트 파일 구조 (Common Components)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

모든 도메인에서 재사용되는 공통 컴포넌트입니다. Production Ready v2.0 디자인 시스템을 기반으로 합니다.

---

## 디렉토리 구조

```
src/components/
├── common/
│   ├── index.ts                        # 모든 공통 컴포넌트 export (~40 lines)
│   │
│   ├── buttons/
│   │   ├── index.ts                    # (~10 lines)
│   │   ├── PrimaryButton/
│   │   │   ├── index.ts                # (~3 lines)
│   │   │   ├── PrimaryButton.tsx       # 주요 액션 버튼 (~50 lines)
│   │   │   └── PrimaryButton.styles.ts # (~35 lines)
│   │   ├── SecondaryButton/
│   │   │   ├── index.ts
│   │   │   ├── SecondaryButton.tsx     # 보조 액션 버튼 (~45 lines)
│   │   │   └── SecondaryButton.styles.ts # (~30 lines)
│   │   ├── TextButton/
│   │   │   ├── index.ts
│   │   │   ├── TextButton.tsx          # 텍스트 버튼 (~35 lines)
│   │   │   └── TextButton.styles.ts    # (~25 lines)
│   │   ├── IconButton/
│   │   │   ├── index.ts
│   │   │   ├── IconButton.tsx          # 아이콘 버튼 (~40 lines)
│   │   │   └── IconButton.styles.ts    # (~30 lines)
│   │   ├── FloatingActionButton/
│   │   │   ├── index.ts
│   │   │   ├── FloatingActionButton.tsx    # FAB (~50 lines)
│   │   │   └── FloatingActionButton.styles.ts # (~35 lines)
│   │   ├── FixedBottomButton/
│   │   │   ├── index.ts
│   │   │   ├── FixedBottomButton.tsx   # 하단 고정 버튼 (~45 lines)
│   │   │   └── FixedBottomButton.styles.ts # (~40 lines)
│   │   └── ButtonGroup/
│   │       ├── index.ts
│   │       ├── ButtonGroup.tsx         # 버튼 그룹 (~40 lines)
│   │       └── ButtonGroup.styles.ts   # (~30 lines)
│   │
│   ├── inputs/
│   │   ├── index.ts                    # (~15 lines)
│   │   ├── TextInput/
│   │   │   ├── index.ts
│   │   │   ├── TextInput.tsx           # 텍스트 입력 (~50 lines)
│   │   │   ├── TextInput.styles.ts     # (~45 lines)
│   │   │   └── TextInput.types.ts      # (~20 lines)
│   │   ├── PasswordInput/
│   │   │   ├── index.ts
│   │   │   ├── PasswordInput.tsx       # 비밀번호 입력 (~50 lines)
│   │   │   └── PasswordInput.styles.ts # (~35 lines)
│   │   ├── CodeInput/
│   │   │   ├── index.ts
│   │   │   ├── CodeInput.tsx           # 인증번호 입력 (~50 lines)
│   │   │   ├── CodeInput.styles.ts     # (~40 lines)
│   │   │   └── CodeDigit.tsx           # 개별 숫자 칸 (~30 lines)
│   │   ├── TextArea/
│   │   │   ├── index.ts
│   │   │   ├── TextArea.tsx            # 여러 줄 입력 (~45 lines)
│   │   │   └── TextArea.styles.ts      # (~35 lines)
│   │   ├── Select/
│   │   │   ├── index.ts
│   │   │   ├── Select.tsx              # 드롭다운 (~50 lines)
│   │   │   ├── Select.styles.ts        # (~40 lines)
│   │   │   └── SelectOption.tsx        # 옵션 항목 (~25 lines)
│   │   ├── Checkbox/
│   │   │   ├── index.ts
│   │   │   ├── Checkbox.tsx            # (~40 lines)
│   │   │   └── Checkbox.styles.ts      # (~30 lines)
│   │   ├── RadioGroup/
│   │   │   ├── index.ts
│   │   │   ├── RadioGroup.tsx          # (~45 lines)
│   │   │   ├── RadioGroup.styles.ts    # (~35 lines)
│   │   │   └── RadioItem.tsx           # (~30 lines)
│   │   ├── Switch/
│   │   │   ├── index.ts
│   │   │   ├── Switch.tsx              # (~40 lines)
│   │   │   └── Switch.styles.ts        # (~30 lines)
│   │   ├── SearchInput/
│   │   │   ├── index.ts
│   │   │   ├── SearchInput.tsx         # (~45 lines)
│   │   │   └── SearchInput.styles.ts   # (~35 lines)
│   │   └── DateTimePicker/
│   │       ├── index.ts
│   │       ├── DateTimePicker.tsx      # 날짜/시간 선택 (~50 lines)
│   │       └── DateTimePicker.styles.ts # (~40 lines)
│   │
│   ├── cards/
│   │   ├── index.ts                    # (~10 lines)
│   │   ├── BaseCard/
│   │   │   ├── index.ts
│   │   │   ├── BaseCard.tsx            # (~35 lines)
│   │   │   └── BaseCard.styles.ts      # (~30 lines)
│   │   ├── ListItemCard/
│   │   │   ├── index.ts
│   │   │   ├── ListItemCard.tsx        # (~45 lines)
│   │   │   └── ListItemCard.styles.ts  # (~40 lines)
│   │   ├── InfoCard/
│   │   │   ├── index.ts
│   │   │   ├── InfoCard.tsx            # (~50 lines)
│   │   │   └── InfoCard.styles.ts      # (~40 lines)
│   │   ├── SummaryCard/
│   │   │   ├── index.ts
│   │   │   ├── SummaryCard.tsx         # (~45 lines)
│   │   │   └── SummaryCard.styles.ts   # (~40 lines)
│   │   ├── StatCard/
│   │   │   ├── index.ts
│   │   │   ├── StatCard.tsx            # (~50 lines)
│   │   │   └── StatCard.styles.ts      # (~45 lines)
│   │   ├── ActionCard/
│   │   │   ├── index.ts
│   │   │   ├── ActionCard.tsx          # (~50 lines)
│   │   │   └── ActionCard.styles.ts    # (~40 lines)
│   │   └── ExpandableCard/
│   │       ├── index.ts
│   │       ├── ExpandableCard.tsx      # (~50 lines)
│   │       └── ExpandableCard.styles.ts # (~45 lines)
│   │
│   ├── modals/
│   │   ├── index.ts                    # (~10 lines)
│   │   ├── BottomSheet/
│   │   │   ├── index.ts
│   │   │   ├── BottomSheet.tsx         # (~50 lines)
│   │   │   ├── BottomSheet.styles.ts   # (~45 lines)
│   │   │   └── BottomSheetHandle.tsx   # (~25 lines)
│   │   ├── AlertModal/
│   │   │   ├── index.ts
│   │   │   ├── AlertModal.tsx          # (~50 lines)
│   │   │   └── AlertModal.styles.ts    # (~40 lines)
│   │   ├── ConfirmModal/
│   │   │   ├── index.ts
│   │   │   ├── ConfirmModal.tsx        # (~45 lines)
│   │   │   └── ConfirmModal.styles.ts  # (~35 lines)
│   │   ├── FullScreenModal/
│   │   │   ├── index.ts
│   │   │   ├── FullScreenModal.tsx     # (~45 lines)
│   │   │   └── FullScreenModal.styles.ts # (~35 lines)
│   │   ├── ActionSheet/
│   │   │   ├── index.ts
│   │   │   ├── ActionSheet.tsx         # (~50 lines)
│   │   │   ├── ActionSheet.styles.ts   # (~40 lines)
│   │   │   └── ActionSheetItem.tsx     # (~30 lines)
│   │   ├── ImageViewerModal/
│   │   │   ├── index.ts
│   │   │   ├── ImageViewerModal.tsx    # (~50 lines)
│   │   │   └── ImageViewerModal.styles.ts # (~40 lines)
│   │   └── LoadingModal/
│   │       ├── index.ts
│   │       ├── LoadingModal.tsx        # (~30 lines)
│   │       └── LoadingModal.styles.ts  # (~25 lines)
│   │
│   ├── feedback/
│   │   ├── index.ts                    # (~10 lines)
│   │   ├── Toast/
│   │   │   ├── index.ts
│   │   │   ├── Toast.tsx               # (~50 lines)
│   │   │   └── Toast.styles.ts         # (~45 lines)
│   │   ├── LoadingIndicator/
│   │   │   ├── index.ts
│   │   │   ├── LoadingIndicator.tsx    # (~35 lines)
│   │   │   └── LoadingIndicator.styles.ts # (~25 lines)
│   │   ├── EmptyState/
│   │   │   ├── index.ts
│   │   │   ├── EmptyState.tsx          # (~45 lines)
│   │   │   └── EmptyState.styles.ts    # (~35 lines)
│   │   ├── ErrorState/
│   │   │   ├── index.ts
│   │   │   ├── ErrorState.tsx          # (~45 lines)
│   │   │   └── ErrorState.styles.ts    # (~35 lines)
│   │   ├── Skeleton/
│   │   │   ├── index.ts
│   │   │   ├── Skeleton.tsx            # (~50 lines)
│   │   │   └── Skeleton.styles.ts      # (~40 lines)
│   │   ├── ProgressBar/
│   │   │   ├── index.ts
│   │   │   ├── ProgressBar.tsx         # (~40 lines)
│   │   │   └── ProgressBar.styles.ts   # (~30 lines)
│   │   └── PullToRefresh/
│   │       ├── index.ts
│   │       ├── PullToRefresh.tsx       # (~35 lines)
│   │       └── PullToRefresh.styles.ts # (~25 lines)
│   │
│   ├── badges/
│   │   ├── index.ts                    # (~8 lines)
│   │   ├── Badge/
│   │   │   ├── index.ts
│   │   │   ├── Badge.tsx               # (~40 lines)
│   │   │   └── Badge.styles.ts         # (~35 lines)
│   │   ├── Tag/
│   │   │   ├── index.ts
│   │   │   ├── Tag.tsx                 # (~45 lines)
│   │   │   └── Tag.styles.ts           # (~35 lines)
│   │   ├── StatusBadge/
│   │   │   ├── index.ts
│   │   │   ├── StatusBadge.tsx         # (~40 lines)
│   │   │   └── StatusBadge.styles.ts   # (~35 lines)
│   │   └── RoleBadge/
│   │       ├── index.ts
│   │       ├── RoleBadge.tsx           # (~35 lines)
│   │       └── RoleBadge.styles.ts     # (~30 lines)
│   │
│   ├── navigation/
│   │   ├── index.ts                    # (~10 lines)
│   │   ├── Header/
│   │   │   ├── index.ts
│   │   │   ├── Header.tsx              # (~50 lines)
│   │   │   ├── Header.styles.ts        # (~45 lines)
│   │   │   └── HeaderAction.tsx        # (~25 lines)
│   │   ├── TabBar/
│   │   │   ├── index.ts
│   │   │   ├── TabBar.tsx              # (~45 lines)
│   │   │   ├── TabBar.styles.ts        # (~40 lines)
│   │   │   └── TabBarItem.tsx          # (~30 lines)
│   │   ├── BottomTabBar/
│   │   │   ├── index.ts
│   │   │   ├── BottomTabBar.tsx        # (~50 lines)
│   │   │   ├── BottomTabBar.styles.ts  # (~45 lines)
│   │   │   └── TabIcon.tsx             # (~30 lines)
│   │   ├── SegmentedControl/
│   │   │   ├── index.ts
│   │   │   ├── SegmentedControl.tsx    # (~50 lines)
│   │   │   └── SegmentedControl.styles.ts # (~40 lines)
│   │   └── Stepper/
│   │       ├── index.ts
│   │       ├── Stepper.tsx             # (~50 lines)
│   │       ├── Stepper.styles.ts       # (~45 lines)
│   │       └── StepItem.tsx            # (~30 lines)
│   │
│   └── layout/
│       ├── index.ts                    # (~8 lines)
│       ├── SafeAreaView/
│       │   ├── index.ts
│       │   ├── SafeAreaView.tsx        # (~25 lines)
│       │   └── SafeAreaView.styles.ts  # (~15 lines)
│       ├── ScreenContainer/
│       │   ├── index.ts
│       │   ├── ScreenContainer.tsx     # (~35 lines)
│       │   └── ScreenContainer.styles.ts # (~25 lines)
│       ├── FixedBottomContainer/
│       │   ├── index.ts
│       │   ├── FixedBottomContainer.tsx    # (~35 lines)
│       │   └── FixedBottomContainer.styles.ts # (~30 lines)
│       ├── KeyboardAvoidingContainer/
│       │   ├── index.ts
│       │   ├── KeyboardAvoidingContainer.tsx   # (~40 lines)
│       │   └── KeyboardAvoidingContainer.styles.ts # (~25 lines)
│       ├── Divider/
│       │   ├── index.ts
│       │   └── Divider.tsx             # (~25 lines)
│       └── Spacer/
│           ├── index.ts
│           └── Spacer.tsx              # (~20 lines)
│
└── shared/
    ├── index.ts                        # (~15 lines)
    ├── ProfileImage/
    │   ├── index.ts
    │   ├── ProfileImage.tsx            # (~45 lines)
    │   └── ProfileImage.styles.ts      # (~35 lines)
    ├── AttendanceStatusDot/
    │   ├── index.ts
    │   ├── AttendanceStatusDot.tsx     # (~35 lines)
    │   └── AttendanceStatusDot.styles.ts # (~25 lines)
    ├── TimeDisplay/
    │   ├── index.ts
    │   ├── TimeDisplay.tsx             # (~40 lines)
    │   └── TimeDisplay.styles.ts       # (~30 lines)
    ├── DateTimeDisplay/
    │   ├── index.ts
    │   ├── DateTimeDisplay.tsx         # 날짜+시간 표시 (~45 lines)
    │   └── DateTimeDisplay.styles.ts   # (~35 lines)
    ├── RelativeTime/
    │   ├── index.ts
    │   ├── RelativeTime.tsx            # 상대 시간 표시 (~50 lines)
    │   └── RelativeTime.styles.ts      # (~30 lines)
    ├── CurrencyDisplay/
    │   ├── index.ts
    │   ├── CurrencyDisplay.tsx         # 원 단위 금액 표시 (~40 lines)
    │   └── CurrencyDisplay.styles.ts   # (~30 lines)
    └── GradientHeader/
        ├── index.ts
        ├── GradientHeader.tsx          # 그라데이션 헤더 (~50 lines)
        └── GradientHeader.styles.ts    # (~40 lines)
```

---

## 컴포넌트별 상세

### Buttons (7개 컴포넌트, 14+ 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| PrimaryButton | 50 | 35 | 주요 액션 (로그인, 저장, 제출) |
| SecondaryButton | 45 | 30 | 보조 액션 (취소, 이전) |
| TextButton | 35 | 25 | 텍스트 링크 스타일 버튼 |
| IconButton | 40 | 30 | 아이콘만 있는 버튼 |
| FloatingActionButton | 50 | 35 | 플로팅 액션 버튼 |
| FixedBottomButton | 45 | 40 | 하단 고정 제출/저장 버튼 |
| ButtonGroup | 40 | 30 | 버튼 그룹 (가로 배치) |

### Inputs (11개 컴포넌트, 25+ 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| TextInput | 50 | 45 | 기본 텍스트 입력 |
| PasswordInput | 50 | 35 | 비밀번호 (보기/숨기기 토글) |
| CodeInput | 50 | 40 | 6자리 인증번호 입력 |
| TextArea | 45 | 35 | 여러 줄 입력 |
| Select | 50 | 40 | 바텀시트 드롭다운 |
| Checkbox | 40 | 30 | 체크박스 |
| RadioGroup | 45 | 35 | 라디오 버튼 그룹 |
| Switch | 40 | 30 | ON/OFF 토글 |
| SearchInput | 45 | 35 | 검색 입력 |
| DateTimePicker | 50 | 40 | 날짜/시간 선택 |

### Cards (7개 컴포넌트, 14 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| BaseCard | 35 | 30 | 기본 카드 컨테이너 |
| ListItemCard | 45 | 40 | 리스트 아이템 카드 |
| InfoCard | 50 | 40 | 정보 표시 카드 |
| SummaryCard | 45 | 40 | 요약 정보 카드 |
| StatCard | 50 | 45 | 통계 카드 |
| ActionCard | 50 | 40 | 터치 가능한 액션 카드 |
| ExpandableCard | 50 | 45 | 접기/펼치기 카드 |

### Modals (7개 컴포넌트, 17 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| BottomSheet | 50 | 45 | 바텀 시트 |
| AlertModal | 50 | 40 | 알림 다이얼로그 |
| ConfirmModal | 45 | 35 | 확인 다이얼로그 |
| FullScreenModal | 45 | 35 | 전체화면 모달 |
| ActionSheet | 50 | 40 | 액션 선택 시트 |
| ImageViewerModal | 50 | 40 | 이미지 확대 뷰어 |
| LoadingModal | 30 | 25 | 로딩 오버레이 |

### Feedback (7개 컴포넌트, 14 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| Toast | 50 | 45 | 토스트 메시지 |
| LoadingIndicator | 35 | 25 | 로딩 인디케이터 |
| EmptyState | 45 | 35 | 빈 상태 표시 |
| ErrorState | 45 | 35 | 에러 상태 표시 |
| Skeleton | 50 | 40 | 스켈레톤 로딩 |
| ProgressBar | 40 | 30 | 진행률 바 |
| PullToRefresh | 35 | 25 | 당겨서 새로고침 |

### Shared (7개 컴포넌트, 14 파일)

| 컴포넌트 | TSX | Styles | 설명 |
|----------|-----|--------|------|
| ProfileImage | 45 | 35 | 프로필 이미지 (원형/사각) |
| AttendanceStatusDot | 35 | 25 | 출퇴근 상태 점 |
| TimeDisplay | 40 | 30 | 시간 표시 (HH:mm) |
| DateTimeDisplay | 45 | 35 | 날짜+시간 표시 |
| RelativeTime | 50 | 30 | 상대 시간 (오늘/올해/작년 이전) |
| CurrencyDisplay | 40 | 30 | 원 단위 금액 (₩1,234,567) |
| GradientHeader | 50 | 40 | 그라데이션 헤더 |

---

## 주요 컴포넌트 구현 예시

### PrimaryButton.tsx (~50 lines)

```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { styles } from './PrimaryButton.styles';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: PrimaryButtonProps): JSX.Element => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={styles.loadingIndicator.color} />
      ) : (
        <Text style={[styles.title, disabled && styles.titleDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
```

### RelativeTime.tsx (~50 lines)

```typescript
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { format, isToday, isThisYear, differenceInMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';
import { styles } from './RelativeTime.styles';

interface RelativeTimeProps {
  date: Date | string;
  style?: TextStyle;
  showFull?: boolean;
}

const RelativeTime = ({ date, style, showFull = false }: RelativeTimeProps): JSX.Element => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatRelativeDateTime = (): string => {
    const now = new Date();
    
    // 1분 이내: 방금
    if (differenceInMinutes(now, dateObj) < 1) {
      return '방금';
    }
    
    // 오늘: 시간만 표시 (14:30)
    if (isToday(dateObj)) {
      return format(dateObj, 'HH:mm');
    }
    
    // 올해: 월/일 시간 (12/20 14:30)
    if (isThisYear(dateObj)) {
      return format(dateObj, 'M/d HH:mm');
    }
    
    // 작년 이전: 년/월/일 (2023/12/20)
    return format(dateObj, 'yyyy/M/d');
  };

  const formatFullDateTime = (): string => {
    return format(dateObj, 'yyyy년 M월 d일 HH:mm', { locale: ko });
  };

  return (
    <Text style={[styles.text, style]}>
      {showFull ? formatFullDateTime() : formatRelativeDateTime()}
    </Text>
  );
};

export default RelativeTime;
```

---

## 스타일 파일 작성 예시

### PrimaryButton.styles.ts (~35 lines)

```typescript
import { StyleSheet } from 'react-native';
import { ms, hp } from '@utils/responsive';
import { colors } from '@styles/colors';
import { typography } from '@styles/typography';
import { borderRadius } from '@styles/borderRadius';
import { shadows } from '@styles/shadows';

export const styles = StyleSheet.create({
  container: {
    height: hp(6.5),
    minHeight: ms(52),
    paddingHorizontal: ms(24),
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.brand,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.neutral300,
    ...shadows.none,
  },
  title: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
  },
  titleDisabled: {
    color: colors.neutral500,
  },
  loadingIndicator: {
    color: colors.white,
  },
});
```

---

## 파일 수 요약

| 카테고리 | 컴포넌트 수 | TSX 파일 | Styles 파일 | 총 파일 |
|----------|------------|----------|-------------|--------|
| Buttons | 7 | 7 | 7 | 21 |
| Inputs | 11 | 13 | 11 | 35 |
| Cards | 7 | 7 | 7 | 21 |
| Modals | 7 | 9 | 7 | 23 |
| Feedback | 7 | 7 | 7 | 21 |
| Badges | 4 | 4 | 4 | 12 |
| Navigation | 5 | 8 | 5 | 18 |
| Layout | 6 | 6 | 5 | 17 |
| Shared | 7 | 7 | 7 | 21 |
| **총계** | **61** | **68** | **60** | **189** |

