# 🔐 보안 정책 안내

## ⚠️ Private 저장소 정책

이 저장소는 **영구적으로 Private 상태로 유지**됩니다.

### 포함된 민감 정보

다음 파일들은 실제 운영 정보를 포함하고 있습니다:

#### 1. 환경 변수 파일
```
coup/.env
signaling-server/.env
```

**포함 내용:**
- 데이터베이스 접속 정보 (비밀번호 포함)
- NextAuth 시크릿 키
- SMTP 이메일 자격 증명
- Redis 연결 정보

#### 2. 설정 파일
- Docker Compose 설정
- Prisma 데이터베이스 스키마
- 서버 설정 파일

---

## 🚨 절대 하지 말아야 할 것

### ❌ Public 전환 금지
```
이 저장소를 Public으로 전환하면
모든 민감 정보가 공개됩니다!
```

### ❌ Fork 주의
- Private 저장소를 Fork할 경우 자동으로 Private으로 생성되는지 확인
- Public Fork는 절대 금지

### ❌ 스크린샷/공유 주의
- 코드 스크린샷에 .env 내용 포함 금지
- 설정 파일 공유 시 민감 정보 마스킹 필수

---

## ✅ 안전한 작업 방법

### 1. 로컬 개발
```bash
# .env 파일은 이미 저장소에 포함되어 있음
git clone <repository-url>
cd Cooperate_Up
# 바로 실행 가능
```

### 2. 새 개발자 온보딩
1. GitHub에 Private 저장소 접근 권한 부여
2. 저장소 클론
3. 즉시 개발 환경 구성 가능 (별도 .env 설정 불필요)

### 3. 배포
- 프로덕션 배포 시에는 별도 환경 변수 사용 권장
- CI/CD 파이프라인에서 환경 변수 관리

---

## 🔄 Public 전환이 필요한 경우

만약 향후 이 프로젝트를 오픈소스로 공개해야 한다면:

### 사전 작업 체크리스트

- [ ] 새로운 브랜치 생성 (`public-release`)
- [ ] 모든 .env 파일 삭제
- [ ] .env.example 파일만 유지
- [ ] .gitignore에 환경 변수 제외 규칙 추가
- [ ] Git 히스토리에서 민감 정보 제거 (BFG Repo-Cleaner 사용)
- [ ] README.md 업데이트 (환경 변수 설정 가이드 추가)
- [ ] 하드코딩된 민감 정보 검색 및 제거
- [ ] 보안 감사 수행

### Git 히스토리 정리 방법

```bash
# BFG Repo-Cleaner 사용
git clone --mirror <repository-url>
bfg --delete-files .env
bfg --replace-text passwords.txt
cd <repository>.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push
```

---

## 📋 정기 점검 사항

### 매월 확인
- [ ] 저장소가 Private 상태인지 확인
- [ ] 불필요한 협업자 권한 제거
- [ ] .env 파일의 비밀번호/키 만료 확인

### 분기별 확인
- [ ] 데이터베이스 비밀번호 변경
- [ ] SMTP 앱 비밀번호 갱신
- [ ] NextAuth 시크릿 키 교체 (필요시)

---

## 👥 팀원 교육

### 새 팀원에게 안내할 사항

1. **이 저장소는 Private입니다**
   - 외부 공유 절대 금지
   - 스크린샷 주의

2. **민감 정보가 포함되어 있습니다**
   - .env 파일에 실제 비밀번호 포함
   - 로컬 개발 시 그대로 사용 가능

3. **보안 수칙 준수**
   - 개인 GitHub 계정 2FA 활성화
   - 안전한 네트워크에서만 작업
   - 공용 컴퓨터 사용 금지

---

## 🆘 보안 사고 대응

### .env 파일이 실수로 공개된 경우

1. **즉시 조치**
   ```bash
   # 저장소를 Private로 전환 (Public인 경우)
   # GitHub Settings > Danger Zone > Change visibility
   ```

2. **비밀번호 즉시 변경**
   - 데이터베이스 비밀번호
   - SMTP 앱 비밀번호
   - NextAuth 시크릿 키

3. **Git 히스토리 정리**
   - 위의 "Git 히스토리 정리 방법" 참고

4. **영향 범위 평가**
   - 로그 확인
   - 비정상 접근 확인
   - 필요시 데이터베이스 감사

---

## 📞 문의

보안 관련 문제 발견 시:
- 팀 리더에게 즉시 보고
- 이슈 트래커에 **절대 공개하지 말 것**
- Private 메시지 또는 이메일 사용

---

**최종 수정일**: 2025년 12월 13일
**작성자**: CoUp 개발팀
**정책 버전**: 1.0

