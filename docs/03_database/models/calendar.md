# 📅 Event (캘린더) 모델

## 📋 개요

`Event` 모델은 스터디 내 캘린더 일정을 저장합니다. 정기 모임, 발표, 시험 등 다양한 일정을 관리합니다.

---

## 📊 스키마 정의

```prisma
model Event {
  id          String   @id @default(cuid())
  studyId     String
  createdById String
  title       String
  date        DateTime @db.Date
  startTime   String
  endTime     String
  location    String?
  color       String   @default("#6366F1")

  createdAt DateTime @default(now())

  study     Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  createdBy User  @relation("EventCreator", fields: [createdById], references: [id])

  @@index([studyId, date])
  @@index([createdById])
}
```

---

## 🏷️ 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `studyId` | String | ✅ | - | 스터디 ID (FK) |
| `createdById` | String | ✅ | - | 생성자 ID (FK) |
| `title` | String | ✅ | - | 일정 제목 |
| `date` | DateTime | ✅ | - | 날짜 (Date만) |
| `startTime` | String | ✅ | - | 시작 시간 (예: "14:00") |
| `endTime` | String | ✅ | - | 종료 시간 (예: "16:00") |
| `location` | String | ❌ | null | 장소 |
| `color` | String | ✅ | "#6366F1" | 캘린더 표시 색상 |
| `createdAt` | DateTime | ✅ | now() | 생성일 |

---

## 🔗 관계 (Relations)

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `study` | Study | N:1 | 소속 스터디 |
| `createdBy` | User | N:1 | 일정 생성자 |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([studyId, date])` | studyId, date | 스터디별 날짜 범위 조회 |
| `@@index([createdById])` | createdById | 생성자별 조회 |

---

## 🎨 색상 팔레트 예시

| 색상 | HEX | 용도 |
|------|-----|------|
| 인디고 | #6366F1 | 기본/정기 모임 |
| 그린 | #10B981 | 스터디 발표 |
| 레드 | #EF4444 | 시험/마감 |
| 오렌지 | #F97316 | 과제 제출 |
| 블루 | #3B82F6 | 온라인 미팅 |
| 퍼플 | #8B5CF6 | 특별 이벤트 |

---

## 💡 사용 예시

### 일정 생성
```javascript
const event = await prisma.event.create({
  data: {
    studyId: 'study-id',
    createdById: userId,
    title: '정기 스터디 모임',
    date: new Date('2026-02-15'),
    startTime: '14:00',
    endTime: '16:00',
    location: '강남역 스터디카페',
    color: '#6366F1'
  }
});
```

### 월간 일정 조회
```javascript
const startOfMonth = new Date('2026-02-01');
const endOfMonth = new Date('2026-02-28');

const events = await prisma.event.findMany({
  where: {
    studyId: 'study-id',
    date: {
      gte: startOfMonth,
      lte: endOfMonth
    }
  },
  include: {
    createdBy: { select: { name: true } }
  },
  orderBy: { date: 'asc' }
});
```

### 다가오는 일정 조회
```javascript
const upcomingEvents = await prisma.event.findMany({
  where: {
    studyId: 'study-id',
    date: { gte: new Date() }
  },
  orderBy: { date: 'asc' },
  take: 5
});
```

### 일정 수정
```javascript
await prisma.event.update({
  where: { id: 'event-id' },
  data: {
    title: '정기 스터디 (장소 변경)',
    location: '홍대입구역 스터디카페'
  }
});
```

---

## 📅 캘린더 뷰 데이터 변환

```javascript
// 캘린더 라이브러리 형식으로 변환
function formatEventsForCalendar(events) {
  return events.map(event => ({
    id: event.id,
    title: event.title,
    start: `${event.date.toISOString().split('T')[0]}T${event.startTime}`,
    end: `${event.date.toISOString().split('T')[0]}T${event.endTime}`,
    backgroundColor: event.color,
    extendedProps: {
      location: event.location,
      createdBy: event.createdBy
    }
  }));
}
```

---

## 🔗 관련 문서

- [스터디 모델](./study.md)
- [사용자 모델](./user.md)
- [알림 모델](./notification.md)
