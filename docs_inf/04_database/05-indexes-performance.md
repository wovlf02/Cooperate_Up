# 인덱스 및 성능 최적화

## 1. 인덱스 전략

### 1.1 인덱스 설계 원칙

| 원칙 | 설명 |
|------|------|
| **선택도** | 카디널리티가 높은 컬럼 우선 |
| **복합 인덱스 순서** | WHERE 절 조건 순서대로 |
| **커버링 인덱스** | SELECT 컬럼까지 포함 고려 |
| **쓰기 성능** | 인덱스 과다 생성 지양 |

### 1.2 핵심 쿼리 패턴 분석

| 쿼리 패턴 | 예상 빈도 | 인덱스 전략 |
|----------|----------|------------|
| 사용자 로그인 | 매우 높음 | `username` 단일 인덱스 |
| 사업장별 멤버 조회 | 매우 높음 | `(workplace_id, is_active)` 복합 |
| 사용자별 출퇴근 조회 | 높음 | `(workplace_id, user_id, work_date)` 복합 |
| 날짜별 출퇴근 조회 | 높음 | `(workplace_id, work_date)` 복합 |
| 채팅 메시지 조회 | 높음 | `(chat_room_id, created_at DESC)` 복합 |
| 공지사항 목록 | 중간 | `(workplace_id, is_pinned DESC, created_at DESC)` 복합 |
| 승인 대기 목록 | 중간 | `(workplace_id, status)` 복합 |
| 체크리스트 진행률 | 중간 | `(workplace_id, user_id, completion_date)` 복합 |

---

## 2. 테이블별 인덱스 정의

### 2.1 users 테이블

```sql
-- 기본 키 (자동 생성)
PRIMARY KEY (id)

-- 유니크 인덱스 (로그인, 이메일 인증)
CREATE UNIQUE INDEX uk_users_username ON users(username);
CREATE UNIQUE INDEX uk_users_email ON users(email);

-- 검색용 인덱스
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 사업자 검증 조회용
CREATE INDEX idx_users_business_verified ON users(business_verified, last_business_check_at)
    WHERE role = 'admin';
```

### 2.2 workplaces 테이블

```sql
PRIMARY KEY (id)

-- 유니크 인덱스
CREATE UNIQUE INDEX uk_workplaces_invite_code ON workplaces(invite_code)
    WHERE invite_code IS NOT NULL;

-- 검색용 인덱스
CREATE INDEX idx_workplaces_owner_id ON workplaces(owner_id);
CREATE INDEX idx_workplaces_is_active ON workplaces(is_active);

-- 사업자 재검증용
CREATE INDEX idx_workplaces_business_check ON workplaces(business_verified, business_status)
    WHERE is_active = true;
```

### 2.3 members 테이블

```sql
PRIMARY KEY (id)

-- 유니크 인덱스 (사업장-사용자 조합)
CREATE UNIQUE INDEX uk_members_workplace_user ON members(workplace_id, user_id);

-- 검색용 인덱스
CREATE INDEX idx_members_workplace_active ON members(workplace_id, is_active);
CREATE INDEX idx_members_user_id ON members(user_id);

-- 커버링 인덱스 (멤버 목록 조회 최적화)
CREATE INDEX idx_members_list ON members(workplace_id, is_active, role, hourly_wage);
```

### 2.4 attendance_records 테이블

```sql
PRIMARY KEY (id)

-- 유니크 인덱스 (사업장-사용자-날짜)
CREATE UNIQUE INDEX uk_attendance_unique ON attendance_records(workplace_id, user_id, work_date);

-- 핵심 검색 인덱스
CREATE INDEX idx_attendance_workplace_date ON attendance_records(workplace_id, work_date);
CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, work_date);

-- 상태별 조회
CREATE INDEX idx_attendance_status ON attendance_records(workplace_id, status, work_date);

-- 월별 집계 최적화
CREATE INDEX idx_attendance_monthly ON attendance_records(workplace_id, user_id, work_date, status, work_minutes, daily_wage);
```

### 2.5 task_completions 테이블

```sql
PRIMARY KEY (id)

-- 유니크 인덱스
CREATE UNIQUE INDEX uk_task_completions ON task_completions(workplace_id, user_id, item_id, completion_date);

-- 진행률 조회 최적화
CREATE INDEX idx_task_comp_user_date ON task_completions(workplace_id, user_id, completion_date);
CREATE INDEX idx_task_comp_checklist_date ON task_completions(checklist_id, completion_date);

-- 상태별 필터링
CREATE INDEX idx_task_comp_status ON task_completions(status, completion_date);
```

### 2.6 payrolls 테이블

```sql
PRIMARY KEY (id)

-- 유니크 인덱스
CREATE UNIQUE INDEX uk_payrolls ON payrolls(workplace_id, user_id, pay_year, pay_month);

-- 검색용 인덱스
CREATE INDEX idx_payrolls_workplace_month ON payrolls(workplace_id, pay_year, pay_month);
CREATE INDEX idx_payrolls_status ON payrolls(workplace_id, status);
CREATE INDEX idx_payrolls_paid ON payrolls(workplace_id, is_paid, pay_year, pay_month);
```

### 2.7 announcements 테이블

```sql
PRIMARY KEY (id)

-- 목록 조회 최적화 (고정 공지 우선, 최신순)
CREATE INDEX idx_announcements_list ON announcements(workplace_id, is_pinned DESC, created_at DESC);

-- 작성자별 조회
CREATE INDEX idx_announcements_author ON announcements(author_id);
```

### 2.8 comments 테이블

```sql
PRIMARY KEY (id)

-- 공지별 댓글 조회
CREATE INDEX idx_comments_announcement ON comments(announcement_id, is_deleted, created_at);

-- 대댓글 조회
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### 2.9 chat_rooms 테이블

```sql
PRIMARY KEY (id)

-- 채팅방 목록 (최근 메시지 순)
CREATE INDEX idx_chat_rooms_list ON chat_rooms(workplace_id, last_message_at DESC);
```

### 2.10 messages 테이블

```sql
PRIMARY KEY (id)

-- 메시지 목록 (최신순)
CREATE INDEX idx_messages_room_created ON messages(chat_room_id, created_at DESC);

-- 커버링 인덱스 (목록 조회 최적화)
CREATE INDEX idx_messages_list ON messages(chat_room_id, created_at DESC, sender_id, sender_name, content, message_type);
```

### 2.11 approval_requests 테이블

```sql
PRIMARY KEY (id)

-- 대기 목록 조회
CREATE INDEX idx_approval_pending ON approval_requests(workplace_id, status, created_at DESC);

-- 사용자별 조회
CREATE INDEX idx_approval_user ON approval_requests(user_id, status);
```

---

## 3. 쿼리 최적화

### 3.1 EXPLAIN 분석

```sql
-- 쿼리 실행 계획 분석
EXPLAIN ANALYZE
SELECT ar.*, u.name as user_name
FROM attendance_records ar
JOIN users u ON ar.user_id = u.id
WHERE ar.workplace_id = 1
  AND ar.work_date BETWEEN '2025-12-01' AND '2025-12-31'
ORDER BY ar.work_date DESC;

-- 예상 결과
-- Index Scan using idx_attendance_workplace_date on attendance_records
-- cost=0.42..150.00 rows=30 width=200
```

### 3.2 느린 쿼리 최적화 예시

#### Before (비효율적)

```sql
-- N+1 문제 발생
SELECT * FROM workplaces WHERE owner_id = 1;
-- 각 workplace마다 별도 쿼리
SELECT * FROM members WHERE workplace_id = ?;
SELECT * FROM members WHERE workplace_id = ?;
...
```

#### After (최적화)

```sql
-- JOIN으로 한 번에 조회
SELECT 
    w.id, w.name, w.address,
    m.id as member_id, m.user_id, m.role, m.hourly_wage,
    u.name as member_name, u.phone
FROM workplaces w
LEFT JOIN members m ON w.id = m.workplace_id AND m.is_active = true
LEFT JOIN users u ON m.user_id = u.id
WHERE w.owner_id = 1 AND w.is_active = true
ORDER BY w.id, m.joined_at;
```

### 3.3 페이징 최적화

#### Offset 기반 (단순하지만 대용량에서 느림)

```sql
SELECT * FROM messages
WHERE chat_room_id = 1
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;  -- 1000개 스캔 후 20개 반환
```

#### Cursor 기반 (대용량에서 권장)

```sql
-- 첫 페이지
SELECT * FROM messages
WHERE chat_room_id = 1
ORDER BY created_at DESC
LIMIT 20;

-- 다음 페이지 (이전 마지막 created_at 기준)
SELECT * FROM messages
WHERE chat_room_id = 1
  AND created_at < '2025-12-25 10:00:00'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 4. 캐싱 전략

### 4.1 Redis 캐시 대상

| 데이터 | TTL | 무효화 시점 |
|--------|-----|------------|
| 사용자 세션 | 1시간 | 로그아웃 |
| 사업장 정보 | 5분 | 수정 시 |
| 멤버 목록 | 1분 | 멤버 변경 시 |
| 최저시급 설정 | 1일 | 설정 변경 시 |
| 공지사항 목록 | 30초 | 새 공지 등록 시 |

### 4.2 Spring Cache 설정

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withCacheConfiguration("workspace", 
                config.entryTtl(Duration.ofMinutes(5)))
            .withCacheConfiguration("members", 
                config.entryTtl(Duration.ofMinutes(1)))
            .withCacheConfiguration("minimumWage", 
                config.entryTtl(Duration.ofDays(1)))
            .build();
    }
}
```

### 4.3 캐시 사용 예시

```java
@Service
public class WorkplaceService {
    
    @Cacheable(value = "workspace", key = "#id")
    public WorkplaceDto getWorkplace(Long id) {
        return workplaceMapper.findById(id)
            .map(WorkplaceDto::from)
            .orElseThrow(() -> new NotFoundException("사업장을 찾을 수 없습니다."));
    }
    
    @CacheEvict(value = "workspace", key = "#id")
    public void updateWorkplace(Long id, WorkplaceUpdateRequest request) {
        workplaceMapper.update(id, request);
    }
    
    @Cacheable(value = "members", key = "#workplaceId")
    public List<MemberDto> getMembers(Long workplaceId) {
        return memberMapper.findByWorkplaceId(workplaceId, true);
    }
    
    @CacheEvict(value = "members", key = "#workplaceId")
    public void addMember(Long workplaceId, Long userId) {
        memberMapper.insert(workplaceId, userId);
    }
}
```

---

## 5. 데이터베이스 설정 최적화

### 5.1 H2 Database (개발)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
      max-lifetime: 1200000
```

### 5.2 PostgreSQL (운영)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      idle-timeout: 600000
      connection-timeout: 30000
      max-lifetime: 1800000
      connection-test-query: SELECT 1
```

### 5.3 PostgreSQL 서버 설정 (참고)

```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 4MB
maintenance_work_mem = 64MB
random_page_cost = 1.1
effective_io_concurrency = 200

# 로깅
log_min_duration_statement = 1000  # 1초 이상 쿼리 로깅
```

---

## 6. 모니터링

### 6.1 느린 쿼리 로깅

```yaml
# application.yml
logging:
  level:
    org.mybatis: DEBUG
    jdbc.sqltiming: DEBUG
    jdbc.resultsettable: INFO
```

### 6.2 쿼리 성능 메트릭

```java
@Aspect
@Component
public class QueryPerformanceAspect {
    
    private static final Logger log = LoggerFactory.getLogger("QUERY_PERFORMANCE");
    
    @Around("execution(* com.bizone.domain.*.mapper.*.*(..))")
    public Object measureQueryTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long duration = System.currentTimeMillis() - start;
            if (duration > 100) {  // 100ms 이상 쿼리 로깅
                log.warn("Slow query: {} took {}ms", 
                    joinPoint.getSignature().toShortString(), duration);
            }
        }
    }
}
```

---

## 7. 대용량 데이터 처리

### 7.1 배치 처리

```java
@Service
public class PayrollBatchService {
    
    private static final int BATCH_SIZE = 100;
    
    @Transactional
    public void calculateMonthlyPayrolls(Long workplaceId, int year, int month) {
        List<Member> members = memberMapper.findByWorkplaceId(workplaceId, true);
        
        List<Payroll> payrolls = new ArrayList<>();
        for (Member member : members) {
            Payroll payroll = calculatePayroll(workplaceId, member.getUserId(), year, month);
            payrolls.add(payroll);
            
            if (payrolls.size() >= BATCH_SIZE) {
                payrollMapper.insertBatch(payrolls);
                payrolls.clear();
            }
        }
        
        if (!payrolls.isEmpty()) {
            payrollMapper.insertBatch(payrolls);
        }
    }
}
```

### 7.2 스트림 처리 (대용량 조회)

```java
@Mapper
public interface AttendanceMapper {
    
    // ResultHandler를 사용한 스트림 처리
    void findAllByWorkplaceStream(@Param("workplaceId") Long workplaceId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   ResultHandler<AttendanceRecord> handler);
}

// 사용 예시
attendanceMapper.findAllByWorkplaceStream(workplaceId, startDate, endDate, 
    context -> {
        AttendanceRecord record = (AttendanceRecord) context.getResultObject();
        processRecord(record);  // 메모리 효율적 처리
    });
```

---

## 8. 테이블 파티셔닝 (PostgreSQL)

대용량 운영 시 고려할 수 있는 파티셔닝 전략입니다.

### 8.1 출퇴근 기록 파티셔닝

```sql
-- 월별 파티션
CREATE TABLE attendance_records (
    id BIGSERIAL,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    -- ... 기타 컬럼
    PRIMARY KEY (id, work_date)
) PARTITION BY RANGE (work_date);

-- 파티션 생성
CREATE TABLE attendance_records_2025_01 
    PARTITION OF attendance_records
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE attendance_records_2025_02 
    PARTITION OF attendance_records
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ...
```

### 8.2 메시지 파티셔닝

```sql
-- 월별 파티션
CREATE TABLE messages (
    id BIGSERIAL,
    chat_room_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    -- ... 기타 컬럼
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
```

---

## 9. 성능 체크리스트

| 항목 | 상태 | 비고 |
|------|:----:|------|
| 핵심 쿼리 인덱스 생성 | ⬜ | |
| N+1 문제 해결 | ⬜ | JOIN 사용 |
| 페이징 최적화 | ⬜ | Cursor 기반 |
| 캐시 적용 | ⬜ | Redis |
| 커넥션 풀 설정 | ⬜ | HikariCP |
| 느린 쿼리 모니터링 | ⬜ | 100ms 기준 |
| 배치 처리 적용 | ⬜ | 대량 INSERT |
| EXPLAIN 분석 | ⬜ | 핵심 쿼리 |

