# 🧩 멤버 관리 컴포넌트

## 컴포넌트 목록

| 컴포넌트 | 설명 |
|---------|------|
| MemberTable | 멤버 테이블 |
| MemberCard | 멤버 카드 |
| JoinRequestList | 가입 요청 목록 |
| RoleChangeModal | 역할 변경 모달 |
| KickMemberModal | 추방 확인 모달 |

---

## MemberTable

멤버 목록을 테이블 형태로 표시합니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| members | array | 멤버 목록 |
| currentUserRole | string | 현재 사용자 역할 |
| onRoleChange | function | 역할 변경 콜백 |
| onKick | function | 추방 콜백 |

### 표시 컬럼

| 컬럼 | 설명 |
|------|------|
| 프로필 | 아바타 + 이름 |
| 이메일 | 이메일 주소 |
| 역할 | OWNER/ADMIN/MEMBER |
| 가입일 | 가입 날짜 |
| 액션 | 역할 변경, 추방 버튼 |

---

## JoinRequestList

가입 요청 목록을 표시합니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| requests | array | 요청 목록 |
| onApprove | function | 승인 콜백 |
| onReject | function | 거절 콜백 |

### 표시 정보

- 신청자 정보
- 자기소개
- 가입 동기
- 현재 수준
- 신청일
- 승인/거절 버튼

---

## RoleChangeModal

역할 변경 확인 모달입니다.

### Props

| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | 모달 표시 |
| member | object | 대상 멤버 |
| newRole | string | 새 역할 |
| onConfirm | function | 확인 콜백 |
| onClose | function | 닫기 콜백 |

---

## 관련 문서

- [멤버 API](./api-members.md) - 멤버 관리 API

