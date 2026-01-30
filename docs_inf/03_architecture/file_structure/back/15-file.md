# 파일 도메인 (File Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.file`

## 1. 개요

파일 도메인은 파일 업로드, 다운로드, 이미지 처리를 담당합니다.

### 1.1 주요 기능

- 파일 업로드 (이미지, 문서)
- 이미지 리사이징
- 프로필 이미지 업로드
- 첨부파일 관리

---

## 2. 패키지 구조

```
domain/file/
├── controller/
│   └── FileController.java                  # 파일 API 컨트롤러 (~40줄)
│
├── service/
│   ├── FileService.java                     # 서비스 인터페이스 (~20줄)
│   └── impl/
│       └── FileServiceImpl.java             # 서비스 구현체 (~100줄)
│
├── dto/
│   └── response/
│       └── FileUploadResponse.java          # 업로드 응답 (~15줄)
│
├── util/
│   ├── FileValidator.java                   # 파일 검증 (~40줄)
│   └── ImageResizer.java                    # 이미지 리사이징 (~50줄)
│
└── constant/
    ├── FileType.java                        # 파일 유형 enum (~15줄)
    └── UploadDirectory.java                 # 업로드 디렉토리 enum (~15줄)
```

---

## 3. 상세 파일 구조

### 3.1 Controller

#### FileController.java (~40줄)

```java
package com.bizone.api.domain.file.controller;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File", description = "파일 관리 API")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @Operation(summary = "파일 업로드")
    public ApiResponse<FileUploadResponse> uploadFile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("file") MultipartFile file,
        @RequestParam("directory") UploadDirectory directory) { }

    @PostMapping("/upload/profile")
    @Operation(summary = "프로필 이미지 업로드")
    public ApiResponse<FileUploadResponse> uploadProfileImage(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("file") MultipartFile file) { }

    @PostMapping("/upload/multiple")
    @Operation(summary = "다중 파일 업로드")
    public ApiResponse<List<FileUploadResponse>> uploadMultipleFiles(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("files") List<MultipartFile> files,
        @RequestParam("directory") UploadDirectory directory) { }

    @DeleteMapping
    @Operation(summary = "파일 삭제")
    public ApiResponse<Void> deleteFile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("url") String fileUrl) { }
}
```

### 3.2 Service

#### FileServiceImpl.java (~100줄)

```java
package com.bizone.api.domain.file.service.impl;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    private final S3StorageService s3StorageService;
    private final FileValidator fileValidator;
    private final ImageResizer imageResizer;

    @Override
    public FileUploadResponse uploadFile(Long userId, MultipartFile file, UploadDirectory directory) {
        // 1. 파일 검증
        fileValidator.validate(file, directory);

        // 2. 파일명 생성
        String fileName = generateFileName(userId, file.getOriginalFilename(), directory);

        // 3. S3 업로드
        String fileUrl = s3StorageService.upload(file, fileName);

        return new FileUploadResponse(fileUrl, file.getOriginalFilename(), file.getSize());
    }

    @Override
    public FileUploadResponse uploadProfileImage(Long userId, MultipartFile file) {
        // 1. 이미지 검증
        fileValidator.validateImage(file);

        // 2. 이미지 리사이징
        byte[] resizedImage = imageResizer.resize(file, 200, 200);

        // 3. 파일명 생성
        String fileName = String.format("profiles/%d/%s.jpg", userId, UUID.randomUUID());

        // 4. S3 업로드
        String fileUrl = s3StorageService.upload(resizedImage, fileName, "image/jpeg");

        return new FileUploadResponse(fileUrl, file.getOriginalFilename(), resizedImage.length);
    }

    @Override
    public void deleteFile(String fileUrl) {
        s3StorageService.delete(fileUrl);
    }

    private String generateFileName(Long userId, String originalName, UploadDirectory directory) {
        String extension = FilenameUtils.getExtension(originalName);
        return String.format("%s/%d/%s.%s", directory.getPath(), userId, UUID.randomUUID(), extension);
    }
}
```

### 3.3 Util

#### FileValidator.java (~40줄)

```java
package com.bizone.api.domain.file.util;

@Component
public class FileValidator {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/gif");
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of("application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    public void validate(MultipartFile file, UploadDirectory directory) {
        if (file.isEmpty()) {
            throw new FileException(FileErrorCode.EMPTY_FILE);
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileException(FileErrorCode.FILE_TOO_LARGE);
        }
        if (directory == UploadDirectory.IMAGES) {
            validateImage(file);
        }
    }

    public void validateImage(MultipartFile file) {
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new FileException(FileErrorCode.INVALID_IMAGE_TYPE);
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new FileException(FileErrorCode.IMAGE_TOO_LARGE);
        }
    }
}
```

#### ImageResizer.java (~50줄)

```java
package com.bizone.api.domain.file.util;

@Component
public class ImageResizer {

    public byte[] resize(MultipartFile file, int width, int height) {
        try {
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            
            // 비율 유지 리사이징
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            
            double ratio = Math.min((double) width / originalWidth, (double) height / originalHeight);
            int newWidth = (int) (originalWidth * ratio);
            int newHeight = (int) (originalHeight * ratio);
            
            BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = resizedImage.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
            g.dispose();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(resizedImage, "jpg", baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new FileException(FileErrorCode.IMAGE_PROCESSING_FAILED);
        }
    }
}
```

---

## 4. API 명세

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/files/upload` | 파일 업로드 | 로그인 |
| POST | `/api/v1/files/upload/profile` | 프로필 이미지 업로드 | 로그인 |
| POST | `/api/v1/files/upload/multiple` | 다중 파일 업로드 | 로그인 |
| DELETE | `/api/v1/files` | 파일 삭제 | 로그인 |

---

## 5. 관련 문서

- [인프라 - S3 스토리지](./17-infra.md)
- [사용자 도메인](./02-user.md) - 프로필 이미지
- [공지사항 도메인](./12-announcement.md) - 첨부파일

