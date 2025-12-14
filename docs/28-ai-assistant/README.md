# 🤖 AI 학습 어시스턴트

## 개요

AI를 활용하여 사용자의 학습을 돕는 시스템입니다.
질문 답변, 문제 풀이 도우미, 학습 계획 추천, 요약 생성 등을 제공합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 질문 답변 | 학습 관련 질문에 AI가 답변 |
| 문제 힌트 | 어려운 문제에 단계별 힌트 제공 |
| 해설 생성 | 문제 풀이 해설 자동 생성 |
| 개념 설명 | 어려운 개념을 쉽게 설명 |
| 학습 계획 | 목표 기반 학습 계획 추천 |
| 문서 요약 | 긴 문서/노트 요약 |
| 퀴즈 생성 | 학습 자료 기반 퀴즈 자동 생성 |
| 번역 | 학습 자료 번역 |
| 문법 교정 | 에세이/답안 문법 교정 |

---

## 기술 선택

### AI API 옵션

| 옵션 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **OpenAI GPT-4** | 높은 품질, 다양한 기능 | 비용 | 유료 |
| **Claude** | 긴 컨텍스트, 안전 | API 제한 | 유료 |
| **Google Gemini** | 무료 티어, 멀티모달 | 품질 변동 | 무료/유료 |
| **Ollama (로컬)** | 무료, 프라이버시 | 서버 자원 필요 | 무료 |

### 추천: OpenAI API + 사용량 제한

- 검증된 품질
- 다양한 모델 선택 (gpt-4o-mini, gpt-4o)
- 사용량 기반 비용 제어

---

## 데이터 모델

### AiConversation (AI 대화)

```prisma
model AiConversation {
  id      String @id @default(cuid())
  userId  String
  studyId String?  // 스터디 내 대화면 연결
  
  title    String?  // 대화 제목 (자동 생성)
  type     AiConversationType @default(GENERAL)
  
  // 컨텍스트
  contextNoteId     String?  // 참조 노트
  contextQuestionId String?  // 참조 문제
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages AiMessage[]
}

enum AiConversationType {
  GENERAL    // 일반 질문
  PROBLEM    // 문제 풀이
  CONCEPT    // 개념 설명
  PLAN       // 학습 계획
  SUMMARY    // 요약
}
```

### AiMessage (AI 메시지)

```prisma
model AiMessage {
  id             String @id @default(cuid())
  conversationId String
  
  role    MessageRole  // USER, ASSISTANT, SYSTEM
  content String       @db.Text
  
  // 토큰 사용량
  promptTokens     Int?
  completionTokens Int?
  
  // 피드백
  rating    Int?     // 1~5 평점
  isHelpful Boolean?
  
  createdAt DateTime @default(now())
  
  conversation AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### AiUsage (AI 사용량)

```prisma
model AiUsage {
  id     String @id @default(cuid())
  userId String
  
  date        DateTime @db.Date
  tokenCount  Int      @default(0)
  requestCount Int     @default(0)
  
  @@unique([userId, date])
  @@index([date])
}
```

### AiGeneratedContent (생성 콘텐츠)

```prisma
model AiGeneratedContent {
  id      String @id @default(cuid())
  userId  String
  type    AiContentType
  
  input   Json     // 입력 데이터
  output  String   @db.Text  // 생성된 내용
  
  // 소스
  sourceNoteId     String?
  sourceQuestionId String?
  
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum AiContentType {
  QUIZ         // 퀴즈 생성
  SUMMARY      // 요약
  EXPLANATION  // 해설
  PLAN         // 학습 계획
  TRANSLATION  // 번역
}
```

---

## API 엔드포인트

### 대화

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/ai/conversations` | 대화 목록 |
| POST | `/api/ai/conversations` | 새 대화 시작 |
| GET | `/api/ai/conversations/[id]` | 대화 상세 |
| DELETE | `/api/ai/conversations/[id]` | 대화 삭제 |

### 메시지

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/conversations/[id]/messages` | 메시지 전송 |
| POST | `/api/ai/conversations/[id]/messages/[msgId]/feedback` | 피드백 |

### 기능별

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/ask` | 단일 질문 (대화 없이) |
| POST | `/api/ai/explain` | 개념 설명 |
| POST | `/api/ai/hint` | 문제 힌트 |
| POST | `/api/ai/summarize` | 요약 생성 |
| POST | `/api/ai/generate-quiz` | 퀴즈 생성 |
| POST | `/api/ai/translate` | 번역 |
| POST | `/api/ai/plan` | 학습 계획 |

### 사용량

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/ai/usage` | 내 사용량 확인 |
| GET | `/api/ai/limits` | 사용 한도 확인 |

---

## 컴포넌트 구조

```
src/components/ai/
├── AiChatWindow.jsx        # AI 채팅 창
├── AiChatInput.jsx         # 입력 영역
├── AiMessage.jsx           # 메시지 버블
├── AiTypingIndicator.jsx   # 응답 대기 표시
├── AiSuggestions.jsx       # 질문 추천
├── AiFloatingButton.jsx    # 플로팅 AI 버튼
├── AiSidebar.jsx           # AI 사이드바
├── AiSummaryCard.jsx       # 요약 결과
├── AiQuizGenerator.jsx     # 퀴즈 생성기
├── AiPlanView.jsx          # 학습 계획 뷰
├── AiUsageBar.jsx          # 사용량 표시
├── AiFeedbackModal.jsx     # 피드백 모달
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/ai/page.jsx` | `/ai` | AI 어시스턴트 메인 |
| `src/app/ai/[conversationId]/page.jsx` | `/ai/[id]` | 대화 상세 |
| `src/app/ai/tools/page.jsx` | `/ai/tools` | AI 도구 모음 |

---

## 프롬프트 템플릿

### 문제 힌트

```javascript
const hintPrompt = `
당신은 학습 도우미입니다. 학생이 문제를 스스로 풀 수 있도록 힌트를 제공하세요.
직접적인 답을 알려주지 말고, 사고의 방향을 안내해주세요.

문제:
${question.content}

보기:
${question.options?.join('\n')}

힌트 레벨: ${hintLevel}/3 (1: 가벼운 힌트, 2: 구체적 힌트, 3: 거의 정답에 가까운 힌트)

힌트를 제공해주세요.
`
```

### 개념 설명

```javascript
const explainPrompt = `
당신은 친절한 선생님입니다. 다음 개념을 쉽게 설명해주세요.

개념: ${concept}
학습자 수준: ${level}

다음을 포함해주세요:
1. 쉬운 비유나 예시
2. 핵심 포인트 정리
3. 관련 개념 연결
4. 실생활 적용 예시
`
```

### 퀴즈 생성

```javascript
const quizGenPrompt = `
다음 학습 자료를 바탕으로 퀴즈 문제를 생성해주세요.

학습 자료:
${content}

요청사항:
- 문제 개수: ${count}개
- 난이도: ${difficulty}
- 문제 유형: ${type} (객관식/단답형/O/X)

JSON 형식으로 출력해주세요:
{
  "questions": [
    {
      "content": "문제 내용",
      "type": "MULTIPLE_CHOICE",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "answer": "1",
      "explanation": "해설"
    }
  ]
}
`
```

---

## 사용량 제한

### 무료 사용자

| 항목 | 일일 한도 |
|------|----------|
| 일반 질문 | 10회 |
| 문제 힌트 | 20회 |
| 요약 | 5회 |
| 퀴즈 생성 | 3회 |

### 프리미엄 (게이미피케이션 연동)

- 레벨 5 이상: 한도 2배
- 레벨 8 이상: 한도 3배
- 포인트로 추가 사용량 구매 가능

---

## UI/UX 설계

### AI 채팅 인터페이스

```
┌─────────────────────────────────────────────────┐
│ 🤖 AI 학습 어시스턴트              [📜 대화 기록] │
├─────────────────────────────────────────────────┤
│                                                 │
│  👤 미분에서 합성함수 미분법이 뭐야?              │
│                                                 │
│  🤖 합성함수 미분법(Chain Rule)은                │
│     두 함수가 합성되어 있을 때 사용하는           │
│     미분 공식이에요.                             │
│                                                 │
│     예를 들어, f(x) = (2x+1)³ 를 미분하면...     │
│                                                 │
│     [👍 도움됨] [👎 아쉬움] [📋 복사]            │
│                                                 │
├─────────────────────────────────────────────────┤
│ 💡 추천 질문                                     │
│ [합성함수 예제 더 보기] [연쇄법칙 증명]           │
├─────────────────────────────────────────────────┤
│ [📎] 질문을 입력하세요...              [전송 ➤] │
│                                                 │
│ 남은 질문: 7/10 (무료)                          │
└─────────────────────────────────────────────────┘
```

### 플로팅 AI 버튼

- 모든 학습 페이지에 플로팅 버튼
- 클릭 시 사이드바로 AI 채팅 열림
- 현재 페이지 컨텍스트 자동 인식

---

## 통합 위치

| 위치 | AI 기능 |
|------|---------|
| 문제 풀이 | 힌트, 해설 생성 |
| 노트 편집기 | 요약, 개념 설명 |
| 퀴즈 생성 | 자동 퀴즈 생성 |
| 스터디 대시보드 | 학습 계획 추천 |
| 오답 노트 | 오답 분석, 관련 개념 |

---

## 보안 및 비용 관리

### 보안

- 사용자 입력 sanitize
- 유해 콘텐츠 필터링
- 개인정보 마스킹

### 비용 관리

- 일일 토큰 한도 설정
- 긴 대화는 요약 후 컨텍스트 압축
- gpt-4o-mini 기본, 복잡한 질문만 gpt-4o

---

## 구현 우선순위

1. **Phase 1**: 기본 질문 답변
2. **Phase 2**: 문제 힌트, 해설
3. **Phase 3**: 요약 기능
4. **Phase 4**: 퀴즈 자동 생성
5. **Phase 5**: 학습 계획 추천
6. **Phase 6**: 사용량 관리, 프리미엄

---

## 필요 패키지

```bash
npm install openai ai  # Vercel AI SDK
```

---

## 관련 문서

- [24-quiz-system](../24-quiz-system/README.md) - 퀴즈 생성 연동
- [25-collaborative-notes](../25-collaborative-notes/README.md) - 노트 요약
- [27-gamification](../27-gamification/README.md) - 사용량 연동

