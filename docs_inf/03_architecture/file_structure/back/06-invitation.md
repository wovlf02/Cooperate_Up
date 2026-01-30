# 초대 도메인 (Invitation Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.invitation`

## 1. 개요

초대 도메인은 사업장 초대 발송, 수락/거부, 초대 상태 관리를 담당합니다.

### 1.1 주요 기능

- 직원 아이디로 초대 발송
- 초대 수락/거부
- 초대 목록 조회
- 초대 취소
- 초대 만료 처리

---

## 2. 패키지 구조

```
domain/invitation/
├── controller/
│   └── InvitationController.java            # 초대 API 컨트롤러 (~55줄)
│
├── service/
│   ├── InvitationService.java               # 서비스 인터페이스 (~25줄)
│   └── impl/
│       └── InvitationServiceImpl.java       # 서비스 구현체 (~140줄)
│
├── repository/
│   └── InvitationRepository.java            # JPA Repository (~25줄)
│
├── entity/
│   └── Invitation.java                      # 초대 엔티티 (~60줄)
│
├── dto/
│   ├── request/
│   │   └── InvitationCreateRequest.java     # 초대 발송 요청 (~15줄)
│   │
│   └── response/
│       ├── InvitationResponse.java          # 초대 응답 (~25줄)
│       └── ReceivedInvitationResponse.java  # 받은 초대 응답 (~20줄)
│
├── mapper/
│   └── InvitationMapper.java                # Entity-DTO 매퍼 (~25줄)
│
└── constant/
    └── InvitationStatus.java                # 초대 상태 enum (~15줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 invitations 테이블

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

## 4. 상세 파일 구조

### 4.1 Entity

#### Invitation.java (~60줄)

```java
package com.bizone.api.domain.invitation.entity;

@Entity
@Table(name = "invitations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Column(nullable = false, length = 200)
    private String workplaceName;

    @Column(nullable = false)
    private Long inviterId;

    @Column(nullable = false, length = 100)
    private String inviterName;

    @Column(nullable = false)
    private Long inviteeId;

    @Column(nullable = false, length = 100)
    private String inviteeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvitationStatus status;

    private LocalDateTime respondedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 비즈니스 메서드
    @Builder
    public Invitation(Long workplaceId, String workplaceName, 
                      Long inviterId, String inviterName,
                      Long inviteeId, String inviteeName,
                      LocalDateTime expiresAt) { }

    public void accept() {
        validatePending();
        this.status = InvitationStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }

    public void reject() {
        validatePending();
        this.status = InvitationStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }

    public void expire() {
        if (this.status == InvitationStatus.PENDING) {
            this.status = InvitationStatus.EXPIRED;
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    private void validatePending() {
        if (this.status != InvitationStatus.PENDING) {
            throw new InvitationException(InvitationErrorCode.ALREADY_RESPONDED);
        }
        if (isExpired()) {
            throw new InvitationException(InvitationErrorCode.INVITATION_EXPIRED);
        }
    }
}
```

### 3.2 Controller

#### InvitationController.java (~55줄)

```java
package com.bizone.api.domain.invitation.controller;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitation", description = "초대 관리 API")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    @Operation(summary = "초대 발송")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InvitationResponse> sendInvitation(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody InvitationCreateRequest request) { }

    @GetMapping("/sent")
    @Operation(summary = "보낸 초대 목록 조회")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<InvitationResponse>> getSentInvitations(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam Long workplaceId) { }

    @GetMapping("/received")
    @Operation(summary = "받은 초대 목록 조회")
    public ApiResponse<List<ReceivedInvitationResponse>> getReceivedInvitations(
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/{invitationId}/accept")
    @Operation(summary = "초대 수락")
    public ApiResponse<Void> acceptInvitation(
        @PathVariable Long invitationId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/{invitationId}/reject")
    @Operation(summary = "초대 거부")
    public ApiResponse<Void> rejectInvitation(
        @PathVariable Long invitationId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @DeleteMapping("/{invitationId}")
    @Operation(summary = "초대 취소")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> cancelInvitation(
        @PathVariable Long invitationId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

### 3.3 Constant

#### InvitationStatus.java (~15줄)

```java
package com.bizone.api.domain.invitation.constant;

@Getter
@RequiredArgsConstructor
public enum InvitationStatus {
    PENDING("대기중"),
    ACCEPTED("수락"),
    REJECTED("거부"),
    EXPIRED("만료");

    private final String description;
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/invitations` | 초대 발송 | 관리자 |
| GET | `/api/v1/invitations/sent` | 보낸 초대 목록 | 관리자 |
| GET | `/api/v1/invitations/received` | 받은 초대 목록 | 로그인 |
| POST | `/api/v1/invitations/{id}/accept` | 초대 수락 | 피초대자 |
| POST | `/api/v1/invitations/{id}/reject` | 초대 거부 | 피초대자 |
| DELETE | `/api/v1/invitations/{id}` | 초대 취소 | 관리자 |

---

## 5. 관련 문서

- [사업장 도메인](./04-workplace.md)
- [멤버십 도메인](./05-member.md)
- [알림 도메인](./14-notification.md)

