# 8. IAM 정책 및 보안

> AWS IAM 정책을 설정하여 리소스 접근을 제어합니다.

## 📝 단계별 가이드

### 8.1 Cognito Identity Pool IAM 역할

Cognito Identity Pool 생성 시 자동으로 두 개의 IAM 역할이 생성됩니다:

- **Cognito_biz-one-identity-poolAuth_Role**: 인증된 사용자용
- **Cognito_biz-one-identity-poolUnauth_Role**: 비인증 사용자용 (사용 안 함)

### 8.2 인증된 사용자 IAM 정책

AWS Console → IAM → 역할 → Cognito_biz-one-identity-poolAuth_Role

**인라인 정책 추가: `BizOneAuthUserPolicy`**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-northeast-2:*:table/biz-one-*",
        "arn:aws:dynamodb:ap-northeast-2:*:table/biz-one-*/index/*"
      ]
    },
    {
      "Sid": "S3ProfileAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::biz-one-storage-*/profiles/${cognito-identity.amazonaws.com:sub}/*"
      ]
    },
    {
      "Sid": "S3WorkplaceAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::biz-one-storage-*/workplaces/*"
      ]
    },
    {
      "Sid": "S3PayslipsRead",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::biz-one-storage-*/payslips/*/${cognito-identity.amazonaws.com:sub}/*"
      ]
    },
    {
      "Sid": "PinpointAccess",
      "Effect": "Allow",
      "Action": [
        "mobiletargeting:UpdateEndpoint",
        "mobiletargeting:GetEndpoint"
      ],
      "Resource": [
        "arn:aws:mobiletargeting:ap-northeast-2:*:apps/*/endpoints/*"
      ]
    }
  ]
}
```

### 8.3 Lambda 실행 역할

Lambda 함수용 IAM 역할: `BizOneLambdaRole`

**신뢰 관계:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**정책: `BizOneLambdaPolicy`**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-2:*:*"
    },
    {
      "Sid": "DynamoDBFullAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-northeast-2:*:table/biz-one-*",
        "arn:aws:dynamodb:ap-northeast-2:*:table/biz-one-*/index/*"
      ]
    },
    {
      "Sid": "S3FullAccess",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::biz-one-storage-*",
        "arn:aws:s3:::biz-one-storage-*/*"
      ]
    },
    {
      "Sid": "PinpointSendMessages",
      "Effect": "Allow",
      "Action": [
        "mobiletargeting:SendMessages",
        "mobiletargeting:SendUsersMessages"
      ],
      "Resource": [
        "arn:aws:mobiletargeting:ap-northeast-2:*:apps/*"
      ]
    },
    {
      "Sid": "CognitoAdminAccess",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminEnableUser"
      ],
      "Resource": [
        "arn:aws:cognito-idp:ap-northeast-2:*:userpool/*"
      ]
    }
  ]
}
```

### 8.4 애플리케이션 레벨 보안

DynamoDB에는 Firestore처럼 문서 레벨 보안 규칙이 없습니다. 대신 애플리케이션 레벨에서 권한을 검증해야 합니다.

**권한 검증 유틸리티:**

`src/utils/authorizationUtils.ts`:

```typescript
import { dynamoService } from '../services/dynamoService';

// 사용자가 사업장의 멤버인지 확인
export const isWorkplaceMember = async (
  workplaceId: string,
  userId: string
): Promise<boolean> => {
  try {
    const member = await dynamoService.getItem('members', {
      workplaceId,
      userId,
    });
    return !!member && member.isActive;
  } catch {
    return false;
  }
};

// 사용자가 사업장의 관리자인지 확인
export const isWorkplaceAdmin = async (
  workplaceId: string,
  userId: string
): Promise<boolean> => {
  try {
    const workplace = await dynamoService.getItem('workplaces', {
      id: workplaceId,
    });
    return workplace?.ownerId === userId;
  } catch {
    return false;
  }
};

// 리소스 접근 권한 확인 (본인 또는 관리자)
export const canAccessResource = async (
  workplaceId: string,
  resourceOwnerId: string,
  currentUserId: string
): Promise<boolean> => {
  // 본인 확인
  if (resourceOwnerId === currentUserId) {
    return true;
  }
  
  // 관리자 확인
  return isWorkplaceAdmin(workplaceId, currentUserId);
};

// 사업장 생성 권한 확인 (관리자 역할만)
export const canCreateWorkplace = async (userId: string): Promise<boolean> => {
  try {
    const user = await dynamoService.getItem('users', { id: userId });
    return user?.role === 'admin';
  } catch {
    return false;
  }
};
```

**서비스에서 권한 검증 적용:**

```typescript
// src/services/attendanceService.ts

import { dynamoService } from './dynamoService';
import { isWorkplaceMember, canAccessResource } from '../utils/authorizationUtils';

export const getAttendance = async (
  workplaceId: string,
  attendanceId: string,
  currentUserId: string
) => {
  // 멤버 권한 확인
  if (!(await isWorkplaceMember(workplaceId, currentUserId))) {
    throw new Error('사업장 멤버만 접근할 수 있습니다.');
  }
  
  const attendance = await dynamoService.getItem('attendance', {
    workplaceId,
    id: attendanceId,
  });
  
  if (!attendance) {
    throw new Error('출퇴근 기록을 찾을 수 없습니다.');
  }
  
  // 본인 또는 관리자만 접근 가능
  if (!(await canAccessResource(workplaceId, attendance.userId, currentUserId))) {
    throw new Error('접근 권한이 없습니다.');
  }
  
  return attendance;
};

export const createAttendance = async (
  workplaceId: string,
  attendanceData: any,
  currentUserId: string
) => {
  // 멤버 권한 확인
  if (!(await isWorkplaceMember(workplaceId, currentUserId))) {
    throw new Error('사업장 멤버만 출퇴근을 기록할 수 있습니다.');
  }
  
  // 본인 기록만 생성 가능
  if (attendanceData.userId !== currentUserId) {
    throw new Error('본인의 출퇴근만 기록할 수 있습니다.');
  }
  
  return dynamoService.putItem('attendance', {
    ...attendanceData,
    workplaceId,
  });
};
```

### 8.5 데이터 접근 권한 매트릭스

| 리소스 | 읽기 | 생성 | 수정 | 삭제 |
|--------|------|------|------|------|
| users | 본인 | 본인 | 본인 | 본인 |
| workplaces | 멤버 | admin 역할 | 사업주 | 사업주 |
| members | 멤버 | 사업주 | 사업주 | 사업주 |
| invitations | 멤버/초대받은자 | 사업주 | 초대받은자 | 사업주 |
| attendance | 본인/사업주 | 본인 | 본인/사업주 | 사업주 |
| checklists | 멤버 | 사업주 | 사업주 | 사업주 |
| taskCompletions | 본인/사업주 | 본인 | 본인/사업주 | 본인/사업주 |
| contracts | 본인/사업주 | 사업주 | 본인(서명)/사업주 | 사업주 |
| payrolls | 본인/사업주 | 사업주 | 사업주 | 사업주 |
| announcements | 멤버 | 사업주 | 사업주 | 사업주 |
| comments | 멤버 | 멤버 | 본인/사업주 | 본인/사업주 |
| chatRooms | 참여자 | 사업주 | 멤버 | 사업주 |
| messages | 멤버 | 본인 | 멤버 | 본인/사업주 |
| approvalRequests | 본인/사업주 | 본인 | 사업주 | 본인/사업주 |

### 8.6 민감 정보 보호

```typescript
// 민감 정보 필터링
const filterSensitiveData = (user: any) => {
  const { fcmToken, ...publicData } = user;
  return publicData;
};

// 사업자등록번호 마스킹
const maskBusinessNumber = (businessNumber: string) => {
  if (!businessNumber || businessNumber.length !== 10) return businessNumber;
  return `${businessNumber.slice(0, 3)}-**-*****`;
};

// 연락처 마스킹
const maskPhoneNumber = (phone: string) => {
  if (!phone) return phone;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
};
```

## ✅ 체크리스트

IAM 및 보안 설정 완료 확인:

- [ ] Cognito Identity Pool 역할 정책 설정됨
- [ ] Lambda 실행 역할 생성됨
- [ ] 애플리케이션 레벨 권한 검증 구현됨
- [ ] 민감 정보 보호 로직 구현됨

## 🔐 보안 모범 사례

1. **최소 권한 원칙**: 필요한 권한만 부여
2. **리소스 기반 정책**: 특정 리소스에만 접근 허용
3. **애플리케이션 레벨 검증**: 모든 요청에 권한 확인
4. **민감 정보 보호**: 마스킹 및 필터링 적용
5. **감사 로그**: CloudTrail로 API 호출 기록

## 🎯 다음 단계

**다음**: [9. DynamoDB 인덱스](./09-indexes.md)

---

## ❓ 문제 해결

**Q: "Access Denied" 오류**
- A: IAM 정책 확인
- A: Cognito Identity Pool 설정 확인
- A: 리소스 ARN 정확성 확인

**Q: 권한 검증이 작동하지 않음**
- A: 애플리케이션 레벨 검증 로직 확인
- A: 비동기 함수 await 누락 확인

