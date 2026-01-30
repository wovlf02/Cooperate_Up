# 🧩 설정 컴포넌트

## 컴포넌트 목록

| 컴포넌트 | 설명 |
|---------|------|
| StudySettingsForm | 스터디 설정 폼 |
| DangerZone | 위험 영역 (삭제, 이전) |
| InviteCodeSection | 초대 코드 섹션 |
| TransferOwnershipModal | 소유권 이전 모달 |
| DeleteStudyModal | 스터디 삭제 모달 |

---

## StudySettingsForm

스터디 설정을 수정하는 폼입니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| study | object | 현재 스터디 |
| onSave | function | 저장 콜백 |

### 수정 가능 항목

- 이름
- 이모지
- 설명
- 카테고리
- 태그
- 최대 인원
- 공개 여부
- 자동 승인
- 모집 상태

---

## InviteCodeSection

초대 코드 관리 섹션입니다.

### 기능

- 초대 코드 표시
- 복사 버튼
- 재생성 버튼

---

## DangerZone

위험한 작업을 위한 섹션입니다.

### 항목

| 액션 | 설명 | 권한 |
|------|------|------|
| 소유권 이전 | 다른 멤버에게 이전 | OWNER |
| 스터디 삭제 | 영구 삭제 | OWNER |

---

## 관련 문서

- [CRUD API](./api-crud.md) - 수정/삭제 API
- [기능 API](./api-features.md) - 소유권 이전

