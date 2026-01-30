# 10. 테스트 및 검증

> AWS 서비스 설정을 테스트하고 검증합니다.

## 📝 단계별 가이드

### 10.1 Cognito 인증 테스트

**1. 회원가입 테스트**

```typescript
// 테스트 코드
import { register } from '../services/cognitoService';

const testRegister = async () => {
  try {
    const result = await register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456!',
      name: '테스트 유저',
      phone: '+821012345678',
      birthDate: '19900101',
      role: 'admin',
    });
    console.log('회원가입 성공:', result);
  } catch (error) {
    console.error('회원가입 실패:', error);
  }
};
```

**2. 로그인 테스트**

```typescript
import { login, getCurrentAuthUser } from '../services/cognitoService';

const testLogin = async () => {
  try {
    const result = await login('testuser', 'Test123456!');
    console.log('로그인 성공:', result);
    
    const user = await getCurrentAuthUser();
    console.log('현재 사용자:', user);
  } catch (error) {
    console.error('로그인 실패:', error);
  }
};
```

### 10.2 DynamoDB CRUD 테스트

**1. 아이템 생성/조회 테스트**

```typescript
import { dynamoService } from '../services/dynamoService';

const testDynamoDB = async () => {
  // 생성
  await dynamoService.putItem('users', {
    id: 'test-user-1',
    username: 'testuser',
    email: 'test@example.com',
    name: '테스트 유저',
    role: 'admin',
  });
  console.log('아이템 생성 완료');
  
  // 조회
  const user = await dynamoService.getItem('users', { id: 'test-user-1' });
  console.log('조회 결과:', user);
  
  // 업데이트
  await dynamoService.updateItem(
    'users',
    { id: 'test-user-1' },
    { name: '수정된 이름' }
  );
  console.log('아이템 업데이트 완료');
  
  // 삭제
  await dynamoService.deleteItem('users', { id: 'test-user-1' });
  console.log('아이템 삭제 완료');
};
```

**2. 쿼리 테스트**

```typescript
const testQuery = async () => {
  // 사업장의 멤버 목록 조회
  const members = await dynamoService.query(
    'members',
    'workplaceId = :wpId',
    { ':wpId': 'workplace-1' }
  );
  console.log('멤버 목록:', members);
  
  // GSI를 사용한 쿼리
  const userWorkplaces = await dynamoService.query(
    'members',
    'userId = :uid',
    { ':uid': 'user-1' },
    { indexName: 'userId-index' }
  );
  console.log('사용자 소속 사업장:', userWorkplaces);
};
```

### 10.3 S3 파일 업로드 테스트

```typescript
import { s3Service } from '../services/s3Service';

const testS3Upload = async () => {
  try {
    // 프로필 이미지 업로드 테스트
    const localUri = 'file:///path/to/test/image.jpg';
    const url = await s3Service.uploadProfileImage('user-1', localUri);
    console.log('업로드 완료, URL:', url);
    
    // 다운로드 URL 테스트
    const downloadUrl = await s3Service.getDownloadUrl('profiles/user-1/profile.jpg');
    console.log('다운로드 URL:', downloadUrl);
  } catch (error) {
    console.error('S3 테스트 실패:', error);
  }
};
```

### 10.4 푸시 알림 테스트

```typescript
import { pushService } from '../services/pushService';

const testPushNotification = async () => {
  // 권한 요청
  const granted = await pushService.requestNotificationPermission();
  console.log('알림 권한:', granted);
  
  // FCM 토큰 가져오기
  const token = await pushService.getFCMToken();
  console.log('FCM 토큰:', token);
  
  // 로컬 알림 테스트
  await pushService.displayLocalNotification(
    '테스트 알림',
    '이것은 테스트 알림입니다.',
    { type: 'test' }
  );
};
```

### 10.5 통합 테스트 시나리오

**시나리오 1: 사업주 플로우**

```typescript
const testAdminFlow = async () => {
  // 1. 회원가입 (관리자)
  await register({
    username: 'admin1',
    email: 'admin@test.com',
    password: 'Admin123!',
    name: '관리자',
    phone: '+821012345678',
    birthDate: '19800101',
    role: 'admin',
  });
  
  // 2. 로그인
  await login('admin1', 'Admin123!');
  
  // 3. 사업장 생성
  await dynamoService.putItem('workplaces', {
    id: 'wp-1',
    name: '테스트 사업장',
    address: '서울시 강남구',
    ownerId: 'user-id-from-cognito',
    inviteCode: 'ABC123',
    isActive: true,
  });
  
  // 4. 멤버 추가
  await dynamoService.putItem('members', {
    workplaceId: 'wp-1',
    userId: 'user-id-from-cognito',
    name: '관리자',
    role: 'admin',
    hourlyWage: 10030,
    isActive: true,
  });
  
  console.log('관리자 플로우 테스트 완료');
};
```

**시나리오 2: 직원 플로우**

```typescript
const testEmployeeFlow = async () => {
  // 1. 회원가입 (직원)
  await register({
    username: 'employee1',
    email: 'employee@test.com',
    password: 'Employee123!',
    name: '직원1',
    phone: '+821098765432',
    birthDate: '19950101',
    role: 'employee',
  });
  
  // 2. 로그인
  await login('employee1', 'Employee123!');
  
  // 3. 초대 수락 (멤버로 추가됨)
  // ...
  
  // 4. 출근 기록
  await dynamoService.putItem('attendance', {
    id: 'att-1',
    workplaceId: 'wp-1',
    userId: 'employee-user-id',
    userName: '직원1',
    date: '2025-12-25',
    userIdDate: 'employee-user-id#2025-12-25',
    clockIn: new Date().toISOString(),
    status: 'completed',
    isManualInput: false,
  });
  
  console.log('직원 플로우 테스트 완료');
};
```

### 10.6 에러 핸들링 테스트

```typescript
const testErrorHandling = async () => {
  // 잘못된 자격 증명으로 로그인
  try {
    await login('wronguser', 'wrongpassword');
  } catch (error: any) {
    console.log('예상된 오류:', error.name, error.message);
  }
  
  // 존재하지 않는 아이템 조회
  const result = await dynamoService.getItem('users', { id: 'non-existent' });
  console.log('존재하지 않는 아이템:', result); // undefined
  
  // 권한 없는 작업
  try {
    // 비멤버가 사업장 데이터 접근 시도
    // 애플리케이션 레벨에서 오류 발생
  } catch (error: any) {
    console.log('권한 오류:', error.message);
  }
};
```

### 10.7 Jest 테스트 예시

`__tests__/services/cognitoService.test.ts`:

```typescript
import { register, login, logout } from '../../src/services/cognitoService';

describe('CognitoService', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456!',
    name: '테스트 유저',
    phone: '+821012345678',
    birthDate: '19900101',
    role: 'employee' as const,
  };

  describe('register', () => {
    it('새 사용자를 등록해야 함', async () => {
      const result = await register(testUser);
      expect(result).toBeDefined();
      expect(result.isSignUpComplete).toBe(false); // 이메일 인증 필요
    });

    it('중복 사용자명으로 등록 시 오류 발생해야 함', async () => {
      await expect(register(testUser)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('올바른 자격 증명으로 로그인해야 함', async () => {
      // 이메일 인증 완료된 사용자로 테스트
      const result = await login('verifieduser', 'password');
      expect(result.isSignedIn).toBe(true);
    });

    it('잘못된 비밀번호로 로그인 실패해야 함', async () => {
      await expect(login('verifieduser', 'wrongpassword')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('로그아웃해야 함', async () => {
      await login('verifieduser', 'password');
      await expect(logout()).resolves.not.toThrow();
    });
  });
});
```

### 10.8 테스트 데이터 정리

```typescript
const cleanupTestData = async () => {
  // 테스트 사용자 삭제
  await dynamoService.deleteItem('users', { id: 'test-user-1' });
  await dynamoService.deleteItem('usernames', { username: 'testuser' });
  
  // 테스트 사업장 삭제
  await dynamoService.deleteItem('workplaces', { id: 'wp-1' });
  
  // 테스트 멤버 삭제
  await dynamoService.deleteItem('members', {
    workplaceId: 'wp-1',
    userId: 'test-user-1',
  });
  
  console.log('테스트 데이터 정리 완료');
};
```

## ✅ 체크리스트

테스트 완료 확인:

- [ ] Cognito 회원가입/로그인/로그아웃 테스트
- [ ] DynamoDB CRUD 테스트
- [ ] DynamoDB 쿼리/GSI 테스트
- [ ] S3 업로드/다운로드 테스트
- [ ] 푸시 알림 테스트
- [ ] 통합 시나리오 테스트
- [ ] 에러 핸들링 테스트
- [ ] 테스트 데이터 정리

## 🧪 테스트 명령어

```bash
# 단위 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- cognitoService.test.ts

# 테스트 커버리지
npm test -- --coverage
```

## 🎯 설정 완료

모든 AWS 설정이 완료되었습니다! 🎉

**다음 단계:**
1. 실제 앱에서 각 서비스 연동 확인
2. 프로덕션 배포 전 보안 설정 검토
3. 비용 모니터링 설정

---

## ❓ 문제 해결

**Q: 테스트가 타임아웃됨**
- A: Jest 타임아웃 증가: `jest.setTimeout(30000)`
- A: 네트워크 연결 확인

**Q: 테스트 간 상태 공유 문제**
- A: `beforeEach`/`afterEach`로 상태 초기화
- A: 테스트별 고유 ID 사용

**Q: AWS 자격 증명 오류**
- A: AWS CLI 설정 확인
- A: 환경 변수 설정 확인

