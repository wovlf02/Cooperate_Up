# 사업장 도메인 (Workplace Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.workplace`

## 1. 개요

사업장 도메인은 사업장 등록, 정보 관리, GPS 좌표 설정, 초대 코드 관리 등을 담당합니다.

### 1.1 주요 기능

- 사업장 등록 (사업자등록번호 검증)
- 사업장 정보 수정
- GPS 좌표 설정 (지오코딩)
- 초대 코드 관리
- 사업장 기본 근무 시간 설정
- 급여 지급일 설정

---

## 2. 패키지 구조

```
domain/workplace/
├── controller/
│   └── WorkplaceController.java             # 사업장 API 컨트롤러 (~70줄)
│
├── service/
│   ├── WorkplaceService.java                # 서비스 인터페이스 (~35줄)
│   └── impl/
│       └── WorkplaceServiceImpl.java        # 서비스 구현체 (~180줄)
│
├── repository/
│   ├── WorkplaceRepository.java             # JPA Repository (~25줄)
│   └── WorkplaceQueryRepository.java        # QueryDSL Repository (~40줄)
│
├── entity/
│   ├── Workplace.java                       # 사업장 엔티티 (~100줄)
│   └── ScheduleConfig.java                  # 스케줄 설정 Value Object (~40줄)
│
├── dto/
│   ├── request/
│   │   ├── WorkplaceCreateRequest.java      # 사업장 등록 요청 (~45줄)
│   │   ├── WorkplaceUpdateRequest.java      # 사업장 수정 요청 (~35줄)
│   │   ├── WorkScheduleRequest.java         # 근무 시간 설정 요청 (~25줄)
│   │   └── GpsCoordinateRequest.java        # GPS 좌표 설정 요청 (~15줄)
│   │
│   └── response/
│       ├── WorkplaceResponse.java           # 사업장 기본 응답 (~30줄)
│       ├── WorkplaceDetailResponse.java     # 사업장 상세 응답 (~45줄)
│       └── WorkplaceListResponse.java       # 사업장 목록 응답 (~20줄)
│
├── mapper/
│   └── WorkplaceMapper.java                 # Entity-DTO 매퍼 (~35줄)
│
└── constant/
    └── LocationSource.java                  # 좌표 출처 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 workplaces 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| owner_id | BIGINT | NO | - | FK → users.id (사업주) |
| name | VARCHAR(200) | NO | - | 사업장명 |
| address | VARCHAR(500) | NO | - | 도로명 주소 |
| address_detail | VARCHAR(200) | YES | NULL | 상세 주소 |
| latitude | DECIMAL(10,8) | YES | NULL | GPS 위도 |
| longitude | DECIMAL(11,8) | YES | NULL | GPS 경도 |
| location_source | VARCHAR(20) | NO | 'geocoding' | 좌표 출처 |
| radius | INT | NO | 50 | 출퇴근 허용 반경 (미터) |
| default_start_time | TIME | YES | NULL | 기본 시업 시간 |
| default_end_time | TIME | YES | NULL | 기본 종업 시간 |
| schedule_config | TEXT | YES | NULL | 요일별 스케줄 (JSON) |
| payment_date | INT | YES | NULL | 급여 지급일 (1-31) |
| business_number | VARCHAR(20) | YES | NULL | 사업자등록번호 |
| business_owner_name | VARCHAR(100) | YES | NULL | 대표자명 |
| business_type | VARCHAR(100) | YES | NULL | 업종 |
| business_verified | BOOLEAN | NO | FALSE | 사업자 인증 완료 |
| business_verified_at | TIMESTAMP | YES | NULL | 인증 일시 |
| business_status | VARCHAR(20) | NO | 'active' | 사업자 상태 |
| invite_code | VARCHAR(20) | YES | NULL | 초대 코드 (UK) |
| invite_code_active | BOOLEAN | NO | TRUE | 초대 코드 활성화 |
| is_active | BOOLEAN | NO | TRUE | 사업장 활성화 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `owner_id` → `users(id)` ON DELETE RESTRICT
- UK: `invite_code`
- CHECK: `radius > 0`
- CHECK: `payment_date BETWEEN 1 AND 31`
- CHECK: `location_source IN ('geocoding', 'manual')`
- CHECK: `business_status IN ('active', 'suspended', 'closed')`
- INDEX: `owner_id`, `is_active`

---

## 3. 상세 파일 구조

### 3.1 Entity

#### Workplace.java (~100줄)

```java
package com.bizone.api.domain.workplace.entity;

@Entity
@Table(name = "workplaces")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workplace extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(length = 200)
    private String addressDetail;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LocationSource locationSource;

    @Column(nullable = false)
    private Integer radius;

    private LocalTime defaultStartTime;
    private LocalTime defaultEndTime;

    @Convert(converter = ScheduleConfigConverter.class)
    @Column(columnDefinition = "TEXT")
    private ScheduleConfig scheduleConfig;

    @Column(name = "payment_date")
    private Integer paymentDate;

    // 사업자 정보
    @Column(length = 20)
    private String businessNumber;

    @Column(length = 100)
    private String businessOwnerName;

    @Column(length = 100)
    private String businessType;

    private boolean businessVerified;
    private LocalDateTime businessVerifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BusinessStatus businessStatus;

    // 초대 코드
    @Column(unique = true, length = 20)
    private String inviteCode;

    private boolean inviteCodeActive;
    private boolean isActive;

    // 비즈니스 메서드
    @Builder
    public Workplace(Long ownerId, String name, String address, ...) { }

    public void updateInfo(String name, String address, String addressDetail) { }
    public void updateCoordinates(BigDecimal lat, BigDecimal lng, LocationSource source) { }
    public void updateRadius(Integer radius) { }
    public void updateSchedule(LocalTime startTime, LocalTime endTime, ScheduleConfig config) { }
    public void updatePaymentDate(Integer paymentDate) { }
    public void regenerateInviteCode() { }
    public void toggleInviteCode(boolean active) { }
    public void verifyBusiness() { }
    public void deactivate() { }
}
```

#### ScheduleConfig.java (~40줄)

```java
package com.bizone.api.domain.workplace.entity;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleConfig {

    private DaySchedule monday;
    private DaySchedule tuesday;
    private DaySchedule wednesday;
    private DaySchedule thursday;
    private DaySchedule friday;
    private DaySchedule saturday;
    private DaySchedule sunday;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DaySchedule {
        private boolean workDay;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    public DaySchedule getScheduleForDay(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> monday;
            case TUESDAY -> tuesday;
            // ...
        };
    }
}
```

### 3.2 Controller

#### WorkplaceController.java (~70줄)

```java
package com.bizone.api.domain.workplace.controller;

@RestController
@RequestMapping("/api/v1/workplaces")
@RequiredArgsConstructor
@Tag(name = "Workplace", description = "사업장 관리 API")
public class WorkplaceController {

    private final WorkplaceService workplaceService;

    @PostMapping
    @Operation(summary = "사업장 등록")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<WorkplaceResponse> createWorkplace(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody WorkplaceCreateRequest request) { }

    @GetMapping("/{workplaceId}")
    @Operation(summary = "사업장 상세 조회")
    public ApiResponse<WorkplaceDetailResponse> getWorkplace(@PathVariable Long workplaceId) { }

    @GetMapping("/my")
    @Operation(summary = "내 사업장 목록 조회")
    public ApiResponse<List<WorkplaceListResponse>> getMyWorkplaces(
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PutMapping("/{workplaceId}")
    @Operation(summary = "사업장 정보 수정")
    @PreAuthorize("@workplaceAuthChecker.isOwner(#workplaceId, #principal.userId)")
    public ApiResponse<WorkplaceResponse> updateWorkplace(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody WorkplaceUpdateRequest request) { }

    @PutMapping("/{workplaceId}/coordinates")
    @Operation(summary = "GPS 좌표 설정")
    @PreAuthorize("@workplaceAuthChecker.isOwner(#workplaceId, #principal.userId)")
    public ApiResponse<WorkplaceResponse> updateCoordinates(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody GpsCoordinateRequest request) { }

    @PutMapping("/{workplaceId}/schedule")
    @Operation(summary = "근무 시간 설정")
    @PreAuthorize("@workplaceAuthChecker.isOwner(#workplaceId, #principal.userId)")
    public ApiResponse<WorkplaceResponse> updateSchedule(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody WorkScheduleRequest request) { }

    @PostMapping("/{workplaceId}/invite-code/regenerate")
    @Operation(summary = "초대 코드 재발급")
    @PreAuthorize("@workplaceAuthChecker.isOwner(#workplaceId, #principal.userId)")
    public ApiResponse<String> regenerateInviteCode(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @DeleteMapping("/{workplaceId}")
    @Operation(summary = "사업장 삭제 (비활성화)")
    @PreAuthorize("@workplaceAuthChecker.isOwner(#workplaceId, #principal.userId)")
    public ApiResponse<Void> deleteWorkplace(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

### 3.3 DTO

#### request/WorkplaceCreateRequest.java (~45줄)

```java
package com.bizone.api.domain.workplace.dto.request;

public record WorkplaceCreateRequest(
    @NotBlank(message = "사업장명은 필수입니다")
    @Size(max = 200, message = "사업장명은 200자 이하여야 합니다")
    String name,

    @NotBlank(message = "주소는 필수입니다")
    @Size(max = 500, message = "주소는 500자 이하여야 합니다")
    String address,

    @Size(max = 200, message = "상세 주소는 200자 이하여야 합니다")
    String addressDetail,

    @NotBlank(message = "사업자등록번호는 필수입니다")
    @Pattern(regexp = "^[0-9]{10}$", message = "사업자등록번호는 10자리 숫자입니다")
    String businessNumber,

    @NotBlank(message = "대표자명은 필수입니다")
    String businessOwnerName,

    @Size(max = 100, message = "업종은 100자 이하여야 합니다")
    String businessType,

    @Min(value = 10, message = "허용 반경은 최소 10m입니다")
    @Max(value = 1000, message = "허용 반경은 최대 1000m입니다")
    Integer radius,

    LocalTime defaultStartTime,
    LocalTime defaultEndTime,

    @Min(value = 1, message = "급여지급일은 1~31입니다")
    @Max(value = 31, message = "급여지급일은 1~31입니다")
    Integer paymentDate
) {
    public WorkplaceCreateRequest {
        if (radius == null) radius = 50; // 기본값 50m
    }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/workplaces` | 사업장 등록 | 관리자 |
| GET | `/api/v1/workplaces/{id}` | 사업장 상세 조회 | 멤버 |
| GET | `/api/v1/workplaces/my` | 내 사업장 목록 조회 | 로그인 |
| PUT | `/api/v1/workplaces/{id}` | 사업장 정보 수정 | 사업주 |
| PUT | `/api/v1/workplaces/{id}/coordinates` | GPS 좌표 설정 | 사업주 |
| PUT | `/api/v1/workplaces/{id}/schedule` | 근무 시간 설정 | 사업주 |
| POST | `/api/v1/workplaces/{id}/invite-code/regenerate` | 초대 코드 재발급 | 사업주 |
| DELETE | `/api/v1/workplaces/{id}` | 사업장 삭제 | 사업주 |

---

## 5. 관련 도메인

- **member**: 사업장 멤버 관리
- **invitation**: 사업장 초대
- **attendance**: 출퇴근 GPS 인증
- **infra/external**: 지오코딩 API, 사업자 진위확인 API

---

## 6. 관련 문서

- [멤버십 도메인](./05-member.md)
- [초대 도메인](./06-invitation.md)
- [엔티티 스키마 - workplaces](../../04_database/02-entity-schema.md)

