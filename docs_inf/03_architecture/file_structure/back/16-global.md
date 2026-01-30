# 전역 설정 (Global)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.global`

## 1. 개요

전역 패키지는 프로젝트 전체에서 사용되는 설정, 공통 컴포넌트, 예외 처리 등을 포함합니다.

---

## 2. 패키지 구조

```
global/
├── config/                                  # 설정 클래스
│   ├── SecurityConfig.java                  # Spring Security 설정 (~80줄)
│   ├── WebConfig.java                       # Web MVC 설정 (~40줄)
│   ├── WebSocketConfig.java                 # WebSocket 설정 (~50줄)
│   ├── CacheConfig.java                     # 캐시 설정 (~35줄)
│   ├── AsyncConfig.java                     # 비동기 처리 설정 (~30줄)
│   ├── OpenApiConfig.java                   # Swagger/OpenAPI 설정 (~45줄)
│   ├── JpaConfig.java                       # JPA 설정 (~25줄)
│   └── QuerydslConfig.java                  # QueryDSL 설정 (~20줄)
│
├── exception/                               # 전역 예외 처리
│   ├── GlobalExceptionHandler.java          # 전역 예외 핸들러 (~80줄)
│   ├── BusinessException.java               # 비즈니스 예외 기본 클래스 (~30줄)
│   ├── ErrorCode.java                       # 에러 코드 인터페이스 (~15줄)
│   └── ErrorResponse.java                   # 에러 응답 DTO (~25줄)
│
├── response/                                # 공통 응답 객체
│   ├── ApiResponse.java                     # 공통 API 응답 (~40줄)
│   └── PageResponse.java                    # 페이징 응답 (~30줄)
│
├── security/                                # 보안 관련
│   ├── jwt/
│   │   ├── JwtTokenProvider.java            # JWT 토큰 생성/검증 (~100줄)
│   │   ├── JwtAuthenticationFilter.java     # JWT 인증 필터 (~60줄)
│   │   └── JwtProperties.java               # JWT 설정 프로퍼티 (~20줄)
│   │
│   ├── UserPrincipal.java                   # 인증 사용자 정보 (~35줄)
│   ├── UserDetailsServiceImpl.java          # UserDetailsService 구현 (~40줄)
│   └── AuthChecker.java                     # 권한 체크 유틸 (~50줄)
│
├── util/                                    # 공통 유틸리티
│   ├── DateTimeUtils.java                   # 날짜/시간 유틸 (~40줄)
│   └── StringUtils.java                     # 문자열 유틸 (~30줄)
│
├── validator/                               # 커스텀 검증기
│   ├── PhoneNumber.java                     # 전화번호 검증 어노테이션 (~15줄)
│   └── PhoneNumberValidator.java            # 전화번호 검증기 (~20줄)
│
├── aspect/                                  # AOP
│   └── LoggingAspect.java                   # 로깅 AOP (~50줄)
│
└── entity/                                  # 공통 엔티티
    └── BaseTimeEntity.java                  # 생성/수정 시간 (~25줄)
```

---

## 3. 상세 파일 구조

### 3.1 Config

#### SecurityConfig.java (~80줄)

```java
package com.bizone.api.global.config;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/signup/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // H2 Console (개발 환경)
                .requestMatchers("/h2-console/**").permitAll()
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
            )
            .build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

#### WebSocketConfig.java (~50줄)

```java
package com.bizone.api.global.config;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                // JWT 토큰 검증
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");
                    // 토큰 검증 로직
                }
                return message;
            }
        });
    }
}
```

### 3.2 Exception

#### GlobalExceptionHandler.java (~80줄)

```java
package com.bizone.api.global.exception;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("BusinessException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(e.getErrorCode());
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("ValidationException: {}", e.getMessage());
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        ErrorResponse response = ErrorResponse.of("VALIDATION_ERROR", message);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("AccessDeniedException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of("ACCESS_DENIED", "접근 권한이 없습니다.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected error: ", e);
        ErrorResponse response = ErrorResponse.of("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다.");
        return ResponseEntity.internalServerError().body(response);
    }
}
```

#### BusinessException.java (~30줄)

```java
package com.bizone.api.global.exception;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String detail;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.detail = null;
    }

    public BusinessException(ErrorCode errorCode, String detail) {
        super(errorCode.getMessage() + " - " + detail);
        this.errorCode = errorCode;
        this.detail = detail;
    }
}
```

### 3.3 Response

#### ApiResponse.java (~40줄)

```java
package com.bizone.api.global.response;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final LocalDateTime timestamp;

    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

### 3.4 Security

#### JwtTokenProvider.java (~100줄)

```java
package com.bizone.api.global.security.jwt;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    @PostConstruct
    protected void init() {
        // 키 초기화
    }

    public String createAccessToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiry());

        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .claim("username", user.getUsername())
            .claim("role", user.getRole().name())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }

    public String createRefreshToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getRefreshTokenExpiry());

        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return Long.parseLong(claims.getSubject());
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

#### UserPrincipal.java (~35줄)

```java
package com.bizone.api.global.security;

@Getter
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final UserRole role;
    private final boolean isActive;

    public static UserPrincipal from(User user) {
        return new UserPrincipal(
            user.getId(),
            user.getUsername(),
            user.getPasswordHash(),
            user.getRole(),
            user.isActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return isActive; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return isActive; }
}
```

### 3.5 Entity

#### BaseTimeEntity.java (~25줄)

```java
package com.bizone.api.global.entity;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

---

## 4. 관련 문서

- [인프라 (외부 연동)](./17-infra.md)
- [인증 도메인](./03-auth.md)

