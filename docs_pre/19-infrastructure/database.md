# 🗄️ 데이터베이스 & Redis

## 개요

PostgreSQL과 Redis 설정입니다.

---

## Prisma 클라이언트 설정

```javascript
// src/lib/prisma.js
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

export default prisma
```

---

## Prisma 명령어

```bash
# 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# 클라이언트 생성
npx prisma generate

# 스키마 시드
npx prisma db seed

# 스튜디오 열기 (GUI)
npx prisma studio

# 스키마 포맷팅
npx prisma format

# DB 리셋 (⚠️ 모든 데이터 삭제)
npx prisma migrate reset
```

---

## 스키마 구조

```
coup/prisma/
├── schema.prisma          # 메인 스키마 파일
├── seed.js                # 시드 데이터 스크립트
└── migrations/            # 마이그레이션 히스토리
    ├── 20240101_init/
    ├── 20240102_add_user_fields/
    └── ...
```

---

## Redis 클라이언트 설정

```javascript
// src/lib/redis.js
import { createClient } from 'redis'

let redisClient = null

export async function getRedisClient() {
  if (redisClient && redisClient.isReady) {
    return redisClient
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis connection failed after 10 retries')
          return new Error('Redis connection failed')
        }
        return retries * 100  // 지수 백오프
      }
    }
  })

  redisClient.on('error', (err) => console.error('Redis Error:', err))
  redisClient.on('connect', () => console.log('Redis Connected'))
  redisClient.on('ready', () => console.log('Redis Ready'))

  await redisClient.connect()
  return redisClient
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isReady) {
    await redisClient.quit()
    redisClient = null
  }
}
```

---

## Redis 용도

| 용도 | 설명 | TTL |
|------|------|-----|
| Refresh Token | 사용자 리프레시 토큰 저장 | 7일 |
| Socket.io Adapter | 다중 서버 간 이벤트 공유 | - |
| Rate Limiting | API 요청 제한 | 1분 |
| 세션 캐싱 | 사용자 세션 데이터 | - |

---

## Refresh Token 관리

```javascript
// Refresh Token 저장
await saveRefreshToken(userId, token, 7 * 24 * 60 * 60)  // 7일 TTL

// Refresh Token 검증
const userId = await getRefreshToken(token)

// Refresh Token 삭제
await deleteRefreshToken(token)

// 사용자의 모든 토큰 삭제 (로그아웃 시)
await deleteAllUserRefreshTokens(userId)
```

---

## 관련 문서

- [Docker 구성](./docker.md)
- [환경 변수](./environment.md)
- [README](./README.md)

