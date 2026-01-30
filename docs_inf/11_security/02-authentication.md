# 인증 설계 (Authentication Design)

## 1. 인증 아키텍처

### 1.1 JWT 기반 인증 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JWT Authentication Flow                        │
│                                                                          │
│  ┌─────────────┐                              ┌─────────────────────┐   │
│  │   Client    │                              │    Spring Boot      │   │
│  │   (App)     │                              │      Server         │   │
│  └──────┬──────┘                              └──────────┬──────────┘   │
│         │                                                │              │
│         │  1. POST /api/v1/auth/login                   │              │
│         │     { username, password }                     │              │
│         │ ─────────────────────────────────────────────> │              │
│         │                                                │              │
│         │                                     ┌──────────┴──────────┐   │
│         │                                     │  2. Verify Password │   │
│         │                                     │     (BCrypt)        │   │
│         │                                     └──────────┬──────────┘   │
│         │                                                │              │
│         │                                     ┌──────────┴──────────┐   │
│         │                                     │  3. Generate Tokens │   │
│         │                                     │  - Access (1h)      │   │
│         │                                     │  - Refresh (7d)     │   │
│         │                                     └──────────┬──────────┘   │
│         │                                                │              │
│         │                                     ┌──────────┴──────────┐   │
│         │                                     │  4. Store Refresh   │   │
│         │                                     │     in Redis        │   │
│         │                                     └──────────┬──────────┘   │
│         │                                                │              │
│         │  5. Response: { accessToken, refreshToken }    │              │
│         │ <───────────────────────────────────────────── │              │
│         │                                                │              │
│  ┌──────┴──────┐                                        │              │
│  │ 6. Store in │                                        │              │
│  │   Keychain  │                                        │              │
│  └─────────────┘                                        │              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 토큰 구조

#### Access Token (JWT)

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",                    // 사용자 ID
    "username": "john_doe",                // 사용자명
    "role": "admin",                       // 역할 (admin/employee)
    "workplaceId": "workplace-uuid",       // 현재 선택된 사업장 (선택적)
    "iat": 1703520000,                     // 발급 시간
    "exp": 1703523600,                     // 만료 시간 (1시간 후)
    "jti": "unique-token-id"               // 토큰 고유 ID
  },
  "signature": "..."
}
```

#### Refresh Token

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "type": "refresh",
    "iat": 1703520000,
    "exp": 1704124800,                     // 만료 시간 (7일 후)
    "jti": "refresh-token-id"
  },
  "signature": "..."
}
```

---

## 2. 구현 상세

### 2.1 비밀번호 정책

```java
/**
 * 비밀번호 정책
 * - 최소 8자 이상
 * - 영문 대문자 1개 이상
 * - 영문 소문자 1개 이상
 * - 숫자 1개 이상
 * - 특수문자 1개 이상 (!@#$%^&*(),.?":{}|<>)
 */
public class PasswordPolicy {
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    
    public boolean validate(String password) {
        return password != null && 
               password.matches(PASSWORD_PATTERN);
    }
}
```

### 2.2 비밀번호 해시

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt with strength 12 (권장: 10-12)
        return new BCryptPasswordEncoder(12);
    }
}

@Service
public class AuthService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public void createUser(SignupRequest request) {
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        // 저장
    }
    
    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
```

### 2.3 JWT 토큰 생성/검증

```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.access-expiration}")
    private long accessExpiration;  // 3600000 (1시간)
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration; // 604800000 (7일)
    
    private SecretKey key;
    
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode(jwtSecret)
        );
    }
    
    /**
     * Access Token 생성
     */
    public String generateAccessToken(User user, UUID workplaceId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessExpiration);
        
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("username", user.getUsername())
            .claim("role", user.getRole().name())
            .claim("workplaceId", workplaceId != null ? workplaceId.toString() : null)
            .setId(UUID.randomUUID().toString())
            .setIssuedAt(now)
            .setExpiration(expiry)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpiration);
        
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("type", "refresh")
            .setId(UUID.randomUUID().toString())
            .setIssuedAt(now)
            .setExpiration(expiry)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * 토큰 검증
     */
    public Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        } catch (ExpiredJwtException e) {
            throw new TokenExpiredException("토큰이 만료되었습니다.");
        } catch (JwtException e) {
            throw new InvalidTokenException("유효하지 않은 토큰입니다.");
        }
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return UUID.fromString(claims.getSubject());
    }
}
```

### 2.4 Redis Refresh Token 관리

```java
@Service
public class RefreshTokenService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String USER_TOKENS_PREFIX = "user_tokens:";
    
    /**
     * Refresh Token 저장
     * - Key: refresh_token:{tokenId}
     * - Value: userId
     * - TTL: 7일
     */
    public void saveRefreshToken(String tokenId, UUID userId, long expirationMs) {
        String key = REFRESH_TOKEN_PREFIX + tokenId;
        redisTemplate.opsForValue().set(
            key, 
            userId.toString(),
            expirationMs, 
            TimeUnit.MILLISECONDS
        );
        
        // 사용자별 토큰 목록 관리 (다중 디바이스 지원)
        String userTokensKey = USER_TOKENS_PREFIX + userId.toString();
        redisTemplate.opsForSet().add(userTokensKey, tokenId);
        redisTemplate.expire(userTokensKey, expirationMs, TimeUnit.MILLISECONDS);
    }
    
    /**
     * Refresh Token 검증
     */
    public UUID validateRefreshToken(String tokenId) {
        String key = REFRESH_TOKEN_PREFIX + tokenId;
        String userId = redisTemplate.opsForValue().get(key);
        
        if (userId == null) {
            throw new InvalidTokenException("유효하지 않은 Refresh Token입니다.");
        }
        
        return UUID.fromString(userId);
    }
    
    /**
     * Refresh Token 삭제 (로그아웃)
     */
    public void deleteRefreshToken(String tokenId, UUID userId) {
        String key = REFRESH_TOKEN_PREFIX + tokenId;
        redisTemplate.delete(key);
        
        String userTokensKey = USER_TOKENS_PREFIX + userId.toString();
        redisTemplate.opsForSet().remove(userTokensKey, tokenId);
    }
    
    /**
     * 사용자의 모든 Refresh Token 삭제 (모든 디바이스 로그아웃)
     */
    public void deleteAllUserTokens(UUID userId) {
        String userTokensKey = USER_TOKENS_PREFIX + userId.toString();
        Set<String> tokenIds = redisTemplate.opsForSet().members(userTokensKey);
        
        if (tokenIds != null) {
            for (String tokenId : tokenIds) {
                redisTemplate.delete(REFRESH_TOKEN_PREFIX + tokenId);
            }
        }
        redisTemplate.delete(userTokensKey);
    }
}
```

---

## 3. Spring Security 설정

### 3.1 Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (JWT 사용으로 불필요)
            .csrf(csrf -> csrf.disable())
            
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 관리 (Stateless)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 예외 처리
            .exceptionHandling(exception -> 
                exception.authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            
            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요 (Public)
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // 인증 필요
                .requestMatchers("/api/v1/**").authenticated()
                
                // 나머지 거부
                .anyRequest().denyAll()
            )
            
            // JWT 필터 추가
            .addFilterBefore(
                jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "https://api.bizone.com",
            "https://dev.api.bizone.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3.2 JWT Authentication Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            String token = extractToken(request);
            
            if (token != null) {
                Claims claims = jwtTokenProvider.validateToken(token);
                UUID userId = UUID.fromString(claims.getSubject());
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(
                    userId.toString()
                );
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                
                // 추가 정보 설정
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                // 사업장 ID 컨텍스트에 저장
                String workplaceId = claims.get("workplaceId", String.class);
                if (workplaceId != null) {
                    request.setAttribute("workplaceId", UUID.fromString(workplaceId));
                }
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (TokenExpiredException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"error\":\"TOKEN_EXPIRED\",\"message\":\"토큰이 만료되었습니다.\"}"
            );
            return;
        } catch (Exception e) {
            logger.error("JWT 인증 실패", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/actuator/") ||
               path.startsWith("/swagger-ui/") ||
               path.startsWith("/v3/api-docs/");
    }
}
```

---

## 4. 인증 API

### 4.1 회원가입

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        // 1. 아이디 중복 체크
        // 2. 이메일 중복 체크
        // 3. 비밀번호 정책 검증
        // 4. 사업주인 경우 사업자등록번호 검증
        // 5. 비밀번호 해시
        // 6. 사용자 생성
        // 7. 토큰 발급
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // 1. 사용자 조회
        // 2. 비밀번호 검증
        // 3. 로그인 시도 횟수 체크 (Brute Force 방지)
        // 4. 토큰 발급
        // 5. Refresh Token Redis 저장
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        // 1. Refresh Token 검증 (JWT)
        // 2. Redis에서 토큰 유효성 확인
        // 3. 새 Access Token 발급
        // 4. (선택적) Refresh Token 회전
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        // 1. Refresh Token Redis에서 삭제
        // 2. (선택적) Access Token 블랙리스트 추가
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(@AuthenticationPrincipal UserPrincipal user) {
        // 모든 디바이스에서 로그아웃
        refreshTokenService.deleteAllUserTokens(user.getId());
        return ResponseEntity.noContent().build();
    }
}
```

---

## 5. 보안 강화 기능

### 5.1 로그인 시도 제한 (Brute Force 방지)

```java
@Service
public class LoginAttemptService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final String LOGIN_ATTEMPT_PREFIX = "login_attempt:";
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 30;
    
    /**
     * 로그인 실패 기록
     */
    public void recordFailedAttempt(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        Long attempts = redisTemplate.opsForValue().increment(key);
        
        if (attempts == 1) {
            redisTemplate.expire(key, LOCK_DURATION_MINUTES, TimeUnit.MINUTES);
        }
    }
    
    /**
     * 계정 잠금 여부 확인
     */
    public boolean isLocked(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        String attempts = redisTemplate.opsForValue().get(key);
        
        return attempts != null && Integer.parseInt(attempts) >= MAX_ATTEMPTS;
    }
    
    /**
     * 로그인 성공 시 시도 횟수 초기화
     */
    public void resetAttempts(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        redisTemplate.delete(key);
    }
    
    /**
     * 남은 잠금 시간 조회
     */
    public long getRemainingLockTime(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null ? ttl : 0;
    }
}
```

### 5.2 비밀번호 변경 이력 관리

```java
@Entity
@Table(name = "password_history")
public class PasswordHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

@Service
public class PasswordHistoryService {
    
    private static final int HISTORY_COUNT = 5;
    
    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 최근 사용한 비밀번호인지 확인
     */
    public boolean isRecentlyUsed(UUID userId, String newPassword) {
        List<PasswordHistory> history = passwordHistoryRepository
            .findTop5ByUserIdOrderByCreatedAtDesc(userId);
        
        for (PasswordHistory h : history) {
            if (passwordEncoder.matches(newPassword, h.getPasswordHash())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 비밀번호 이력 저장
     */
    public void saveHistory(UUID userId, String passwordHash) {
        PasswordHistory history = new PasswordHistory();
        history.setUserId(userId);
        history.setPasswordHash(passwordHash);
        history.setCreatedAt(LocalDateTime.now());
        
        passwordHistoryRepository.save(history);
        
        // 오래된 이력 삭제
        passwordHistoryRepository.deleteOldHistory(userId, HISTORY_COUNT);
    }
}
```

### 5.3 Refresh Token 회전 (Rotation)

```java
@Service
public class TokenRotationService {
    
    /**
     * Refresh Token 회전
     * - 새로운 Refresh Token 발급
     * - 이전 토큰 즉시 폐기
     * - 토큰 재사용 탐지
     */
    public TokenPair rotateRefreshToken(String oldRefreshToken) {
        // 1. 기존 토큰 검증
        Claims claims = jwtTokenProvider.validateToken(oldRefreshToken);
        String tokenId = claims.getId();
        UUID userId = UUID.fromString(claims.getSubject());
        
        // 2. Redis에서 토큰 확인
        if (!refreshTokenService.exists(tokenId)) {
            // 토큰 재사용 탐지 - 보안 위협으로 간주
            // 해당 사용자의 모든 토큰 무효화
            refreshTokenService.deleteAllUserTokens(userId);
            throw new SecurityException("토큰 재사용 탐지. 모든 세션이 종료되었습니다.");
        }
        
        // 3. 기존 토큰 삭제
        refreshTokenService.deleteRefreshToken(tokenId, userId);
        
        // 4. 새 토큰 발급
        User user = userRepository.findById(userId).orElseThrow();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user, null);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // 5. 새 Refresh Token 저장
        Claims newClaims = jwtTokenProvider.validateToken(newRefreshToken);
        refreshTokenService.saveRefreshToken(
            newClaims.getId(), 
            userId, 
            refreshExpiration
        );
        
        return new TokenPair(newAccessToken, newRefreshToken);
    }
}
```

---

## 6. 클라이언트 (React Native) 인증 처리

### 6.1 토큰 저장 (Keychain)

```javascript
// services/auth/tokenStorage.js
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'bizone_access_token';
const REFRESH_TOKEN_KEY = 'bizone_refresh_token';

export const TokenStorage = {
  /**
   * 토큰 저장
   */
  async saveTokens(accessToken, refreshToken) {
    await Keychain.setGenericPassword(
      ACCESS_TOKEN_KEY,
      JSON.stringify({ accessToken, refreshToken }),
      {
        service: 'com.bizone.app',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    );
  },

  /**
   * 토큰 조회
   */
  async getTokens() {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.bizone.app',
    });
    
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  },

  /**
   * 토큰 삭제
   */
  async clearTokens() {
    await Keychain.resetGenericPassword({
      service: 'com.bizone.app',
    });
  },
};
```

### 6.2 API 인터셉터 (자동 토큰 갱신)

```javascript
// services/api/axiosInstance.js
import axios from 'axios';
import { TokenStorage } from '../auth/tokenStorage';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 토큰 첨부
api.interceptors.request.use(
  async (config) => {
    const tokens = await TokenStorage.getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러 & 재시도 아님 & refresh 요청 아님
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      
      try {
        const tokens = await TokenStorage.getTokens();
        
        // Refresh Token으로 새 Access Token 발급
        const response = await axios.post(
          `${process.env.API_BASE_URL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );
        
        const { accessToken, refreshToken } = response.data;
        
        // 새 토큰 저장
        await TokenStorage.saveTokens(accessToken, refreshToken);
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh 실패 - 로그아웃 처리
        await TokenStorage.clearTokens();
        // 로그인 화면으로 이동
        throw refreshError;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 7. 보안 체크리스트

### 7.1 인증 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| 비밀번호 해시 | ✅ | BCrypt (strength 12) |
| 비밀번호 정책 | ✅ | 8자 이상, 대/소/숫자/특수문자 |
| JWT 서명 | ✅ | HS512 알고리즘 |
| Access Token 만료 | ✅ | 1시간 |
| Refresh Token 만료 | ✅ | 7일 |
| Refresh Token 저장 | ✅ | Redis (서버 측 검증) |
| 토큰 회전 | ✅ | Refresh 시 새 토큰 발급 |
| 로그인 시도 제한 | ✅ | 5회 실패 시 30분 잠금 |
| 비밀번호 이력 | ✅ | 최근 5개 재사용 금지 |
| 토큰 블랙리스트 | ⚠️ | 필요 시 구현 |
| 다중 디바이스 관리 | ✅ | 사용자별 토큰 목록 관리 |
| 전체 로그아웃 | ✅ | 모든 디바이스 로그아웃 |

