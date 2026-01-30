# 데이터베이스 설계 개요

## 1. 기술 스택

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Database Architecture                            │
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │  React Native   │────▶│  Spring Boot    │────▶│    Database     │   │
│  │   0.83 (JS)     │     │   4.0.1 + MyBatis│    │                 │   │
│  └─────────────────┘     └─────────────────┘     │ ┌─────────────┐ │   │
│                                 │                 │ │ H2 (개발)   │ │   │
│                                 │                 │ └─────────────┘ │   │
│                                 ▼                 │ ┌─────────────┐ │   │
│                          ┌──────────────┐        │ │ PostgreSQL  │ │   │
│                          │   MyBatis    │        │ │  (운영)     │ │   │
│                          │   Mapper     │        │ └─────────────┘ │   │
│                          └──────────────┘        └─────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.1 개발 환경 (H2 Database)

| 항목 | 설정 |
|------|------|
| **Mode** | PostgreSQL 호환 모드 |
| **URL** | `jdbc:h2:mem:bizonedb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1` |
| **Console** | `/h2-console` (개발 환경만) |
| **초기화** | Flyway + Entity 자동 생성 |

### 1.2 운영 환경 (PostgreSQL)

| 항목 | 설정 |
|------|------|
| **Version** | 18.1 |
| **Host** | Amazon RDS |
| **Encoding** | UTF-8 |
| **Collation** | ko_KR.UTF-8 |

---

## 2. ERD (Entity Relationship Diagram)

### 2.1 전체 구조도

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              GLOBAL ENTITIES                                         │
│                                                                                      │
│  ┌─────────────────────┐          ┌─────────────────────┐                          │
│  │       users         │          │    app_configs      │                          │
│  │─────────────────────│          │─────────────────────│                          │
│  │ PK: id              │          │ PK: id              │                          │
│  │    username         │          │    config_type      │                          │
│  │    email            │          │    config_key       │                          │
│  │    password_hash    │          │    config_value     │                          │
│  │    role (admin/emp) │          └─────────────────────┘                          │
│  └──────────┬──────────┘                                                            │
│             │                                                                        │
│             │ 1:N                                                                    │
│             ▼                                                                        │
│  ┌─────────────────────┐                                                            │
│  │    refresh_tokens   │                                                            │
│  │─────────────────────│                                                            │
│  │ PK: id              │                                                            │
│  │ FK: user_id         │                                                            │
│  └─────────────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
                             │
                             │ 1:N (소유)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             WORKPLACE ENTITIES                                       │
│                                                                                      │
│  ┌─────────────────────┐                                                            │
│  │     workplaces      │◀──────────────────────────────────────────────────────┐   │
│  │─────────────────────│                                                        │   │
│  │ PK: id              │                                                        │   │
│  │ FK: owner_id (user) │                                                        │   │
│  │    name, address    │                                                        │   │
│  │    lat, lng, radius │                                                        │   │
│  └──────────┬──────────┘                                                        │   │
│             │                                                                    │   │
│             │ 1:N                                                                │   │
│             ▼                                                                    │   │
│  ┌─────────────────────┐     ┌─────────────────────┐                           │   │
│  │      members        │     │    invitations      │                           │   │
│  │─────────────────────│     │─────────────────────│                           │   │
│  │ PK: id              │     │ PK: id              │                           │   │
│  │ FK: workplace_id    │     │ FK: workplace_id    │                           │   │
│  │ FK: user_id         │     │ FK: inviter_id      │                           │   │
│  │    role, hourly_wage│     │ FK: invitee_id      │                           │   │
│  └─────────────────────┘     │    status           │                           │   │
│                               └─────────────────────┘                           │   │
│                                                                                  │   │
└──────────────────────────────────────────────────────────────────────────────────────┘
                             │
                             │ 1:N (사업장별 데이터)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS ENTITIES (workplace_id 기반)                      │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          ATTENDANCE                                           │  │
│  │  ┌─────────────────────┐     ┌─────────────────────┐                        │  │
│  │  │ attendance_records  │     │  approval_requests  │                        │  │
│  │  │─────────────────────│     │─────────────────────│                        │  │
│  │  │ PK: id              │     │ PK: id              │                        │  │
│  │  │ FK: workplace_id    │     │ FK: workplace_id    │                        │  │
│  │  │ FK: user_id         │     │ FK: user_id         │                        │  │
│  │  │    date, clock_in/out    │ FK: attendance_id    │                        │  │
│  │  └─────────────────────┘     │    type, status     │                        │  │
│  │                               └─────────────────────┘                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          CHECKLIST                                            │  │
│  │  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │  │
│  │  │   checklists    │────▶│ checklist_items │     │task_completions │        │  │
│  │  │─────────────────│ 1:N │─────────────────│     │─────────────────│        │  │
│  │  │ PK: id          │     │ PK: id          │     │ PK: id          │        │  │
│  │  │ FK: workplace_id│     │ FK: checklist_id│     │ FK: workplace_id│        │  │
│  │  └────────┬────────┘     └─────────────────┘     │ FK: user_id     │        │  │
│  │           │                                       │ FK: item_id     │        │  │
│  │           │ 1:N                                   └─────────────────┘        │  │
│  │           ▼                                                                   │  │
│  │  ┌─────────────────────┐     ┌─────────────────────┐                        │  │
│  │  │checklist_assignments│    │ checklist_favorites │                        │  │
│  │  │─────────────────────│     │─────────────────────│                        │  │
│  │  │ PK: id              │     │ PK: id              │                        │  │
│  │  │ FK: checklist_id    │     │ FK: checklist_id    │                        │  │
│  │  │ FK: user_id         │     │ FK: user_id         │                        │  │
│  │  └─────────────────────┘     └─────────────────────┘                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          CONTRACT & PAYROLL                                   │  │
│  │  ┌─────────────────────┐     ┌─────────────────────┐                        │  │
│  │  │     contracts       │     │      payrolls       │                        │  │
│  │  │─────────────────────│     │─────────────────────│                        │  │
│  │  │ PK: id              │     │ PK: id              │                        │  │
│  │  │ FK: workplace_id    │     │ FK: workplace_id    │                        │  │
│  │  │ FK: employee_id     │     │ FK: user_id         │                        │  │
│  │  │    contract_details │     │    year, month      │                        │  │
│  │  │    signatures       │     │    earnings/deduct  │                        │  │
│  │  └─────────────────────┘     └─────────────────────┘                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          ANNOUNCEMENT                                         │  │
│  │  ┌─────────────────┐ 1:N ┌───────────────────────┐                          │  │
│  │  │  announcements  │────▶│announcement_attachments│                          │  │
│  │  │─────────────────│     └───────────────────────┘                          │  │
│  │  │ PK: id          │ 1:N ┌───────────────────────┐                          │  │
│  │  │ FK: workplace_id│────▶│  announcement_reads   │                          │  │
│  │  │ FK: author_id   │     └───────────────────────┘                          │  │
│  │  └────────┬────────┘ 1:N ┌───────────────────────┐                          │  │
│  │           └─────────────▶│       comments        │◀───┐ (self-reference)    │  │
│  │                          │─────────────────────  │    │ parent_id           │  │
│  │                          │ FK: parent_id ────────┼────┘                     │  │
│  │                          └───────────────────────┘                          │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          CHAT                                                 │  │
│  │  ┌─────────────────┐ 1:N ┌───────────────────────┐                          │  │
│  │  │   chat_rooms    │────▶│chat_room_participants │                          │  │
│  │  │─────────────────│     └───────────────────────┘                          │  │
│  │  │ PK: id          │ 1:N ┌─────────────────┐ 1:N ┌─────────────────────┐    │  │
│  │  │ FK: workplace_id│────▶│    messages     │────▶│ message_attachments │    │  │
│  │  │ FK: created_by  │     │─────────────────│     └─────────────────────┘    │  │
│  │  └─────────────────┘     │ FK: sender_id   │ 1:N ┌─────────────────────┐    │  │
│  │                          └─────────────────┘────▶│   message_reads     │    │  │
│  │                                                   └─────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 관계 설계 원칙

### 3.1 N:N 관계 해결 방안

기존 N:N 관계를 중간 테이블을 통해 1:N + N:1 관계로 분리합니다.

| 원래 관계 | 분리 후 구조 |
|----------|-------------|
| users ↔ workplaces | users 1:N members N:1 workplaces |
| users ↔ checklists (할당) | users 1:N checklist_assignments N:1 checklists |
| users ↔ checklists (즐겨찾기) | users 1:N checklist_favorites N:1 checklists |
| users ↔ chat_rooms | users 1:N chat_room_participants N:1 chat_rooms |
| users ↔ announcements (읽음) | users 1:N announcement_reads N:1 announcements |
| users ↔ messages (읽음) | users 1:N message_reads N:1 messages |

### 3.2 관계 유형 정리

#### 1:1 관계
- 없음 (필요 시 확장 가능)

#### 1:N 관계 (부모 → 자식)
| 부모 | 자식 | 설명 |
|------|------|------|
| users | refresh_tokens | 사용자별 토큰 |
| users | password_history | 비밀번호 변경 이력 |
| users | workplaces | 사업장 소유 (owner_id) |
| workplaces | members | 사업장별 멤버 |
| workplaces | invitations | 사업장별 초대 |
| workplaces | attendance_records | 사업장별 출퇴근 |
| workplaces | checklists | 사업장별 체크리스트 |
| workplaces | contracts | 사업장별 계약서 |
| workplaces | payrolls | 사업장별 급여 |
| workplaces | announcements | 사업장별 공지 |
| workplaces | chat_rooms | 사업장별 채팅방 |
| checklists | checklist_items | 체크리스트별 항목 |
| checklists | checklist_assignments | 체크리스트별 할당 |
| checklists | checklist_favorites | 체크리스트별 즐겨찾기 |
| announcements | announcement_attachments | 공지별 첨부파일 |
| announcements | announcement_reads | 공지별 읽음 |
| announcements | comments | 공지별 댓글 |
| comments | comments | 댓글 → 대댓글 (self-reference) |
| chat_rooms | chat_room_participants | 채팅방별 참여자 |
| chat_rooms | messages | 채팅방별 메시지 |
| messages | message_attachments | 메시지별 첨부파일 |
| messages | message_reads | 메시지별 읽음 |

#### N:1 관계 (자식 → 부모)
모든 1:N의 역방향

---

## 4. 데이터 무결성

### 4.1 외래 키 제약조건

```sql
-- 삭제 규칙
ON DELETE CASCADE    -- 부모 삭제 시 자식도 삭제 (예: workplace 삭제 시 members 삭제)
ON DELETE SET NULL   -- 부모 삭제 시 자식의 FK를 NULL로 (예: processed_by)
ON DELETE RESTRICT   -- 부모 삭제 불가 (참조 중이면)
```

| 테이블 | FK | 삭제 규칙 | 이유 |
|--------|-----|----------|------|
| members | workplace_id | CASCADE | 사업장 삭제 시 멤버십 삭제 |
| members | user_id | CASCADE | 사용자 탈퇴 시 멤버십 삭제 |
| attendance_records | workplace_id | CASCADE | 사업장 삭제 시 기록 삭제 |
| attendance_records | user_id | SET NULL | 사용자 탈퇴 후에도 기록 유지 |
| comments | parent_id | CASCADE | 부모 댓글 삭제 시 대댓글 삭제 |

### 4.2 CHECK 제약조건

```sql
-- 역할 제한
CHECK (role IN ('admin', 'employee'))

-- 상태 제한
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))

-- 범위 제한
CHECK (month BETWEEN 1 AND 12)
CHECK (payment_date BETWEEN 1 AND 31)

-- 양수 제한
CHECK (hourly_wage >= 0)
CHECK (radius > 0)
```

---

## 5. 성능 고려사항

### 5.1 쿼리 패턴 분석

| 패턴 | 빈도 | 최적화 방안 |
|------|------|------------|
| 사업장별 멤버 조회 | 매우 높음 | `workplace_id` 인덱스 |
| 사용자별 출퇴근 조회 | 높음 | `(workplace_id, user_id, date)` 복합 인덱스 |
| 날짜별 출퇴근 조회 | 높음 | `(workplace_id, date)` 인덱스 |
| 체크리스트 완료 조회 | 높음 | `(workplace_id, user_id, date)` 인덱스 |
| 채팅 메시지 조회 | 높음 | `(chat_room_id, created_at DESC)` 인덱스 |
| 공지사항 목록 | 중간 | `(workplace_id, is_pinned, created_at)` 인덱스 |

### 5.2 비정규화 항목

조회 성능을 위해 일부 데이터를 중복 저장합니다:

| 테이블 | 중복 필드 | 원본 | 이유 |
|--------|----------|------|------|
| attendance_records | user_name | users.name | JOIN 감소 |
| task_completions | user_name, checklist_name, item_title | 각 테이블 | 이력 조회 성능 |
| invitations | workplace_name, inviter_name, invitee_name | 각 테이블 | JOIN 감소 |
| comments | author_name | users.name | JOIN 감소 |
| messages | sender_name | users.name | JOIN 감소 |
| chat_rooms | last_message_* | messages | 목록 조회 최적화 |
| announcements | author_name | users.name | JOIN 감소 |

### 5.3 파티셔닝 고려 (대규모 운영 시)

```sql
-- 출퇴근 기록: 월별 파티션
CREATE TABLE attendance_records (
    ...
) PARTITION BY RANGE (date);

-- 메시지: 월별 파티션
CREATE TABLE messages (
    ...
) PARTITION BY RANGE (created_at);
```

