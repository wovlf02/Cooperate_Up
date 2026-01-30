# 공지사항 도메인 (Announcement Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.announcement`

## 1. 개요

공지사항 도메인은 공지 작성, 조회, 댓글, 읽음 확인 등을 담당합니다.

### 1.1 주요 기능

- 공지사항 CRUD
- 공지 중요도 설정 (일반/중요)
- 공지 고정
- 댓글/대댓글
- 읽음 확인

---

## 2. 패키지 구조

```
domain/announcement/
├── controller/
│   └── AnnouncementController.java          # 공지사항 API 컨트롤러 (~70줄)
│
├── service/
│   ├── AnnouncementService.java             # 서비스 인터페이스 (~30줄)
│   └── impl/
│       └── AnnouncementServiceImpl.java     # 서비스 구현체 (~140줄)
│
├── repository/
│   ├── AnnouncementRepository.java          # JPA Repository (~25줄)
│   ├── AnnouncementQueryRepository.java     # QueryDSL Repository (~50줄)
│   ├── AnnouncementCommentRepository.java   # 댓글 Repository (~20줄)
│   └── AnnouncementReadRepository.java      # 읽음 확인 Repository (~15줄)
│
├── entity/
│   ├── Announcement.java                    # 공지사항 엔티티 (~80줄)
│   ├── AnnouncementComment.java             # 댓글 엔티티 (~50줄)
│   └── AnnouncementRead.java                # 읽음 확인 엔티티 (~30줄)
│
├── dto/
│   ├── request/
│   │   ├── AnnouncementCreateRequest.java   # 공지 작성 요청 (~30줄)
│   │   ├── AnnouncementUpdateRequest.java   # 공지 수정 요청 (~25줄)
│   │   └── CommentCreateRequest.java        # 댓글 작성 요청 (~15줄)
│   │
│   └── response/
│       ├── AnnouncementResponse.java        # 공지 기본 응답 (~30줄)
│       ├── AnnouncementDetailResponse.java  # 공지 상세 응답 (~40줄)
│       ├── AnnouncementListResponse.java    # 공지 목록 응답 (~25줄)
│       └── CommentResponse.java             # 댓글 응답 (~25줄)
│
├── mapper/
│   └── AnnouncementMapper.java              # Entity-DTO 매퍼 (~35줄)
│
└── constant/
    └── AnnouncementPriority.java            # 우선순위 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 announcements (공지사항) 테이블

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

### 3.2 announcement_attachments (공지사항 첨부파일) 테이블

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

### 3.3 comments (댓글) 테이블

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
- INDEX: `announcement_id`, `parent_id`

### 3.4 announcement_reads (공지사항 읽음) 테이블

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

## 4. 상세 파일 구조

### 4.1 Entity

#### Announcement.java (~80줄)

```java
package com.bizone.api.domain.announcement.entity;

@Entity
@Table(name = "announcements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Announcement extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 100)
    private String authorName;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnnouncementPriority priority;

    private boolean isPinned;

    @Convert(converter = StringListConverter.class)
    private List<String> attachmentUrls;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<AnnouncementComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AnnouncementRead> reads = new HashSet<>();

    private Integer viewCount;
    private boolean isActive;

    // 비즈니스 메서드
    public void update(String title, String content, AnnouncementPriority priority) { }
    public void pin() { this.isPinned = true; }
    public void unpin() { this.isPinned = false; }
    public void incrementViewCount() { this.viewCount++; }
    public void delete() { this.isActive = false; }
}
```

#### AnnouncementComment.java (~50줄)

```java
package com.bizone.api.domain.announcement.entity;

@Entity
@Table(name = "announcement_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AnnouncementComment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    private Long parentId; // 대댓글인 경우 부모 댓글 ID

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 100)
    private String authorName;

    @Column(nullable = false, length = 1000)
    private String content;

    private boolean isDeleted;

    // 비즈니스 메서드
    public void update(String content) { this.content = content; }
    public void delete() { 
        this.isDeleted = true; 
        this.content = "삭제된 댓글입니다.";
    }
}
```

### 3.2 Controller

#### AnnouncementController.java (~70줄)

```java
package com.bizone.api.domain.announcement.controller;

@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcement", description = "공지사항 API")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    @Operation(summary = "공지사항 목록 조회")
    public ApiResponse<PageResponse<AnnouncementListResponse>> getAnnouncements(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(size = 20) Pageable pageable) { }

    @GetMapping("/{announcementId}")
    @Operation(summary = "공지사항 상세 조회")
    public ApiResponse<AnnouncementDetailResponse> getAnnouncement(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping
    @Operation(summary = "공지사항 작성")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<AnnouncementResponse> createAnnouncement(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AnnouncementCreateRequest request) { }

    @PutMapping("/{announcementId}")
    @Operation(summary = "공지사항 수정")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<AnnouncementResponse> updateAnnouncement(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody AnnouncementUpdateRequest request) { }

    @DeleteMapping("/{announcementId}")
    @Operation(summary = "공지사항 삭제")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<Void> deleteAnnouncement(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/{announcementId}/pin")
    @Operation(summary = "공지사항 고정/해제")
    @PreAuthorize("@memberAuthChecker.isAdmin(#workplaceId, #principal.userId)")
    public ApiResponse<Void> togglePin(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/{announcementId}/comments")
    @Operation(summary = "댓글 작성")
    public ApiResponse<CommentResponse> createComment(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CommentCreateRequest request) { }

    @DeleteMapping("/{announcementId}/comments/{commentId}")
    @Operation(summary = "댓글 삭제")
    public ApiResponse<Void> deleteComment(
        @PathVariable Long workplaceId,
        @PathVariable Long announcementId,
        @PathVariable Long commentId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/announcements` | 공지 목록 조회 | 멤버 |
| GET | `/api/v1/workplaces/{id}/announcements/{announcementId}` | 공지 상세 조회 | 멤버 |
| POST | `/api/v1/workplaces/{id}/announcements` | 공지 작성 | 관리자 |
| PUT | `/api/v1/workplaces/{id}/announcements/{announcementId}` | 공지 수정 | 관리자 |
| DELETE | `/api/v1/workplaces/{id}/announcements/{announcementId}` | 공지 삭제 | 관리자 |
| POST | `/api/v1/workplaces/{id}/announcements/{announcementId}/pin` | 공지 고정/해제 | 관리자 |
| POST | `/api/v1/workplaces/{id}/announcements/{announcementId}/comments` | 댓글 작성 | 멤버 |
| DELETE | `/api/v1/workplaces/{id}/announcements/{announcementId}/comments/{commentId}` | 댓글 삭제 | 작성자/관리자 |

---

## 5. 관련 문서

- [알림 도메인](./14-notification.md) - 새 공지 푸시 알림
- [파일 도메인](./15-file.md) - 첨부파일 업로드

