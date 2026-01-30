# 📊 Enum 및 인덱스

## 개요

Prisma 스키마에서 정의된 모든 Enum과 인덱스 전략을 정리합니다.

---

## Enum 전체 목록

### 사용자 관련

#### Provider (인증 제공자)

```prisma
enum Provider {
  CREDENTIALS  // 이메일/비밀번호 인증
  GOOGLE       // Google OAuth
  GITHUB       // GitHub OAuth
}
```

#### UserRole (사용자 역할)

```prisma
enum UserRole {
  USER   // 일반 사용자
  ADMIN  // 관리자 (UserRole.ADMIN은 AdminRole과 별개)
}
```

#### UserStatus (사용자 상태)

```prisma
enum UserStatus {
  ACTIVE     // 활성 (정상)
  SUSPENDED  // 정지 (일시적)
  DELETED    // 삭제됨 (소프트 삭제)
}
```

---

### 멤버십 관련

#### MemberRole (스터디 멤버 역할)

```prisma
enum MemberRole {
  OWNER   // 소유자 (스터디당 1명)
  ADMIN   // 관리자 (멤버 관리 가능)
  MEMBER  // 일반 멤버
}
```

| 역할 | 설정 변경 | 멤버 관리 | 콘텐츠 관리 | 가입 승인 |
|------|----------|----------|------------|----------|
| OWNER | ✓ | ✓ | ✓ | ✓ |
| ADMIN | ✗ | ✓ | ✓ | ✓ |
| MEMBER | ✗ | ✗ | △ | ✗ |

#### MemberStatus (스터디 멤버 상태)

```prisma
enum MemberStatus {
  PENDING  // 가입 승인 대기
  ACTIVE   // 활성 멤버
  KICKED   // 추방됨
  LEFT     // 자발적 탈퇴
}
```

#### GroupMemberRole (그룹 멤버 역할)

```prisma
enum GroupMemberRole {
  OWNER   // 소유자
  ADMIN   // 관리자
  MEMBER  // 일반 멤버
}
```

#### GroupMemberStatus (그룹 멤버 상태)

```prisma
enum GroupMemberStatus {
  PENDING  // 승인 대기
  ACTIVE   // 활성
  LEFT     // 탈퇴
  KICKED   // 추방됨
}
```

#### GroupInviteStatus (그룹 초대 상태)

```prisma
enum GroupInviteStatus {
  PENDING    // 대기 중
  ACCEPTED   // 수락됨
  EXPIRED    // 만료됨
  CANCELLED  // 취소됨
}
```

---

### 할일 관련

#### TaskStatus (할일 상태)

```prisma
enum TaskStatus {
  TODO         // 할 일 (시작 전)
  IN_PROGRESS  // 진행 중
  REVIEW       // 검토 중
  DONE         // 완료
}
```

#### Priority (우선순위)

```prisma
enum Priority {
  LOW     // 낮음 (언제든지)
  MEDIUM  // 보통 (기본값)
  HIGH    // 높음 (곧 처리 필요)
  URGENT  // 긴급 (즉시 처리)
}
```

---

### 알림 관련

#### NotificationType (알림 유형)

```prisma
enum NotificationType {
  JOIN_APPROVED  // 가입 승인됨
  NOTICE         // 새 공지사항
  FILE           // 새 파일 업로드
  EVENT          // 새 일정
  TASK           // 새 할일 배정
  MEMBER         // 멤버 변경
  KICK           // 추방됨
  CHAT           // 새 채팅 메시지
}
```

---

### 신고 관련

#### TargetType (신고 대상 유형)

```prisma
enum TargetType {
  USER     // 사용자 신고
  STUDY    // 스터디 신고
  MESSAGE  // 메시지 신고
}
```

#### ReportType (신고 유형)

```prisma
enum ReportType {
  SPAM          // 스팸/광고
  HARASSMENT    // 괴롭힘/폭언
  INAPPROPRIATE // 부적절한 콘텐츠
  COPYRIGHT     // 저작권 침해
  OTHER         // 기타
}
```

#### ReportStatus (신고 처리 상태)

```prisma
enum ReportStatus {
  PENDING      // 접수됨 (처리 대기)
  IN_PROGRESS  // 검토 중
  RESOLVED     // 해결됨
  REJECTED     // 기각됨
}
```

---

### 관리자 관련

#### AdminRoleType (관리자 역할)

```prisma
enum AdminRoleType {
  VIEWER       // 조회만 가능
  MODERATOR    // 콘텐츠 모더레이션
  ADMIN        // 사용자/스터디 관리
  SUPER_ADMIN  // 모든 권한
}
```

#### WarningSeverity (경고 심각도)

```prisma
enum WarningSeverity {
  MINOR     // 경미한 위반 (1점)
  NORMAL    // 일반 위반 (2점)
  SERIOUS   // 심각한 위반 (3점)
  CRITICAL  // 치명적 위반 (5점)
}
```

#### SanctionType (제재 유형)

```prisma
enum SanctionType {
  WARNING          // 경고 (기록만)
  CHAT_BAN         // 채팅 금지
  STUDY_CREATE_BAN // 스터디 생성 금지
  FILE_UPLOAD_BAN  // 파일 업로드 금지
  RESTRICTION      // 활동 제한
  SUSPENSION       // 계정 정지 (기간제)
  PERMANENT_BAN    // 영구 정지
}
```

#### AdminAction (관리자 액션)

```prisma
enum AdminAction {
  // 사용자 관리
  USER_VIEW, USER_SEARCH, USER_WARN, USER_SUSPEND,
  USER_UNSUSPEND, USER_DELETE, USER_RESTORE, USER_UPDATE

  // 스터디 관리
  STUDY_VIEW, STUDY_HIDE, STUDY_UNHIDE, STUDY_CLOSE,
  STUDY_REOPEN, STUDY_DELETE, STUDY_RECOMMEND

  // 신고 처리
  REPORT_VIEW, REPORT_ASSIGN, REPORT_RESOLVE, REPORT_REJECT

  // 콘텐츠 관리
  CONTENT_DELETE, CONTENT_RESTORE

  // 시스템 설정
  SETTINGS_VIEW, SETTINGS_UPDATE, SETTINGS_CACHE_CLEAR

  // 분석 및 통계
  ANALYTICS_VIEW, ANALYTICS_EXPORT

  // 감사 로그
  AUDIT_VIEW, AUDIT_EXPORT
}
```

---

## 인덱스 전략

### User 모델 인덱스

```prisma
model User {
  @@index([email])       // 이메일 검색
  @@index([status])      // 상태별 필터
  @@index([createdAt])   // 가입일 정렬
  @@index([lastLoginAt]) // 최근 로그인 정렬
}
```

### Study 모델 인덱스

```prisma
model Study {
  @@index([category])              // 카테고리별 조회
  @@index([isPublic, isRecruiting]) // 공개+모집중 필터
  @@index([ownerId])               // 소유자별 조회
  @@index([rating])                // 평점 정렬
}
```

### StudyMember 모델 인덱스

```prisma
model StudyMember {
  @@unique([studyId, userId])  // 중복 가입 방지
  @@index([userId])            // 사용자별 스터디 조회
  @@index([status])            // 상태별 필터
  @@index([studyId, status])   // 스터디+상태 복합 필터
}
```

### Message 모델 인덱스

```prisma
model Message {
  @@index([studyId, createdAt])  // 스터디별 시간순 조회
}
```

### Notice 모델 인덱스

```prisma
model Notice {
  @@index([studyId, isPinned, createdAt])  // 고정글 우선 정렬
  @@index([authorId])                       // 작성자별 조회
}
```

### Event 모델 인덱스

```prisma
model Event {
  @@index([studyId, date])   // 스터디별 날짜순
  @@index([createdById])     // 생성자별 조회
}
```

### Task 모델 인덱스

```prisma
model Task {
  @@index([userId, completed])  // 사용자별 완료 여부
  @@index([studyId, status])    // 스터디별 상태
}
```

### Notification 모델 인덱스

```prisma
model Notification {
  @@index([userId, isRead, createdAt])  // 읽지 않은 알림 조회
}
```

### Report 모델 인덱스

```prisma
model Report {
  @@index([status, priority, createdAt])  // 처리 대기 목록
  @@index([targetType, targetId])          // 대상별 조회
}
```

### Warning 모델 인덱스

```prisma
model Warning {
  @@index([userId, createdAt])             // 사용자별 시간순
  @@index([severity, createdAt])           // 심각도별 조회
  @@index([userId, severity, createdAt])   // 복합 조회 최적화
}
```

### Sanction 모델 인덱스

```prisma
model Sanction {
  @@index([userId, type, createdAt])       // 사용자별 제재 이력
  @@index([userId, isActive, expiresAt])   // 활성 제재 조회
  @@index([isActive, expiresAt])           // 만료 예정 제재
}
```

### AdminLog 모델 인덱스

```prisma
model AdminLog {
  @@index([adminId, createdAt])    // 관리자별 활동 이력
  @@index([action, createdAt])     // 액션별 조회
  @@index([targetType, targetId])  // 대상별 이력 조회
}
```

---

## 인덱스 설계 원칙

### 복합 인덱스 순서

복합 인덱스는 가장 선택적인(카디널리티가 높은) 컬럼을 먼저 배치합니다.

```prisma
// 좋은 예: 선택적인 컬럼 먼저
@@index([userId, createdAt])

// 나쁜 예: 비선택적인 컬럼 먼저
@@index([status, userId])  // status는 몇 가지 값만 가능
```

### 쿼리 패턴 기반

자주 사용되는 쿼리 패턴에 맞춰 인덱스를 설계합니다.

| 쿼리 패턴 | 인덱스 |
|-----------|--------|
| 스터디 목록 (공개+모집중) | `[isPublic, isRecruiting]` |
| 사용자의 스터디 | `[userId]` on StudyMember |
| 스터디 채팅 이력 | `[studyId, createdAt]` |
| 읽지 않은 알림 | `[userId, isRead, createdAt]` |

### 유니크 제약

중복 방지가 필요한 경우 유니크 인덱스를 사용합니다.

```prisma
// 한 스터디에 동일 사용자 중복 가입 방지
@@unique([studyId, userId])

// 동일 파일 중복 첨부 방지
@@unique([noticeId, fileId])
```

---

## 관련 문서

- [User 모델](./models-user.md) - 사용자 관련 모델
- [Study 모델](./models-study.md) - 스터디 관련 모델
- [Content 모델](./models-content.md) - 콘텐츠 관련 모델
- [Admin 모델](./models-admin.md) - 관리자 관련 모델

