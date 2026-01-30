# 📁 업로드 API

> 파일 업로드 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/upload` |
| **메서드** | `POST` |
| **인증 필요** | ⚠️ 부분적 (아바타 업로드는 회원가입 중에도 허용) |
| **Content-Type** | `multipart/form-data` |

---

## 📥 요청

### 헤더

```http
Content-Type: multipart/form-data
```

### 폼 데이터

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `file` | File | ✅ | 업로드할 파일 |
| `type` | string | ❌ | 파일 유형 (기본: general) |

### 파일 유형

| 유형 | 설명 | 저장 경로 |
|------|------|-----------|
| `avatar` | 프로필 이미지 | `/uploads/avatar/` |
| `file` | 일반 파일 | `/uploads/file/` |
| `image` | 이미지 | `/uploads/image/` |
| `general` | 기타 | `/uploads/general/` |

---

## 📤 응답

### 성공 (200 OK)

```json
{
  "success": true,
  "url": "/uploads/avatar/avatar-1706608800000-abc123def.jpg",
  "fileName": "original-file-name.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

### 에러 응답

#### 파일 없음 (400 Bad Request)

```json
{
  "error": "파일이 제공되지 않았습니다"
}
```

#### 파일 크기 초과 (400 Bad Request)

```json
{
  "error": "파일 크기는 5MB 이하여야 합니다"
}
```

#### 지원되지 않는 형식 (400 Bad Request)

```json
{
  "error": "지원되지 않는 파일 형식입니다"
}
```

---

## 📊 제한사항

### 파일 크기

| 제한 | 값 |
|------|-----|
| 최대 크기 | 5MB |

### 지원 형식 (아바타)

| MIME 타입 | 확장자 |
|-----------|--------|
| `image/jpeg` | .jpg, .jpeg |
| `image/png` | .png |
| `image/gif` | .gif |
| `image/webp` | .webp |

---

## 🔄 처리 흐름

```
1. 파일 수신
   ↓
2. 파일 크기 검증 (5MB 이하)
   ↓
3. 파일 형식 검증 (아바타인 경우)
   ↓
4. 파일명 생성
   - 형식: {type}-{timestamp}-{random}{extension}
   - 예: avatar-1706608800000-abc123def.jpg
   ↓
5. 디렉토리 생성 (없는 경우)
   - public/uploads/{type}/
   ↓
6. 파일 저장
   ↓
7. URL 반환
```

---

## 💡 사용 예시

### JavaScript (FormData)

```javascript
async function uploadFile(file, type = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}

// 사용 예시
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  try {
    const result = await uploadFile(file, 'avatar');
    console.log('Uploaded:', result.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
});
```

### React 컴포넌트

```jsx
function AvatarUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onUpload(data.url);
    } catch (error) {
      alert('업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleChange}
      disabled={uploading}
    />
  );
}
```

---

## 📂 저장 구조

```
public/
└── uploads/
    ├── avatar/
    │   ├── avatar-1706608800000-abc123def.jpg
    │   └── ...
    ├── file/
    │   └── ...
    ├── image/
    │   └── ...
    └── general/
        └── ...
```

---

## ⚠️ 주의사항

1. **공용 디렉토리**: 업로드된 파일은 `public` 폴더에 저장되어 누구나 접근 가능합니다.
2. **파일명 충돌 방지**: 타임스탬프와 랜덤 문자열로 고유한 파일명을 생성합니다.
3. **프로덕션 환경**: 프로덕션에서는 S3, CloudFlare R2 등 외부 스토리지 사용을 권장합니다.

---

## 🔗 관련 문서

- [File 모델](../../03_database/models/file.md)
- [사용자 API - 아바타](./users/README.md)
