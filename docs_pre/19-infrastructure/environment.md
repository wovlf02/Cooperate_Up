# 🔐 환경 변수

## 개요

프로젝트에서 사용하는 환경 변수 설정입니다.

---

## 메인 애플리케이션 (.env)

```env
# ========================================
# 데이터베이스
# ========================================
DATABASE_URL="postgresql://user:password@localhost:5432/coup"

# ========================================
# NextAuth
# ========================================
NEXTAUTH_SECRET="your-secret-key"          # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# ========================================
# OAuth 프로바이더
# ========================================
# Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Kakao
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."

# Naver
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

# ========================================
# Redis
# ========================================
REDIS_URL="redis://localhost:6379"

# ========================================
# 시그널링 서버 (WebRTC)
# ========================================
NEXT_PUBLIC_SIGNALING_URL="http://localhost:4000"

# ========================================
# 파일 업로드
# ========================================
MAX_FILE_SIZE="10485760"                   # 10MB
ALLOWED_FILE_TYPES="image/*,application/pdf,..."

# ========================================
# 기타
# ========================================
NODE_ENV="development"
```

---

## 시그널링 서버 (.env)

```env
PORT=4000
NEXTJS_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
LOG_LEVEL=info
```

---

## 환경 변수 설명

### 데이터베이스

| 변수 | 설명 | 예시 |
|------|------|------|
| DATABASE_URL | PostgreSQL 연결 문자열 | `postgresql://user:pass@host:5432/db` |

### NextAuth

| 변수 | 설명 | 예시 |
|------|------|------|
| NEXTAUTH_SECRET | 세션 암호화 키 | `openssl rand -base64 32`로 생성 |
| NEXTAUTH_URL | 앱 기본 URL | `http://localhost:3000` |

### OAuth

| 변수 | 설명 |
|------|------|
| GOOGLE_CLIENT_ID | Google OAuth 클라이언트 ID |
| GOOGLE_CLIENT_SECRET | Google OAuth 시크릿 |
| KAKAO_CLIENT_ID | Kakao OAuth 클라이언트 ID |
| KAKAO_CLIENT_SECRET | Kakao OAuth 시크릿 |
| NAVER_CLIENT_ID | Naver OAuth 클라이언트 ID |
| NAVER_CLIENT_SECRET | Naver OAuth 시크릿 |

### Redis

| 변수 | 설명 | 예시 |
|------|------|------|
| REDIS_URL | Redis 연결 문자열 | `redis://localhost:6379` |

### 파일 업로드

| 변수 | 설명 | 기본값 |
|------|------|--------|
| MAX_FILE_SIZE | 최대 파일 크기 (바이트) | 10485760 (10MB) |
| ALLOWED_FILE_TYPES | 허용 파일 타입 | `image/*,application/pdf` |

---

## 프로덕션 설정

### 필수 변경 사항

```env
# 강력한 시크릿 키 사용
NEXTAUTH_SECRET="very-strong-random-secret-key"

# 실제 도메인 사용
NEXTAUTH_URL="https://yourdomain.com"

# 프로덕션 모드
NODE_ENV="production"

# 강력한 DB 비밀번호
DATABASE_URL="postgresql://user:STRONG_PASSWORD@host:5432/coup"
```

### 보안 체크리스트

- [ ] `NEXTAUTH_SECRET` 32자 이상 랜덤 문자열
- [ ] `DATABASE_URL` 강력한 비밀번호 사용
- [ ] OAuth 시크릿 프로덕션 키로 변경
- [ ] `NODE_ENV=production` 설정
- [ ] HTTPS 사용

---

## 관련 문서

- [Docker 구성](./docker.md)
- [데이터베이스](./database.md)
- [README](./README.md)

