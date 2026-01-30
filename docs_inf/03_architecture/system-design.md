# 시스템 설계

## 버전 정보
| 구성요소 | 버전 |
|----------|------|
| React Native | 0.83 |
| JavaScript | ES6+ |
| Spring Boot | 4.0.1 |
| JDK | 21.0.8 LTS |
| PostgreSQL | 18.1 |
| Node.js | 24.11.0 LTS |

---

## 1. 아키텍처 개요

### 1.1 멀티테넌트 3-Tier 아키텍처
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        React Native App                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ 사업주A │  │ 직원1   │  │ 사업주B │  │ 직원2   │ ...                │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                    │
└───────┼────────────┼────────────┼────────────┼─────────────────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │ HTTPS / WSS
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AWS Cloud Infrastructure                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Application Load Balancer                        │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │                                          │
│              ┌────────────────┴────────────────┐                        │
│              │                                 │                        │
│              ▼                                 ▼                        │
│  ┌────────────────────────┐     ┌────────────────────────┐             │
│  │     Spring Boot        │     │     Node.js            │             │
│  │      API Server        │     │   Signaling Server     │             │
│  │       (EC2/ECS)        │     │    (ECS Fargate)       │             │
│  │                        │     │                        │             │
│  │ - REST API             │     │ - WebSocket            │             │
│  │ - 인증 (JWT 직접 구현) │     │ - 실시간 채팅          │             │
│  │ - 비즈니스 로직        │     │ - 상태 동기화          │             │
│  │ - 푸시 알림 발송       │     │ - 푸시 알림 (실시간)   │             │
│  │ - 권한 검증            │     │ - 동적 스케일링        │             │
│  └───────────┬────────────┘     └───────────┬────────────┘             │
│              │                              │                           │
│              │    ┌─────────────────────────┤                           │
│              ▼    ▼                         ▼                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Amazon     │  │  ElastiCache │  │   Amazon     │                  │
│  │     RDS      │  │   (Redis)    │  │     S3       │                  │
│  │ (PostgreSQL) │  │              │  │  (Storage)   │                  │
│  │              │  │ - JWT 토큰   │  │              │                  │
│  │ - 사용자 DB  │  │ - 세션 저장  │  │ - 파일 저장  │                  │
│  │ - 메인 DB    │  │ - 캐싱       │  │ - 이미지     │                  │
│  │ - 트랜잭션   │  │ - Pub/Sub    │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐                                    │
│  │  CloudFront  │  │  CloudWatch  │                                    │
│  │    (CDN)     │  │ (Monitoring) │                                    │
│  │              │  │              │                                    │
│  │ - 정적 파일  │  │ - 로그       │                                    │
│  │ - 캐싱       │  │ - 메트릭     │                                    │
│  └──────────────┘  └──────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 멀티테넌트 데이터 구조 (PostgreSQL)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL (RDS)                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ users (전역 사용자)                                               │   │
│  │   - id, username, email, role, device_token, current_workplace   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ 1:N (members)                       │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ workplaces (사업장 - 테넌트 단위)                                 │   │
│  │   - id, name, address, location, owner_id, business_number       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ 1:N (workplace_id FK)               │
│                                    ▼                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  members   │ │ attendance │ │ checklists │ │  contracts │          │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘          │
│  ┌────────────┘ ┌────────────┘ ┌────────────┐ ┌────────────┐          │
│  │  payrolls  │ │announcements│ │ chat_rooms │ │  messages  │          │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘          │
│  ┌────────────┐ ┌────────────┐                                          │
│  │ invitations│ │ approval_  │                                          │
│  │            │ │ requests   │                                          │
│  └────────────┘ └────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 데이터 흐름
```
[REST API 흐름]
┌─────────┐      ┌─────────┐      ┌─────────────┐      ┌──────────┐
│  App    │ ──▶ │   ALB   │ ──▶ │ Spring Boot │ ──▶ │PostgreSQL│
│         │ ◀── │         │ ◀── │             │ ◀── │          │
└─────────┘      └─────────┘      └─────────────┘      └──────────┘

[실시간 통신 흐름]
┌─────────┐      ┌─────────┐      ┌─────────────┐      ┌──────────┐
│  App    │ ◀▶ │   ALB   │ ◀▶ │  Node.js    │ ◀▶ │  Redis   │
│(Socket) │     │  (WSS)  │     │ (Socket.IO) │     │ (Pub/Sub)│
└─────────┘      └─────────┘      └─────────────┘      └──────────┘

[상태 관리 흐름 - App]
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ User Action  │ ──▶ │ Redux Store  │ ──▶ │  UI Update   │
└──────────────┘      └──────────────┘      └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ React Query  │ ◀▶ API Server
                    │ (서버 상태)  │
                    └──────────────┘
```

### 1.4 시그널링 서버 동적 할당 구조
```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Node.js Signaling Server Cluster                       │
│                        (ECS Fargate + Auto Scaling)                      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Application Load Balancer                      │  │
│  │                    (WebSocket Sticky Sessions)                     │  │
│  └─────────────────────────────┬────────────────────────────────────┘  │
│                                │                                        │
│         ┌──────────────────────┼──────────────────────┐                │
│         │                      │                      │                │
│         ▼                      ▼                      ▼                │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐         │
│  │   Task 1     │      │   Task 2     │      │   Task N     │         │
│  │ (Fargate)    │      │ (Fargate)    │      │ (Fargate)    │         │
│  │              │      │              │      │              │         │
│  │ Socket.IO    │      │ Socket.IO    │      │ Socket.IO    │ ...     │
│  │ Instance     │      │ Instance     │      │ Instance     │         │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘         │
│         │                      │                      │                │
│         └──────────────────────┼──────────────────────┘                │
│                                │                                        │
│                                ▼                                        │
│                    ┌──────────────────────┐                            │
│                    │    ElastiCache       │                            │
│                    │      (Redis)         │                            │
│                    │                      │                            │
│                    │ - Socket.IO Adapter  │                            │
│                    │ - Room Management    │                            │
│                    │ - Cross-Instance     │                            │
│                    │   Communication      │                            │
│                    └──────────────────────┘                            │
│                                                                          │
│  [Auto Scaling Policy]                                                  │
│  - CPU 사용률 70% 이상: Scale Out                                       │
│  - 연결 수 1000개/인스턴스 초과: Scale Out                              │
│  - 트래픽 감소 시: Scale In (최소 2개 유지)                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 앱 레이어 구조

```
┌────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Screens  │  │Components│  │Navigation│  │  Styles  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                    State Layer                              │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │                  Redux Store                          │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │  │
│  │  │auth │ │user │ │work │ │atten│ │check│ │cont │   │  │
│  │  │Slice│ │Slice│ │Slice│ │Slice│ │Slice│ │Slice│   │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │  │
│  │  │pay  │ │chat │ │anno │ │noti │ │socket│           │  │
│  │  │Slice│ │Slice│ │Slice│ │Slice│ │Slice │           │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  React Query                          │  │
│  │           (서버 상태 캐싱 및 동기화)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                   Service Layer                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Auth   │ │   API   │ │ Storage │ │  Push   │          │
│  │ Service │ │ Service │ │ Service │ │ Service │          │
│  │(Cognito)│ │ (Axios) │ │  (S3)   │ │  (SNS)  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Socket │ │   GPS   │ │   PDF   │ │  Local  │          │
│  │ Service │ │ Service │ │ Service │ │ Storage │          │
│  │(Socket.IO)│        │ │         │ │         │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└────────────────────────────────────────────────────────────┘
```

---

## 3. 백엔드 레이어 구조 (Spring Boot)

```
┌────────────────────────────────────────────────────────────┐
│                    Controller Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Auth     │ │   User      │ │  Workplace  │          │
│  │ Controller  │ │ Controller  │ │ Controller  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Attendance  │ │  Checklist  │ │  Contract   │          │
│  │ Controller  │ │ Controller  │ │ Controller  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Payroll   │ │Announcement │ │    Chat     │          │
│  │ Controller  │ │ Controller  │ │ Controller  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                    Service Layer                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Business Logic Services                  │   │
│  │                                                       │   │
│  │  - UserService, WorkplaceService, MemberService      │   │
│  │  - AttendanceService, ChecklistService               │   │
│  │  - ContractService, PayrollService                   │   │
│  │  - AnnouncementService, ChatService                  │   │
│  │  - ApprovalService, NotificationService              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Infrastructure Services                  │   │
│  │                                                       │   │
│  │  - S3Service (파일 업로드/다운로드)                   │   │
│  │  - CognitoService (인증 연동)                        │   │
│  │  - SNSService (푸시 알림)                            │   │
│  │  - BusinessValidationService (사업자 검증)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                  Repository Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Spring Data JPA                      │   │
│  │                                                       │   │
│  │  - UserRepository, WorkplaceRepository               │   │
│  │  - MemberRepository, AttendanceRepository            │   │
│  │  - ChecklistRepository, TaskCompletionRepository     │   │
│  │  - ContractRepository, PayrollRepository             │   │
│  │  - AnnouncementRepository, ChatRoomRepository        │   │
│  │  - MessageRepository, ApprovalRequestRepository      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  QueryDSL (복잡한 쿼리)               │   │
│  │                                                       │   │
│  │  - 동적 검색 조건, 페이징, 정렬                       │   │
│  │  - 통계 집계 쿼리                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                    PostgreSQL (RDS)                         │
└────────────────────────────────────────────────────────────┘
```

---

## 4. 시그널링 서버 구조 (Node.js)

```
┌────────────────────────────────────────────────────────────┐
│                 Node.js Signaling Server                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Socket.IO                          │  │
│  │                                                       │  │
│  │  [Namespaces]                                        │  │
│  │  - /chat        : 채팅 메시지 실시간 전송            │  │
│  │  - /attendance  : 출퇴근 상태 실시간 동기화          │  │
│  │  - /checklist   : 체크리스트 상태 실시간 동기화      │  │
│  │  - /notification: 실시간 알림 전송                   │  │
│  │                                                       │  │
│  │  [Rooms]                                             │  │
│  │  - workplace:{id}     : 사업장별 그룹 룸            │  │
│  │  - chat:{roomId}      : 채팅방별 룸                 │  │
│  │  - user:{userId}      : 개인 알림용 룸             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Redis Adapter                         │  │
│  │                                                       │  │
│  │  - 다중 인스턴스 간 메시지 동기화                    │  │
│  │  - Room 정보 공유                                    │  │
│  │  - Pub/Sub 기반 브로드캐스트                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Authentication                        │  │
│  │                                                       │  │
│  │  - JWT 토큰 검증 (Cognito)                          │  │
│  │  - 사업장 멤버십 검증                                │  │
│  │  - Connection 권한 관리                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 5. 화면 구조

### 5.1 네비게이션 구조
```
RootNavigator
├── AuthNavigator (비로그인)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── MainNavigator (로그인)
    ├── WorkplaceSelectScreen (사업장 선택/생성)
    │
    └── WorkplaceNavigator (사업장 선택 후)
        └── BottomTabNavigator
            ├── HomeTab
            │   └── HomeScreen (사업주/직원 분기)
            │
            ├── AttendanceTab
            │   ├── AttendanceScreen
            │   ├── ManualInputScreen
            │   └── EditRequestScreen
            │
            ├── CalendarTab
            │   ├── CalendarScreen
            │   └── DayDetailScreen
            │
            ├── ChecklistTab
            │   ├── ChecklistScreen (직원)
            │   ├── ChecklistMonitorScreen (사업주)
            │   └── ChecklistEditorScreen (사업주)
            │
            └── MoreTab
                ├── AnnouncementListScreen
                ├── AnnouncementDetailScreen
                ├── AnnouncementCreateScreen (사업주)
                ├── ChatListScreen
                ├── ChatScreen
                ├── ContractListScreen
                ├── ContractDetailScreen
                ├── ContractCreateScreen (사업주)
                ├── ContractSignScreen (직원)
                ├── PayrollListScreen
                ├── PayrollDetailScreen
                ├── SettingsScreen
                ├── ProfileScreen
                └── AdminScreen (사업주 전용)
                    ├── EmployeeListScreen
                    ├── EmployeeDetailScreen
                    ├── ApprovalListScreen
                    ├── WorkplaceSettingsScreen
                    └── ExportScreen
```

### 5.2 권한별 화면 접근

| 화면 | 사업주 | 직원 |
|------|:------:|:----:|
| 홈 (대시보드) | ✅ | ✅ |
| 출퇴근 | ✅ | ✅ |
| 캘린더 | ✅ (전체) | ✅ (본인) |
| 체크리스트 체크 | ✅ | ✅ |
| 체크리스트 편집 | ✅ | ❌ |
| 체크리스트 모니터링 | ✅ | ❌ |
| 공지사항 조회 | ✅ | ✅ |
| 공지사항 작성 | ✅ | ❌ |
| 채팅 | ✅ | ✅ |
| 근로계약서 조회 | ✅ (전체) | ✅ (본인) |
| 근로계약서 작성 | ✅ | ❌ |
| 근로계약서 서명 | ❌ | ✅ |
| 급여 조회 | ✅ (전체) | ✅ (본인) |
| 직원 관리 | ✅ | ❌ |
| 승인 처리 | ✅ | ❌ |
| 사업장 설정 | ✅ | ❌ |
| 엑셀/PDF 추출 | ✅ | ✅ (본인) |

---

## 6. 핵심 비즈니스 로직

### 6.1 출퇴근 처리 플로우
```
출퇴근 버튼 클릭
       │
       ▼
┌──────────────┐
│ GPS 위치 확인 │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ 사업장 반경 내 확인?  │
└──────┬───────────────┘
       │
    ┌──┴──┐
    │     │
   Yes    No
    │     │
    ▼     ▼
┌──────┐ ┌──────────────┐
│ 처리 │ │ 수동입력 안내 │
└──┬───┘ └──────────────┘
   │
   ▼
┌──────────────────────┐
│ Spring Boot API 호출  │
│ POST /api/attendance │
└──────┬───────────────┘
   │
   ▼
┌──────────────────────┐
│ PostgreSQL 저장      │
└──────┬───────────────┘
   │
   ▼
┌──────────────────────┐
│ Socket.IO 브로드캐스트│
│ (실시간 상태 동기화)  │
└──────────────────────┘
```

### 6.2 급여 계산 로직 (Spring Boot Service)
```java
@Service
public class PayrollService {
    
    public PayrollCalculationResult calculateWage(
        LocalDateTime clockIn, 
        LocalDateTime clockOut, 
        int hourlyWage
    ) {
        long workMinutes = Duration.between(clockIn, clockOut).toMinutes();
        int baseWage = (int) Math.floor((workMinutes / 60.0) * hourlyWage);
        
        // 연장/야간/휴일 수당 계산
        int overtimePay = calculateOvertimePay(...);
        int nightPay = calculateNightPay(...);
        int holidayPay = calculateHolidayPay(...);
        
        return new PayrollCalculationResult(
            workMinutes, baseWage, overtimePay, nightPay, holidayPay
        );
    }
}
```

### 6.3 근로계약서 플로우
```
사업주: 계약서 작성
       │
       ▼
┌──────────────────────────┐
│ Spring Boot 법규 검증    │
│ - 최저시급 확인         │
│ - 근로시간 확인         │
│ - 필수항목 확인         │
└──────────┬───────────────┘
           │
           ▼
사업주: 계약서 발송 → SNS 푸시 알림 → 직원 앱
       │
       ▼
직원: 계약서 열람
       │
       ▼
직원: 전자서명 → S3에 서명 이미지 저장
       │
       ▼
┌──────────────────────────┐
│ 계약서 상태 업데이트     │
│ status: 'signed'         │
└──────────┬───────────────┘
           │
           ▼
양측: 서명완료 계약서 열람/PDF 다운로드
```

### 6.4 실시간 채팅 플로우
```
[메시지 전송]
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│ Client  │ ──▶│ Socket.IO    │ ──▶│ Spring Boot │
│  emit   │     │ Server       │     │ API (저장)  │
└─────────┘     └──────┬───────┘     └─────────────┘
                       │
                       ▼
               ┌──────────────┐
               │ Redis Pub/Sub│
               └──────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│ Socket Task 1││ Socket Task 2││ Socket Task N│
└──────┬───────┘└──────┬───────┘└──────┬───────┘
       │               │               │
       ▼               ▼               ▼
┌──────────────────────────────────────────────┐
│         Room 참여자들에게 브로드캐스트         │
└──────────────────────────────────────────────┘
```

---

## 7. API 설계

### 7.1 REST API 엔드포인트 구조

```
/api/v1
├── /auth
│   ├── POST /signup              # 회원가입
│   ├── POST /login               # 로그인
│   ├── POST /refresh             # 토큰 갱신
│   └── POST /logout              # 로그아웃
│
├── /users
│   ├── GET /me                   # 내 정보
│   ├── PUT /me                   # 내 정보 수정
│   └── PUT /me/device-token      # 디바이스 토큰 등록
│
├── /workplaces
│   ├── GET /                     # 내 사업장 목록
│   ├── POST /                    # 사업장 생성
│   ├── GET /{id}                 # 사업장 상세
│   ├── PUT /{id}                 # 사업장 수정
│   └── DELETE /{id}              # 사업장 삭제
│
├── /workplaces/{workplaceId}
│   ├── /members
│   │   ├── GET /                 # 멤버 목록
│   │   ├── POST /invite          # 멤버 초대
│   │   ├── PUT /{memberId}       # 멤버 정보 수정
│   │   └── DELETE /{memberId}    # 멤버 제거
│   │
│   ├── /attendance
│   │   ├── GET /                 # 출퇴근 기록 목록
│   │   ├── POST /clock-in        # 출근
│   │   ├── POST /clock-out       # 퇴근
│   │   └── POST /manual          # 수동 입력
│   │
│   ├── /checklists
│   │   ├── GET /                 # 체크리스트 목록
│   │   ├── POST /                # 체크리스트 생성
│   │   ├── PUT /{id}             # 체크리스트 수정
│   │   └── POST /{id}/complete   # 항목 완료 처리
│   │
│   ├── /contracts
│   │   ├── GET /                 # 계약서 목록
│   │   ├── POST /                # 계약서 생성
│   │   ├── POST /{id}/send       # 계약서 발송
│   │   └── POST /{id}/sign       # 계약서 서명
│   │
│   ├── /payrolls
│   │   ├── GET /                 # 급여 목록
│   │   ├── POST /calculate       # 급여 계산
│   │   └── GET /{id}/pdf         # 명세서 PDF
│   │
│   ├── /announcements
│   │   ├── GET /                 # 공지 목록
│   │   ├── POST /                # 공지 작성
│   │   ├── PUT /{id}             # 공지 수정
│   │   └── POST /{id}/comments   # 댓글 작성
│   │
│   ├── /chat-rooms
│   │   ├── GET /                 # 채팅방 목록
│   │   ├── POST /                # 채팅방 생성
│   │   └── GET /{id}/messages    # 메시지 목록
│   │
│   └── /approvals
│       ├── GET /                 # 승인 요청 목록
│       ├── POST /{id}/approve    # 승인
│       └── POST /{id}/reject     # 거부
```

### 7.2 WebSocket 이벤트 (Socket.IO)

```javascript
// 클라이언트 → 서버
socket.emit('join:workplace', { workplaceId });
socket.emit('join:chatroom', { roomId });
socket.emit('leave:chatroom', { roomId });
socket.emit('chat:message', { roomId, content, type });
socket.emit('chat:typing', { roomId, isTyping });

// 서버 → 클라이언트
socket.on('chat:new-message', (message) => {});
socket.on('chat:user-typing', ({ userId, isTyping }) => {});
socket.on('attendance:status-changed', (attendance) => {});
socket.on('checklist:item-completed', (completion) => {});
socket.on('notification:new', (notification) => {});
```

---

## 8. 보안 구현

### 8.1 Spring Security 설정
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/**").authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 8.2 권한 체크 (멀티테넌트)
```java
@Service
public class AuthorizationService {
    
    public void checkWorkplaceAccess(UUID workplaceId, UUID userId) {
        Member member = memberRepository
            .findByWorkplaceIdAndUserId(workplaceId, userId)
            .orElseThrow(() -> new AccessDeniedException("사업장 접근 권한이 없습니다."));
        
        if (!member.isActive()) {
            throw new AccessDeniedException("비활성화된 멤버입니다.");
        }
    }
    
    public void checkAdminRole(UUID workplaceId, UUID userId) {
        Member member = memberRepository
            .findByWorkplaceIdAndUserId(workplaceId, userId)
            .orElseThrow(() -> new AccessDeniedException("사업장 접근 권한이 없습니다."));
        
        if (member.getRole() != MemberRole.ADMIN) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
    }
}
```

---

## 9. 배포 아키텍처

### 9.1 CI/CD 파이프라인
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │ ──▶│GitHub Actions│ ──▶│    AWS       │
│   Push       │     │   Build/Test │     │   Deploy     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                     ┌──────────────────────────┼───────────────────┐
                     │                          │                   │
                     ▼                          ▼                   ▼
              ┌──────────────┐         ┌──────────────┐     ┌──────────────┐
              │     ECR      │         │     ECS      │     │     S3       │
              │(Docker Image)│         │   Deploy     │     │   (Assets)   │
              └──────────────┘         └──────────────┘     └──────────────┘
```

### 9.2 환경 분리
```
Development  → dev.api.bizone.com
Staging      → staging.api.bizone.com
Production   → api.bizone.com
```
