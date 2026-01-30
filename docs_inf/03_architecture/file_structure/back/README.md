# 백엔드 파일 구조 설계 (Backend File Structure Design)

> **최종 업데이트**: 2024-12-25
> **기술 스택**: Spring Boot 4.0.1 / Java 21 / PostgreSQL / Gradle

## 개요

이 디렉토리는 **Biz_One** 백엔드 API 서버의 파일 구조 설계 문서를 포함합니다.
도메인 기반 패키지 구조를 따르며, 각 도메인별로 상세한 파일 구조가 정의되어 있습니다.

---

## 📁 문서 구조

```
back/
├── README.md                    # 개요 (이 파일)
├── 00-spring-initializr.md     # Spring Boot 프로젝트 초기화 가이드
├── 01-overview.md              # 전체 백엔드 구조 개요
├── 02-user.md                  # 사용자 도메인
├── 03-auth.md                  # 인증 도메인
├── 04-workplace.md             # 사업장 도메인
├── 05-member.md                # 멤버십 도메인
├── 06-invitation.md            # 초대 도메인
├── 07-attendance.md            # 출퇴근 도메인
├── 08-payroll.md               # 급여 도메인
├── 09-calendar.md              # 캘린더 도메인
├── 10-checklist.md             # 체크리스트 도메인
├── 11-contract.md              # 근로계약서 도메인
├── 12-announcement.md          # 공지사항 도메인
├── 13-chat.md                  # 채팅 도메인
├── 14-notification.md          # 알림 도메인
├── 15-file.md                  # 파일 업로드 도메인
├── 16-global.md                # 전역 설정
└── 17-infra.md                 # 외부 인프라 연동
```

---

## 🚀 빠른 시작

### 1. Spring Initializr에서 프로젝트 생성

[00-spring-initializr.md](./00-spring-initializr.md) 문서를 참고하여 프로젝트를 생성하세요.

### 2. 전체 구조 확인

[01-overview.md](./01-overview.md) 문서에서 전체 패키지 구조와 규칙을 확인하세요.

---

## 📊 도메인 요약

| 도메인 | 설명 | 주요 API | 문서 |
|--------|------|----------|------|
| **user** | 사용자 정보 관리 | 프로필 CRUD, 사업자 정보 | [02-user.md](./02-user.md) |
| **auth** | 인증/인가 | 회원가입, 로그인, JWT | [03-auth.md](./03-auth.md) |
| **workplace** | 사업장 관리 | 사업장 CRUD, GPS 설정 | [04-workplace.md](./04-workplace.md) |
| **member** | 멤버십 관리 | 시급 설정, 근무시간 설정 | [05-member.md](./05-member.md) |
| **invitation** | 초대 관리 | 초대 발송/수락/거부 | [06-invitation.md](./06-invitation.md) |
| **attendance** | 출퇴근 관리 | GPS 출퇴근, 수동입력, 승인 | [07-attendance.md](./07-attendance.md) |
| **payroll** | 급여 관리 | 급여 계산, PDF/Excel 생성 | [08-payroll.md](./08-payroll.md) |
| **calendar** | 캘린더 | 월별/일별 조회 | [09-calendar.md](./09-calendar.md) |
| **checklist** | 체크리스트 | 템플릿 CRUD, 할당, 완료체크 | [10-checklist.md](./10-checklist.md) |
| **contract** | 근로계약서 | 계약서 작성, 서명, 검증 | [11-contract.md](./11-contract.md) |
| **announcement** | 공지사항 | 공지 CRUD, 댓글 | [12-announcement.md](./12-announcement.md) |
| **chat** | 채팅 | WebSocket, 실시간 메시지 | [13-chat.md](./13-chat.md) |
| **notification** | 알림 | 인앱 알림, FCM 푸시 | [14-notification.md](./14-notification.md) |
| **file** | 파일 업로드 | S3 업로드, 이미지 리사이징 | [15-file.md](./15-file.md) |
| **global** | 전역 설정 | Security, Exception, Config | [16-global.md](./16-global.md) |
| **infra** | 외부 연동 | 사업자API, 지오코딩, FCM, S3 | [17-infra.md](./17-infra.md) |

---

## 🗃️ 엔티티 (데이터베이스 테이블) 요약

각 도메인 문서에 해당 도메인의 테이블 스키마가 정의되어 있습니다.

| 도메인 | 테이블 | 설명 |
|--------|--------|------|
| **user** | `users` | 사용자 정보, 사업자 정보 |
| **auth** | `refresh_tokens`, `email_verifications`, `password_resets` | 토큰, 인증 |
| **workplace** | `workplaces` | 사업장 정보, GPS, 초대 코드 |
| **member** | `members` | 사업장-사용자 관계, 시급 |
| **invitation** | `invitations` | 초대 정보, 상태 |
| **attendance** | `attendance_records`, `approval_requests` | 출퇴근 기록, 승인 요청 |
| **payroll** | `payrolls` | 급여 내역, 공제 내역 |
| **checklist** | `checklists`, `checklist_items`, `checklist_assignments`, `task_completions` | 체크리스트 |
| **contract** | `contracts` | 전자 근로계약서 |
| **announcement** | `announcements`, `announcement_attachments`, `comments`, `announcement_reads` | 공지사항, 댓글 |
| **chat** | `chat_rooms`, `chat_room_participants`, `messages`, `message_attachments` | 채팅 |
| **notification** | `notifications`, `notification_settings` | 알림, 알림 설정 |

> 📌 상세한 테이블 스키마는 각 도메인 문서와 [데이터베이스 설계](../../04_database/02-entity-schema.md) 문서를 참조하세요.

---

## 🔧 핵심 의존성

### Spring Initializr 선택

```
✅ Spring Web
✅ Spring Data JPA
✅ Spring Security
✅ Validation
✅ Spring Boot Actuator
✅ Java Mail Sender
✅ WebSocket
✅ PostgreSQL Driver
✅ H2 Database
✅ Flyway Migration
✅ Lombok
✅ Spring Boot DevTools
```

### 추가 의존성 (build.gradle)

```
📝 JWT (jjwt 0.12.6)
📝 QueryDSL 5.1.0
📝 MapStruct 1.5.5
📝 SpringDoc OpenAPI 2.6.0
📝 iText PDF 8.0.5
📝 Apache POI 5.3.0
📝 Firebase Admin 9.3.0
📝 Caffeine Cache 3.1.8
```

---

## 📐 계층 구조

```
Controller (API 엔드포인트)
    ↓
Service (비즈니스 로직)
    ↓
Repository (데이터 액세스)
    ↓
Entity (도메인 모델)
```

---

## 📝 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| Controller | `{Domain}Controller` | `UserController.java` |
| Service | `{Domain}Service` / `{Domain}ServiceImpl` | `UserServiceImpl.java` |
| Repository | `{Domain}Repository` | `UserRepository.java` |
| Entity | `{Domain}` (단수형) | `User.java` |
| Request DTO | `{Domain}{Action}Request` | `UserCreateRequest.java` |
| Response DTO | `{Domain}Response` | `UserResponse.java` |
| Mapper | `{Domain}Mapper` | `UserMapper.java` |

---

## 🔗 관련 문서

- [프론트엔드 파일 구조](../front/)
- [기술 스택](../../tech-stack.md)
- [데이터베이스 설계](../../04_database/01-database-design.md)
- [기능 요구사항](../../02_requirements/functional.md)
- [코딩 컨벤션](../../06_development/coding-conventions.md)

