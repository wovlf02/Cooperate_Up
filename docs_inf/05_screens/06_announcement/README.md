# 공지사항 화면 (Announcement Screens)

## 📁 파일 구조

```
06_announcement/
├── README.md                # 개요 (이 파일)
├── announcement-list.md     # 공지사항 목록 화면
├── announcement-detail.md   # 공지사항 상세 화면
└── announcement-create.md   # 공지사항 작성 화면 (관리자)
```

---

## 화면 목록

| 화면 | 파일 | 권한 | 설명 |
|------|------|------|------|
| 공지사항 목록 | [announcement-list.md](./announcement-list.md) | 공통 | 전체 공지사항 목록 |
| 공지사항 상세 | [announcement-detail.md](./announcement-detail.md) | 공통 | 공지사항 전체 내용 |
| 공지사항 작성 | [announcement-create.md](./announcement-create.md) | 관리자 | 새 공지사항 작성 |

---

## 핵심 기능

### 공지사항 목록
- 전체 / 안읽음 / 중요 필터
- 읽음 상태 표시 (dot indicator)
- 중요 공지 상단 고정
- 최신순 정렬

### 공지사항 상세
- 전체 내용 확인
- 첨부파일 다운로드
- 관리자: 수정/삭제

### 공지사항 작성 (관리자)
- 중요 공지 설정
- 파일 첨부 (최대 3개, 10MB)
- 푸시 알림 발송 옵션

---

## 핵심 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| FilterTabs | 전체/안읽음/중요 필터 탭 |
| AnnouncementCard | 공지사항 목록 카드 |
| AttachmentItem | 첨부파일 항목 |
| OptionToggle | 옵션 토글 (중요/푸시알림) |
| FileUploadArea | 파일 업로드 영역 |

---

## 읽음 처리

- 상세 화면 진입 시 자동 읽음 처리
- Firestore 실시간 동기화
- 읽음 표시: dot indicator 제거

---

## 첨부파일 제한

| 항목 | 제한 |
|------|------|
| 최대 개수 | 3개 |
| 최대 크기 | 10MB/파일 |
| 허용 형식 | 이미지, PDF, 문서 |
