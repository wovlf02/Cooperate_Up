# 인증 도메인 (Auth Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.auth`

## 1. 개요

인증 도메인은 회원가입, 로그인, 로그아웃, 토큰 관리, 비밀번호 재설정 등 인증/인가 관련 기능을 담당합니다.

### 1.1 주요 기능

- 회원가입 (직원/관리자)
- 로그인/로그아웃
- JWT 토큰 발급/갱신/검증
- 이메일 인증
- 비밀번호 재설정
- 아이디 중복 확인
- 사업자 진위확인 (관리자)

---

## 2. 패키지 구조

```
domain/auth/
├── controller/
│   └── AuthController.java                  # 인증 API 컨트롤러 (~80줄)
│
├── service/
│   ├── AuthService.java                     # 서비스 인터페이스 (~40줄)
│   └── impl/
│       └── AuthServiceImpl.java             # 서비스 구현체 (~200줄)
│
├── repository/
│   ├── RefreshTokenRepository.java          # 리프레시 토큰 Repository (~20줄)
│   ├── EmailVerificationRepository.java     # 이메일 인증 Repository (~15줄)
│   └── PasswordResetRepository.java         # 비밀번호 재설정 Repository (~15줄)
│
├── entity/
│   ├── RefreshToken.java                    # 리프레시 토큰 엔티티 (~40줄)
│   ├── EmailVerification.java               # 이메일 인증 엔티티 (~35줄)
│   └── PasswordReset.java                   # 비밀번호 재설정 엔티티 (~35줄)
│
├── dto/
│   ├── request/
│   │   ├── SignUpRequest.java               # 회원가입 요청 (직원) (~40줄)
│   │   ├── AdminSignUpRequest.java          # 회원가입 요청 (관리자) (~55줄)
│   │   ├── LoginRequest.java                # 로그인 요청 (~20줄)
│   │   ├── TokenRefreshRequest.java         # 토큰 갱신 요청 (~10줄)
│   │   ├── EmailVerifyRequest.java          # 이메일 인증 요청 (~15줄)
│   │   ├── PasswordResetRequest.java        # 비밀번호 재설정 요청 (~15줄)
│   │   ├── PasswordResetConfirmRequest.java # 비밀번호 재설정 확인 (~20줄)
│   │   └── UsernameCheckRequest.java        # 아이디 중복확인 요청 (~10줄)
│   │
│   └── response/
│       ├── TokenResponse.java               # 토큰 응답 (~20줄)
│       ├── SignUpResponse.java              # 회원가입 응답 (~20줄)
│       ├── LoginResponse.java               # 로그인 응답 (~25줄)
│       └── UsernameCheckResponse.java       # 아이디 중복확인 응답 (~10줄)
│
├── mapper/
│   └── AuthMapper.java                      # Entity-DTO 매퍼 (~30줄)
│
└── exception/
    ├── AuthException.java                   # 인증 예외 (~15줄)
    └── AuthErrorCode.java                   # 인증 에러 코드 (~25줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 refresh_tokens 테이블

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

### 3.2 email_verifications 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| email | VARCHAR(255) | NO | - | 인증 대상 이메일 |
| verification_code | VARCHAR(6) | NO | - | 6자리 인증 코드 |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| verified | BOOLEAN | NO | FALSE | 인증 완료 여부 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- INDEX: `email`, `expires_at`

### 3.3 password_resets 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | FK → users.id |
| email | VARCHAR(255) | NO | - | 이메일 |
| reset_code | VARCHAR(6) | NO | - | 6자리 재설정 코드 |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| used | BOOLEAN | NO | FALSE | 사용 여부 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- INDEX: `email`, `expires_at`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### RefreshToken.java (~40줄)

```java
package com.bizone.api.domain.auth.entity;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String tokenHash;

    @Column(length = 200)
    private String deviceInfo;

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public RefreshToken(Long userId, String tokenHash, String deviceInfo, 
                        String ipAddress, LocalDateTime expiresAt) { }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

#### EmailVerification.java (~35줄)

```java
package com.bizone.api.domain.auth.entity;

@Entity
@Table(name = "email_verifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String verificationCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean verified;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public EmailVerification(String email, String verificationCode, LocalDateTime expiresAt) { }

    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
    public void verify() { this.verified = true; }
}
```

#### PasswordReset.java (~35줄)

```java
package com.bizone.api.domain.auth.entity;

@Entity
@Table(name = "password_resets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordReset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String resetCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean used;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
    public void markAsUsed() { this.used = true; }
}
```

### 3.2 Controller

#### AuthController.java (~80줄)

```java
package com.bizone.api.domain.auth.controller;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "인증 API")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "회원가입 (직원)")
    public ApiResponse<SignUpResponse> signUp(@Valid @RequestBody SignUpRequest request) { }

    @PostMapping("/signup/admin")
    @Operation(summary = "회원가입 (관리자)")
    public ApiResponse<SignUpResponse> signUpAdmin(@Valid @RequestBody AdminSignUpRequest request) { }

    @PostMapping("/login")
    @Operation(summary = "로그인")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) { }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    public ApiResponse<Void> logout(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestHeader("Authorization") String token) { }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신")
    public ApiResponse<TokenResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) { }

    @GetMapping("/check-username")
    @Operation(summary = "아이디 중복확인")
    public ApiResponse<UsernameCheckResponse> checkUsername(@RequestParam String username) { }

    @PostMapping("/email/send")
    @Operation(summary = "이메일 인증코드 발송")
    public ApiResponse<Void> sendEmailVerification(@Valid @RequestBody EmailVerifyRequest request) { }

    @PostMapping("/email/verify")
    @Operation(summary = "이메일 인증코드 확인")
    public ApiResponse<Void> verifyEmail(
        @RequestParam String email,
        @RequestParam String code) { }

    @PostMapping("/password/reset")
    @Operation(summary = "비밀번호 재설정 요청")
    public ApiResponse<Void> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) { }

    @PostMapping("/password/reset/verify")
    @Operation(summary = "비밀번호 재설정 코드 확인")
    public ApiResponse<Void> verifyResetCode(
        @RequestParam String email,
        @RequestParam String code) { }

    @PostMapping("/password/reset/confirm")
    @Operation(summary = "비밀번호 재설정 완료")
    public ApiResponse<Void> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) { }

    @PostMapping("/business/verify")
    @Operation(summary = "사업자 진위확인")
    public ApiResponse<BusinessVerifyResponse> verifyBusiness(@Valid @RequestBody BusinessVerifyRequest request) { }
}
```

### 3.3 Service

#### AuthService.java (~40줄)

```java
package com.bizone.api.domain.auth.service;

public interface AuthService {
    SignUpResponse signUp(SignUpRequest request);
    SignUpResponse signUpAdmin(AdminSignUpRequest request);
    LoginResponse login(LoginRequest request);
    void logout(Long userId, String token);
    TokenResponse refreshToken(TokenRefreshRequest request);
    UsernameCheckResponse checkUsername(String username);
    void sendEmailVerification(String email);
    void verifyEmail(String email, String code);
    void requestPasswordReset(PasswordResetRequest request);
    void verifyResetCode(String email, String code);
    void confirmPasswordReset(PasswordResetConfirmRequest request);
    BusinessVerifyResponse verifyBusiness(BusinessVerifyRequest request);
}
```

#### AuthServiceImpl.java (~200줄)

```java
package com.bizone.api.domain.auth.service.impl;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MailService mailService;
    private final BusinessVerificationClient businessVerificationClient;
    private final AuthMapper authMapper;

    @Override
    @Transactional
    public SignUpResponse signUp(SignUpRequest request) {
        validateSignUpRequest(request);
        User user = createUser(request);
        return authMapper.toSignUpResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new AuthException(AuthErrorCode.INVALID_CREDENTIALS));
        
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException(AuthErrorCode.INVALID_CREDENTIALS);
        }
        
        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshToken = jwtTokenProvider.createRefreshToken(user);
        saveRefreshToken(user.getId(), refreshToken, request.deviceInfo());
        
        return new LoginResponse(accessToken, refreshToken, authMapper.toUserResponse(user));
    }

    // ... 기타 메서드 구현
}
```

### 3.4 DTO

#### request/SignUpRequest.java (~40줄)

```java
package com.bizone.api.domain.auth.dto.request;

public record SignUpRequest(
    @NotBlank(message = "아이디는 필수입니다")
    @Size(min = 4, max = 50, message = "아이디는 4~50자여야 합니다")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "아이디는 영문, 숫자, 밑줄만 사용 가능합니다")
    String username,

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 100, message = "비밀번호는 8자 이상이어야 합니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$",
             message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다")
    String password,

    @NotBlank(message = "비밀번호 확인은 필수입니다")
    String passwordConfirm,

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 100, message = "이름은 100자 이하여야 합니다")
    String name,

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    String email,

    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 전화번호 형식이 아닙니다")
    String phone,

    @NotNull(message = "생년월일은 필수입니다")
    @Past(message = "생년월일은 과거 날짜여야 합니다")
    LocalDate birthDate,

    String profileImageUrl
) {
    public void validatePasswordMatch() {
        if (!password.equals(passwordConfirm)) {
            throw new AuthException(AuthErrorCode.PASSWORD_MISMATCH);
        }
    }
}
```

#### request/AdminSignUpRequest.java (~55줄)

```java
package com.bizone.api.domain.auth.dto.request;

public record AdminSignUpRequest(
    // 기본 회원가입 필드
    @NotBlank String username,
    @NotBlank @Size(min = 8) String password,
    @NotBlank String passwordConfirm,
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank String phone,
    @NotNull @Past LocalDate birthDate,
    String profileImageUrl,

    // 사업자 정보 (관리자 전용)
    @NotBlank(message = "사업자등록번호는 필수입니다")
    @Pattern(regexp = "^[0-9]{10}$", message = "사업자등록번호는 10자리 숫자입니다")
    String businessNumber,

    @NotBlank(message = "대표자명은 필수입니다")
    String businessOwnerName,

    @NotNull(message = "개업일은 필수입니다")
    @PastOrPresent(message = "개업일은 과거 또는 현재 날짜여야 합니다")
    LocalDate businessOpenDate
) {}
```

#### response/LoginResponse.java (~25줄)

```java
package com.bizone.api.domain.auth.dto.response;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    Long expiresIn,
    String tokenType,
    UserResponse user
) {
    public LoginResponse(String accessToken, String refreshToken, UserResponse user) {
        this(accessToken, refreshToken, 3600L, "Bearer", user);
    }
}
```

### 3.5 Exception

#### AuthErrorCode.java (~25줄)

```java
package com.bizone.api.domain.auth.exception;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode {
    INVALID_CREDENTIALS("AUTH001", "아이디 또는 비밀번호가 일치하지 않습니다", HttpStatus.UNAUTHORIZED),
    PASSWORD_MISMATCH("AUTH002", "비밀번호가 일치하지 않습니다", HttpStatus.BAD_REQUEST),
    USERNAME_DUPLICATED("AUTH003", "이미 사용 중인 아이디입니다", HttpStatus.CONFLICT),
    EMAIL_DUPLICATED("AUTH004", "이미 사용 중인 이메일입니다", HttpStatus.CONFLICT),
    EMAIL_NOT_VERIFIED("AUTH005", "이메일 인증이 필요합니다", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN("AUTH006", "유효하지 않은 토큰입니다", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH007", "만료된 토큰입니다", HttpStatus.UNAUTHORIZED),
    VERIFICATION_CODE_EXPIRED("AUTH008", "인증코드가 만료되었습니다", HttpStatus.BAD_REQUEST),
    VERIFICATION_CODE_INVALID("AUTH009", "인증코드가 일치하지 않습니다", HttpStatus.BAD_REQUEST),
    BUSINESS_VERIFICATION_FAILED("AUTH010", "사업자 인증에 실패했습니다", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/auth/signup` | 회원가입 (직원) | 없음 |
| POST | `/api/v1/auth/signup/admin` | 회원가입 (관리자) | 없음 |
| POST | `/api/v1/auth/login` | 로그인 | 없음 |
| POST | `/api/v1/auth/logout` | 로그아웃 | 로그인 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 | 없음 |
| GET | `/api/v1/auth/check-username` | 아이디 중복확인 | 없음 |
| POST | `/api/v1/auth/email/send` | 이메일 인증코드 발송 | 없음 |
| POST | `/api/v1/auth/email/verify` | 이메일 인증코드 확인 | 없음 |
| POST | `/api/v1/auth/password/reset` | 비밀번호 재설정 요청 | 없음 |
| POST | `/api/v1/auth/password/reset/verify` | 비밀번호 재설정 코드 확인 | 없음 |
| POST | `/api/v1/auth/password/reset/confirm` | 비밀번호 재설정 완료 | 없음 |
| POST | `/api/v1/auth/business/verify` | 사업자 진위확인 | 없음 |

---

## 5. 관련 도메인

- **user**: 사용자 엔티티 생성/조회
- **infra/mail**: 이메일 발송
- **infra/external**: 사업자 진위확인 API

---

## 6. 관련 문서

- [사용자 도메인](./02-user.md)
- [보안 설정 (global)](./16-global.md)
- [외부 API 연동 (infra)](./17-infra.md)

