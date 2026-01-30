# 퀴즈 시스템 데이터베이스 모델

## 개요

문제풀이 시스템에 필요한 Prisma 모델 상세 정의입니다.

---

## Prisma Schema

### QuestionBank (문제집)

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
  @@index([isPublic, category])
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
  @@index([difficulty])
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
  questionIds   String[]  // 포함된 문제 ID 배열
  questionCount Int
  totalPoints   Int
  
  // 옵션
  shuffleQuestions Boolean @default(false)  // 문제 순서 셔플
  shuffleOptions   Boolean @default(false)  // 보기 순서 셔플
  showAnswer       Boolean @default(true)   // 제출 후 정답 표시
  allowRetake      Boolean @default(false)  // 재시험 허용
  maxAttempts      Int     @default(1)
  passScore        Int?    // 합격 점수
  
  // 상태
  status ExamStatus @default(DRAFT)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  questionBank QuestionBank?  @relation(fields: [questionBankId], references: [id])
  study        Study?         @relation(fields: [studyId], references: [id], onDelete: Cascade)
  createdBy    User           @relation("ExamCreator", fields: [createdById], references: [id])
  attempts     ExamAttempt[]
  
  @@index([studyId, status])
  @@index([createdById])
  @@index([status, startTime])
}

enum ExamStatus {
  DRAFT       // 작성 중
  SCHEDULED   // 예약됨
  ACTIVE      // 진행 중
  CLOSED      // 종료됨
}
```

### ExamAttempt (시험 응시 기록)

```prisma
model ExamAttempt {
  id       String @id @default(cuid())
  examId   String
  userId   String
  
  attemptNumber Int @default(1)  // 시도 횟수
  
  // 시간
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  
  // 결과
  score        Int?
  percentage   Float?
  correctCount Int?
  wrongCount   Int?
  skippedCount Int?
  isPassed     Boolean?
  
  // 상태
  status AttemptStatus @default(IN_PROGRESS)
  
  exam     Exam              @relation(fields: [examId], references: [id], onDelete: Cascade)
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers  QuestionAttempt[]
  
  @@index([examId, userId])
  @@index([userId, status])
}

enum AttemptStatus {
  IN_PROGRESS  // 진행 중
  SUBMITTED    // 제출됨
  GRADED       // 채점 완료
  TIMEOUT      // 시간 초과
}
```

### QuestionAttempt (문제 응시 기록)

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
  @@index([userId, createdAt])
}
```

---

## 관계 다이어그램

```
User
  ├── QuestionBank (createdBy)
  ├── Exam (createdBy)
  ├── ExamAttempt
  └── WrongNote

Study
  ├── QuestionBank
  └── Exam

QuestionBank
  ├── Question[]
  └── Exam[]

Exam
  └── ExamAttempt[]
        └── QuestionAttempt[]

Question
  ├── QuestionAttempt[]
  └── WrongNote[]
```

---

## 마이그레이션 명령

```bash
npx prisma migrate dev --name add_quiz_system
npx prisma generate
```

---

## 시드 데이터 예시

```javascript
// prisma/seed-quiz.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedQuiz() {
  // 기본 문제집 생성
  const bank = await prisma.questionBank.create({
    data: {
      title: '정보처리기사 기출문제',
      description: '정보처리기사 필기 기출문제 모음',
      category: '자격증',
      subCategory: '정보처리기사',
      year: 2024,
      isPublic: true,
      difficulty: 3,
      questions: {
        create: [
          {
            content: '다음 중 소프트웨어 개발 방법론이 아닌 것은?',
            type: 'MULTIPLE_CHOICE',
            options: ['폭포수 모델', '애자일', '빅뱅', 'DevOps'],
            answer: '3',
            explanation: '빅뱅은 소프트웨어 개발 방법론이 아닙니다.',
            points: 1,
            difficulty: 2,
            tags: ['소프트웨어공학', '개발방법론'],
            order: 1
          },
          // ... 더 많은 문제
        ]
      }
    }
  })
  
  console.log('Quiz seed completed:', bank.id)
}

seedQuiz()
```

