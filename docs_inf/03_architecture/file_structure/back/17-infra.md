# 인프라 (Infrastructure)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.infra`

## 1. 개요

인프라 패키지는 외부 서비스 연동 (API, Firebase, 이메일, 스토리지 등)을 담당합니다.

---

## 2. 패키지 구조

```
infra/
├── external/                                # 외부 API 클라이언트
│   ├── business/
│   │   ├── BusinessVerificationClient.java  # 사업자 진위확인 API (~80줄)
│   │   ├── BusinessVerificationRequest.java # 요청 DTO (~20줄)
│   │   └── BusinessVerificationResponse.java # 응답 DTO (~25줄)
│   │
│   └── geocoding/
│       ├── GeocodingClient.java             # 지오코딩 API (네이버) (~70줄)
│       ├── GeocodingRequest.java            # 요청 DTO (~15줄)
│       └── GeocodingResponse.java           # 응답 DTO (~30줄)
│
├── firebase/                                # Firebase 서비스
│   ├── FcmService.java                      # FCM 푸시 알림 서비스 (~80줄)
│   ├── FcmConfig.java                       # Firebase 설정 (~30줄)
│   └── FcmMessage.java                      # FCM 메시지 DTO (~25줄)
│
├── mail/                                    # 이메일 서비스
│   ├── MailService.java                     # 이메일 발송 서비스 (~60줄)
│   ├── MailConfig.java                      # 이메일 설정 (~25줄)
│   └── MailTemplate.java                    # 이메일 템플릿 enum (~20줄)
│
└── storage/                                 # 파일 스토리지
    ├── S3StorageService.java                # S3 스토리지 서비스 (~80줄)
    └── S3Config.java                        # S3 설정 (~30줄)
```

---

## 3. 상세 파일 구조

### 3.1 External - 사업자 진위확인

#### BusinessVerificationClient.java (~80줄)

```java
package com.bizone.api.infra.external.business;

@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessVerificationClient {

    private final WebClient webClient;

    @Value("${external.business-verification.api-key}")
    private String apiKey;

    @Value("${external.business-verification.base-url}")
    private String baseUrl;

    /**
     * 국세청 사업자등록 상태조회 API 호출
     * @param businessNumber 사업자등록번호 (10자리)
     * @param representativeName 대표자명
     * @param openDate 개업일 (YYYYMMDD)
     * @return 진위확인 결과
     */
    public BusinessVerificationResponse verify(String businessNumber, 
                                               String representativeName,
                                               LocalDate openDate) {
        try {
            BusinessVerificationRequest request = new BusinessVerificationRequest(
                businessNumber,
                representativeName,
                openDate.format(DateTimeFormatter.BASIC_ISO_DATE)
            );

            return webClient.post()
                .uri(baseUrl + "/status")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(BusinessVerificationResponse.class)
                .block();

        } catch (WebClientResponseException e) {
            log.error("Business verification API error: {}", e.getResponseBodyAsString());
            throw new BusinessVerificationException("사업자 진위확인 API 호출에 실패했습니다.");
        }
    }

    /**
     * 사업자 상태 확인
     * @return true: 계속사업자, false: 휴업/폐업
     */
    public boolean isActiveBusinessStatus(String businessNumber) {
        // 상태조회 API 호출
        // "01": 계속사업자, "02": 휴업자, "03": 폐업자
        return true; // 구현 예시
    }
}
```

### 3.2 External - 지오코딩

#### GeocodingClient.java (~70줄)

```java
package com.bizone.api.infra.external.geocoding;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeocodingClient {

    private final WebClient webClient;

    @Value("${external.naver.client-id}")
    private String clientId;

    @Value("${external.naver.client-secret}")
    private String clientSecret;

    private static final String GEOCODING_URL = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode";

    /**
     * 주소를 GPS 좌표로 변환 (지오코딩)
     * @param address 도로명 주소
     * @return GPS 좌표 (위도, 경도)
     */
    public GeocodingResponse geocode(String address) {
        try {
            return webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path(GEOCODING_URL)
                    .queryParam("query", address)
                    .build())
                .header("X-NCP-APIGW-API-KEY-ID", clientId)
                .header("X-NCP-APIGW-API-KEY", clientSecret)
                .retrieve()
                .bodyToMono(GeocodingResponse.class)
                .block();

        } catch (WebClientResponseException e) {
            log.error("Geocoding API error: {}", e.getResponseBodyAsString());
            throw new GeocodingException("지오코딩 API 호출에 실패했습니다.");
        }
    }

    /**
     * 주소로부터 위도/경도 추출
     */
    public Coordinates getCoordinates(String address) {
        GeocodingResponse response = geocode(address);
        if (response.getAddresses() == null || response.getAddresses().isEmpty()) {
            throw new GeocodingException("주소를 찾을 수 없습니다: " + address);
        }
        var firstAddress = response.getAddresses().get(0);
        return new Coordinates(
            new BigDecimal(firstAddress.getY()), // 위도
            new BigDecimal(firstAddress.getX())  // 경도
        );
    }
}
```

### 3.3 Firebase - FCM

#### FcmService.java (~80줄)

```java
package com.bizone.api.infra.firebase;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FirebaseMessaging firebaseMessaging;

    /**
     * 단일 디바이스에 푸시 알림 발송
     */
    public void sendPush(String deviceToken, String title, String body, Map<String, Object> data) {
        try {
            Message message = Message.builder()
                .setToken(deviceToken)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putAllData(convertToStringMap(data))
                .setAndroidConfig(AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build())
                .setApnsConfig(ApnsConfig.builder()
                    .setAps(Aps.builder()
                        .setSound("default")
                        .build())
                    .build())
                .build();

            String response = firebaseMessaging.send(message);
            log.info("FCM message sent successfully: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("FCM send failed: {}", e.getMessage());
            // 토큰이 유효하지 않은 경우 처리
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                // 토큰 무효화 처리
            }
        }
    }

    /**
     * 다중 디바이스에 푸시 알림 발송
     */
    public void sendMultiplePush(List<String> deviceTokens, String title, String body, Map<String, Object> data) {
        try {
            MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(deviceTokens)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putAllData(convertToStringMap(data))
                .build();

            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);
            log.info("FCM multicast sent: {} success, {} failure",
                response.getSuccessCount(), response.getFailureCount());

        } catch (FirebaseMessagingException e) {
            log.error("FCM multicast failed: {}", e.getMessage());
        }
    }

    private Map<String, String> convertToStringMap(Map<String, Object> data) {
        if (data == null) return Map.of();
        return data.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> String.valueOf(e.getValue())
            ));
    }
}
```

#### FcmConfig.java (~30줄)

```java
package com.bizone.api.infra.firebase;

@Configuration
public class FcmConfig {

    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = new ClassPathResource(serviceAccountPath).getInputStream();
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (IOException e) {
            throw new RuntimeException("Firebase 초기화 실패", e);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        return FirebaseMessaging.getInstance();
    }
}
```

### 3.4 Mail

#### MailService.java (~60줄)

```java
package com.bizone.api.infra.mail;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 이메일 발송
     */
    public void sendEmail(String to, MailTemplate template, Map<String, Object> variables) {
        try {
            // 템플릿 렌더링
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(template.getTemplatePath(), context);

            // 이메일 생성
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(template.getSubject());
            helper.setText(htmlContent, true);

            // 발송
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Email send failed: {}", e.getMessage());
            throw new MailException("이메일 발송에 실패했습니다.");
        }
    }

    /**
     * 이메일 인증코드 발송
     */
    public void sendVerificationCode(String email, String code) {
        sendEmail(email, MailTemplate.EMAIL_VERIFICATION, 
            Map.of("code", code, "expiryMinutes", 10));
    }

    /**
     * 비밀번호 재설정 코드 발송
     */
    public void sendPasswordResetCode(String email, String code) {
        sendEmail(email, MailTemplate.PASSWORD_RESET, 
            Map.of("code", code, "expiryMinutes", 10));
    }
}
```

### 3.5 Storage - S3

#### S3StorageService.java (~80줄)

```java
package com.bizone.api.infra.storage;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * 파일 업로드
     */
    public String upload(MultipartFile file, String key) {
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            amazonS3.putObject(new PutObjectRequest(bucketName, key, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));

            return getFileUrl(key);

        } catch (IOException e) {
            log.error("S3 upload failed: {}", e.getMessage());
            throw new StorageException("파일 업로드에 실패했습니다.");
        }
    }

    /**
     * 바이트 배열 업로드
     */
    public String upload(byte[] bytes, String key, String contentType) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(contentType);
        metadata.setContentLength(bytes.length);

        amazonS3.putObject(new PutObjectRequest(bucketName, key, 
            new ByteArrayInputStream(bytes), metadata)
            .withCannedAcl(CannedAccessControlList.PublicRead));

        return getFileUrl(key);
    }

    /**
     * 파일 삭제
     */
    public void delete(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);
        amazonS3.deleteObject(bucketName, key);
        log.info("S3 file deleted: {}", key);
    }

    /**
     * 파일 URL 생성
     */
    private String getFileUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    private String extractKeyFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf(".com/") + 5);
    }
}
```

#### S3Config.java (~30줄)

```java
package com.bizone.api.infra.storage;

@Configuration
public class S3Config {

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public AmazonS3 amazonS3() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(credentials))
            .withRegion(region)
            .build();
    }
}
```

---

## 4. 환경 설정 (application.yml)

```yaml
# 외부 API
external:
  business-verification:
    base-url: https://api.odcloud.kr/api/nts-businessman/v1
    api-key: ${BUSINESS_API_KEY}
  naver:
    client-id: ${NAVER_CLIENT_ID}
    client-secret: ${NAVER_CLIENT_SECRET}

# Firebase
firebase:
  service-account-path: firebase/firebase-service-account.json

# 이메일 (네이버 SMTP)
spring:
  mail:
    host: smtp.naver.com
    port: 465
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.ssl.enable: true

# AWS S3
cloud:
  aws:
    credentials:
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
    s3:
      bucket: bizone-storage
    region:
      static: ap-northeast-2
```

---

## 5. 관련 문서

- [전역 설정](./16-global.md)
- [인증 도메인](./03-auth.md) - 사업자 진위확인
- [사업장 도메인](./04-workplace.md) - 지오코딩
- [알림 도메인](./14-notification.md) - FCM 푸시
- [파일 도메인](./15-file.md) - S3 스토리지

