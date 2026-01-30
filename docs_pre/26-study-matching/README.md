# 🎯 스터디 매칭 시스템

## 개요

사용자의 학습 목표, 관심 분야, 학습 스타일을 분석하여
최적의 스터디를 추천하고 매칭해주는 시스템입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 프로필 분석 | 사용자 관심사, 목표, 수준 분석 |
| 스터디 추천 | AI 기반 맞춤 스터디 추천 |
| 스터디 메이트 추천 | 비슷한 목표의 사용자 추천 |
| 호환성 점수 | 스터디-사용자 간 적합도 점수 |
| 빠른 매칭 | 자동으로 스터디에 배정 |
| 필터 검색 | 상세 조건으로 스터디 검색 |
| 학습 스타일 테스트 | 나의 학습 유형 파악 |
| 매칭 히스토리 | 과거 매칭 기록 |

---

## 매칭 알고리즘

### 추천 점수 계산 요소

| 요소 | 가중치 | 설명 |
|------|--------|------|
| 카테고리 일치 | 30% | 관심 분야 일치도 |
| 목표 유사도 | 25% | 학습 목표 벡터 유사도 |
| 레벨 적합성 | 15% | 현재 수준과 스터디 난이도 |
| 활동 시간대 | 15% | 활동 가능 시간대 일치 |
| 스터디 스타일 | 10% | 온라인/오프라인, 자유/체계적 |
| 위치 | 5% | 오프라인 모임 거리 |

### 알고리즘 흐름

```
1. 사용자 프로필 벡터화
   - 관심 카테고리 (원핫 인코딩)
   - 목표 키워드 (TF-IDF 또는 임베딩)
   - 학습 스타일 (설문 기반)
   
2. 스터디 벡터화
   - 카테고리, 태그, 설명 분석
   - 멤버 구성, 활동 패턴
   
3. 유사도 계산
   - 코사인 유사도
   - 가중 평균 점수
   
4. 랭킹 및 추천
   - 상위 N개 스터디 추천
   - 다양성 보장 (같은 카테고리만 추천 X)
```

---

## 데이터 모델

### UserPreference (사용자 선호도)

```prisma
model UserPreference {
  id     String @id @default(cuid())
  userId String @unique
  
  // 관심 분야
  categories    String[]  // 관심 카테고리
  subCategories String[]  // 세부 분야
  goals         String[]  // 학습 목표 (토익 900점, 정처기 합격 등)
  
  // 학습 스타일
  learningStyle   LearningStyle?
  studyPreference StudyPreference?
  
  // 활동 가능 시간
  availableDays   String[]  // ["MON", "TUE", "WED"...]
  availableTime   String?   // "19:00-22:00"
  timezone        String    @default("Asia/Seoul")
  
  // 위치 (오프라인)
  location     String?   // 지역 (서울 강남 등)
  latitude     Float?
  longitude    Float?
  maxDistance  Int?      // km 단위
  
  // 기타
  currentLevel  String?   // 현재 수준 (초급/중급/고급)
  weeklyGoal    Int?      // 주간 목표 시간
  
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum LearningStyle {
  VISUAL       // 시각형 (영상, 자료)
  AUDITORY     // 청각형 (강의, 토론)
  READING      // 읽기/쓰기형
  KINESTHETIC  // 실습형
}

enum StudyPreference {
  SELF_PACED   // 자율 학습
  STRUCTURED   // 체계적 커리큘럼
  DISCUSSION   // 토론 중심
  PROJECT      // 프로젝트 기반
}
```

### StudyRecommendation (추천 기록)

```prisma
model StudyRecommendation {
  id      String @id @default(cuid())
  userId  String
  studyId String
  
  score        Float    // 추천 점수 (0~100)
  reason       String[] // 추천 이유
  
  // 사용자 반응
  viewed    Boolean @default(false)
  clicked   Boolean @default(false)
  applied   Boolean @default(false)  // 가입 신청 여부
  dismissed Boolean @default(false)  // 관심 없음 표시
  
  createdAt DateTime @default(now())
  
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@unique([userId, studyId])
  @@index([userId, score])
}
```

### QuickMatch (빠른 매칭)

```prisma
model QuickMatch {
  id       String           @id @default(cuid())
  userId   String
  category String
  status   QuickMatchStatus @default(WAITING)
  
  // 매칭 조건
  minMembers  Int?
  maxMembers  Int?
  levelRange  String[]  // ["초급", "중급"]
  
  // 결과
  matchedStudyId String?
  matchedAt      DateTime?
  
  createdAt DateTime @default(now())
  expiresAt DateTime  // 대기 만료 시간
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([status, category])
}

enum QuickMatchStatus {
  WAITING   // 대기 중
  MATCHED   // 매칭됨
  EXPIRED   // 만료됨
  CANCELLED // 취소됨
}
```

---

## API 엔드포인트

### 선호도 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/matching/preferences` | 내 선호도 조회 |
| PUT | `/api/matching/preferences` | 선호도 설정/수정 |
| POST | `/api/matching/style-test` | 학습 스타일 테스트 제출 |

### 추천

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/matching/recommendations` | 추천 스터디 목록 |
| POST | `/api/matching/recommendations/[id]/feedback` | 추천 피드백 |
| GET | `/api/matching/users` | 스터디 메이트 추천 |

### 빠른 매칭

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/matching/quick` | 빠른 매칭 신청 |
| GET | `/api/matching/quick/status` | 매칭 상태 확인 |
| DELETE | `/api/matching/quick` | 매칭 취소 |

---

## 컴포넌트 구조

```
src/components/matching/
├── PreferenceForm.jsx       # 선호도 입력 폼
├── StyleTestModal.jsx       # 학습 스타일 테스트
├── RecommendationList.jsx   # 추천 스터디 목록
├── RecommendationCard.jsx   # 추천 카드 (점수, 이유 표시)
├── CompatibilityScore.jsx   # 호환성 점수 시각화
├── QuickMatchButton.jsx     # 빠른 매칭 버튼
├── QuickMatchStatus.jsx     # 매칭 대기 상태
├── MateRecommendation.jsx   # 스터디 메이트 추천
├── FilterPanel.jsx          # 상세 필터
├── CategorySelector.jsx     # 카테고리 선택
├── GoalInput.jsx            # 목표 입력
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/matching/page.jsx` | `/matching` | 매칭 메인 (추천 목록) |
| `src/app/matching/preferences/page.jsx` | `/matching/preferences` | 선호도 설정 |
| `src/app/matching/test/page.jsx` | `/matching/test` | 학습 스타일 테스트 |
| `src/app/matching/quick/page.jsx` | `/matching/quick` | 빠른 매칭 |

---

## 학습 스타일 테스트

### 질문 예시

```javascript
const styleQuestions = [
  {
    question: "새로운 개념을 배울 때 선호하는 방식은?",
    options: [
      { text: "영상이나 그림으로 보면서 배운다", style: "VISUAL" },
      { text: "강의나 설명을 들으면서 배운다", style: "AUDITORY" },
      { text: "책이나 문서를 읽으면서 배운다", style: "READING" },
      { text: "직접 해보면서 배운다", style: "KINESTHETIC" }
    ]
  },
  {
    question: "스터디에서 선호하는 학습 방식은?",
    options: [
      { text: "각자 공부하고 질문만 공유", style: "SELF_PACED" },
      { text: "정해진 커리큘럼을 함께 진행", style: "STRUCTURED" },
      { text: "주제에 대해 토론하며 학습", style: "DISCUSSION" },
      { text: "함께 프로젝트를 진행하며 학습", style: "PROJECT" }
    ]
  },
  // ... 더 많은 질문
]
```

---

## UI/UX 설계

### 추천 카드 디자인

```
┌─────────────────────────────────────┐
│ 📚 React 마스터 클래스              │
│ ⭐ 92% 매칭                         │
│                                     │
│ 🏷️ 프론트엔드 · 중급 · 온라인        │
│ 👥 8/12명 · 매주 화, 목 저녁        │
│                                     │
│ 💡 추천 이유                         │
│  • 관심 분야 일치                    │
│  • 비슷한 수준의 멤버 구성            │
│  • 활동 시간대 겹침                  │
│                                     │
│ [자세히 보기] [가입 신청] [관심없음]  │
└─────────────────────────────────────┘
```

---

## 구현 우선순위

1. **Phase 1**: 선호도 프로필 설정
2. **Phase 2**: 기본 추천 알고리즘 (카테고리 기반)
3. **Phase 3**: 학습 스타일 테스트
4. **Phase 4**: 고급 매칭 (유사도 계산)
5. **Phase 5**: 빠른 매칭
6. **Phase 6**: 스터디 메이트 추천

---

## 관련 문서

- [04-studies](../04-studies/README.md) - 스터디 시스템
- [03-users](../03-users/README.md) - 사용자 프로필
- [28-ai-assistant](../28-ai-assistant/README.md) - AI 추천 연동

