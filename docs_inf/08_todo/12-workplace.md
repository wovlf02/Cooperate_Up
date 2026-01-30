# 12. 사업장 관리 (Workplace) TODO

> **Phase**: 1단계  
> **우선순위**: 🔴 최우선 (앱 진입 후 첫 단계)

## 📊 진행 상황

**진행률**: 100% ✅ 완료

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 항목

#### 화면 구현
- ✅ `WorkplaceSelectScreen.tsx` - 사업장 선택/생성/참여 화면
- ✅ `WorkplaceCreateScreen.tsx` - 사업장 생성 화면
- ✅ `InviteEmployeeScreen.tsx` - 직원 초대 화면
- ✅ `InvitationListScreen.tsx` - 초대 목록 화면
- ✅ `WorkplaceSettingsScreen.tsx` - 사업장 설정 화면

#### 네비게이션
- ✅ MainNavigator에 Workplace 스크린 연결
- ✅ 사업장 선택 → 홈 화면 플로우

#### 핵심 기능
- ✅ 사업장 목록 조회
- ✅ 사업장 생성 (사업주)
- ✅ GPS 좌표 설정
- ✅ 허용 반경 설정 (기본 50m)
- ✅ 초대 코드 생성
- ✅ 초대 코드로 참여 (직원)
- ✅ 초대 목록 조회

### ⏳ 남은 작업

#### 사업장 설정 화면 (선택사항)
- [ ] `WorkplaceSettingsScreen.tsx` - 사업장 상세 설정
  - GPS 좌표 수정
  - 허용 반경 변경
  - 사업장 정보 수정
  - 초대 코드 재발급
  - 사업장 삭제

#### 고급 기능 (선택사항)
- [ ] 지도 기반 GPS 선택 (Google Maps / Apple Maps)
- [ ] 사업장 로고 업로드
- [ ] 사업장 멤버 목록 조회
- [ ] 멤버 권한 관리
- [ ] 사업장 통계 (직원 수, 활성화 상태 등)

---

## 📱 화면 목록

| 화면 | 파일 | 상태 | 권한 | 설명 |
|------|------|------|------|------|
| 사업장 선택 | `WorkplaceSelectScreen.tsx` | ✅ 완료 | 공통 | 사업장 선택/생성/참여 |
| 사업장 생성 | `WorkplaceCreateScreen.tsx` | ✅ 완료 | 사업주 | 신규 사업장 생성 |
| 직원 초대 | `InviteEmployeeScreen.tsx` | ✅ 완료 | 사업주 | 초대 코드 생성 |
| 초대 목록 | `InvitationListScreen.tsx` | ✅ 완료 | 직원 | 받은 초대 확인 |
| 사업장 설정 | `WorkplaceSettingsScreen.tsx` | ❌ 미구현 | 사업주 | 사업장 관리 |

---

## 🔄 사업장 플로우

### 최초 진입 플로우 (사업주)
```
로그인 → 사업장 선택 화면
            │
            └─→ 사업장 생성
                  │
                  ├─→ 기본 정보 입력 (이름, 주소)
                  ├─→ GPS 좌표 자동 획득
                  ├─→ 허용 반경 설정 (기본 50m)
                  └─→ 생성 완료 → 홈 화면
```

### 최초 진입 플로우 (직원)
```
로그인 → 사업장 선택 화면
            │
            ├─→ 초대 목록 (받은 초대 있는 경우)
            │     │
            │     └─→ 초대 수락 → 홈 화면
            │
            └─→ 초대 코드 입력
                  │
                  └─→ 참여 완료 → 홈 화면
```

### 사업장 전환 플로우
```
홈 화면 → 설정 → 사업장 선택 → 다른 사업장 선택 → 홈 (새 사업장)
```

---

## 🎨 화면 상세

### 1. WorkplaceSelectScreen.tsx ✅
**파일 위치**: `front/src/screens/workplace/WorkplaceSelectScreen.tsx`

**구현된 기능**:
- ✅ 소속 사업장 목록 표시
- ✅ 사업장 선택 (카드 터치)
- ✅ 새 사업장 생성 버튼 (사업주)
- ✅ 초대 코드로 참여 버튼 (직원)
- ✅ 초대 목록 버튼 (직원)
- ✅ 사업장 전환

**개선 가능 항목**:
- [ ] 사업장 검색 기능
- [ ] 사업장 카드 디자인 개선
- [ ] 마지막 선택 사업장 하이라이트
- [ ] 스와이프로 사업장 삭제 (사업주)

**예상 개선 시간**: 2-3시간

---

### 2. WorkplaceCreateScreen.tsx ✅
**파일 위치**: `front/src/screens/workplace/WorkplaceCreateScreen.tsx`

**구현된 기능**:
- ✅ 사업장 이름 입력
- ✅ 주소 입력
- ✅ GPS 좌표 자동 획득
- ✅ 허용 반경 설정 (슬라이더)
- ✅ 생성 API 연동
- ✅ 에러 처리

**개선 가능 항목**:
- [ ] 지도 기반 GPS 선택 (지도 탭으로 위치 지정)
- [ ] 사업장 로고 업로드
- [ ] 사업장 설명 추가
- [ ] 영업시간 설정
- [ ] 주소 자동 완성 (다음 주소 API)

**예상 개선 시간**: 4-5시간

---

### 3. InviteEmployeeScreen.tsx ✅
**파일 위치**: `front/src/screens/workplace/InviteEmployeeScreen.tsx`

**구현된 기능**:
- ✅ 초대 코드 생성
- ✅ 초대 코드 복사
- ✅ 초대 코드 공유 (카카오톡, SMS 등)
- ✅ 코드 재발급

**개선 가능 항목**:
- [ ] QR 코드 생성 (초대 코드)
- [ ] 초대 링크 생성 (딥링크)
- [ ] 초대 코드 만료일 설정
- [ ] 초대 내역 조회

**예상 개선 시간**: 3-4시간

---

### 4. InvitationListScreen.tsx ✅
**파일 위치**: `front/src/screens/workplace/InvitationListScreen.tsx`

**구현된 기능**:
- ✅ 받은 초대 목록 조회
- ✅ 초대 수락
- ✅ 초대 거절
- ✅ 사업장 정보 표시

**개선 가능 항목**:
- [ ] 초대 상태 필터 (대기/수락/거절)
- [ ] 초대 만료일 표시
- [ ] 초대한 사람 정보 표시
- [ ] 스와이프로 수락/거절

**예상 개선 시간**: 2-3시간

---

### 5. WorkplaceSettingsScreen.tsx ❌ (미구현)
**파일 위치**: `front/src/screens/workplace/WorkplaceSettingsScreen.tsx`

**구현 필요 기능**:
- [ ] 사업장 기본 정보 수정 (이름, 주소, 설명)
- [ ] GPS 좌표 재설정
- [ ] 허용 반경 변경
- [ ] 사업장 로고 변경
- [ ] 초대 코드 재발급
- [ ] 사업장 멤버 목록
- [ ] 사업장 삭제 (위험 액션)

**예상 구현 시간**: 6-8시간

**우선순위**: 중간 (홈 화면 이후 구현 권장)

---

## 📍 GPS 기능 상세

### GPS 좌표 획득
```typescript
// 현재 위치 자동 감지
const getCurrentLocation = async () => {
  const { coords } = await Geolocation.getCurrentPosition();
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};
```

### 거리 계산
```typescript
// Haversine 공식 사용
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // 두 GPS 좌표 간 거리 계산 (미터)
};
```

### 허용 반경 설정
- 기본값: 50m
- 최소값: 20m
- 최대값: 500m
- 슬라이더로 조정

---

## 🔧 필요한 컴포넌트

### 현재 사용 중
- ✅ `Button` - 기본 버튼
- ✅ `Input` - 텍스트 입력
- ✅ `Loading` - 로딩 인디케이터

### 추가 필요 (선택사항)
- [ ] `MapView` - 지도 표시 (react-native-maps)
- [ ] `QRCode` - QR 코드 생성 (react-native-qrcode-svg)
- [ ] `ImagePicker` - 로고 업로드
- [ ] `AddressInput` - 주소 자동 완성
- [ ] `Slider` - 범위 선택 (이미 구현되어 있을 수 있음)

---

## 🎯 우선순위 작업 (선택사항)

### Phase 1: 필수 개선 (1-2일)
1. WorkplaceSettingsScreen 구현
2. GPS 좌표 재설정 기능
3. 사업장 정보 수정 기능

### Phase 2: 고급 기능 (2-3일)
1. 지도 기반 GPS 선택
2. 사업장 로고 업로드
3. QR 코드 초대

### Phase 3: 최적화 (1-2일)
1. 사업장 캐싱 (오프라인 지원)
2. GPS 정확도 개선
3. 초대 딥링크

---

## 🧪 테스트 체크리스트

### 기능 테스트
- [x] 사업장 생성 (사업주)
- [x] GPS 좌표 자동 획득
- [x] 허용 반경 설정
- [x] 초대 코드 생성
- [x] 초대 코드로 참여 (직원)
- [x] 초대 수락/거절
- [x] 사업장 선택
- [ ] 사업장 설정 변경
- [ ] 사업장 삭제

### GPS 테스트
- [x] 위치 권한 요청
- [x] 현재 위치 획득
- [x] 거리 계산 정확도
- [ ] 위치 서비스 비활성화 시 처리

### UI/UX 테스트
- [x] 사업장 카드 표시
- [x] 로딩 상태 표시
- [x] 에러 메시지 표시
- [ ] 지도 표시 (미구현)

---

## 📚 참고 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 사업장 화면 명세 | `docs/05_screens/12_workplace/workplace-screens.md` | 화면 상세 |
| GPS 설정 가이드 | `docs/11_security/07-mobile-security.md` | 위치 권한 처리 |

---

## ⏭️ 다음 단계

사업장 도메인 완료 후:
1. → [02-home.md](./02-home.md) (홈 화면 - 사업장 선택 후)
2. → [03-attendance.md](./03-attendance.md) (출퇴근 - 핵심 기능)

---

## 💡 참고 사항

- 사업장 도메인은 **핵심 기능 완전 구현** 완료
- WorkplaceSettingsScreen은 **선택사항**이지만 권장
- 지도 기반 GPS 선택은 UX 개선에 큰 도움이 됨
- 초대 딥링크는 직원 온보딩 경험 향상에 효과적

