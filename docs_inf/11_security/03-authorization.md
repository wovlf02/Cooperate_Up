# 인가 및 권한 관리 (Authorization Design)

## 1. 권한 모델

### 1.1 RBAC (Role-Based Access Control)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         권한 계층 구조                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Global Level                                 │    │
│  │  ┌─────────────┐                       ┌─────────────┐          │    │
│  │  │    ADMIN    │                       │  EMPLOYEE   │          │    │
│  │  │  (사업주)   │                       │   (직원)    │          │    │
│  │  └──────┬──────┘                       └──────┬──────┘          │    │
│  └─────────┼─────────────────────────────────────┼──────────────────┘    │
│            │                                     │                       │
│            ▼                                     ▼                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Workplace Level                               │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │                    Member                                │    │    │
│  │  │  - workplaceId                                          │    │    │
│  │  │  - userId                                               │    │    │
│  │  │  - role (admin / employee)                              │    │    │
│  │  │  - permissions []                                       │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 역할 정의

| 역할 | 코드 | 설명 |
|------|------|------|
| 시스템 관리자 | `SYSTEM_ADMIN` | 시스템 전체 관리 (내부 운영용) |
| 사업주 (관리자) | `ADMIN` | 사업장 소유자, 전체 관리 권한 |
| 직원 | `EMPLOYEE` | 일반 근무자, 제한된 권한 |

### 1.3 권한 매트릭스

| 리소스 | 액션 | ADMIN | EMPLOYEE |
|--------|------|:-----:|:--------:|
| **사업장** | 생성 | ✅ | ❌ |
| **사업장** | 수정 | ✅ | ❌ |
| **사업장** | 삭제 | ✅ | ❌ |
| **사업장** | 조회 | ✅ | ✅ |
| **멤버** | 초대 | ✅ | ❌ |
| **멤버** | 관리 | ✅ | ❌ |
| **멤버** | 탈퇴 | ✅ | ✅ (본인) |
| **출퇴근** | 체크 | ✅ | ✅ |
| **출퇴근** | 전체조회 | ✅ | ❌ |
| **출퇴근** | 본인조회 | ✅ | ✅ |
| **출퇴근** | 수정 | ✅ | ❌ |
| **체크리스트** | 생성/수정/삭제 | ✅ | ❌ |
| **체크리스트** | 조회 | ✅ | ✅ |
| **체크리스트** | 완료처리 | ✅ | ✅ |
| **체크리스트** | 모니터링 | ✅ | ❌ |
| **공지사항** | 작성/수정/삭제 | ✅ | ❌ |
| **공지사항** | 조회 | ✅ | ✅ |
| **공지사항** | 댓글작성 | ✅ | ✅ |
| **채팅** | 참여 | ✅ | ✅ |
| **채팅** | 방생성 | ✅ | ❌ |
| **근로계약서** | 작성 | ✅ | ❌ |
| **근로계약서** | 전체조회 | ✅ | ❌ |
| **근로계약서** | 본인조회 | ✅ | ✅ |
| **근로계약서** | 서명 | ❌ | ✅ |
| **급여** | 계산/관리 | ✅ | ❌ |
| **급여** | 전체조회 | ✅ | ❌ |
| **급여** | 본인조회 | ✅ | ✅ |
| **승인요청** | 생성 | ✅ | ✅ |
| **승인요청** | 처리 | ✅ | ❌ |

---

## 2. 구현 상세

### 2.1 권한 Enum

```java
public enum Permission {
    // 사업장
    WORKPLACE_CREATE,
    WORKPLACE_READ,
    WORKPLACE_UPDATE,
    WORKPLACE_DELETE,
    
    // 멤버
    MEMBER_INVITE,
    MEMBER_READ,
    MEMBER_UPDATE,
    MEMBER_DELETE,
    
    // 출퇴근
    ATTENDANCE_CHECK,
    ATTENDANCE_READ_OWN,
    ATTENDANCE_READ_ALL,
    ATTENDANCE_UPDATE,
    ATTENDANCE_APPROVE,
    
    // 체크리스트
    CHECKLIST_CREATE,
    CHECKLIST_READ,
    CHECKLIST_UPDATE,
    CHECKLIST_DELETE,
    CHECKLIST_COMPLETE,
    CHECKLIST_MONITOR,
    
    // 공지사항
    ANNOUNCEMENT_CREATE,
    ANNOUNCEMENT_READ,
    ANNOUNCEMENT_UPDATE,
    ANNOUNCEMENT_DELETE,
    ANNOUNCEMENT_COMMENT,
    
    // 채팅
    CHAT_PARTICIPATE,
    CHAT_CREATE_ROOM,
    
    // 근로계약서
    CONTRACT_CREATE,
    CONTRACT_READ_OWN,
    CONTRACT_READ_ALL,
    CONTRACT_SIGN,
    
    // 급여
    PAYROLL_MANAGE,
    PAYROLL_READ_OWN,
    PAYROLL_READ_ALL,
    
    // 승인
    APPROVAL_CREATE,
    APPROVAL_PROCESS
}

public enum Role {
    ADMIN(Set.of(
        // 모든 권한
        Permission.values()
    )),
    
    EMPLOYEE(Set.of(
        Permission.WORKPLACE_READ,
        Permission.ATTENDANCE_CHECK,
        Permission.ATTENDANCE_READ_OWN,
        Permission.CHECKLIST_READ,
        Permission.CHECKLIST_COMPLETE,
        Permission.ANNOUNCEMENT_READ,
        Permission.ANNOUNCEMENT_COMMENT,
        Permission.CHAT_PARTICIPATE,
        Permission.CONTRACT_READ_OWN,
        Permission.CONTRACT_SIGN,
        Permission.PAYROLL_READ_OWN,
        Permission.APPROVAL_CREATE
    ));
    
    private final Set<Permission> permissions;
    
    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }
    
    public Set<Permission> getPermissions() {
        return permissions;
    }
    
    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }
}
```

### 2.2 Custom Security Annotation

```java
/**
 * 사업장 접근 권한 검증 어노테이션
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@authorizationService.checkWorkplaceAccess(#workplaceId, authentication)")
public @interface WorkplaceAccess {
}

/**
 * 관리자 권한 검증 어노테이션
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@authorizationService.checkAdminRole(#workplaceId, authentication)")
public @interface AdminOnly {
}

/**
 * 특정 권한 검증 어노테이션
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    Permission[] value();
}
```

### 2.3 Authorization Service

```java
@Service
public class AuthorizationService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    /**
     * 사업장 접근 권한 확인
     */
    public boolean checkWorkplaceAccess(UUID workplaceId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        
        return memberRepository.existsByWorkplaceIdAndUserIdAndIsActiveTrue(
            workplaceId, 
            user.getId()
        );
    }
    
    /**
     * 관리자 역할 확인
     */
    public boolean checkAdminRole(UUID workplaceId, Authentication auth) {
        if (!checkWorkplaceAccess(workplaceId, auth)) {
            return false;
        }
        
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        
        return memberRepository.findByWorkplaceIdAndUserId(workplaceId, user.getId())
            .map(member -> member.getRole() == Role.ADMIN)
            .orElse(false);
    }
    
    /**
     * 특정 권한 확인
     */
    public boolean checkPermission(UUID workplaceId, Authentication auth, Permission permission) {
        if (!checkWorkplaceAccess(workplaceId, auth)) {
            return false;
        }
        
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        
        return memberRepository.findByWorkplaceIdAndUserId(workplaceId, user.getId())
            .map(member -> member.getRole().hasPermission(permission))
            .orElse(false);
    }
    
    /**
     * 본인 데이터 접근 확인
     */
    public boolean checkSelfAccess(UUID targetUserId, Authentication auth) {
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        return user.getId().equals(targetUserId);
    }
    
    /**
     * 본인 또는 관리자 접근 확인
     */
    public boolean checkSelfOrAdmin(UUID workplaceId, UUID targetUserId, Authentication auth) {
        return checkSelfAccess(targetUserId, auth) || 
               checkAdminRole(workplaceId, auth);
    }
}
```

### 2.4 Permission Aspect

```java
@Aspect
@Component
public class PermissionAspect {
    
    @Autowired
    private AuthorizationService authorizationService;
    
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) 
            throws Throwable {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // workplaceId 파라미터 추출
        UUID workplaceId = extractWorkplaceId(joinPoint);
        
        // 권한 확인
        for (Permission permission : requirePermission.value()) {
            if (!authorizationService.checkPermission(workplaceId, auth, permission)) {
                throw new AccessDeniedException("권한이 없습니다: " + permission);
            }
        }
        
        return joinPoint.proceed();
    }
    
    private UUID extractWorkplaceId(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        
        for (int i = 0; i < paramNames.length; i++) {
            if ("workplaceId".equals(paramNames[i])) {
                return (UUID) args[i];
            }
        }
        
        // PathVariable에서 추출
        HttpServletRequest request = ((ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes()).getRequest();
        String path = request.getRequestURI();
        // /api/v1/workplaces/{workplaceId}/... 패턴에서 추출
        
        throw new IllegalArgumentException("workplaceId를 찾을 수 없습니다.");
    }
}
```

---

## 3. Controller 적용 예시

### 3.1 사업장 관리 API

```java
@RestController
@RequestMapping("/api/v1/workplaces")
public class WorkplaceController {
    
    /**
     * 사업장 생성 - 사업주만 가능
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkplaceResponse> createWorkplace(
            @Valid @RequestBody WorkplaceCreateRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        // ...
    }
    
    /**
     * 사업장 수정 - 해당 사업장 관리자만 가능
     */
    @PutMapping("/{workplaceId}")
    @AdminOnly
    public ResponseEntity<WorkplaceResponse> updateWorkplace(
            @PathVariable UUID workplaceId,
            @Valid @RequestBody WorkplaceUpdateRequest request) {
        // ...
    }
    
    /**
     * 사업장 조회 - 멤버만 가능
     */
    @GetMapping("/{workplaceId}")
    @WorkplaceAccess
    public ResponseEntity<WorkplaceResponse> getWorkplace(
            @PathVariable UUID workplaceId) {
        // ...
    }
}
```

### 3.2 출퇴근 API

```java
@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/attendance")
public class AttendanceController {
    
    /**
     * 출퇴근 체크 - 본인만 가능
     */
    @PostMapping("/clock-in")
    @WorkplaceAccess
    @RequirePermission(Permission.ATTENDANCE_CHECK)
    public ResponseEntity<AttendanceResponse> clockIn(
            @PathVariable UUID workplaceId,
            @Valid @RequestBody ClockInRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        // 본인 출퇴근만 처리
        return attendanceService.clockIn(workplaceId, user.getId(), request);
    }
    
    /**
     * 전체 출퇴근 조회 - 관리자만 가능
     */
    @GetMapping
    @AdminOnly
    @RequirePermission(Permission.ATTENDANCE_READ_ALL)
    public ResponseEntity<Page<AttendanceResponse>> getAllAttendance(
            @PathVariable UUID workplaceId,
            @RequestParam LocalDate date,
            Pageable pageable) {
        // ...
    }
    
    /**
     * 본인 출퇴근 조회
     */
    @GetMapping("/me")
    @WorkplaceAccess
    @RequirePermission(Permission.ATTENDANCE_READ_OWN)
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            @PathVariable UUID workplaceId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal user) {
        return attendanceService.getByUserAndDateRange(
            workplaceId, user.getId(), startDate, endDate
        );
    }
}
```

### 3.3 급여 API

```java
@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/payrolls")
public class PayrollController {
    
    @Autowired
    private AuthorizationService authorizationService;
    
    /**
     * 급여 상세 조회 - 본인 또는 관리자
     */
    @GetMapping("/{payrollId}")
    @WorkplaceAccess
    public ResponseEntity<PayrollDetailResponse> getPayroll(
            @PathVariable UUID workplaceId,
            @PathVariable UUID payrollId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        Payroll payroll = payrollService.findById(payrollId);
        
        // 본인 것이거나 관리자인 경우만 조회 가능
        if (!authorizationService.checkSelfOrAdmin(
                workplaceId, 
                payroll.getUserId(), 
                SecurityContextHolder.getContext().getAuthentication())) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }
        
        return ResponseEntity.ok(PayrollDetailResponse.from(payroll));
    }
}
```

---

## 4. 멀티테넌트 데이터 격리

### 4.1 Workspace Context

```java
/**
 * 현재 요청의 사업장 컨텍스트 관리
 */
@Component
@RequestScope
public class WorkplaceContext {
    
    private UUID workplaceId;
    private Role memberRole;
    
    public UUID getWorkplaceId() {
        return workplaceId;
    }
    
    public void setWorkplaceId(UUID workplaceId) {
        this.workplaceId = workplaceId;
    }
    
    public Role getMemberRole() {
        return memberRole;
    }
    
    public void setMemberRole(Role memberRole) {
        this.memberRole = memberRole;
    }
    
    public boolean isAdmin() {
        return memberRole == Role.ADMIN;
    }
}
```

### 4.2 Workspace Filter

```java
@Component
public class WorkplaceContextFilter extends OncePerRequestFilter {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private WorkplaceContext workplaceContext;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {
        
        // URL에서 workplaceId 추출
        String path = request.getRequestURI();
        UUID workplaceId = extractWorkplaceId(path);
        
        if (workplaceId != null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null && auth.isAuthenticated()) {
                UserPrincipal user = (UserPrincipal) auth.getPrincipal();
                
                memberRepository.findByWorkplaceIdAndUserId(workplaceId, user.getId())
                    .ifPresent(member -> {
                        workplaceContext.setWorkplaceId(workplaceId);
                        workplaceContext.setMemberRole(member.getRole());
                    });
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private UUID extractWorkplaceId(String path) {
        // /api/v1/workplaces/{uuid}/... 패턴 매칭
        Pattern pattern = Pattern.compile(
            "/api/v1/workplaces/([a-f0-9-]{36})(?:/|$)"
        );
        Matcher matcher = pattern.matcher(path);
        
        if (matcher.find()) {
            return UUID.fromString(matcher.group(1));
        }
        return null;
    }
}
```

### 4.3 Repository 레벨 데이터 격리

```java
/**
 * 사업장별 데이터 격리를 위한 Base Repository
 */
public interface WorkplaceAwareRepository<T, ID> extends JpaRepository<T, ID> {
    
    List<T> findAllByWorkplaceId(UUID workplaceId);
    
    Optional<T> findByIdAndWorkplaceId(ID id, UUID workplaceId);
    
    boolean existsByIdAndWorkplaceId(ID id, UUID workplaceId);
    
    void deleteByIdAndWorkplaceId(ID id, UUID workplaceId);
}

/**
 * 출퇴근 Repository
 */
public interface AttendanceRepository extends WorkplaceAwareRepository<Attendance, UUID> {
    
    // 특정 사업장의 특정 날짜 출퇴근 조회
    List<Attendance> findByWorkplaceIdAndDate(UUID workplaceId, LocalDate date);
    
    // 특정 사업장의 특정 사용자 출퇴근 조회
    List<Attendance> findByWorkplaceIdAndUserIdAndDateBetween(
        UUID workplaceId, 
        UUID userId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    // ❌ 위험: workplaceId 없이 조회 금지
    // List<Attendance> findByUserId(UUID userId);
}
```

---

## 5. Node.js 시그널링 서버 권한 관리

### 5.1 Socket.IO 인증 미들웨어

```javascript
// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    socket.user = {
      id: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      workplaceId: decoded.workplaceId,
    };
    
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};
```

### 5.2 Room 접근 권한 검증

```javascript
// middleware/roomAuthMiddleware.js
export const roomAuthMiddleware = async (socket, roomId, callback) => {
  const { workplaceId } = socket.user;
  
  // Room ID 패턴: workplace:{workplaceId}, chat:{roomId}
  if (roomId.startsWith('workplace:')) {
    const targetWorkplaceId = roomId.split(':')[1];
    
    if (workplaceId !== targetWorkplaceId) {
      return callback(new Error('Unauthorized access to workplace room'));
    }
  }
  
  if (roomId.startsWith('chat:')) {
    const chatRoomId = roomId.split(':')[1];
    
    // Redis에서 참여자 목록 확인
    const participants = await redis.smembers(`chat:${chatRoomId}:participants`);
    
    if (!participants.includes(socket.user.id)) {
      return callback(new Error('Not a participant of this chat room'));
    }
  }
  
  callback(null);
};
```

---

## 6. 보안 체크리스트

### 6.1 인가 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| RBAC 구현 | ✅ | 역할 기반 접근 제어 |
| 사업장별 데이터 격리 | ✅ | workplaceId 기반 분리 |
| API별 권한 검증 | ✅ | PreAuthorize + Custom Annotation |
| 본인 데이터 접근 제어 | ✅ | 본인/관리자만 접근 |
| Repository 레벨 격리 | ✅ | workplaceId 필수 조건 |
| Socket.IO 권한 검증 | ✅ | Room 접근 제어 |
| 권한 상승 방지 | ✅ | 역할 변경 관리자만 |
| IDOR 방지 | ✅ | ID 기반 접근 시 권한 확인 |

