# 🐳 Docker 구성

## 개요

Docker Compose를 사용한 멀티 컨테이너 환경입니다.

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  # Next.js 메인 애플리케이션
  nextjs:
    build:
      context: ./coup
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coup
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./coup:/app
      - /app/node_modules
      - /app/.next
    networks:
      - coup-network

  # 시그널링 서버 (WebRTC)
  signaling:
    build:
      context: ./signaling-server
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - NEXTJS_URL=http://nextjs:3000
      - REDIS_URL=redis://redis:6379
      - ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
      - LOG_LEVEL=info
    depends_on:
      - redis
    networks:
      - coup-network

  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres  # ⚠️ 프로덕션: 강력한 비밀번호 사용!
      - POSTGRES_DB=coup
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - coup-network

  # Redis (Pub/Sub, 캐싱)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - coup-network

networks:
  coup-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## 서비스 의존성

```
┌─────────────────────────────────────────┐
│                 nextjs                   │
│            (Next.js App)                 │
│              :3000                       │
└───────┬─────────────────────┬───────────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│   postgres    │     │    redis      │
│   (Database)  │     │  (Cache/Pub)  │
│    :5432      │     │    :6379      │
└───────────────┘     └───────┬───────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  signaling    │
                      │  (WebRTC)     │
                      │    :4000      │
                      └───────────────┘
```

---

## Docker 명령어

### 개발 환경

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 로그 확인
docker-compose logs -f nextjs
docker-compose logs -f signaling

# 컨테이너 재빌드
docker-compose up -d --build

# 특정 서비스만 재시작
docker-compose restart nextjs
```

### 데이터 관리

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U postgres -d coup

# Redis CLI 접속
docker-compose exec redis redis-cli

# 볼륨 삭제 (⚠️ 모든 데이터 삭제)
docker-compose down -v
```

---

## 시그널링 서버 (WebRTC)

### 구조

```
signaling-server/
├── Dockerfile              # Docker 빌드 설정
├── package.json            # 의존성
├── server.js               # 메인 서버
├── handlers/               # 이벤트 핸들러
├── middleware/             # 미들웨어
└── utils/                  # 유틸리티
```

### 역할

| 기능 | 설명 |
|------|------|
| 시그널링 | WebRTC P2P 연결 설정 |
| Redis Adapter | 다중 서버 환경 지원 |
| 세션 검증 | NextAuth 세션 확인 |
| 룸 관리 | 화상 통화 룸 관리 |

---

## 관련 문서

- [환경 변수](./environment.md)
- [데이터베이스](./database.md)
- [README](./README.md)

