# 백엔드 파일 구조 개요 (Backend File Structure Overview)

> **최종 업데이트**: 2024-12-25
> **규칙 요약**: 도메인 기반 패키지 구조 / 단일 책임 원칙 / 계층 분리

## 1. 프로젝트 루트 구조

```
bizone-api/
├── build.gradle                    # Gradle 빌드 설정
├── settings.gradle                 # Gradle 프로젝트 설정
├── gradlew                         # Gradle Wrapper (Unix)
├── gradlew.bat                     # Gradle Wrapper (Windows)
├── Dockerfile                      # Docker 이미지 빌드
├── docker-compose.yml              # 로컬 개발 환경
├── README.md                       # 프로젝트 README
│
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
│
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/bizone/api/     # 메인 소스 코드
    │   └── resources/              # 리소스 파일
    │
    └── test/
        ├── java/
        │   └── com/bizone/api/     # 테스트 코드
        └── resources/              # 테스트 리소스
```

---

## 2. 메인 소스 구조 (src/main/java/com/bizone/api/)

```
com/bizone/api/
├── BizoneApiApplication.java       # Spring Boot 메인 클래스
│
├── global/                         # 전역 설정 및 공통 컴포넌트
│   ├── config/                     # 설정 클래스
│   ├── exception/                  # 전역 예외 처리
│   ├── response/                   # 공통 응답 객체
│   ├── security/                   # 보안 설정 (JWT, Filter)
│   ├── util/                       # 공통 유틸리티
│   ├── validator/                  # 커스텀 검증기
│   └── aspect/                     # AOP 관련
│
├── domain/                         # 도메인별 비즈니스 로직
│   ├── user/                       # 사용자 도메인
│   ├── auth/                       # 인증 도메인
│   ├── workplace/                  # 사업장 도메인
│   ├── member/                     # 멤버십 도메인
│   ├── invitation/                 # 초대 도메인
│   ├── attendance/                 # 출퇴근 도메인
│   ├── payroll/                    # 급여 도메인
│   ├── calendar/                   # 캘린더 도메인
│   ├── checklist/                  # 체크리스트 도메인
│   ├── contract/                   # 근로계약서 도메인
│   ├── announcement/               # 공지사항 도메인
│   ├── chat/                       # 채팅 도메인
│   ├── notification/               # 알림 도메인
│   └── file/                       # 파일 업로드 도메인
│
└── infra/                          # 외부 인프라 연동
    ├── external/                   # 외부 API 클라이언트
    ├── firebase/                   # Firebase (FCM)
    ├── mail/                       # 이메일 서비스
    └── storage/                    # 파일 스토리지 (S3)
```

---

## 3. 도메인별 패키지 구조

각 도메인은 다음과 같은 표준 구조를 따릅니다:

```
domain/{domain-name}/
├── controller/                     # REST API 컨트롤러
│   └── {Domain}Controller.java
│
├── service/                        # 비즈니스 로직
│   ├── {Domain}Service.java        # 서비스 인터페이스
│   └── impl/
│       └── {Domain}ServiceImpl.java # 서비스 구현체
│
├── repository/                     # 데이터 액세스
│   ├── {Domain}Repository.java     # JPA Repository
│   └── {Domain}QueryRepository.java # QueryDSL Repository
│
├── entity/                         # JPA 엔티티
│   └── {Domain}.java
│
├── dto/                            # 데이터 전송 객체
│   ├── request/                    # 요청 DTO
│   │   ├── {Domain}CreateRequest.java
│   │   └── {Domain}UpdateRequest.java
│   └── response/                   # 응답 DTO
│       ├── {Domain}Response.java
│       └── {Domain}DetailResponse.java
│
├── mapper/                         # Entity-DTO 매퍼 (MapStruct)
│   └── {Domain}Mapper.java
│
├── exception/                      # 도메인 예외 (선택)
│   └── {Domain}Exception.java
│
└── constant/                       # 도메인 상수/열거형 (선택)
    └── {Domain}Status.java
```

---

## 4. 리소스 구조 (src/main/resources/)

```
resources/
├── application.yml                 # 기본 설정
├── application-local.yml           # 로컬 개발 환경
├── application-dev.yml             # 개발 서버 환경
├── application-prod.yml            # 프로덕션 환경
│
├── db/
│   └── migration/                  # Flyway 마이그레이션 스크립트
│       ├── V1__init_schema.sql
│       ├── V2__add_workplace.sql
│       └── ...
│
├── firebase/
│   └── firebase-service-account.json # Firebase 서비스 계정 키
│
├── templates/                      # 이메일/PDF 템플릿
│   ├── email/
│   │   ├── verification.html       # 이메일 인증
│   │   └── password-reset.html     # 비밀번호 재설정
│   └── pdf/
│       └── payslip-template.html   # 급여 명세서 템플릿
│
├── static/                         # 정적 리소스
│   └── docs/                       # API 문서
│
└── messages/                       # 다국어 메시지
    ├── messages.properties         # 기본 (한국어)
    └── messages_en.properties      # 영어
```

---

## 5. 테스트 구조 (src/test/)

```
test/
├── java/
│   └── com/bizone/api/
│       ├── BizoneApiApplicationTests.java
│       │
│       ├── domain/                 # 도메인별 테스트
│       │   ├── user/
│       │   │   ├── controller/
│       │   │   │   └── UserControllerTest.java
│       │   │   ├── service/
│       │   │   │   └── UserServiceTest.java
│       │   │   └── repository/
│       │   │       └── UserRepositoryTest.java
│       │   └── ...
│       │
│       ├── integration/            # 통합 테스트
│       │   ├── AuthIntegrationTest.java
│       │   └── AttendanceIntegrationTest.java
│       │
│       └── fixture/                # 테스트 픽스처
│           ├── UserFixture.java
│           └── WorkplaceFixture.java
│
└── resources/
    ├── application-test.yml        # 테스트 환경 설정
    └── data/                       # 테스트 데이터
        └── test-data.sql
```

---

## 6. 계층별 역할 및 규칙

### 6.1 Controller 계층

| 역할 | 규칙 |
|------|------|
| HTTP 요청/응답 처리 | `@RestController` 사용 |
| 입력 검증 | `@Valid` + DTO 검증 |
| 서비스 위임 | 비즈니스 로직 직접 구현 금지 |
| 응답 변환 | `ApiResponse<T>` 통일 포맷 |

### 6.2 Service 계층

| 역할 | 규칙 |
|------|------|
| 비즈니스 로직 | 인터페이스 + 구현체 분리 |
| 트랜잭션 관리 | `@Transactional` 사용 |
| 도메인 간 조율 | 다른 도메인 Service 주입 가능 |
| 예외 처리 | 비즈니스 예외 발생 |

### 6.3 Repository 계층

| 역할 | 규칙 |
|------|------|
| 데이터 액세스 | JpaRepository 상속 |
| 동적 쿼리 | QueryDSL 사용 |
| 읽기 전용 | `@Transactional(readOnly = true)` |

### 6.4 Entity 계층

| 역할 | 규칙 |
|------|------|
| 도메인 모델 | `@Entity` 사용 |
| 비즈니스 메서드 | 도메인 로직 캡슐화 |
| Setter 지양 | 팩토리 메서드, Builder 사용 |
| 연관관계 | Lazy Loading 기본 |

### 6.5 DTO 계층

| 역할 | 규칙 |
|------|------|
| 데이터 전송 | `record` 또는 불변 클래스 |
| 검증 | Bean Validation 사용 |
| 변환 | MapStruct 매퍼 사용 |

---

## 7. 네이밍 규칙

### 7.1 파일/클래스명

| 항목 | 규칙 | 예시 |
|------|------|------|
| Controller | `{Domain}Controller` | `UserController.java` |
| Service (인터페이스) | `{Domain}Service` | `UserService.java` |
| Service (구현체) | `{Domain}ServiceImpl` | `UserServiceImpl.java` |
| Repository | `{Domain}Repository` | `UserRepository.java` |
| QueryDSL Repository | `{Domain}QueryRepository` | `UserQueryRepository.java` |
| Entity | `{Domain}` (단수형) | `User.java` |
| Request DTO | `{Domain}{Action}Request` | `UserCreateRequest.java` |
| Response DTO | `{Domain}Response` | `UserResponse.java` |
| Mapper | `{Domain}Mapper` | `UserMapper.java` |
| Exception | `{Domain}Exception` | `UserException.java` |
| Enum | `{Domain}{Type}` | `UserRole.java` |

### 7.2 메서드명

| 항목 | 규칙 | 예시 |
|------|------|------|
| 생성 | `create{Domain}` | `createUser()` |
| 조회 (단건) | `get{Domain}ById` | `getUserById()` |
| 조회 (목록) | `get{Domain}List` / `find{Domain}s` | `getUserList()` |
| 수정 | `update{Domain}` | `updateUser()` |
| 삭제 | `delete{Domain}` | `deleteUser()` |
| 검증 | `validate{Action}` | `validateEmail()` |
| 확인 | `check{Condition}` / `is{Condition}` | `isEmailDuplicated()` |

### 7.3 API 엔드포인트

| 메서드 | 패턴 | 예시 |
|--------|------|------|
| GET | `/api/v1/{domain}` | `GET /api/v1/users` |
| GET | `/api/v1/{domain}/{id}` | `GET /api/v1/users/1` |
| POST | `/api/v1/{domain}` | `POST /api/v1/users` |
| PUT | `/api/v1/{domain}/{id}` | `PUT /api/v1/users/1` |
| PATCH | `/api/v1/{domain}/{id}` | `PATCH /api/v1/users/1` |
| DELETE | `/api/v1/{domain}/{id}` | `DELETE /api/v1/users/1` |

---

## 8. 라인 수 제한 (권장)

| 분류 | 권장 | 최대 | 초과 시 조치 |
|------|------|------|-------------|
| Controller | **50줄** | 150줄 | API별 분리 |
| Service | **100줄** | 200줄 | ���직 분리 |
| Repository | **30줄** | 100줄 | 쿼리 메서드 분리 |
| Entity | **80줄** | 150줄 | Value Object 분리 |
| DTO | **30줄** | 50줄 | 중첩 클래스 지양 |
| Mapper | **30줄** | 80줄 | 복잡한 매핑 메서드 분리 |
| Config | **50줄** | 100줄 | 설정별 분리 |

---

## 9. 도메인 목록 및 관련 문서

| 도메인 | 설명 | 상세 문서 |
|--------|------|----------|
| user | 사용자 관리 | [02-user.md](./02-user.md) |
| auth | 인증/인가 | [03-auth.md](./03-auth.md) |
| workplace | 사업장 관리 | [04-workplace.md](./04-workplace.md) |
| member | 멤버십 관리 | [05-member.md](./05-member.md) |
| invitation | 초대 관리 | [06-invitation.md](./06-invitation.md) |
| attendance | 출퇴근 관리 | [07-attendance.md](./07-attendance.md) |
| payroll | 급여 관리 | [08-payroll.md](./08-payroll.md) |
| calendar | 캘린더 | [09-calendar.md](./09-calendar.md) |
| checklist | 체크리스트 | [10-checklist.md](./10-checklist.md) |
| contract | 근로계약서 | [11-contract.md](./11-contract.md) |
| announcement | 공지사항 | [12-announcement.md](./12-announcement.md) |
| chat | 채팅 | [13-chat.md](./13-chat.md) |
| notification | 알림 | [14-notification.md](./14-notification.md) |
| file | 파일 업로드 | [15-file.md](./15-file.md) |
| global | 전역 설정 | [16-global.md](./16-global.md) |
| infra | 외부 연동 | [17-infra.md](./17-infra.md) |

---

## 10. 관련 문서

- [Spring Initializr 설정](./00-spring-initializr.md)
- [기술 스택](../../tech-stack.md)
- [코딩 컨벤션](../../06_development/coding-conventions.md)
- [데이터베이스 설계](../../04_database/01-database-design.md)

