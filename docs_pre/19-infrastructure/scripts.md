# 📜 스크립트

## 개요

유틸리티 스크립트 모음입니다.

---

## 스크립트 목록

```
coup/scripts/
├── activate-users.js          # 사용자 활성화
├── create-super-admin.js      # 슈퍼 관리자 생성
├── create-test-admin.js       # 테스트 관리자 생성
├── create-test-user.js        # 테스트 사용자 생성
├── reset-password.js          # 비밀번호 초기화
├── check-admin.js             # 관리자 권한 확인
├── check-admin-debug.js       # 관리자 디버깅
├── check-user-roles.js        # 사용자 역할 확인
├── check-user-status.js       # 사용자 상태 확인
├── seed-settings.js           # 시스템 설정 시드
├── add-more-studies.js        # 스터디 추가
├── add-notifications.js       # 알림 추가
├── fix-study-capacity.js      # 스터디 정원 수정
├── check-study-members.js     # 스터디 멤버 확인
├── check-photo-study.js       # 사진 스터디 확인
├── clean-old-admin-data.js    # 관리자 데이터 정리
├── execute-cleanup.js         # 정리 실행
├── convert-avatar-base64.js   # 아바타 Base64 변환
├── update-avatar.js           # 아바타 업데이트
├── find-docker-owner.js       # Docker 소유자 찾기
├── get-toeic-owner.js         # TOEIC 스터디 소유자
├── get-vue-owner.js           # Vue 스터디 소유자
├── test-calendar-create.js    # 캘린더 테스트
├── test-join-request.js       # 가입 요청 테스트
└── test-login.js              # 로그인 테스트
```

---

## 자주 사용하는 스크립트

### 슈퍼 관리자 생성

```bash
node scripts/create-super-admin.js
```

### 테스트 관리자 생성

```bash
node scripts/create-test-admin.js
```

### 테스트 사용자 생성

```bash
node scripts/create-test-user.js
```

### 비밀번호 초기화

```bash
node scripts/reset-password.js user@example.com
```

### 시스템 설정 시드

```bash
node scripts/seed-settings.js
```

### 테스트 데이터 추가

```bash
node scripts/add-more-studies.js
node scripts/add-notifications.js
```

---

## 확인/디버깅 스크립트

### 관리자 확인

```bash
node scripts/check-admin.js
node scripts/check-admin-debug.js
```

### 사용자 확인

```bash
node scripts/check-user-roles.js
node scripts/check-user-status.js
```

### 스터디 확인

```bash
node scripts/check-study-members.js
node scripts/check-photo-study.js
```

---

## 정리/유지보수 스크립트

### 데이터 정리

```bash
node scripts/clean-old-admin-data.js
node scripts/execute-cleanup.js
```

### 스터디 정원 수정

```bash
node scripts/fix-study-capacity.js
```

---

## 관련 문서

- [로깅 시스템](./logging.md)
- [README](./README.md)

