# 🚀 CoUp 플랫폼 기능 분석 및 확장 로드맵

## 개요

이 문서는 CoUp(Cooperate Up) 통합형 스터디 플랫폼의 현재 구현 상태를 분석하고,
신규 기능 확장 계획을 정리한 종합 로드맵입니다.

---

## 목차

1. [현재 구현 현황](#현재-구현-현황)
2. [신규 기능 목록](#신규-기능-목록)
3. [우선순위 및 로드맵](#우선순위-및-로드맵)
4. [기술 스택 확장](#기술-스택-확장)
5. [데이터베이스 확장](#데이터베이스-확장)

---

## 현재 구현 현황

### ✅ 완료된 기능

| 영역 | 기능 | 상태 | 문서 |
|------|------|------|------|
| 📚 스터디 | 생성, 검색, 가입, 관리 | ✅ 완료 | [04-studies](./04-studies/README.md) |
| 👥 멤버 | 역할 관리, 가입 승인 | ✅ 완료 | [04-studies](./04-studies/README.md) |
| 💬 채팅 | 스터디 실시간 채팅 | ✅ 완료 | [09-chat](./09-chat/README.md) |
| 📹 화상통화 | WebRTC 기반 화상회의 | ✅ 완료 | [16-video-call](./16-video-call/README.md) |
| 📁 파일 | 업로드, 공유, 다운로드 | ✅ 완료 | [10-files](./10-files/README.md) |
| 📅 캘린더 | 일정 관리 | ✅ 완료 | [11-calendar](./11-calendar/README.md) |
| ✅ 할일 | 개인/스터디 할일 관리 | ✅ 완료 | [07-tasks](./07-tasks/README.md) |
| 📢 공지사항 | 공지 작성, 핀 고정 | ✅ 완료 | [12-notices](./12-notices/README.md) |
| 🔔 알림 | 실시간 알림 | ✅ 완료 | [08-notifications](./08-notifications/README.md) |
| 🔐 인증 | 로그인, 소셜 로그인 | ✅ 완료 | [02-auth](./02-auth/README.md) |
| 👤 프로필 | 사용자 정보 관리 | ✅ 완료 | [03-users](./03-users/README.md) |
| 📊 대시보드 | 통계, 활동 현황 | ✅ 완료 | [13-dashboard](./13-dashboard/README.md) |
| 🛡️ 관리자 | 사용자/스터디/신고 관리 | ✅ 완료 | [14-admin](./14-admin/README.md) |
| 🚨 신고 | 신고 접수 및 처리 | ✅ 완료 | [15-reports](./15-reports/README.md) |
| 👥 그룹 | 그룹 생성 및 관리 | ✅ 완료 | [06-groups](./06-groups/README.md) |

### ❌ 미구현 기능 (신규)

| 영역 | 기능 | 상태 | 문서 |
|------|------|------|------|
| 👥 친구 | 친구 관리 시스템 | 📋 계획 | [21-friends](./21-friends/README.md) |
| 💬 DM | 1:1 및 그룹 채팅 | 📋 계획 | [22-direct-messaging](./22-direct-messaging/README.md) |
| ⏱️ 타이머 | Face API 공부 타이머 | 📋 계획 | [23-study-timer](./23-study-timer/README.md) |
| 📝 퀴즈 | 문제풀이 시스템 | 📋 계획 | [24-quiz-system](./24-quiz-system/README.md) |
| 📓 협업노트 | 클라우드 메모장 | 📋 계획 | [25-collaborative-notes](./25-collaborative-notes/README.md) |
| 🎯 매칭 | 스터디 매칭 시스템 | 📋 계획 | [26-study-matching](./26-study-matching/README.md) |
| 🎮 게이미피케이션 | 포인트, 뱃지, 랭킹 | 📋 계획 | [27-gamification](./27-gamification/README.md) |
| 🤖 AI | AI 학습 어시스턴트 | 📋 계획 | [28-ai-assistant](./28-ai-assistant/README.md) |

---

## 신규 기능 목록

### 1. 👥 친구 관리 시스템 `21-friends`

사용자 간 친구 관계를 관리하는 시스템

**핵심 기능:**
- 친구 요청/수락/거절
- 친구 목록 관리
- 온라인 상태 표시
- 사용자 차단
- 친구 추천 (같은 스터디, 공통 관심사)

### 2. 💬 1:1 및 그룹 채팅 `22-direct-messaging`

스터디 외부에서 개인 간 대화 기능

**핵심 기능:**
- 1:1 다이렉트 메시지
- 자유 그룹 채팅방
- 읽음 확인
- 미디어 공유
- 대화 검색

### 3. ⏱️ Face API 공부 타이머 `23-study-timer`

얼굴 인식 기반 실제 공부 시간 측정

**핵심 기능:**
- 얼굴 감지 시에만 타이머 작동
- 집중도 분석 (졸음 감지)
- 통계 대시보드 (일/주/월)
- 랭킹 시스템
- 휴식 알림

### 4. 📝 퀴즈/문제풀이 시스템 `24-quiz-system`

모의고사, 기출문제 학습 시스템

**핵심 기능:**
- 문제 은행 (과목별)
- 시험지 생성 및 응시
- 자동 채점
- 오답 노트
- 성적 분석

### 5. 📓 클라우드 협업 노트 `25-collaborative-notes`

실시간 협업 문서 편집

**핵심 기능:**
- 실시간 동시 편집 (Yjs)
- 마크다운/수학 수식 지원
- 버전 관리
- 댓글/토론
- 파일 첨부

### 6. 🎯 스터디 매칭 시스템 `26-study-matching`

AI 기반 맞춤 스터디 추천

**핵심 기능:**
- 선호도 프로필
- 호환성 점수 계산
- 학습 스타일 테스트
- 빠른 매칭
- 스터디 메이트 추천

### 7. 🎮 게이미피케이션 `27-gamification`

포인트, 레벨, 뱃지로 동기 부여

**핵심 기능:**
- 경험치(XP) 시스템
- 레벨 시스템
- 뱃지 수집
- 리더보드
- 챌린지

### 8. 🤖 AI 학습 어시스턴트 `28-ai-assistant`

AI 기반 학습 도우미

**핵심 기능:**
- 질문 답변
- 문제 힌트
- 자료 요약
- 퀴즈 자동 생성
- 학습 계획 추천

---

## 우선순위 및 로드맵

### Phase 1: 소셜 기반 (2주)

| 기능 | 우선순위 | 의존성 |
|------|----------|--------|
| 친구 관리 (기본) | 🔴 높음 | 없음 |
| 1:1 DM | 🔴 높음 | 친구 시스템 |
| 온라인 상태 | 🟠 중간 | Socket.IO (기존) |

### Phase 2: 학습 핵심 (3주)

| 기능 | 우선순위 | 의존성 |
|------|----------|--------|
| 기본 공부 타이머 | 🔴 높음 | 없음 |
| 퀴즈 시스템 (기본) | 🔴 높음 | 없음 |
| 오답 노트 | 🟠 중간 | 퀴즈 시스템 |

### Phase 3: 협업 강화 (3주)

| 기능 | 우선순위 | 의존성 |
|------|----------|--------|
| 협업 노트 | 🔴 높음 | 없음 |
| 그룹 채팅 | 🟠 중간 | DM 시스템 |
| 얼굴 인식 타이머 | 🟠 중간 | 기본 타이머 |

### Phase 4: 고급 기능 (4주)

| 기능 | 우선순위 | 의존성 |
|------|----------|--------|
| 게이미피케이션 | 🟠 중간 | 타이머, 퀴즈 |
| 스터디 매칭 | 🟠 중간 | 없음 |
| AI 어시스턴트 | 🟡 낮음 | 퀴즈, 노트 |

### 전체 타임라인

```
Week 1-2:   친구 관리, 1:1 DM
Week 3-4:   기본 타이머, 퀴즈 CRUD
Week 5-6:   자동 채점, 오답 노트, 통계
Week 7-8:   협업 노트 (Tiptap + Yjs)
Week 9-10:  얼굴 인식, 그룹 채팅
Week 11-12: 게이미피케이션, 리더보드
Week 13-14: 스터디 매칭, AI 기본
Week 15-16: AI 고급 기능, 최적화
```

---

## 기술 스택 확장

### 새로 추가될 패키지

```json
{
  "dependencies": {
    // 얼굴 인식
    "face-api.js": "^0.22.2",
    "@tensorflow/tfjs-core": "^4.x",
    "@tensorflow/tfjs-backend-webgl": "^4.x",
    
    // 실시간 협업 에디터
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-collaboration": "^2.x",
    "yjs": "^13.x",
    "y-websocket": "^1.x",
    
    // 수학 수식
    "katex": "^0.16.x",
    
    // AI
    "openai": "^4.x",
    "ai": "^3.x"
  }
}
```

---

## 데이터베이스 확장

### 새로운 모델 요약

```prisma
// 친구 시스템
model Friend { ... }
model BlockedUser { ... }

// DM
model ChatRoom { ... }
model ChatRoomMember { ... }
model DirectMessage { ... }

// 공부 타이머
model StudySession { ... }
model DailyStudyStat { ... }
model StudyRanking { ... }

// 퀴즈
model QuestionBank { ... }
model Question { ... }
model Exam { ... }
model ExamAttempt { ... }
model WrongNote { ... }

// 협업 노트
model NoteFolder { ... }
model Note { ... }
model NoteVersion { ... }
model NoteComment { ... }

// 매칭
model UserPreference { ... }
model StudyRecommendation { ... }

// 게이미피케이션
model UserGameProfile { ... }
model Badge { ... }
model UserBadge { ... }
model Challenge { ... }

// AI
model AiConversation { ... }
model AiMessage { ... }
model AiUsage { ... }
```

---

## 문서 구조

```
docs/
├── 00-overview/          # 프로젝트 개요
├── 01-database/          # 데이터베이스
├── 02-auth/              # 인증
├── 03-users/             # 사용자
├── 04-studies/           # 스터디
├── 05-my-studies/        # 내 스터디
├── 06-groups/            # 그룹
├── 07-tasks/             # 할일
├── 08-notifications/     # 알림
├── 09-chat/              # 채팅
├── 10-files/             # 파일
├── 11-calendar/          # 캘린더
├── 12-notices/           # 공지사항
├── 13-dashboard/         # 대시보드
├── 14-admin/             # 관리자
├── 15-reports/           # 신고
├── 16-video-call/        # 화상통화
├── 17-landing/           # 랜딩
├── 18-common/            # 공통
├── 19-infrastructure/    # 인프라
├── 20-testing/           # 테스팅
│
│   === 신규 기능 ===
│
├── 21-friends/           # 👥 친구 관리
├── 22-direct-messaging/  # 💬 1:1/그룹 채팅
├── 23-study-timer/       # ⏱️ 공부 타이머
├── 24-quiz-system/       # 📝 문제풀이
├── 25-collaborative-notes/ # 📓 협업 노트
├── 26-study-matching/    # 🎯 스터디 매칭
├── 27-gamification/      # 🎮 게이미피케이션
├── 28-ai-assistant/      # 🤖 AI 어시스턴트
└── FEATURE-ROADMAP.md    # 🚀 이 문서
```

---

## 다음 단계

1. 각 기능별 상세 문서 검토
2. Phase 1 구현 시작 (친구, DM)
3. 데이터베이스 마이그레이션 계획 수립
4. UI/UX 디자인 확정

---

## 관련 문서

- [architecture.md](./00-overview/architecture.md) - 시스템 아키텍처
- [tech-stack.md](./00-overview/tech-stack.md) - 기술 스택
- [README.md](./00-overview/README.md) - 프로젝트 개요

