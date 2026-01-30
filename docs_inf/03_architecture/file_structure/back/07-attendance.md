# 출퇴근 도메인 (Attendance Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.attendance`

## 1. 개요

출퇴근 도메인은 GPS 기반 출퇴근 기록, 수동 입력, 수정 요청, 근태 승인 등을 담당합니다.

### 1.1 주요 기능

- GPS 기반 출근/퇴근
- 수동 근태 입력
- 근태 수정 요청
- 근태 승인/거부 (관리자)
- 출퇴근 현황 조회
- 월별 근태 조회

---

## 2. 패키지 구조

```
domain/attendance/
├── controller/
│   ├── AttendanceController.java            # 출퇴근 API 컨트롤러 (~70줄)
│   └── AttendanceAdminController.java       # 관리자 API 컨트롤러 (~50줄)
│
├── service/
│   ├── AttendanceService.java               # 서비스 인터페이스 (~40줄)
│   └── impl/
│       └── AttendanceServiceImpl.java       # 서비스 구현체 (~200줄)
│
├── repository/
│   ├── AttendanceRecordRepository.java      # JPA Repository (~30줄)
│   ├── AttendanceRecordQueryRepository.java # QueryDSL Repository (~60줄)
│   └── AttendanceRequestRepository.java     # 근태 요청 Repository (~20줄)
│
├── entity/
│   ├── AttendanceRecord.java                # 출퇴근 기록 엔티티 (~100줄)
│   └── AttendanceRequest.java               # 근태 요청 엔티티 (~70줄)
│
├── dto/
│   ├── request/
│   │   ├── ClockInRequest.java              # 출근 요청 (~20줄)
│   │   ├── ClockOutRequest.java             # 퇴근 요청 (~15줄)
│   │   ├── ManualAttendanceRequest.java     # 수동 입력 요청 (~30줄)
│   │   ├── AttendanceModifyRequest.java     # 수정 요청 (~25줄)
│   │   └── AttendanceApprovalRequest.java   # 승인/거부 요청 (~15줄)
│   │
│   └── response/
│       ├── AttendanceResponse.java          # 출퇴근 응답 (~30줄)
│       ├── TodayAttendanceResponse.java     # 오늘 출퇴근 응답 (~25줄)
│       ├── MonthlyAttendanceResponse.java   # 월별 출퇴근 응답 (~35줄)
│       └── AttendanceRequestResponse.java   # 근태 요청 응답 (~25줄)
│
├── mapper/
│   └── AttendanceMapper.java                # Entity-DTO 매퍼 (~40줄)
│
├── validator/
│   └── GpsValidator.java                    # GPS 검증 (~30줄)
│
└── constant/
    ├── AttendanceType.java                  # 출퇴근 유형 enum (~10줄)
    ├── AttendanceStatus.java                # 기록 상태 enum (~10줄)
    └── RequestType.java                     # 요청 유형 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 attendance_records 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| user_name | VARCHAR(100) | NO | - | 사용자명 (비정규화) |
| work_date | DATE | NO | - | 근무 날짜 |
| clock_in | TIMESTAMP | YES | NULL | 실제 출근 시간 |
| clock_out | TIMESTAMP | YES | NULL | 실제 퇴근 시간 |
| effective_clock_in | TIMESTAMP | YES | NULL | 유효 출근 시간 (조기출근 조정) |
| effective_clock_out | TIMESTAMP | YES | NULL | 유효 퇴근 시간 |
| clock_in_lat | DECIMAL(10,8) | YES | NULL | 출근 위도 |
| clock_in_lng | DECIMAL(11,8) | YES | NULL | 출근 경도 |
| clock_out_lat | DECIMAL(10,8) | YES | NULL | 퇴근 위도 |
| clock_out_lng | DECIMAL(11,8) | YES | NULL | 퇴근 경도 |
| work_minutes | INT | NO | 0 | 총 근무 시간 (분) |
| hourly_wage | INT | NO | 0 | 적용 시급 |
| daily_wage | INT | NO | 0 | 일급 |
| status | VARCHAR(20) | NO | 'working' | 상태 |
| is_manual_input | BOOLEAN | NO | FALSE | 수동 입력 여부 |
| is_early_clock_in | BOOLEAN | NO | FALSE | 조기 출근 여부 |
| checklist_completed | BOOLEAN | NO | FALSE | 체크리스트 완료 여부 |
| note | TEXT | YES | NULL | 비고 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE SET NULL
- UK: `(workplace_id, user_id, work_date)`
- CHECK: `status IN ('working', 'completed', 'pending_approval', 'approved', 'rejected')`
- CHECK: `work_minutes >= 0`
- INDEX: `(workplace_id, work_date)`, `(workplace_id, user_id, work_date)`

### 3.2 approval_requests 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id (요청자) |
| user_name | VARCHAR(100) | NO | - | 요청자명 (비정규화) |
| attendance_id | BIGINT | YES | NULL | FK → attendance_records.id |
| request_type | VARCHAR(30) | NO | - | 'manual_input', 'edit_request' |
| request_date | DATE | NO | - | 요청 대상 날짜 |
| request_clock_in | TIME | YES | NULL | 요청 출근 시간 |
| request_clock_out | TIME | YES | NULL | 요청 퇴근 시간 |
| request_reason | TEXT | YES | NULL | 요청 사유 |
| status | VARCHAR(20) | NO | 'pending' | 상태 |
| processed_by | BIGINT | YES | NULL | FK → users.id (처리자) |
| processed_at | TIMESTAMP | YES | NULL | 처리 일시 |
| process_note | TEXT | YES | NULL | 처리 메모 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- FK: `attendance_id` → `attendance_records(id)` ON DELETE SET NULL
- FK: `processed_by` → `users(id)` ON DELETE SET NULL
- CHECK: `request_type IN ('manual_input', 'edit_request')`
- CHECK: `status IN ('pending', 'approved', 'rejected')`
- INDEX: `(workplace_id, status)`, `user_id`

---

## 4. 상세 파일 구조

### 3.1 Entity

#### AttendanceRecord.java (~100줄)

```java
package com.bizone.api.domain.attendance.entity;

@Entity
@Table(name = "attendance_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"workplace_id", "user_id", "work_date"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AttendanceRecord extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String userName;

    @Column(nullable = false)
    private LocalDate workDate;

    // 실제 출퇴근 시간
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;

    // 급여 계산용 시간 (조기 출근 시 시업 시간부터)
    private LocalDateTime effectiveClockIn;
    private LocalDateTime effectiveClockOut;

    // GPS 정보
    @Column(precision = 10, scale = 8)
    private BigDecimal clockInLatitude;
    @Column(precision = 11, scale = 8)
    private BigDecimal clockInLongitude;
    @Column(precision = 10, scale = 8)
    private BigDecimal clockOutLatitude;
    @Column(precision = 11, scale = 8)
    private BigDecimal clockOutLongitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceType clockInType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceType clockOutType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    // 근무 시간 (분 단위)
    private Integer workMinutes;
    
    // 연장/야간/휴일 근무 시간 (분 단위)
    private Integer overtimeMinutes;
    private Integer nightMinutes;
    private Integer holidayMinutes;

    // 계산된 급여 (원)
    private Long calculatedPay;

    @Column(length = 500)
    private String note;

    // 비즈니스 메서드
    public void clockIn(LocalDateTime time, BigDecimal lat, BigDecimal lng, 
                        AttendanceType type, LocalTime scheduleStartTime) {
        this.clockIn = time;
        this.clockInLatitude = lat;
        this.clockInLongitude = lng;
        this.clockInType = type;
        
        // 조기 출근 처리: 시업 시간 이전이면 시업 시간부터 급여 계산
        LocalDateTime scheduleStart = LocalDateTime.of(workDate, scheduleStartTime);
        this.effectiveClockIn = time.isBefore(scheduleStart) ? scheduleStart : time;
    }

    public void clockOut(LocalDateTime time, BigDecimal lat, BigDecimal lng, 
                         AttendanceType type) {
        this.clockOut = time;
        this.effectiveClockOut = time;
        this.clockOutLatitude = lat;
        this.clockOutLongitude = lng;
        this.clockOutType = type;
        calculateWorkTime();
    }

    public void calculateWorkTime() {
        if (effectiveClockIn != null && effectiveClockOut != null) {
            this.workMinutes = (int) Duration.between(effectiveClockIn, effectiveClockOut).toMinutes();
        }
    }

    public void approve() { this.status = AttendanceStatus.APPROVED; }
    public void reject() { this.status = AttendanceStatus.REJECTED; }
}
```

#### AttendanceRequest.java (~70줄)

```java
package com.bizone.api.domain.attendance.entity;

@Entity
@Table(name = "attendance_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AttendanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestType requestType;

    private Long attendanceRecordId;

    @Column(nullable = false)
    private LocalDate workDate;

    private LocalDateTime requestedClockIn;
    private LocalDateTime requestedClockOut;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    private Long reviewedBy;
    private LocalDateTime reviewedAt;

    @Column(length = 500)
    private String reviewNote;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 비즈니스 메서드
    public void approve(Long reviewerId, String note) {
        this.status = AttendanceStatus.APPROVED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
        this.reviewNote = note;
    }

    public void reject(Long reviewerId, String note) {
        this.status = AttendanceStatus.REJECTED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
        this.reviewNote = note;
    }
}
```

### 3.2 Controller

#### AttendanceController.java (~70줄)

```java
package com.bizone.api.domain.attendance.controller;

@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "출퇴근 관리 API")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/clock-in")
    @Operation(summary = "출근 처리")
    public ApiResponse<AttendanceResponse> clockIn(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ClockInRequest request) { }

    @PostMapping("/clock-out")
    @Operation(summary = "퇴근 처리")
    public ApiResponse<AttendanceResponse> clockOut(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ClockOutRequest request) { }

    @GetMapping("/today")
    @Operation(summary = "오늘 출퇴근 현황 조회")
    public ApiResponse<TodayAttendanceResponse> getTodayAttendance(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @GetMapping("/monthly")
    @Operation(summary = "월별 출퇴근 조회")
    public ApiResponse<MonthlyAttendanceResponse> getMonthlyAttendance(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth) { }

    @PostMapping("/manual")
    @Operation(summary = "수동 근태 입력")
    public ApiResponse<AttendanceRequestResponse> submitManualAttendance(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ManualAttendanceRequest request) { }

    @PostMapping("/{recordId}/modify")
    @Operation(summary = "근태 수정 요청")
    public ApiResponse<AttendanceRequestResponse> submitModifyRequest(
        @PathVariable Long workplaceId,
        @PathVariable Long recordId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AttendanceModifyRequest request) { }

    @GetMapping("/requests")
    @Operation(summary = "내 근태 요청 목록 조회")
    public ApiResponse<List<AttendanceRequestResponse>> getMyRequests(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

#### AttendanceAdminController.java (~50줄)

```java
package com.bizone.api.domain.attendance.controller;

@RestController
@RequestMapping("/api/v1/admin/workplaces/{workplaceId}/attendance")
@RequiredArgsConstructor
@PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
@Tag(name = "Attendance Admin", description = "출퇴근 관리자 API")
public class AttendanceAdminController {

    private final AttendanceService attendanceService;

    @GetMapping("/requests")
    @Operation(summary = "근태 요청 목록 조회")
    public ApiResponse<List<AttendanceRequestResponse>> getPendingRequests(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) AttendanceStatus status) { }

    @PostMapping("/requests/{requestId}/approve")
    @Operation(summary = "근태 요청 승인")
    public ApiResponse<Void> approveRequest(
        @PathVariable Long workplaceId,
        @PathVariable Long requestId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AttendanceApprovalRequest request) { }

    @PostMapping("/requests/{requestId}/reject")
    @Operation(summary = "근태 요청 거부")
    public ApiResponse<Void> rejectRequest(
        @PathVariable Long workplaceId,
        @PathVariable Long requestId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AttendanceApprovalRequest request) { }

    @GetMapping("/members/{memberId}/monthly")
    @Operation(summary = "직원별 월별 출퇴근 조회")
    public ApiResponse<MonthlyAttendanceResponse> getMemberMonthlyAttendance(
        @PathVariable Long workplaceId,
        @PathVariable Long memberId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth) { }
}
```

### 3.3 Validator

#### GpsValidator.java (~30줄)

```java
package com.bizone.api.domain.attendance.validator;

@Component
@RequiredArgsConstructor
public class GpsValidator {

    private final WorkplaceRepository workplaceRepository;

    public void validateInRadius(Long workplaceId, BigDecimal latitude, BigDecimal longitude) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
            .orElseThrow(() -> new WorkplaceException(WorkplaceErrorCode.NOT_FOUND));

        double distance = calculateDistance(
            workplace.getLatitude().doubleValue(),
            workplace.getLongitude().doubleValue(),
            latitude.doubleValue(),
            longitude.doubleValue()
        );

        if (distance > workplace.getRadius()) {
            throw new AttendanceException(AttendanceErrorCode.OUT_OF_RANGE);
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        final int R = 6371000; // 지구 반경 (미터)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/workplaces/{id}/attendance/clock-in` | 출근 | 멤버 |
| POST | `/api/v1/workplaces/{id}/attendance/clock-out` | 퇴근 | 멤버 |
| GET | `/api/v1/workplaces/{id}/attendance/today` | 오늘 현황 | 멤버 |
| GET | `/api/v1/workplaces/{id}/attendance/monthly` | 월별 조회 | 멤버 |
| POST | `/api/v1/workplaces/{id}/attendance/manual` | 수동 입력 | 멤버 |
| POST | `/api/v1/workplaces/{id}/attendance/{recordId}/modify` | 수정 요청 | 멤버 |
| GET | `/api/v1/admin/workplaces/{id}/attendance/requests` | 요청 목록 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/attendance/requests/{requestId}/approve` | 요청 승인 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/attendance/requests/{requestId}/reject` | 요청 거부 | 관리자 |

---

## 5. 관련 문서

- [급여 도메인](./08-payroll.md)
- [캘린더 도메인](./09-calendar.md)
- [체크리스트 도메인](./10-checklist.md)

