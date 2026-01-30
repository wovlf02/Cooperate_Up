# 사업장 관리 (Workplace) 화면 설계

> 사업장 등록, GPS 설정, 직원 초대 화면

## 📁 파일 구조

```
12_workplace/
├── README.md                 # 이 파일
└── workplace-screens.md      # 화면 상세 설계
```

---

## 📱 화면 목록

| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 사업장 선택 | WorkplaceSelectScreen | 공통 | 소속 사업장 선택/생성/참여 |
| 사업장 생성 | WorkplaceCreateScreen | 사업주 | 새 사업장 등록 |
| 사업장 참여 | WorkplaceJoinScreen | 직원 | 초대 코드로 참여 |
| 사업장 설정 | WorkplaceSettingsScreen | 사업주 | GPS, 반경, 초대 코드 관리 |

---

## 🎨 화면 플로우

### 최초 진입 플로우
```
로그인 → 사업장 선택
           │
           ├─→ (사업주) 사업장 생성 → 홈
           │
           └─→ (직원) 사업장 참여 → 홈
```

### 사업장 전환 플로우
```
설정 → 사업장 선택 → 다른 사업장 선택 → 홈 (새 사업장)
```

---

## 📍 GPS 설정

| 항목 | 설명 |
|------|------|
| 좌표 획득 | 현재 위치 자동 감지 or 지도 탭 |
| 허용 반경 | 기본 50m, 최소 20m ~ 최대 500m |
| 지도 표시 | Google Maps / Apple Maps |

---

## 🔐 초대 코드

| 항목 | 설명 |
|------|------|
| 형식 | 6자리 영숫자 (예: A1B2C3) |
| 기능 | 복사, 공유, 재발급, 비활성화 |
| 유효기간 | 무제한 (비활성화 전까지) |

---

## 📝 관련 문서

- [기능 요구사항](../../02_requirements/functional.md) - FR-01 ~ FR-04
- [Firestore 스키마](../../04_database/firestore-schema.md) - workplaces 컬렉션
- [TODO](../../08_todo/12-workplace.md)

