# 🏗️ 인프라스트럭처

## 개요

프로젝트의 인프라 관련 설정 및 배포 환경입니다.

---

## 기술 스택

| 기술 | 용도 |
|------|------|
| Docker | 컨테이너화 |
| Docker Compose | 멀티 컨테이너 오케스트레이션 |
| PostgreSQL | 데이터베이스 |
| Redis | 캐싱, Socket.io Adapter |
| Prisma | ORM |

---

## Docker Compose 구성

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 메인 애플리케이션 (Next.js)
  coup:
    build: ./coup
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # 시그널링 서버
  signaling:
    build: ./signaling-server
    ports:
      - "4000:4000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # PostgreSQL
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=coup
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=coup

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 환경 변수

### 메인 애플리케이션 (.env)

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/coup"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth 프로바이더
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

# Redis
REDIS_URL="redis://localhost:6379"

# 시그널링 서버
NEXT_PUBLIC_SIGNALING_URL="http://localhost:4000"

# 파일 업로드
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="image/*,application/pdf,..."
```

### 시그널링 서버 (.env)

```env
PORT=4000
NEXTJS_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## 데이터베이스

### Prisma 명령어

```bash
# 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# 클라이언트 생성
npx prisma generate

# 스키마 시드
npx prisma db seed

# 스튜디오 열기
npx prisma studio
```

### 스키마 구조

```
prisma/
├── schema.prisma          # 메인 스키마
├── seed.js                # 시드 데이터
└── migrations/            # 마이그레이션 히스토리
```

---

## Redis

### 용도

| 용도 | 설명 |
|------|------|
| 세션 캐싱 | 사용자 세션 저장 |
| Socket.io Adapter | 다중 서버 간 이벤트 공유 |
| Rate Limiting | API 요청 제한 |
| 캐싱 | 자주 사용되는 데이터 캐싱 |

### 연결

```javascript
// lib/redis.js
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.connect();

export default redis;
```

---

## 로깅

### 로그 디렉토리

```
coup/logs/
├── app.log              # 애플리케이션 로그
├── error.log            # 에러 로그
├── admin.log            # 관리자 활동 로그
└── security.log         # 보안 로그
```

### 로그 레벨

| 레벨 | 설명 |
|------|------|
| DEBUG | 개발 디버깅 |
| INFO | 일반 정보 |
| WARN | 경고 |
| ERROR | 에러 |
| CRITICAL | 심각한 에러 |

---

## 스크립트

### 관리 스크립트

```
coup/scripts/
├── create-super-admin.js    # 슈퍼 관리자 생성
├── seed-settings.js         # 설정 시드
├── activate-users.js        # 사용자 활성화
├── reset-password.js        # 비밀번호 초기화
└── ...
```

### 실행

```bash
node scripts/create-super-admin.js
node scripts/seed-settings.js
```

---

## 배포

### 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 프로덕션 환경

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Docker 배포

```bash
# 이미지 빌드
docker-compose build

# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 관련 문서

- [배포 가이드](../00-overview/deployment.md)
- [기술 스택](../00-overview/tech-stack.md)

