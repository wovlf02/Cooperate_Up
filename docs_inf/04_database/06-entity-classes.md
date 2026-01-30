# Spring Boot Entity 클래스

## 1. 개요

MyBatis 기반이지만, 도메인 모델을 명확히 정의하기 위해 Entity 클래스를 작성합니다.
Spring Boot 4.0.1 + JDK 21 기준입니다.

---

## 2. 공통 구성요소

### 2.1 BaseEntity

```java
package com.bizone.common.entity;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public abstract class BaseEntity {
    
    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 2.2 공통 Enum

```java
package com.bizone.common.enums;

public enum UserRole {
    ADMIN("admin"),
    EMPLOYEE("employee");
    
    private final String value;
    
    UserRole(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static UserRole fromValue(String value) {
        for (UserRole role : values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}

public enum AttendanceStatus {
    WORKING("working"),
    COMPLETED("completed"),
    PENDING_APPROVAL("pending_approval"),
    APPROVED("approved"),
    REJECTED("rejected");
    
    private final String value;
    
    AttendanceStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum ApprovalStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");
    
    private final String value;
    
    ApprovalStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum ContractStatus {
    DRAFT("draft"),
    PENDING("pending"),
    SIGNED("signed"),
    EXPIRED("expired"),
    CANCELLED("cancelled");
    
    private final String value;
    
    ContractStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum PayrollStatus {
    PENDING("pending"),
    CONFIRMED("confirmed"),
    PAID("paid");
    
    private final String value;
    
    PayrollStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum InvitationStatus {
    PENDING("pending"),
    ACCEPTED("accepted"),
    REJECTED("rejected"),
    EXPIRED("expired");
    
    private final String value;
    
    InvitationStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum TaskCompletionStatus {
    COMPLETED("completed"),
    SKIPPED("skipped");
    
    private final String value;
    
    TaskCompletionStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum MessageType {
    TEXT("text"),
    IMAGE("image"),
    VIDEO("video"),
    AUDIO("audio"),
    DOCUMENT("document"),
    SYSTEM("system");
    
    private final String value;
    
    MessageType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum ChatRoomType {
    GROUP("group"),
    DIRECT("direct");
    
    private final String value;
    
    ChatRoomType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum DevicePlatform {
    IOS("ios"),
    ANDROID("android");
    
    private final String value;
    
    DevicePlatform(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}

public enum BusinessStatus {
    ACTIVE("active"),
    SUSPENDED("suspended"),
    CLOSED("closed");
    
    private final String value;
    
    BusinessStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

---

## 3. 사용자 도메인

### 3.1 User Entity

```java
package com.bizone.domain.user.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    
    private String username;
    private String email;
    private boolean emailVerified;
    private String passwordHash;
    private String name;
    private String phone;
    private LocalDate birthDate;
    private String profileImageUrl;
    private UserRole role;
    
    // 사업자 정보 (관리자용)
    private String businessNumber;
    private String businessOwnerName;
    private String businessType;
    private LocalDate businessOpenDate;
    private boolean businessVerified;
    private LocalDateTime businessVerifiedAt;
    private LocalDateTime lastBusinessCheckAt;
    private BusinessStatus businessStatus;
    
    // 푸시 알림
    private String deviceToken;
    private DevicePlatform devicePlatform;
    
    // 현재 사업장
    private Long currentWorkplaceId;
    
    private boolean isActive;
    
    // 비즈니스 메서드
    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }
    
    public boolean isEmployee() {
        return this.role == UserRole.EMPLOYEE;
    }
    
    public boolean canCreateWorkplace() {
        return isAdmin() && businessVerified;
    }
}
```

### 3.2 RefreshToken Entity

```java
package com.bizone.domain.user.entity;

import com.bizone.common.entity.BaseEntity;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    
    private Long id;
    private Long userId;
    private String tokenHash;
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

---

## 4. 사업장 도메인

### 4.1 Workplace Entity

```java
package com.bizone.domain.workplace.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.BusinessStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workplace extends BaseEntity {
    
    private Long ownerId;
    private String name;
    private String address;
    private String addressDetail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String locationSource;
    private Integer radius;
    
    private LocalTime defaultStartTime;
    private LocalTime defaultEndTime;
    private String scheduleConfig;  // JSON
    
    private Integer paymentDate;
    
    // 사업자 정보
    private String businessNumber;
    private String businessOwnerName;
    private String businessType;
    private boolean businessVerified;
    private LocalDateTime businessVerifiedAt;
    private BusinessStatus businessStatus;
    
    // 초대
    private String inviteCode;
    private boolean inviteCodeActive;
    
    private boolean isActive;
    
    // 비즈니스 메서드
    public boolean isWithinRadius(BigDecimal lat, BigDecimal lng) {
        if (this.latitude == null || this.longitude == null) {
            return false;
        }
        double distance = calculateDistance(
            this.latitude.doubleValue(), this.longitude.doubleValue(),
            lat.doubleValue(), lng.doubleValue()
        );
        return distance <= this.radius;
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // 지구 반경 (미터)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
```

### 4.2 Member Entity

```java
package com.bizone.domain.workplace.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.UserRole;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member extends BaseEntity {
    
    private Long workplaceId;
    private Long userId;
    private UserRole role;
    private Integer hourlyWage;
    
    // 개별 스케줄
    private boolean useCustomSchedule;
    private LocalTime customStartTime;
    private LocalTime customEndTime;
    private String customScheduleConfig;  // JSON
    
    private boolean isActive;
    private LocalDateTime joinedAt;
    
    // 비즈니스 메서드
    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }
    
    public LocalTime getEffectiveStartTime(Workplace workplace) {
        if (useCustomSchedule && customStartTime != null) {
            return customStartTime;
        }
        return workplace.getDefaultStartTime();
    }
    
    public LocalTime getEffectiveEndTime(Workplace workplace) {
        if (useCustomSchedule && customEndTime != null) {
            return customEndTime;
        }
        return workplace.getDefaultEndTime();
    }
}
```

### 4.3 Invitation Entity

```java
package com.bizone.domain.workplace.entity;

import com.bizone.common.enums.InvitationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {
    
    private Long id;
    private Long workplaceId;
    private String workplaceName;
    private Long inviterId;
    private String inviterName;
    private Long inviteeId;
    private String inviteeName;
    private InvitationStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean canRespond() {
        return status == InvitationStatus.PENDING && !isExpired();
    }
}
```

---

## 5. 출퇴근 도메인

### 5.1 AttendanceRecord Entity

```java
package com.bizone.domain.attendance.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.AttendanceStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {
    
    private Long workplaceId;
    private Long userId;
    private String userName;
    private LocalDate workDate;
    
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
    private LocalDateTime effectiveClockIn;
    private LocalDateTime effectiveClockOut;
    
    private BigDecimal clockInLat;
    private BigDecimal clockInLng;
    private BigDecimal clockOutLat;
    private BigDecimal clockOutLng;
    
    private Integer workMinutes;
    private Integer hourlyWage;
    private Integer dailyWage;
    
    private AttendanceStatus status;
    private boolean isManualInput;
    private boolean isEarlyClockIn;
    private boolean checklistCompleted;
    private String note;
    
    // 비즈니스 메서드
    public boolean isWorking() {
        return status == AttendanceStatus.WORKING;
    }
    
    public boolean canClockOut() {
        return isWorking() && checklistCompleted;
    }
    
    public int calculateWorkMinutes() {
        if (effectiveClockIn == null || effectiveClockOut == null) {
            return 0;
        }
        return (int) java.time.Duration.between(effectiveClockIn, effectiveClockOut).toMinutes();
    }
    
    public int calculateDailyWage() {
        if (hourlyWage == null || hourlyWage == 0) {
            return 0;
        }
        return (int) Math.round(workMinutes / 60.0 * hourlyWage);
    }
}
```

### 5.2 ApprovalRequest Entity

```java
package com.bizone.domain.attendance.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.ApprovalStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest extends BaseEntity {
    
    private Long workplaceId;
    private Long userId;
    private String userName;
    private Long attendanceId;
    private String requestType;  // manual_input, edit_request
    private LocalDate requestDate;
    private LocalTime requestClockIn;
    private LocalTime requestClockOut;
    private String requestReason;
    private ApprovalStatus status;
    private Long processedBy;
    private LocalDateTime processedAt;
    private String processNote;
    
    public boolean isPending() {
        return status == ApprovalStatus.PENDING;
    }
    
    public boolean isManualInput() {
        return "manual_input".equals(requestType);
    }
    
    public boolean isEditRequest() {
        return "edit_request".equals(requestType);
    }
}
```

---

## 6. 체크리스트 도메인

### 6.1 Checklist Entity

```java
package com.bizone.domain.checklist.entity;

import com.bizone.common.entity.BaseEntity;
import lombok.*;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checklist extends BaseEntity {
    
    private Long workplaceId;
    private String name;
    private String category;
    private String description;
    private LocalTime timeSlot;
    private String repeatDays;  // JSON: [0,1,2,3,4,5,6]
    private Integer sortOrder;
    private boolean isActive;
    
    // 연관 데이터 (필요시 조회)
    private List<ChecklistItem> items;
}
```

### 6.2 ChecklistItem Entity

```java
package com.bizone.domain.checklist.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItem {
    
    private Long id;
    private Long checklistId;
    private String title;
    private String description;
    private Integer sortOrder;
    private boolean isActive;
}
```

### 6.3 TaskCompletion Entity

```java
package com.bizone.domain.checklist.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.TaskCompletionStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCompletion extends BaseEntity {
    
    private Long workplaceId;
    private Long userId;
    private String userName;
    private Long checklistId;
    private String checklistName;
    private Long itemId;
    private String itemTitle;
    private LocalDate completionDate;
    private TaskCompletionStatus status;
    private LocalDateTime completedAt;
    private LocalDateTime skippedAt;
    private String skipReason;
    private String note;
    
    public boolean isCompleted() {
        return status == TaskCompletionStatus.COMPLETED;
    }
    
    public boolean isSkipped() {
        return status == TaskCompletionStatus.SKIPPED;
    }
}
```

---

## 7. 근로계약 도메인

### 7.1 Contract Entity

```java
package com.bizone.domain.contract.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.ContractStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract extends BaseEntity {
    
    private Long workplaceId;
    private Long employeeId;
    private String employeeName;
    
    // 계약 내용
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private String workLocation;
    private String jobDescription;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private Integer breakMinutes;
    private String workingDays;  // JSON
    private Integer hourlyWage;
    private Integer paymentDate;
    
    // 추가 수당
    private Integer mealAllowance;
    private Integer transportAllowance;
    private String otherAllowances;  // JSON
    private String benefits;
    private String additionalTerms;
    
    // 법규 검증
    private boolean validationPassed;
    private String validationResult;  // JSON
    
    // 서명
    private ContractStatus status;
    private String adminSignatureUrl;
    private LocalDateTime adminSignedAt;
    private String employeeSignatureUrl;
    private LocalDateTime employeeSignedAt;
    private String pdfUrl;
    
    // 비즈니스 메서드
    public boolean isFullySigned() {
        return adminSignatureUrl != null && employeeSignatureUrl != null;
    }
    
    public boolean canSign() {
        return status == ContractStatus.PENDING && validationPassed;
    }
    
    public boolean isExpired() {
        return contractEndDate != null && LocalDate.now().isAfter(contractEndDate);
    }
}
```

---

## 8. 급여 도메인

### 8.1 Payroll Entity

```java
package com.bizone.domain.payroll.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.PayrollStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll extends BaseEntity {
    
    private Long workplaceId;
    private Long userId;
    private String userName;
    private Integer payYear;
    private Integer payMonth;
    
    // 근무 집계
    private Integer totalWorkDays;
    private Integer totalWorkMinutes;
    private Integer hourlyWage;
    
    // 지급 내역
    private Integer basePay;
    private Integer weeklyHolidayPay;
    private Integer overtimePay;
    private Integer nightPay;
    private Integer holidayPay;
    private Integer totalEarnings;
    private String earningsDetail;  // JSON (산출식)
    
    // 공제 내역
    private Integer nationalPension;
    private Integer healthInsurance;
    private Integer longTermCare;
    private Integer employmentInsurance;
    private Integer incomeTax;
    private Integer localIncomeTax;
    private Integer totalDeductions;
    private String deductionsDetail;  // JSON (산출식)
    
    private Integer netPay;
    
    private PayrollStatus status;
    private boolean isPaid;
    private LocalDateTime paidAt;
    private Long paidBy;
    private String pdfUrl;
    
    // 비즈니스 메서드
    public void calculate() {
        this.totalEarnings = (basePay != null ? basePay : 0)
            + (weeklyHolidayPay != null ? weeklyHolidayPay : 0)
            + (overtimePay != null ? overtimePay : 0)
            + (nightPay != null ? nightPay : 0)
            + (holidayPay != null ? holidayPay : 0);
        
        this.totalDeductions = (nationalPension != null ? nationalPension : 0)
            + (healthInsurance != null ? healthInsurance : 0)
            + (longTermCare != null ? longTermCare : 0)
            + (employmentInsurance != null ? employmentInsurance : 0)
            + (incomeTax != null ? incomeTax : 0)
            + (localIncomeTax != null ? localIncomeTax : 0);
        
        this.netPay = totalEarnings - totalDeductions;
    }
    
    public double getTotalWorkHours() {
        return totalWorkMinutes != null ? totalWorkMinutes / 60.0 : 0;
    }
}
```

---

## 9. 채팅 도메인

### 9.1 ChatRoom Entity

```java
package com.bizone.domain.chat.entity;

import com.bizone.common.entity.BaseEntity;
import com.bizone.common.enums.ChatRoomType;
import com.bizone.common.enums.MessageType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom extends BaseEntity {
    
    private Long workplaceId;
    private ChatRoomType roomType;
    private String name;
    private Long createdBy;
    
    // 마지막 메시지 정보 (비정규화)
    private String lastMessageContent;
    private Long lastMessageSenderId;
    private String lastMessageSenderName;
    private MessageType lastMessageType;
    private LocalDateTime lastMessageAt;
    
    public boolean isGroupChat() {
        return roomType == ChatRoomType.GROUP;
    }
    
    public boolean isDirectChat() {
        return roomType == ChatRoomType.DIRECT;
    }
}
```

### 9.2 Message Entity

```java
package com.bizone.domain.chat.entity;

import com.bizone.common.enums.MessageType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageType messageType;
    private LocalDateTime createdAt;
    
    // 연관 데이터 (필요시)
    private List<MessageAttachment> attachments;
}
```

---

## 10. 공지사항 도메인

### 10.1 Announcement Entity

```java
package com.bizone.domain.announcement.entity;

import com.bizone.common.entity.BaseEntity;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement extends BaseEntity {
    
    private Long workplaceId;
    private Long authorId;
    private String authorName;
    private String title;
    private String content;
    private boolean isPinned;
    private Integer viewCount;
    private Integer commentCount;
    
    // 연관 데이터 (필요시)
    private List<AnnouncementAttachment> attachments;
    
    public void incrementViewCount() {
        this.viewCount = (this.viewCount != null ? this.viewCount : 0) + 1;
    }
    
    public void incrementCommentCount() {
        this.commentCount = (this.commentCount != null ? this.commentCount : 0) + 1;
    }
    
    public void decrementCommentCount() {
        if (this.commentCount != null && this.commentCount > 0) {
            this.commentCount--;
        }
    }
}
```

### 10.2 Comment Entity

```java
package com.bizone.domain.announcement.entity;

import com.bizone.common.entity.BaseEntity;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment extends BaseEntity {
    
    private Long announcementId;
    private Long parentId;
    private Long authorId;
    private String authorName;
    private String content;
    private Long mentionUserId;
    private String mentionUserName;
    private boolean isDeleted;
    
    // 대댓글 (필요시)
    private List<Comment> replies;
    
    public boolean isReply() {
        return parentId != null;
    }
}
```

---

## 11. 프로젝트 구조

```
src/main/java/com/bizone/
├── BizOneApplication.java
├── common/
│   ├── entity/
│   │   └── BaseEntity.java
│   ├── enums/
│   │   ├── UserRole.java
│   │   ├── AttendanceStatus.java
│   │   └── ...
│   ├── dto/
│   │   ├── PageRequest.java
│   │   └── PageResult.java
│   └── exception/
│       └── ...
├── domain/
│   ├── user/
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   └── RefreshToken.java
│   │   ├── mapper/
│   │   │   └── UserMapper.java
│   │   ├── dto/
│   │   │   └── ...
│   │   ├── service/
│   │   │   └── UserService.java
│   │   └── controller/
│   │       └── UserController.java
│   ├── workplace/
│   ├── attendance/
│   ├── checklist/
│   ├── contract/
│   ├── payroll/
│   ├── announcement/
│   └── chat/
└── config/
    ├── MyBatisConfig.java
    ├── SecurityConfig.java
    └── ...
```

