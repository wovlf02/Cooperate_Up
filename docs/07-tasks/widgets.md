# 📊 할일 위젯

## 개요

대시보드 및 사이드바에 표시되는 할일 관련 위젯 컴포넌트입니다.

**파일 위치**: `src/components/tasks/`

---

## 위젯 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| TodayTasksWidget | `TodayTasksWidget.jsx` | 오늘 할일 위젯 |
| TaskProgressWidget | `TaskProgressWidget.jsx` | 진행률 위젯 |
| TaskByStudyWidget | `TaskByStudyWidget.jsx` | 스터디별 할일 위젯 |

---

## TodayTasksWidget

오늘 마감인 할일을 표시하는 위젯입니다.

### 기능

- 오늘 마감 할일 목록
- 긴급 할일 강조
- 빠른 완료 토글
- 상세 페이지 링크

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| tasks | array | 할일 배열 |
| onTaskClick | function | 할일 클릭 핸들러 |
| onToggle | function | 완료 토글 핸들러 |

### 표시 정보

- 할일 제목
- 마감 시간
- 우선순위 아이콘
- 완료 체크박스

### 예시

```jsx
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'

<TodayTasksWidget
  tasks={todayTasks}
  onTaskClick={handleTaskClick}
  onToggle={handleToggle}
/>
```

---

## TaskProgressWidget

할일 완료 진행률을 시각적으로 표시합니다.

### 기능

- 완료율 퍼센트 표시
- 프로그레스 바
- 완료/전체 개수
- 기한 지난 할일 경고

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| stats | object | 통계 데이터 |

### stats 구조

```javascript
{
  totalTasks: 50,
  completedTasks: 30,
  pendingTasks: 20,
  overdueTasks: 2,
  completionRate: 60
}
```

### 표시 요소

```jsx
<div className={styles.progressWidget}>
  <h4>📊 할일 진행률</h4>
  
  <div className={styles.progressBar}>
    <div 
      className={styles.progressFill}
      style={{ width: `${stats.completionRate}%` }}
    />
  </div>
  
  <div className={styles.stats}>
    <span>{stats.completedTasks} / {stats.totalTasks} 완료</span>
    <span>{stats.completionRate}%</span>
  </div>
  
  {stats.overdueTasks > 0 && (
    <div className={styles.warning}>
      ⚠️ 기한 지난 할일 {stats.overdueTasks}개
    </div>
  )}
</div>
```

---

## TaskByStudyWidget

스터디별 할일 현황을 표시합니다.

### 기능

- 스터디별 미완료 할일 수
- 스터디 바로가기 링크
- 가장 할일이 많은 스터디 강조

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| tasks | array | 할일 배열 |
| onStudyClick | function | 스터디 클릭 핸들러 |

### 그룹화 로직

```javascript
const groupByStudy = useMemo(() => {
  const groups = {}
  
  tasks.forEach(task => {
    if (task.study) {
      const key = task.study.id
      if (!groups[key]) {
        groups[key] = {
          study: task.study,
          count: 0
        }
      }
      if (!task.completed) {
        groups[key].count++
      }
    }
  })
  
  return Object.values(groups)
    .filter(g => g.count > 0)
    .sort((a, b) => b.count - a.count)
}, [tasks])
```

### 표시 예시

```
📚 스터디별 할일

💻 개발 스터디     5개
📖 알고리즘        3개
🎨 디자인 스터디   2개
```

---

## 스타일

### TodayTasksWidget.module.css

```css
.widget {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.taskList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.taskItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #f8f9fa;
}

.urgent {
  background: #fff5f5;
  border-left: 3px solid #ff6b6b;
}
```

### TaskProgressWidget.module.css

```css
.progressWidget {
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.progressBar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.warning {
  margin-top: 8px;
  padding: 8px;
  background: #fff5f5;
  color: #ff6b6b;
  border-radius: 8px;
  font-size: 13px;
}
```

---

## 대시보드 통합

### 사용 예시

```jsx
// 대시보드 또는 사이드바에서
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'
import TaskProgressWidget from '@/components/tasks/TaskProgressWidget'
import TaskByStudyWidget from '@/components/tasks/TaskByStudyWidget'

function Dashboard() {
  const { data: tasks } = useTasks({ status: 'incomplete' })
  const { data: stats } = useTaskStats()
  
  const todayTasks = tasks.filter(t => isToday(t.dueDate))
  
  return (
    <aside className={styles.sidebar}>
      <TaskProgressWidget stats={stats} />
      <TodayTasksWidget tasks={todayTasks} />
      <TaskByStudyWidget tasks={tasks} />
    </aside>
  )
}
```

---

## 반응형 디자인

위젯은 사이드바와 모바일 환경 모두 지원합니다.

```css
/* 모바일 */
@media (max-width: 768px) {
  .widget {
    margin-bottom: 16px;
  }
  
  .taskList {
    max-height: 200px;
    overflow-y: auto;
  }
}

/* 사이드바 */
@media (min-width: 1200px) {
  .widget {
    position: sticky;
    top: 80px;
  }
}
```

---

## 관련 문서

- [화면](./screens.md)
- [컴포넌트](./components.md)
- [API](./api-personal.md)

