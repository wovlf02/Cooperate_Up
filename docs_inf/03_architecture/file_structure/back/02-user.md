# 사용자 도메인 (User Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.user`

## 1. 개요

사용자 도메인은 사용자 정보 관리, 프로필 관리, 사업자 정보 관리를 담당합니다.

### 1.1 주요 기능

- 사용자 정보 CRUD
- 프로필 조회/수정
- 사업자 정보 관리 (관리자)
- 사업자 상태 재검증
- 디바이스 토큰 관리

---

## 2. 패키지 구조

```
domain/user/
├── controller/
│   └── UserController.java              # 사용자 API 컨트롤러 (~50줄)
│
├── service/
│   ├── UserService.java                 # 서비스 인터페이스 (~30줄)
│   └── impl/
│       └── UserServiceImpl.java         # 서비스 구현체 (~150줄)
│
├── repository/
│   ├── UserRepository.java              # JPA Repository (~30줄)
│   └── UserQueryRepository.java         # QueryDSL Repository (~50줄)
│
├── entity/
│   └── User.java                        # 사용자 엔티티 (~120줄)
│
├── dto/
│   ├── request/
│   │   ├── UserUpdateRequest.java       # 프로필 수정 요청 (~25줄)
│   │   ├── DeviceTokenRequest.java      # 디바이스 토큰 등록 (~15줄)
│   │   └── BusinessVerifyRequest.java   # 사업자 검증 요청 (~20줄)
│   │
│   └── response/
│       ├── UserResponse.java            # 사용자 기본 응답 (~30줄)
│       ├── UserDetailResponse.java      # 사용자 상세 응답 (~40줄)
│       └── BusinessInfoResponse.java    # 사업자 정보 응답 (~25줄)
│
├── mapper/
│   └── UserMapper.java                  # Entity-DTO 매퍼 (~40줄)
│
└── constant/
    ├── UserRole.java                    # 사용자 역할 enum (~10줄)
    └── BusinessStatus.java              # 사업자 상태 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 users 테이블

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

---

## 4. 상세 파일 구조

### 4.1 Entity

#### User.java (~120줄)

```java
package com.bizone.api.domain.user.entity;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    private LocalDate birthDate;

    @Column(length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    // 사업자 정보 (관리자 전용)
    @Column(length = 20)
    private String businessNumber;

    @Column(length = 100)
    private String businessOwnerName;

    @Column(length = 100)
    private String businessType;

    private LocalDate businessOpenDate;

    private boolean businessVerified;

    private LocalDateTime businessVerifiedAt;

    private LocalDateTime lastBusinessCheckAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BusinessStatus businessStatus;

    // 디바이스 정보
    @Column(length = 500)
    private String deviceToken;

    @Column(length = 10)
    private String devicePlatform;

    // 현재 선택된 사업장
    private Long currentWorkplaceId;

    private boolean isActive;

    // 비즈니스 메서드
    public void updateProfile(String name, String phone, LocalDate birthDate) { }
    public void updateProfileImage(String imageUrl) { }
    public void updateDeviceToken(String token, String platform) { }
    public void setBusinessInfo(BusinessInfo info) { }
    public void verifyBusiness() { }
    public void deactivate() { }
}
```

### 3.2 Controller

#### UserController.java (~50줄)

```java
package com.bizone.api.domain.user.controller;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 관리 API")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회")
    public ApiResponse<UserDetailResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) { }

    @PutMapping("/me")
    @Operation(summary = "프로필 수정")
    public ApiResponse<UserResponse> updateProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UserUpdateRequest request) { }

    @PutMapping("/me/profile-image")
    @Operation(summary = "프로필 이미지 수정")
    public ApiResponse<UserResponse> updateProfileImage(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("file") MultipartFile file) { }

    @PutMapping("/me/device-token")
    @Operation(summary = "디바이스 토큰 등록")
    public ApiResponse<Void> updateDeviceToken(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody DeviceTokenRequest request) { }

    @GetMapping("/me/business")
    @Operation(summary = "내 사업자 정보 조회")
    public ApiResponse<BusinessInfoResponse> getMyBusinessInfo(
        @AuthenticationPrincipal UserPrincipal principal) { }

    @GetMapping("/{userId}")
    @Operation(summary = "사용자 정보 조회 (관리자)")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> getUser(@PathVariable Long userId) { }
}
```

### 3.3 Service

#### UserService.java (~30줄)

```java
package com.bizone.api.domain.user.service;

public interface UserService {
    UserDetailResponse getMyProfile(Long userId);
    UserResponse updateProfile(Long userId, UserUpdateRequest request);
    UserResponse updateProfileImage(Long userId, MultipartFile file);
    void updateDeviceToken(Long userId, DeviceTokenRequest request);
    BusinessInfoResponse getMyBusinessInfo(Long userId);
    UserResponse getUser(Long userId);
    User findById(Long userId);
    User findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

#### UserServiceImpl.java (~150줄)

```java
package com.bizone.api.domain.user.service.impl;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileService fileService;

    @Override
    public UserDetailResponse getMyProfile(Long userId) {
        User user = findById(userId);
        return userMapper.toDetailResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = findById(userId);
        user.updateProfile(request.name(), request.phone(), request.birthDate());
        return userMapper.toResponse(user);
    }

    // ... 기타 메서드 구현
}
```

### 3.4 Repository

#### UserRepository.java (~30줄)

```java
package com.bizone.api.domain.user.repository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByBusinessVerifiedTrueAndLastBusinessCheckAtBefore(LocalDateTime checkDate);
}
```

#### UserQueryRepository.java (~50줄)

```java
package com.bizone.api.domain.user.repository;

@Repository
@RequiredArgsConstructor
public class UserQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<User> findUsersNeedingBusinessRevalidation(LocalDateTime cutoffDate) {
        return queryFactory
            .selectFrom(user)
            .where(
                user.role.eq(UserRole.ADMIN),
                user.businessVerified.isTrue(),
                user.lastBusinessCheckAt.lt(cutoffDate)
            )
            .fetch();
    }
}
```

### 3.5 DTO

#### request/UserUpdateRequest.java (~25줄)

```java
package com.bizone.api.domain.user.dto.request;

public record UserUpdateRequest(
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 100, message = "이름은 100자 이하여야 합니다")
    String name,

    @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 전화번호 형식이 아닙니다")
    String phone,

    @Past(message = "생년월일은 과거 날짜여야 합니다")
    LocalDate birthDate
) {}
```

#### response/UserResponse.java (~30줄)

```java
package com.bizone.api.domain.user.dto.response;

public record UserResponse(
    Long id,
    String username,
    String email,
    String name,
    String phone,
    LocalDate birthDate,
    String profileImageUrl,
    UserRole role,
    boolean isBusinessOwner,
    Long currentWorkplaceId
) {}
```

### 3.6 Mapper

#### UserMapper.java (~40줄)

```java
package com.bizone.api.domain.user.mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

    UserDetailResponse toDetailResponse(User user);

    BusinessInfoResponse toBusinessInfoResponse(User user);

    @Mapping(target = "isBusinessOwner", expression = "java(user.getRole() == UserRole.ADMIN)")
    UserResponse toResponseWithBusinessFlag(User user);
}
```

### 3.7 Constant (Enum)

#### UserRole.java (~10줄)

```java
package com.bizone.api.domain.user.constant;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ADMIN("관리자"),
    EMPLOYEE("직원");

    private final String description;
}
```

#### BusinessStatus.java (~10줄)

```java
package com.bizone.api.domain.user.constant;

@Getter
@RequiredArgsConstructor
public enum BusinessStatus {
    ACTIVE("계속사업자"),
    SUSPENDED("휴업"),
    CLOSED("폐업");

    private final String description;
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/users/me` | 내 정보 조회 | 로그인 |
| PUT | `/api/v1/users/me` | 프로필 수정 | 로그인 |
| PUT | `/api/v1/users/me/profile-image` | 프로필 이미지 수정 | 로그인 |
| PUT | `/api/v1/users/me/device-token` | 디바이스 토큰 등록 | 로그인 |
| GET | `/api/v1/users/me/business` | 내 사업자 정보 조회 | 관리자 |
| GET | `/api/v1/users/{userId}` | 사용자 정보 조회 | 관리자 |

---

## 5. 관련 도메인

- **auth**: 회원가입, 로그인 시 User 생성/조회
- **workplace**: 사업장 소유자 정보
- **member**: 사업장 멤버십
- **notification**: 푸시 알림 발송 (deviceToken 사용)

---

## 6. 관련 문서

- [인증 도메인](./03-auth.md)
- [엔티티 스키마 - users](../../04_database/02-entity-schema.md)

