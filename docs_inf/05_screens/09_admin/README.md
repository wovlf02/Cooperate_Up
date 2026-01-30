# 관리자 화면 (Admin Screens)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 📁 파일 구조

```
09_admin/
├── README.md              # 개요 (이 파일)
├── employee-list.md       # 근무자 목록 화면
├── employee-detail.md     # 근무자 상세 화면
├── employee-invite.md     # 직원 초대 화면
├── approval-list.md       # 승인 요청 목록 화면
├── salary-management.md   # 급여 관리 화면
└── salary-detail.md       # 급여 명세서 화면
```

---

## 화면 목록

| 화면 | 파일 | 설명 |
|------|------|------|
| 근무자 목록 | [employee-list.md](./employee-list.md) | 전체 근무자 관리 |
| 근무자 상세 | [employee-detail.md](./employee-detail.md) | 근무자 정보, 시급/근무시간 설정 |
| 직원 초대 | [employee-invite.md](./employee-invite.md) | 초대 코드 기반 직원 초대 |
| 승인 요청 | [approval-list.md](./approval-list.md) | 승인 대기 요청 처리 |
| 급여 관리 | [salary-management.md](./salary-management.md) | 월별 전체 급여 현황 |
| 급여 명세서 | [salary-detail.md](./salary-detail.md) | 근무자별 급여 상세 |

---

## 🎯 핵심 기능

### 근무자 관리
- 근무자 목록 조회 (출근 상태 표시)
- 시급 개별 설정 (최저시급 검증)
- 직원별 근무 시간 설정
- 계정 비활성화

### 직원 초대
- 초대 코드 기반 간편 초대
- 코드 복사 및 공유 기능
- 코드 재발급 옵션
- 만료일 관리

### 승인 처리
- 수동 근태 입력 승인/거부
- 근태 수정 요청 승인/거부
- 거부 시 사유 입력 필수

### 급여 관리
- 월별 전체 급여 현황
- 근무자별 급여 상세 (산출식 표시)
- PDF 내보내기 및 공유

---

## 공통 스타일 패턴

모든 관리자 화면에 적용되는 스타일:

```typescript
// 기본 컨테이너
container: {
  flex: 1,
  backgroundColor: colors.neutral50,
}

// 컨텐츠 영역
content: {
  paddingHorizontal: layout.screenPadding,
  paddingTop: spacing.space4,
  paddingBottom: safeAreaBottom + tabBarHeight,
}

// 카드 스타일
card: {
  backgroundColor: colors.white,
  borderRadius: borderRadius.xl,
  padding: spacing.space4,
  ...shadows.sm,
}

// 하이라이트 카드 (요약 정보)
highlightCard: {
  backgroundColor: colors.brand50,
  borderRadius: borderRadius.xl,
  padding: spacing.space5,
}

// 섹션 헤더
sectionHeader: {
  ...typography.titleSmall,
  color: colors.textPrimary,
  fontWeight: '600',
  marginBottom: spacing.space3,
}

// 리스트 아이템
listItem: {
  backgroundColor: colors.white,
  borderRadius: borderRadius.xl,
  padding: spacing.space4,
  marginBottom: spacing.space3,
  ...shadows.sm,
}
```

---

## 접근성 요구사항

- 모든 버튼에 `accessibilityLabel` 적용
- 터치 영역 최소 44px 확보
- 색상 대비 WCAG AA 충족
- 스크린리더 지원

---

## 성능 최적화

- 리스트 아이템 메모이제이션
- 월별 데이터 캐싱 (5분)
- 이미지 lazy loading
- 불필요한 리렌더링 방지
