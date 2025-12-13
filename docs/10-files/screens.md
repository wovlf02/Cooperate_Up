# 🖥️ 파일 화면

## 개요

스터디 파일 관리 화면입니다. 파일 업로드, 목록 조회, 다운로드, 삭제 기능을 제공합니다.

**파일 위치**: `src/app/my-studies/[studyId]/files/page.jsx`

---

## 화면 구성

```
┌─────────────────────────────────────────────────────────────┐
│  ← 내 스터디 목록                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📚 스터디 이름                     👑 OWNER           │  │
│  │ 👥 5/10명                                             │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  대시보드 | 채팅 | 공지 | 캘린더 | [파일] | 멤버 | 설정      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 파일 관리                        [⬆️ 파일 업로드]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 전체(45) | 문서(20) | 이미지(15) | 압축(5) | 기타(5) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           ⬆️                                         │   │
│  │  파일을 드래그하거나 클릭하세요                       │   │
│  │  지원 형식: 모든 파일 (최대 50MB)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📄 파일 (45)                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ☐ | 이름           | 크기    | 업로더 | 날짜    | 액션│  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ☐ | 📄 문서1.pdf   | 2.5 MB  | 홍길동 | 12.01  |[D][X]│  │
│  │ ☐ | 🖼️ 이미지.png  | 1.2 MB  | 김철수 | 12.02  |[D][X]│  │
│  │ ☐ | 📦 자료.zip    | 15.3 MB | 이영희 | 12.03  |[D][X]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  선택된 파일 (2개): [삭제]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │ ⚡ 빠른 액션    │                                        │
│  │ [📤 업로드]     │                                        │
│  ├─────────────────┤                                        │
│  │ 📊 파일 통계    │                                        │
│  │ 전체 파일: 45개 │                                        │
│  │ 총 용량: 128MB  │                                        │
│  ├─────────────────┤                                        │
│  │ 📁 최근 파일    │                                        │
│  │ 📄 문서1.pdf    │                                        │
│  │ 🖼️ 이미지.png   │                                        │
│  │ 📦 자료.zip     │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 구조

```jsx
<MyStudyFilesPage>
  ├── Header
  │   ├── BackButton
  │   └── StudyHeader (이름, 이모지, 멤버 수, 역할)
  ├── StudyTabs (대시보드, 채팅, 공지, 캘린더, 파일*, 멤버, 설정)
  ├── MainContent
  │   ├── FileSection
  │   │   ├── FileHeader (제목, 업로드 버튼)
  │   │   ├── FilterSection (전체/문서/이미지/압축/기타)
  │   │   ├── DropZone (드래그 앤 드롭)
  │   │   ├── FileListSection
  │   │   │   ├── TableHeader
  │   │   │   └── FileRow[] (체크박스, 이름, 크기, 업로더, 날짜, 액션)
  │   │   └── SelectedActions (선택 삭제)
  │   └── Sidebar
  │       ├── QuickActions (업로드)
  │       ├── Statistics (파일 수, 용량)
  │       └── RecentFiles (최근 3개)
</MyStudyFilesPage>
```

---

## 주요 기능

### 1. 파일 업로드

**드래그 앤 드롭**

```jsx
const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const droppedFiles = Array.from(e.dataTransfer.files);
  handleFileUpload(droppedFiles);
};
```

**파일 선택**

```jsx
<input
  ref={fileInputRef}
  type="file"
  multiple
  style={{ display: 'none' }}
  onChange={(e) => handleFileUpload(Array.from(e.target.files))}
/>
```

**업로드 처리**

```jsx
const handleFileUpload = async (fileList) => {
  for (const file of fileList) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await uploadFileMutation.mutateAsync({
        studyId,
        formData
      });
    } catch (error) {
      alert(`파일 업로드 실패 (${file.name}): ${error.message}`);
    }
  }
  
  setTimeout(() => refetch(), 500);
};
```

### 2. 파일 필터링

**카테고리 분류**

```jsx
const getFileCategory = (file) => {
  const ext = getFileExtension(file.name);

  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', ...];
  if (docExtensions.includes(ext)) return '문서';

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', ...];
  if (imageExtensions.includes(ext)) return '이미지';

  const archiveExtensions = ['zip', 'rar', '7z', ...];
  if (archiveExtensions.includes(ext)) return '압축';

  return '기타';
};
```

**필터 탭**

```jsx
const filteredFiles = activeFilter === '전체'
  ? files
  : files.filter(file => getFileCategory(file) === activeFilter);
```

### 3. 파일 다운로드

```jsx
const handleDownload = (fileUrl, fileName) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### 4. 파일 삭제

```jsx
const handleDeleteFile = async (fileId, fileName) => {
  if (!confirm(`${fileName} 파일을 삭제하시겠습니까?`)) return;

  try {
    await deleteFileMutation.mutateAsync({ studyId, fileId });
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    await refetch();
  } catch (error) {
    alert('파일 삭제 실패: ' + error.message);
  }
};
```

### 5. 파일 선택

**개별 선택**

```jsx
const handleFileSelect = (fileId) => {
  setSelectedFiles((prev) =>
    prev.includes(fileId)
      ? prev.filter((id) => id !== fileId)
      : [...prev, fileId]
  );
};
```

**전체 선택**

```jsx
const handleSelectAll = () => {
  if (selectedFiles.length === filteredFiles.length) {
    setSelectedFiles([]);
  } else {
    setSelectedFiles(filteredFiles.map((f) => f.id));
  }
};
```

---

## 상태 관리

```jsx
const [isDragging, setIsDragging] = useState(false);
const [selectedFiles, setSelectedFiles] = useState([]);
const [activeFilter, setActiveFilter] = useState('전체');
```

---

## API Hooks

```jsx
const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
const { data: filesData, isLoading: filesLoading, refetch } = useFiles(studyId);
const uploadFileMutation = useUploadFile();
const deleteFileMutation = useDeleteFile();
```

---

## 유틸리티 함수

### 파일 아이콘

```jsx
const getFileIcon = (type) => {
  if (!type) return '📄';
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎬';
  if (type.includes('audio')) return '🎵';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  if (type.includes('word')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  return '📄';
};
```

### 파일 크기 포맷

```jsx
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
```

### 날짜 포맷

```jsx
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};
```

---

## 스타일

**파일 위치**: `src/app/my-studies/[studyId]/files/page.module.css`

### 주요 클래스

| 클래스 | 설명 |
|--------|------|
| `.container` | 전체 컨테이너 (max-width: 1600px) |
| `.dropZone` | 드래그 앤 드롭 영역 |
| `.dropZone.dragging` | 드래그 중 상태 |
| `.filterTabs` | 필터 탭 컨테이너 |
| `.filterTab.active` | 활성 필터 탭 |
| `.fileRow` | 파일 행 |
| `.tableHeader` | 테이블 헤더 |
| `.widget` | 사이드바 위젯 |

---

## 반응형

```css
@media (max-width: 768px) {
  .mainContent {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [보안](./security.md)
- [예외](./exceptions.md)

