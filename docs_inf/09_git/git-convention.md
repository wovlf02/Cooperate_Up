# Git 컨벤션

## 1. 브랜치 전략

### 1.1 브랜치 구조
```
master                    # 메인 브랜치 (프로덕션)
├── feature/{기능명}      # 기능 개발
├── fix/{버그명}          # 버그 수정
├── hotfix/{긴급수정}     # 긴급 수정
└── release/{버전}        # 릴리스 준비
```

### 1.2 브랜치 명명 규칙
| 브랜치 유형 | 형식 | 예시 |
|-------------|------|------|
| 기능 개발 | `feature/{기능명}` | `feature/login`, `feature/attendance` |
| 버그 수정 | `fix/{버그명}` | `fix/gps-accuracy`, `fix/login-error` |
| 긴급 수정 | `hotfix/{수정내용}` | `hotfix/crash-fix` |
| 릴리스 | `release/{버전}` | `release/1.0.0` |

### 1.3 브랜치 워크플로우
```
1. master에서 feature 브랜치 생성
2. 기능 개발 완료 후 master에 머지
3. 릴리스 시 release 브랜치 생성
4. 테스트 완료 후 master에 머지 및 태그

[master] ──┬──────────────────────────────> [master]
           │                                   ↑
           └── [feature/login] ────────────────┘
```

---

## 2. 커밋 메시지 규칙

### 2.1 커밋 메시지 형식
```
<타입>: <제목>

<본문>

<꼬리말>
```

**또는 범위 포함:**
```
<타입>(<범위>): <제목>
```

**작성 규칙:**
- 타입 키워드만 **영어**로 작성 (feat, fix, docs 등)
- 나머지는 **모두 한글**로 작성
- 제목은 50자 이내로 간결하게
- 본문은 "무엇을", "왜" 변경했는지 한글로 설명
- 비개발자(사장님)도 이해할 수 있도록 명확하게 작성

### 2.2 타입 (Type)
| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | feat: 로그인 화면 구현 |
| `fix` | 버그 수정 | fix: GPS 정확도 개선 |
| `docs` | 문서 변경 | docs: README 업데이트 |
| `style` | 코드 스타일 변경 | style: 코드 포맷팅 적용 |
| `refactor` | 코드 리팩토링 | refactor: 컴포넌트 분리 |
| `test` | 테스트 코드 | test: 로그인 테스트 추가 |
| `build` | 빌드 설정 | build: iOS 빌드 설정 수정 |
| `chore` | 프로젝트 설정 | chore: ESLint 규칙 추가 |

### 2.3 범위 (Scope) - 선택사항
범위는 생략 가능하며, 필요한 경우에만 사용합니다.

| 범위 | 설명 |
|------|------|
| auth | 로그인, 회원가입 |
| attendance | 출퇴근 관리 |
| checklist | 업무 체크리스트 |
| announcement | 공지사항 |
| chat | 채팅 |
| settings | 설정 |
| admin | 관리자 기능 |

### 2.4 커밋 메시지 예시

#### 기능 추가
```
feat: 로그인 화면 구현

- 이메일/비밀번호 입력 폼 추가
- Firebase 연동
- 유효성 검사 추가
```

#### 버그 수정
```
fix: GPS 위치 인식 오류 수정

- 거리 계산 오류 수정
- 위치 권한 요청 개선
```

#### 문서 변경
```
docs: Firebase 설정 가이드 추가

- iOS 설정 방법 문서화
- Android 설정 방법 문서화
```

#### 코드 정리
```
refactor: 홈 화면 컴포넌트 분리

- 직원용/관리자용 화면 분리
- 공통 기능 추출
```

#### 범위를 포함한 예시 (선택사항)
```
feat(attendance): 출퇴근 기록 기능 추가
fix(chat): 메시지 전송 오류 수정
docs(firebase): 보안 규칙 설정 가이드 추가
```

---

## 3. 커밋 작성 규칙

### 3.1 제목 작성법
- 50자 이내로 작성
- 마침표 사용하지 않음
- 명확하고 간결하게
- 예: "로그인 화면 구현", "GPS 오류 수정"

### 3.2 본문 작성법 (선택사항)
- 제목만으로 설명이 부족할 때 작성
- "무엇을", "왜" 변경했는지 설명
- 목록 형태로 작성 (- 또는 *)

### 3.3 좋은 커밋 메시지 예시
```
✅ 좋은 예:
feat: 로그인 화면 구현
fix: GPS 위치 인식 오류 수정
docs: Firebase 설정 가이드 추가

❌ 나쁜 예:
feat: 작업함
fix: 수정
docs: 문서 업데이트
```

---

## 4. Git 명령어

### 4.1 브랜치 생성 및 이동
```bash
# feature 브랜치 생성
git checkout -b feature/login

# 브랜치 목록 확인
git branch -a

# 브랜치 이동
git checkout master

# 브랜치 삭제
git branch -d feature/login
```

### 4.2 커밋
```bash
# 스테이징
git add .

# 커밋 (타입만 영어, 나머지는 한글)
git commit -m "feat: 로그인 화면 구현"

# 커밋 수정
git commit --amend
```

### 4.3 머지
```bash
# master로 이동
git checkout master

# feature 브랜치 머지
git merge feature/login

# 머지 후 브랜치 삭제
git branch -d feature/login
```

### 4.4 푸시
```bash
# 원격 저장소에 푸시
git push origin master

# 새 브랜치 푸시
git push -u origin feature/login
```

### 4.5 태그 (릴리스)
```bash
# 태그 생성
git tag -a v1.0.0 -m "릴리스 1.0.0"

# 태그 푸시
git push origin v1.0.0

# 모든 태그 푸시
git push origin --tags
```

---

## 5. .gitignore

### 5.1 기본 설정
```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build
build/
dist/
*.bundle.js

# iOS
ios/Pods/
ios/build/
*.xcworkspace
!ios/*.xcworkspace/

# Android
android/app/build/
android/.gradle/
*.apk
*.aab

# IDE
.idea/
.vscode/
*.swp
*.swo

# Environment
.env
.env.local
.env.*.local

# Firebase
google-services.json
GoogleService-Info.plist

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Metro
.metro-health-check*

# Temporary
*.tmp
*.temp
```

---

## 6. Git Hooks (선택)

### 6.1 pre-commit
```bash
#!/bin/sh
# 커밋 전 린트 검사
npm run lint
```

### 6.2 commit-msg
```bash
#!/bin/sh
# 커밋 메시지 형식 검사
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|build|chore)(\(.+\))?: .+"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ 커밋 메시지 형식이 올바르지 않습니다."
  echo "형식: <타입>: <한글 제목>"
  echo "예시: feat: 로그인 화면 구현"
  exit 1
fi
```

---

## 7. 워크플로우 예시

### 7.1 새 기능 개발
```bash
# 1. master에서 최신 코드 가져오기
git checkout master
git pull origin master

# 2. feature 브랜치 생성
git checkout -b feature/login

# 3. 개발 및 커밋
git add .
git commit -m "feat: 로그인 화면 레이아웃 구현"

git add .
git commit -m "feat: Firebase 인증 연동"

# 4. 원격 저장소에 푸시
git push -u origin feature/login

# 5. 개발 완료 후 master에 머지
git checkout master
git merge feature/login

# 6. 원격 저장소에 푸시
git push origin master

# 7. feature 브랜치 삭제
git branch -d feature/login
git push origin --delete feature/login
```

### 7.2 버그 수정
```bash
# 1. fix 브랜치 생성
git checkout -b fix/gps-error

# 2. 수정 및 커밋
git add .
git commit -m "fix: GPS 위치 인식 오류 수정"

# 3. master에 머지
git checkout master
git merge fix/gps-error
git push origin master
```

### 7.3 릴리스
```bash
# 1. release 브랜치 생성
git checkout -b release/1.0.0

# 2. 버전 업데이트 커밋
git add .
git commit -m "chore: v1.0.0 릴리스 준비"

# 3. master에 머지
git checkout master
git merge release/1.0.0

# 4. 태그 생성
git tag -a v1.0.0 -m "v1.0.0 릴리스"

# 5. 푸시
git push origin master
git push origin v1.0.0
```

