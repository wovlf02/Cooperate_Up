# 🔔 알림 도메인 개요

## 개요

사용자에게 스터디 활동, 시스템 이벤트 등을 알리는 알림 시스템입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 알림 목록 | 사용자 알림 목록 조회 |
| 알림 필터링 | 타입, 읽음 여부로 필터링 |
| 읽음 처리 | 단일/전체 읽음 처리 |
| 알림 삭제 | 단일/대량 삭제 |
| 미읽 개수 | 읽지 않은 알림 수 조회 |
| 알림 생성 | 시스템에서 알림 생성 |

---

## 알림 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `JOIN_REQUEST` | 가입 요청 | "OOO님이 가입을 요청했습니다" |
| `JOIN_APPROVED` | 가입 승인 | "가입이 승인되었습니다" |
| `JOIN_REJECTED` | 가입 거절 | "가입이 거절되었습니다" |
| `NOTICE` | 공지사항 | "새 공지가 등록되었습니다" |
| `FILE` | 파일 업로드 | "새 파일이 업로드되었습니다" |
| `EVENT` | 일정 | "새 일정이 추가되었습니다" |
| `TASK` | 할일 | "새 할일이 할당되었습니다" |
| `MEMBER` | 멤버 변경 | "새 멤버가 참여했습니다" |
| `KICK` | 강퇴 | "스터디에서 강퇴되었습니다" |
| `ROLE_CHANGE` | 역할 변경 | "역할이 변경되었습니다" |
| `MENTION` | 멘션 | "님이 회원님을 멘션했습니다" |
| `COMMENT` | 댓글 | "새 댓글이 달렸습니다" |

---

## 관련 파일

### API

| 경로 | 설명 |
|------|------|
| `src/app/api/notifications/route.js` | 목록 조회, 생성 |
| `src/app/api/notifications/[id]/route.js` | 상세, 삭제 |
| `src/app/api/notifications/[id]/read/route.js` | 읽음 처리 |
| `src/app/api/notifications/mark-all-read/route.js` | 전체 읽음 |
| `src/app/api/notifications/count/route.js` | 미읽 개수 |
| `src/app/api/notifications/bulk/route.js` | 대량 삭제 |

### 페이지

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/notifications/page.jsx` | `/notifications` | 알림 목록 |

### 컴포넌트

| 경로 | 설명 |
|------|------|
| `src/components/notifications/NotificationCard.jsx` | 알림 카드 |
| `src/components/notifications/NotificationFilters.jsx` | 필터 |
| `src/components/notifications/NotificationEmpty.jsx` | 빈 상태 |
| `src/components/notifications/NotificationStats.jsx` | 통계 |
| `src/components/notifications/NotificationSettings.jsx` | 설정 |
| `src/app/notifications/components/` | 페이지 전용 컴포넌트 |

### 헬퍼/예외

| 경로 | 설명 |
|------|------|
| `src/lib/helpers/notification-helpers.js` | 헬퍼 함수 |
| `src/lib/validators/notification-validators.js` | 입력 검증 |
| `src/lib/exceptions/notification/` | 예외 클래스 |

---

## 알림 모델

```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        String
  message     String
  studyId     String?
  studyName   String?
  studyEmoji  String?
  data        Json?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  study       Study?   @relation(fields: [studyId], references: [id])
}
```

---

## 에러 코드 범위

| 범위 | 분류 |
|------|------|
| NOTI-001 ~ NOTI-015 | 검증 예외 |
| NOTI-016 ~ NOTI-025 | 권한 예외 |
| NOTI-026 ~ NOTI-040 | 비즈니스 예외 |

---

## 관련 문서

- [API](./api.md) - 알림 API
- [컴포넌트](./components.md) - UI 컴포넌트
- [헬퍼](./helpers.md) - 헬퍼 함수
- [예외](./exceptions.md) - 예외 클래스

