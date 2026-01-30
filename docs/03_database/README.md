# 💾 데이터베이스 설계

> CoUp의 PostgreSQL + Prisma 데이터베이스 스키마를 상세히 설명합니다.

---

## 📊 데이터베이스 개요

| 항목 | 내용 |
|------|------|
| **DBMS** | PostgreSQL |
| **ORM** | Prisma 6.19.0 |
| **스키마 파일** | `prisma/schema.prisma` (736줄) |
| **총 모델 수** | 20개 |
| **총 Enum 수** | 20개 |

---

## 📚 이 섹션의 문서

| 문서 | 설명 |
|------|------|
| [erd-diagram.md](./erd-diagram.md) | ERD 다이어그램 (Mermaid) |
| [models/](./models/) | 각 모델별 상세 문서 |
| [relationships.md](./relationships.md) | 테이블 간 관계 설명 |
| [indexes-optimization.md](./indexes-optimization.md) | 인덱스 및 최적화 전략 |

---

## 📁 모델 목록

### 👤 사용자 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **User** | 사용자 기본 정보 | [user.md](./models/user.md) |
| **AdminRole** | 관리자 역할 및 권한 | [admin.md](./models/admin.md) |

### 📖 스터디 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Study** | 스터디 정보 | [study.md](./models/study.md) |
| **StudyMember** | 스터디 멤버십 | [study-member.md](./models/study-member.md) |

### 👥 그룹 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Group** | 그룹 정보 | [group.md](./models/group.md) |
| **GroupMember** | 그룹 멤버십 | [group.md](./models/group.md) |
| **GroupInvite** | 그룹 초대 | [group.md](./models/group.md) |

### 💬 커뮤니케이션 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Message** | 채팅 메시지 | [message.md](./models/message.md) |
| **Notice** | 공지사항 | [message.md](./models/message.md) |
| **Notification** | 시스템 알림 | [notification.md](./models/notification.md) |

### ✅ 태스크 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Task** | 개인 할 일 | [task.md](./models/task.md) |
| **StudyTask** | 스터디 공유 할 일 | [task.md](./models/task.md) |
| **StudyTaskAssignee** | 태스크 담당자 | [task.md](./models/task.md) |

### 📅 일정 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Event** | 캘린더 일정 | [calendar.md](./models/calendar.md) |

### 📁 파일 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **File** | 업로드 파일 | [file.md](./models/file.md) |
| **NoticeFile** | 공지사항 첨부파일 | [file.md](./models/file.md) |

### 🛡️ 관리자 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **Report** | 신고 | [admin.md](./models/admin.md) |
| **Warning** | 경고 | [admin.md](./models/admin.md) |
| **Sanction** | 제재 | [admin.md](./models/admin.md) |
| **AdminLog** | 관리자 활동 로그 | [admin.md](./models/admin.md) |

### ⚙️ 시스템 도메인

| 모델 | 설명 | 문서 |
|------|------|------|
| **SystemSetting** | 시스템 설정 | [settings.md](./models/settings.md) |

---

## 🎯 이 섹션의 목적

- 데이터가 어떤 구조로 저장되는지 이해
- 테이블 간 관계 파악
- API 개발 시 필요한 스키마 정보 제공
- 쿼리 최적화를 위한 인덱스 정보 제공

---

## 🔗 관련 문서

- [API 명세](../04_api/README.md)
- [시스템 아키텍처](../02_architecture/README.md)
