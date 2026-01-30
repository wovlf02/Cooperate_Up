# 🏗️ 인프라스트럭처

## 개요

프로젝트의 인프라 관련 설정 및 배포 환경입니다.

---

## 문서 목록

| 문서 | 설명 |
|------|------|
| [docker.md](./docker.md) | Docker Compose 구성 및 명령어 |
| [environment.md](./environment.md) | 환경 변수 설정 |
| [database.md](./database.md) | Prisma, PostgreSQL, Redis |
| [logging.md](./logging.md) | 로깅 시스템 |
| [scripts.md](./scripts.md) | 유틸리티 스크립트 |

---

## 기술 스택

| 기술 | 용도 | 버전 |
|------|------|------|
| Docker | 컨테이너화 | - |
| Docker Compose | 멀티 컨테이너 오케스트레이션 | 3.8 |
| PostgreSQL | 데이터베이스 | 14-alpine |
| Redis | 캐싱, Socket.io Adapter | 7-alpine |
| Prisma | ORM | - |
| Next.js | 메인 애플리케이션 | - |
| Node.js | 시그널링 서버 | - |

---

## 빠른 시작

### Docker 환경 시작

```bash
docker-compose up -d
```

### Prisma 마이그레이션

```bash
npx prisma migrate dev
npx prisma generate
```

### 시드 데이터

```bash
npx prisma db seed
```

→ [Docker 상세](./docker.md)

---

## 배포 체크리스트

### 프로덕션 배포 전

- [ ] `NEXTAUTH_SECRET` 강력한 키로 변경
- [ ] `POSTGRES_PASSWORD` 강력한 비밀번호로 변경
- [ ] OAuth 프로바이더 프로덕션 키 설정
- [ ] `NODE_ENV=production` 설정
- [ ] HTTPS 설정
- [ ] 방화벽 설정 (필요한 포트만 개방)
- [ ] 로그 로테이션 설정
- [ ] 백업 정책 수립

→ [환경 변수 상세](./environment.md)

### 포트 설정

| 포트 | 서비스 | 외부 노출 |
|------|--------|----------|
| 3000 | Next.js | ✅ (Nginx 프록시 권장) |
| 4000 | Signaling | ✅ |
| 5432 | PostgreSQL | ❌ |
| 6379 | Redis | ❌ |

---

## 관련 문서

- [공통 컴포넌트](../18-common/README.md)
- [테스트](../20-testing/README.md)
- [기술 스택](../00-overview/tech-stack.md)
- [배포](../00-overview/deployment.md)
