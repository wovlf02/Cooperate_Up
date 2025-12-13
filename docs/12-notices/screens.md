# 🖥️ 공지사항 화면

## 개요

스터디 공지사항 관리 화면입니다. 공지 목록 조회, 필터링, 작성, 수정, 삭제 기능을 제공합니다.

**파일 위치**: `src/app/my-studies/[studyId]/notices/page.jsx`

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
│  대시보드 | 채팅 | [공지] | 일정 | 파일 | 멤버 | 설정        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📢 공지사항                              [+ 새 공지]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 전체 25 | 고정 3 | 중요 5 | 일반 17                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [🔍 공지사항 검색...]                                       │
│                                                             │
│  📌 고정된 공지                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📌 [중요] 스터디 규칙 안내                             │  │
│  │ 홍길동 · 2024.12.01 · 조회 45                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  📋 전체 공지                                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📢 이번 주 스터디 일정 변경                            │  │
│  │ 김철수 · 2024.12.10 · 조회 23                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📢 과제 제출 안내                                      │  │
│  │ 이영희 · 2024.12.08 · 조회 31                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │ 📊 통계         │                                        │
│  │ 전체: 25개      │                                        │
│  │ 고정: 3개       │                                        │
│  │ 중요: 5개       │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 구조

```jsx
<MyStudyNoticesPage>
  ├── Header
  │   ├── BackButton
  │   └── StudyHeader
  ├── StudyTabs
  ├── MainContent
  │   ├── NoticeSection
  │   │   ├── NoticeHeader (제목, 새 공지 버튼)
  │   │   ├── FilterSection (전체/고정/중요/일반)
  │   │   ├── SearchBox
  │   │   ├── PinnedNotices (고정된 공지 섹션)
  │   │   └── NoticeList (일반 공지 목록)
  │   └── Sidebar
  │       └── Statistics (통계)
  ├── NoticeCreateEditModal (작성/수정 모달)
  └── DetailModal (상세 모달)
</MyStudyNoticesPage>
```

---

## 상태 관리

```jsx
const [activeTab, setActiveTab] = useState('전체');
const [searchKeyword, setSearchKeyword] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedNotice, setSelectedNotice] = useState(null);
const [detailNotice, setDetailNotice] = useState(null);
```

---

## 필터링

### 탭 필터

```jsx
const pinnedNotices = notices.filter(n => n.isPinned);
const regularNotices = notices.filter(n => !n.isPinned);

const noticeStats = {
  total: notices.length,
  pinned: pinnedNotices.length,
  important: notices.filter(n => n.isImportant).length,
  regular: notices.filter(n => !n.isImportant && !n.isPinned).length,
};
```

### 필터 탭 UI

```jsx
<div className={styles.filterTabs}>
  <button className={activeTab === '전체' ? styles.active : ''}>
    전체 {noticeStats.total}
  </button>
  <button className={activeTab === '고정' ? styles.active : ''}>
    고정 {noticeStats.pinned}
  </button>
  <button className={activeTab === '중요' ? styles.active : ''}>
    중요 {noticeStats.important}
  </button>
  <button className={activeTab === '일반' ? styles.active : ''}>
    일반 {noticeStats.regular}
  </button>
</div>
```

---

## 주요 기능

### 1. 권한 확인

```jsx
const canEdit = () => {
  return ['OWNER', 'ADMIN'].includes(study.myRole);
};
```

### 2. 공지 삭제

```jsx
const handleDelete = async (noticeId) => {
  if (!confirm('정말 이 공지를 삭제하시겠습니까?')) return;

  try {
    await deleteNotice.mutateAsync({ studyId, noticeId });
    alert('공지가 삭제되었습니다');
  } catch (error) {
    console.error('공지 삭제 실패:', error);
    alert('공지 삭제에 실패했습니다');
  }
};
```

### 3. 고정 토글

```jsx
const handleTogglePin = async (noticeId) => {
  try {
    await togglePin.mutateAsync({ studyId, noticeId });
  } catch (error) {
    console.error('고정 토글 실패:', error);
    alert('고정 처리에 실패했습니다');
  }
};
```

### 4. 상세 보기 (조회수 증가)

```jsx
const handleViewNotice = async (notice) => {
  try {
    // API 호출로 조회수 증가
    const response = await fetch(`/api/studies/${studyId}/notices/${notice.id}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // API에서 반환된 데이터로 모달 표시
      setDetailNotice(result.data);

      // 캐시 업데이트
      queryClient.setQueryData(['studies', studyId, 'notices'], (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(n =>
            n.id === notice.id
              ? { ...n, views: result.data.views }
              : n
          )
        };
      });
    }
  } catch (error) {
    setDetailNotice(notice);
  }
};
```

---

## API Hooks

```jsx
const queryClient = useQueryClient();
const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
const { data: noticesData, isLoading: noticesLoading } = useNotices(studyId);
const deleteNotice = useDeleteNotice();
const togglePin = useTogglePinNotice();
```

---

## 모달

### 작성/수정 모달

```jsx
<NoticeCreateEditModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  studyId={studyId}
  notice={selectedNotice}  // null이면 생성, 있으면 수정
/>
```

### 상세 모달

```jsx
{detailNotice && (
  <div className={styles.detailModal}>
    <div className={styles.modalHeader}>
      <h2>{detailNotice.title}</h2>
      <button onClick={closeDetailModal}>×</button>
    </div>
    <div className={styles.modalContent}>
      <div className={styles.meta}>
        <span>{detailNotice.author.name}</span>
        <span>{formatDate(detailNotice.createdAt)}</span>
        <span>조회 {detailNotice.views}</span>
      </div>
      <div className={styles.content}>
        {detailNotice.content}
      </div>
    </div>
    {canEdit() && (
      <div className={styles.modalActions}>
        <button onClick={() => {
          setSelectedNotice(detailNotice);
          setIsModalOpen(true);
          closeDetailModal();
        }}>수정</button>
        <button onClick={() => handleDelete(detailNotice.id)}>삭제</button>
      </div>
    )}
  </div>
)}
```

---

## 공지 카드

```jsx
<div className={styles.noticeCard}>
  <div className={styles.noticeHeader}>
    {notice.isPinned && <span className={styles.pinBadge}>📌</span>}
    {notice.isImportant && <span className={styles.importantBadge}>[중요]</span>}
    <h3 className={styles.noticeTitle}>{notice.title}</h3>
  </div>
  <div className={styles.noticeMeta}>
    <span>{notice.author.name}</span>
    <span>{formatDate(notice.createdAt)}</span>
    <span>조회 {notice.views}</span>
  </div>
  {canEdit() && (
    <div className={styles.noticeActions}>
      <button onClick={() => handleTogglePin(notice.id)}>
        {notice.isPinned ? '고정해제' : '고정'}
      </button>
      <button onClick={() => {
        setSelectedNotice(notice);
        setIsModalOpen(true);
      }}>수정</button>
      <button onClick={() => handleDelete(notice.id)}>삭제</button>
    </div>
  )}
</div>
```

---

## 로딩 상태

```jsx
if (studyLoading || noticesLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>공지사항을 불러오는 중...</div>
    </div>
  );
}

if (!study) {
  return (
    <div className={styles.container}>
      <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
    </div>
  );
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [예외](./exceptions.md)

