// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\00-overview.md
# 전체 프로젝트 구조 개요 (Project Structure Overview)

> **규칙**: 한 파일 50줄 권장 / 최대 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 프로젝트 루트 구조

```
BizOne/
├── src/                        # 소스 코드
│   ├── assets/                 # 정적 리소스 (이미지, 폰트)
│   ├── components/             # 공통 컴포넌트
│   ├── config/                 # 앱 설정
│   ├── features/               # 도메인별 기능 모듈
│   ├── hooks/                  # 공통 커스텀 훅
│   ├── navigation/             # 네비게이션 설정
│   ├── services/               # 비즈니스 로직/API
│   │   ├── api/                # REST API 클라이언트
│   │   │   ├── client/         # Axios 인스턴스, 인터셉터
│   │   │   ├── auth/           # 인증 API
│   │   │   ├── user/           # 사용자 API
│   │   │   ├── workplace/      # 사업장 API
│   │   │   ├── invitation/     # 초대 API
│   │   │   ├── attendance/     # 출퇴근 API
│   │   │   ├── approval/       # 승인 요청 API
│   │   │   ├── calendar/       # 캘린더 API
│   │   │   ├── checklist/      # 체크리스트 API
│   │   │   ├── task/           # 업무 수행 API
│   │   │   ├── announcement/   # 공지사항 API
│   │   │   ├── chat/           # 채팅 API
│   │   │   ├── contract/       # 근로계약서 API
│   │   │   ├── payroll/        # 급여 API
│   │   │   └── notification/   # 알림 API
│   │   └── storage/            # 로컬 저장소
│   ├── store/                  # 상태 관리 (Redux Toolkit)
│   ├── styles/                 # 전역 스타일
│   ├── types/                  # 전역 타입 정의
│   └── utils/                  # 유틸리티 함수
├── __tests__/                  # 테스트 코드
├── android/                    # Android 네이티브
├── ios/                        # iOS 네이티브
├── App.tsx                     # 앱 진입점 (~30 lines)
├── index.js                    # 엔트리 포인트
├── package.json                # 의존성
├── tsconfig.json               # TypeScript 설정
└── babel.config.js             # Babel 설정
```

---

## 파일 작성 규칙

### 1. 라인 수 제한
- **권장**: 50줄 이내
- **최대**: 200줄 (초과 시 파일 분리 필수)
- **스타일 파일**: 100줄 이내

### 2. 파일 분리 원칙
```
components/
├── ComponentName/
│   ├── index.ts                # re-export (~3-5 lines)
│   ├── ComponentName.tsx       # 메인 컴포넌트 (~50 lines)
│   ├── ComponentName.styles.ts # 스타일 정의 (~40 lines)
│   ├── ComponentName.types.ts  # 타입 정의 (~20 lines, 선택)
│   ├── SubComponent.tsx        # 하위 컴포넌트 (~40 lines, 선택)
│   └── SubComponent.styles.ts  # 하위 스타일 (~30 lines, 선택)
```

### 3. TypeScript 표준 문법 (최신 버전)
```typescript
// ✅ 올바른 사용 - TypeScript 5.x 기준
interface ComponentProps {
  title: string;
  onPress: () => void;
  children?: React.ReactNode;
}

const Component = ({ title, onPress, children }: ComponentProps): JSX.Element => {
  return <View style={styles.container}>{children}</View>;
};

export default Component;

// ✅ const assertion 활용
const COLORS = {
  primary: '#0EA5E9',
  secondary: '#3B82F6',
} as const;

// ✅ satisfies 연산자 활용
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} satisfies AppConfig;

// ❌ 금지: 인라인 스타일
<View style={{ padding: 10, marginTop: 20 }}>  // 금지
```

### 4. 스타일 분리 (인라인 금지)
```typescript
// ComponentName.styles.ts
import { StyleSheet } from 'react-native';
import { ms, wp, hp } from '@utils/responsive';
import { colors } from '@styles/colors';
import { spacing } from '@styles/spacing';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.space4,
    marginTop: spacing.space2,
    backgroundColor: colors.white,
  },
});
```

---

## src/ 디렉토리 상세 구조

```
src/
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   └── icons/
│   └── fonts/
│
├── components/
│   ├── common/                 # 재사용 컴포넌트 (40+ 파일)
│   └── shared/                 # 도메인 간 공유 컴포넌트
│
├── features/
│   ├── auth/                   # 인증 (3 screens, 8+ components)
│   ├── home/                   # 홈 (2 screens, 12+ components)
│   ├── workplace/              # 사업장 관리
│   ├── attendance/             # 출퇴근
│   ├── calendar/               # 캘린더
│   ├── checklist/              # 체크리스트
│   ├── payroll/                # 급여 관리
│   ├── contract/               # 근로계약서
│   ├── announcement/           # 공지사항
│   ├── chat/                   # 채팅
│   ├── settings/               # 설정
│   └── admin/                  # 관리자
│
├── hooks/
│   ├── useAuth.ts              # (~40 lines)
│   ├── useApi.ts               # (~45 lines)
│   ├── useLocation.ts          # (~40 lines)
│   └── index.ts
│
├── navigation/
│   ├── RootNavigator.tsx       # (~40 lines)
│   ├── AuthNavigator.tsx       # (~30 lines)
│   ├── MainNavigator.tsx       # (~50 lines)
│   ├── TabNavigator.tsx        # (~45 lines)
│   └── types.ts                # (~40 lines)
│
├── services/
│   ├── api/                    # REST API 클라이언트 (14 도메인)
│   │   ├── client/             # Axios 인스턴스, 인터셉터, 토큰 관리
│   │   ├── auth/               # 인증 API (login, signup, refresh, logout)
│   │   ├── user/               # 사용자 API (profile, password)
│   │   ├── workplace/          # 사업장 API (CRUD, members)
│   │   ├── invitation/         # 초대 API (list, accept, reject)
│   │   ├── attendance/         # 출퇴근 API (clock-in/out, records)
│   │   ├── approval/           # 승인 요청 API (list, approve, reject)
│   │   ├── calendar/           # 캘린더 API (monthly, daily, summary)
│   │   ├── checklist/          # 체크리스트 API (templates, tasks)
│   │   ├── task/               # 업무 수행 API (complete, skip)
│   │   ├── announcement/       # 공지사항 API (CRUD, comments)
│   │   ├── chat/               # 채팅 API (rooms, messages)
│   │   ├── contract/           # 근로계약서 API (CRUD, sign)
│   │   ├── payroll/            # 급여 API (list, calculate, confirm)
│   │   └── notification/       # 알림 API (list, read, settings)
│   └── storage/                # 로컬 저장소 (secure, async)
│
├── store/
│   ├── index.ts                # (~30 lines)
│   ├── hooks.ts                # (~15 lines)
│   └── slices/
│       ├── authSlice.ts        # (~60 lines)
│       ├── userSlice.ts        # (~50 lines)
│       └── workplaceSlice.ts   # (~55 lines)
│
├── styles/
│   ├── colors.ts               # (~60 lines)
│   ├── typography.ts           # (~50 lines)
│   ├── spacing.ts              # (~30 lines)
│   ├── shadows.ts              # (~35 lines)
│   ├── borderRadius.ts         # (~20 lines)
│   └── index.ts
│
├── types/
│   ├── user.types.ts           # (~40 lines)
│   ├── workplace.types.ts      # (~35 lines)
│   ├── navigation.types.ts     # (~50 lines)
│   └── index.ts
│
└── utils/
    ├── responsive.ts           # (~45 lines)
    ├── dateUtils.ts            # (~70 lines)
    ├── formatUtils.ts          # (~60 lines)
    ├── validationUtils.ts      # (~50 lines)
    └── index.ts
```

---

## Feature 모듈 구조

각 Feature는 일관된 구조를 따릅니다:

```
features/{domain}/
├── index.ts                    # 모듈 export (~10 lines)
├── screens/
│   ├── index.ts
│   └── {ScreenName}/
│       ├── index.ts            # export (~3 lines)
│       ├── {ScreenName}.tsx    # 화면 컴포넌트 (~100 lines max)
│       └── {ScreenName}.styles.ts  # 스타일 (~50 lines)
├── components/
│   ├── index.ts
│   └── {ComponentName}/
│       ├── index.ts            # export (~3 lines)
│       ├── {ComponentName}.tsx # 컴포넌트 (~50 lines)
│       └── {ComponentName}.styles.ts  # 스타일 (~40 lines)
├── hooks/
│   ├── use{Name}.ts            # 커스텀 훅 (~50 lines)
│   └── index.ts
├── types/
│   └── {domain}.types.ts       # 타입 정의 (~40 lines)
├── constants/
│   └── {domain}.constants.ts   # 상수 (~25 lines)
└── utils/
    └── {domain}Utils.ts        # 도메인 유틸 (~40 lines, 선택)
```

---

## 도메인별 Feature 요약

| 도메인 | 디렉토리 | 스크린 수 | 컴포넌트 수 | 주요 기능 |
|--------|---------|----------|------------|----------|
| 공통 | `components/common` | - | 45+ | 버튼, 입력, 모달, 피드백 등 |
| 인증 | `features/auth` | 3 | 8 | 로그인, 회원가입, 비밀번호 재설정 |
| 홈 | `features/home` | 2 | 12 | 관리자/근무자 대시보드 |
| 출퇴근 | `features/attendance` | 3 | 12 | GPS 출퇴근, 수동입력, 수정요청 |
| 캘린더 | `features/calendar` | 2 | 8 | 월간 근무현황, 일별 상세 |
| 체크리스트 | `features/checklist` | 2 | 8 | 근무자 체크, 관리자 모니터링 |
| 공지사항 | `features/announcement` | 3 | 10 | 목록, 상세, 작성 |
| 채팅 | `features/chat` | 2 | 14 | 채팅방 목록, 채팅 화면 |
| 설정 | `features/settings` | 4 | 10 | 메인, 프로필, 알림, 비밀번호 |
| 관리자 | `features/admin` | 6 | 12 | 직원관리, 승인, 급여 |
| 근로계약서 | `features/contract` | 5 | 14 | 목록, 상세, 작성, 서명 |
| 급여 | `features/payroll` | 4 | 10 | 급여명세, 계산, 지급 |
| 사업장 | `features/workplace` | 5 | 10 | 생성, 관리, 위치설정 |

---

## 경로 별칭 (Path Alias)

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@store/*": ["src/store/*"],
      "@styles/*": ["src/styles/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@navigation/*": ["src/navigation/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

---

## TypeScript 설정 (최신 버전)

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

---

## 코드 품질 규칙

### ESLint 설정
- `@typescript-eslint/recommended`
- `react-hooks/exhaustive-deps`
- `no-inline-styles` (custom rule)

### Prettier 설정
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 파일별 최대 라인 수 가이드

| 파일 유형 | 권장 | 최대 |
|----------|------|------|
| Screen | 80 | 150 |
| Component | 50 | 100 |
| Hook | 50 | 80 |
| Style | 50 | 100 |
| Types | 40 | 80 |
| Utils | 60 | 100 |
| Constants | 25 | 50 |
| Service | 80 | 150 |

---

## 관련 문서

### 파일 구조 문서

| 문서 | 설명 |
|------|------|
| [01-common.md](./01-common.md) | 공통 컴포넌트 파일 구조 |
| [02-auth.md](./02-auth.md) | 인증 도메인 파일 구조 |
| [03-home.md](./03-home.md) | 홈 도메인 파일 구조 |
| [04-attendance.md](./04-attendance.md) | 출퇴근 도메인 파일 구조 |
| [05-calendar.md](./05-calendar.md) | 캘린더 도메인 파일 구조 |
| [06-checklist.md](./06-checklist.md) | 체크리스트 도메인 파일 구조 |
| [07-announcement.md](./07-announcement.md) | 공지사항 도메인 파일 구조 |
| [08-chat.md](./08-chat.md) | 채팅 도메인 파일 구조 |
| [09-settings.md](./09-settings.md) | 설정 도메인 파일 구조 |
| [10-admin.md](./10-admin.md) | 관리자 도메인 파일 구조 |
| [11-workplace.md](./11-workplace.md) | 사업장 도메인 파일 구조 |
| [12-contract.md](./12-contract.md) | 근로계약서 도메인 파일 구조 |
| [13-payroll.md](./13-payroll.md) | 급여 도메인 파일 구조 |
| [14-services-api.md](./14-services-api.md) | **API 서비스 파일 구조** |

### API 명세 문서

| 문서 | 설명 |
|------|------|
| [00-common.md](../../13_api/00-common.md) | 공통 API 규격 |
| [01-auth.md](../../13_api/01-auth.md) | 인증 API |
| [02-user.md](../../13_api/02-user.md) | 사용자 API |
| [03-workplace.md](../../13_api/03-workplace.md) | 사업장 API |
| [04-invitation.md](../../13_api/04-invitation.md) | 초대 API |
| [05-attendance.md](../../13_api/05-attendance.md) | 출퇴근 API |
| [06-approval.md](../../13_api/06-approval.md) | 승인 요청 API |
| [07-calendar.md](../../13_api/07-calendar.md) | 캘린더 API |
| [08-checklist.md](../../13_api/08-checklist.md) | 체크리스트 API |
| [10-announcement.md](../../13_api/10-announcement.md) | 공지사항 API |
| [11-chat.md](../../13_api/11-chat.md) | 채팅 API |
| [12-contract.md](../../13_api/12-contract.md) | 근로계약서 API |
| [13-payroll.md](../../13_api/13-payroll.md) | 급여 API |
| [15-notification.md](../../13_api/15-notification.md) | 알림 API |
