# 캘린더 도메인 (Calendar Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.calendar`

## 1. 개요

캘린더 도메인은 캘린더 형태의 근태/급여 조회 기능을 담당합니다.

### 1.1 주요 기능

- 월별 캘린더 조회
- 일별 상세 조회
- 월별 요약 조회

---

## 2. 패키지 구조

```
domain/calendar/
├── controller/
│   └── CalendarController.java              # 캘린더 API 컨트롤러 (~45줄)
│
├── service/
│   ├── CalendarService.java                 # 서비스 인터페이스 (~20줄)
│   └── impl/
│       └── CalendarServiceImpl.java         # 서비스 구현체 (~100줄)
│
├── dto/
│   └── response/
│       ├── MonthlyCalendarResponse.java     # 월별 캘린더 응답 (~50줄)
│       ├── DailyDetailResponse.java         # 일별 상세 응답 (~35줄)
│       └── MonthlySummaryResponse.java      # 월별 요약 응답 (~25줄)
│
└── mapper/
    └── CalendarMapper.java                  # DTO 매퍼 (~30줄)
```

---

## 3. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/calendar` | 월별 캘린더 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/calendar/{date}` | 일별 상세 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/calendar/summary` | 월별 요약 조회 | 멤버 |

---

## 4. 관련 문서

- [출퇴근 도메인](./07-attendance.md)
- [급여 도메인](./08-payroll.md)

