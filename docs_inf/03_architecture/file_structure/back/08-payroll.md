# 급여 도메인 (Payroll Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.payroll`

## 1. 개요

급여 도메인은 급여 계산, 4대 보험/세금 공제, 급여 명세서 생성, Excel 추출 등을 담당합니다.

### 1.1 주요 기능

- 기본급 계산 (근무 시간 × 시급)
- 주휴수당 자동 계산
- 연장/야간/휴일 수당 계산
- 4대 보험 및 세금 공제
- 급여 명세서 PDF 생성
- 근무 기록 Excel 추출
- 급여 지급일 알림/체크리스트

---

## 2. 패키지 구조

```
domain/payroll/
├── controller/
│   ├── PayrollController.java               # 급여 API 컨트롤러 (~60줄)
│   └── PayrollAdminController.java          # 관리자 API 컨트롤러 (~70줄)
│
├── service/
│   ├── PayrollService.java                  # 서비스 인터페이스 (~35줄)
│   ├── impl/
│   │   └── PayrollServiceImpl.java          # 서비스 구현체 (~180줄)
│   └── calculator/
│       ├── PayCalculator.java               # 급여 계산기 인터페이스 (~20줄)
│       ├── BasicPayCalculator.java          # 기본급 계산 (~40줄)
│       ├── WeeklyHolidayPayCalculator.java  # 주휴수당 계산 (~50줄)
│       ├── OvertimePayCalculator.java       # 연장근로수당 계산 (~45줄)
│       ├── NightPayCalculator.java          # 야간근로수당 계산 (~40줄)
│       ├── HolidayPayCalculator.java        # 휴일근로수당 계산 (~40줄)
│       └── DeductionCalculator.java         # 공제액 계산 (~60줄)
│
├── repository/
│   ├── PayrollRepository.java               # JPA Repository (~25줄)
│   ├── PayrollQueryRepository.java          # QueryDSL Repository (~50줄)
│   └── PaymentChecklistRepository.java      # 지급 체크리스트 Repository (~15줄)
│
├── entity/
│   ├── Payroll.java                         # 급여 엔티티 (~120줄)
│   ├── PayrollDeduction.java                # 공제 내역 엔티티 (~50줄)
│   └── PaymentChecklist.java                # 지급 체크리스트 엔티티 (~40줄)
│
├── dto/
│   ├── request/
│   │   ├── PayrollCalculateRequest.java     # 급여 계산 요청 (~20줄)
│   │   └── PaymentCheckRequest.java         # 지급 완료 요청 (~10줄)
│   │
│   └── response/
│       ├── PayrollResponse.java             # 급여 응답 (~40줄)
│       ├── PayrollDetailResponse.java       # 급여 상세 응답 (~60줄)
│       ├── PayslipResponse.java             # 급여 명세서 응답 (~70줄)
│       ├── MonthlyPayrollSummary.java       # 월별 급여 요약 (~30줄)
│       └── PaymentChecklistResponse.java    # 지급 체크리스트 응답 (~25줄)
│
├── mapper/
│   └── PayrollMapper.java                   # Entity-DTO 매퍼 (~45줄)
│
├── generator/
│   ├── PayslipPdfGenerator.java             # 급여 명세서 PDF 생성 (~80줄)
│   └── AttendanceExcelGenerator.java        # 근무 기록 Excel 생성 (~90줄)
│
└── constant/
    ├── DeductionType.java                   # 공제 유형 enum (~15줄)
    ├── PayItemType.java                     # 급여 항목 유형 enum (~15줄)
    └── MinimumWageProvider.java             # 연도별 최저시급 (~25줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 payrolls 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| user_name | VARCHAR(100) | NO | - | 사용자명 (비정규화) |
| pay_year | INT | NO | - | 급여 연도 |
| pay_month | INT | NO | - | 급여 월 |
| total_work_days | INT | NO | 0 | 총 근무 일수 |
| total_work_minutes | INT | NO | 0 | 총 근무 시간 (분) |
| hourly_wage | INT | NO | 0 | 적용 시급 |
| base_pay | INT | NO | 0 | 기본급 |
| weekly_holiday_pay | INT | NO | 0 | 주휴수당 |
| overtime_pay | INT | NO | 0 | 연장근로수당 |
| night_pay | INT | NO | 0 | 야간근로수당 |
| holiday_pay | INT | NO | 0 | 휴일근로수당 |
| total_earnings | INT | NO | 0 | 총 지급액 |
| earnings_detail | TEXT | YES | NULL | 지급 상세 계산식 (JSON) |
| national_pension | INT | NO | 0 | 국민연금 |
| health_insurance | INT | NO | 0 | 건강보험 |
| long_term_care | INT | NO | 0 | 장기요양보험 |
| employment_insurance | INT | NO | 0 | 고용보험 |
| income_tax | INT | NO | 0 | 소득세 |
| local_income_tax | INT | NO | 0 | 지방소득세 |
| total_deductions | INT | NO | 0 | 총 공제액 |
| deductions_detail | TEXT | YES | NULL | 공제 상세 계산식 (JSON) |
| net_pay | INT | NO | 0 | 실수령액 |
| status | VARCHAR(20) | NO | 'pending' | 상태 |
| is_paid | BOOLEAN | NO | FALSE | 지급 완료 여부 |
| paid_at | TIMESTAMP | YES | NULL | 지급 일시 |
| paid_by | BIGINT | YES | NULL | FK → users.id |
| pdf_url | VARCHAR(500) | YES | NULL | PDF 파일 URL |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE SET NULL
- FK: `paid_by` → `users(id)` ON DELETE SET NULL
- UK: `(workplace_id, user_id, pay_year, pay_month)`
- CHECK: `pay_month BETWEEN 1 AND 12`
- CHECK: `status IN ('pending', 'confirmed', 'paid')`
- INDEX: `(workplace_id, pay_year, pay_month)`, `(workplace_id, status)`

---

## 4. 상세 파일 구조

### 3.1 Entity

#### Payroll.java (~120줄)

```java
package com.bizone.api.domain.payroll.entity;

@Entity
@Table(name = "payrolls",
       uniqueConstraints = @UniqueConstraint(columnNames = {"workplace_id", "user_id", "year_month"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payroll extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String userName;

    @Column(nullable = false, length = 7)
    private String yearMonth; // "2024-12"

    // 근무 정보
    private Integer totalWorkDays;
    private Integer totalWorkMinutes;
    private Integer overtimeMinutes;
    private Integer nightMinutes;
    private Integer holidayMinutes;

    // 지급 내역
    @Column(nullable = false)
    private Long basicPay;           // 기본급
    private Long weeklyHolidayPay;   // 주휴수당
    private Long overtimePay;        // 연장근로수당
    private Long nightPay;           // 야간근로수당
    private Long holidayPay;         // 휴일근로수당
    private Long mealAllowance;      // 식대
    private Long transportAllowance; // 교통비
    private Long otherAllowance;     // 기타수당
    
    @Column(nullable = false)
    private Long totalPayment;       // 총 지급액

    // 공제 내역
    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollDeduction> deductions = new ArrayList<>();

    @Column(nullable = false)
    private Long totalDeduction;     // 총 공제액

    @Column(nullable = false)
    private Long netPay;             // 실 지급액

    // 적용 시급
    @Column(nullable = false)
    private Integer appliedHourlyWage;

    // 상태
    private boolean isPaid;
    private LocalDateTime paidAt;

    // 비즈니스 메서드
    @Builder
    public Payroll(Long workplaceId, Long userId, String userName, String yearMonth,
                   Integer appliedHourlyWage) { }

    public void calculate(PayCalculationResult result) {
        this.basicPay = result.getBasicPay();
        this.weeklyHolidayPay = result.getWeeklyHolidayPay();
        this.overtimePay = result.getOvertimePay();
        this.nightPay = result.getNightPay();
        this.holidayPay = result.getHolidayPay();
        this.totalPayment = calculateTotalPayment();
        this.totalDeduction = calculateTotalDeduction();
        this.netPay = this.totalPayment - this.totalDeduction;
    }

    public void addDeduction(PayrollDeduction deduction) {
        this.deductions.add(deduction);
        deduction.setPayroll(this);
    }

    public void markAsPaid() {
        this.isPaid = true;
        this.paidAt = LocalDateTime.now();
    }

    private Long calculateTotalPayment() {
        return basicPay + weeklyHolidayPay + overtimePay + nightPay + holidayPay
               + mealAllowance + transportAllowance + otherAllowance;
    }

    private Long calculateTotalDeduction() {
        return deductions.stream()
            .mapToLong(PayrollDeduction::getAmount)
            .sum();
    }
}
```

### 3.2 Calculator

#### DeductionCalculator.java (~60줄)

```java
package com.bizone.api.domain.payroll.service.calculator;

@Component
public class DeductionCalculator {

    // 2024년 기준 요율
    private static final double NATIONAL_PENSION_RATE = 0.045;      // 국민연금 4.5%
    private static final double HEALTH_INSURANCE_RATE = 0.03545;    // 건강보험 3.545%
    private static final double LONG_TERM_CARE_RATE = 0.1295;       // 장기요양 12.95%
    private static final double EMPLOYMENT_INSURANCE_RATE = 0.009;  // 고용보험 0.9%

    public List<PayrollDeduction> calculateDeductions(Long totalPayment) {
        List<PayrollDeduction> deductions = new ArrayList<>();

        // 국민연금
        long nationalPension = Math.round(totalPayment * NATIONAL_PENSION_RATE);
        deductions.add(new PayrollDeduction(DeductionType.NATIONAL_PENSION, nationalPension));

        // 건강보험
        long healthInsurance = Math.round(totalPayment * HEALTH_INSURANCE_RATE);
        deductions.add(new PayrollDeduction(DeductionType.HEALTH_INSURANCE, healthInsurance));

        // 장기요양보험
        long longTermCare = Math.round(healthInsurance * LONG_TERM_CARE_RATE);
        deductions.add(new PayrollDeduction(DeductionType.LONG_TERM_CARE, longTermCare));

        // 고용보험
        long employmentInsurance = Math.round(totalPayment * EMPLOYMENT_INSURANCE_RATE);
        deductions.add(new PayrollDeduction(DeductionType.EMPLOYMENT_INSURANCE, employmentInsurance));

        // 소득세 (간이세액표 적용)
        long incomeTax = calculateIncomeTax(totalPayment);
        deductions.add(new PayrollDeduction(DeductionType.INCOME_TAX, incomeTax));

        // 지방소득세 (소득세의 10%)
        long localIncomeTax = Math.round(incomeTax * 0.1);
        deductions.add(new PayrollDeduction(DeductionType.LOCAL_INCOME_TAX, localIncomeTax));

        return deductions;
    }

    private long calculateIncomeTax(Long totalPayment) {
        // 근로소득 간이세액표 적용 로직
        // 실제 구현 시 국세청 간이세액표 참조
        return 0L; // 간소화된 예시
    }
}
```

#### MinimumWageProvider.java (~25줄)

```java
package com.bizone.api.domain.payroll.constant;

@Component
public class MinimumWageProvider {

    private static final Map<Integer, Integer> MINIMUM_WAGES = Map.of(
        2024, 9860,
        2025, 10030,
        2026, 10320
    );

    public static int getCurrentMinimumWage() {
        int currentYear = LocalDate.now().getYear();
        return MINIMUM_WAGES.getOrDefault(currentYear, 
            MINIMUM_WAGES.get(MINIMUM_WAGES.keySet().stream().max(Integer::compareTo).orElse(2025)));
    }

    public static int getMinimumWage(int year) {
        return MINIMUM_WAGES.getOrDefault(year, getCurrentMinimumWage());
    }

    public static void validateMinimumWage(int hourlyWage) {
        int minimumWage = getCurrentMinimumWage();
        if (hourlyWage < minimumWage) {
            throw new PayrollException(PayrollErrorCode.BELOW_MINIMUM_WAGE,
                String.format("현재 최저시급은 %,d원입니다. 최저시급 이상의 금액을 입력해주세요.", minimumWage));
        }
    }
}
```

### 3.3 Generator

#### PayslipPdfGenerator.java (~80줄)

```java
package com.bizone.api.domain.payroll.generator;

@Component
@RequiredArgsConstructor
public class PayslipPdfGenerator {

    private final TemplateEngine templateEngine;

    public byte[] generate(Payroll payroll) {
        // 1. HTML 템플릿 렌더링
        Context context = new Context();
        context.setVariable("payroll", payroll);
        context.setVariable("deductions", payroll.getDeductions());
        context.setVariable("formattedYearMonth", formatYearMonth(payroll.getYearMonth()));
        
        String html = templateEngine.process("pdf/payslip-template", context);

        // 2. HTML to PDF 변환
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            HtmlConverter.convertToPdf(html, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new PayrollException(PayrollErrorCode.PDF_GENERATION_FAILED);
        }
    }

    private String formatYearMonth(String yearMonth) {
        String[] parts = yearMonth.split("-");
        return parts[0] + "년 " + Integer.parseInt(parts[1]) + "월";
    }
}
```

#### AttendanceExcelGenerator.java (~90줄)

```java
package com.bizone.api.domain.payroll.generator;

@Component
public class AttendanceExcelGenerator {

    public byte[] generate(List<AttendanceRecord> records, List<Payroll> payrolls) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("근무 기록");

            // 헤더 생성
            createHeaderRow(sheet);

            // 데이터 행 생성
            int rowNum = 1;
            for (AttendanceRecord record : records) {
                Row row = sheet.createRow(rowNum++);
                fillDataRow(row, record);
            }

            // 열 너비 자동 조정
            for (int i = 0; i < 12; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new PayrollException(PayrollErrorCode.EXCEL_GENERATION_FAILED);
        }
    }

    private void createHeaderRow(Sheet sheet) {
        Row headerRow = sheet.createRow(0);
        String[] headers = {"직원명", "날짜", "출근시간", "퇴근시간", "근무시간", 
                           "기본급", "연장수당", "야간수당", "휴일수당", 
                           "총 지급액", "공제액", "실 지급액"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }
    }

    private void fillDataRow(Row row, AttendanceRecord record) {
        row.createCell(0).setCellValue(record.getUserName());
        row.createCell(1).setCellValue(record.getWorkDate().toString());
        // ... 나머지 셀 채우기
    }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/payroll/my` | 내 급여 목록 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/payroll/my/{yearMonth}` | 내 급여 상세 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/payroll/my/{yearMonth}/pdf` | 급여 명세서 PDF 다운로드 | 멤버 |
| GET | `/api/v1/admin/workplaces/{id}/payroll` | 전체 급여 목록 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/payroll/calculate` | 급여 계산 | 관리자 |
| GET | `/api/v1/admin/workplaces/{id}/payroll/export` | 근무기록 Excel 추출 | 관리자 |
| GET | `/api/v1/admin/workplaces/{id}/payroll/checklist` | 지급 체크리스트 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/payroll/{payrollId}/paid` | 지급 완료 체크 | 관리자 |

---

## 5. 관련 문서

- [출퇴근 도메인](./07-attendance.md)
- [멤버십 도메인](./05-member.md)
- [기능 요구사항 - 급여 관리](../../02_requirements/functional.md)

