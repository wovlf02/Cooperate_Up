# 09. 관리자 (Admin) TODO

> **Phase**: 2단계  
> **우선순위**: 🟠 중간

## 📊 진행 상황

**진행률**: 100%

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 화면

#### 직원 관리
- ✅ `EmployeeListScreen.tsx` - 근무자 목록
  - 전체 직원 목록
  - 출근 상태 표시
  - 검색/필터링

- ✅ `EmployeeDetailScreen.tsx` - 근무자 상세
  - 직원 정보
  - 시급 설정
  - 근무 시간 설정
  - 계정 비활성화

- ✅ `InviteEmployeeScreen.tsx` - 직원 초대 (기존 구현됨)

#### 승인 관리
- ✅ `ApprovalListScreen.tsx` - 승인 요청 목록
  - 수동 근태 입력 승인
  - 근태 수정 요청 승인
  - 승인/거부 처리
  - 거부 사유 입력

---

## 📱 화면 목록

| 화면 | 파일 | 상태 | 설명 |
|------|------|------|------|
| 근무자 목록 | `EmployeeListScreen.tsx` | ✅ 완료 | 전체 직원 관리 |
| 근무자 상세 | `EmployeeDetailScreen.tsx` | ✅ 완료 | 시급/시간 설정 |
| 직원 초대 | `InviteEmployeeScreen.tsx` | ✅ 완료 | 초대 코드 생성 |
| 승인 목록 | `ApprovalListScreen.tsx` | ✅ 완료 | 승인 요청 처리 |

---

## 🎯 필요한 작업

### 1. EmployeeListScreen 구현 (필수)
**우선순위**: 🔴 높음

```typescript
// EmployeeListScreen.tsx
- 전체 직원 목록 조회
- 출근 상태 표시 (working/off)
- 검색 기능
- 필터링 (활성/비활성)
- 직원 상세로 이동
```

**예상 시간**: 6-8시간

---

### 2. EmployeeDetailScreen 구현 (필수)
**우선순위**: 🔴 높음

```typescript
// EmployeeDetailScreen.tsx
- 직원 기본 정보 표시
- 시급 설정 (최저시급 검증)
- 근무 시간 설정 (요일별)
- 계정 활성화/비활성화
- 근무 통계 표시
```

**예상 시간**: 8-10시간

---

### 3. ApprovalListScreen 구현 (필수)
**우선순위**: 🔴 높음

```typescript
// ApprovalListScreen.tsx
- 승인 대기 목록 조회
- 요청 타입별 분류 (수동 입력/수정 요청)
- 승인/거부 버튼
- 거부 시 사유 입력
- 실시간 알림 연동
```

**예상 시간**: 8-10시간

---

## 📚 참고 문서

| 문서 | 경로 |
|------|------|
| 근무자 목록 명세 | `docs/05_screens/09_admin/employee-list.md` |
| 근무자 상세 명세 | `docs/05_screens/09_admin/employee-detail.md` |
| 승인 목록 명세 | `docs/05_screens/09_admin/approval-list.md` |

---

## ⏭️ 다음 단계

1. → [10-contract.md](./10-contract.md) (근로계약서)

