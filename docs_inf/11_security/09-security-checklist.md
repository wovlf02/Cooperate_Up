# 보안 점검표 (Security Checklist)

## 1. 개발 단계 체크리스트

### 1.1 코드 보안

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| 입력 검증 (서버) | ⬜ | High | Backend | Bean Validation |
| 입력 검증 (클라이언트) | ⬜ | Medium | Frontend | 사전 필터링 |
| SQL Injection 방지 | ⬜ | Critical | Backend | JPA/QueryDSL |
| XSS 방지 | ⬜ | High | Backend | 출력 인코딩 |
| CSRF 방지 | ⬜ | Medium | Backend | 토큰 기반 (해당없음) |
| 민감 데이터 로깅 금지 | ⬜ | High | 전체 | 비밀번호, 토큰 |
| 에러 메시지 최소화 | ⬜ | Medium | Backend | 스택 트레이스 숨김 |
| 하드코딩된 시크릿 제거 | ⬜ | Critical | 전체 | 환경변수 사용 |
| 안전한 난수 생성 | ⬜ | High | Backend | SecureRandom |
| 파일 업로드 검증 | ⬜ | High | Backend | 확장자, 크기, 내용 |

### 1.2 인증/인가

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| 비밀번호 정책 구현 | ⬜ | High | Backend | 복잡성 요구사항 |
| 비밀번호 해시 (BCrypt) | ⬜ | Critical | Backend | Strength 12 |
| JWT 서명 알고리즘 | ⬜ | Critical | Backend | HS512 |
| Access Token 만료 설정 | ⬜ | High | Backend | 1시간 |
| Refresh Token 관리 | ⬜ | High | Backend | Redis 저장 |
| 로그인 시도 제한 | ⬜ | High | Backend | 5회 실패 시 잠금 |
| 비밀번호 이력 관리 | ⬜ | Medium | Backend | 최근 5개 재사용 금지 |
| RBAC 권한 검증 | ⬜ | Critical | Backend | 모든 API |
| 사업장별 데이터 격리 | ⬜ | Critical | Backend | workplaceId 검증 |

### 1.3 데이터 보호

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| 민감 데이터 암호화 | ⬜ | High | Backend | AES-256-GCM |
| 전화번호 마스킹 | ⬜ | Medium | Backend | 010-****-5678 |
| 이메일 마스킹 | ⬜ | Medium | Backend | us**@example.com |
| API 응답 민감정보 제외 | ⬜ | High | Backend | DTO 분리 |
| 데이터 삭제 정책 | ⬜ | Medium | Backend | 익명화 처리 |

---

## 2. 배포 전 체크리스트

### 2.1 서버 설정

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| HTTPS 강제 | ⬜ | Critical | DevOps | TLS 1.3 |
| 보안 헤더 설정 | ⬜ | High | Backend | X-Frame-Options 등 |
| CORS 설정 | ⬜ | High | Backend | 허용 도메인만 |
| Rate Limiting | ⬜ | High | Backend | Bucket4j |
| 디버그 모드 비활성화 | ⬜ | Critical | DevOps | 프로덕션 설정 |
| 기본 계정/비밀번호 변경 | ⬜ | Critical | DevOps | 모든 서비스 |
| 불필요한 포트 차단 | ⬜ | High | DevOps | Security Group |
| 로그 레벨 조정 | ⬜ | Medium | Backend | INFO 이상 |

### 2.2 AWS 인프라

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| VPC 서브넷 분리 | ⬜ | High | DevOps | Public/Private/Data |
| Security Group 설정 | ⬜ | Critical | DevOps | 최소 권한 |
| WAF 규칙 활성화 | ⬜ | High | DevOps | SQL Injection, XSS |
| RDS 암호화 | ⬜ | Critical | DevOps | 저장/전송 |
| S3 버킷 정책 | ⬜ | High | DevOps | 퍼블릭 접근 차단 |
| IAM 역할 최소 권한 | ⬜ | Critical | DevOps | 필요한 권한만 |
| CloudWatch 로깅 | ⬜ | High | DevOps | 모든 서비스 |
| 알람 설정 | ⬜ | High | DevOps | 보안 이벤트 |

### 2.3 모바일 앱

| 항목 | 상태 | 우선순위 | 담당 | 비고 |
|------|:----:|:--------:|------|------|
| SSL Pinning | ⬜ | High | Frontend | 인증서 고정 |
| 토큰 안전 저장 | ⬜ | Critical | Frontend | Keychain/Keystore |
| Root/Jailbreak 탐지 | ⬜ | High | Frontend | JailMonkey |
| 코드 난독화 | ⬜ | High | Frontend | Hermes + ProGuard |
| 스크린샷 방지 | ⬜ | Medium | Frontend | 민감 화면 |
| 프로덕션 로그 제거 | ⬜ | High | Frontend | console.log 제거 |
| API 키 보호 | ⬜ | High | Frontend | 환경변수 |

---

## 3. 운영 단계 체크리스트

### 3.1 정기 점검 (월간)

| 항목 | 상태 | 마지막 점검일 | 다음 점검일 | 담당 |
|------|:----:|:------------:|:----------:|------|
| 의존성 취약점 스캔 | ⬜ | - | - | Backend |
| npm audit 실행 | ⬜ | - | - | Frontend/Signaling |
| IAM 권한 검토 | ⬜ | - | - | DevOps |
| Security Group 검토 | ⬜ | - | - | DevOps |
| 로그 분석 | ⬜ | - | - | DevOps |
| 백업 복구 테스트 | ⬜ | - | - | DevOps |

### 3.2 정기 점검 (분기)

| 항목 | 상태 | 마지막 점검일 | 다음 점검일 | 담당 |
|------|:----:|:------------:|:----------:|------|
| 침투 테스트 | ⬜ | - | - | Security |
| 보안 감사 | ⬜ | - | - | Security |
| DR 훈련 | ⬜ | - | - | 전체 |
| 인증서 만료 확인 | ⬜ | - | - | DevOps |
| Secrets 로테이션 | ⬜ | - | - | DevOps |

### 3.3 모니터링

| 항목 | 상태 | 임계값 | 알람 설정 | 담당 |
|------|:----:|:------:|:--------:|------|
| 인증 실패 모니터링 | ⬜ | 50회/5분 | ⬜ | Backend |
| API 에러율 | ⬜ | 5% | ⬜ | Backend |
| 비정상 트래픽 | ⬜ | 10000/5분 | ⬜ | DevOps |
| WAF 차단 건수 | ⬜ | 100회/5분 | ⬜ | DevOps |
| 권한 상승 시도 | ⬜ | 1회 | ⬜ | Backend |
| DB 연결 실패 | ⬜ | 5회/분 | ⬜ | Backend |

---

## 4. 사고 대응 체크리스트

### 4.1 보안 사고 발생 시

| 단계 | 체크 항목 | 완료 | 담당 | 비고 |
|------|----------|:----:|------|------|
| **탐지** | 알람 확인 | ⬜ | On-call | |
| | 영향 범위 파악 | ⬜ | On-call | |
| | 사고 등급 결정 | ⬜ | Security Lead | Critical/High/Medium/Low |
| **격리** | 영향 시스템 격리 | ⬜ | DevOps | |
| | 악성 IP 차단 | ⬜ | DevOps | WAF 규칙 |
| | 세션 무효화 | ⬜ | Backend | 필요 시 |
| **분석** | 로그 수집 | ⬜ | DevOps | CloudWatch |
| | 원인 분석 | ⬜ | Security | |
| | 증거 보존 | ⬜ | Security | 스냅샷 |
| **복구** | 시스템 복구 | ⬜ | DevOps | |
| | 데이터 복구 | ⬜ | DBA | 필요 시 |
| | 서비스 재개 | ⬜ | DevOps | |
| **보고** | 내부 보고 | ⬜ | Security Lead | |
| | 고객 통보 | ⬜ | PM | 필요 시 |
| | 법적 보고 | ⬜ | Legal | 개인정보 유출 시 |
| **개선** | RCA 작성 | ⬜ | Security | |
| | 재발 방지 대책 | ⬜ | Security | |
| | 문서 업데이트 | ⬜ | Security | |

---

## 5. OWASP Top 10 대응

### 5.1 OWASP Top 10 (2021) 체크리스트

| 순위 | 취약점 | 대응 현황 | 구현 방법 |
|:----:|--------|:--------:|----------|
| A01 | Broken Access Control | ⬜ | RBAC, workplaceId 검증 |
| A02 | Cryptographic Failures | ⬜ | AES-256, BCrypt, TLS 1.3 |
| A03 | Injection | ⬜ | JPA, Prepared Statement |
| A04 | Insecure Design | ⬜ | 위협 모델링, 보안 설계 |
| A05 | Security Misconfiguration | ⬜ | 보안 헤더, 디폴트 제거 |
| A06 | Vulnerable Components | ⬜ | 의존성 스캔, 업데이트 |
| A07 | Auth Failures | ⬜ | JWT, 로그인 제한 |
| A08 | Software/Data Integrity | ⬜ | 서명 검증, CI/CD 보안 |
| A09 | Security Logging | ⬜ | CloudWatch, 감사 로그 |
| A10 | SSRF | ⬜ | URL 검증, 화이트리스트 |

---

## 6. 컴플라이언스 체크리스트

### 6.1 개인정보보호법 준수

| 항목 | 상태 | 관련 조항 | 구현 방법 |
|------|:----:|:--------:|----------|
| 개인정보 수집 동의 | ⬜ | 제15조 | 회원가입 시 동의 |
| 개인정보 처리 방침 | ⬜ | 제30조 | 앱 내 고지 |
| 개인정보 암호화 | ⬜ | 제24조 | AES-256 |
| 접근 권한 관리 | ⬜ | 제29조 | RBAC |
| 개인정보 파기 | ⬜ | 제21조 | 탈퇴 시 익명화 |
| 유출 통지 절차 | ⬜ | 제34조 | 사고 대응 절차 |

### 6.2 위치정보보호법 준수

| 항목 | 상태 | 관련 조항 | 구현 방법 |
|------|:----:|:--------:|----------|
| 위치정보 수집 동의 | ⬜ | 제15조 | 앱 권한 요청 |
| 위치정보 이용 목적 고지 | ⬜ | 제16조 | 출퇴근 인증 용도 |
| 위치정보 보호 조치 | ⬜ | 제16조 | 암호화 저장 |

---

## 7. 체크리스트 사용 가이드

### 7.1 상태 표시

| 기호 | 의미 |
|:----:|------|
| ⬜ | 미완료 |
| ✅ | 완료 |
| 🔄 | 진행 중 |
| ❌ | 해당 없음 |
| ⚠️ | 주의 필요 |

### 7.2 우선순위

| 등급 | 설명 | 대응 시간 |
|------|------|----------|
| Critical | 즉시 대응 필요 | 24시간 내 |
| High | 빠른 대응 필요 | 1주일 내 |
| Medium | 계획적 대응 | 1개월 내 |
| Low | 여유있게 대응 | 분기 내 |

### 7.3 점검 주기

| 체크리스트 | 점검 주기 |
|-----------|----------|
| 개발 단계 | 코드 리뷰 시 |
| 배포 전 | 매 배포 |
| 운영 (월간) | 매월 첫째 주 |
| 운영 (분기) | 분기 말 |
| 사고 대응 | 사고 발생 시 |

