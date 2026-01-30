# 근로계약서 도메인 (Contract Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.contract`

## 1. 개요

근로계약서 도메인은 전자 근로계약서 작성, 서명, 조회, 근로기준법 검증 등을 담당합니다.

### 1.1 주요 기능

- 근로계약서 작성 (표준 양식)
- 근로기준법 준수 검증
- 직원 서명 요청/서명
- 계약서 조회/다운로드
- 계약 갱신/종료

---

## 2. 패키지 구조

```
domain/contract/
├── controller/
│   ├── ContractController.java              # 계약서 API 컨트롤러 (~60줄)
│   └── ContractAdminController.java         # 관리자 API 컨트롤러 (~70줄)
│
├── service/
│   ├── ContractService.java                 # 서비스 인터페이스 (~35줄)
│   └── impl/
│       └── ContractServiceImpl.java         # 서비스 구현체 (~180줄)
│
├── repository/
│   ├── ContractRepository.java              # JPA Repository (~25줄)
│   └── ContractQueryRepository.java         # QueryDSL Repository (~40줄)
│
├── entity/
│   ├── Contract.java                        # 계약서 엔티티 (~120줄)
│   └── ContractSignature.java               # 서명 엔티티 (~50줄)
│
├── dto/
│   ├── request/
│   │   ├── ContractCreateRequest.java       # 계약서 작성 요청 (~60줄)
│   │   ├── ContractUpdateRequest.java       # 계약서 수정 요청 (~50줄)
│   │   └── ContractSignRequest.java         # 서명 요청 (~15줄)
│   │
│   └── response/
│       ├── ContractResponse.java            # 계약서 응답 (~45줄)
│       ├── ContractDetailResponse.java      # 계약서 상세 응답 (~70줄)
│       └── ContractValidationResponse.java  # 검증 결과 응답 (~35줄)
│
├── mapper/
│   └── ContractMapper.java                  # Entity-DTO 매퍼 (~40줄)
│
├── validator/
│   └── LaborLawValidator.java               # 근로기준법 검증 (~100줄)
│
├── generator/
│   └── ContractPdfGenerator.java            # 계약서 PDF 생성 (~80줄)
│
└── constant/
    ├── ContractStatus.java                  # 계약 상태 enum (~15줄)
    └── ViolationType.java                   # 법규 위반 유형 enum (~20줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 contracts (전자근로계약서) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| employee_id | BIGINT | NO | - | FK → users.id |
| employee_name | VARCHAR(100) | NO | - | 직원명 (비정규화) |
| contract_start_date | DATE | NO | - | 계약 시작일 |
| contract_end_date | DATE | YES | NULL | 계약 종료일 |
| work_location | VARCHAR(500) | NO | - | 근무 장소 |
| job_description | TEXT | NO | - | 업무 내용 |
| work_start_time | TIME | NO | - | 시업 시각 |
| work_end_time | TIME | NO | - | 종업 시각 |
| break_minutes | INT | NO | 0 | 휴게 시간 (분) |
| working_days | VARCHAR(100) | NO | - | 근무 요일 (JSON) |
| hourly_wage | INT | NO | - | 시급 |
| payment_date | INT | NO | - | 급여 지급일 |
| meal_allowance | INT | YES | NULL | 식대 |
| transport_allowance | INT | YES | NULL | 교통비 |
| other_allowances | TEXT | YES | NULL | 기타 수당 (JSON) |
| benefits | TEXT | YES | NULL | 복리후생 |
| additional_terms | TEXT | YES | NULL | 추가 약정사항 |
| validation_passed | BOOLEAN | NO | FALSE | 법규 검증 통과 |
| validation_result | TEXT | YES | NULL | 검증 결과 상세 (JSON) |
| status | VARCHAR(20) | NO | 'draft' | 상태 |
| admin_signature_url | VARCHAR(500) | YES | NULL | 사업주 서명 이미지 |
| admin_signed_at | TIMESTAMP | YES | NULL | 사업주 서명 일시 |
| employee_signature_url | VARCHAR(500) | YES | NULL | 직원 서명 이미지 |
| employee_signed_at | TIMESTAMP | YES | NULL | 직원 서명 일시 |
| pdf_url | VARCHAR(500) | YES | NULL | PDF 파일 URL |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `employee_id` → `users(id)` ON DELETE CASCADE
- CHECK: `status IN ('draft', 'pending', 'signed', 'expired', 'cancelled')`
- CHECK: `payment_date BETWEEN 1 AND 31`
- CHECK: `hourly_wage > 0`
- INDEX: `(workplace_id, employee_id)`, `(workplace_id, status)`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### Contract.java (~120줄)

```java
package com.bizone.api.domain.contract.entity;

@Entity
@Table(name = "contracts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contract extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false, length = 100)
    private String employeeName;

    // 계약 기간
    @Column(nullable = false)
    private LocalDate startDate;
    
    private LocalDate endDate; // null이면 무기계약

    // 근무 조건
    @Column(nullable = false, length = 200)
    private String workPlace;

    @Column(nullable = false, length = 500)
    private String jobDescription;

    @Column(nullable = false)
    private LocalTime workStartTime;

    @Column(nullable = false)
    private LocalTime workEndTime;

    @Column(nullable = false)
    private Integer breakMinutes;

    @Convert(converter = StringListConverter.class)
    private List<String> workDays;

    // 급여 조건
    @Column(nullable = false)
    private Integer hourlyWage;

    @Column(nullable = false)
    private Integer paymentDate;

    // 기타 수당
    private Integer mealAllowance;
    private Integer transportAllowance;

    // 기타 약정
    @Column(columnDefinition = "TEXT")
    private String additionalTerms;

    // 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractStatus status;

    // 서명 정보
    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private ContractSignature employerSignature;

    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private ContractSignature employeeSignature;

    // 검증 결과
    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<LaborLawViolation> violations;

    // 비즈니스 메서드
    public void sign(Long signerId, String signatureData, boolean isEmployer) { }
    public void activate() { }
    public void terminate(String reason) { }
    public boolean isFullySigned() {
        return employerSignature != null && employeeSignature != null;
    }
}
```

### 3.2 Validator

#### LaborLawValidator.java (~100줄)

```java
package com.bizone.api.domain.contract.validator;

@Component
public class LaborLawValidator {

    public ContractValidationResponse validate(ContractCreateRequest request) {
        List<LaborLawViolation> violations = new ArrayList<>();
        List<LaborLawWarning> warnings = new ArrayList<>();

        // 1. 최저시급 검증
        validateMinimumWage(request.hourlyWage(), violations);

        // 2. 근로시간 검증
        validateWorkHours(request.workStartTime(), request.workEndTime(), 
                         request.workDays(), warnings);

        // 3. 휴게시간 검증
        validateBreakTime(request.workStartTime(), request.workEndTime(),
                         request.breakMinutes(), violations);

        // 4. 미성년자 검증 (생년월일이 있는 경우)
        if (request.employeeBirthDate() != null) {
            validateMinorWorker(request.employeeBirthDate(), request.workStartTime(),
                               request.workEndTime(), violations);
        }

        // 5. 필수 기재사항 검증
        validateRequiredFields(request, violations);

        return new ContractValidationResponse(
            violations.isEmpty(),
            violations,
            warnings,
            getRelatedLawArticles(violations)
        );
    }

    private void validateMinimumWage(Integer hourlyWage, List<LaborLawViolation> violations) {
        int minimumWage = MinimumWageProvider.getCurrentMinimumWage();
        if (hourlyWage < minimumWage) {
            violations.add(new LaborLawViolation(
                ViolationType.MINIMUM_WAGE,
                String.format("시급(%,d원)이 최저시급(%,d원)보다 낮습니다.", hourlyWage, minimumWage),
                "최저임금법 제6조",
                "최저임금의 효력: 사용자는 최저임금의 적용을 받는 근로자에게 최저임금액 이상의 임금을 지급하여야 한다."
            ));
        }
    }

    private void validateWorkHours(LocalTime start, LocalTime end, 
                                   List<String> workDays, List<LaborLawWarning> warnings) {
        long dailyMinutes = Duration.between(start, end).toMinutes();
        if (dailyMinutes > 8 * 60) {
            warnings.add(new LaborLawWarning(
                "일일 근로시간이 8시간을 초과합니다. 초과 시간에 대해 연장근로수당이 발생합니다.",
                "근로기준법 제50조"
            ));
        }
        if (workDays.size() * dailyMinutes > 40 * 60) {
            warnings.add(new LaborLawWarning(
                "주 근로시간이 40시간을 초과합니다. 초과 시간에 대해 연장근로수당이 발생합니다.",
                "근로기준법 제50조"
            ));
        }
    }

    private void validateBreakTime(LocalTime start, LocalTime end, 
                                   Integer breakMinutes, List<LaborLawViolation> violations) {
        long workMinutes = Duration.between(start, end).toMinutes();
        
        if (workMinutes >= 8 * 60 && breakMinutes < 60) {
            violations.add(new LaborLawViolation(
                ViolationType.BREAK_TIME,
                "8시간 근무 시 휴게시간은 1시간 이상이어야 합니다.",
                "근로기준법 제54조",
                "사용자는 근로시간이 8시간인 경우에는 1시간 이상의 휴게시간을 근로시간 도중에 주어야 한다."
            ));
        } else if (workMinutes >= 4 * 60 && breakMinutes < 30) {
            violations.add(new LaborLawViolation(
                ViolationType.BREAK_TIME,
                "4시간 근무 시 휴게시간은 30분 이상이어야 합니다.",
                "근로기준법 제54조",
                "사용자는 근로시간이 4시간인 경우에는 30분 이상의 휴게시간을 근로시간 도중에 주어야 한다."
            ));
        }
    }

    private void validateMinorWorker(LocalDate birthDate, LocalTime start, LocalTime end,
                                     List<LaborLawViolation> violations) {
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        
        if (age < 15) {
            violations.add(new LaborLawViolation(
                ViolationType.MINOR_WORKER,
                "만 15세 미만은 근로가 금지됩니다.",
                "근로기준법 제64조",
                "15세 미만인 자는 근로자로 사용하지 못한다."
            ));
        }
        
        if (age < 18) {
            // 야간근로 검증 (22:00~06:00)
            if (end.isAfter(LocalTime.of(22, 0)) || start.isBefore(LocalTime.of(6, 0))) {
                violations.add(new LaborLawViolation(
                    ViolationType.MINOR_WORKER,
                    "만 18세 미만 근로자는 야간(22:00~06:00) 근로가 원칙적으로 금지됩니다.",
                    "근로기준법 제70조",
                    "사용자는 18세 미만인 자를 오후 10시부터 오전 6시까지의 시간에 사용하지 못한다."
                ));
            }
        }
    }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/contracts/my` | 내 계약서 목록 | 멤버 |
| GET | `/api/v1/workplaces/{id}/contracts/{contractId}` | 계약서 상세 조회 | 관련자 |
| POST | `/api/v1/workplaces/{id}/contracts/{contractId}/sign` | 계약서 서명 | 관련자 |
| GET | `/api/v1/workplaces/{id}/contracts/{contractId}/pdf` | 계약서 PDF 다운로드 | 관련자 |
| GET | `/api/v1/admin/workplaces/{id}/contracts` | 계약서 목록 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/contracts` | 계약서 작성 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/contracts/validate` | 계약서 검증 | 관리자 |
| PUT | `/api/v1/admin/workplaces/{id}/contracts/{contractId}` | 계약서 수정 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/contracts/{contractId}/send` | 서명 요청 발송 | 관리자 |

---

## 5. 관련 문서

- [멤버십 도메인](./05-member.md)
- [기능 요구사항 - 전자근로계약서](../../02_requirements/functional.md)

