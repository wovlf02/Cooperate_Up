# 스터디 데이터 추가 가이드

## 📊 데이터베이스 분석 결과

### 현재 구조
- **Study 테이블**: 스터디 정보 저장
- **필수 필드**: 
  - `id`: 고유 ID (CUID)
  - `ownerId`: 스터디 소유자 (User의 id)
  - `name`: 스터디 이름
  - `emoji`: 이모지
  - `description`: 설명
  - `category`: 카테고리
  - `tags`: 태그 배열 (PostgreSQL ARRAY)
  - `inviteCode`: 초대 코드 (UNIQUE)

### 추가된 20개 스터디 목록

1. **TypeScript 마스터클래스** 📘 - 고급 타입 시스템
2. **Rust 시스템 프로그래밍** 🦀 - 안전한 시스템 프로그래밍
3. **MongoDB 실전 가이드** 🍃 - NoSQL 완전정복
4. **Redis 캐싱 전략** ⚡ - 고성능 캐싱
5. **Next.js 13 App Router** ▲ - 최신 웹 개발
6. **gRPC 마이크로서비스** 🔌 - 고성능 API
7. **Terraform 인프라 자동화** 🏗️ - IaC
8. **WebAssembly 개발** ⚙️ - 고성능 웹
9. **GitHub Actions CI/CD** 🔄 - 자동화 파이프라인
10. **Svelte & SvelteKit** 🔥 - 간결한 프레임워크
11. **Elasticsearch 검색 엔진** 🔍 - 강력한 검색
12. **FastAPI 백엔드 개발** ⚡ - 모던 Python API
13. **Three.js 3D 웹** 🎨 - 3D 웹 그래픽스
14. **NestJS 엔터프라이즈** 🐈 - 확장 가능한 백엔드
15. **PostgreSQL 고급 튜닝** 🐘 - 성능 최적화
16. **Figma to Code** 🎨 - 디자인 구현
17. **RabbitMQ 메시지 큐** 🐰 - 비동기 처리
18. **Tailwind CSS 마스터** 💨 - 빠른 UI 구축
19. **Playwright E2E 테스트** 🎭 - 안정적인 테스트
20. **Go 동시성 프로그래밍** 🐹 - 고성능 서버

## 🚀 SQL 실행 방법

### 방법 1: psql 명령줄 사용

```bash
# PostgreSQL에 연결
psql -U your_username -d coup

# SQL 파일 실행
\i C:/Project/CoUp/coup/scripts/add-more-studies.sql

# 또는 한 줄로
psql -U your_username -d coup -f C:/Project/CoUp/coup/scripts/add-more-studies.sql
```

### 방법 2: Prisma Studio 사용

```bash
cd C:\Project\CoUp\coup
npx prisma studio
```

그런 다음 "Query" 탭에서 SQL을 직접 실행할 수 있습니다.

### 방법 3: DBeaver / pgAdmin 사용

1. DBeaver 또는 pgAdmin 실행
2. `coup` 데이터베이스 연결
3. SQL 에디터 열기
4. `add-more-studies.sql` 파일 내용 붙여넣기
5. 실행

### 방법 4: Node.js 스크립트 사용

```bash
cd C:\Project\CoUp\coup
node scripts/add-more-studies.js
```

(아래 스크립트 파일을 사용)

## ⚠️ 주의사항

1. **백업**: 먼저 데이터베이스 백업을 권장합니다
   ```bash
   pg_dump coup > backup_$(date +%Y%m%d).sql
   ```

2. **사용자 ID 확인**: SQL 파일의 `ownerId`가 실제 사용자 ID와 일치하는지 확인
   ```sql
   SELECT id, name, email FROM "User" LIMIT 10;
   ```

3. **중복 확인**: 같은 이름의 스터디가 없는지 확인
   ```sql
   SELECT name FROM "Study" WHERE name LIKE '%TypeScript%';
   ```

## 🔍 실행 후 확인

```sql
-- 총 스터디 수 확인
SELECT COUNT(*) as total_studies FROM "Study";

-- 최근 추가된 스터디 확인
SELECT name, emoji, category, "isRecruiting", "createdAt" 
FROM "Study" 
ORDER BY "createdAt" DESC 
LIMIT 20;

-- 카테고리별 통계
SELECT category, COUNT(*) as count 
FROM "Study" 
GROUP BY category 
ORDER BY count DESC;
```

## 📈 예상 결과

- 기존 스터디: 30개 (seed.js 기준)
- 추가 스터디: 20개
- **총 스터디: 50개**

## 🎯 스터디 탐색 확인

SQL 실행 후 애플리케이션에서:
1. `/studies` 페이지 접속
2. 새로운 스터디 20개가 표시되는지 확인
3. 필터링 및 검색 기능 테스트

## 🐛 문제 해결

### "duplicate key value violates unique constraint"
- `inviteCode`가 중복되는 경우
- SQL 파일에서 `invite_xxx_001` 부분을 고유하게 수정

### "foreign key constraint"
- `ownerId`가 존재하지 않는 경우
- 먼저 사용자 ID를 확인하고 SQL 수정

### "relation does not exist"
- 테이블 이름이 잘못된 경우
- PostgreSQL에서는 대소문자 구분을 위해 `"Study"` 형식 사용

