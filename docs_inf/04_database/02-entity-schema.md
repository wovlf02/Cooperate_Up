# 엔티티 스키마 정의

## 1. 사용자 및 인증 도메인

### 1.1 users (사용자)

사용자 기본 정보와 인증 정보를 저장합니다.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK, 자동 증가 |
| username | VARCHAR(50) | NO | - | 로그인 아이디 (UK) |
| email | VARCHAR(255) | NO | - | 이메일 (UK) |
| email_verified | BOOLEAN | NO | FALSE | 이메일 인증 여부 |
| password_hash | VARCHAR(255) | NO | - | BCrypt 해시된 비밀번호 |
| name | VARCHAR(100) | NO | - | 실명 |
| phone | VARCHAR(20) | YES | NULL | 전화번호 |
| birth_date | DATE | YES | NULL | 생년월일 |
| profile_image_url | VARCHAR(500) | YES | NULL | 프로필 이미지 URL |
| role | VARCHAR(20) | NO | - | 역할: 'admin', 'employee' |
| business_number | VARCHAR(20) | YES | NULL | 사업자등록번호 (관리자용) |
| business_owner_name | VARCHAR(100) | YES | NULL | 대표자명 |
| business_type | VARCHAR(100) | YES | NULL | 업종 |
| business_open_date | DATE | YES | NULL | 개업일 |
| business_verified | BOOLEAN | NO | FALSE | 사업자 인증 완료 여부 |
| business_verified_at | TIMESTAMP | YES | NULL | 사업자 인증 일시 |
| last_business_check_at | TIMESTAMP | YES | NULL | 마지막 사업자 재검증 일시 |
| business_status | VARCHAR(20) | YES | NULL | 'active', 'suspended', 'closed' |
| device_token | VARCHAR(500) | YES | NULL | 푸시 알림 토큰 |
| device_platform | VARCHAR(10) | YES | NULL | 'ios', 'android' |
| current_workplace_id | BIGINT | YES | NULL | 현재 선택된 사업장 FK |
| is_active | BOOLEAN | NO | TRUE | 계정 활성화 상태 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- UK: `username`, `email`
- CHECK: `role IN ('admin', 'employee')`
- CHECK: `business_status IN ('active', 'suspended', 'closed')`
- CHECK: `device_platform IN ('ios', 'android')`

---

### 1.2 refresh_tokens (리프레시 토큰)

JWT Refresh Token 관리용 테이블입니다.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | FK → users.id |
| token_hash | VARCHAR(255) | NO | - | 토큰 해시값 (UK) |
| device_info | VARCHAR(200) | YES | NULL | 디바이스 정보 |
| ip_address | VARCHAR(50) | YES | NULL | 접속 IP |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `token_hash`
- INDEX: `user_id`, `expires_at`

---

### 1.3 password_history (비밀번호 이력)

비밀번호 변경 이력을 저장하여 재사용을 방지합니다.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | FK → users.id |
| password_hash | VARCHAR(255) | NO | - | 이전 비밀번호 해시 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- INDEX: `user_id`

---

## 2. 사업장 도메인

### 2.1 workplaces (사업장)

사업장 정보를 저장합니다.

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

### 2.2 members (사업장 멤버)

사업장과 사용자의 관계 (멤버십) 정보를 저장합니다.

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

### 2.3 invitations (초대)

사업장 초대 정보를 저장합니다.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| workplace_name | VARCHAR(200) | NO | - | 사업장명 (비정규화) |
| inviter_id | BIGINT | NO | - | FK → users.id (초대자) |
| inviter_name | VARCHAR(100) | NO | - | 초대자명 (비정규화) |
| invitee_id | BIGINT | NO | - | FK → users.id (피초대자) |
| invitee_name | VARCHAR(100) | NO | - | 피초대자명 (비정규화) |
| status | VARCHAR(20) | NO | 'pending' | 상태 |
| responded_at | TIMESTAMP | YES | NULL | 응답 일시 |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `inviter_id` → `users(id)` ON DELETE CASCADE
- FK: `invitee_id` → `users(id)` ON DELETE CASCADE
- CHECK: `status IN ('pending', 'accepted', 'rejected', 'expired')`
- INDEX: `workplace_id`, `invitee_id`, `status`

---

## 3. 출퇴근 도메인

### 3.1 attendance_records (출퇴근 기록)

출퇴근 기록을 저장합니다.

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

---

### 3.2 approval_requests (승인 요청)

수동 입력 및 수정 요청을 관리합니다.

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

## 4. 체크리스트 도메인

### 4.1 checklists (체크리스트 템플릿)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| name | VARCHAR(200) | NO | - | 체크리스트명 |
| category | VARCHAR(100) | YES | NULL | 카테고리 (오픈/마감 등) |
| description | TEXT | YES | NULL | 설명 |
| time_slot | TIME | YES | NULL | 시간대 |
| repeat_days | VARCHAR(50) | YES | NULL | 반복 요일 (JSON: [0,1,2,3,4,5,6]) |
| sort_order | INT | NO | 0 | 정렬 순서 |
| is_active | BOOLEAN | NO | TRUE | 활성화 여부 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- INDEX: `workplace_id`, `is_active`

---

### 4.2 checklist_items (체크리스트 항목)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| checklist_id | BIGINT | NO | - | FK → checklists.id |
| title | VARCHAR(300) | NO | - | 항목 제목 |
| description | TEXT | YES | NULL | 상세 설명 |
| sort_order | INT | NO | 0 | 정렬 순서 |
| is_active | BOOLEAN | NO | TRUE | 활성화 여부 |

**제약조건:**
- PK: `id`
- FK: `checklist_id` → `checklists(id)` ON DELETE CASCADE
- INDEX: `checklist_id`

---

### 4.3 checklist_assignments (체크리스트 할당)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| checklist_id | BIGINT | NO | - | FK → checklists.id |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| user_name | VARCHAR(100) | NO | - | 사용자명 (비정규화) |
| assigned_by | BIGINT | YES | NULL | FK → users.id (할당자) |
| assigned_at | TIMESTAMP | NO | NOW | 할당일시 |

**제약조건:**
- PK: `id`
- FK: `checklist_id` → `checklists(id)` ON DELETE CASCADE
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- FK: `assigned_by` → `users(id)` ON DELETE SET NULL
- UK: `(checklist_id, user_id)`
- INDEX: `(workplace_id, user_id)`

---

### 4.4 checklist_favorites (체크리스트 즐겨찾기)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| checklist_id | BIGINT | NO | - | FK → checklists.id |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `checklist_id` → `checklists(id)` ON DELETE CASCADE
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(checklist_id, user_id)`
- INDEX: `(workplace_id, user_id)`

---

### 4.5 task_completions (업무 완료 기록)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| user_id | BIGINT | NO | - | FK → users.id |
| user_name | VARCHAR(100) | NO | - | 사용자명 (비정규화) |
| checklist_id | BIGINT | NO | - | FK → checklists.id |
| checklist_name | VARCHAR(200) | NO | - | 체크리스트명 (비정규화) |
| item_id | BIGINT | NO | - | FK → checklist_items.id |
| item_title | VARCHAR(300) | NO | - | 항목 제목 (비정규화) |
| completion_date | DATE | NO | - | 완료 날짜 |
| status | VARCHAR(20) | NO | - | 'completed', 'skipped' |
| completed_at | TIMESTAMP | YES | NULL | 완료 시각 |
| skipped_at | TIMESTAMP | YES | NULL | 건너뛴 시각 |
| skip_reason | TEXT | YES | NULL | 건너뛴 사유 |
| note | TEXT | YES | NULL | 비고 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE SET NULL
- FK: `checklist_id` → `checklists(id)` ON DELETE SET NULL
- FK: `item_id` → `checklist_items(id)` ON DELETE SET NULL
- UK: `(workplace_id, user_id, item_id, completion_date)`
- CHECK: `status IN ('completed', 'skipped')`
- INDEX: `(workplace_id, user_id, completion_date)`, `(checklist_id, completion_date)`

---

## 5. 근로계약 도메인

### 5.1 contracts (전자근로계약서)

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

## 6. 급여 도메인

### 6.1 payrolls (급여 내역)

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

## 7. 공지사항 도메인

### 7.1 announcements (공지사항)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| author_id | BIGINT | NO | - | FK → users.id |
| author_name | VARCHAR(100) | NO | - | 작성자명 (비정규화) |
| title | VARCHAR(300) | NO | - | 제목 |
| content | TEXT | NO | - | 내용 |
| is_pinned | BOOLEAN | NO | FALSE | 상단 고정 여부 |
| view_count | INT | NO | 0 | 조회수 |
| comment_count | INT | NO | 0 | 댓글수 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `author_id` → `users(id)` ON DELETE SET NULL
- CHECK: `view_count >= 0`
- CHECK: `comment_count >= 0`
- INDEX: `(workplace_id, is_pinned DESC, created_at DESC)`

---

### 7.2 announcement_attachments (공지사항 첨부파일)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| announcement_id | BIGINT | NO | - | FK → announcements.id |
| file_name | VARCHAR(255) | NO | - | 파일명 |
| file_url | VARCHAR(500) | NO | - | 파일 URL |
| file_type | VARCHAR(20) | YES | NULL | 'image', 'document' |
| file_size | INT | NO | 0 | 파일 크기 (bytes) |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `announcement_id` → `announcements(id)` ON DELETE CASCADE
- CHECK: `file_type IN ('image', 'document')`
- INDEX: `announcement_id`

---

### 7.3 announcement_reads (공지사항 읽음)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| announcement_id | BIGINT | NO | - | FK → announcements.id |
| user_id | BIGINT | NO | - | FK → users.id |
| read_at | TIMESTAMP | NO | NOW | 읽은 일시 |

**제약조건:**
- PK: `id`
- FK: `announcement_id` → `announcements(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(announcement_id, user_id)`
- INDEX: `announcement_id`

---

### 7.4 comments (댓글)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| announcement_id | BIGINT | NO | - | FK → announcements.id |
| parent_id | BIGINT | YES | NULL | FK → comments.id (대댓글) |
| author_id | BIGINT | NO | - | FK → users.id |
| author_name | VARCHAR(100) | NO | - | 작성자명 (비정규화) |
| content | TEXT | NO | - | 내용 |
| mention_user_id | BIGINT | YES | NULL | FK → users.id (멘션) |
| mention_user_name | VARCHAR(100) | YES | NULL | 멘션 사용자명 |
| is_deleted | BOOLEAN | NO | FALSE | 삭제 여부 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `announcement_id` → `announcements(id)` ON DELETE CASCADE
- FK: `parent_id` → `comments(id)` ON DELETE CASCADE
- FK: `author_id` → `users(id)` ON DELETE SET NULL
- FK: `mention_user_id` → `users(id)` ON DELETE SET NULL
- INDEX: `announcement_id`, `parent_id`

---

## 8. 채팅 도메인

### 8.1 chat_rooms (채팅방)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| room_type | VARCHAR(20) | NO | - | 'group', 'direct' |
| name | VARCHAR(200) | YES | NULL | 채팅방 이름 (그룹용) |
| created_by | BIGINT | YES | NULL | FK → users.id |
| last_message_content | TEXT | YES | NULL | 마지막 메시지 (비정규화) |
| last_message_sender_id | BIGINT | YES | NULL | 마지막 발신자 |
| last_message_sender_name | VARCHAR(100) | YES | NULL | 마지막 발신자명 |
| last_message_type | VARCHAR(20) | YES | NULL | 마지막 메시지 타입 |
| last_message_at | TIMESTAMP | YES | NULL | 마지막 메시지 시간 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `created_by` → `users(id)` ON DELETE SET NULL
- CHECK: `room_type IN ('group', 'direct')`
- INDEX: `(workplace_id, updated_at DESC)`

---

### 8.2 chat_room_participants (채팅방 참여자)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| chat_room_id | BIGINT | NO | - | FK → chat_rooms.id |
| user_id | BIGINT | NO | - | FK → users.id |
| last_read_at | TIMESTAMP | YES | NULL | 마지막 읽은 시간 |
| joined_at | TIMESTAMP | NO | NOW | 참여 일시 |

**제약조건:**
- PK: `id`
- FK: `chat_room_id` → `chat_rooms(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(chat_room_id, user_id)`
- INDEX: `chat_room_id`, `user_id`

---

### 8.3 messages (메시지)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| chat_room_id | BIGINT | NO | - | FK → chat_rooms.id |
| sender_id | BIGINT | NO | - | FK → users.id |
| sender_name | VARCHAR(100) | NO | - | 발신자명 (비정규화) |
| content | TEXT | YES | NULL | 메시지 내용 |
| message_type | VARCHAR(20) | NO | 'text' | 메시지 타입 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `chat_room_id` → `chat_rooms(id)` ON DELETE CASCADE
- FK: `sender_id` → `users(id)` ON DELETE SET NULL
- CHECK: `message_type IN ('text', 'image', 'video', 'audio', 'document', 'system')`
- INDEX: `(chat_room_id, created_at DESC)`

---

### 8.4 message_attachments (메시지 첨부파일)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| message_id | BIGINT | NO | - | FK → messages.id |
| file_name | VARCHAR(255) | NO | - | 파일명 |
| file_url | VARCHAR(500) | NO | - | 파일 URL |
| thumbnail_url | VARCHAR(500) | YES | NULL | 썸네일 URL |
| file_type | VARCHAR(20) | YES | NULL | 파일 타입 |
| mime_type | VARCHAR(100) | YES | NULL | MIME 타입 |
| file_size | INT | NO | 0 | 파일 크기 |
| duration | INT | YES | NULL | 재생 시간 (초) |

**제약조건:**
- PK: `id`
- FK: `message_id` → `messages(id)` ON DELETE CASCADE
- INDEX: `message_id`

---

### 8.5 message_reads (메시지 읽음)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| message_id | BIGINT | NO | - | FK → messages.id |
| user_id | BIGINT | NO | - | FK → users.id |
| read_at | TIMESTAMP | NO | NOW | 읽은 일시 |

**제약조건:**
- PK: `id`
- FK: `message_id` → `messages(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(message_id, user_id)`
- INDEX: `message_id`

---

## 9. 설정 도메인

### 9.1 app_configs (앱 설정)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| config_type | VARCHAR(50) | NO | - | 설정 유형 |
| config_key | VARCHAR(100) | NO | - | 설정 키 |
| config_value | TEXT | NO | - | 설정 값 (JSON) |
| description | TEXT | YES | NULL | 설명 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- UK: `(config_type, config_key)`

**초기 데이터:**
```sql
INSERT INTO app_configs (config_type, config_key, config_value, description) VALUES
('minimum_wage', '2024', '{"hourly_wage": 9860}', '2024년 최저시급'),
('minimum_wage', '2025', '{"hourly_wage": 10030}', '2025년 최저시급'),
('minimum_wage', '2026', '{"hourly_wage": 10320}', '2026년 최저시급');
```

