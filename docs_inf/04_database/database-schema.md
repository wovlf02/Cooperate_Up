# 데이터베이스 스키마 (통합 문서)

## 1. 개요

Biz_One 애플리케이션의 데이터베이스 설계 문서입니다.

### 1.1 기술 스택

| 구성요소 | 개발 환경 | 운영 환경 |
|----------|----------|----------|
| **Database** | H2 2.x (PostgreSQL 모드) | PostgreSQL 18.1 |
| **Backend** | Spring Boot 4.0.1 | Spring Boot 4.0.1 |
| **ORM** | MyBatis 3.5.x | MyBatis 3.5.x |
| **JDK** | 21.0.8 LTS | 21.0.8 LTS |
| **Migration** | Flyway 10.x | Flyway 10.x |
| **Cache** | - | Redis (ElastiCache) |

### 1.2 연동 구조

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Native   │────▶│  Spring Boot    │────▶│    Database     │
│   0.83 (JS)     │     │  4.0.1 + MyBatis│     │  H2 / PostgreSQL│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               │                        │
                               ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │    Node.js      │────▶│     Redis       │
                        │  24.11.0 LTS    │     │  (ElastiCache)  │
                        │  (Signaling)    │     │                 │
                        └─────────────────┘     └─────────────────┘
```

### 1.3 설계 원칙

1. **N:N 관계 배제**: 모든 관계는 1:1, 1:N, N:1로만 구성 (중간 테이블 활용)
2. **정규화**: 제3정규형(3NF) 준수
3. **비정규화**: 조회 성능 최적화를 위한 선별적 비정규화
4. **멀티테넌트**: `workplace_id` 기반 데이터 격리
5. **Soft Delete**: 중요 데이터는 물리 삭제 대신 `is_active` 플래그 사용
6. **BIGINT PK**: UUID 대신 BIGINT 자동 증가 사용 (성능)

---

## 2. ERD 개요

### 2.1 테이블 분류

| 분류 | 테이블 | 설명 |
|------|--------|------|
| **사용자** | users, refresh_tokens, password_history | 사용자 및 인증 |
| **사업장** | workplaces, members, invitations | 사업장 및 멤버십 |
| **출퇴근** | attendance_records, approval_requests | 근태 관리 |
| **체크리스트** | checklists, checklist_items, checklist_assignments, checklist_favorites, task_completions | 업무 체크리스트 |
| **근로계약** | contracts | 전자근로계약서 |
| **급여** | payrolls | 급여 관리 |
| **공지사항** | announcements, announcement_attachments, announcement_reads, comments | 공지 및 댓글 |
| **채팅** | chat_rooms, chat_room_participants, messages, message_attachments, message_reads | 실시간 채팅 |
| **설정** | app_configs | 앱 설정 (최저시급 등) |

**총 25개 테이블**

### 2.2 관계 구조

```
users (전역)
  │
  ├── 1:N ──▶ refresh_tokens
  ├── 1:N ──▶ password_history
  └── 1:N ──▶ workplaces (owner_id)
                  │
                  ├── 1:N ──▶ members ◀── N:1 ── users
                  ├── 1:N ──▶ invitations
                  ├── 1:N ──▶ attendance_records
                  │               └── 1:N ──▶ approval_requests
                  ├── 1:N ──▶ checklists
                  │               ├── 1:N ──▶ checklist_items
                  │               ├── 1:N ──▶ checklist_assignments
                  │               └── 1:N ──▶ checklist_favorites
                  ├── 1:N ──▶ task_completions
                  ├── 1:N ──▶ contracts
                  ├── 1:N ──▶ payrolls
                  ├── 1:N ──▶ announcements
                  │               ├── 1:N ──▶ announcement_attachments
                  │               ├── 1:N ──▶ announcement_reads
                  │               └── 1:N ──▶ comments (self-ref: parent_id)
                  └── 1:N ──▶ chat_rooms
                                  ├── 1:N ──▶ chat_room_participants
                                  └── 1:N ──▶ messages
                                                  ├── 1:N ──▶ message_attachments
                                                  └── 1:N ──▶ message_reads

app_configs (전역 설정 - 독립)
```

---

## 3. 테이블 상세 정의

> 📌 **상세 스키마 정의**: [02-entity-schema.md](./02-entity-schema.md)  
> 📌 **DDL 스크립트**: [03-ddl-scripts.md](./03-ddl-scripts.md)

### 3.1 핵심 테이블 요약

#### users (사용자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| username | VARCHAR(50) UK | 로그인 아이디 |
| email | VARCHAR(255) UK | 이메일 |
| password_hash | VARCHAR(255) | BCrypt 해시 |
| role | VARCHAR(20) | 'admin' / 'employee' |
| business_* | - | 사업자 정보 (관리자용) |
| device_token | VARCHAR(500) | 푸시 알림 토큰 |

#### workplaces (사업장)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| owner_id | BIGINT FK | 사업주 (users.id) |
| name | VARCHAR(200) | 사업장명 |
| address | VARCHAR(500) | 도로명 주소 |
| latitude/longitude | DECIMAL | GPS 좌표 |
| radius | INT | 출퇴근 허용 반경 (미터) |
| invite_code | VARCHAR(20) UK | 초대 코드 |

#### members (멤버십)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| workplace_id | BIGINT FK | 사업장 |
| user_id | BIGINT FK | 사용자 |
| role | VARCHAR(20) | 역할 |
| hourly_wage | INT | 시급 |

#### attendance_records (출퇴근)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| workplace_id | BIGINT FK | 사업장 |
| user_id | BIGINT FK | 사용자 |
| work_date | DATE | 근무일 |
| clock_in/out | TIMESTAMP | 출/퇴근 시각 |
| effective_clock_* | TIMESTAMP | 유효 출/퇴근 (조기출근 조정) |
| work_minutes | INT | 근무 시간 (분) |
| daily_wage | INT | 일급 |

#### payrolls (급여)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| workplace_id | BIGINT FK | 사업장 |
| user_id | BIGINT FK | 사용자 |
| pay_year/month | INT | 급여 연월 |
| total_earnings | INT | 총 지급액 |
| total_deductions | INT | 총 공제액 |
| net_pay | INT | 실수령액 |

---

## 4. 인덱스 전략

> 📌 **상세 인덱스 설계**: [05-indexes-performance.md](./05-indexes-performance.md)

### 4.1 핵심 인덱스

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| users | `uk_users_username` | 로그인 조회 |
| members | `uk_members_workplace_user` | 멤버십 조회 |
| attendance_records | `idx_attendance_workplace_date` | 일별 출퇴근 목록 |
| attendance_records | `idx_attendance_user_date` | 사용자별 출퇴근 |
| messages | `idx_messages_room_created` | 메시지 목록 |
| announcements | `idx_announcements_list` | 공지사항 목록 |

---

## 5. 데이터 접근 권한

| 테이블 | 읽기 | 생성 | 수정 | 삭제 |
|--------|------|------|------|------|
| users | 본인 | 본인 | 본인 | 본인 |
| workplaces | 멤버 | admin | 사업주 | 사업주 |
| members | 멤버 | 사업주 | 사업주 | 사업주 |
| attendance_records | 본인/사업주 | 본인 | 본인/사업주 | 사업주 |
| payrolls | 본인/사업주 | 시스템 | 사업주 | 사업주 |
| contracts | 본인/사업주 | 사업주 | 본인(서명)/사업주 | 사업주 |

---

## 6. 비정규화 항목

조회 성능 최적화를 위해 다음 항목을 중복 저장합니다:

| 테이블 | 중복 필드 | 원본 | 이유 |
|--------|----------|------|------|
| attendance_records | user_name | users.name | JOIN 감소 |
| task_completions | user_name, checklist_name, item_title | 각 테이블 | 이력 보존 |
| invitations | workplace_name, inviter_name, invitee_name | 각 테이블 | JOIN 감소 |
| comments | author_name | users.name | JOIN 감소 |
| messages | sender_name | users.name | JOIN 감소 |
| chat_rooms | last_message_* | messages | 목록 조회 최적화 |
| announcements | author_name, comment_count | - | 목록 조회 최적화 |

---

## 7. 관련 문서

| 문서 | 설명 |
|------|------|
| [01-database-design.md](./01-database-design.md) | 데이터베이스 설계 개요 |
| [02-entity-schema.md](./02-entity-schema.md) | 엔티티 스키마 상세 정의 |
| [03-ddl-scripts.md](./03-ddl-scripts.md) | DDL 스크립트 (H2/PostgreSQL) |
| [04-mybatis-mappers.md](./04-mybatis-mappers.md) | MyBatis Mapper 설계 |
| [05-indexes-performance.md](./05-indexes-performance.md) | 인덱스 및 성능 최적화 |
| [06-entity-classes.md](./06-entity-classes.md) | Spring Boot Entity 클래스 |

---

## 8. 버전 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-25 | 초기 설계 (Spring Boot + MyBatis + H2) |

