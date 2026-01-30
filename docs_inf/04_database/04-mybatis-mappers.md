# MyBatis Mapper 설계

## 1. 개요

Spring Boot + MyBatis 환경에서 사용할 Mapper XML 및 인터페이스 설계입니다.

### 1.1 프로젝트 구조

```
src/main/
├── java/com/bizone/
│   ├── domain/
│   │   ├── user/
│   │   │   ├── entity/User.java
│   │   │   ├── mapper/UserMapper.java
│   │   │   └── dto/
│   │   ├── workplace/
│   │   │   ├── entity/Workplace.java
│   │   │   ├── mapper/WorkplaceMapper.java
│   │   │   └── dto/
│   │   └── ...
│   └── config/
│       └── MyBatisConfig.java
└── resources/
    └── mapper/
        ├── UserMapper.xml
        ├── WorkplaceMapper.xml
        └── ...
```

### 1.2 MyBatis 설정

```yaml
# application.yml
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.bizone.domain
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30
    cache-enabled: true
```

```java
// MyBatisConfig.java
@Configuration
@MapperScan("com.bizone.domain.*.mapper")
public class MyBatisConfig {
    
    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return configuration -> {
            configuration.setMapUnderscoreToCamelCase(true);
            configuration.setDefaultFetchSize(100);
            configuration.setLazyLoadingEnabled(true);
        };
    }
}
```

---

## 2. 사용자 도메인 Mapper

### 2.1 UserMapper.java

```java
package com.bizone.domain.user.mapper;

import com.bizone.domain.user.entity.User;
import com.bizone.domain.user.dto.*;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    
    // ========== 기본 CRUD ==========
    
    /**
     * 사용자 등록
     */
    int insert(User user);
    
    /**
     * ID로 조회
     */
    Optional<User> findById(Long id);
    
    /**
     * 사용자명으로 조회
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 이메일로 조회
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 사용자 정보 수정
     */
    int update(User user);
    
    /**
     * 사용자 삭제 (비활성화)
     */
    int deactivate(Long id);
    
    // ========== 비즈니스 쿼리 ==========
    
    /**
     * 사용자명 중복 체크
     */
    boolean existsByUsername(String username);
    
    /**
     * 이메일 중복 체크
     */
    boolean existsByEmail(String email);
    
    /**
     * 디바이스 토큰 업데이트
     */
    int updateDeviceToken(@Param("id") Long id, 
                          @Param("token") String token, 
                          @Param("platform") String platform);
    
    /**
     * 현재 사업장 변경
     */
    int updateCurrentWorkplace(@Param("id") Long id, 
                               @Param("workplaceId") Long workplaceId);
    
    /**
     * 비밀번호 변경
     */
    int updatePassword(@Param("id") Long id, 
                       @Param("passwordHash") String passwordHash);
    
    /**
     * 이메일 인증 완료
     */
    int verifyEmail(Long id);
    
    /**
     * 사업자 인증 완료
     */
    int verifyBusiness(@Param("id") Long id, 
                       @Param("businessNumber") String businessNumber,
                       @Param("businessOwnerName") String businessOwnerName,
                       @Param("businessType") String businessType);
}
```

### 2.2 UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.bizone.domain.user.mapper.UserMapper">
    
    <!-- ResultMap 정의 -->
    <resultMap id="UserResultMap" type="com.bizone.domain.user.entity.User">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="email" column="email"/>
        <result property="emailVerified" column="email_verified"/>
        <result property="passwordHash" column="password_hash"/>
        <result property="name" column="name"/>
        <result property="phone" column="phone"/>
        <result property="birthDate" column="birth_date"/>
        <result property="profileImageUrl" column="profile_image_url"/>
        <result property="role" column="role"/>
        <result property="businessNumber" column="business_number"/>
        <result property="businessOwnerName" column="business_owner_name"/>
        <result property="businessType" column="business_type"/>
        <result property="businessOpenDate" column="business_open_date"/>
        <result property="businessVerified" column="business_verified"/>
        <result property="businessVerifiedAt" column="business_verified_at"/>
        <result property="lastBusinessCheckAt" column="last_business_check_at"/>
        <result property="businessStatus" column="business_status"/>
        <result property="deviceToken" column="device_token"/>
        <result property="devicePlatform" column="device_platform"/>
        <result property="currentWorkplaceId" column="current_workplace_id"/>
        <result property="isActive" column="is_active"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>
    
    <!-- 공통 컬럼 -->
    <sql id="userColumns">
        id, username, email, email_verified, password_hash, name, phone, birth_date,
        profile_image_url, role, business_number, business_owner_name, business_type,
        business_open_date, business_verified, business_verified_at, last_business_check_at,
        business_status, device_token, device_platform, current_workplace_id,
        is_active, created_at, updated_at
    </sql>
    
    <!-- INSERT -->
    <insert id="insert" parameterType="User" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO users (
            username, email, email_verified, password_hash, name, phone, birth_date,
            profile_image_url, role, business_number, business_owner_name, business_type,
            business_open_date, business_verified, device_token, device_platform,
            is_active, created_at, updated_at
        ) VALUES (
            #{username}, #{email}, #{emailVerified}, #{passwordHash}, #{name}, #{phone}, #{birthDate},
            #{profileImageUrl}, #{role}, #{businessNumber}, #{businessOwnerName}, #{businessType},
            #{businessOpenDate}, #{businessVerified}, #{deviceToken}, #{devicePlatform},
            #{isActive}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>
    
    <!-- SELECT BY ID -->
    <select id="findById" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users
        WHERE id = #{id} AND is_active = true
    </select>
    
    <!-- SELECT BY USERNAME -->
    <select id="findByUsername" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users
        WHERE username = #{username} AND is_active = true
    </select>
    
    <!-- SELECT BY EMAIL -->
    <select id="findByEmail" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users
        WHERE email = #{email} AND is_active = true
    </select>
    
    <!-- UPDATE -->
    <update id="update" parameterType="User">
        UPDATE users
        SET
            name = #{name},
            phone = #{phone},
            birth_date = #{birthDate},
            profile_image_url = #{profileImageUrl},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- DEACTIVATE -->
    <update id="deactivate">
        UPDATE users
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- EXISTS BY USERNAME -->
    <select id="existsByUsername" resultType="boolean">
        SELECT EXISTS(SELECT 1 FROM users WHERE username = #{username})
    </select>
    
    <!-- EXISTS BY EMAIL -->
    <select id="existsByEmail" resultType="boolean">
        SELECT EXISTS(SELECT 1 FROM users WHERE email = #{email})
    </select>
    
    <!-- UPDATE DEVICE TOKEN -->
    <update id="updateDeviceToken">
        UPDATE users
        SET device_token = #{token}, device_platform = #{platform}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- UPDATE CURRENT WORKPLACE -->
    <update id="updateCurrentWorkplace">
        UPDATE users
        SET current_workplace_id = #{workplaceId}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- UPDATE PASSWORD -->
    <update id="updatePassword">
        UPDATE users
        SET password_hash = #{passwordHash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- VERIFY EMAIL -->
    <update id="verifyEmail">
        UPDATE users
        SET email_verified = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- VERIFY BUSINESS -->
    <update id="verifyBusiness">
        UPDATE users
        SET 
            business_verified = true,
            business_verified_at = CURRENT_TIMESTAMP,
            business_number = #{businessNumber},
            business_owner_name = #{businessOwnerName},
            business_type = #{businessType},
            business_status = 'active',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
</mapper>
```

---

## 3. 사업장 도메인 Mapper

### 3.1 WorkplaceMapper.java

```java
package com.bizone.domain.workplace.mapper;

import com.bizone.domain.workplace.entity.Workplace;
import com.bizone.domain.workplace.dto.*;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

@Mapper
public interface WorkplaceMapper {
    
    // ========== 기본 CRUD ==========
    
    int insert(Workplace workplace);
    
    Optional<Workplace> findById(Long id);
    
    int update(Workplace workplace);
    
    int deactivate(Long id);
    
    // ========== 비즈니스 쿼리 ==========
    
    /**
     * 사용자가 소속된 사업장 목록
     */
    List<WorkplaceListDto> findByUserId(Long userId);
    
    /**
     * 사업주가 소유한 사업장 목록
     */
    List<Workplace> findByOwnerId(Long ownerId);
    
    /**
     * 초대 코드로 조회
     */
    Optional<Workplace> findByInviteCode(String inviteCode);
    
    /**
     * 초대 코드 생성
     */
    int updateInviteCode(@Param("id") Long id, @Param("inviteCode") String inviteCode);
    
    /**
     * GPS 좌표 업데이트
     */
    int updateLocation(@Param("id") Long id, 
                       @Param("latitude") Double latitude, 
                       @Param("longitude") Double longitude,
                       @Param("source") String source);
    
    /**
     * 사업자 정보 업데이트
     */
    int updateBusinessInfo(@Param("id") Long id, 
                           @Param("businessNumber") String businessNumber,
                           @Param("businessOwnerName") String businessOwnerName,
                           @Param("businessType") String businessType);
}
```

### 3.2 MemberMapper.java

```java
package com.bizone.domain.workplace.mapper;

import com.bizone.domain.workplace.entity.Member;
import com.bizone.domain.workplace.dto.*;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {
    
    int insert(Member member);
    
    Optional<Member> findById(Long id);
    
    /**
     * 사업장 + 사용자로 멤버 조회
     */
    Optional<Member> findByWorkplaceAndUser(@Param("workplaceId") Long workplaceId, 
                                             @Param("userId") Long userId);
    
    /**
     * 사업장의 모든 멤버 조회
     */
    List<MemberListDto> findByWorkplaceId(@Param("workplaceId") Long workplaceId,
                                          @Param("activeOnly") boolean activeOnly);
    
    /**
     * 사용자의 모든 멤버십 조회
     */
    List<Member> findByUserId(Long userId);
    
    /**
     * 멤버십 존재 여부 확인
     */
    boolean existsByWorkplaceAndUser(@Param("workplaceId") Long workplaceId, 
                                      @Param("userId") Long userId);
    
    /**
     * 시급 업데이트
     */
    int updateHourlyWage(@Param("id") Long id, @Param("hourlyWage") Integer hourlyWage);
    
    /**
     * 개별 스케줄 업데이트
     */
    int updateCustomSchedule(@Param("id") Long id,
                             @Param("useCustom") boolean useCustom,
                             @Param("startTime") String startTime,
                             @Param("endTime") String endTime,
                             @Param("scheduleConfig") String scheduleConfig);
    
    /**
     * 멤버십 비활성화
     */
    int deactivate(Long id);
    
    /**
     * 사업장 멤버 수 조회
     */
    int countByWorkplaceId(@Param("workplaceId") Long workplaceId, 
                           @Param("activeOnly") boolean activeOnly);
}
```

---

## 4. 출퇴근 도메인 Mapper

### 4.1 AttendanceMapper.java

```java
package com.bizone.domain.attendance.mapper;

import com.bizone.domain.attendance.entity.AttendanceRecord;
import com.bizone.domain.attendance.dto.*;
import org.apache.ibatis.annotations.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface AttendanceMapper {
    
    int insert(AttendanceRecord record);
    
    Optional<AttendanceRecord> findById(Long id);
    
    int update(AttendanceRecord record);
    
    /**
     * 특정 날짜 출퇴근 조회
     */
    Optional<AttendanceRecord> findByUserAndDate(@Param("workplaceId") Long workplaceId,
                                                  @Param("userId") Long userId,
                                                  @Param("date") LocalDate date);
    
    /**
     * 사업장의 특정 날짜 출퇴근 목록
     */
    List<AttendanceListDto> findByWorkplaceAndDate(@Param("workplaceId") Long workplaceId,
                                                    @Param("date") LocalDate date);
    
    /**
     * 사용자의 기간별 출퇴근 목록
     */
    List<AttendanceRecord> findByUserAndDateRange(@Param("workplaceId") Long workplaceId,
                                                   @Param("userId") Long userId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    /**
     * 월별 출퇴근 집계
     */
    AttendanceMonthSummaryDto getMonthSummary(@Param("workplaceId") Long workplaceId,
                                              @Param("userId") Long userId,
                                              @Param("year") int year,
                                              @Param("month") int month);
    
    /**
     * 출근 처리
     */
    int clockIn(@Param("id") Long id,
                @Param("clockIn") String clockIn,
                @Param("effectiveClockIn") String effectiveClockIn,
                @Param("lat") Double lat,
                @Param("lng") Double lng,
                @Param("isEarly") boolean isEarly);
    
    /**
     * 퇴근 처리
     */
    int clockOut(@Param("id") Long id,
                 @Param("clockOut") String clockOut,
                 @Param("effectiveClockOut") String effectiveClockOut,
                 @Param("lat") Double lat,
                 @Param("lng") Double lng,
                 @Param("workMinutes") int workMinutes,
                 @Param("dailyWage") int dailyWage);
    
    /**
     * 상태 변경
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    
    /**
     * 체크리스트 완료 상태 변경
     */
    int updateChecklistCompleted(@Param("id") Long id, @Param("completed") boolean completed);
    
    /**
     * 현재 근무 중인 직원 수
     */
    int countWorkingNow(@Param("workplaceId") Long workplaceId, @Param("date") LocalDate date);
}
```

### 4.2 AttendanceMapper.xml (핵심 쿼리만)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.bizone.domain.attendance.mapper.AttendanceMapper">
    
    <resultMap id="AttendanceResultMap" type="com.bizone.domain.attendance.entity.AttendanceRecord">
        <id property="id" column="id"/>
        <result property="workplaceId" column="workplace_id"/>
        <result property="userId" column="user_id"/>
        <result property="userName" column="user_name"/>
        <result property="workDate" column="work_date"/>
        <result property="clockIn" column="clock_in"/>
        <result property="clockOut" column="clock_out"/>
        <result property="effectiveClockIn" column="effective_clock_in"/>
        <result property="effectiveClockOut" column="effective_clock_out"/>
        <result property="clockInLat" column="clock_in_lat"/>
        <result property="clockInLng" column="clock_in_lng"/>
        <result property="clockOutLat" column="clock_out_lat"/>
        <result property="clockOutLng" column="clock_out_lng"/>
        <result property="workMinutes" column="work_minutes"/>
        <result property="hourlyWage" column="hourly_wage"/>
        <result property="dailyWage" column="daily_wage"/>
        <result property="status" column="status"/>
        <result property="isManualInput" column="is_manual_input"/>
        <result property="isEarlyClockIn" column="is_early_clock_in"/>
        <result property="checklistCompleted" column="checklist_completed"/>
        <result property="note" column="note"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>
    
    <!-- 월별 집계 쿼리 -->
    <select id="getMonthSummary" resultType="com.bizone.domain.attendance.dto.AttendanceMonthSummaryDto">
        SELECT 
            COUNT(*) as totalWorkDays,
            COALESCE(SUM(work_minutes), 0) as totalWorkMinutes,
            COALESCE(SUM(daily_wage), 0) as totalWage,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedDays,
            COUNT(CASE WHEN is_early_clock_in = true THEN 1 END) as earlyClockInDays
        FROM attendance_records
        WHERE workplace_id = #{workplaceId}
          AND user_id = #{userId}
          AND YEAR(work_date) = #{year}
          AND MONTH(work_date) = #{month}
          AND status IN ('completed', 'approved')
    </select>
    
    <!-- 출근 처리 -->
    <update id="clockIn">
        UPDATE attendance_records
        SET 
            clock_in = #{clockIn},
            effective_clock_in = #{effectiveClockIn},
            clock_in_lat = #{lat},
            clock_in_lng = #{lng},
            is_early_clock_in = #{isEarly},
            status = 'working',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- 퇴근 처리 -->
    <update id="clockOut">
        UPDATE attendance_records
        SET 
            clock_out = #{clockOut},
            effective_clock_out = #{effectiveClockOut},
            clock_out_lat = #{lat},
            clock_out_lng = #{lng},
            work_minutes = #{workMinutes},
            daily_wage = #{dailyWage},
            status = 'completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
    
    <!-- 현재 근무 중인 직원 수 -->
    <select id="countWorkingNow" resultType="int">
        SELECT COUNT(*)
        FROM attendance_records
        WHERE workplace_id = #{workplaceId}
          AND work_date = #{date}
          AND status = 'working'
    </select>
    
</mapper>
```

---

## 5. 급여 도메인 Mapper

### 5.1 PayrollMapper.java

```java
package com.bizone.domain.payroll.mapper;

import com.bizone.domain.payroll.entity.Payroll;
import com.bizone.domain.payroll.dto.*;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PayrollMapper {
    
    int insert(Payroll payroll);
    
    Optional<Payroll> findById(Long id);
    
    int update(Payroll payroll);
    
    /**
     * 사용자의 특정 월 급여 조회
     */
    Optional<Payroll> findByUserAndMonth(@Param("workplaceId") Long workplaceId,
                                          @Param("userId") Long userId,
                                          @Param("year") int year,
                                          @Param("month") int month);
    
    /**
     * 사업장의 특정 월 급여 목록
     */
    List<PayrollListDto> findByWorkplaceAndMonth(@Param("workplaceId") Long workplaceId,
                                                  @Param("year") int year,
                                                  @Param("month") int month);
    
    /**
     * 사용자의 급여 이력
     */
    List<Payroll> findByUserId(@Param("workplaceId") Long workplaceId,
                               @Param("userId") Long userId,
                               @Param("limit") int limit);
    
    /**
     * 상태별 급여 목록
     */
    List<PayrollListDto> findByStatus(@Param("workplaceId") Long workplaceId,
                                       @Param("status") String status);
    
    /**
     * 지급 처리
     */
    int markAsPaid(@Param("id") Long id, @Param("paidBy") Long paidBy);
    
    /**
     * 상태 변경
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    
    /**
     * 미지급 급여 수
     */
    int countUnpaid(@Param("workplaceId") Long workplaceId,
                    @Param("year") int year,
                    @Param("month") int month);
}
```

---

## 6. 체크리스트 도메인 Mapper

### 6.1 ChecklistMapper.java

```java
package com.bizone.domain.checklist.mapper;

import com.bizone.domain.checklist.entity.*;
import com.bizone.domain.checklist.dto.*;
import org.apache.ibatis.annotations.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ChecklistMapper {
    
    // ========== 체크리스트 템플릿 ==========
    
    int insertChecklist(Checklist checklist);
    
    Optional<Checklist> findChecklistById(Long id);
    
    List<Checklist> findChecklistsByWorkplace(@Param("workplaceId") Long workplaceId,
                                               @Param("activeOnly") boolean activeOnly);
    
    int updateChecklist(Checklist checklist);
    
    int deactivateChecklist(Long id);
    
    // ========== 체크리스트 항목 ==========
    
    int insertItem(ChecklistItem item);
    
    List<ChecklistItem> findItemsByChecklistId(Long checklistId);
    
    int updateItem(ChecklistItem item);
    
    int deleteItem(Long id);
    
    int deleteItemsByChecklistId(Long checklistId);
    
    // ========== 할당 ==========
    
    int insertAssignment(ChecklistAssignment assignment);
    
    List<AssignmentDto> findAssignmentsByUser(@Param("workplaceId") Long workplaceId,
                                               @Param("userId") Long userId);
    
    List<AssignmentDto> findAssignmentsByChecklist(Long checklistId);
    
    int deleteAssignment(Long id);
    
    boolean existsAssignment(@Param("checklistId") Long checklistId,
                             @Param("userId") Long userId);
    
    // ========== 즐겨찾기 ==========
    
    int insertFavorite(ChecklistFavorite favorite);
    
    List<Checklist> findFavoritesByUser(@Param("workplaceId") Long workplaceId,
                                         @Param("userId") Long userId);
    
    int deleteFavorite(@Param("checklistId") Long checklistId,
                       @Param("userId") Long userId);
    
    boolean existsFavorite(@Param("checklistId") Long checklistId,
                           @Param("userId") Long userId);
}
```

### 6.2 TaskCompletionMapper.java

```java
package com.bizone.domain.checklist.mapper;

import com.bizone.domain.checklist.entity.TaskCompletion;
import com.bizone.domain.checklist.dto.*;
import org.apache.ibatis.annotations.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface TaskCompletionMapper {
    
    int insert(TaskCompletion completion);
    
    Optional<TaskCompletion> findById(Long id);
    
    /**
     * 특정 날짜의 완료 기록 조회
     */
    Optional<TaskCompletion> findByUserItemDate(@Param("workplaceId") Long workplaceId,
                                                 @Param("userId") Long userId,
                                                 @Param("itemId") Long itemId,
                                                 @Param("date") LocalDate date);
    
    /**
     * 사용자의 특정 날짜 완료 목록
     */
    List<TaskCompletion> findByUserAndDate(@Param("workplaceId") Long workplaceId,
                                            @Param("userId") Long userId,
                                            @Param("date") LocalDate date);
    
    /**
     * 체크리스트별 완료 현황 (모니터링용)
     */
    List<TaskProgressDto> getChecklistProgress(@Param("checklistId") Long checklistId,
                                                @Param("date") LocalDate date);
    
    /**
     * 사용자별 일일 진행률
     */
    UserDailyProgressDto getUserDailyProgress(@Param("workplaceId") Long workplaceId,
                                               @Param("userId") Long userId,
                                               @Param("date") LocalDate date);
    
    /**
     * 완료 처리
     */
    int markCompleted(@Param("id") Long id);
    
    /**
     * 건너뛰기 처리
     */
    int markSkipped(@Param("id") Long id, @Param("reason") String reason);
}
```

---

## 7. 공통 DTO 예시

### 7.1 페이징 지원

```java
// PageRequest.java
@Getter
@Setter
public class PageRequest {
    private int page = 0;
    private int size = 20;
    private String sort;
    private String direction = "DESC";
    
    public int getOffset() {
        return page * size;
    }
}

// PageResult.java
@Getter
@AllArgsConstructor
public class PageResult<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    
    public boolean hasNext() {
        return page < totalPages - 1;
    }
}
```

### 7.2 페이징 쿼리 패턴

```xml
<!-- 페이징 쿼리 예시 -->
<select id="findAllWithPaging" resultMap="ResultMap">
    SELECT <include refid="columns"/>
    FROM table_name
    WHERE condition = #{condition}
    ORDER BY 
        <choose>
            <when test="sort == 'name'">name</when>
            <when test="sort == 'createdAt'">created_at</when>
            <otherwise>id</otherwise>
        </choose>
        <if test="direction == 'DESC'">DESC</if>
        <if test="direction == 'ASC'">ASC</if>
    LIMIT #{size} OFFSET #{offset}
</select>

<select id="countAll" resultType="long">
    SELECT COUNT(*)
    FROM table_name
    WHERE condition = #{condition}
</select>
```

---

## 8. 성능 최적화 팁

### 8.1 N+1 문제 방지

```xml
<!-- 잘못된 예: N+1 발생 -->
<select id="findWorkplacesWithMembers">
    SELECT * FROM workplaces WHERE owner_id = #{ownerId}
</select>
<!-- 각 workplace마다 members를 별도 조회 -->

<!-- 올바른 예: JOIN 사용 -->
<select id="findWorkplacesWithMembers" resultMap="WorkplaceWithMembersMap">
    SELECT 
        w.*, 
        m.id as member_id, m.user_id, m.role, m.hourly_wage
    FROM workplaces w
    LEFT JOIN members m ON w.id = m.workplace_id AND m.is_active = true
    WHERE w.owner_id = #{ownerId} AND w.is_active = true
</select>
```

### 8.2 배치 Insert

```xml
<!-- 배치 Insert -->
<insert id="insertBatch" parameterType="list">
    INSERT INTO task_completions (workplace_id, user_id, item_id, completion_date, status)
    VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.workplaceId}, #{item.userId}, #{item.itemId}, #{item.completionDate}, #{item.status})
    </foreach>
</insert>
```

### 8.3 캐시 활용

```xml
<!-- Mapper 레벨 캐시 설정 -->
<cache 
    eviction="LRU"
    flushInterval="600000"
    size="512"
    readOnly="true"/>

<!-- 특정 쿼리에서 캐시 사용 -->
<select id="findById" resultMap="ResultMap" useCache="true">
    ...
</select>

<!-- 캐시 무효화 -->
<update id="update" flushCache="true">
    ...
</update>
```

