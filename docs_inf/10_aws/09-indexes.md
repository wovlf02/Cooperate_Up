# 9. DynamoDB 인덱스

> DynamoDB Global Secondary Index (GSI)를 설정하여 쿼리 성능을 최적화합니다.

## 📝 인덱스 설계

### 9.1 인덱스 설계 원칙

DynamoDB에서 효율적인 쿼리를 위해 GSI를 사용합니다:

- **파티션 키**: 데이터 분산을 위한 키 (높은 카디널리티 권장)
- **정렬 키**: 범위 쿼리를 위한 키
- **복합 키**: 여러 필드를 결합한 문자열 (예: `userId#date`)

### 9.2 테이블별 인덱스 목록

#### users 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| username-index | username | - | 로그인 시 사용자 조회 |
| email-index | email | - | 이메일로 사용자 조회 |

#### workplaces 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| ownerId-index | ownerId | - | 사업주별 사업장 목록 |
| inviteCode-index | inviteCode | - | 초대 코드로 사업장 조회 |

#### members 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| userId-index | userId | - | 사용자의 소속 사업장 목록 |

#### attendance 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| userId-date-index | workplaceId | userIdDate | 사용자별, 날짜별 출퇴근 조회 |

**userIdDate 복합 키 형식**: `{userId}#{date}`
예: `user123#2025-12-25`

#### taskCompletions 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| userId-date-index | workplaceId | userIdDate | 사용자별, 날짜별 업무 완료 조회 |

#### contracts 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| employeeId-index | workplaceId | employeeId | 직원별 계약서 조회 |
| status-createdAt-index | workplaceId | statusCreatedAt | 상태별 계약서 목록 |

**statusCreatedAt 복합 키 형식**: `{status}#{createdAt}`
예: `pending#2025-12-25T10:00:00Z`

#### payrolls 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| userId-yearMonth-index | workplaceId | userIdYearMonth | 직원별, 월별 급여 조회 |

**userIdYearMonth 복합 키 형식**: `{userId}#{year}#{month}`
예: `user123#2025#12`

#### announcements 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| isPinned-createdAt-index | workplaceId | isPinnedCreatedAt | 고정 공지 우선, 최신순 정렬 |

**isPinnedCreatedAt 복합 키 형식**: `{isPinned}#{createdAt}`
예: `1#2025-12-25T10:00:00Z` (고정), `0#2025-12-25T10:00:00Z` (일반)

#### approvalRequests 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| status-createdAt-index | workplaceId | statusCreatedAt | 상태별, 최신순 승인 요청 |

**statusCreatedAt 복합 키 형식**: `{status}#{createdAt}`
예: `pending#2025-12-25T10:00:00Z`

#### invitations 테이블
| 인덱스 이름 | 파티션 키 | 정렬 키 | 용도 |
|-------------|-----------|---------|------|
| inviteeId-index | inviteeId | - | 초대받은 사용자의 초대 목록 |

### 9.3 복합 키 유틸리티 함수

`src/utils/dynamoKeyUtils.ts`:

```typescript
// 복합 키 생성
export const createCompositeKey = (...parts: (string | number)[]): string => {
  return parts.join('#');
};

// 복합 키 분해
export const parseCompositeKey = (compositeKey: string): string[] => {
  return compositeKey.split('#');
};

// 출퇴근 조회용 키
export const createUserIdDateKey = (userId: string, date: string): string => {
  return createCompositeKey(userId, date);
};

// 급여 조회용 키
export const createUserIdYearMonthKey = (
  userId: string,
  year: number,
  month: number
): string => {
  return createCompositeKey(userId, year.toString(), month.toString().padStart(2, '0'));
};

// 고정 공지 정렬용 키
export const createIsPinnedCreatedAtKey = (
  isPinned: boolean,
  createdAt: string
): string => {
  return createCompositeKey(isPinned ? '1' : '0', createdAt);
};

// 상태-생성일 정렬용 키
export const createStatusCreatedAtKey = (
  status: string,
  createdAt: string
): string => {
  return createCompositeKey(status, createdAt);
};
```

### 9.4 쿼리 예시

```typescript
import { dynamoService } from './dynamoService';
import { createUserIdDateKey, createIsPinnedCreatedAtKey } from '../utils/dynamoKeyUtils';

// 특정 사용자의 특정 날짜 출퇴근 기록 조회
export const getAttendanceByUserAndDate = async (
  workplaceId: string,
  userId: string,
  date: string
) => {
  const userIdDate = createUserIdDateKey(userId, date);
  
  return dynamoService.query(
    'attendance',
    'workplaceId = :wpId AND userIdDate = :key',
    {
      ':wpId': workplaceId,
      ':key': userIdDate,
    },
    { indexName: 'userId-date-index' }
  );
};

// 특정 사용자의 날짜 범위 출퇴근 기록 조회
export const getAttendanceByDateRange = async (
  workplaceId: string,
  userId: string,
  startDate: string,
  endDate: string
) => {
  const startKey = createUserIdDateKey(userId, startDate);
  const endKey = createUserIdDateKey(userId, endDate);
  
  return dynamoService.query(
    'attendance',
    'workplaceId = :wpId AND userIdDate BETWEEN :start AND :end',
    {
      ':wpId': workplaceId,
      ':start': startKey,
      ':end': endKey,
    },
    { indexName: 'userId-date-index' }
  );
};

// 공지사항 목록 조회 (고정 공지 우선, 최신순)
export const getAnnouncements = async (workplaceId: string, limit: number = 20) => {
  return dynamoService.query(
    'announcements',
    'workplaceId = :wpId',
    { ':wpId': workplaceId },
    {
      indexName: 'isPinned-createdAt-index',
      limit,
      scanIndexForward: false, // 내림차순 (최신순)
    }
  );
};

// 대기 중인 승인 요청 조회
export const getPendingApprovalRequests = async (workplaceId: string) => {
  return dynamoService.query(
    'approval-requests',
    'workplaceId = :wpId AND begins_with(statusCreatedAt, :status)',
    {
      ':wpId': workplaceId,
      ':status': 'pending#',
    },
    {
      indexName: 'status-createdAt-index',
      scanIndexForward: false,
    }
  );
};

// 사용자의 소속 사업장 목록 조회
export const getUserWorkplaces = async (userId: string) => {
  const memberships = await dynamoService.query(
    'members',
    'userId = :uid',
    { ':uid': userId },
    { indexName: 'userId-index' }
  );
  
  // 사업장 상세 정보 조회
  const workplaceIds = memberships.map((m: any) => m.workplaceId);
  const workplaces = await Promise.all(
    workplaceIds.map((id: string) =>
      dynamoService.getItem('workplaces', { id })
    )
  );
  
  return workplaces.filter(Boolean);
};
```

### 9.5 인덱스 생성 스크립트

AWS CLI로 인덱스 생성:

```bash
# attendance 테이블에 GSI 추가
aws dynamodb update-table \
  --table-name biz-one-attendance \
  --attribute-definitions \
    AttributeName=workplaceId,AttributeType=S \
    AttributeName=userIdDate,AttributeType=S \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"userId-date-index\",\"KeySchema\":[{\"AttributeName\":\"workplaceId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"userIdDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}}]"
```

## ✅ 체크리스트

인덱스 설정 완료 확인:

- [ ] 모든 GSI 생성됨
- [ ] 복합 키 유틸리티 함수 구현됨
- [ ] 쿼리 함수에서 인덱스 활용됨

## 📋 인덱스 요약

| 테이블 | 인덱스 수 | 주요 쿼리 패턴 |
|--------|----------|----------------|
| users | 2 | 아이디/이메일로 조회 |
| workplaces | 2 | 사업주별, 초대코드로 조회 |
| members | 1 | 사용자별 소속 ��업장 |
| attendance | 1 | 사용자별 날짜 범위 조회 |
| taskCompletions | 1 | 사용자별 날짜 범위 조회 |
| contracts | 2 | 직원별, 상태별 조회 |
| payrolls | 1 | 직원별 월별 조회 |
| announcements | 1 | 고정 공지 우선 정렬 |
| approvalRequests | 1 | 상태별 최신순 조회 |
| invitations | 1 | 초대받은 사용자별 조회 |

## 🎯 다음 단계

**다음**: [10. 테스트 및 검증](./10-testing.md)

---

## ❓ 문제 해결

**Q: GSI 생성이 느림**
- A: 테이블에 데이터가 많으면 인덱스 빌드에 시간 소요
- A: 테이블 생성 시 GSI를 함께 정의하면 빠름

**Q: 쿼리 결과가 없음**
- A: 복합 키 형식이 정확한지 확인
- A: 인덱스 이름이 올바른지 확인

**Q: "Query key condition not supported"**
- A: GSI의 파티션 키는 반드시 KeyConditionExpression에 포함
- A: 정렬 키는 선택적으로 사용 가능

