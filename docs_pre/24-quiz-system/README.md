# 📝 퀴즈/문제풀이 시스템

## 개요

모의고사, 수능 기출문제, 사용자 생성 문제를 통한 학습 시스템입니다.
스터디 내에서 함께 문제를 풀고, 성적을 비교하고, 오답 노트를 관리할 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 문제 은행 | 과목별/유형별 문제 저장소 |
| 시험지 생성 | 원하는 문제 조합으로 시험지 생성 |
| 문제 풀이 | 시간 제한, 자동 채점 |
| 오답 노트 | 틀린 문제 자동 수집, 복습 |
| 해설 보기 | 문제별 상세 해설 |
| 성적 분석 | 과목별/유형별 취약점 분석 |
| 스터디 시험 | 스터디 멤버 동시 시험 |
| 랭킹 | 점수 기반 랭킹 |
| 문제 업로드 | 사용자가 직접 문제 등록 |
| 문제 공유 | 스터디 내 문제 공유 |

---

## 지원 과목

### 기본 카테고리

| 대분류 | 소분류 |
|--------|--------|
| 수능/모의고사 | 국어, 수학, 영어, 사회탐구, 과학탐구, 한국사 |
| 자격증 | 정보처리기사, 컴퓨터활용능력, SQLD 등 |
| 어학 | TOEIC, TOEFL, JLPT, HSK 등 |
| 취업/공무원 | NCS, PSAT, 한국사능력검정 등 |
| 기타 | 사용자 정의 |

---

## 데이터 모델

### QuestionBank (문제 은행)

```prisma
model QuestionBank {
  id          String   @id @default(cuid())
  createdById String?  // null이면 시스템 제공 문제
  studyId     String?  // 스터디 전용 문제집
  
  title       String
  description String?  @db.Text
  category    String   // 대분류 (수능, 자격증 등)
  subCategory String?  // 소분류 (국어, 수학 등)
  year        Int?     // 출제 연도
  source      String?  // 출처 (2024 수능, 6월 모의평가 등)
  
  isPublic   Boolean @default(true)
  difficulty Int     @default(3)  // 1~5 난이도
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  questions Question[]
  exams     Exam[]
  
  createdBy User?  @relation(fields: [createdById], references: [id], onDelete: SetNull)
  study     Study? @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([category, subCategory])
  @@index([createdById])
  @@index([studyId])
}
```

### Question (문제)

```prisma
model Question {
  id             String       @id @default(cuid())
  questionBankId String
  
  // 문제 내용
  content    String  @db.Text  // 문제 텍스트 (Markdown 지원)
  type       QuestionType
  
  // 보기 (객관식)
  options    Json?   // ["보기1", "보기2", "보기3", "보기4", "보기5"]
  
  // 정답
  answer     String  // 객관식: "1", "2" 등 / 주관식: 정답 텍스트
  
  // 해설
  explanation String? @db.Text
  
  // 메타
  points     Int     @default(1)  // 배점
  timeLimit  Int?    // 문제별 제한시간 (초)
  difficulty Int     @default(3)
  tags       String[] // 태그 (함수, 미분, 적분 등)
  
  // 첨부파일
  imageUrl   String?  // 문제 이미지
  audioUrl   String?  // 듣기 문제 음성
  
  order      Int      @default(0)  // 문제 순서
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  questionBank QuestionBank    @relation(fields: [questionBankId], references: [id], onDelete: Cascade)
  attempts     QuestionAttempt[]
  wrongNotes   WrongNote[]
  
  @@index([questionBankId, order])
  @@index([type])
}

enum QuestionType {
  MULTIPLE_CHOICE  // 객관식 (단답)
  MULTIPLE_SELECT  // 객관식 (복수 정답)
  SHORT_ANSWER     // 주관식 단답형
  ESSAY            // 주관식 서술형
  TRUE_FALSE       // O/X
}
```

### Exam (시험)

```prisma
model Exam {
  id             String    @id @default(cuid())
  questionBankId String?
  studyId        String?
  createdById    String
  
  title       String
  description String?   @db.Text
  
  // 시험 설정
  timeLimit   Int?      // 총 제한 시간 (분)
  startTime   DateTime? // 시험 시작 시간 (예약)
  endTime     DateTime? // 시험 종료 시간
  
  // 문제 구성
  questionIds String[]  // 포함된 문제 ID 배열
  questionCount Int
  totalPoints   Int
  
  // 옵션
  shuffleQuestions Boolean @default(false)  // 문제 순서 셔플
  shuffleOptions   Boolean @default(false)  // 보기 순서 셔플
  showAnswer       Boolean @default(true)   // 제출 후 정답 표시
  allowRetake      Boolean @default(false)  // 재시험 허용
  maxAttempts      Int     @default(1)
  
  // 상태
  status ExamStatus @default(DRAFT)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  questionBank QuestionBank?  @relation(fields: [questionBankId], references: [id])
  study        Study?         @relation(fields: [studyId], references: [id], onDelete: Cascade)
  createdBy    User           @relation(fields: [createdById], references: [id])
  attempts     ExamAttempt[]
  
  @@index([studyId, status])
  @@index([createdById])
}

enum ExamStatus {
  DRAFT       // 작성 중
  SCHEDULED   // 예약됨
  ACTIVE      // 진행 중
  CLOSED      // 종료됨
}
```

### ExamAttempt (시험 응시)

```prisma
model ExamAttempt {
  id       String @id @default(cuid())
  examId   String
  userId   String
  
  // 시간
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  
  // 결과
  score       Int?
  percentage  Float?
  correctCount Int?
  wrongCount   Int?
  skippedCount Int?
  
  // 상태
  status AttemptStatus @default(IN_PROGRESS)
  
  exam     Exam              @relation(fields: [examId], references: [id], onDelete: Cascade)
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers  QuestionAttempt[]
  
  @@unique([examId, userId])  // allowRetake=false일 때
  @@index([userId])
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  GRADED
}
```

### QuestionAttempt (문제 응시)

```prisma
model QuestionAttempt {
  id            String @id @default(cuid())
  attemptId     String
  questionId    String
  
  answer        String?  // 사용자 답안
  isCorrect     Boolean?
  earnedPoints  Int?
  timeSpent     Int?     // 소요 시간 (초)
  
  createdAt DateTime @default(now())
  
  examAttempt ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question    Question    @relation(fields: [questionId], references: [id])
  
  @@unique([attemptId, questionId])
}
```

### WrongNote (오답 노트)

```prisma
model WrongNote {
  id         String @id @default(cuid())
  userId     String
  questionId String
  
  // 오답 정보
  myAnswer      String   // 내가 쓴 답
  correctAnswer String   // 정답
  attemptCount  Int      @default(1)  // 틀린 횟수
  lastAttemptAt DateTime @default(now())
  
  // 복습 상태
  reviewedAt DateTime?
  mastered   Boolean  @default(false)  // 숙지 완료 여부
  memo       String?  @db.Text         // 사용자 메모
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, questionId])
  @@index([userId, mastered])
}
```

---

## API 엔드포인트

### 문제 은행

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/question-banks` | 문제집 목록 |
| POST | `/api/question-banks` | 문제집 생성 |
| GET | `/api/question-banks/[id]` | 문제집 상세 |
| PATCH | `/api/question-banks/[id]` | 문제집 수정 |
| DELETE | `/api/question-banks/[id]` | 문제집 삭제 |

### 문제

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/question-banks/[id]/questions` | 문제 목록 |
| POST | `/api/question-banks/[id]/questions` | 문제 추가 |
| PATCH | `/api/questions/[id]` | 문제 수정 |
| DELETE | `/api/questions/[id]` | 문제 삭제 |
| POST | `/api/questions/import` | 문제 일괄 등록 (CSV/JSON) |

### 시험

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/exams` | 시험 목록 |
| POST | `/api/exams` | 시험 생성 |
| GET | `/api/exams/[id]` | 시험 상세 |
| POST | `/api/exams/[id]/start` | 시험 시작 |
| POST | `/api/exams/[id]/submit` | 시험 제출 |
| GET | `/api/exams/[id]/result` | 결과 조회 |
| GET | `/api/exams/[id]/ranking` | 시험 랭킹 |

### 오답 노트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/wrong-notes` | 오답 목록 |
| PATCH | `/api/wrong-notes/[id]` | 메모/상태 수정 |
| DELETE | `/api/wrong-notes/[id]` | 오답 삭제 |
| POST | `/api/wrong-notes/review` | 오답 복습 시험 생성 |

---

## 컴포넌트 구조

```
src/components/quiz/
├── QuestionBankList.jsx    # 문제집 목록
├── QuestionBankCard.jsx    # 문제집 카드
├── QuestionEditor.jsx      # 문제 편집기
├── QuestionViewer.jsx      # 문제 뷰어
├── OptionList.jsx          # 보기 목록
├── ExamCreator.jsx         # 시험 생성기
├── ExamTaker.jsx           # 시험 응시 화면
├── ExamTimer.jsx           # 시험 타이머
├── ExamResult.jsx          # 결과 화면
├── ScoreChart.jsx          # 성적 차트
├── WrongNoteList.jsx       # 오답 목록
├── WrongNoteCard.jsx       # 오답 카드
├── SubjectAnalysis.jsx     # 과목별 분석
├── QuestionImporter.jsx    # 문제 일괄 등록
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/quiz/page.jsx` | `/quiz` | 문제 은행 메인 |
| `src/app/quiz/banks/[id]/page.jsx` | `/quiz/banks/[id]` | 문제집 상세 |
| `src/app/quiz/exams/[id]/page.jsx` | `/quiz/exams/[id]` | 시험 응시 |
| `src/app/quiz/exams/[id]/result/page.jsx` | `/quiz/exams/[id]/result` | 시험 결과 |
| `src/app/quiz/wrong-notes/page.jsx` | `/quiz/wrong-notes` | 오답 노트 |
| `src/app/quiz/stats/page.jsx` | `/quiz/stats` | 성적 분석 |
| `src/app/my-studies/[id]/quiz/page.jsx` | `/my-studies/[id]/quiz` | 스터디 문제풀이 |

---

## 문제 형식 예시

### 객관식 (MULTIPLE_CHOICE)

```json
{
  "content": "다음 중 JavaScript의 원시 타입이 아닌 것은?",
  "type": "MULTIPLE_CHOICE",
  "options": ["string", "number", "array", "boolean", "undefined"],
  "answer": "3",
  "explanation": "Array는 참조 타입(객체)입니다. 원시 타입에는 string, number, boolean, undefined, null, symbol, bigint가 있습니다."
}
```

### 주관식 (SHORT_ANSWER)

```json
{
  "content": "React에서 상태 관리를 위해 사용하는 Hook의 이름은?",
  "type": "SHORT_ANSWER",
  "answer": "useState",
  "explanation": "useState는 함수형 컴포넌트에서 상태를 관리하기 위한 기본 Hook입니다."
}
```

---

## 구현 우선순위

1. **Phase 1**: 문제 은행 CRUD, 기본 문제 형식
2. **Phase 2**: 시험 생성, 응시, 자동 채점
3. **Phase 3**: 오답 노트 자동 수집
4. **Phase 4**: 성적 분석, 차트
5. **Phase 5**: 스터디 시험, 랭킹
6. **Phase 6**: 문제 가져오기/공유

---

## 관련 문서

- [25-collaborative-notes](../25-collaborative-notes/README.md) - 문제 토론
- [23-study-timer](../23-study-timer/README.md) - 학습 시간 연동
- [27-gamification](../27-gamification/README.md) - 점수 기반 보상

