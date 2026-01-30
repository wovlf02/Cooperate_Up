# 🧩 할일 컴포넌트

## 개요

할일 기능을 구성하는 UI 컴포넌트 모음입니다.

**파일 위치**: `src/components/tasks/`

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| TaskCard | `TaskCard.jsx` | 할일 카드 |
| TaskGroup | `TaskGroup.jsx` | 할일 그룹 |
| TaskFilters | `TaskFilters.jsx` | 필터 컴포넌트 |
| TaskEmpty | `TaskEmpty.jsx` | 빈 상태 |
| TaskCalendarView | `TaskCalendarView.jsx` | 캘린더 뷰 |
| TaskCreateModal | `TaskCreateModal.jsx` | 생성 모달 |
| TaskEditModal | `TaskEditModal.jsx` | 수정 모달 |
| TaskDetailModal | `TaskDetailModal.jsx` | 상세 모달 |
| TaskDayModal | `TaskDayModal.jsx` | 날짜별 모달 |

---

## TaskCard

개별 할일을 표시하는 카드 컴포넌트입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| task | object | ✓ | 할일 객체 |
| onToggleComplete | function | ✓ | 완료 토글 핸들러 |
| onDeleteTask | function | ✓ | 삭제 핸들러 |
| onCardClick | function | X | 카드 클릭 핸들러 |
| onEdit | function | X | 수정 핸들러 |

### 표시 정보

- 체크박스 (완료 여부)
- 제목
- 마감일 및 남은 시간
- 스터디 정보 (있는 경우)
- 우선순위 배지
- 설명 (있는 경우)
- 수정/삭제 버튼

### 우선순위 배지

```jsx
{task.priority === 'URGENT' && '🔥 긴급'}
{task.priority === 'HIGH' && '⚠️ 높음'}
{task.priority === 'MEDIUM' && '📌 보통'}
{task.priority === 'LOW' && '📎 낮음'}
```

### 마감일 스타일

| 상태 | 클래스 | 설명 |
|------|--------|------|
| 기한 지남 | `deadlineExpired` | 빨간색 |
| 긴급 | `deadlineUrgent` | 주황색 |
| 정상 | `deadlineNormal` | 기본색 |

---

## TaskGroup

긴급도별로 그룹화된 할일 목록을 표시합니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✓ | 그룹 제목 |
| tasks | array | ✓ | 할일 배열 |
| onToggleComplete | function | ✓ | 완료 토글 |
| onDeleteTask | function | ✓ | 삭제 |
| onCardClick | function | X | 카드 클릭 |
| onEdit | function | X | 수정 |

### 사용 예시

```jsx
<TaskGroup
  title="🔥 긴급"
  tasks={groupedTasks.urgent}
  onToggleComplete={handleToggleComplete}
  onDeleteTask={handleDeleteTask}
  onCardClick={handleCardClick}
  onEdit={handleEdit}
/>
```

---

## TaskFilters

필터 및 뷰 모드 토글 컴포넌트입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| filter | object | ✓ | 현재 필터 상태 |
| setFilter | function | ✓ | 필터 변경 |
| taskCount | number | X | 미완료 개수 |
| viewMode | string | ✓ | 현재 뷰 모드 |
| setViewMode | function | ✓ | 뷰 모드 변경 |

### 필터 옵션

```jsx
// 스터디 필터
<select value={filter.studyId || ''} onChange={...}>
  <option value="">전체 스터디</option>
  {studies.map(study => (...))}
</select>

// 상태 필터
<select value={filter.status} onChange={...}>
  <option value="all">전체 상태</option>
  <option value="incomplete">미완료만</option>
  <option value="completed">완료만</option>
</select>

// 정렬 필터
<select value={filter.sortBy} onChange={...}>
  <option value="deadline">마감일순</option>
  <option value="created">최신순</option>
  <option value="study">스터디별</option>
</select>
```

### 뷰 모드 토글

```jsx
<div className={styles.viewToggle}>
  <button onClick={() => setViewMode('list')}>📋</button>
  <button onClick={() => setViewMode('calendar')}>📅</button>
</div>
```

---

## TaskCalendarView

캘린더 형태로 할일을 표시합니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| tasks | array | ✓ | 할일 배열 |
| onTaskClick | function | X | 할일 클릭 |
| onDayClick | function | X | 날짜 클릭 |

### 기능

- 월간 캘린더 표시
- 날짜별 할일 개수 표시
- 날짜 클릭 시 TaskDayModal 열기
- 이전/다음 월 이동

---

## TaskCreateModal

새 할일을 생성하는 모달입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| onClose | function | ✓ | 닫기 핸들러 |
| onSuccess | function | X | 성공 콜백 |

### 폼 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| title | ✓ | 제목 |
| description | X | 설명 |
| studyId | ✓ | 스터디 선택 |
| dueDate | ✓ | 마감일 |
| priority | X | 우선순위 (기본: MEDIUM) |
| assigneeIds | ✓ | 담당자 (1명 이상) |

### 담당자 선택

스터디 선택 시 해당 스터디 멤버 목록을 로드하여 담당자를 선택할 수 있습니다.

```javascript
useEffect(() => {
  const fetchMembers = async () => {
    if (!formData.studyId) return
    
    const response = await fetch(`/api/studies/${formData.studyId}/members`)
    const data = await response.json()
    
    if (data.success) {
      setStudyMembers(data.data || [])
    }
  }
  
  fetchMembers()
}, [formData.studyId])
```

---

## TaskEditModal

할일을 수정하는 모달입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| task | object | ✓ | 수정할 할일 |
| onClose | function | ✓ | 닫기 핸들러 |
| onSuccess | function | X | 성공 콜백 |

---

## TaskDetailModal

할일 상세 정보를 표시하는 모달입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| task | object | ✓ | 할일 객체 |
| onClose | function | ✓ | 닫기 핸들러 |
| onEdit | function | X | 수정 버튼 클릭 |
| onDelete | function | X | 삭제 버튼 클릭 |

### 표시 정보

- 제목, 설명
- 상태, 우선순위
- 마감일, 남은 시간
- 스터디 정보
- 담당자 목록
- 생성일, 수정일

---

## TaskDayModal

특정 날짜의 할일 목록을 표시하는 모달입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| date | Date | ✓ | 선택된 날짜 |
| tasks | array | ✓ | 해당 날짜 할일 |
| onClose | function | ✓ | 닫기 핸들러 |
| onTaskClick | function | X | 할일 클릭 |

---

## TaskEmpty

할일이 없을 때 표시하는 빈 상태 컴포넌트입니다.

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| message | string | X | 커스텀 메시지 |
| onCreateClick | function | X | 생성 버튼 클릭 |

### 기본 메시지

```jsx
<div className={styles.emptyState}>
  <span className={styles.icon}>📝</span>
  <p className={styles.message}>
    {message || '할일이 없습니다'}
  </p>
  {onCreateClick && (
    <button onClick={onCreateClick}>
      새 할일 만들기
    </button>
  )}
</div>
```

---

## CSS 모듈

각 컴포넌트는 CSS Module 스타일을 사용합니다.

| 파일 | 컴포넌트 |
|------|---------|
| `TaskCard.module.css` | TaskCard |
| `TaskGroup.module.css` | TaskGroup |
| `TaskFilters.module.css` | TaskFilters |
| `TaskEmpty.module.css` | TaskEmpty |
| `TaskCalendarView.module.css` | TaskCalendarView |
| `TaskCreateModal.module.css` | TaskCreateModal |
| `TaskDayModal.module.css` | TaskDayModal |
| `TaskDetailModal.module.css` | TaskDetailModal |

---

## 관련 문서

- [화면](./screens.md)
- [위젯](./widgets.md)
- [API](./api-personal.md)

