# 5. Amazon DynamoDB 설정

> DynamoDB 데이터베이스를 생성하고 설정합니다.

## 📝 단계별 가이드

### 5.1 DynamoDB 테이블 생성

AWS Console → DynamoDB → 테이블 생성

#### 5.1.1 users 테이블 (전역 사용자)

```
테이블 이름: biz-one-users
파티션 키: id (문자열)

테이블 설정:
- ○ 기본 설정
- ● 설정 사용자 지정
  - 읽기/쓰기 용량 모드: 온디맨드
```

**GSI (Global Secondary Index) 추가:**
- 인덱스 이름: `username-index`
- 파티션 키: `username` (문자열)

- 인덱스 이름: `email-index`
- 파티션 키: `email` (문자열)

#### 5.1.2 usernames 테이블 (아이디 중복 확인용)

```
테이블 이름: biz-one-usernames
파티션 키: username (문자열)
```

#### 5.1.3 workplaces 테이블 (사업장)

```
테이블 이름: biz-one-workplaces
파티션 키: id (문자열)

GSI:
- 인덱스 이름: ownerId-index
- 파티션 키: ownerId (문자열)

- 인덱스 이름: inviteCode-index
- 파티션 키: inviteCode (문자열)
```

#### 5.1.4 members 테이블 (사업장 멤버)

```
테이블 이름: biz-one-members
파티션 키: workplaceId (문자열)
정렬 키: userId (문자열)

GSI:
- 인덱스 이름: userId-index
- 파티션 키: userId (문자열)
```

#### 5.1.5 attendance 테이블 (출퇴근 기록)

```
테이블 이름: biz-one-attendance
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: userId-date-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: userIdDate (문자열)  // userId#date 복합키
```

#### 5.1.6 checklists 테이블 (체크리스트)

```
테이블 이름: biz-one-checklists
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)
```

#### 5.1.7 checklistItems 테이블 (체크리스트 항목)

```
테이블 이름: biz-one-checklist-items
파티션 키: checklistId (문자열)
정렬 키: id (문자열)
```

#### 5.1.8 taskCompletions 테이블 (업무 완료 기록)

```
테이블 이름: biz-one-task-completions
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: userId-date-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: userIdDate (문자열)
```

#### 5.1.9 contracts 테이블 (근로계약서)

```
테이블 이름: biz-one-contracts
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: employeeId-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: employeeId (문자열)
```

#### 5.1.10 payrolls 테이블 (급여)

```
테이블 이름: biz-one-payrolls
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: userId-yearMonth-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: userIdYearMonth (문자열)  // userId#year#month
```

#### 5.1.11 announcements 테이블 (공지사항)

```
테이블 이름: biz-one-announcements
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: isPinned-createdAt-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: isPinnedCreatedAt (문자열)  // isPinned#createdAt
```

#### 5.1.12 comments 테이블 (댓글)

```
테이블 이름: biz-one-comments
파티션 키: announcementId (문자열)
정렬 키: id (문자열)
```

#### 5.1.13 chatRooms 테이블 (채팅방)

```
테이블 이름: biz-one-chat-rooms
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)
```

#### 5.1.14 messages 테이블 (채팅 메시지)

```
테이블 이름: biz-one-messages
파티션 키: chatRoomId (문자열)
정렬 키: id (문자열)
```

#### 5.1.15 approvalRequests 테이블 (승인 요청)

```
테이블 이름: biz-one-approval-requests
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱스 이름: status-createdAt-index
- 파티션 키: workplaceId (문자열)
- 정렬 키: statusCreatedAt (문자열)
```

#### 5.1.16 invitations 테이블 (초대)

```
테이블 이름: biz-one-invitations
파티션 키: workplaceId (문자열)
정렬 키: id (문자열)

GSI:
- 인덱��� 이름: inviteeId-index
- 파티션 키: inviteeId (문자열)
```

#### 5.1.17 config 테이블 (전역 설정)

```
테이블 이름: biz-one-config
파티션 키: configType (문자열)
정렬 키: id (문자열)
```

### 5.2 DynamoDB 서비스 구현

`src/services/dynamoService.ts`:

```typescript
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocument, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand, 
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';

const TABLE_PREFIX = 'biz-one-';

// DynamoDB 클라이언트 초기화
const getDynamoClient = async () => {
  const session = await fetchAuthSession();
  const credentials = session.credentials;
  
  const client = new DynamoDB({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: credentials?.accessKeyId || '',
      secretAccessKey: credentials?.secretAccessKey || '',
      sessionToken: credentials?.sessionToken,
    },
  });
  
  return DynamoDBDocument.from(client);
};

// 아이템 조회
export const getItem = async (tableName: string, key: Record<string, any>) => {
  const client = await getDynamoClient();
  const result = await client.send(new GetCommand({
    TableName: TABLE_PREFIX + tableName,
    Key: key,
  }));
  return result.Item;
};

// 아이템 저장
export const putItem = async (tableName: string, item: Record<string, any>) => {
  const client = await getDynamoClient();
  await client.send(new PutCommand({
    TableName: TABLE_PREFIX + tableName,
    Item: {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));
};

// 아이템 업데이트
export const updateItem = async (
  tableName: string,
  key: Record<string, any>,
  updates: Record<string, any>
) => {
  const client = await getDynamoClient();
  
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};
  
  Object.entries(updates).forEach(([field, value], index) => {
    const attrName = `#field${index}`;
    const attrValue = `:value${index}`;
    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionAttributeNames[attrName] = field;
    expressionAttributeValues[attrValue] = value;
  });
  
  // updatedAt 자동 추가
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  
  await client.send(new UpdateCommand({
    TableName: TABLE_PREFIX + tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
};

// 아이템 삭제
export const deleteItem = async (tableName: string, key: Record<string, any>) => {
  const client = await getDynamoClient();
  await client.send(new DeleteCommand({
    TableName: TABLE_PREFIX + tableName,
    Key: key,
  }));
};

// 쿼리 (파티션 키 기반)
export const query = async (
  tableName: string,
  keyCondition: string,
  expressionValues: Record<string, any>,
  options?: {
    indexName?: string;
    limit?: number;
    scanIndexForward?: boolean;
    filterExpression?: string;
    expressionAttributeNames?: Record<string, string>;
  }
) => {
  const client = await getDynamoClient();
  const result = await client.send(new QueryCommand({
    TableName: TABLE_PREFIX + tableName,
    IndexName: options?.indexName,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    FilterExpression: options?.filterExpression,
    Limit: options?.limit,
    ScanIndexForward: options?.scanIndexForward ?? true,
  }));
  return result.Items || [];
};

// 스캔 (전체 테이블)
export const scan = async (
  tableName: string,
  filterExpression?: string,
  expressionValues?: Record<string, any>
) => {
  const client = await getDynamoClient();
  const result = await client.send(new ScanCommand({
    TableName: TABLE_PREFIX + tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionValues,
  }));
  return result.Items || [];
};

export const dynamoService = {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  query,
  scan,
};
```

### 5.3 데이터 모델 예시

**User 모델:**
```typescript
interface User {
  id: string;                         // Cognito User ID
  username: string;                   // 아이디 (로그인용)
  email: string;
  emailVerified: boolean;
  name: string;
  phone: string;
  birthDate: string;                  // YYYYMMDD
  profileImage: string | null;
  role: 'admin' | 'employee';
  businessNumber: string | null;
  businessVerified: boolean;
  fcmToken: string | null;
  workplaceIds: string[];
  currentWorkplaceId: string | null;
  createdAt: string;                  // ISO 8601
  updatedAt: string;
}
```

**Attendance 모델:**
```typescript
interface Attendance {
  id: string;
  workplaceId: string;
  userId: string;
  userName: string;
  date: string;                       // YYYY-MM-DD
  userIdDate: string;                 // userId#date (GSI용)
  clockIn: string | null;             // ISO 8601
  clockOut: string | null;
  effectiveClockIn: string | null;
  effectiveClockOut: string | null;
  clockInLocation: {
    latitude: number;
    longitude: number;
  } | null;
  clockOutLocation: {
    latitude: number;
    longitude: number;
  } | null;
  workMinutes: number;
  hourlyWage: number;
  wage: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  isManualInput: boolean;
  isEarlyCheckIn: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## ✅ 체크리스트

DynamoDB 설정 완료 확인:

- [ ] 모든 테이블 생성됨 (17개)
- [ ] GSI 인덱스 생성됨
- [ ] 온디맨드 용량 모드 설정됨
- [ ] 앱 코드에서 DynamoDB 연동됨

## 📋 테이블 목록

| 테이블명 | 파티션 키 | 정렬 키 | GSI |
|----------|-----------|---------|-----|
| biz-one-users | id | - | username-index, email-index |
| biz-one-usernames | username | - | - |
| biz-one-workplaces | id | - | ownerId-index, inviteCode-index |
| biz-one-members | workplaceId | userId | userId-index |
| biz-one-attendance | workplaceId | id | userId-date-index |
| biz-one-checklists | workplaceId | id | - |
| biz-one-checklist-items | checklistId | id | - |
| biz-one-task-completions | workplaceId | id | userId-date-index |
| biz-one-contracts | workplaceId | id | employeeId-index |
| biz-one-payrolls | workplaceId | id | userId-yearMonth-index |
| biz-one-announcements | workplaceId | id | isPinned-createdAt-index |
| biz-one-comments | announcementId | id | - |
| biz-one-chat-rooms | workplaceId | id | - |
| biz-one-messages | chatRoomId | id | - |
| biz-one-approval-requests | workplaceId | id | status-createdAt-index |
| biz-one-invitations | workplaceId | id | inviteeId-index |
| biz-one-config | configType | id | - |

## 🎯 다음 단계

**다음**: [6. Amazon S3 (스토리지)](./06-s3.md)

---

## ❓ 문제 해결

**Q: 테이블 생성 실패**
- A: IAM 권한 확인 (DynamoDB 전체 액세스)
- A: 테이블 이름 중복 확인

**Q: 쿼리 속도가 느림**
- A: GSI 인덱스가 올바르게 생성되었는지 확인
- A: 파티션 키 설계 검토

