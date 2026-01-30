# 기술 스택

## 1. Frontend (React Native)

### 1.1 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **React Native** | 0.83 | 크로스 플랫폼 모바일 앱 |
| **JavaScript** | ES6+ | 프로그래밍 언어 |
| **PropTypes** | - | 런타임 타입 검사 |

### 1.2 상태 관리

| 기술 | 용도 |
|------|------|
| **Redux Toolkit** | 전역 상태 관리 |
| **React Query** | 서버 상태 관리/캐싱 |

### 1.3 네비게이션

| 기술 | 용도 |
|------|------|
| **@react-navigation/native** | 기본 네비게이션 |
| **@react-navigation/stack** | 스택 네비게이션 |
| **@react-navigation/bottom-tabs** | 하단 탭 네비게이션 |

### 1.4 UI 컴포넌트

| 기술 | 용도 |
|------|------|
| **react-native-paper** | Material Design UI |
| **react-native-vector-icons** | 아이콘 |
| **react-native-calendars** | 캘린더 컴포넌트 |
| **react-native-maps** | 지도 (사업장 위치 설정) |

### 1.5 실시간 통신

| 기술 | 용도 |
|------|------|
| **socket.io-client** | WebSocket 클라이언트 (실시간 통신) |

### 1.6 HTTP 클라이언트

| 기술 | 용도 |
|------|------|
| **axios** | REST API 통신 |

---

## 2. Backend (Spring Boot)

### 2.1 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **Spring Boot** | 4.0.1 | 백엔드 프레임워크 |
| **Java (JDK)** | 21.0.8 (LTS) | 프로그래밍 언어 |
| **Gradle** | Groovy DSL | 빌드 도구 |

### 2.2 Spring 모듈

| 기술 | 용도 |
|------|------|
| **Spring Web** | REST API |
| **Spring Data JPA** | ORM, 데이터 액세스 |
| **Spring Security** | 인증/인가 |
| **Spring Validation** | 입력 검증 |
| **Spring Actuator** | 헬스체크, 모니터링 |

### 2.3 데이터베이스

| 기술 | 용도 |
|------|------|
| **PostgreSQL 18.1** | 메인 데이터베이스 |
| **QueryDSL** | 타입 안전 동적 쿼리 |
| **Flyway** | DB 마이그레이션 |

### 2.4 보안

| 기술 | 용도 |
|------|------|
| **JWT (jjwt)** | 토큰 기반 인증 |
| **BCrypt** | 비밀번호 해시 |

### 2.5 기타

| 기술 | 용도 |
|------|------|
| **Lombok** | 보일러플레이트 코드 감소 |
| **MapStruct** | DTO-Entity 매핑 |
| **Swagger/OpenAPI** | API 문서화 |

---

## 3. Signaling Server (Node.js)

### 3.1 런타임

| 기술 | 버전 | 용도 |
|------|------|------|
| **Node.js** | 24.11.0 LTS | JavaScript 런타임 |
| **TypeScript** | 5.x | 정적 타입 언어 |

### 3.2 실시간 통신

| 기술 | 용도 |
|------|------|
| **Socket.IO** | WebSocket 서버 |
| **@socket.io/redis-adapter** | 다중 인스턴스 동기화 |

### 3.3 기타

| 기술 | 용도 |
|------|------|
| **Express** | HTTP 서버 (헬스체크) |
| **jsonwebtoken** | JWT 검증 |
| **ioredis** | Redis 클라이언트 |

---

## 4. AWS 서비스

### 4.1 컴퓨팅

| 서비스 | 용도 |
|--------|------|
| **EC2** | Spring Boot API 서버 (또는 ECS) |
| **ECS Fargate** | Node.js 시그널링 서버 (동적 스케일링) |
| **ECR** | Docker 이미지 저장소 |

### 4.2 데이터베이스 및 캐시

| 서비스 | 용도 |
|--------|------|
| **RDS (PostgreSQL)** | 메인 관계형 데이터베이스 |
| **ElastiCache (Redis)** | 세션 캐싱, Socket.IO Pub/Sub |

### 4.3 스토리지

| 서비스 | 용도 |
|--------|------|
| **S3** | 파일 저장 (이미지, PDF, 첨부파일) |
| **CloudFront** | CDN, 정적 파일 배포 |

### 4.4 네트워킹

| 서비스 | 용도 |
|--------|------|
| **ALB** | 로드 밸런싱 (HTTP/WebSocket) |
| **Route 53** | DNS 관리 |
| **VPC** | 네트워크 격리 |

### 4.5 모니터링

| 서비스 | 용도 |
|--------|------|
| **CloudWatch** | 로그, 메트릭, 알람 |
| **X-Ray** | 분산 추적 (선택적) |

---

## 5. 인증 (직접 구현)

| 기술 | 용도 |
|------|------|
| **Spring Security** | 인증/인가 프레임워크 |
| **JWT (jjwt)** | Access/Refresh Token 생성/검증 |
| **BCrypt** | 비밀번호 해시 |
| **Redis** | Refresh Token 저장, 세션 관리 |

### 5.1 인증 흐름
```
[회원가입]
App → POST /api/v1/auth/signup → 비밀번호 BCrypt 해시 → DB 저장

[로그인]
App → POST /api/v1/auth/login → 비밀번호 검증 → JWT 발급 (Access + Refresh)

[API 호출]
App → Authorization: Bearer {accessToken} → Spring Security 필터 → 토큰 검증

[토큰 갱신]
App → POST /api/v1/auth/refresh → Refresh Token 검증 → 새 Access Token 발급
```

### 5.2 토큰 설정
- **Access Token**: 1시간 만료
- **Refresh Token**: 7일 만료 (Redis 저장)
- **자동 로그인**: Refresh Token으로 Access Token 자동 갱신

---

## 6. 푸시 알림 (직접 구현)

| 방식 | 용도 |
|------|------|
| **Socket.IO** | 앱 포그라운드 실시간 알림 |
| **APNs (직접 연동)** | iOS 백그라운드 푸시 |
| **FCM HTTP v1 API** | Android 백그라운드 푸시 |

### 6.1 푸시 알림 아키텍처
```
[포그라운드 - 실시간]
Spring Boot → Redis Pub/Sub → Node.js Signaling → Socket.IO → App

[백그라운드 - 푸시]
Spring Boot → Push Service → APNs/FCM HTTP API → 디바이스
```

### 6.2 디바이스 토큰 관리
- **저장**: users 테이블에 device_token, device_platform 저장
- **갱신**: 앱 시작 시 토큰 갱신 API 호출
- **iOS**: APNs 인증서/키 기반 직접 연동
- **Android**: FCM HTTP v1 API 직접 호출 (서비스 계정 키 사용)

### 6.3 알림 유형
| 유형 | 전송 방식 |
|------|----------|
| 채팅 메시지 | Socket.IO (실시간) + 푸시 (백그라운드) |
| 출퇴근 알림 | Socket.IO |
| 체크리스트 할당 | 푸시 |
| 공지사항 | 푸시 |
| 계약서 발송/서명 | 푸시 |
| 급여 지급일 | 푸시 |

---

## 7. 위치/GPS

| 기술 | 용도 |
|------|------|
| **react-native-geolocation-service** | GPS 위치 획득 |
| **geolib** | 좌표 계산 (거리 계산) |
| **네이버 지오코딩 API** | 주소 → GPS 좌표 변환 (무료, 월 6만건) |

### 7.1 네이버 지오코딩 API (우선 선택)
- **선택 이유**: 무료로 사용 가능, 한국 주소 정확도 우수
- **API URL**: `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode`
- **인증**: 클라이언트 ID + 클라이언트 Secret (네이버 클라우드 플랫폼)
- **무료 할당량**: 월 6만건
- **용도**: 도로명 주소 입력 시 GPS 좌표 자동 변환
- **대안**: 카카오 지오코딩 API (무료, 월 3만건)

---

## 8. 문서/파일

| 기술 | 용도 |
|------|------|
| **react-native-html-to-pdf** | PDF 생성 (클라이언트) |
| **Apache PDFBox** | PDF 생성 (서버, Spring Boot) |
| **xlsx** | 엑셀 파일 생성 |
| **react-native-share** | 파일 공유 |
| **react-native-fs** | 파일 시스템 접근 |
| **react-native-image-picker** | 카메라/갤러리 |
| **react-native-document-picker** | 파일 선택 |

---

## 9. 서명

| 기술 | 용도 |
|------|------|
| **react-native-signature-canvas** | 전자서명 패드 |

---

## 10. 로컬 저장소

| 기술 | 용도 |
|------|------|
| **@react-native-async-storage/async-storage** | 로컬 키-값 저장 |
| **react-native-keychain** | 암호화 저장 (토큰) |

---

## 11. 앱 내 알림 (Frontend)

| 기술 | 용도 |
|------|------|
| **@notifee/react-native** | 로컬 알림 표시 |
| **react-native-push-notification** | 푸시 알림 수신 처리 |

---

## 12. 애니메이션

| 기술 | 용도 |
|------|------|
| **react-native-reanimated** | 고성능 애니메이션 |
| **react-native-gesture-handler** | 제스처 인식 |

---

## 13. 개발 도구

### 13.1 Frontend

| 기술 | 용도 |
|------|------|
| **TypeScript** | 정적 타입 검사 |
| **ESLint** | 코드 린팅 |
| **Prettier** | 코드 포맷팅 |
| **Jest** | 단위 테스트 |
| **React Native Testing Library** | 컴포넌트 테스트 |
| **Flipper** | 디버깅 |

### 13.2 Backend

| 기술 | 용도 |
|------|------|
| **JUnit 5** | 단위 테스트 |
| **Mockito** | 모킹 |
| **Testcontainers** | 통합 테스트 |
| **SonarQube** | 코드 품질 분석 (선택적) |

### 13.3 인프라

| 기술 | 용도 |
|------|------|
| **Docker** | 컨테이너화 |
| **Docker Compose** | 로컬 개발 환경 |
| **AWS CLI** | AWS 명령줄 도구 |
| **GitHub Actions** | CI/CD |

---

## 14. 패키지 설치 명령어

### 14.1 React Native (Frontend)

```bash
# TypeScript
npm install typescript @types/react @types/react-native
npm install @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Core
npm install @reduxjs/toolkit react-redux @tanstack/react-query axios
npm install @types/react-redux

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI
npm install react-native-paper react-native-vector-icons
npm install react-native-calendars react-native-maps

# Real-time Communication
npm install socket.io-client

# Push Notification (로컬 알림)
npm install @notifee/react-native
npm install react-native-push-notification

# Location
npm install react-native-geolocation-service geolib

# File/Document
npm install react-native-html-to-pdf xlsx react-native-share react-native-fs
npm install react-native-image-picker react-native-document-picker

# Signature
npm install react-native-signature-canvas

# Storage
npm install @react-native-async-storage/async-storage
npm install react-native-keychain

# Animation
npm install react-native-reanimated react-native-gesture-handler
```

### 14.2 Spring Boot (Backend) - build.gradle

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.1'
    id 'io.spring.dependency-management' version '1.1.4'
}

java {
    sourceCompatibility = '21'
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    
    // Database
    runtimeOnly 'org.postgresql:postgresql'
    implementation 'org.flywaydb:flyway-core'
    
    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    annotationProcessor 'jakarta.annotation:jakarta.annotation-api'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
    
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // AWS SDK (S3만 사용)
    implementation platform('software.amazon.awssdk:bom:2.21.0')
    implementation 'software.amazon.awssdk:s3'
    
    // Push Notification (직접 구현)
    implementation 'com.eatthepath:pushy:0.15.2'           // APNs
    implementation 'com.google.firebase:firebase-admin:9.2.0'  // FCM HTTP v1
    
    // Utilities
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    
    // API Documentation
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // PDF Generation
    implementation 'org.apache.pdfbox:pdfbox:3.0.0'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.testcontainers:postgresql'
}
```

### 14.3 Node.js (Signaling Server) - package.json

```json
{
  "name": "bizone-signaling-server",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=24.11.0"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "dependencies": {
    "socket.io": "^4.7.2",
    "@socket.io/redis-adapter": "^8.2.1",
    "ioredis": "^5.3.2",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

---

## 15. 환경 변수

### 15.1 Spring Boot (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  data:
    redis:
      host: ${REDIS_HOST}
      port: 6379

aws:
  region: ap-northeast-2
  s3:
    bucket: ${S3_BUCKET_NAME}

# JWT 설정 (직접 구현)
jwt:
  secret: ${JWT_SECRET}
  access-expiration: 3600000       # 1시간
  refresh-expiration: 604800000    # 7일

# 푸시 알림 설정 (직접 구현)
push:
  apns:
    enabled: true
    key-id: ${APNS_KEY_ID}
    team-id: ${APNS_TEAM_ID}
    key-path: ${APNS_KEY_PATH}
    bundle-id: ${APNS_BUNDLE_ID}
    production: false
  fcm:
    enabled: true
    credentials-path: ${FCM_CREDENTIALS_PATH}
```

### 15.2 Node.js (.env)

```env
PORT=3001
NODE_ENV=production

# Redis
REDIS_HOST=redis-cluster.xxx.cache.amazonaws.com
REDIS_PORT=6379

# JWT (직접 검증)
JWT_SECRET=your_jwt_secret_key

# CORS
ALLOWED_ORIGINS=https://api.bizone.com
```

### 15.3 React Native (.env)

```env
API_BASE_URL=https://api.bizone.com/api/v1
SOCKET_URL=wss://socket.bizone.com

# AWS (S3만 사용)
AWS_REGION=ap-northeast-2
S3_BUCKET=bizone-files

# Naver Geocoding
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

