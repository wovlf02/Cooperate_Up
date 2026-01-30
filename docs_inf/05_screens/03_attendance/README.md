# 출퇴근 화면 (Attendance Screens)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 📁 파일 구조

```
03_attendance/
├── README.md              # 개요 (이 파일)
├── attendance-main.md     # 출퇴근 메인 화면
├── manual-input.md        # 수동 근태 입력 화면
└── edit-request.md        # 근태 수정 요청 화면
```

---

## 화면 목록

| 화면 | 파일 | 설명 |
|------|------|------|
| 출퇴근 메인 | [attendance-main.md](./attendance-main.md) | GPS 기반 출퇴근 체크 |
| 수동 근태 입력 | [manual-input.md](./manual-input.md) | 수동으로 출퇴근 기록 |
| 근태 수정 요청 | [edit-request.md](./edit-request.md) | 기존 근태 수정 요청 |

---

## 🎯 핵심 기능

### GPS 출퇴근
- 매장 위치 기반 출퇴근 가능 여부 판단
- **50m 이내**에서만 출퇴근 가능
- 거리 및 위치 실시간 표시

### 20시 기준 정산
- 20시 이전 출근 → **20시부터** 급여 계산
- 20시 이후 출근 → **실제 출근 시간**부터 계산
- UI에서 정산 기준 시간 명확히 표시

### 승인 프로세스
- 수동 입력/수정 요청 → 관리자 승인 대기
- 승인 후 급여에 반영
- 거부 시 사유와 함께 알림

---

## 핵심 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| BigAttendanceButton | wp(50) x wp(50) 대형 원형 버튼 |
| LocationStatusCard | 현재 위치 상태 (가능/불가능) |
| TimeDisplayCard | 현재 시간, 출퇴근 시간 표시 |
| ExpectedWorkInfo | 예상 근무시간/급여 |

---

## 공통 스타일 패턴

모든 화면에 적용되는 스타일:

```typescript
// 기본 컨테이너
container: {
  flex: 1,
  backgroundColor: colors.neutral50,
}

// 스크롤 컨텐츠
scrollContent: {
  paddingHorizontal: layout.screenPadding,
  paddingTop: spacing.space4,
  gap: spacing.space4,
}

// 카드 스타일
card: {
  backgroundColor: colors.white,
  borderRadius: borderRadius.xl,
  padding: spacing.space4,
  ...shadows.sm,
}

// 하단 고정 버튼
fixedBottom: {
  paddingHorizontal: layout.screenPadding,
  paddingTop: spacing.space3,
  paddingBottom: safeAreaBottom + spacing.space3,
  backgroundColor: colors.white,
  borderTopWidth: 1,
  borderTopColor: colors.neutral100,
}
```

---

## 유효성 검사 규칙

### 수동 입력 / 수정 요청 공통
- 날짜: 필수, 과거 7일 이내
- 출근 시간: 필수, 18:00 ~ 23:59
- 퇴근 시간: 필수, 출근 후 ~ 익일 08:00
- 사유: 10자 이상 필수
