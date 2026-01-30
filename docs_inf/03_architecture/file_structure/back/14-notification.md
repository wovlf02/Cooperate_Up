# 알림 도메인 (Notification Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.notification`

## 1. 개요

알림 도메인은 인앱 알림, 푸시 알림 관리를 담당합니다.

### 1.1 주요 기능

- 인앱 알림 생성/조회
- 푸시 알림 발송 (FCM)
- 알림 읽음 처리
- 알림 설정 관리

---

## 2. 패키지 구조

```
domain/notification/
├── controller/
│   └── NotificationController.java          # 알림 API 컨트롤러 (~45줄)
│
├── service/
│   ├── NotificationService.java             # 서비스 인터페이스 (~25줄)
│   └── impl/
│       └── NotificationServiceImpl.java     # 서비스 구현체 (~120줄)
│
├── repository/
│   ├── NotificationRepository.java          # JPA Repository (~20줄)
│   └── NotificationSettingRepository.java   # 설정 Repository (~15줄)
│
├── entity/
│   ├── Notification.java                    # 알림 엔티티 (~60줄)
│   └── NotificationSetting.java             # 알림 설정 엔티티 (~40줄)
│
├── dto/
│   ├── request/
│   │   └── NotificationSettingRequest.java  # 알림 설정 요청 (~20줄)
│   │
│   └── response/
│       ├── NotificationResponse.java        # 알림 응답 (~25줄)
│       └── NotificationSettingResponse.java # 알림 설정 응답 (~15줄)
│
├── mapper/
│   └── NotificationMapper.java              # Entity-DTO 매퍼 (~25줄)
│
├── event/
│   ├── NotificationEvent.java               # 알림 이벤트 (~20줄)
│   └── NotificationEventListener.java       # 이벤트 리스너 (~50줄)
│
└── constant/
    └── NotificationType.java                # 알림 유형 enum (~25줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 notifications (알림) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | FK → users.id |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| type | VARCHAR(30) | NO | - | 알림 유형 |
| title | VARCHAR(200) | NO | - | 알림 제목 |
| body | VARCHAR(500) | NO | - | 알림 내용 |
| action_url | VARCHAR(200) | YES | NULL | 클릭 시 이동 URL |
| data | TEXT | YES | NULL | 추가 데이터 (JSON) |
| is_read | BOOLEAN | NO | FALSE | 읽음 여부 |
| read_at | TIMESTAMP | YES | NULL | 읽은 시간 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- INDEX: `(user_id, is_read, created_at DESC)`

### 3.2 notification_settings (알림 설정) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | FK → users.id |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| push_enabled | BOOLEAN | NO | TRUE | 푸시 알림 활성화 |
| attendance_enabled | BOOLEAN | NO | TRUE | 출퇴근 알림 활성화 |
| announcement_enabled | BOOLEAN | NO | TRUE | 공지사항 알림 활성화 |
| chat_enabled | BOOLEAN | NO | TRUE | 채팅 알림 활성화 |
| invitation_enabled | BOOLEAN | NO | TRUE | 초대 알림 활성화 |
| payroll_enabled | BOOLEAN | NO | TRUE | 급여 알림 활성화 |
| checklist_enabled | BOOLEAN | NO | TRUE | 체크리스트 알림 활성화 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- UK: `(user_id, workplace_id)`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### Notification.java (~60줄)

```java
package com.bizone.api.domain.notification.entity;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long workplaceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String body;

    @Column(length = 200)
    private String actionUrl;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, Object> data;

    private boolean isRead;
    private LocalDateTime readAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 비즈니스 메서드
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
```

#### NotificationSetting.java (~40줄)

```java
package com.bizone.api.domain.notification.entity;

@Entity
@Table(name = "notification_settings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "workplace_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long workplaceId;

    private boolean pushEnabled;
    private boolean attendanceEnabled;
    private boolean announcementEnabled;
    private boolean chatEnabled;
    private boolean invitationEnabled;
    private boolean payrollEnabled;
    private boolean checklistEnabled;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드
    public void updateSettings(NotificationSettingRequest request) { }
}
```

### 3.2 Event

#### NotificationEvent.java (~20줄)

```java
package com.bizone.api.domain.notification.event;

@Getter
@RequiredArgsConstructor
public class NotificationEvent {
    private final Long userId;
    private final Long workplaceId;
    private final NotificationType type;
    private final String title;
    private final String body;
    private final String actionUrl;
    private final Map<String, Object> data;
    private final boolean sendPush;
}
```

#### NotificationEventListener.java (~50줄)

```java
package com.bizone.api.domain.notification.event;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingRepository settingRepository;
    private final FcmService fcmService;
    private final UserRepository userRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleNotificationEvent(NotificationEvent event) {
        // 1. 인앱 알림 저장
        Notification notification = Notification.builder()
            .userId(event.getUserId())
            .workplaceId(event.getWorkplaceId())
            .type(event.getType())
            .title(event.getTitle())
            .body(event.getBody())
            .actionUrl(event.getActionUrl())
            .data(event.getData())
            .build();
        notificationRepository.save(notification);

        // 2. 푸시 알림 발송 (설정 확인)
        if (event.isSendPush() && isPushEnabled(event.getUserId(), event.getWorkplaceId(), event.getType())) {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user != null && user.getDeviceToken() != null) {
                fcmService.sendPush(
                    user.getDeviceToken(),
                    event.getTitle(),
                    event.getBody(),
                    event.getData()
                );
            }
        }
    }

    private boolean isPushEnabled(Long userId, Long workplaceId, NotificationType type) {
        return settingRepository.findByUserIdAndWorkplaceId(userId, workplaceId)
            .map(setting -> isTypeEnabled(setting, type))
            .orElse(true); // 기본값: 활성화
    }
}
```

### 3.3 Constant

#### NotificationType.java (~25줄)

```java
package com.bizone.api.domain.notification.constant;

@Getter
@RequiredArgsConstructor
public enum NotificationType {
    // 초대
    INVITATION_RECEIVED("초대", "사업장 초대를 받았습니다"),
    INVITATION_ACCEPTED("초대 수락", "초대가 수락되었습니다"),
    INVITATION_REJECTED("초대 거부", "초대가 거부되었습니다"),
    
    // 출퇴근
    ATTENDANCE_APPROVED("근태 승인", "근태 요청이 승인되었습니다"),
    ATTENDANCE_REJECTED("근태 거부", "근태 요청이 거부되었습니다"),
    
    // 공지사항
    ANNOUNCEMENT_NEW("새 공지", "새 공지사항이 등록되었습니다"),
    
    // 채팅
    CHAT_MESSAGE("새 메시지", "새 메시지가 도착했습니다"),
    
    // 급여
    PAYROLL_PAYDAY("급여 지급일", "오늘은 급여가 지급되는 날입니다"),
    PAYROLL_UNPAID("급여 미지급", "아직 지급되지 않은 급여가 있습니다"),
    
    // 체크리스트
    CHECKLIST_ASSIGNED("체크리스트 할당", "새 체크리스트가 할당되었습니다"),
    
    // 계약서
    CONTRACT_SIGN_REQUEST("서명 요청", "근로계약서 서명이 요청되었습니다"),
    CONTRACT_SIGNED("계약 완료", "근로계약서가 체결되었습니다");

    private final String title;
    private final String description;
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/notifications` | 알림 목록 조회 | 로그인 |
| GET | `/api/v1/notifications/unread-count` | 안 읽은 알림 수 | 로그인 |
| POST | `/api/v1/notifications/{id}/read` | 알림 읽음 처리 | 본인 |
| POST | `/api/v1/notifications/read-all` | 모든 알림 읽음 | 본인 |
| GET | `/api/v1/notifications/settings` | 알림 설정 조회 | 로그인 |
| PUT | `/api/v1/notifications/settings` | 알림 설정 수정 | 로그인 |

---

## 5. 관련 문서

- [인프라 - Firebase (FCM)](./17-infra.md)
- [초대 도메인](./06-invitation.md)
- [채팅 도메인](./13-chat.md)

