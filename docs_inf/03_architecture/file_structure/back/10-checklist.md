# 체크리스트 도메인 (Checklist Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.checklist`

## 1. 개요

체크리스트 도메인은 업무 체크리스트 템플릿 관리, 할당, 완료 체크, 진행률 관리를 담당합니다.

### 1.1 주요 기능

- 체크리스트 템플릿 CRUD
- 템플릿 즐겨찾기
- 근무자별 체크리스트 할당
- 업무 완료 체크
- 업무 진행률 확인
- 업무 모니터링 (관리자)

---

## 2. 패키지 구조

```
domain/checklist/
├── controller/
│   ├── ChecklistController.java             # 체크리스트 API 컨트롤러 (~60줄)
│   └── ChecklistAdminController.java        # 관리자 API 컨트롤러 (~70줄)
│
├── service/
│   ├── ChecklistService.java                # 서비스 인터페이스 (~35줄)
│   └── impl/
│       └── ChecklistServiceImpl.java        # 서비스 구현체 (~180줄)
│
├── repository/
│   ├── ChecklistTemplateRepository.java     # 템플릿 Repository (~20줄)
│   ├── ChecklistAssignmentRepository.java   # 할당 Repository (~25줄)
│   ├── ChecklistItemRepository.java         # 아이템 Repository (~20줄)
│   └── ChecklistQueryRepository.java        # QueryDSL Repository (~50줄)
│
├── entity/
│   ├── ChecklistTemplate.java               # 템플릿 엔티티 (~70줄)
│   ├── ChecklistTemplateItem.java           # 템플릿 아이템 엔티티 (~40줄)
│   ├── ChecklistAssignment.java             # 할당 엔티티 (~60줄)
│   └── ChecklistItemCompletion.java         # 완료 체크 엔티티 (~50줄)
│
├── dto/
│   ├── request/
│   │   ├── TemplateCreateRequest.java       # 템플릿 생성 요청 (~35줄)
│   │   ├── TemplateUpdateRequest.java       # 템플릿 수정 요청 (~30줄)
│   │   ├── AssignmentCreateRequest.java     # 할당 요청 (~25줄)
│   │   └── ItemCompletionRequest.java       # 완료 체크 요청 (~20줄)
│   │
│   └── response/
│       ├── TemplateResponse.java            # 템플릿 응답 (~30줄)
│       ├── AssignmentResponse.java          # 할당 응답 (~35줄)
│       ├── ProgressResponse.java            # 진행률 응답 (~25줄)
│       └── MonitoringResponse.java          # 모니터링 응답 (~40줄)
│
├── mapper/
│   └── ChecklistMapper.java                 # Entity-DTO 매퍼 (~40줄)
│
└── constant/
    ├── ChecklistCategory.java               # 카테고리 enum (~15줄)
    └── RepeatType.java                      # 반복 유형 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 checklists (체크리스트 템플릿) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| name | VARCHAR(200) | NO | - | 체크리스트명 |
| category | VARCHAR(100) | YES | NULL | 카테고리 (오픈/마감 등) |
| description | TEXT | YES | NULL | 설명 |
| time_slot | TIME | YES | NULL | 시간대 |
| repeat_days | VARCHAR(50) | YES | NULL | 반복 요일 (JSON) |
| sort_order | INT | NO | 0 | 정렬 순서 |
| is_active | BOOLEAN | NO | TRUE | 활성화 여부 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- INDEX: `workplace_id`, `is_active`

### 3.2 checklist_items (체크리스트 항목) 테이블

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

### 3.3 checklist_assignments (체크리스트 할당) 테이블

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
- UK: `(checklist_id, user_id)`
- INDEX: `(workplace_id, user_id)`

### 3.4 task_completions (업무 완료 기록) 테이블

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
- UK: `(workplace_id, user_id, item_id, completion_date)`
- CHECK: `status IN ('completed', 'skipped')`
- INDEX: `(workplace_id, user_id, completion_date)`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### ChecklistTemplate.java (~70줄)

```java
package com.bizone.api.domain.checklist.entity;

@Entity
@Table(name = "checklist_templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChecklistTemplate extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChecklistCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RepeatType repeatType;

    @Convert(converter = StringListConverter.class)
    private List<String> repeatDays; // ["MON", "TUE", ...]

    private LocalTime scheduledTime;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ChecklistTemplateItem> items = new ArrayList<>();

    private boolean isFavorite;
    private boolean isActive;

    // 비즈니스 메서드
    public void addItem(ChecklistTemplateItem item) { }
    public void removeItem(Long itemId) { }
    public void reorderItems(List<Long> itemIds) { }
    public void toggleFavorite() { this.isFavorite = !this.isFavorite; }
}
```

#### ChecklistAssignment.java (~60줄)

```java
package com.bizone.api.domain.checklist.entity;

@Entity
@Table(name = "checklist_assignments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChecklistAssignment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long templateId;

    @Column(nullable = false)
    private Long assigneeId;

    @Column(nullable = false, length = 100)
    private String assigneeName;

    @Column(nullable = false)
    private LocalDate assignedDate;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItemCompletion> completions = new ArrayList<>();

    private Integer totalItems;
    private Integer completedItems;
    
    // 계산 필드
    @Transient
    public double getProgressRate() {
        if (totalItems == null || totalItems == 0) return 0;
        return (completedItems * 100.0) / totalItems;
    }

    // 비즈니스 메서드
    public void checkItem(Long itemId, String note) { }
    public void uncheckItem(Long itemId) { }
    public void skipItem(Long itemId, String reason) { }
    public void updateProgress() {
        this.completedItems = (int) completions.stream()
            .filter(c -> c.isCompleted() || c.isSkipped())
            .count();
    }
}
```

### 3.2 Controller

#### ChecklistController.java (~60줄)

```java
package com.bizone.api.domain.checklist.controller;

@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/checklists")
@RequiredArgsConstructor
@Tag(name = "Checklist", description = "체크리스트 API")
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping("/assigned")
    @Operation(summary = "나에게 할당된 체크리스트 조회")
    public ApiResponse<List<AssignmentResponse>> getMyAssignments(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) { }

    @PostMapping("/assigned/{assignmentId}/items/{itemId}/complete")
    @Operation(summary = "업무 완료 체크")
    public ApiResponse<Void> completeItem(
        @PathVariable Long workplaceId,
        @PathVariable Long assignmentId,
        @PathVariable Long itemId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ItemCompletionRequest request) { }

    @PostMapping("/assigned/{assignmentId}/items/{itemId}/skip")
    @Operation(summary = "업무 미수행 (사유 입력)")
    public ApiResponse<Void> skipItem(
        @PathVariable Long workplaceId,
        @PathVariable Long assignmentId,
        @PathVariable Long itemId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ItemCompletionRequest request) { }

    @GetMapping("/progress")
    @Operation(summary = "내 진행률 조회")
    public ApiResponse<ProgressResponse> getMyProgress(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) { }
}
```

#### ChecklistAdminController.java (~70줄)

```java
package com.bizone.api.domain.checklist.controller;

@RestController
@RequestMapping("/api/v1/admin/workplaces/{workplaceId}/checklists")
@RequiredArgsConstructor
@PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
@Tag(name = "Checklist Admin", description = "체크리스트 관리자 API")
public class ChecklistAdminController {

    private final ChecklistService checklistService;

    @GetMapping("/templates")
    @Operation(summary = "템플릿 목록 조회")
    public ApiResponse<List<TemplateResponse>> getTemplates(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/templates")
    @Operation(summary = "템플릿 생성")
    public ApiResponse<TemplateResponse> createTemplate(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TemplateCreateRequest request) { }

    @PutMapping("/templates/{templateId}")
    @Operation(summary = "템플릿 수정")
    public ApiResponse<TemplateResponse> updateTemplate(
        @PathVariable Long workplaceId,
        @PathVariable Long templateId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TemplateUpdateRequest request) { }

    @DeleteMapping("/templates/{templateId}")
    @Operation(summary = "템플릿 삭제")
    public ApiResponse<Void> deleteTemplate(
        @PathVariable Long workplaceId,
        @PathVariable Long templateId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/templates/{templateId}/favorite")
    @Operation(summary = "템플릿 즐겨찾기 토글")
    public ApiResponse<Void> toggleFavorite(
        @PathVariable Long workplaceId,
        @PathVariable Long templateId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/assign")
    @Operation(summary = "체크리스트 할당")
    public ApiResponse<AssignmentResponse> assignChecklist(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AssignmentCreateRequest request) { }

    @GetMapping("/monitoring")
    @Operation(summary = "업무 모니터링")
    public ApiResponse<List<MonitoringResponse>> getMonitoring(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) { }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/checklists/assigned` | 할당된 체크리스트 조회 | 멤버 |
| POST | `/api/v1/workplaces/{id}/checklists/assigned/{assignmentId}/items/{itemId}/complete` | 업무 완료 체크 | 멤버 |
| POST | `/api/v1/workplaces/{id}/checklists/assigned/{assignmentId}/items/{itemId}/skip` | 업무 미수행 | 멤버 |
| GET | `/api/v1/workplaces/{id}/checklists/progress` | 진행률 조회 | 멤버 |
| GET | `/api/v1/admin/workplaces/{id}/checklists/templates` | 템플릿 목록 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/checklists/templates` | 템플릿 생성 | 관리자 |
| PUT | `/api/v1/admin/workplaces/{id}/checklists/templates/{templateId}` | 템플릿 수정 | 관리자 |
| DELETE | `/api/v1/admin/workplaces/{id}/checklists/templates/{templateId}` | 템플릿 삭제 | 관리자 |
| POST | `/api/v1/admin/workplaces/{id}/checklists/assign` | 체크리스트 할당 | 관리자 |
| GET | `/api/v1/admin/workplaces/{id}/checklists/monitoring` | 업무 모니터링 | 관리자 |

---

## 5. 관련 문서

- [출퇴근 도메인](./07-attendance.md) - 퇴근 시 체크리스트 완료 필수
- [알림 도메인](./14-notification.md) - 체크리스트 할당 시 푸시 알림

