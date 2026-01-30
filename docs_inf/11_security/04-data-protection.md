# 데이터 보호 (Data Protection)

## 1. 데이터 분류

### 1.1 민감도 등급

| 등급 | 설명 | 예시 | 보호 수준 |
|------|------|------|----------|
| **Critical** | 유출 시 심각한 피해 | 비밀번호, 전자서명 | 암호화 + 접근 제어 + 감사 |
| **High** | 개인 식별 정보 | 주민번호, 계좌번호, 생년월일 | 암호화 + 접근 제어 |
| **Medium** | 업무 관련 민감 정보 | 급여, 근무 기록, 계약서 | 암호화 + 권한 기반 접근 |
| **Low** | 일반 업무 정보 | 공지사항, 체크리스트 | 접근 제어 |
| **Public** | 공개 가능 정보 | 사업장 이름 | 기본 보호 |

### 1.2 데이터 유형별 분류

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           데이터 분류 체계                                │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Critical (암호화 필수 + 접근 로깅)                                 │  │
│  │  - password_hash (비밀번호 해시)                                   │  │
│  │  - signature_url (전자서명 이미지)                                 │  │
│  │  - refresh_token (Redis)                                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ High (암호화 권장 + 접근 제어)                                     │  │
│  │  - 주민등록번호 (미저장 권장)                                      │  │
│  │  - 계좌번호 (마스킹 저장)                                          │  │
│  │  - birth_date (생년월일)                                           │  │
│  │  - phone (전화번호)                                                │  │
│  │  - business_number (사업자등록번호)                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Medium (접근 제어 + 권한 검증)                                     │  │
│  │  - hourly_wage, base_pay 등 급여 정보                             │  │
│  │  - clock_in, clock_out 등 근무 기록                               │  │
│  │  - 근로계약서 내용                                                 │  │
│  │  - GPS 위치 정보                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Low (기본 접근 제어)                                               │  │
│  │  - 공지사항, 체크리스트, 채팅 메시지                               │  │
│  │  - 사업장 기본 정보                                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 저장 데이터 암호화

### 2.1 PostgreSQL (RDS) 암호화

```yaml
# RDS 설정
rds:
  encryption:
    # 저장 암호화 (At-Rest)
    storage_encrypted: true
    kms_key_id: "arn:aws:kms:ap-northeast-2:xxx:key/xxx"
    
    # 전송 암호화 (In-Transit)
    ssl_enabled: true
    ssl_mode: "require"
```

### 2.2 애플리케이션 레벨 암호화

```java
/**
 * 민감 데이터 암호화 유틸리티
 * AES-256-GCM 사용
 */
@Component
public class EncryptionService {
    
    @Value("${encryption.secret-key}")
    private String secretKey;
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    
    /**
     * 민감 데이터 암호화
     */
    public String encrypt(String plainText) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8), 
                "AES"
            );
            
            // IV 생성
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            
            // 암호화
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
            
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // IV + 암호문 결합
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new EncryptionException("암호화 실패", e);
        }
    }
    
    /**
     * 민감 데이터 복호화
     */
    public String decrypt(String encryptedText) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedText);
            
            // IV 추출
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            
            // 암호문 추출
            byte[] encrypted = new byte[combined.length - iv.length];
            System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);
            
            SecretKeySpec keySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8), 
                "AES"
            );
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);
            
            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new EncryptionException("복호화 실패", e);
        }
    }
}
```

### 2.3 JPA Attribute Converter (자동 암호화)

```java
/**
 * 자동 암호화/복호화 Converter
 */
@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    
    private static EncryptionService encryptionService;
    
    @Autowired
    public void setEncryptionService(EncryptionService service) {
        EncryptedStringConverter.encryptionService = service;
    }
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        return encryptionService.encrypt(attribute);
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return encryptionService.decrypt(dbData);
    }
}

/**
 * Entity에서 사용
 */
@Entity
public class User {
    
    // 전화번호 암호화 저장
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone_encrypted")
    private String phone;
    
    // 사업자등록번호 암호화 저장
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "business_number_encrypted")
    private String businessNumber;
}
```

---

## 3. 데이터 마스킹

### 3.1 마스킹 유틸리티

```java
@Component
public class DataMaskingService {
    
    /**
     * 전화번호 마스킹
     * 010-1234-5678 → 010-****-5678
     */
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 8) return phone;
        return phone.replaceAll("(\\d{3})-?(\\d{4})-?(\\d{4})", "$1-****-$3");
    }
    
    /**
     * 이메일 마스킹
     * user@example.com → us**@example.com
     */
    public String maskEmail(String email) {
        if (email == null) return null;
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return email;
        
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        int visibleChars = Math.min(2, localPart.length());
        String masked = localPart.substring(0, visibleChars) + 
                       "*".repeat(localPart.length() - visibleChars);
        
        return masked + domain;
    }
    
    /**
     * 이름 마스킹
     * 홍길동 → 홍*동
     */
    public String maskName(String name) {
        if (name == null || name.length() < 2) return name;
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + 
               "*".repeat(name.length() - 2) + 
               name.charAt(name.length() - 1);
    }
    
    /**
     * 사업자등록번호 마스킹
     * 123-45-67890 → 123-**-*****
     */
    public String maskBusinessNumber(String businessNumber) {
        if (businessNumber == null) return null;
        return businessNumber.replaceAll(
            "(\\d{3})-?(\\d{2})-?(\\d{5})", 
            "$1-**-*****"
        );
    }
    
    /**
     * 계좌번호 마스킹
     * 1234567890 → ******7890
     */
    public String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) return accountNumber;
        int visibleDigits = 4;
        return "*".repeat(accountNumber.length() - visibleDigits) + 
               accountNumber.substring(accountNumber.length() - visibleDigits);
    }
}
```

### 3.2 DTO 레벨 마스킹

```java
/**
 * 직원 목록 응답 (마스킹 적용)
 */
@Getter
public class EmployeeListResponse {
    
    private UUID id;
    private String name;           // 마스킹 없음 (관리자 조회)
    private String maskedPhone;    // 마스킹된 전화번호
    private String maskedEmail;    // 마스킹된 이메일
    
    public static EmployeeListResponse from(Member member, DataMaskingService maskingService) {
        EmployeeListResponse response = new EmployeeListResponse();
        response.id = member.getId();
        response.name = member.getUser().getName();
        response.maskedPhone = maskingService.maskPhone(member.getUser().getPhone());
        response.maskedEmail = maskingService.maskEmail(member.getUser().getEmail());
        return response;
    }
}

/**
 * 본인 프로필 응답 (마스킹 없음)
 */
@Getter
public class MyProfileResponse {
    
    private UUID id;
    private String name;
    private String phone;    // 마스킹 없음
    private String email;    // 마스킹 없음
    
    public static MyProfileResponse from(User user) {
        // 본인 정보는 마스킹 없이 전체 표시
        MyProfileResponse response = new MyProfileResponse();
        response.id = user.getId();
        response.name = user.getName();
        response.phone = user.getPhone();
        response.email = user.getEmail();
        return response;
    }
}
```

---

## 4. S3 파일 보안

### 4.1 S3 버킷 정책

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::bizone-files",
        "arn:aws:s3:::bizone-files/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "AllowAppServerAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/bizone-app-server-role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::bizone-files/*"
    }
  ]
}
```

### 4.2 Presigned URL 생성

```java
@Service
public class S3Service {
    
    @Autowired
    private S3Client s3Client;
    
    @Autowired
    private S3Presigner s3Presigner;
    
    @Value("${aws.s3.bucket}")
    private String bucketName;
    
    /**
     * 업로드용 Presigned URL 생성 (5분 유효)
     */
    public PresignedUrlResponse generateUploadUrl(String fileName, String contentType) {
        String key = generateUniqueKey(fileName);
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .serverSideEncryption(ServerSideEncryption.AES256) // SSE-S3 암호화
            .build();
        
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .putObjectRequest(putObjectRequest)
            .signatureDuration(Duration.ofMinutes(5))
            .build();
        
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        return new PresignedUrlResponse(
            presignedRequest.url().toString(),
            key,
            presignedRequest.expiration()
        );
    }
    
    /**
     * 다운로드용 Presigned URL 생성 (15분 유효)
     */
    public String generateDownloadUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .getObjectRequest(getObjectRequest)
            .signatureDuration(Duration.ofMinutes(15))
            .build();
        
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
    
    /**
     * 고유 키 생성 (디렉토리 구조 포함)
     */
    private String generateUniqueKey(String fileName) {
        String uuid = UUID.randomUUID().toString();
        String extension = getFileExtension(fileName);
        String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        
        return String.format("%s/%s.%s", dateFolder, uuid, extension);
    }
}
```

### 4.3 파일 업로드 검증

```java
@Service
public class FileValidationService {
    
    // 허용된 파일 확장자
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "jpg", "jpeg", "png", "gif", "webp",  // 이미지
        "pdf", "doc", "docx", "xls", "xlsx",  // 문서
        "mp4", "mov", "avi",                   // 동영상
        "mp3", "wav", "m4a"                    // 오디오
    );
    
    // 최대 파일 크기 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    
    // 이미지 최대 크기 (10MB)
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    
    /**
     * 파일 검증
     */
    public void validateFile(String fileName, String contentType, long fileSize) {
        // 1. 확장자 검증
        String extension = getFileExtension(fileName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidFileException("허용되지 않은 파일 형식입니다: " + extension);
        }
        
        // 2. Content-Type 검증
        if (!isValidContentType(contentType, extension)) {
            throw new InvalidFileException("Content-Type이 확장자와 일치하지 않습니다.");
        }
        
        // 3. 파일 크기 검증
        long maxSize = isImageExtension(extension) ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
        if (fileSize > maxSize) {
            throw new InvalidFileException(
                String.format("파일 크기가 초과되었습니다. (최대: %dMB)", maxSize / 1024 / 1024)
            );
        }
    }
    
    /**
     * 파일 내용 검증 (Magic Number)
     */
    public void validateFileContent(byte[] fileHeader, String expectedType) {
        // 파일 시그니처 확인
        Map<String, byte[]> signatures = Map.of(
            "image/jpeg", new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF},
            "image/png", new byte[]{(byte)0x89, 0x50, 0x4E, 0x47},
            "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46}
        );
        
        byte[] expectedSignature = signatures.get(expectedType);
        if (expectedSignature != null) {
            for (int i = 0; i < expectedSignature.length; i++) {
                if (fileHeader[i] != expectedSignature[i]) {
                    throw new InvalidFileException("파일 내용이 확장자와 일치하지 않습니다.");
                }
            }
        }
    }
}
```

---

## 5. Redis 데이터 보안

### 5.1 Redis 보안 설정

```yaml
# Redis (ElastiCache) 설정
spring:
  data:
    redis:
      host: ${REDIS_HOST}
      port: 6379
      password: ${REDIS_PASSWORD}
      ssl:
        enabled: true
      timeout: 5000
```

### 5.2 민감 데이터 TTL 관리

```java
@Service
public class SecureRedisService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private EncryptionService encryptionService;
    
    /**
     * 민감 데이터 저장 (암호화 + TTL)
     */
    public void setSecure(String key, String value, long ttlSeconds) {
        String encrypted = encryptionService.encrypt(value);
        redisTemplate.opsForValue().set(key, encrypted, ttlSeconds, TimeUnit.SECONDS);
    }
    
    /**
     * 민감 데이터 조회 (복호화)
     */
    public String getSecure(String key) {
        String encrypted = redisTemplate.opsForValue().get(key);
        if (encrypted == null) return null;
        return encryptionService.decrypt(encrypted);
    }
    
    /**
     * Refresh Token 저장
     * - 암호화 저장
     * - 7일 TTL
     */
    public void saveRefreshToken(String tokenId, String userId) {
        String key = "refresh_token:" + tokenId;
        setSecure(key, userId, 7 * 24 * 60 * 60); // 7일
    }
    
    /**
     * 로그인 시도 횟수 (암호화 불필요)
     * - 30분 TTL
     */
    public void recordLoginAttempt(String username) {
        String key = "login_attempt:" + username;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 30, TimeUnit.MINUTES);
    }
}
```

---

## 6. 데이터 백업 및 복구

### 6.1 RDS 자동 백업

```yaml
# RDS 백업 설정
backup:
  # 자동 백업 활성화
  automated_backups: true
  # 보관 기간 (30일)
  backup_retention_period: 30
  # 백업 시간대 (한국 시간 새벽 3-4시)
  preferred_backup_window: "18:00-19:00"  # UTC
  # 암호화된 백업
  backup_encryption: true
  
  # 특정 시점 복구 (PITR)
  point_in_time_recovery: true
```

### 6.2 수동 스냅샷 정책

```
# 스냅샷 정책
- 배포 전: 수동 스냅샷 생성
- 월 1회: 정기 스냅샷 (장기 보관)
- 중요 변경 전: 임시 스냅샷

# 명명 규칙
bizone-db-{환경}-{날짜}-{용도}
예: bizone-db-prod-20251225-pre-deploy
```

---

## 7. 데이터 삭제 정책

### 7.1 개인정보 삭제

```java
@Service
public class DataDeletionService {
    
    /**
     * 사용자 탈퇴 처리
     * - 개인정보 익명화
     * - 연관 데이터 처리
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        // 1. 개인정보 익명화
        user.setUsername("deleted_" + UUID.randomUUID().toString().substring(0, 8));
        user.setEmail("deleted_" + UUID.randomUUID().toString() + "@deleted.local");
        user.setName("탈퇴회원");
        user.setPhone(null);
        user.setBirthDate(null);
        user.setProfileImageUrl(null);
        user.setDeviceToken(null);
        user.setPasswordHash("DELETED");
        user.setDeletedAt(LocalDateTime.now());
        
        // 2. S3 파일 삭제 (프로필 이미지)
        if (user.getProfileImageUrl() != null) {
            s3Service.deleteFile(user.getProfileImageUrl());
        }
        
        // 3. Redis 토큰 삭제
        refreshTokenService.deleteAllUserTokens(userId);
        
        // 4. 멤버십 비활성화
        memberRepository.deactivateAllByUserId(userId);
        
        userRepository.save(user);
    }
    
    /**
     * 데이터 보관 기간 경과 후 삭제
     */
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시
    public void cleanupExpiredData() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusYears(3);
        
        // 3년 경과 출퇴근 기록 삭제
        attendanceRepository.deleteByCreatedAtBefore(cutoffDate);
        
        // 3년 경과 채팅 메시지 삭제
        messageRepository.deleteByCreatedAtBefore(cutoffDate);
    }
}
```

---

## 8. 보안 체크리스트

### 8.1 데이터 보호 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| DB 저장 암호화 (At-Rest) | ✅ | RDS AES-256 |
| DB 전송 암호화 (In-Transit) | ✅ | SSL 필수 |
| 애플리케이션 레벨 암호화 | ✅ | 민감 필드 AES-GCM |
| S3 서버 측 암호화 | ✅ | SSE-S3 |
| Redis 암호화 | ✅ | 전송 암호화 + 민감 데이터 암호화 |
| 데이터 마스킹 | ✅ | 전화번호, 이메일, 이름 |
| 파일 검증 | ✅ | 확장자, 크기, Magic Number |
| Presigned URL | ✅ | 시간 제한 접근 |
| 자동 백업 | ✅ | 30일 보관 |
| PITR | ✅ | 특정 시점 복구 |
| 데이터 삭제 정책 | ✅ | 익명화 + 보관기간 관리 |

