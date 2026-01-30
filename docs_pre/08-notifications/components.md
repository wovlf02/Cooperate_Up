# 🧩 알림 컴포넌트

## 개요

알림 기능을 구성하는 UI 컴포넌트 모음입니다.

---

## 컴포넌트 목록

### 공통 컴포넌트 (`src/components/notifications/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| NotificationCard | `NotificationCard.jsx` | 알림 카드 |
| NotificationFilters | `NotificationFilters.jsx` | 필터 컴포넌트 |
| NotificationEmpty | `NotificationEmpty.jsx` | 빈 상태 |
| NotificationStats | `NotificationStats.jsx` | 통계 |
| NotificationTypeFilter | `NotificationTypeFilter.jsx` | 타입 필터 |
| NotificationSettings | `NotificationSettings.jsx` | 설정 |

### 페이지 전용 (`src/app/notifications/components/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| NotificationList | `NotificationList.jsx` | 알림 목록 |
| NotificationHeader | `NotificationHeader.jsx` | 헤더 |
| NotificationSkeleton | `NotificationSkeleton.jsx` | 로딩 스켈레톤 |

### 네비게이션 (`src/components/admin/common/navbar/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| NotificationDropdown | `NotificationDropdown.jsx` | 드롭다운 |

---

## NotificationCard

개별 알림을 표시하는 카드 컴포넌트입니다.

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| notification | object | 알림 객체 |
| onClick | function | 클릭 핸들러 |

### 표시 정보

- 읽음/미읽음 상태 (점 표시)
- 알림 타입 배지
- 스터디 이름 (이모지 포함)
- 메시지
- 상대 시간

### 타입별 배지

```javascript
const getBadgeText = (type) => {
  const map = {
    JOIN_APPROVED: '가입승인',
    NOTICE: '공지',
    FILE: '파일',
    EVENT: '일정',
    TASK: '할일',
    MEMBER: '멤버',
    KICK: '강퇴',
  }
  return map[type] || type
}
```

### 사용 예시

```jsx
<NotificationCard
  notification={notification}
  onClick={() => handleNotificationClick(notification)}
/>
```

---

## NotificationFilters

알림 필터링 컴포넌트입니다.

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| filters | object | 현재 필터 상태 |
| onChange | function | 필터 변경 핸들러 |

### 필터 옵션

- **읽음 상태**: 전체 / 읽지 않음 / 읽음
- **알림 타입**: 전체 / 가입 / 공지 / 파일 / 일정 등

---

## NotificationEmpty

알림이 없을 때 표시하는 컴포넌트입니다.

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| message | string | 커스텀 메시지 |

### 기본 표시

```jsx
<div className={styles.empty}>
  <span className={styles.icon}>🔔</span>
  <p>{message || '새로운 알림이 없습니다'}</p>
</div>
```

---

## NotificationStats

알림 통계를 표시합니다.

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| stats | object | 통계 데이터 |

### 표시 정보

- 전체 알림 수
- 읽지 않은 알림 수
- 타입별 분포

---

## NotificationTypeFilter

알림 타입별 필터 버튼 그룹입니다.

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| selectedType | string | 선택된 타입 |
| onTypeChange | function | 타입 변경 핸들러 |

---

## NotificationSettings

알림 수신 설정 컴포넌트입니다.

### 설정 항목

- 이메일 알림 수신
- 푸시 알림 수신
- 타입별 알림 설정
- 방해 금지 시간대

---

## NotificationDropdown

헤더 네비게이션의 알림 드롭다운입니다.

### 기능

- 최근 알림 미리보기
- 읽지 않은 알림 배지
- 전체 보기 링크
- 모두 읽음 처리 버튼

### 사용 예시

```jsx
// 네비게이션 바에서
<NotificationDropdown />
```

---

## 페이지 전용 컴포넌트

### NotificationList

알림 목록을 렌더링합니다.

```jsx
<NotificationList
  notifications={notifications}
  onItemClick={handleItemClick}
  onDelete={handleDelete}
  isLoading={isLoading}
/>
```

### NotificationHeader

페이지 헤더입니다.

```jsx
<NotificationHeader
  totalCount={total}
  unreadCount={unread}
  onMarkAllRead={handleMarkAllRead}
/>
```

### NotificationSkeleton

로딩 중 스켈레톤 UI입니다.

```jsx
{isLoading && <NotificationSkeleton count={5} />}
```

---

## CSS 모듈

| 파일 | 컴포넌트 |
|------|---------|
| `NotificationCard.module.css` | NotificationCard |
| `NotificationFilters.module.css` | NotificationFilters |
| `NotificationEmpty.module.css` | NotificationEmpty |

### 카드 스타일 예시

```css
.card {
  padding: 16px;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
}

.card:hover {
  background: #f8f9fa;
}

.unread {
  background: #f0f7ff;
  border-left: 3px solid #4facfe;
}

.unreadDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4facfe;
}

.badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.badgeJoin { background: #d3f9d8; color: #2b8a3e; }
.badgeNotice { background: #fff3cd; color: #856404; }
.badgeFile { background: #cce5ff; color: #004085; }
.badgeTask { background: #f8d7da; color: #721c24; }
```

---

## 관련 문서

- [API](./api.md)
- [헬퍼](./helpers.md)
- [예외](./exceptions.md)

