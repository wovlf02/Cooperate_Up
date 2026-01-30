# 🚀 배포

> CoUp 프로젝트의 배포 전략과 가이드를 문서화합니다.

---

## 📚 이 섹션의 문서

| 문서 | 설명 |
|------|------|
| [docker.md](./docker.md) | Docker 컨테이너 배포 |
| [prisma-migrations.md](./prisma-migrations.md) | 데이터베이스 마이그레이션 |
| [production-guide.md](./production-guide.md) | 프로덕션 배포 체크리스트 |

---

## 🎯 배포 방식

| 방식 | 설명 |
|------|------|
| **Docker Compose** | 개발/스테이징 환경 |
| **Kubernetes** | 프로덕션 대규모 배포 |
| **Vercel** | Next.js 서버리스 배포 |

---

## 📋 배포 체크리스트

### 사전 준비
- [ ] 환경 변수 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 시드 데이터 확인
- [ ] SSL 인증서 설정

### 빌드
- [ ] `npm run build` 성공
- [ ] 테스트 통과
- [ ] 린트 에러 없음

### 배포 후
- [ ] 헬스체크 통과
- [ ] 기능 테스트
- [ ] 모니터링 설정

---

## 🐳 Docker Compose 실행

```bash
# 개발 환경
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down
```

---

## 🔗 관련 문서

- [설정 파일](../11_configuration/README.md)
- [환경 변수](../11_configuration/environment-variables.md)
- [데이터베이스 설계](../03_database/README.md)
