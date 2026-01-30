# 1. AWS 프로젝트 설정

> AWS Console에서 프로젝트 환경을 구성합니다.

## 📝 단계별 가이드

### 1.1 AWS 계정 생성/로그인

1. **AWS Console 접속**
   - 브라우저에서 https://aws.amazon.com/console/ 접속
   - AWS 계정으로 로그인 (계정이 없으면 생성)

2. **리전 선택**
   - 우측 상단에서 리전 선택
   - 권장 리전: `ap-northeast-2` (서울)

### 1.2 AWS CLI 설치 및 설정

**1. AWS CLI 설치**

```bash
# Windows (PowerShell 관리자 모드)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# 설치 확인
aws --version
```

**2. IAM 사용자 생성**

AWS Console → IAM → 사용자:

1. "사용자 추가" 클릭
2. 사용자 이름: `biz-one-admin`
3. AWS 자격 증명 유형: "액세스 키 - 프로그래밍 방식 액세스" 선택
4. 권한: "기존 정책 직접 연결" → "AdministratorAccess" (개발용)
5. 생성 완료 후 **Access Key ID**와 **Secret Access Key** 저장

**3. AWS CLI 구성**

```bash
aws configure

# 입력 항목:
AWS Access Key ID: AKIA...
AWS Secret Access Key: ****
Default region name: ap-northeast-2
Default output format: json
```

### 1.3 AWS Amplify CLI 설치 (선택사항)

```bash
# Amplify CLI 설치
npm install -g @aws-amplify/cli

# Amplify 구성
amplify configure
```

### 1.4 프로젝트 구조 설정

프로젝트에 AWS 설정 파일 구조:

```
src/
├── config/
│   └── aws-config.ts          # AWS 설정
├── services/
│   ├── cognitoService.ts      # 인증 서비스
│   ├── dynamoService.ts       # DB 서비스
│   ├── s3Service.ts           # 스토리지 서비스
│   └── pushService.ts         # 푸시 알림 서비스
└── ...
```

## ✅ 체크리스트

프로젝트 설정 완료 확인:

- [ ] AWS Console에 접근 가능
- [ ] 리전이 서울(ap-northeast-2)로 설정됨
- [ ] AWS CLI가 설치되고 구성됨
- [ ] IAM 사용자 생성 및 Access Key 저장

## 📋 프로젝트 정보 기록

나중에 필요하니 아래 정보를 기록하세요:

```
프로젝트 이름: Biz_One
리전: ap-northeast-2 (서울)
IAM 사용자: biz-one-admin
Access Key ID: AKIA________________
```

## 🔍 AWS Console 구조 이해

AWS Console에서 사용할 주요 서비스:

```
🔐 보안, 자격 증명 및 규정 준수
  - IAM (사용자/정책 관리)
  - Cognito (인증)

💾 데이터베이스
  - DynamoDB (NoSQL)

📦 스토리지
  - S3 (파일 저장소)

📧 애플리케이션 통합
  - SNS (Simple Notification Service)
  - Pinpoint (푸시 알림)

⚡ 컴퓨팅
  - Lambda (서버리스 함수)

🔗 네트워킹
  - API Gateway (REST API)
```

우리가 사용할 서비스:
- ✅ Cognito (인증)
- ✅ DynamoDB (데이터베이스)
- ✅ S3 (스토리지)
- ✅ SNS/Pinpoint (푸시 알림)

## 🎯 다음 단계

AWS 기본 설정이 완료되었습니다!

**다음**: [2. iOS 앱 설정](./02-ios-setup.md)

---

## 💡 팁

- AWS 프리 티어로 시작하면 12개월간 무료 사용 가능
- 5명의 사용자 규모에서는 거의 무료로 사용 가능
- 비용 알림을 설정하여 예상치 못한 요금 방지

## ❓ 문제 해결

**Q: AWS CLI 설치 후 명령어가 인식되지 않아요**
- A: 터미널을 재시작하세요
- A: 환경 변수 PATH에 AWS CLI 경로 추가

**Q: Access Key를 분실했어요**
- A: IAM에서 새 Access Key 생성 가능
- A: 기존 키는 비활성화 후 삭제

**Q: 리전을 잘못 선택했어요**
- A: AWS Console 우측 상단에서 언제든 변경 가능
- A: 단, 이미 생성된 리소스는 해당 리전에 남음

