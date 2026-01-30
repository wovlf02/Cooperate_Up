# 파일 구조 설계 (File Structure Design)

> **최종 업데이트**: 2024-12-25
> **규칙 요약**: 50줄 권장 / 200줄 제한 / CSS 파일 분리 / TypeScript 표준 문법 / 인라인 스타일 금지

## 개요

이 디렉토리는 **Biz_One** 앱의 파일 구조 설계 문서를 포함합니다.
**프론트엔드(React Native)**와 **백엔드(Spring Boot)** 모두의 파일 구조가 정의되어 있습니다.

---

## 📁 문서 구조

```
file_structure/
├── README.md                    # 개요 (이 파일)
│
├── front/                       # 프론트엔드 (React Native)
│   ├── 00-overview.md          # 전체 프로젝트 구조 개요
│   ├── 01-common.md            # 공통 컴포넌트
│   ├── 02-auth.md              # 인증 도메인
│   ├── ...                     # (기타 도메인)
│   └── 13-payroll.md           # 급여 관리 도메인
│
└── back/                        # 백엔드 (Spring Boot)
    ├── README.md               # 백엔드 개요
    ├── 00-spring-initializr.md # Spring Boot 프로젝트 초기화 가이드
    ├── 01-overview.md          # 전체 백엔드 구조 개요
    ├── 02-user.md              # 사용자 도메인
    ├── 03-auth.md              # 인증 도메인
    ├── 04-workplace.md         # 사업장 도메인
    ├── ...                     # (기타 도메인)
    ├── 16-global.md            # 전역 설정
    └── 17-infra.md             # 외부 인프라 연동
```

---

## 🔗 빠른 링크

### 백엔드 (Spring Boot)

- **[백엔드 개요](./back/README.md)** - 백엔드 전체 문서 안내
- **[Spring Initializr 가이드](./back/00-spring-initializr.md)** - 프로젝트 생성 및 의존성 설정
- **[전체 구조](./back/01-overview.md)** - 패키지 구조 및 규칙

### 프론트엔드 (React Native)

프론트엔드 파일 구조는 아래 "프론트엔드 문서 구조" 섹션을 참조하세요.

---

## 📱 프론트엔드 문서 구조

```
front/
├── 00-overview.md              # 전체 프로젝트 구조 개요
├── 01-common.md                # 공통 컴포넌트
├── 02-auth.md                  # 인증 도메인 [수정: 인증번호 방식]
├── 03-home.md                  # 홈 도메인
├── 04-attendance.md            # 출퇴근 도메인 [수정: 하단 버튼 고정]
├── 05-calendar.md              # 캘린더 도메인 [수정: 출퇴근 시간 표시]
├── 06-checklist.md             # 체크리스트 도메인
├── 07-announcement.md          # 공지사항 도메인 [수정: 등록일시 표시]
├── 08-chat.md                  # 채팅 도메인 [수정: 시간/뱃지 레이아웃]
├── 09-settings.md              # 설정 도메인 [수정: 저장 버튼 고정]
├── 10-admin.md                 # 관리자 도메인 [수정: 원 단위 급여]
├── 11-workplace.md             # 사업장 관리 도메인
├── 12-contract.md              # 근로계약서 도메인 [수정: 표준 양식]
└── 13-payroll.md               # 급여 관리 도메인
```

---

## 🚨 핵심 규칙

### 1. 라인 수 제한

| 분류 | 권장 | 최대 | 초과 시 조치 |
|------|------|------|-------------|
| 컴포넌트 (.tsx) | **50줄** | 200줄 | 파일 분리 필수 |
| 스크린 (.tsx) | **100줄** | 200줄 | 섹션별 분리 |
| 스타일 (.styles.ts) | **40줄** | 100줄 | 컴포넌트별 분리 |
| 훅 (.ts) | **50줄** | 150줄 | 로직 분리 |
| 유틸리티 (.ts) | **40줄** | 100줄 | 기능별 분리 |

### 2. 스타일 분리 (인라인 금지)

```typescript
// ❌ 금지: 인라인 스타일
<View style={{ padding: 10, marginTop: 20 }}>

// ✅ 필수: 스타일 파일 분리
// ComponentName.styles.ts
import { StyleSheet } from 'react-native';
import { wp, hp, fs } from '@utils/responsive';
import { colors } from '@styles/colors';

export const styles = StyleSheet.create({
  container: {
    padding: wp(2.5),
    marginTop: hp(2),
  },
});

// ComponentName.tsx
import { styles } from './ComponentName.styles';
<View style={styles.container}>
```

### 3. TypeScript 표준 문법

```typescript
// ✅ 필수: 인터페이스 정의
interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

// ✅ 필수: React.FC 사용
const Component: React.FC<Props> = ({ title, onPress, isLoading = false }) => {
  return <View style={styles.container}>...</View>;
};

// ✅ 필수: export default
export default Component;
```

### 4. 컴포넌트 파일 분리

```
components/
├── ComponentName/
│   ├── index.ts                # export (~3 lines)
│   ├── ComponentName.tsx       # 메인 컴포넌트 (~50 lines)
│   ├── ComponentName.styles.ts # 스타일 (~40 lines)
│   ├── ComponentName.types.ts  # 타입 (~20 lines, 선택)
│   ├── SubComponent.tsx        # 하위 컴포넌트 (~40 lines)
│   └── SubComponent.styles.ts  # 하위 스타일 (~30 lines)
```

---

## 📌 최근 변경사항 (2024-12-25)

| 도메인 | 변경 내용 | 신규 컴포넌트 |
|--------|----------|--------------|
| **auth** | 비밀번호 재설정을 인증번호 방식으로 변경 | `VerificationCodeInput`, `ResendTimer`, `EmailInputStep`, `VerifyCodeStep`, `NewPasswordStep`, `ResetCompleteStep` |
| **attendance** | 제출 버튼을 하단 고정으로 변경 | `FixedSubmitButton` |
| **calendar** | 날짜 셀에 출퇴근 시간 표시, 요일별 색상 | `AttendanceTime`, `DayNumber`, `WeekDayHeader` |
| **announcement** | 등록일시 표시 형식 개선 (오늘/올해/작년 이전) | `CardDateTime`, `CommentDateTime`, `ReplyItem` |
| **chat** | 시간 우측 상단, 뱃지 하단 배치 | `RoomInfo`, `RoomMeta` |
| **settings** | 프로필 저장 버튼 하단 고정 | `FixedSaveButton` |
| **admin** | 급여를 원 단위로 전체 표시 | `DailyWorkRow`, `FullCurrencyDisplay` |
| **contract** | 표준 양식 자동완성, 편집 가능 필드 | `EditableContractField`, `EmptyField`, `FilledField`, `ContractProgressBar`, `InlineEditModal`, `StandardContractTemplate` |

---

## 도메인별 요약

| 도메인 | 스크린 수 | 컴포넌트 수 | 훅 수 | 주요 기능 |
|--------|----------|------------|-------|----------|
| common | - | 35+ | - | 재사용 UI 컴포넌트 |
| auth | 3 | 7 | 5 | 로그인, 회원가입, 비밀번호 재설정 |
| home | 2 | 10 | 3 | 근무자/관리자 홈 |
| attendance | 3 | 10 | 5 | 출퇴근, 수동입력, 수정요청 |
| calendar | 2 | 8 | 3 | 월별 캘린더, 일별 상세 |
| checklist | 2 | 5 | 3 | 업무 체크리스트 |
| announcement | 3 | 8 | 4 | 공지 목록/상세/작성 |
| chat | 2 | 12 | 4 | 채팅 목록/메시지 |
| settings | 4 | 8 | 3 | 설정, 프로필, 알림, 비밀번호 |
| admin | 5 | 10 | 6 | 근무자/승인/급여 관리 |
| workplace | 6 | 8 | 4 | 사업장 등록/관리 |
| contract | 5 | 12 | 7 | 전자 근로계약서 |
| payroll | 5 | 8 | 4 | 급여 계산/명세서 |

---

## 네이밍 규칙

### 파일명

| 항목 | 규칙 | 예시 |
|------|------|------|
| 스크린 | `{Name}Screen.tsx` | `LoginScreen.tsx` |
| 컴포넌트 | `{Name}.tsx` | `TodayWorkCard.tsx` |
| 스타일 | `{Name}.styles.ts` | `LoginScreen.styles.ts` |
| 훅 | `use{Name}.ts` | `useAttendance.ts` |
| 타입 | `{name}.types.ts` | `attendance.types.ts` |
| 상수 | `{name}.constants.ts` | `auth.constants.ts` |
| 유틸 | `{name}Utils.ts` | `dateUtils.ts` |

### 컴포넌트명

- **PascalCase** 사용
- 기능을 명확히 나타내는 이름
- 접미사로 역할 표시: `Card`, `List`, `Item`, `Modal`, `Input`, `Button`, `Display` 등

---

## Import 규칙

```typescript
// 1. React / React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. 외부 라이브러리
import { useNavigation } from '@react-navigation/native';

// 3. 절대 경로 (공통 컴포넌트, 스타일, 유틸)
import { Button, Card } from '@components/common';
import { colors } from '@styles/colors';
import { wp, hp, fs } from '@utils/responsive';

// 4. 상대 경로 (같은 도메인)
import { TodayWorkCard } from '../components';
import { useHomeData } from '../hooks';
import { styles } from './HomeScreen.styles';
```

---

## 관련 문서

- [화면 설계서](../../05_screens/overview.md)
- [Firestore 스키마](../../04_database/firestore-schema.md)
- [코딩 컨벤션](../../06_development/coding-conventions.md)
