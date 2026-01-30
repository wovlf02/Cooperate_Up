# 🗄️ 데이터베이스 개요

## 개요

CoUp은 **PostgreSQL**을 메인 데이터베이스로 사용하며, **Prisma ORM**을 통해 데이터를 관리합니다.

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| **PostgreSQL** | 15 | 관계형 데이터베이스 |
| **Prisma** | 6 | ORM, 마이그레이션, 타입 생성 |
| **@prisma/client** | 6 | 데이터베이스 클라이언트 |

---

## 연결 설정

### Prisma 클라이언트

**파일 위치:** `src/lib/prisma.js`

```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### 연결 문자열

```env
DATABASE_URL="postgresql://user:password@localhost:5432/coup"
```

### Docker 환경

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/coup"
```

---

## 모델 구조

### 모델 분류

| 카테고리 | 모델 | 설명 |
|---------|------|------|
| **사용자** | User, StudyMember, GroupMember | 사용자 및 멤버십 |
| **스터디** | Study, Group, GroupInvite | 스터디 및 그룹 |
| **콘텐츠** | Message, Notice, File, Event, Task | 스터디 내 콘텐츠 |
| **관리자** | AdminRole, Warning, Sanction, AdminLog | 관리 시스템 |
| **기타** | Notification, Report, SystemSetting | 알림, 신고, 설정 |

### 모델 관계도

```
┌─────────────┐         ┌─────────────┐
│    User     │────────▶│    Study    │
│             │ owns    │             │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ has many              │ has many
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ StudyMember │◀────────│   Message   │
│             │ belongs │   Notice    │
└─────────────┘   to    │   File      │
                        │   Event     │
                        │   Task      │
                        └─────────────┘
```

---

## 주요 모델 요약

### User (사용자)

| 필드 | 설명 |
|------|------|
| `id` | 고유 식별자 (cuid) |
| `email` | 이메일 (유니크) |
| `password` | 해시된 비밀번호 (OAuth는 null) |
| `provider` | 인증 방식 (CREDENTIALS, GOOGLE, GITHUB) |
| `role` | 역할 (USER, ADMIN) |
| `status` | 상태 (ACTIVE, SUSPENDED, DELETED) |

### Study (스터디)

| 필드 | 설명 |
|------|------|
| `id` | 고유 식별자 |
| `ownerId` | 소유자 User ID |
| `name` | 스터디 이름 |
| `emoji` | 스터디 이모지 |
| `category` | 카테고리 |
| `maxMembers` | 최대 인원 |
| `isPublic` | 공개 여부 |
| `autoApprove` | 자동 승인 여부 |
| `inviteCode` | 초대 코드 (유니크) |

### Message (채팅 메시지)

| 필드 | 설명 |
|------|------|
| `id` | 고유 식별자 |
| `studyId` | 스터디 ID |
| `userId` | 작성자 ID |
| `content` | 메시지 내용 |
| `readers` | 읽은 사용자 ID 배열 |

---

## 마이그레이션 히스토리

| 날짜 | 마이그레이션 | 설명 |
|------|-------------|------|
| 2025-11-17 | `init` | 초기 스키마 생성 |
| 2025-11-18 | `add_settings` | 설정 테이블 추가 |
| 2025-11-21 | `add_study_tasks` | 스터디 할일 추가 |
| 2025-11-24 | `add_report_target_name` | 신고 대상 이름 필드 |
| 2025-11-27 | `add_admin_models` | 관리자 모델 추가 |
| 2025-11-28 | `add_system_settings` | 시스템 설정 추가 |
| 2025-11-28 | `add_performance_indexes` | 성능 인덱스 추가 |

---

## 스키마 파일

**위치:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 데이터베이스 관리 명령어

### 마이그레이션

```bash
# 개발 환경 마이그레이션 생성 및 적용
npx prisma migrate dev --name <migration_name>

# 프로덕션 마이그레이션 적용
npx prisma migrate deploy

# 마이그레이션 상태 확인
npx prisma migrate status
```

### 스키마 관리

```bash
# Prisma Client 재생성
npx prisma generate

# 스키마를 DB에 직접 적용 (개발용)
npx prisma db push

# DB 스키마 가져오기
npx prisma db pull
```

### 데이터 관리

```bash
# Prisma Studio 실행
npm run db:studio
# 또는
npx prisma studio

# 시드 데이터 실행
npm run db:seed
```

---

## 관련 문서

- [User 모델](./models-user.md) - 사용자 관련 모델
- [Study 모델](./models-study.md) - 스터디 관련 모델
- [Content 모델](./models-content.md) - 콘텐츠 관련 모델
- [Admin 모델](./models-admin.md) - 관리자 관련 모델
- [Enum & Index](./enums-indexes.md) - 열거형 및 인덱스

