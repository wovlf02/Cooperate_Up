# 🚀 배포 및 환경 설정

## 개요

CoUp은 Docker를 통한 컨테이너화 배포를 권장하며, 로컬 개발 환경도 지원합니다.

---

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **Next.js App** | 3000 | 메인 웹 애플리케이션 |
| **Signaling Server** | 4000 | 실시간 통신 서버 |
| **PostgreSQL** | 5432 | 데이터베이스 |
| **Redis** | 6379 | 캐시/Pub-Sub |
| **Prisma Studio** | 5555 | DB 관리 (개발용) |

---

## Docker 배포 (권장)

### 전체 서비스 시작

```bash
# 저장소 클론
git clone https://github.com/wovlf02/CoUp.git
cd CoUp

# 환경 변수 설정
cp coup/.env.example coup/.env
cp signaling-server/.env.example signaling-server/.env

# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down

# 볼륨 포함 완전 삭제
docker-compose down -v
```

### 개별 서비스 관리

```bash
# 특정 서비스만 시작
docker-compose up -d postgres redis

# 특정 서비스 재시작
docker-compose restart nextjs

# 특정 서비스 로그
docker-compose logs -f signaling
```

### Docker Compose 구성

```yaml
services:
  nextjs:           # Next.js 앱 (포트 3000)
    build: ./coup
    depends_on: [postgres, redis]
    
  signaling:        # Signaling 서버 (포트 4000)
    build: ./signaling-server
    depends_on: [redis]
    
  postgres:         # PostgreSQL (포트 5432)
    image: postgres:14-alpine
    
  redis:            # Redis (포트 6379)
    image: redis:7-alpine
```

---

## 환경 변수

### Next.js App (coup/.env)

```env
# ===========================================
# Database
# ===========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coup"

# ===========================================
# NextAuth
# ===========================================
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# OAuth Providers (선택사항)
# ===========================================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ===========================================
# Redis (선택사항)
# ===========================================
REDIS_URL="redis://localhost:6379"

# ===========================================
# Socket.IO
# ===========================================
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"

# ===========================================
# File Upload
# ===========================================
MAX_FILE_SIZE=10485760  # 10MB

# ===========================================
# Logging
# ===========================================
LOG_LEVEL="info"
```

### Signaling Server (signaling-server/.env)

```env
# ===========================================
# Server Configuration
# ===========================================
PORT=4000
NODE_ENV=development

# ===========================================
# Next.js URL (인증용)
# ===========================================
NEXTJS_URL=http://localhost:3000

# ===========================================
# Redis Configuration
# ===========================================
REDIS_URL=redis://localhost:6379

# ===========================================
# CORS Configuration
# ===========================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ===========================================
# Logging
# ===========================================
LOG_LEVEL=info
```

### Docker 내부 환경 변수

Docker Compose 실행 시 환경 변수가 자동 설정됩니다:

```env
# Next.js (Docker 내부)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coup
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Signaling (Docker 내부)
NEXTJS_URL=http://nextjs:3000
REDIS_URL=redis://redis:6379
```

---

## 로컬 개발 환경

### 필수 요구사항

| 요구사항 | 버전 |
|----------|------|
| Node.js | 18.x 이상 |
| npm | 9.x 이상 |
| PostgreSQL | 15.x 이상 |
| Redis | 7.x 이상 (선택) |

### 설정 단계

```bash
# 1. 저장소 클론
git clone https://github.com/wovlf02/CoUp.git
cd CoUp

# 2. DB만 Docker로 실행
docker-compose up -d postgres redis

# 3. Next.js 앱 설정
cd coup
npm install

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# 5. 데이터베이스 마이그레이션
npx prisma migrate dev

# 6. 시드 데이터 생성 (선택)
npm run db:seed

# 7. 개발 서버 시작
npm run dev
```

### Signaling 서버 별도 실행 (선택)

```bash
# 별도 터미널에서
cd signaling-server
npm install
cp .env.example .env
npm run dev
```

---

## 데이터베이스 관리

### Prisma 명령어

```bash
# 마이그레이션 생성 및 적용
npx prisma migrate dev --name <migration_name>

# 마이그레이션만 적용 (프로덕션)
npx prisma migrate deploy

# 스키마 동기화 (개발용)
npx prisma db push

# Prisma Client 재생성
npx prisma generate

# Prisma Studio 실행
npm run db:studio
# 또는
npx prisma studio

# 시드 데이터 실행
npm run db:seed
```

### 데이터베이스 백업/복원

```bash
# 백업 (Docker)
docker exec coup-postgres-1 pg_dump -U postgres coup > backup.sql

# 복원 (Docker)
docker exec -i coup-postgres-1 psql -U postgres coup < backup.sql
```

---

## 프로덕션 배포 체크리스트

### 보안 설정

- [ ] `NEXTAUTH_SECRET` 강력한 랜덤 키로 변경
- [ ] PostgreSQL 비밀번호 변경
- [ ] OAuth Client ID/Secret 프로덕션용으로 변경
- [ ] CORS 설정 프로덕션 도메인으로 제한
- [ ] `.env` 파일 버전 관리에서 제외 확인

### 환경 설정

- [ ] `NODE_ENV=production` 설정
- [ ] HTTPS 설정
- [ ] 로그 레벨 조정
- [ ] 파일 업로드 경로 설정

### 성능 최적화

- [ ] Next.js 빌드 최적화 확인
- [ ] 이미지 최적화 설정
- [ ] 캐시 설정 확인
- [ ] DB 인덱스 최적화

---

## npm Scripts

### coup (Next.js)

```json
{
  "scripts": {
    "dev": "node server.mjs",
    "build": "next build",
    "start": "node server.mjs",
    "lint": "eslint",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
    "db:seed": "node prisma/seed.js",
    "db:studio": "npx prisma studio"
  }
}
```

---

## 트러블슈팅

### 포트 충돌

```bash
# 사용 중인 포트 확인
netstat -ano | findstr :3000
lsof -i :3000  # Linux/Mac

# 프로세스 종료
taskkill /PID <PID> /F  # Windows
kill -9 <PID>           # Linux/Mac
```

### Prisma 오류

```bash
# Client 재생성
npx prisma generate

# 스키마 동기화 문제
npx prisma db push --force-reset  # ⚠️ 데이터 삭제됨
```

### Docker 볼륨 문제

```bash
# 볼륨 정리
docker volume prune

# 특정 볼륨 삭제
docker volume rm coup_postgres_data
```

---

## 관련 문서

- [아키텍처](./architecture.md) - 시스템 구조
- [폴더 구조](./folder-structure.md) - 디렉터리 구성
- [기술 스택](./tech-stack.md) - 사용 기술
- [Docker 설정](../19-infrastructure/docker.md) - 상세 Docker 구성

