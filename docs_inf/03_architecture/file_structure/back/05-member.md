# 멤버십 도메인 (Member Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.member`

## 1. 개요

멤버십 도메인은 사업장과 사용자 간의 관계(멤버십)를 관리합니다.

### 1.1 주요 기능

- 멤버십 조회/관리
- 직원별 시급 설정
- 직원별 근무 시간 설정
- 멤버 권한 관리
- 멤버 퇴장/삭제

---

## 2. 패키지 구조

```
domain/member/
├── controller/
│   └── MemberController.java                # 멤버 API 컨트롤러 (~60줄)
│
├── service/
│   ├── MemberService.java                   # 서비스 인터페이스 (~30줄)
│   └── impl/
│       └── MemberServiceImpl.java           # 서비스 구현체 (~150줄)
│
├── repository/
│   ├── MemberRepository.java                # JPA Repository (~25줄)
│   └── MemberQueryRepository.java           # QueryDSL Repository (~40줄)
│
├── entity/
│   └── Member.java                          # 멤버 엔티티 (~80줄)
│
├── dto/
│   ├── request/
│   │   ├── HourlyWageRequest.java           # 시급 설정 요청 (~20줄)
│   │   └── MemberScheduleRequest.java       # 근무 시간 설정 요청 (~25줄)
│   │
│   └── response/
│       ├── MemberResponse.java              # 멤버 기본 응답 (~25줄)
│       ├── MemberDetailResponse.java        # 멤버 상세 응답 (~35줄)
│       └── MemberListResponse.java          # 멤버 목록 응답 (~20줄)
│
├── mapper/
│   └── MemberMapper.java                    # Entity-DTO 매퍼 (~30줄)
│
└── constant/
    └── MemberRole.java                      # 멤버 역할 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 members 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| role | VARCHAR(20) | NO | - | 역할: 'admin', 'employee' |
| hourly_wage | INT | NO | 0 | 시급 (원) |
| use_custom_schedule | BOOLEAN | NO | FALSE | 개별 스케줄 사용 여부 |
| custom_start_time | TIME | YES | NULL | 개별 시업 시간 |
| custom_end_time | TIME | YES | NULL | 개별 종업 시간 |
| custom_schedule_config | TEXT | YES | NULL | 개별 요일별 스케줄 (JSON) |
| is_active | BOOLEAN | NO | TRUE | 멤버십 활성화 |
| joined_at | TIMESTAMP | NO | NOW | 가입일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(workplace_id, user_id)`
- CHECK: `role IN ('admin', 'employee')`
- CHECK: `hourly_wage >= 0`
- INDEX: `workplace_id`, `user_id`, `is_active`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### Member.java (~80줄)

```java
package com.bizone.api.domain.member.entity;

@Entity
@Table(name = "members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"workplace_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workplace_id", nullable = false)
    private Long workplaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Column(nullable = false)
    private Integer hourlyWage;

    private boolean useCustomSchedule;

    private LocalTime customStartTime;
    private LocalTime customEndTime;

    @Convert(converter = ScheduleConfigConverter.class)
    @Column(columnDefinition = "TEXT")
    private ScheduleConfig customScheduleConfig;

    private boolean isActive;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    // 비즈니스 메서드
    @Builder
    public Member(Long workplaceId, Long userId, MemberRole role) { }

    public void updateHourlyWage(Integer hourlyWage) {
        validateMinimumWage(hourlyWage);
        this.hourlyWage = hourlyWage;
    }

    public void updateCustomSchedule(LocalTime startTime, LocalTime endTime, 
                                     ScheduleConfig config) { }
    
    public void enableCustomSchedule() { this.useCustomSchedule = true; }
    public void disableCustomSchedule() { this.useCustomSchedule = false; }
    public void deactivate() { this.isActive = false; }

    private void validateMinimumWage(Integer wage) {
        int currentMinimumWage = MinimumWageProvider.getCurrentMinimumWage();
        if (wage < currentMinimumWage) {
            throw new MemberException(MemberErrorCode.BELOW_MINIMUM_WAGE);
        }
    }
}
```

### 3.2 Controller

#### MemberController.java (~60줄)

```java
package com.bizone.api.domain.member.controller;

@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/members")
@RequiredArgsConstructor
@Tag(name = "Member", description = "멤버 관리 API")
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    @Operation(summary = "멤버 목록 조회")
    public ApiResponse<List<MemberListResponse>> getMembers(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @GetMapping("/{memberId}")
    @Operation(summary = "멤버 상세 조회")
    public ApiResponse<MemberDetailResponse> getMember(
        @PathVariable Long workplaceId,
        @PathVariable Long memberId) { }

    @PutMapping("/{memberId}/hourly-wage")
    @Operation(summary = "시급 설정")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<MemberResponse> updateHourlyWage(
        @PathVariable Long workplaceId,
        @PathVariable Long memberId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody HourlyWageRequest request) { }

    @PutMapping("/{memberId}/schedule")
    @Operation(summary = "개별 근무 시간 설정")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<MemberResponse> updateSchedule(
        @PathVariable Long workplaceId,
        @PathVariable Long memberId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody MemberScheduleRequest request) { }

    @DeleteMapping("/{memberId}")
    @Operation(summary = "멤버 삭제 (퇴장)")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<Void> removeMember(
        @PathVariable Long workplaceId,
        @PathVariable Long memberId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/leave")
    @Operation(summary = "사업장 나가기 (본인)")
    public ApiResponse<Void> leaveWorkplace(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

### 3.3 DTO

#### request/HourlyWageRequest.java (~20줄)

```java
package com.bizone.api.domain.member.dto.request;

public record HourlyWageRequest(
    @NotNull(message = "시급은 필수입니다")
    @Min(value = 0, message = "시급은 0 이상이어야 합니다")
    Integer hourlyWage
) {}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/members` | 멤버 목록 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/members/{memberId}` | 멤버 상세 조회 | 멤버 |
| PUT | `/api/v1/workplaces/{id}/members/{memberId}/hourly-wage` | 시급 설정 | 관리자 |
| PUT | `/api/v1/workplaces/{id}/members/{memberId}/schedule` | 개별 근무 시간 설정 | 관리자 |
| DELETE | `/api/v1/workplaces/{id}/members/{memberId}` | 멤버 삭제 | 관리자 |
| POST | `/api/v1/workplaces/{id}/members/leave` | 사업장 나가기 | 본인 |

---

## 5. 관련 문서

- [사업장 도메인](./04-workplace.md)
- [급여 도메인](./08-payroll.md)

