# 01. 프로젝트 설정 TODO

> **Phase 1**: 개발 환경 설정 및 프로젝트 초기화  
> **예상 기간**: 1주  
> **우선순위**: 🔴 필수 (모든 개발의 선행 작업)

## 📊 진행 상황

**진행률**: 100% ✅ 완료

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 항목
- ✅ React Native 프로젝트 초기화 (0.83.1 + TypeScript)
- ✅ Spring Boot 프로젝트 설정 (4.0.1 + Java 21)
- ✅ Node.js 시그널링 서버 설정 (Express + Socket.IO)
- ✅ 핵심 패키지 설치 (Redux Toolkit, React Query, Navigation, Axios)
- ✅ JWT 기반 인증 설정
- ✅ Swagger OpenAPI 문서화

---

## 📚 참고 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 기술 스택 | `docs/03_architecture/tech-stack.md` | 프레임워크, 라이브러리 버전 |
| 파일 구조 | `docs/03_architecture/file_structure/` | 디렉토리 구조 설계 |
| 코딩 컨벤션 | `docs/06_development/coding-conventions.md` | 코드 스타일 가이드 |
| iOS 설정 | `docs/06_development/setup-ios.md` | iOS 개발 환경 |
| Android 설정 | `docs/06_development/setup-android.md` | Android 개발 환경 |
| AWS 설정 | `docs/10_aws/01-aws-setup.md` | AWS 인프라 설정 |

---

## ✅ TODO 체크리스트

### 1. 개발 환경 설정

#### 1.1 공통 환경
- [ ] **Node.js 설치 확인**
  - 버전: 24.11.0 LTS
  - `node -v`, `npm -v` 확인
  
- [ ] **JDK 설치 확인**
  - 버전: 21.0.8 (LTS)
  - `java -version` 확인

- [ ] **PostgreSQL 클라이언트 설치**
  - DBeaver 또는 pgAdmin

- [ ] **IDE 설정**
  - VS Code (Frontend)
  - IntelliJ IDEA (Backend)
  - 필수 확장 프로그램 설치

#### 1.2 iOS 환경 (macOS)
- [ ] Xcode 최신 버전 설치
- [ ] CocoaPods 설치 (`sudo gem install cocoapods`)
- [ ] Watchman 설치 (`brew install watchman`)
- [ ] iOS Simulator 설정

#### 1.3 Android 환경
- [ ] Android Studio 설치
- [ ] Android SDK 설치 (API 34+)
- [ ] 환경변수 설정 (`ANDROID_HOME`)
- [ ] Android Emulator 설정

---

### 2. React Native 프로젝트 초기화

#### 2.1 프로젝트 생성
```bash
npx react-native init BizOne --version 0.83.0
cd BizOne
```
- [ ] 프로젝트 생성 완료
- [ ] 초기 실행 테스트 (iOS/Android)

#### 2.2 폴더 구조 생성
```
src/
├── config/                 # 환경 설정
│   ├── api.ts             # API 설정
│   └── constants.ts       # 상수 정의
├── types/                  # TypeScript 타입 정의
│   ├── index.ts
│   ├── common.types.ts
│   ├── user.types.ts
│   └── ...
├── styles/                 # 전역 스타일
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── store/                  # Redux 스토어
│   ├── index.ts
│   ├── hooks.ts
│   └── slices/
├── services/               # API 서비스
├── hooks/                  # 커스텀 훅
├── navigation/             # 네비게이션
├── components/             # 공통 컴포넌트
│   ├── common/
│   └── shared/
├── features/               # 도메인별 기능
│   ├── auth/
│   ├── home/
│   ├── attendance/
│   ├── calendar/
│   ├── checklist/
│   ├── payroll/
│   ├── contract/
│   ├── announcement/
│   ├── chat/
│   ├── settings/
│   ├── admin/
│   └── workplace/
└── utils/                  # 유틸리티 함수
```
- [ ] 폴더 구조 생성
- [ ] 각 폴더에 index.ts 생성

#### 2.3 핵심 패키지 설치

**상태 관리**
```bash
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
```
- [ ] Redux Toolkit 설치
- [ ] React Query 설치

**네비게이션**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler
```
- [ ] React Navigation 설치
- [ ] 네이티브 의존성 설치

**UI 컴포넌트**
```bash
npm install react-native-paper react-native-vector-icons
npm install react-native-calendars
npm install react-native-maps
```
- [ ] React Native Paper 설치
- [ ] 아이콘 패키지 설치
- [ ] 캘린더 패키지 설치
- [ ] 지도 패키지 설치

**네트워크/스토리지**
```bash
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-keychain
```
- [ ] Axios 설치
- [ ] AsyncStorage 설치
- [ ] Keychain (보안 저장소) 설치

**GPS/위치**
```bash
npm install react-native-geolocation-service
npm install @react-native-community/geolocation
```
- [ ] 위치 서비스 패키지 설치

**실시간 통신**
```bash
npm install socket.io-client
```
- [ ] Socket.IO 클라이언트 설치

**PDF/Excel**
```bash
npm install react-native-html-to-pdf
npm install xlsx
npm install react-native-share
```
- [ ] PDF 생성 패키지 설치
- [ ] Excel 생성 패키지 설치

**기타**
```bash
npm install date-fns
npm install react-native-signature-canvas
npm install react-native-image-picker
npm install react-native-document-picker
```
- [ ] 날짜 유틸리티 설치
- [ ] 전자서명 패키지 설치
- [ ] 이미지 선택 패키지 설치
- [ ] 문서 선택 패키지 설치

#### 2.4 iOS 네이티브 설정
```bash
cd ios && pod install && cd ..
```
- [ ] CocoaPods 설치
- [ ] Info.plist 권한 설정
  - 위치 권한 (NSLocationWhenInUseUsageDescription)
  - 카메라 권한 (NSCameraUsageDescription)
  - 사진 라이브러리 권한 (NSPhotoLibraryUsageDescription)
- [ ] iOS 빌드 테스트

#### 2.5 Android 네이티브 설정
- [ ] AndroidManifest.xml 권한 설정
  - 위치 권한 (ACCESS_FINE_LOCATION)
  - 인터넷 권한 (INTERNET)
  - 카메라 권한 (CAMERA)
- [ ] build.gradle 설정
- [ ] Android 빌드 테스트

---

### 3. Spring Boot 프로젝트 초기화

#### 3.1 프로젝트 생성
- [ ] Spring Initializr로 프로젝트 생성
  - **Project**: Gradle - Groovy
  - **Language**: Java
  - **Spring Boot**: 4.0.1
  - **Packaging**: Jar
  - **Java**: 21

#### 3.2 의존성 추가 (build.gradle)
```gradle
dependencies {
    // Web
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // Security
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Database
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    implementation 'org.flywaydb:flyway-core'
    runtimeOnly 'org.postgresql:postgresql'
    runtimeOnly 'com.h2database:h2'
    
    // Cache
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    
    // Documentation
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // Utilities
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    
    // Monitoring
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```
- [ ] 의존성 추가 완료
- [ ] Gradle 빌드 성공 확인

#### 3.3 프로젝트 구조 생성
```
src/main/java/com/bizone/
├── config/                 # 설정
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   ├── WebConfig.java
│   └── SwaggerConfig.java
├── common/                 # 공통
│   ├── dto/
│   ├── exception/
│   └── util/
├── domain/                 # 도메인별 패키지
│   ├── auth/
│   ├── user/
│   ├── workplace/
│   ├── attendance/
│   ├── checklist/
│   ├── payroll/
│   ├── contract/
│   ├── announcement/
│   └── chat/
└── BizOneApplication.java
```
- [ ] 패키지 구조 생성

#### 3.4 프로파일 설정
- [ ] **application.yml** (공통)
- [ ] **application-dev.yml** (개발)
  - H2 Database
  - 로깅 레벨 DEBUG
- [ ] **application-prod.yml** (운영)
  - PostgreSQL (RDS)
  - 로깅 레벨 INFO

#### 3.5 Swagger 설정
- [ ] OpenAPI 3.0 설정
- [ ] `/swagger-ui.html` 접근 확인

---

### 4. Node.js 시그널링 서버 초기화

#### 4.1 프로젝트 생성
```bash
mkdir signaling-server
cd signaling-server
npm init -y
```
- [ ] 프로젝트 초기화

#### 4.2 의존성 설치
```bash
npm install express socket.io cors
npm install @socket.io/redis-adapter ioredis
npm install jsonwebtoken
npm install --save-dev typescript @types/node @types/express ts-node
```
- [ ] 패키지 설치 완료

#### 4.3 TypeScript 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```
- [ ] TypeScript 설정

#### 4.4 프로젝트 구조
```
signaling-server/
├── src/
│   ├── index.ts           # 진입점
│   ├── socket/            # Socket.IO 핸들러
│   ├── middleware/        # 미들웨어
│   └── utils/             # 유틸리티
├── package.json
└── tsconfig.json
```
- [ ] 구조 생성

---

### 5. AWS 서비스 설정

**참고**: `docs/10_aws/01-aws-setup.md`

#### 5.1 AWS 계정 설정
- [ ] AWS 계정 생성/로그인
- [ ] IAM 사용자 생성
- [ ] Access Key 발급
- [ ] AWS CLI 설정

#### 5.2 VPC 구성
- [ ] VPC 생성
- [ ] 서브넷 구성 (public/private)
- [ ] 인터넷 게이트웨이
- [ ] 보안 그룹 설정

#### 5.3 RDS (PostgreSQL)
- [ ] RDS 인스턴스 생성
  - 엔진: PostgreSQL 18.1
  - 인스턴스: db.t3.micro (개발)
- [ ] 연결 테스트

#### 5.4 ElastiCache (Redis)
- [ ] Redis 클러스터 생성
- [ ] 연결 테스트

#### 5.5 S3
- [ ] 버킷 생성 (파일 저장용)
- [ ] CORS 설정
- [ ] 버킷 정책 설정

#### 5.6 EC2/ECS (선택)
- [ ] 서버 인스턴스 생성
- [ ] 보안 그룹 연결

---

### 6. 환경 변수 설정

#### 6.1 React Native (.env)
```env
API_BASE_URL=http://localhost:8080/api/v1
SOCKET_URL=http://localhost:3001
```
- [ ] .env 파일 생성
- [ ] react-native-config 설정

#### 6.2 Spring Boot
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:bizonedb;MODE=PostgreSQL
  redis:
    host: localhost
    port: 6379

jwt:
  secret: ${JWT_SECRET}
  access-token-validity: 3600
  refresh-token-validity: 604800
```
- [ ] 환경변수 설정

#### 6.3 Node.js (.env)
```env
PORT=3001
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8081
```
- [ ] .env 파일 생성

---

### 7. 개발 서버 실행 테스트

#### 7.1 전체 서비스 실행
- [ ] **PostgreSQL/H2** 실행
- [ ] **Redis** 실행
- [ ] **Spring Boot** 실행 (`./gradlew bootRun`)
- [ ] **Node.js 시그널링 서버** 실행 (`npm run dev`)
- [ ] **Metro Bundler** 실행 (`npm start`)
- [ ] **iOS Simulator** 실행 (`npm run ios`)
- [ ] **Android Emulator** 실행 (`npm run android`)

#### 7.2 연동 테스트
- [ ] API 호출 테스트 (Postman/Swagger)
- [ ] Socket 연결 테스트
- [ ] 앱 → API 통신 테스트

---

## 📁 산출물

| 산출물 | 경로 |
|--------|------|
| React Native 프로젝트 | `/front/` |
| Spring Boot 프로젝트 | `/back/` |
| Node.js 시그널링 서버 | `/signaling/` |
| 환경 변수 템플릿 | `.env.example` |

---

## ⏭️ 다음 단계

이 문서 완료 후:
1. → [01-common.md](./01-common.md) (공통 컴포넌트)
2. → [11-database.md](./11-database.md) (데이터베이스 설계)

