# 4. Amazon Cognito 설정

> Amazon Cognito를 사용하여 사용자 인증을 구현합니다.

## 📝 단계별 가이드

### 4.1 Cognito User Pool 생성

**AWS Console → Cognito → 사용자 풀 생성**

**Step 1: 로그인 환경 구성**

```
인증 공급자:
- ✅ Cognito 사용자 풀

Cognito 사용자 풀 로그인 옵션:
- ✅ 사용자 이름 (Username)
- ✅ 이메일

사용자 이름 요구 사항:
- ✅ 대소문자 구분 안 함
```

**Step 2: 보안 요구 사항 구성**

```
암호 정책:
- 최소 길이: 8자
- ✅ 숫자 포함
- ✅ 특수 문자 포함
- ✅ 대문자 포함
- ✅ 소문자 포함

다중 인증(MFA):
- ○ MFA 없음 (개발용)
- ● 선택적 MFA (프로덕션 권장)

계정 복구:
- ✅ 이메일만
```

**Step 3: 가입 환경 구성**

```
자체 등록:
- ✅ 자체 등록 활성화

속성 확인:
- ✅ Cognito가 확인 및 복구를 위해 메시지를 자동으로 전송하도록 허용
- 확인할 속성: 이메일

필수 속성:
- email
- name
- phone_number

사용자 지정 속성 추가:
- custom:username (문자열)
- custom:role (문자열) - admin/employee
- custom:birthDate (문자열)
- custom:workplaceIds (문자열)
- custom:currentWorkplaceId (문자열)
```

**Step 4: 메시지 전송 구성**

```
이메일 공급자:
- ○ Cognito로 이메일 전송 (개발/테스트용, 하루 50건)
- ● Amazon SES로 이메일 전송 (프로덕션용)

발신자 이메일:
- noreply@yourdomain.com (SES에서 확인된 이메일)
```

**Step 5: 앱 통합**

```
사용자 풀 이름: biz-one-user-pool

호스팅 UI:
- ❌ Cognito 호스팅 UI 사용 안 함 (커스텀 UI 사용)

앱 클라이언트:
- 앱 클라이언트 이름: biz-one-app
- ✅ 클라이언트 보안 정보 생성 안 함
- 인증 흐름:
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_REFRESH_TOKEN_AUTH
  - ✅ ALLOW_USER_SRP_AUTH
```

**Step 6: 검토 및 생성**

생성 완료 후 기록할 정보:
```
User Pool ID: ap-northeast-2_xxxxxxxxx
App Client ID: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.2 Identity Pool 생성

**Cognito → 자격 증명 풀 → 자격 증명 풀 생성**

```
자격 증명 풀 이름: biz-one-identity-pool

인증 공급자:
- ✅ Amazon Cognito 사용자 풀
  - User Pool ID: ap-northeast-2_xxxxxxxxx
  - App Client ID: xxxxxxxxxxxxxxxxxxxxxxxxxx

인증되지 않은 액세스:
- ❌ 인증되지 않은 액세스 허용 안 함
```

생성 완료 후 기록:
```
Identity Pool ID: ap-northeast-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4.3 React Native 코드 구현

**1. Cognito 서비스 파일 생성**

`src/services/cognitoService.ts`:

```typescript
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  updateUserAttributes,
  fetchUserAttributes,
} from 'aws-amplify/auth';

// 회원가입
export const register = async (data: {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: string;
  role: 'admin' | 'employee';
}) => {
  try {
    const result = await signUp({
      username: data.username,
      password: data.password,
      options: {
        userAttributes: {
          email: data.email,
          name: data.name,
          phone_number: data.phone,
          'custom:username': data.username,
          'custom:role': data.role,
          'custom:birthDate': data.birthDate,
        },
      },
    });
    return result;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 이메일 인증 코드 확인
export const confirmRegistration = async (username: string, code: string) => {
  try {
    const result = await confirmSignUp({
      username,
      confirmationCode: code,
    });
    return result;
  } catch (error) {
    console.error('인증 확인 실패:', error);
    throw error;
  }
};

// 인증 코드 재전송
export const resendConfirmationCode = async (username: string) => {
  try {
    await resendSignUpCode({ username });
  } catch (error) {
    console.error('인증 코드 재전송 실패:', error);
    throw error;
  }
};

// 로그인
export const login = async (username: string, password: string) => {
  try {
    const result = await signIn({
      username,
      password,
    });
    return result;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};

// 비밀번호 재설정 요청
export const forgotPassword = async (username: string) => {
  try {
    const result = await resetPassword({ username });
    return result;
  } catch (error) {
    console.error('비밀번호 재설정 요청 실패:', error);
    throw error;
  }
};

// 비밀번호 재설정 확인
export const confirmForgotPassword = async (
  username: string,
  code: string,
  newPassword: string
) => {
  try {
    await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword,
    });
  } catch (error) {
    console.error('비밀번호 재설정 확인 실패:', error);
    throw error;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentAuthUser = async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('현재 사용자 정보 가져오기 실패:', error);
    return null;
  }
};

// 인증 세션 가져오기
export const getAuthSession = async () => {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch (error) {
    console.error('인증 세션 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 속성 가져오기
export const getUserAttributes = async () => {
  try {
    const attributes = await fetchUserAttributes();
    return attributes;
  } catch (error) {
    console.error('사용자 속성 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 속성 업데이트
export const updateUserAttribute = async (
  attributeKey: string,
  value: string
) => {
  try {
    await updateUserAttributes({
      userAttributes: {
        [attributeKey]: value,
      },
    });
  } catch (error) {
    console.error('사용자 속성 업데이트 실패:', error);
    throw error;
  }
};
```

### 4.4 사용자 이름(아이디) 중복 확인

DynamoDB의 `usernames` 테이블을 사용하여 중복 확인:

```typescript
// src/services/userService.ts

import { dynamoService } from './dynamoService';

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const result = await dynamoService.getItem('usernames', { username });
    return !!result;
  } catch (error) {
    return false;
  }
};

export const reserveUsername = async (username: string, userId: string) => {
  await dynamoService.putItem('usernames', {
    username,
    userId,
    createdAt: new Date().toISOString(),
  });
};
```

## ✅ 체크리스트

Cognito 설정 완료 확인:

- [ ] User Pool 생성됨
- [ ] App Client 생성됨
- [ ] Identity Pool 생성됨
- [ ] 사용자 지정 속성 추가됨
- [ ] 앱 코드에서 Cognito 연동됨

## 📋 설정 값 기록

```
User Pool ID: ap-northeast-2_xxxxxxxxx
App Client ID: xxxxxxxxxxxxxxxxxxxxxxxxxx
Identity Pool ID: ap-northeast-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🧪 테스트용 계정 생성

AWS Console → Cognito → 사용자 풀 → 사용자:

1. "사용자 생성" 클릭
2. 정보 입력:
   ```
   사용자 이름: admin
   이메일: admin@workhours.com
   임시 비밀번호: Test123456!
   ```

## 🎯 다음 단계

**다음**: [5. Amazon DynamoDB (데이터베이스)](./05-dynamodb.md)

---

## ❓ 문제 해결

**Q: 회원가입 시 이메일 인증 코드가 오지 않음**
- A: Cognito 기본 이메일은 하루 50건 제한
- A: 스팸 폴더 확인
- A: Amazon SES 연동 권장

**Q: 로그인 실패 - "User not confirmed"**
- A: 이메일 인증이 완료되지 않은 상태
- A: `resendConfirmationCode` 호출 후 인증 완료

**Q: 비밀번호 정책 오류**
- A: 8자 이상, 대/소문자, 숫자, 특수문자 포함 필요

