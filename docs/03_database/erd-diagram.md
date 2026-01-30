# 📊 ERD 다이어그램

## 📋 개요

이 문서는 CoUp 데이터베이스의 전체 ERD(Entity-Relationship Diagram)와 도메인별 부분 ERD를 제공합니다.

---

## 🗺️ 전체 ERD 개요

```mermaid
erDiagram
    User ||--o{ StudyMember : "가입"
    User ||--o{ Study : "소유"
    User ||--o{ Message : "작성"
    User ||--o{ Task : "생성"
    User ||--o{ Notification : "수신"
    User ||--o{ Report : "신고"
    User ||--o{ GroupMember : "소속"
    User ||--o{ Group : "생성"
    User ||--o| AdminRole : "부여"
    
    Study ||--o{ StudyMember : "포함"
    Study ||--o{ Message : "포함"
    Study ||--o{ Notice : "포함"
    Study ||--o{ File : "포함"
    Study ||--o{ Event : "포함"
    Study ||--o{ Task : "연결"
    Study ||--o{ StudyTask : "포함"
    
    Group ||--o{ GroupMember : "포함"
    Group ||--o{ GroupInvite : "포함"
    
    StudyTask ||--o{ StudyTaskAssignee : "배정"
    
    Notice ||--o{ NoticeFile : "첨부"
    File ||--o{ NoticeFile : "첨부"
    File ||--o{ Message : "첨부"
    
    User ||--o{ Warning : "수신"
    User ||--o{ Sanction : "수신"
    User ||--o{ AdminLog : "수행"
```

---

## 👤 사용자 도메인 ERD

```mermaid
erDiagram
    User {
        String id PK "cuid()"
        String email UK "이메일"
        String password "비밀번호 (nullable)"
        String name "이름"
        String avatar "프로필 이미지"
        String bio "자기소개"
        Provider provider "CREDENTIALS|GOOGLE|GITHUB"
        UserRole role "USER|ADMIN"
        UserStatus status "ACTIVE|SUSPENDED|DELETED"
        DateTime createdAt "생성일"
        DateTime lastLoginAt "마지막 로그인"
    }
    
    AdminRole {
        String id PK
        String userId FK UK
        AdminRoleType role "VIEWER|MODERATOR|ADMIN|SUPER_ADMIN"
        Json permissions "세부 권한"
        String grantedBy "부여한 관리자"
        DateTime grantedAt "부여일"
    }
    
    User ||--o| AdminRole : "has"
```

---

## 📖 스터디 도메인 ERD

```mermaid
erDiagram
    Study {
        String id PK
        String ownerId FK
        String name "스터디명"
        String emoji "이모지"
        String description "설명"
        String category "카테고리"
        Int maxMembers "최대 인원"
        Boolean isPublic "공개 여부"
        Boolean autoApprove "자동 승인"
        Boolean isRecruiting "모집 중"
        String inviteCode UK "초대 코드"
        DateTime createdAt
    }
    
    StudyMember {
        String id PK
        String studyId FK
        String userId FK
        MemberRole role "OWNER|ADMIN|MEMBER"
        MemberStatus status "PENDING|ACTIVE|KICKED|LEFT"
        String introduction "자기소개"
        DateTime joinedAt
        DateTime approvedAt
    }
    
    User ||--o{ Study : "owns"
    User ||--o{ StudyMember : "joins"
    Study ||--o{ StudyMember : "has"
```

---

## 💬 메시지 도메인 ERD

```mermaid
erDiagram
    Message {
        String id PK
        String studyId FK
        String userId FK
        String content "메시지 내용"
        String fileId FK "첨부파일"
        String[] readers "읽은 사용자 IDs"
        DateTime createdAt
    }
    
    Notice {
        String id PK
        String studyId FK
        String authorId FK
        String title "제목"
        String content "내용"
        Boolean isPinned "고정 여부"
        Boolean isImportant "중요 여부"
        Int views "조회수"
        DateTime createdAt
    }
    
    NoticeFile {
        String id PK
        String noticeId FK
        String fileId FK
    }
    
    Study ||--o{ Message : "contains"
    Study ||--o{ Notice : "contains"
    User ||--o{ Message : "writes"
    User ||--o{ Notice : "writes"
    Notice ||--o{ NoticeFile : "has"
    File ||--o{ NoticeFile : "attached to"
    File ||--o{ Message : "attached to"
```

---

## ✅ 태스크 도메인 ERD

```mermaid
erDiagram
    Task {
        String id PK
        String studyId FK "nullable"
        String userId FK
        String title "제목"
        String description "설명"
        TaskStatus status "TODO|IN_PROGRESS|REVIEW|DONE"
        Priority priority "LOW|MEDIUM|HIGH|URGENT"
        DateTime dueDate "마감일"
        Boolean completed
        DateTime completedAt
    }
    
    StudyTask {
        String id PK
        String studyId FK
        String createdById FK
        String title
        String description
        TaskStatus status
        Priority priority
        DateTime dueDate
        DateTime createdAt
    }
    
    StudyTaskAssignee {
        String id PK
        String taskId FK
        String userId FK
        DateTime assignedAt
    }
    
    User ||--o{ Task : "creates"
    Study ||--o{ Task : "optional"
    Study ||--o{ StudyTask : "has"
    User ||--o{ StudyTask : "creates"
    StudyTask ||--o{ StudyTaskAssignee : "assigned to"
    User ||--o{ StudyTaskAssignee : "assigned"
```

---

## 👥 그룹 도메인 ERD

```mermaid
erDiagram
    Group {
        String id PK
        String name "그룹명"
        String description "설명"
        String category "카테고리"
        String imageUrl "이미지"
        Boolean isPublic "공개 여부"
        Int maxMembers "최대 인원"
        Boolean isRecruiting "모집 중"
        String createdBy FK
        DateTime createdAt
    }
    
    GroupMember {
        String id PK
        String groupId FK
        String userId FK
        GroupMemberRole role "OWNER|ADMIN|MEMBER"
        GroupMemberStatus status "PENDING|ACTIVE|LEFT|KICKED"
        DateTime joinedAt
        DateTime leftAt
    }
    
    GroupInvite {
        String id PK
        String groupId FK
        String invitedBy FK
        String email "초대 이메일"
        String code UK "초대 코드"
        GroupInviteStatus status "PENDING|ACCEPTED|EXPIRED|CANCELLED"
        DateTime expiresAt
    }
    
    User ||--o{ Group : "creates"
    User ||--o{ GroupMember : "joins"
    Group ||--o{ GroupMember : "has"
    Group ||--o{ GroupInvite : "has"
    User ||--o{ GroupInvite : "sends"
```

---

## 🛡️ 관리자 도메인 ERD

```mermaid
erDiagram
    Report {
        String id PK
        String reporterId FK
        TargetType targetType "USER|STUDY|MESSAGE"
        String targetId "대상 ID"
        ReportType type "SPAM|HARASSMENT|..."
        String reason "신고 사유"
        ReportStatus status "PENDING|IN_PROGRESS|RESOLVED|REJECTED"
        Priority priority
        String processedBy "처리자"
        DateTime processedAt
    }
    
    Warning {
        String id PK
        String userId FK
        String adminId
        String reason "경고 사유"
        WarningSeverity severity "MINOR|NORMAL|SERIOUS|CRITICAL"
        DateTime expiresAt
    }
    
    Sanction {
        String id PK
        String userId FK
        String adminId
        SanctionType type "WARNING|CHAT_BAN|SUSPENSION|..."
        String reason
        String duration "1d|3d|7d|30d|permanent"
        DateTime expiresAt
        Boolean isActive
    }
    
    AdminLog {
        String id PK
        String adminId FK
        AdminAction action "USER_WARN|USER_SUSPEND|..."
        String targetType
        String targetId
        Json before "변경 전"
        Json after "변경 후"
        String reason
        DateTime createdAt
    }
    
    User ||--o{ Report : "submits"
    User ||--o{ Warning : "receives"
    User ||--o{ Sanction : "receives"
    User ||--o{ AdminLog : "performs"
```

---

## 📁 파일 도메인 ERD

```mermaid
erDiagram
    File {
        String id PK
        String studyId FK
        String uploaderId FK
        String name "파일명"
        Int size "크기(bytes)"
        String type "MIME type"
        String url "저장 URL"
        String folderId "폴더 ID"
        Int downloads "다운로드 수"
        DateTime createdAt
    }
    
    Study ||--o{ File : "contains"
    User ||--o{ File : "uploads"
```

---

## 📅 캘린더 도메인 ERD

```mermaid
erDiagram
    Event {
        String id PK
        String studyId FK
        String createdById FK
        String title "일정 제목"
        DateTime date "날짜"
        String startTime "시작 시간"
        String endTime "종료 시간"
        String location "장소"
        String color "색상"
        DateTime createdAt
    }
    
    Study ||--o{ Event : "has"
    User ||--o{ Event : "creates"
```

---

## 🔔 알림 도메인 ERD

```mermaid
erDiagram
    Notification {
        String id PK
        String userId FK
        NotificationType type "JOIN_APPROVED|NOTICE|FILE|..."
        String studyId "관련 스터디"
        String studyName "스터디명"
        String studyEmoji "스터디 이모지"
        String message "알림 메시지"
        Json data "추가 데이터"
        Boolean isRead "읽음 여부"
        DateTime createdAt
    }
    
    User ||--o{ Notification : "receives"
```

---

## 🔗 관련 문서

- [모델 상세](./models/)
- [테이블 관계](./relationships.md)
- [인덱스 최적화](./indexes-optimization.md)
