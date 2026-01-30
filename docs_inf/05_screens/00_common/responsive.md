# 반응형 유틸리티 (Responsive Utilities)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

다양한 화면 크기의 디바이스에서 일관된 UI/UX를 제공하기 위한 반응형 유틸리티입니다.

### 🎯 UX 목표
- **일관성**: 모든 기기에서 동일한 경험
- **가독성**: 적절한 크기의 텍스트와 터치 영역
- **최적화**: 기기별 최적의 레이아웃

---

## 1. 기본 유틸리티 코드

```typescript
// utils/responsive.ts

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 기준 디자인 (iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * 화면 너비 기준 비율 계산
 * @param percentage 화면 너비의 비율 (0-100)
 */
export const wp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_WIDTH;
};

/**
 * 화면 높이 기준 비율 계산
 * @param percentage 화면 높이의 비율 (0-100)
 */
export const hp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_HEIGHT;
};

/**
 * 기준 디자인 대비 스케일 계산 (너비 기준)
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * 기준 디자인 대비 스케일 계산 (높이 기준)
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * 적당한 스케일 계산 (급격한 변화 방지)
 * @param size 기준 크기
 * @param factor 스케일 팩터 (0-1, 기본 0.5)
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Alias
export const ms = moderateScale;

/**
 * 폰트 스케일 (factor 0.3 적용)
 */
export const fs = (size: number): number => {
  return moderateScale(size, 0.3);
};
```

---

## 2. 디바이스 타입 체크

```typescript
// 디바이스 크기 분류
export const isSmallDevice = SCREEN_WIDTH < 375;     // iPhone SE 등
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;  // iPhone 12/13/14
export const isLargeDevice = SCREEN_WIDTH >= 414;    // iPhone Plus/Max/Pro Max

// 태블릿 체크
export const isTablet = SCREEN_WIDTH >= 768;

// 고해상도 기기 체크
export const isHighDensity = PixelRatio.get() >= 3;

/**
 * 디바이스 크기에 따른 값 선택
 */
export const responsive = <T>(small: T, medium: T, large: T): T => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

/**
 * 태블릿 여부에 따른 값 선택
 */
export const tabletResponsive = <T>(phone: T, tablet: T): T => {
  return isTablet ? tablet : phone;
};
```

---

## 3. SafeArea 유틸리티

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 상수 값 (useSafeAreaInsets 사용 권장)
export const getBottomSpace = (): number => {
  return Platform.OS === 'ios' ? (SCREEN_HEIGHT >= 812 ? 34 : 0) : 0;
};

export const getTopSpace = (): number => {
  return Platform.OS === 'ios' ? (SCREEN_HEIGHT >= 812 ? 47 : 20) : 0;
};

export const getStatusBarHeight = (): number => {
  return Platform.OS === 'ios' 
    ? (SCREEN_HEIGHT >= 812 ? 47 : 20) 
    : 24;
};

// Hook 사용 (권장)
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    safeAreaTop: Math.max(insets.top, 20),
    safeAreaBottom: Math.max(insets.bottom, 20),
  };
};
```

---

## 4. 레이아웃 상수

```typescript
// layout/constants.ts

export const layout = {
  // 화면 패딩
  screenPadding: wp(4),         // 화면 좌우 여백
  screenPaddingLarge: wp(6),    // 넓은 여백 필요 시
  
  // 컨텐츠 너비
  maxContentWidth: ms(500),     // 태블릿 대응 최대 너비
  
  // 헤더/탭바
  headerHeight: ms(56),
  tabBarHeight: ms(80),
  
  // 카드/버튼
  buttonHeight: ms(52),
  buttonHeightSmall: ms(44),
  cardBorderRadius: ms(16),
  
  // 입력 필드
  inputHeight: ms(52),
  textAreaMinHeight: ms(120),
};

// 사용 예시
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPadding,
  },
  button: {
    height: layout.buttonHeight,
  },
});
```

---

## 5. 간격 시스템 (Spacing)

```typescript
// layout/spacing.ts

// 4px 기반 간격 시스템
export const spacing = {
  space1: ms(4),    // 아주 좁은 간격
  space2: ms(8),    // 좁은 간격
  space3: ms(12),   // 작은 간격
  space4: ms(16),   // 기본 간격
  space5: ms(20),   // 중간 간격
  space6: ms(24),   // 넓은 간격
  space8: ms(32),   // 큰 간격
  space10: ms(40),  // 매우 큰 간격
  space12: ms(48),  // 섹션 간격
  space16: ms(64),  // 대형 섹션 간격
};

// 사용 예시
const styles = StyleSheet.create({
  container: {
    padding: spacing.space4,
    gap: spacing.space3,
  },
  section: {
    marginBottom: spacing.space6,
  },
});
```

---

## 6. BorderRadius 시스템

```typescript
// layout/borderRadius.ts

export const borderRadius = {
  none: 0,
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  '2xl': ms(24),
  '3xl': ms(32),
  full: 9999,      // 원형 (pill)
};

// 사용 예시
const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,  // 16px
  },
  card: {
    borderRadius: borderRadius.xl,  // 20px
  },
  avatar: {
    borderRadius: borderRadius.full, // 원형
  },
});
```

---

## 7. 그림자 시스템 (Shadows)

```typescript
// layout/shadows.ts

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 사용 예시
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  floatingButton: {
    ...shadows.lg,
  },
});
```

---

## 8. 사용 예시

### 8.1 스타일 정의

```typescript
import { wp, hp, ms, fs, responsive } from '@/utils/responsive';
import { layout, spacing, borderRadius, shadows } from '@/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
  },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    ...shadows.md,
  },
  
  title: {
    fontSize: fs(18),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.space2,
  },
  
  button: {
    height: layout.buttonHeight,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 디바이스 크기별 분기
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.space3,
  },
  
  gridItem: {
    width: responsive(
      wp(100) - layout.screenPadding * 2,  // small: 1열
      (wp(100) - layout.screenPadding * 2 - spacing.space3) / 2,  // medium: 2열
      (wp(100) - layout.screenPadding * 2 - spacing.space3 * 2) / 3  // large: 3열
    ),
  },
});
```

### 8.2 조건부 스타일

```typescript
import { isSmallDevice, isTablet, responsive } from '@/utils/responsive';

const ComponentStyles = {
  // 디바이스 크기별 폰트
  title: {
    fontSize: responsive(fs(16), fs(18), fs(20)),
  },
  
  // 태블릿 분기
  container: {
    maxWidth: isTablet ? ms(600) : '100%',
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  
  // 작은 기기 대응
  padding: {
    paddingHorizontal: isSmallDevice ? spacing.space3 : spacing.space4,
  },
};
```

### 8.3 중앙 정렬 레이아웃 (로그인 등)

```typescript
// 전체 화면을 사용하지 않는 화면용
const centeredLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    paddingHorizontal: layout.screenPadding,
  },
  
  contentBox: {
    width: '100%',
    maxWidth: ms(400),  // 태블릿 대응
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.space6,
    ...shadows.lg,
  },
});
```

---

## 9. 터치 영역 최적화

```typescript
// 최소 터치 영역
export const touchArea = {
  minimum: ms(44),    // Apple HIG 권장
  comfortable: ms(48), // 여유로운 터치 영역
  large: ms(56),      // 대형 버튼
};

// hitSlop 유틸리티
export const getHitSlop = (size: number = 10) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

// 사용 예시
<TouchableOpacity
  style={{ width: ms(24), height: ms(24) }}
  hitSlop={getHitSlop(12)}  // 실제 터치 영역 확장
>
  <Icon />
</TouchableOpacity>
```

---

## 10. 화면 방향 대응

```typescript
import { useWindowDimensions } from 'react-native';

export const useOrientation = () => {
  const { width, height } = useWindowDimensions();
  
  return {
    isPortrait: height >= width,
    isLandscape: width > height,
    screenWidth: width,
    screenHeight: height,
  };
};

// 사용 예시
const MyComponent = () => {
  const { isPortrait, screenWidth } = useOrientation();
  
  return (
    <View style={{
      flexDirection: isPortrait ? 'column' : 'row',
      paddingHorizontal: isPortrait ? wp(4) : wp(8),
    }}>
      {/* content */}
    </View>
  );
};
```

---

## 참고: 디바이스별 화면 크기

| 디바이스 | 너비 | 높이 | 분류 |
|---------|------|------|------|
| iPhone SE | 375 | 667 | Small |
| iPhone 14 | 390 | 844 | Medium |
| iPhone 14 Pro | 393 | 852 | Medium |
| iPhone 14 Plus | 428 | 926 | Large |
| iPhone 14 Pro Max | 430 | 932 | Large |
| iPad Mini | 744 | 1133 | Tablet |
| iPad Pro 11" | 834 | 1194 | Tablet |
