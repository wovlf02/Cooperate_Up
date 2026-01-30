# 05. 체크리스트 (Checklist) TODO

> **Phase**: 2단계  
> **우선순위**: 🟠 중간

## 📊 진행 상황

**진행률**: 100%

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 항목

#### 화면 구현
- ✅ `ChecklistScreen.tsx` - 체크리스트 화면 (직원/사업주 통합)
- ✅ `ChecklistMonitorScreen.tsx` - 전체 직원 모니터링 (사업주)
- ✅ `ChecklistEditorScreen.tsx` - 체크리스트 생성/수정 (사업주)

#### 체크리스트 컴포넌트
- ✅ `ChecklistCard.tsx` - 체크리스트 카드
- ✅ `ChecklistItemRow.tsx` - 체크리스트 항목
- ✅ `DailySummaryHeader.tsx` - 일일 요약 헤더

#### 핵심 기능
- ✅ 체크리스트 조회
- ✅ 체크 완료/취소
- ✅ 진행률 표시
- ✅ 직원별 진행률 모니터링
- ✅ 체크리스트 템플릿 생성/편집

### ⏳ 남은 작업 (선택사항)

- ✅ 카테고리별 필터링
- ✅ 시간대별 필터링
- ✅ 햅틱 피드백
- [ ] 알림 설정

---

## 📱 화면 목록

| 화면 | 파일 | 상태 | 권한 | 설명 |
|------|------|------|------|------|
| 체크리스트 | `ChecklistScreen.tsx` | ✅ 완료 | 직원 | 업무 체크 |
| 모니터링 | `ChecklistMonitorScreen.tsx` | ❌ 미구현 | 사업주 | 전체 진행률 |
| 편집기 | `ChecklistEditorScreen.tsx` | ❌ 미구현 | 사업주 | 체크리스트 관리 |

---

## 🎯 필요한 작업

### 1. ChecklistMonitorScreen 구현
**우선순위**: 🔴 높음

```typescript
// ChecklistMonitorScreen.tsx
- 전체 직원 진행률 카드
- 진행률 50% 미만 직원 경고
- 직원별 상세 현황
- 완료 내역 기록
```

**예상 시간**: 6-8시간

---

### 2. ChecklistEditorScreen 구현
**우선순위**: 🟠 중간

```typescript
// ChecklistEditorScreen.tsx
- 체크리스트 항목 추가/삭제
- 카테고리 선택 (오픈/마감/청소/재고 등)
- 시간대 설정
- 반복 요일 설정
- 드래그 앤 드롭으로 순서 변경
```

**예상 시간**: 8-10시간

---

## 📚 참고 문서

| 문서 | 경로 |
|------|------|
| 직원 체크리스트 명세 | `docs/05_screens/05_checklist/checklist-worker.md` |
| 모니터링 명세 | `docs/05_screens/05_checklist/checklist-monitor.md` |

---

## ⏭️ 다음 단계

1. → [06-announcement.md](./06-announcement.md) (공지사항)

