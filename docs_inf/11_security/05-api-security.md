# API 보안 (API Security)

## 1. 입력 검증 (Input Validation)

### 1.1 Bean Validation

```java
/**
 * 회원가입 요청 DTO
 */
@Getter
@Setter
public class SignupRequest {
    
    @NotBlank(message = "아이디는 필수입니다.")
    @Size(min = 4, max = 20, message = "아이디는 4-20자 사이여야 합니다.")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "아이디는 영문, 숫자, 언더스코어만 가능합니다.")
    private String username;
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 255, message = "이메일은 255자를 초과할 수 없습니다.")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 100, message = "비밀번호는 8-100자 사이여야 합니다.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다."
    )
    private String password;
    
    @NotBlank(message = "이름은 필수입니다.")
    @Size(min = 2, max = 50, message = "이름은 2-50자 사이여야 합니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z\\s]+$", message = "이름은 한글, 영문만 가능합니다.")
    private String name;
    
    @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 전화번호 형식이 아닙니다.")
    private String phone;
    
    @NotNull(message = "역할은 필수입니다.")
    private Role role;
    
    // 사업주인 경우 사업자등록번호 필수
    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{5}$", message = "올바른 사업자등록번호 형식이 아닙니다.")
    private String businessNumber;
}

/**
 * 사업자등록번호 필수 검증 (사업주인 경우)
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BusinessNumberRequiredValidator.class)
public @interface BusinessNumberRequired {
    String message() default "사업주는 사업자등록번호가 필수입니다.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class BusinessNumberRequiredValidator 
        implements ConstraintValidator<BusinessNumberRequired, SignupRequest> {
    
    @Override
    public boolean isValid(SignupRequest request, ConstraintValidatorContext context) {
        if (request.getRole() == Role.ADMIN) {
            return request.getBusinessNumber() != null && 
                   !request.getBusinessNumber().isBlank();
        }
        return true;
    }
}
```

### 1.2 SQL Injection 방지

```java
/**
 * ❌ 취약한 코드 - SQL Injection 가능
 */
public List<User> findByNameBad(String name) {
    String sql = "SELECT * FROM users WHERE name = '" + name + "'";
    return jdbcTemplate.query(sql, userRowMapper);
}

/**
 * ✅ 안전한 코드 - Prepared Statement
 */
public List<User> findByNameGood(String name) {
    String sql = "SELECT * FROM users WHERE name = ?";
    return jdbcTemplate.query(sql, userRowMapper, name);
}

/**
 * ✅ JPA 사용 (자동으로 Prepared Statement)
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // 안전: JPA가 자동으로 파라미터 바인딩
    List<User> findByName(String name);
    
    // 안전: @Query with named parameter
    @Query("SELECT u FROM User u WHERE u.name = :name")
    List<User> findByNameQuery(@Param("name") String name);
    
    // ❌ 위험: Native Query with 문자열 연결 금지
    // @Query(value = "SELECT * FROM users WHERE name = " + name, nativeQuery = true)
}

/**
 * ✅ QueryDSL 사용 (타입 안전)
 */
public List<User> searchUsers(String name, String email) {
    QUser user = QUser.user;
    
    BooleanBuilder builder = new BooleanBuilder();
    
    if (StringUtils.hasText(name)) {
        builder.and(user.name.containsIgnoreCase(name));
    }
    if (StringUtils.hasText(email)) {
        builder.and(user.email.containsIgnoreCase(email));
    }
    
    return queryFactory
        .selectFrom(user)
        .where(builder)
        .fetch();
}
```

### 1.3 XSS 방지

```java
/**
 * HTML 이스케이프 유틸리티
 */
@Component
public class XssProtectionService {
    
    /**
     * HTML 특수문자 이스케이프
     */
    public String escapeHtml(String input) {
        if (input == null) return null;
        
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
    }
    
    /**
     * 위험한 스크립트 태그 제거
     */
    public String sanitizeHtml(String input) {
        if (input == null) return null;
        
        // 기본적인 스크립트 제거
        return input
            .replaceAll("(?i)<script.*?>.*?</script>", "")
            .replaceAll("(?i)<script.*?/>", "")
            .replaceAll("(?i)javascript:", "")
            .replaceAll("(?i)on\\w+\\s*=", "");
    }
}

/**
 * XSS 필터 적용
 */
@Component
public class XssFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        chain.doFilter(new XssRequestWrapper((HttpServletRequest) request), response);
    }
}

public class XssRequestWrapper extends HttpServletRequestWrapper {
    
    private final XssProtectionService xssProtectionService;
    
    public XssRequestWrapper(HttpServletRequest request) {
        super(request);
        this.xssProtectionService = new XssProtectionService();
    }
    
    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return xssProtectionService.escapeHtml(value);
    }
    
    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values == null) return null;
        
        return Arrays.stream(values)
            .map(xssProtectionService::escapeHtml)
            .toArray(String[]::new);
    }
}
```

---

## 2. Rate Limiting

### 2.1 Bucket4j 설정

```java
@Configuration
public class RateLimitConfig {
    
    @Bean
    public CacheManager<String, GridBucketState> bucket4jCacheManager() {
        return Bucket4jRedisLockFreeBasedProxyManager.builderFor(redisClient)
            .build();
    }
}

@Service
public class RateLimitService {
    
    @Autowired
    private CacheManager<String, GridBucketState> cacheManager;
    
    /**
     * API 엔드포인트별 Rate Limit 설정
     */
    private static final Map<String, Bandwidth> RATE_LIMITS = Map.of(
        // 로그인: 5회/분
        "login", Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))),
        // 회원가입: 3회/시간
        "signup", Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1))),
        // 일반 API: 100회/분
        "default", Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))),
        // 파일 업로드: 10회/분
        "upload", Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)))
    );
    
    /**
     * Rate Limit 확인
     */
    public boolean tryConsume(String userId, String endpoint) {
        String key = "rate_limit:" + userId + ":" + endpoint;
        Bandwidth bandwidth = RATE_LIMITS.getOrDefault(endpoint, RATE_LIMITS.get("default"));
        
        BucketConfiguration configuration = BucketConfiguration.builder()
            .addLimit(bandwidth)
            .build();
        
        ProxyManager<String> proxyManager = cacheManager.proxyManagerForString(
            Bucket4jRedisLockFreeBasedProxyManager.builderFor(redisClient).build()
        );
        
        Bucket bucket = proxyManager.builder()
            .build(key, () -> configuration);
        
        return bucket.tryConsume(1);
    }
    
    /**
     * 남은 요청 횟수 조회
     */
    public long getRemainingRequests(String userId, String endpoint) {
        String key = "rate_limit:" + userId + ":" + endpoint;
        // ...
    }
}
```

### 2.2 Rate Limit Interceptor

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    @Autowired
    private RateLimitService rateLimitService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // 인증된 사용자 ID 또는 IP
        String identifier = getIdentifier(request);
        String endpoint = determineEndpoint(request);
        
        if (!rateLimitService.tryConsume(identifier, endpoint)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"error\":\"RATE_LIMIT_EXCEEDED\",\"message\":\"요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.\"}"
            );
            return false;
        }
        
        // Rate Limit 헤더 추가
        response.setHeader("X-RateLimit-Remaining", 
            String.valueOf(rateLimitService.getRemainingRequests(identifier, endpoint)));
        
        return true;
    }
    
    private String getIdentifier(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            UserPrincipal user = (UserPrincipal) auth.getPrincipal();
            return "user:" + user.getId();
        }
        return "ip:" + getClientIp(request);
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }
    
    private String determineEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        if (path.contains("/auth/login")) return "login";
        if (path.contains("/auth/signup")) return "signup";
        if (path.contains("/upload")) return "upload";
        
        return "default";
    }
}
```

---

## 3. API 보안 헤더

### 3.1 Security Headers 설정

```java
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                // XSS Protection
                .xssProtection(xss -> xss
                    .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                )
                // Content Type Sniffing 방지
                .contentTypeOptions(Customizer.withDefaults())
                // Clickjacking 방지
                .frameOptions(frame -> frame.deny())
                // HSTS (HTTPS 강제)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
                // Content Security Policy
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';")
                )
                // Referrer Policy
                .referrerPolicy(referrer -> referrer
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                // Permissions Policy
                .permissionsPolicy(permissions -> permissions
                    .policy("geolocation=(), microphone=(), camera=()")
                )
            );
        
        return http.build();
    }
}
```

### 3.2 응답 헤더 예시

```http
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cache-Control: no-store
Pragma: no-cache
```

---

## 4. 에러 처리

### 4.1 안전한 에러 응답

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY");
    
    /**
     * 인증 실패
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException e, HttpServletRequest request) {
        
        // 보안 로그 (상세 정보)
        securityLogger.warn("Authentication failed - IP: {}, Path: {}, Message: {}",
            getClientIp(request), request.getRequestURI(), e.getMessage());
        
        // 클라이언트 응답 (일반적인 메시지)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse(
                "AUTHENTICATION_FAILED",
                "인증에 실패했습니다.",  // 구체적인 이유 노출 X
                null
            ));
    }
    
    /**
     * 권한 없음
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException e, HttpServletRequest request) {
        
        securityLogger.warn("Access denied - User: {}, Path: {}",
            getCurrentUserId(), request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse(
                "ACCESS_DENIED",
                "접근 권한이 없습니다.",
                null
            ));
    }
    
    /**
     * 입력 검증 실패
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e) {
        
        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors()
            .stream()
            .map(error -> new FieldError(error.getField(), error.getDefaultMessage()))
            .collect(Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                "VALIDATION_FAILED",
                "입력값이 올바르지 않습니다.",
                fieldErrors
            ));
    }
    
    /**
     * 서버 내부 오류
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception e, HttpServletRequest request) {
        
        // 상세 로그 (내부용)
        logger.error("Internal server error - Path: {}", request.getRequestURI(), e);
        
        // 클라이언트 응답 (스택 트레이스 노출 X)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(
                "INTERNAL_ERROR",
                "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                null
            ));
    }
}

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private Object details;
}
```

---

## 5. API 로깅

### 5.1 요청/응답 로깅

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiLoggingFilter extends OncePerRequestFilter {
    
    private static final Logger apiLogger = LoggerFactory.getLogger("API");
    private static final Set<String> SENSITIVE_HEADERS = Set.of(
        "authorization", "cookie", "x-api-key"
    );
    private static final Set<String> SENSITIVE_PARAMS = Set.of(
        "password", "token", "secret"
    );
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {
        
        ContentCachingRequestWrapper requestWrapper = 
            new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = 
            new ContentCachingResponseWrapper(response);
        
        long startTime = System.currentTimeMillis();
        
        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // 요청 로깅
            String requestLog = buildRequestLog(requestWrapper);
            
            // 응답 로깅
            int status = responseWrapper.getStatus();
            
            // 로그 레벨 결정
            if (status >= 500) {
                apiLogger.error("API {} {}ms {}", requestLog, duration, status);
            } else if (status >= 400) {
                apiLogger.warn("API {} {}ms {}", requestLog, duration, status);
            } else {
                apiLogger.info("API {} {}ms {}", requestLog, duration, status);
            }
            
            responseWrapper.copyBodyToResponse();
        }
    }
    
    private String buildRequestLog(ContentCachingRequestWrapper request) {
        StringBuilder sb = new StringBuilder();
        sb.append(request.getMethod()).append(" ");
        sb.append(request.getRequestURI());
        
        // 쿼리 파라미터 (민감 정보 마스킹)
        String queryString = maskSensitiveParams(request.getQueryString());
        if (queryString != null) {
            sb.append("?").append(queryString);
        }
        
        // 사용자 정보
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            sb.append(" user=").append(((UserPrincipal) auth.getPrincipal()).getId());
        }
        
        // IP
        sb.append(" ip=").append(getClientIp(request));
        
        return sb.toString();
    }
    
    private String maskSensitiveParams(String queryString) {
        if (queryString == null) return null;
        
        for (String param : SENSITIVE_PARAMS) {
            queryString = queryString.replaceAll(
                param + "=[^&]*", 
                param + "=****"
            );
        }
        return queryString;
    }
}
```

### 5.2 보안 이벤트 로깅

```java
@Aspect
@Component
public class SecurityAuditAspect {
    
    private static final Logger securityAudit = LoggerFactory.getLogger("SECURITY_AUDIT");
    
    /**
     * 인증 관련 메서드 로깅
     */
    @AfterReturning(
        pointcut = "execution(* com.bizone.auth.service.AuthService.*(..))",
        returning = "result"
    )
    public void logAuthEvent(JoinPoint joinPoint, Object result) {
        String method = joinPoint.getSignature().getName();
        
        switch (method) {
            case "login":
                logLoginSuccess(joinPoint, result);
                break;
            case "logout":
                logLogout(joinPoint);
                break;
            case "changePassword":
                logPasswordChange(joinPoint);
                break;
        }
    }
    
    @AfterThrowing(
        pointcut = "execution(* com.bizone.auth.service.AuthService.login(..))",
        throwing = "ex"
    )
    public void logLoginFailure(JoinPoint joinPoint, Exception ex) {
        Object[] args = joinPoint.getArgs();
        LoginRequest request = (LoginRequest) args[0];
        
        securityAudit.warn("LOGIN_FAILED username={} reason={}",
            request.getUsername(), 
            ex.getMessage()
        );
    }
    
    private void logLoginSuccess(JoinPoint joinPoint, Object result) {
        AuthResponse response = (AuthResponse) result;
        
        securityAudit.info("LOGIN_SUCCESS userId={}", response.getUserId());
    }
    
    /**
     * 민감한 데이터 접근 로깅
     */
    @Before("@annotation(com.bizone.security.audit.AuditAccess)")
    public void logSensitiveAccess(JoinPoint joinPoint) {
        String method = joinPoint.getSignature().toShortString();
        UUID userId = getCurrentUserId();
        
        securityAudit.info("SENSITIVE_ACCESS user={} method={}", userId, method);
    }
}
```

---

## 6. API 버전 관리

### 6.1 URL 버전 관리

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseV1> getUser(@PathVariable UUID id) {
        // V1 응답 형식
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseV2> getUser(@PathVariable UUID id) {
        // V2 응답 형식 (확장된 필드)
    }
}
```

### 6.2 Deprecation 정책

```java
/**
 * Deprecated API 응답 헤더 추가
 */
@Aspect
@Component
public class DeprecationAspect {
    
    @Around("@annotation(deprecated)")
    public Object addDeprecationHeader(ProceedingJoinPoint joinPoint, Deprecated deprecated) 
            throws Throwable {
        
        HttpServletResponse response = ((ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes()).getResponse();
        
        response.setHeader("Deprecation", "true");
        response.setHeader("Sunset", "2025-06-01");
        response.setHeader("Link", "</api/v2/...>; rel=\"successor-version\"");
        
        return joinPoint.proceed();
    }
}
```

---

## 7. 보안 체크리스트

### 7.1 API 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| 입력 검증 | ✅ | Bean Validation + Custom Validator |
| SQL Injection 방지 | ✅ | Prepared Statement / JPA |
| XSS 방지 | ✅ | 출력 이스케이프 + 필터 |
| Rate Limiting | ✅ | Bucket4j + Redis |
| 보안 헤더 | ✅ | X-Frame-Options, CSP 등 |
| 에러 처리 | ✅ | 스택 트레이스 숨김 |
| 요청 로깅 | ✅ | 민감 정보 마스킹 |
| 보안 이벤트 로깅 | ✅ | 인증/권한 이벤트 |
| API 버전 관리 | ✅ | URL 기반 버전 |
| CORS 설정 | ✅ | 허용 도메인 제한 |

