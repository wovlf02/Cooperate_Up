# 🧩 목록 관련 컴포넌트

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| StudyCard | - | 스터디 카드 |
| StudiesSkeleton | `StudiesSkeleton.jsx` | 로딩 스켈레톤 |
| StudiesEmptyState | `StudiesEmptyState.jsx` | 빈 상태 |
| CategoryTabs | - | 카테고리 탭 |
| SearchBar | - | 검색바 |
| FilterDropdown | - | 필터 드롭다운 |

---

## StudyCard

스터디 목록에서 개별 스터디를 표시하는 카드입니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| study | object | 스터디 데이터 |
| onClick | function | 클릭 핸들러 |

### 표시 정보

- 이모지 + 이름
- 카테고리 뱃지
- 현재/최대 인원
- 모집 상태 뱃지
- 태그 (최대 3개)
- 소유자 정보

---

## StudiesSkeleton

로딩 중 표시되는 스켈레톤 UI입니다.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | 6 | 스켈레톤 개수 |

---

## StudiesEmptyState

검색 결과가 없을 때 표시됩니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| message | string | 안내 메시지 |
| onCreateClick | function | 생성 버튼 클릭 |

---

## 관련 문서

- [목록 화면](./screens-list.md) - 화면 구조

