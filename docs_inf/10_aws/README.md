# AWS 설정 가이드

> **Biz_One** 앱의 AWS 설정 완벽 가이드

## 📋 목차

1. [AWS 프로젝트 설정](./01-aws-setup.md)
2. [iOS 앱 설정](./02-ios-setup.md)
3. [Android 앱 설정](./03-android-setup.md)
4. [Amazon Cognito (인증)](./04-cognito.md)
5. [Amazon DynamoDB (데이터베이스)](./05-dynamodb.md)
6. [Amazon S3 (스토리지)](./06-s3.md)
7. [Amazon SNS & Pinpoint (푸시 알림)](./07-push-notification.md)
8. [IAM 정책 및 보안](./08-iam-security.md)
9. [DynamoDB 인덱스](./09-indexes.md)
10. [테스트 및 검증](./10-testing.md)

## 🎯 개요

이 문서는 AWS를 처음 설정하는 분들도 따라할 수 있도록 모든 과정을 상세히 설명합니다.

### 필요한 사전 준비물

- [ ] AWS 계정
- [ ] Xcode 설치 (iOS 개발)
- [ ] Android Studio 설치 (Android 개발)
- [ ] React Native 프로젝트 준비
- [ ] AWS CLI 설치

### 설정할 AWS 서비스

1. **Amazon Cognito** - 사용자 인증 및 권한 관리
2. **Amazon DynamoDB** - NoSQL 데이터베이스
3. **Amazon S3** - 파일 저장소
4. **Amazon SNS / Pinpoint** - 푸시 알림
5. **AWS Lambda** - 서버리스 함수 (필요시)
6. **Amazon API Gateway** - REST API (필요시)

### 예상 소요 시간

- **AWS 기본 설정**: 약 30분
- **iOS 설정**: 약 30분
- **Android 설정**: 약 30분
- **서비스 설정**: 약 1시간
- **IAM 정책 설정**: 약 30분
- **총 소요 시간**: 약 3-4시간

## 🚀 빠른 시작

1. [AWS 프로젝트 설정](./01-aws-setup.md)부터 순서대로 진행하세요.
2. 각 단계의 체크리스트를 확인하며 진행하세요.
3. 문제가 발생하면 각 문서의 "문제 해결" 섹션을 참고하세요.

## 💡 중요 참고사항

- AWS **프리 티어**로 시작 가능합니다
- 5명의 사용자가 사용하므로 월 비용은 매우 낮습니다
- 모든 설정은 AWS Console에서 진행됩니다
- IAM 정책은 반드시 설정해야 합니다

## 💰 예상 비용 (월간)

| 서비스 | 프리 티어 | 예상 비용 |
|--------|-----------|-----------|
| Cognito | 50,000 MAU 무료 | $0 |
| DynamoDB | 25GB 무료 | $0 |
| S3 | 5GB 무료 | $0 ~ $1 |
| SNS | 100만 건 무료 | $0 |
| **합계** | | **$0 ~ $1** |

## 📞 문제 해결

문제가 발생하면:
1. 각 문서의 "문제 해결" 섹션 확인
2. AWS 공식 문서 참고: https://docs.aws.amazon.com/
3. AWS Amplify 문서: https://docs.amplify.aws/

---

**시작하기**: [1. AWS 프로젝트 설정](./01-aws-setup.md)

