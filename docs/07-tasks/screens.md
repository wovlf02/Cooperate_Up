# 📱 할일 화면

## 개요

할일 관리를 위한 화면 구성입니다.

---

## 화면 목록

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/tasks/page.jsx` | `/tasks` | 내 할일 목록 |
| `src/app/my-studies/[studyId]/tasks/page.jsx` | `/my-studies/[id]/tasks` | 스터디 할일 |

---

## /tasks - 내 할일 목록

개인 할일을 관리하는 메인 화면입니다.

### 레이아웃

```
┌──────────────────────────────────────────────────┐
│ 필터/뷰 모드 토글                    [+ 새 할일]│
├──────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────────────────────┐│
│ │ 사이드바      │ │ 할일 목록 (리스트/캘린더)    ││
│ │              │ │                              ││
│ │ • 오늘 할일   │ │ 🔥 긴급                     ││
│ │ • 진행률      │ │   [TaskCard]                 ││
│ │ • 스터디별    │ │   [TaskCard]                 ││
│ │              │ │                              ││
│ │              │ │ 📅 이번 주                   ││
│ │              │ │   [TaskCard]                 ││
│ │              │ │   ...                        ││
│ └──────────────┘ └──────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### 주요 기능

1. **필터링**: 스터디별, 상태별, 정렬 기준
2. **뷰 모드**: 리스트/캘린더 전환
3. **그룹화**: 긴급/이번 주/나중에
4. **CRUD**: 생성/수정/삭제
5. **완료 토글**: 체크박스로 빠른 완료

### 상태 관리

```javascript
const [filter, setFilter] = useState({
  studyId: null,
  status: 'all',
  sortBy: 'deadline',
})
const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
const [showCreateModal, setShowCreateModal] = useState(false)
const [showEditModal, setShowEditModal] = useState(false)
const [editingTask, setEditingTask] = useState(null)
const [selectedTask, setSelectedTask] = useState(null)
```

### API 호출

```javascript
// 할일 목록
const { data: tasksData, isLoading } = useTasks(apiParams)

// 통계
const { data: statsData } = useTaskStats()

// 완료 토글
const toggleTask = useToggleTask()

// 삭제
const deleteTask = useDeleteTask()
```

### 그룹화 로직

```javascript
const groupedTasks = useMemo(() => {
  const urgent = []
  const thisWeek = []
  const later = []

  filteredTasks.forEach(task => {
    const urgency = getUrgencyLevel(task.dueDate)
    if (urgency === 'urgent') {
      urgent.push(task)
    } else if (urgency === 'thisWeek') {
      thisWeek.push(task)
    } else {
      later.push(task)
    }
  })

  return { urgent, thisWeek, later }
}, [filteredTasks])
```

---

## /my-studies/[id]/tasks - 스터디 할일

스터디 내 공동 할일을 관리합니다.

### 추가 기능

- 담당자 지정/변경
- 상태 전환 규칙 적용
- 멤버별 필터링

---

## 사이드바 위젯

### TodayTasksWidget

오늘 마감인 할일을 표시합니다.

```jsx
<TodayTasksWidget
  tasks={tasks}
  onTaskClick={handleTaskClick}
/>
```

### TaskProgressWidget

할일 진행률을 표시합니다.

```jsx
<TaskProgressWidget
  stats={taskStats}
/>
```

### TaskByStudyWidget

스터디별 할일 통계를 표시합니다.

```jsx
<TaskByStudyWidget
  tasks={tasks}
  onStudyClick={handleStudyClick}
/>
```

---

## 모달

### TaskCreateModal

새 할일 생성 모달입니다.

**필드**:
- 제목 (필수)
- 설명
- 스터디 선택
- 마감일 (필수)
- 우선순위
- 담당자 (스터디 선택 시)

### TaskEditModal

할일 수정 모달입니다.

### TaskDetailModal

할일 상세 정보 모달입니다.

### TaskDayModal

캘린더에서 특정 날짜 클릭 시 해당 날짜 할일을 표시합니다.

---

## 뷰 모드

### 리스트 뷰 (기본)

그룹별로 TaskCard를 표시합니다.

```jsx
{viewMode === 'list' && (
  <>
    <TaskGroup title="🔥 긴급" tasks={groupedTasks.urgent} />
    <TaskGroup title="📅 이번 주" tasks={groupedTasks.thisWeek} />
    <TaskGroup title="📌 나중에" tasks={groupedTasks.later} />
  </>
)}
```

### 캘린더 뷰

마감일 기준 캘린더 형태로 표시합니다.

```jsx
{viewMode === 'calendar' && (
  <TaskCalendarView
    tasks={filteredTasks}
    onTaskClick={handleTaskClick}
    onDayClick={handleDayClick}
  />
)}
```

---

## 긴급도 판단

```javascript
// utils/time.js
export function getUrgencyLevel(dueDate) {
  if (!dueDate) return 'later'
  
  const now = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 7) return 'thisWeek'
  return 'later'
}

export function getTimeLeft(dueDate) {
  if (!dueDate) return { text: '마감일 없음', expired: false, urgent: false }
  
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due - now
  
  if (diff < 0) {
    return { text: '기한 지남', expired: true, urgent: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days === 0) {
    return { text: `${hours}시간 남음`, expired: false, urgent: true }
  }
  if (days === 1) {
    return { text: '내일 마감', expired: false, urgent: true }
  }
  
  return { text: `${days}일 남음`, expired: false, urgent: days <= 3 }
}
```

---

## 스타일

| 파일 | 설명 |
|------|------|
| `page.module.css` | 페이지 레이아웃 |
| `TaskCard.module.css` | 카드 스타일 |
| `TaskGroup.module.css` | 그룹 스타일 |
| `TaskFilters.module.css` | 필터 스타일 |
| `TaskCalendarView.module.css` | 캘린더 스타일 |

---

## 관련 문서

- [컴포넌트](./components.md)
- [위젯](./widgets.md)
- [개인 API](./api-personal.md)
- [스터디 API](./api-study.md)

