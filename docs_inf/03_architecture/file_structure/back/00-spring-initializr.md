# Spring Boot 프로젝트 초기화 가이드

> **최종 업데이트**: 2024-12-25
> **Spring Initializr URL**: https://start.spring.io

## 1. 프로젝트 기본 설정

### 1.1 Project Metadata

| 항목 | 값 | 설명 |
|------|-----|------|
| **Project** | Gradle - Groovy | 빌드 도구 |
| **Language** | Java | 프로그래밍 언어 |
| **Spring Boot** | 4.0.1 | 스프링 부트 버전 |
| **Group** | com.bizone | 그룹 ID |
| **Artifact** | api | 아티팩트 ID |
| **Name** | Biz_One API | 프로젝트 이름 |
| **Description** | Biz_One Mobile App Backend API | 프로젝트 설명 |
| **Package name** | com.bizone.api | 기본 패키지 |
| **Packaging** | Jar | 패키징 방식 |
| **Java** | 21 | Java 버전 (LTS) |

---

## 2. 필수 의존성 (Dependencies)

### 2.1 Spring Boot Core

| 의존성 | 설명 | 용도 |
|--------|------|------|
| **Spring Web** | `spring-boot-starter-web` | REST API 구현 |
| **Spring Data JPA** | `spring-boot-starter-data-jpa` | ORM, 데이터 액세스 |
| **Spring Security** | `spring-boot-starter-security` | 인증/인가 |
| **Spring Validation** | `spring-boot-starter-validation` | 입력 검증 (@Valid, Bean Validation) |
| **Spring Actuator** | `spring-boot-starter-actuator` | 헬스체크, 모니터링 |
| **Spring Mail** | `spring-boot-starter-mail` | 이메일 발송 (SMTP) |
| **Spring AOP** | `spring-boot-starter-aop` | AOP 지원 (로깅, 트랜잭션) |
| **Spring WebSocket** | `spring-boot-starter-websocket` | 실시간 채팅 |

### 2.2 Database

| 의존성 | 설명 | 용도 |
|--------|------|------|
| **PostgreSQL Driver** | `org.postgresql:postgresql` | PostgreSQL 연결 드라이버 |
| **H2 Database** | `com.h2database:h2` (runtime) | 개발/테스트용 인메모리 DB |
| **Flyway Migration** | `org.flywaydb:flyway-core` | DB 마이그레이션 관리 |
| **Flyway PostgreSQL** | `org.flywaydb:flyway-database-postgresql` | PostgreSQL Flyway 지원 |

### 2.3 개발 도구

| 의존성 | 설명 | 용도 |
|--------|------|------|
| **Lombok** | `org.projectlombok:lombok` | 보일러플레이트 코드 감소 |
| **Spring Boot DevTools** | `spring-boot-devtools` (developmentOnly) | 개발 시 자동 재시작 |
| **Spring Configuration Processor** | `spring-boot-configuration-processor` | 설정 파일 자동완성 |

### 2.4 테스트

| 의존성 | 설명 | 용도 |
|--------|------|------|
| **Spring Boot Test** | `spring-boot-starter-test` | 통합 테스트 |
| **Spring Security Test** | `spring-security-test` | 보안 테스트 |

---

## 3. 추가 의존성 (Gradle 직접 추가)

Spring Initializr에서 선택할 수 없어 `build.gradle`에 직접 추가해야 하는 의존성입니다.

### 3.1 JWT 인증

```groovy
// JWT (JSON Web Token)
implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'
```

### 3.2 QueryDSL (타입 안전 동적 쿼리)

```groovy
// QueryDSL
implementation 'com.querydsl:querydsl-jpa:5.1.0:jakarta'
annotationProcessor 'com.querydsl:querydsl-apt:5.1.0:jakarta'
annotationProcessor 'jakarta.annotation:jakarta.annotation-api'
annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
```

### 3.3 MapStruct (DTO-Entity 매핑)

```groovy
// MapStruct
implementation 'org.mapstruct:mapstruct:1.5.5.Final'
annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'

// Lombok + MapStruct 바인딩 (순서 중요)
annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
```

### 3.4 API 문서화 (Swagger/OpenAPI)

```groovy
// SpringDoc OpenAPI (Swagger UI)
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
```

### 3.5 PDF 생성

```groovy
// iText PDF (급여 명세서 PDF 생성)
implementation 'com.itextpdf:itext-core:8.0.5'
implementation 'com.itextpdf:html2pdf:5.0.5'
```

### 3.6 Excel 생성

```groovy
// Apache POI (근무 기록 Excel 추출)
implementation 'org.apache.poi:poi:5.3.0'
implementation 'org.apache.poi:poi-ooxml:5.3.0'
```

### 3.7 HTTP 클라이언트 (외부 API 호출)

```groovy
// WebClient (사업자 진위확인 API, 지오코딩 API)
implementation 'org.springframework.boot:spring-boot-starter-webflux'
```

### 3.8 캐싱

```groovy
// Redis Cache (선택사항 - 프로덕션 환경)
implementation 'org.springframework.boot:spring-boot-starter-data-redis'

// Caffeine Cache (로컬 캐시)
implementation 'com.github.ben-manes.caffeine:caffeine:3.1.8'
implementation 'org.springframework.boot:spring-boot-starter-cache'
```

### 3.9 푸시 알림

```groovy
// Firebase Admin SDK (FCM 푸시 알림)
implementation 'com.google.firebase:firebase-admin:9.3.0'
```

### 3.10 Utilities

```groovy
// Commons Lang (문자열/객체 유틸리티)
implementation 'org.apache.commons:commons-lang3:3.17.0'

// Guava (구글 유틸리티)
implementation 'com.google.guava:guava:33.3.1-jre'
```

---

## 4. 전체 build.gradle 예시

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.1'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.bizone'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-mail'
    implementation 'org.springframework.boot:spring-boot-starter-aop'
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    implementation 'org.springframework.boot:spring-boot-starter-webflux'
    implementation 'org.springframework.boot:spring-boot-starter-cache'
    
    // Database
    implementation 'org.postgresql:postgresql'
    implementation 'org.flywaydb:flyway-core'
    implementation 'org.flywaydb:flyway-database-postgresql'
    runtimeOnly 'com.h2database:h2'
    
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'
    
    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.1.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.1.0:jakarta'
    annotationProcessor 'jakarta.annotation:jakarta.annotation-api'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
    
    // MapStruct
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    
    // Lombok (순서 중요: MapStruct 전에 선언)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
    
    // API Documentation
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
    
    // PDF Generation
    implementation 'com.itextpdf:itext-core:8.0.5'
    implementation 'com.itextpdf:html2pdf:5.0.5'
    
    // Excel Generation
    implementation 'org.apache.poi:poi:5.3.0'
    implementation 'org.apache.poi:poi-ooxml:5.3.0'
    
    // Cache
    implementation 'com.github.ben-manes.caffeine:caffeine:3.1.8'
    
    // Firebase (FCM)
    implementation 'com.google.firebase:firebase-admin:9.3.0'
    
    // Utilities
    implementation 'org.apache.commons:commons-lang3:3.17.0'
    implementation 'com.google.guava:guava:33.3.1-jre'
    
    // Dev Tools
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
    
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}

// QueryDSL 설정
def querydslDir = "$buildDir/generated/querydsl"

sourceSets {
    main.java.srcDirs += [querydslDir]
}

tasks.withType(JavaCompile) {
    options.annotationProcessorGeneratedSourcesDirectory = file(querydslDir)
}

clean.doLast {
    file(querydslDir).deleteDir()
}
```

---

## 5. Spring Initializr 선택 요약

### 5.1 체크할 의존성

```
✅ Spring Web
✅ Spring Data JPA
✅ Spring Security
✅ Validation
✅ Spring Boot Actuator
✅ Java Mail Sender
✅ Spring for Apache Kafka (선택사항)
✅ WebSocket
✅ PostgreSQL Driver
✅ H2 Database
✅ Flyway Migration
✅ Lombok
✅ Spring Boot DevTools
✅ Spring Configuration Processor
```

### 5.2 직접 추가할 의존성

```
📝 JWT (jjwt)
📝 QueryDSL
📝 MapStruct
📝 SpringDoc OpenAPI
📝 iText PDF
📝 Apache POI
📝 WebFlux (WebClient용)
📝 Caffeine Cache
📝 Firebase Admin SDK
📝 Commons Lang3
📝 Guava
```

---

## 6. 관련 문서

- [백엔드 파일 구조 개요](./01-overview.md)
- [기술 스택](../../tech-stack.md)
- [데이터베이스 설계](../../04_database/01-database-design.md)

