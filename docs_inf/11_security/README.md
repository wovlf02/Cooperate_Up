# 보안 설계 문서 (Security Documentation)

## 📁 문서 구조

```
11_security/
├── README.md                      # 개요 (이 파일)
├── 01-security-overview.md        # 보안 아키텍처 개요
├── 02-authentication.md           # 인증 설계
├── 03-authorization.md            # 인가 및 권한 관리
├── 04-data-protection.md          # 데이터 보호
├── 05-api-security.md             # API 보안
├── 06-network-security.md         # 네트워크 보안
├── 07-mobile-security.md          # 모바일 앱 보안
├── 08-infrastructure-security.md  # 인프라 보안
├── 09-security-checklist.md       # 보안 점검표
└── 10-incident-response.md        # 보안 사고 대응
```

---

## 🔐 보안 원칙

### 1. 심층 방어 (Defense in Depth)
여러 계층의 보안 통제를 적용하여 단일 장애점 방지

### 2. 최소 권한 원칙 (Principle of Least Privilege)
사용자와 시스템에 필요한 최소한의 권한만 부여

### 3. 제로 트러스트 (Zero Trust)
모든 요청을 신뢰하지 않고 항상 검증

### 4. 보안 기본값 (Secure by Default)
기본 설정이 가장 안전한 상태 유지

---

## 🛡️ 보안 범위

| 영역 | 설명 | 담당 |
|------|------|------|
| 인증/인가 | JWT 기반 인증, RBAC 권한 관리 | Spring Security |
| 데이터 보호 | 암호화, 민감정보 관리 | Backend + DB |
| API 보안 | 입력 검증, Rate Limiting | Spring Boot |
| 네트워크 | HTTPS, 방화벽, VPC | AWS |
| 모바일 | 앱 보안, 로컬 저장소 | React Native |
| 인프라 | 서버 보안, 접근 제어 | AWS |

---

## 📊 보안 등급

| 등급 | 설명 | 예시 |
|------|------|------|
| **Critical** | 즉시 대응 필요 | 인증 우회, 데이터 유출 |
| **High** | 24시간 내 대응 | 권한 상승, SQL Injection |
| **Medium** | 1주일 내 대응 | XSS, 정보 노출 |
| **Low** | 계획된 업데이트로 대응 | 약한 암호화, 로그 부족 |

---

## 🔗 관련 문서

- [기술 스택](../03_architecture/tech-stack.md)
- [시스템 설계](../03_architecture/system-design.md)
- [데이터베이스 스키마](../04_database/database-schema.md)
- [비기능 요구사항](../02_requirements/non-functional.md)

