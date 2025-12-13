# 🧩 사이드바 위젯 컴포넌트

## 경로

`src/components/studies/sidebar/`

## 컴포넌트 목록

| 컴포넌트 | 설명 |
|---------|------|
| StudySidebar | 사이드바 컨테이너 |
| QuickInfo | 빠른 정보 |
| MemberPreview | 멤버 미리보기 |
| RecentActivity | 최근 활동 |
| StudyStats | 스터디 통계 |

---

## StudySidebar

스터디 상세 페이지의 사이드바입니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| study | object | 스터디 데이터 |

---

## QuickInfo

주요 정보를 간략히 표시합니다.

### 표시 항목

- 카테고리
- 생성일
- 모집 상태
- 멤버 수

---

## MemberPreview

멤버를 미리보기로 표시합니다.

### 표시 항목

- 소유자 (👑)
- 관리자
- 멤버 (일부)
- "+N명" 표시

---

## 관련 문서

- [상세 화면](./screens-detail.md) - 화면 구조

