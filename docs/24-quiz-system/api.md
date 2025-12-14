# 퀴즈 시스템 API 명세

## 개요

문제풀이 시스템의 REST API 상세 명세입니다.

---

## 문제집 (Question Bank) API

### GET /api/question-banks

문제집 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지당 개수 (기본: 20) |
| category | string | ❌ | 카테고리 필터 |
| subCategory | string | ❌ | 세부 카테고리 |
| search | string | ❌ | 제목/설명 검색 |
| studyId | string | ❌ | 스터디 전용 문제집 |
| mine | boolean | ❌ | 내가 만든 문제집만 |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "qb_cuid",
      "title": "정보처리기사 기출문제 2024",
      "description": "2024년 1회~3회 필기 기출",
      "category": "자격증",
      "subCategory": "정보처리기사",
      "year": 2024,
      "source": "한국산업인력공단",
      "difficulty": 3,
      "questionCount": 80,
      "isPublic": true,
      "createdBy": {
        "id": "user_id",
        "name": "관리자"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

---

### POST /api/question-banks

새 문제집을 생성합니다.

**Request Body:**
```json
{
  "title": "React 면접 질문",
  "description": "React 프론트엔드 면접 대비 문제",
  "category": "IT",
  "subCategory": "프론트엔드",
  "difficulty": 3,
  "isPublic": true,
  "studyId": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "qb_new_cuid",
    "title": "React 면접 질문",
    ...
  }
}
```

---

### GET /api/question-banks/[id]

문제집 상세 정보를 조회합니다.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "qb_cuid",
    "title": "정보처리기사 기출문제 2024",
    "description": "...",
    "category": "자격증",
    "subCategory": "정보처리기사",
    "questionCount": 80,
    "questions": [
      {
        "id": "q_1",
        "content": "다음 중 OSI 7계층에서...",
        "type": "MULTIPLE_CHOICE",
        "options": ["...", "...", "...", "..."],
        "difficulty": 2,
        "points": 1,
        "order": 1
      }
    ],
    "createdBy": { "id": "...", "name": "..." },
    "createdAt": "..."
  }
}
```

---

### PATCH /api/question-banks/[id]

문제집을 수정합니다.

**Request Body:**
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명"
}
```

---

### DELETE /api/question-banks/[id]

문제집을 삭제합니다. (본인 생성 또는 관리자만)

---

## 문제 (Question) API

### POST /api/question-banks/[id]/questions

문제집에 문제를 추가합니다.

**Request Body:**
```json
{
  "content": "다음 중 RESTful API의 특징이 아닌 것은?",
  "type": "MULTIPLE_CHOICE",
  "options": [
    "무상태성 (Stateless)",
    "캐시 가능 (Cacheable)",
    "계층화된 시스템",
    "세션 기반 인증"
  ],
  "answer": "4",
  "explanation": "REST는 무상태성을 원칙으로 하므로 세션 기반 인증은 적합하지 않습니다.",
  "points": 1,
  "difficulty": 2,
  "tags": ["REST", "API", "웹개발"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "q_new_cuid",
    "content": "...",
    "type": "MULTIPLE_CHOICE",
    ...
  }
}
```

---

### POST /api/questions/import

문제를 일괄 등록합니다. (CSV/JSON)

**Request Body:**
```json
{
  "questionBankId": "qb_cuid",
  "format": "json",
  "questions": [
    {
      "content": "...",
      "type": "MULTIPLE_CHOICE",
      "options": ["...", "...", "...", "..."],
      "answer": "1",
      "explanation": "..."
    }
  ]
}
```

---

### PATCH /api/questions/[id]

문제를 수정합니다.

---

### DELETE /api/questions/[id]

문제를 삭제합니다.

---

## 시험 (Exam) API

### GET /api/exams

시험 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | string | DRAFT, SCHEDULED, ACTIVE, CLOSED |
| studyId | string | 스터디 시험 |
| mine | boolean | 내가 만든 시험 |

---

### POST /api/exams

시험을 생성합니다.

**Request Body:**
```json
{
  "title": "React 기초 테스트",
  "description": "React 기본 개념 확인 시험",
  "questionBankId": "qb_cuid",
  "questionIds": ["q_1", "q_2", "q_3", "q_4", "q_5"],
  "timeLimit": 30,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showAnswer": true,
  "allowRetake": false,
  "studyId": "study_cuid"
}
```

---

### POST /api/exams/[id]/start

시험을 시작합니다.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_cuid",
    "exam": {
      "id": "exam_cuid",
      "title": "React 기초 테스트",
      "timeLimit": 30,
      "questionCount": 5
    },
    "questions": [
      {
        "id": "q_1",
        "content": "React의 핵심 개념이 아닌 것은?",
        "type": "MULTIPLE_CHOICE",
        "options": ["컴포넌트", "Virtual DOM", "양방향 바인딩", "JSX"],
        "order": 1
      }
    ],
    "startedAt": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T10:30:00Z"
  }
}
```

---

### POST /api/exams/[id]/submit

시험을 제출합니다.

**Request Body:**
```json
{
  "attemptId": "attempt_cuid",
  "answers": [
    { "questionId": "q_1", "answer": "3", "timeSpent": 45 },
    { "questionId": "q_2", "answer": "2", "timeSpent": 30 },
    { "questionId": "q_3", "answer": "1", "timeSpent": 60 },
    { "questionId": "q_4", "answer": null, "timeSpent": 0 },
    { "questionId": "q_5", "answer": "4", "timeSpent": 55 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_cuid",
    "score": 60,
    "totalPoints": 5,
    "percentage": 60.0,
    "correctCount": 3,
    "wrongCount": 1,
    "skippedCount": 1,
    "isPassed": true,
    "timeSpent": 190,
    "results": [
      {
        "questionId": "q_1",
        "myAnswer": "3",
        "correctAnswer": "3",
        "isCorrect": true,
        "explanation": "..."
      }
    ]
  }
}
```

---

### GET /api/exams/[id]/result

시험 결과를 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| attemptId | string | 특정 응시 기록 |

---

### GET /api/exams/[id]/ranking

시험 랭킹을 조회합니다.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": { "id": "...", "name": "김철수", "avatar": "..." },
        "score": 100,
        "percentage": 100,
        "timeSpent": 180,
        "submittedAt": "..."
      }
    ],
    "myRank": {
      "rank": 3,
      "score": 80,
      "percentage": 80
    },
    "stats": {
      "totalParticipants": 25,
      "averageScore": 72,
      "highestScore": 100,
      "lowestScore": 40
    }
  }
}
```

---

## 오답 노트 API

### GET /api/wrong-notes

오답 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| category | string | 카테고리 필터 |
| mastered | boolean | 숙지 여부 필터 |
| sort | string | createdAt, attemptCount |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "wn_cuid",
      "question": {
        "id": "q_1",
        "content": "...",
        "type": "MULTIPLE_CHOICE",
        "options": ["...", "...", "...", "..."],
        "explanation": "...",
        "questionBank": {
          "title": "정보처리기사",
          "category": "자격증"
        }
      },
      "myAnswer": "2",
      "correctAnswer": "3",
      "attemptCount": 3,
      "mastered": false,
      "memo": "헷갈리는 개념, 다시 복습 필요",
      "lastAttemptAt": "..."
    }
  ]
}
```

---

### PATCH /api/wrong-notes/[id]

오답 노트를 수정합니다. (메모, 숙지 상태)

**Request Body:**
```json
{
  "memo": "암기 완료",
  "mastered": true
}
```

---

### POST /api/wrong-notes/review

오답 복습 시험을 생성합니다.

**Request Body:**
```json
{
  "count": 10,
  "includemastered": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "examId": "review_exam_cuid",
    "questionCount": 10
  }
}
```

