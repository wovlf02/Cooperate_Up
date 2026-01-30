# 데이터베이스 설계 문서

## 📁 문서 구조

```
04_database/
├── README.md                    # 개요 (이 파일)
├── 01-database-design.md        # 데이터베이스 설계 개요
├── 02-entity-schema.md          # 엔티티 스키마 정의
├── 03-ddl-scripts.md            # DDL 스크립트 (H2/PostgreSQL)
├── 04-mybatis-mappers.md        # MyBatis Mapper 설계
├── 05-indexes-performance.md    # 인덱스 및 성능 최적화
└── 06-entity-classes.md         # Spring Boot Entity 클래스
```

---

## 🛠️ 기술 스택

| 구성요소 | 기술 | 버전 |
|----------|------|------|
| **Backend** | Spring Boot | 4.0.1 |
| **JDK** | Java | 21.0.8 LTS |
| **ORM** | MyBatis | 3.5.x |
| **개발 DB** | H2 Database | 2.x |
| **운영 DB** | PostgreSQL | 18.1 |
| **Migration** | Flyway | 10.x |

---

## 📊 데이터베이스 개요

### 설계 원칙

1. **N:N 관계 배제**: 모든 관계는 1:1, 1:N, N:1로만 구성
2. **정규화**: 3NF(제3정규형) 준수
3. **성능 최적화**: 적절한 인덱스, 비정규화(조회 최적화)
4. **멀티테넌트**: `workplace_id` 기반 데이터 격리
5. **Soft Delete**: 중요 데이터는 물리 삭제 대신 논리 삭제

### 테이블 분류

| 분류 | 테이블 수 | 설명 |
|------|----------|------|
| 사용자/인증 | 3개 | users, refresh_tokens, password_history |
| 사업장 | 3개 | workplaces, members, invitations |
| 출퇴근 | 2개 | attendance_records, approval_requests |
| 체크리스트 | 5개 | checklists, checklist_items, checklist_assignments, checklist_favorites, task_completions |
| 근로계약 | 1개 | contracts |
| 급여 | 1개 | payrolls |
| 공지사항 | 4개 | announcements, announcement_attachments, announcement_reads, comments |
| 채팅 | 5개 | chat_rooms, chat_room_participants, messages, message_attachments, message_reads |
| 설정 | 1개 | app_configs |
| **총계** | **25개** | |

---

## 🔗 관련 문서

- [기능 요구사항](../02_requirements/functional.md)
- [보안 설계](../11_security/README.md)
- [아키텍처](../03_architecture/system-design.md)

