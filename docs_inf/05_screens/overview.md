# 화면 설계 개요 (Screen Design Overview)

## 🏗️ 아키텍처 연동

본 화면 설계는 다음 아키텍처 기반으로 구현됩니다:

| 구성 요소 | 기술 | 역할 |
|----------|------|------|
| **Frontend** | React Native 0.83 + JavaScript | 화면 UI 및 사용자 인터랙션 |
| **Backend API** | Spring Boot 4.0.1 (JDK 21.0.8) | REST API, 비즈니스 로직, 인증 |
| **Real-time** | Node.js 24.11.0 LTS + Socket.IO | 실시간 채팅, 상태 동기화, 푸시 알림 |
| **Database** | PostgreSQL 18.1 (RDS) | 데이터 저장 |
| **Auth** | Spring Security + JWT (직접 구현) | 사용자 인증/인가 |

---

## 📁 폴더 구조

```
05_screens/
├── overview.md                    # 전체 개요 (이 파일)
│
├── 00_common/                     # 공통 컴포넌트
│   ├── README.md                  # 개요 및 반응형 설계 원칙
│   ├── responsive.md              # 반응형 유틸리티
│   ├── buttons.md                 # 버튼 컴포넌트
│   ├── inputs.md                  # 입력 컴포넌트
│   ├── cards.md                   # 카드 컴포넌트
│   ├── modals.md                  # 모달/바텀시트
│   ├── feedback.md                # 피드백 (Toast, Loading 등)
│   ├── badges.md                  # 뱃지 및 태그
│   ├── navigation.md              # 네비게이션 컴포넌트
│   └── design-system.md           # 디자인 시스템
│
├── 01_auth/                       # 인증
│   ├── README.md
│   ├── login.md
│   ├── register.md
│   └── forgot-password.md
│
├── 02_home/                       # 홈 (대시보드)
│   ├── README.md
│   └── home-screens.md
│
├── 03_attendance/                 # 출퇴근
│   ├── README.md
│   └── attendance-screens.md
│
├── 04_calendar/                   # 캘린더
│   ├── README.md
│   └── calendar-screens.md
│
├── 05_checklist/                  # 체크리스트
│   ├── README.md
│   └── checklist-screens.md
│
├── 06_announcement/               # 공지사항
│   ├── README.md
│   └── announcement-screens.md
│
├── 07_chat/                       # 채팅
│   ├── README.md
│   └── chat-screens.md
│
├── 08_settings/                   # 설정
│   ├── README.md
│   └── settings-screens.md
│
├── 09_admin/                      # 관리자
│   ├── README.md
│   └── admin-screens.md
│
├── 10_contract/                   # 근로계약서 (신규)
│   ├── README.md
│   └── contract-screens.md
│
├── 11_payroll/                    # 급여 (신규)
│   ├── README.md
│   └── payroll-screens.md
│
└── 12_workplace/                  # 사업장 관리 (신규)
    ├── README.md
    └── workplace-screens.md
```

---

## 📱 전체 화면 목록

### 인증 (01_auth)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 로그인 | LoginScreen | 공통 | 아이디/비밀번호 로그인, 자동 로그인 |
| 회원가입 | RegisterScreen | 공통 | 사업주(사업자 인증)/직원 회원가입 |
| 비밀번호 재설정 | ForgotPasswordScreen | 공통 | 비밀번호 재설정 이메일 발송 |

### 사업장 (12_workplace)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 사업장 선택 | WorkplaceSelectScreen | 공통 | 소속 사업장 선택 (다중 사업장 지원) |
| 사업장 생성 | WorkplaceCreateScreen | 사업주 | 새 사업장 등록 (사업자등록번호 검증) |
| 사업장 참여 | WorkplaceJoinScreen | 직원 | 초대 승인으로 참여 |
| 사업장 설정 | WorkplaceSettingsScreen | 사업주 | GPS, 반경, 근무 시간 설정 |

### 홈 (02_home)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 홈 (대시보드) | HomeScreen | 공통 | 오늘 현황, 빠른 액션 |

### 출퇴근 (03_attendance)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 출퇴근 | AttendanceScreen | 공통 | GPS 기반 출퇴근 버튼 |
| 수동 근태 입력 | ManualInputScreen | 공통 | 수동 출퇴근 입력 |
| 근태 수정 요청 | EditRequestScreen | 공통 | 기존 기록 수정 요청 |

### 캘린더 (04_calendar)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 캘린더 | CalendarScreen | 공통 | 월별 근태/급여 캘린더 |
| 일별 상세 | DayDetailScreen | 공통 | 특정 날짜 상세 정보 |

### 체크리스트 (05_checklist)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 체크리스트 | ChecklistScreen | 공통 | 오늘 업무 체크리스트 |
| 체크리스트 모니터링 | ChecklistMonitorScreen | 사업주 | 직원별 완료 현황 모니터링 |
| 체크리스트 편집 | ChecklistEditorScreen | 사업주 | 체크리스트 생성/수정 |

### 공지사항 (06_announcement)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 공지사항 목록 | AnnouncementListScreen | 공통 | 공지사항 목록 |
| 공지사항 상세 | AnnouncementDetailScreen | 공통 | 공지사항 상세 보기 |
| 공지사항 작성 | AnnouncementCreateScreen | 사업주 | 공지사항 작성/수정 |

### 채팅 (07_chat)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 채팅 목록 | ChatListScreen | 공통 | 그룹 채팅 + 1:1 채팅 목록 |
| 채팅 | ChatScreen | 공통 | 사업장 그룹/1:1 채팅 (다양한 파일 형식 지원) |

### 설정 (08_settings)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 설정 | SettingsScreen | 공통 | 앱 설정 메뉴 |
| 프로필 | ProfileScreen | 공통 | 프로필 수정 |
| 알림 설정 | NotificationSettingsScreen | 공통 | 푸시 알림 설정 |
| 비밀번호 변경 | ChangePasswordScreen | 공통 | 비밀번호 변경 |

### 관리자 (09_admin)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 관리자 메뉴 | AdminScreen | 사업주 | 관리 기능 메뉴 |
| 직원 목록 | EmployeeListScreen | 사업주 | 직원 목록 조회 |
| 직원 상세 | EmployeeDetailScreen | 사업주 | 직원 정보/시급/근무시간 관리 |
| 직원 초대 | EmployeeInviteScreen | 사업주 | 아이디 기반 직원 초대 |
| 승인 요청 | ApprovalListScreen | 사업주 | 대기 중인 승인 요청 |
| 데이터 추출 | ExportScreen | 사업주 | 엑셀/PDF 추출 |

### 근로계약서 (10_contract)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 계약서 목록 | ContractListScreen | 공통 | 근로계약서 목록 |
| 계약서 상세 | ContractDetailScreen | 공통 | 계약서 내용 확인 |
| 계약서 작성 | ContractCreateScreen | 사업주 | 근로계약서 작성, 법규 검증 |
| 계약서 서명 | ContractSignScreen | 직원 | 전자서명 |

### 급여 (11_payroll)
| 화면 | 파일명 | 권한 | 설명 |
|------|--------|------|------|
| 급여 목록 | PayrollListScreen | 공통 | 월별 급여 목록 |
| 급여 상세 | PayrollDetailScreen | 공통 | 급여 명세서 상세 (산출식 표시) |
| 급여 지급 관리 | PayrollPaymentScreen | 사업주 | 직원별 급여 지급 체크리스트 |

---

## 🔐 권한별 화면 접근 매트릭스

| 화면 카테고리 | 화면 | 사업주 | 직원 |
|--------------|------|:------:|:----:|
| **인증** | 로그인/회원가입/비밀번호 재설정 | ✅ | ✅ |
| **사업장** | 사업장 선택 | ✅ | ✅ |
| **사업장** | 사업장 생성 | ✅ | ❌ |
| **사업장** | 사업장 참여 (초대 코드) | ❌ | ✅ |
| **사업장** | 사업장 설정 | ✅ | ❌ |
| **홈** | 대시보드 | ✅ | ✅ |
| **출퇴근** | 출퇴근/수동입력/수정요청 | ✅ | ✅ |
| **캘린더** | 캘린더 조회 | ✅ (전체) | ✅ (본인) |
| **체크리스트** | 체크리스트 체크 | ✅ | ✅ |
| **체크리스트** | 체크리스트 모니터링 | ✅ | ❌ |
| **체크리스트** | 체크리스트 편집 | ✅ | ❌ |
| **공지사항** | 공지사항 조회 | ✅ | ✅ |
| **공지사항** | 공지사항 작성 | ✅ | ❌ |
| **채팅** | 채팅 | ✅ | ✅ |
| **설정** | 프로필/알림/비밀번호 | ✅ | ✅ |
| **관리자** | 직원 관리/승인 처리/데이터 추출 | ✅ | ❌ |
| **근로계약서** | 계약서 조회 | ✅ (전체) | ✅ (본인) |
| **근로계약서** | 계약서 작성 | ✅ | ❌ |
| **근로계약서** | 계약서 서명 | ❌ | ✅ |
| **급여** | 급여 조회 | ✅ (전체) | ✅ (본인) |
| **급여** | PDF 다운로드 | ✅ | ✅ (본인) |

---

## 📐 디자인 시스템

### 색상 팔레트
- **Primary**: #2196F3 (파랑)
- **Secondary**: #FFC107 (노랑)
- **Success**: #4CAF50 (초록)
- **Error**: #F44336 (빨강)
- **Warning**: #FF9800 (주황)
- **Background**: #FFFFFF / #121212 (다크)
- **Surface**: #F5F5F5 / #1E1E1E (다크)

### 타이포그래피
- **Heading 1**: 24sp, Bold
- **Heading 2**: 20sp, SemiBold
- **Body**: 16sp, Regular
- **Caption**: 14sp, Regular
- **Button**: 16sp, Medium

### 간격
- **xs**: 4dp
- **sm**: 8dp
- **md**: 16dp
- **lg**: 24dp
- **xl**: 32dp
