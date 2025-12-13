# 🖥️ 캘린더 화면

## 개요

스터디 일정 관리 화면입니다. 캘린더 뷰와 리스트 뷰를 제공합니다.

**파일 위치**: `src/app/my-studies/[studyId]/calendar/page.jsx`

---

## 화면 구성

```
┌─────────────────────────────────────────────────────────────┐
│  ← 내 스터디 목록                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📚 스터디 이름                     👑 OWNER           │  │
│  │ 👥 5/10명                                             │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  대시보드 | 채팅 | 공지 | [일정] | 파일 | 멤버 | 설정        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 일정       [📅 캘린더] [📋 리스트]     [+ 일정 추가]     │
│                                                             │
│  [월] [주] [일]        < 2024년 12월 >       [오늘]         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  일   월   화   수   목   금   토                      │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  1    2    3    4    5    6    7                      │  │
│  │            🔵                                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  8    9   10   11   12   13   14                      │  │
│  │                          🔴                           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 15   16   17   18   19   20   21                      │  │
│  │ 🟢                                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │ 📊 오늘 일정    │                                        │
│  │ 🔵 스터디 모임  │                                        │
│  │    14:00-16:00  │                                        │
│  ├─────────────────┤                                        │
│  │ 📊 통계        │                                        │
│  │ 이번 달: 5개   │                                        │
│  │ 다음 일정: 3일 │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 뷰 타입

### 1. 캘린더 뷰

**월간 뷰 (month)**
- 달력 형태로 전체 월 표시
- 각 날짜에 일정 색상 표시
- 클릭 시 해당 일정 상세 모달

**주간 뷰 (week)**
- 일요일~토요일 7일 표시
- 시간대별 그리드 (24시간)
- 일정 블록으로 시각화

**일간 뷰 (day)**
- 하루 24시간 타임라인
- 일정 블록으로 시각화

### 2. 리스트 뷰

- 날짜별 그룹화된 목록
- 일정 제목, 시간, 장소 표시
- 수정/삭제 버튼

---

## 컴포넌트 구조

```jsx
<MyStudyCalendarPage>
  ├── Header
  │   ├── BackButton
  │   └── StudyHeader
  ├── StudyTabs
  ├── MainContent
  │   ├── CalendarSection
  │   │   ├── CalendarHeader (제목, 뷰 토글, 일정 추가)
  │   │   ├── ControlSection (뷰 모드, 네비게이션)
  │   │   └── CalendarView
  │   │       ├── MonthView (월간 캘린더)
  │   │       ├── WeekView (주간 그리드)
  │   │       ├── DayView (일간 타임라인)
  │   │       └── ListView (리스트)
  │   └── Sidebar
  │       ├── TodayEvents (오늘 일정)
  │       └── Statistics (통계)
  ├── CreateModal (일정 추가 모달)
  └── DetailModal (일정 상세/수정 모달)
</MyStudyCalendarPage>
```

---

## 상태 관리

```jsx
const [viewType, setViewType] = useState('calendar');  // 'calendar' | 'list'
const [viewMode, setViewMode] = useState('month');     // 'month' | 'week' | 'day'
const [currentDate, setCurrentDate] = useState(new Date());
const [showModal, setShowModal] = useState(false);
const [showDetailModal, setShowDetailModal] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [isEditingDetail, setIsEditingDetail] = useState(false);
const [formData, setFormData] = useState({
  title: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  color: '#6366F1'
});
```

---

## 주요 기능

### 1. 일정 생성

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title.trim()) {
    alert('일정 제목을 입력해주세요.');
    return;
  }

  try {
    await createEventMutation.mutateAsync({
      studyId,
      data: formData
    });
    setShowModal(false);
    alert('일정이 추가되었습니다.');
  } catch (error) {
    alert('일정 추가 실패: ' + error.message);
  }
};
```

### 2. 일정 수정

```jsx
const handleSaveEdit = async () => {
  if (!editFormData.title.trim()) {
    alert('일정 제목을 입력해주세요.');
    return;
  }

  try {
    await updateEventMutation.mutateAsync({
      studyId,
      eventId: selectedEvent.id,
      data: editFormData
    });
    setIsEditingDetail(false);
    handleCloseDetailModal();
    alert('일정이 수정되었습니다.');
  } catch (error) {
    alert('일정 수정 실패: ' + error.message);
  }
};
```

### 3. 일정 삭제

```jsx
const handleDeleteEvent = async (eventId) => {
  if (!confirm('일정을 삭제하시겠습니까?')) return;

  try {
    await deleteEventMutation.mutateAsync({ studyId, eventId });
  } catch (error) {
    alert('일정 삭제 실패: ' + error.message);
  }
};
```

### 4. 권한 확인

```jsx
const canDeleteEvent = (event) => {
  if (!currentUser || !study) return false;
  return event.createdById === currentUser.id || 
         ['OWNER', 'ADMIN'].includes(study.myRole);
};
```

---

## 날짜/시간 유틸리티

### 월 일수 계산

```jsx
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);  // 빈 칸
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};
```

### 오늘 여부 확인

```jsx
const isToday = (day) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()
  );
};
```

### 해당 날짜 일정 조회

```jsx
const getEventsForDay = (day) => {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return events.filter(event => {
    const eventDate = new Date(event.date);
    const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
    return eventDateStr === dateStr;
  });
};
```

### 주간 뷰 날짜 계산

```jsx
const getWeekDays = (date) => {
  const current = new Date(date);
  const first = current.getDate() - current.getDay(); // 일요일

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(current.setDate(first + i));
    return new Date(day);
  });
};
```

### 일정 위치 계산 (시간대 그리드)

```jsx
const getEventPosition = (event) => {
  const [startHour, startMinute] = event.startTime.split(':').map(Number);
  const [endHour, endMinute] = event.endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const duration = endMinutes - startMinutes;

  return {
    top: `${(startMinutes / 60) * 60}px`,    // 60px per hour
    height: `${(duration / 60) * 60}px`
  };
};
```

---

## 네비게이션

### 월 이동

```jsx
const goToPreviousMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
};

const goToNextMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
};
```

### 주 이동

```jsx
const goToPreviousWeek = () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() - 7);
  setCurrentDate(newDate);
};

const goToNextWeek = () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + 7);
  setCurrentDate(newDate);
};
```

### 일 이동

```jsx
const goToPreviousDay = () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() - 1);
  setCurrentDate(newDate);
};

const goToNextDay = () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + 1);
  setCurrentDate(newDate);
};
```

### 오늘로 이동

```jsx
const goToToday = () => {
  setCurrentDate(new Date());
};
```

---

## API Hooks

```jsx
const { data: studyData, isLoading: studyLoading } = useStudy(studyId);

// 현재 월 기준 조회
const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
const { data: eventsData, isLoading: eventsLoading } = useEvents(studyId, { month });

const createEventMutation = useCreateEvent();
const updateEventMutation = useUpdateEvent();
const deleteEventMutation = useDeleteEvent();
```

---

## 모달

### 일정 추가 모달

```jsx
<div className={styles.modal}>
  <form onSubmit={handleSubmit}>
    <input name="title" value={formData.title} onChange={handleInputChange} />
    <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
    <input name="location" value={formData.location} onChange={handleInputChange} />
    <input type="color" name="color" value={formData.color} onChange={handleInputChange} />
    <button type="submit">추가</button>
  </form>
</div>
```

### 일정 상세/수정 모달

```jsx
<div className={styles.detailModal}>
  {isEditingDetail ? (
    // 수정 폼
    <form>
      <input name="title" value={editFormData.title} onChange={handleEditInputChange} />
      ...
      <button onClick={handleSaveEdit}>저장</button>
      <button onClick={handleCancelEditing}>취소</button>
    </form>
  ) : (
    // 상세 뷰
    <div>
      <h3>{selectedEvent.title}</h3>
      <p>{selectedEvent.date} {selectedEvent.startTime}-{selectedEvent.endTime}</p>
      <p>{selectedEvent.location}</p>
      <button onClick={handleStartEditing}>수정</button>
      <button onClick={() => handleDeleteEvent(selectedEvent.id)}>삭제</button>
    </div>
  )}
</div>
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [예외](./exceptions.md)

