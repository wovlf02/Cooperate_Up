# 캘린더 화면 (Calendar Screens)

## 📁 파일 구조

```
04_calendar/
├── README.md              # 개요 (이 파일)
├── calendar-main.md       # 월별 캘린더 화면
└── day-detail.md          # 일별 상세 화면
```

---

## 화면 목록

| 화면 | 파일 | 설명 |
|------|------|------|
| 캘린더 | [calendar-main.md](./calendar-main.md) | 월별 근무 현황 캘린더 |
| 일별 상세 | [day-detail.md](./day-detail.md) | 특정 날짜 근무 상세 |

---

## 핵심 기능

### 월별 캘린더
- 출근한 날짜 표시 (dot indicator)
- 월 총 근무시간/급여 요약
- 좌우 스와이프로 월 이동

### 일별 상세
- 출퇴근 시간 및 타임라인
- 급여 기준 시간 (20시 기준) 표시
- 근무 시간 및 일급 계산

---

## 핵심 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| MonthSelector | 월 선택기 (좌/우 버튼) |
| CalendarGrid | 월별 캘린더 그리드 |
| DayCell | 날짜 셀 (상태별 스타일) |
| MonthlySummaryCard | 월별 요약 카드 |
| TimelineBar | 근무 시간 타임라인 |
| SalaryInfoCard | 급여 정보 카드 |

---

## 날짜 셀 상태

| 상태 | 날짜 색상 | dot |
|------|----------|-----|
| 기본 | gray700 | 없음 |
| 출근함 | gray700 | primary |
| 오늘 | primary | border |
| 선택됨 | white | primary bg |
| 다른 달 | gray300 | 없음 |

---

## 권한별 차이

| 기능 | 근무자 | 관리자 |
|------|--------|--------|
| 본인 기록 조회 | ✅ | ✅ |
| 전체 근무자 조회 | ❌ | ✅ |
| 수정 요청 | ✅ | - |
| 승인/거부 | ❌ | ✅ |
