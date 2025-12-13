# 🧩 대시보드 위젯

## 개요

대시보드에 표시되는 위젯 컴포넌트들입니다.

**파일 위치**: `src/components/dashboard/widgets/`

---

## 위젯 목록

| 위젯 | 파일 | 설명 |
|------|------|------|
| StudyStatus | StudyStatus.jsx | 스터디 현황 |
| OnlineMembers | OnlineMembers.jsx | 온라인 멤버 |
| QuickActions | QuickActions.jsx | 빠른 액션 |
| UrgentTasks | UrgentTasks.jsx | 긴급 할일 |
| PinnedNotice | PinnedNotice.jsx | 고정 공지 |

---

## StudyStatus (스터디 현황)

### 기능

- 다음 일정 D-day 표시
- 출석률 프로그레스 바
- 할일 완료율 프로그레스 바
- 연속 활동 일수

### Props

```typescript
interface StudyStatusProps {
  stats?: {
    attendedCount?: number;
    totalAttendance?: number;
    completedTasks?: number;
    totalTasks?: number;
    streakDays?: number;
  };
  nextEvent?: {
    dday: number;
    date: string;
    title: string;
  } | null;
  isLoading?: boolean;
}
```

### 예시

```jsx
<StudyStatus
  stats={{
    attendedCount: 17,
    totalAttendance: 20,
    completedTasks: 15,
    totalTasks: 20,
    streakDays: 7
  }}
  nextEvent={{
    dday: 3,
    date: "12월 15일 (월)",
    title: "정기 모임"
  }}
/>
```

### 유틸리티

```javascript
// 안전한 퍼센트 계산
function safePercentage(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  const result = (numerator / denominator) * 100;
  return Math.min(Math.max(result, 0), 100);
}
```

---

## QuickActions (빠른 액션)

### 기능

- 채팅 시작 링크
- 화상 스터디 버튼
- 멤버 초대 (클립보드 복사)
- 통계 보기 링크
- 설정 (관리자만)

### Props

```typescript
interface QuickActionsProps {
  isAdmin?: boolean;
  isLoading?: boolean;
}
```

### 초대 링크 복사

```javascript
const handleInvite = useCallback(async () => {
  const inviteLink = `${window.location.origin}/invite?code=SAMPLE`;
  
  try {
    await navigator.clipboard.writeText(inviteLink);
    alert('초대 링크가 복사되었습니다!');
  } catch (clipboardError) {
    // 폴백: execCommand 사용
    const textarea = document.createElement('textarea');
    textarea.value = inviteLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('초대 링크가 복사되었습니다!');
  }
}, []);
```

---

## UrgentTasks (긴급 할일)

### 기능

- 3일 이내 마감 할일 표시
- D-day 계산
- 긴급도 색상 표시 (🔴🟠🟡🟢)

### Props

```typescript
interface UrgentTasksProps {
  tasks?: Task[];
  isLoading?: boolean;
}
```

### 긴급 할일 필터링

```javascript
const urgentTasks = useMemo(() => {
  return (tasks || [])
    .filter(task => {
      if (task.completed) return false;
      const daysUntilDue = calculateDaysUntilDue(task.dueDate);
      if (daysUntilDue === null) return false;
      return daysUntilDue >= 0 && daysUntilDue <= 3;
    })
    .sort((a, b) => {
      const aDays = calculateDaysUntilDue(a.dueDate);
      const bDays = calculateDaysUntilDue(b.dueDate);
      return aDays - bDays;
    })
    .slice(0, 3);
}, [tasks]);
```

### 긴급도 색상

```javascript
function getUrgencyColor(daysUntilDue) {
  if (daysUntilDue === 0) return '🔴';  // 오늘 마감
  if (daysUntilDue === 1) return '🟠';  // 내일 마감
  if (daysUntilDue <= 3) return '🟡';  // 3일 이내
  return '🟢';                          // 여유 있음
}
```

---

## OnlineMembers (온라인 멤버)

### 기능

- 현재 온라인 상태인 멤버 표시
- 아바타 및 이름 표시
- 마지막 활동 시간

### Props

```typescript
interface OnlineMembersProps {
  members?: {
    id: string;
    name: string;
    avatar?: string;
    lastActive?: string;
  }[];
  isLoading?: boolean;
}
```

---

## PinnedNotice (고정 공지)

### 기능

- 고정된 공지사항 표시
- 제목, 내용 미리보기
- 공지 상세 링크

### Props

```typescript
interface PinnedNoticeProps {
  notices?: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    studyName?: string;
    studyId?: string;
  }[];
  isLoading?: boolean;
}
```

---

## 공통 컴포넌트

### WidgetSkeleton

로딩 상태 표시용 스켈레톤 컴포넌트입니다.

```jsx
// 각 위젯별 스켈레톤
export function StudyStatusSkeleton() {...}
export function QuickActionsSkeleton() {...}
export function UrgentTasksSkeleton() {...}
export function OnlineMembersSkeleton() {...}
export function PinnedNoticeSkeleton() {...}
```

### WidgetErrorBoundary

위젯별 에러 경계입니다.

```jsx
<WidgetErrorBoundary fallback={<WidgetErrorFallback />}>
  <StudyStatus stats={stats} />
</WidgetErrorBoundary>
```

---

## 스타일

**파일**: `src/components/dashboard/widgets/Widget.module.css`

### 주요 클래스

| 클래스 | 설명 |
|--------|------|
| `.widget` | 위젯 컨테이너 |
| `.widgetTitle` | 위젯 제목 |
| `.widgetHeader` | 위젯 헤더 |
| `.actionButtons` | 액션 버튼 컨테이너 |
| `.actionButton` | 개별 액션 버튼 |
| `.progressBar` | 프로그레스 바 |
| `.progressFill` | 프로그레스 채움 |
| `.statItem` | 통계 항목 |
| `.statLabel` | 통계 라벨 |
| `.statValue` | 통계 값 |

---

## 메모이제이션

모든 위젯은 `memo`로 래핑되어 불필요한 리렌더링을 방지합니다.

```jsx
const StudyStatus = memo(function StudyStatusComponent(props) {
  // ...
});

export default StudyStatus;
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [예외](./exceptions.md)

