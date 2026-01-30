# ⚙️ 설정 파일

> CoUp 프로젝트의 각종 설정 파일을 상세히 문서화합니다.

---

## 📚 이 섹션의 문서

| 문서 | 설명 |
|------|------|
| [next-config.md](./next-config.md) | Next.js 설정 |
| [eslint-config.md](./eslint-config.md) | ESLint 설정 |
| [jest-config.md](./jest-config.md) | Jest 설정 |
| [server-config.md](./server-config.md) | 커스텀 서버 설정 |
| [environment-variables.md](./environment-variables.md) | 환경 변수 |

---

## 📁 설정 파일 목록

| 파일 | 설명 |
|------|------|
| `next.config.mjs` | Next.js 빌드 및 런타임 설정 |
| `eslint.config.mjs` | 코드 린팅 규칙 |
| `jest.config.js` | 테스트 설정 |
| `jest.setup.js` | 테스트 초기화 |
| `postcss.config.mjs` | PostCSS/TailwindCSS |
| `jsconfig.json` | JavaScript 경로 별칭 |
| `server.mjs` | Socket.io 커스텀 서버 |
| `middleware.js` | Next.js 미들웨어 |

---

## 🔐 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 연결 문자열 |
| `NEXTAUTH_SECRET` | ✅ | NextAuth 암호화 키 |
| `NEXTAUTH_URL` | ✅ | 서비스 URL |
| `REDIS_URL` | ⬜ | Redis 연결 (Socket.io 어댑터) |

---

## 🔗 관련 문서

- [기술 스택](../01_overview/tech-stack.md)
- [배포 가이드](../12_deployment/README.md)
- [테스팅](../09_testing/setup.md)
