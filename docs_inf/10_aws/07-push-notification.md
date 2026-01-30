# 7. Amazon SNS & Pinpoint (푸시 알림) 설정

> Amazon Pinpoint를 사용하여 푸시 알림을 구현합니다.

## 📝 단계별 가이드

### 7.1 Amazon Pinpoint 프로젝트 생성

AWS Console → Amazon Pinpoint → 프로젝트 생성

**1. 프로젝트 생성**

```
프로젝트 이름: biz-one-notifications
```

**2. 기능 구성**

- ✅ 푸시 알림 활성화
- ✅ 분석 활성화

### 7.2 iOS APNs 설정

**1. Apple Developer에서 APNs 키 생성**

1. https://developer.apple.com/account 접속
2. Certificates, Identifiers & Profiles → Keys
3. "+" 버튼 클릭
4. Key Name: "Biz One APNs Key"
5. ✅ Apple Push Notifications service (APNs) 체크
6. Continue → Register → Download (.p8 파일)

기록할 정보:
```
Key ID: XXXXXXXXXX (10자리)
Team ID: XXXXXXXXXX (10자리)
.p8 파일: AuthKey_XXXXXXXXXX.p8
```

**2. Pinpoint에 APNs 등록**

Pinpoint → 설정 → 푸시 알림:

```
플랫폼: Apple Push Notification service (APNs)
인증 유형: 토큰 기반 인증 (권장)
- 인증 키: .p8 파일 업로드
- 키 ID: XXXXXXXXXX
- 팀 ID: XXXXXXXXXX
- 번들 ID: com.bizone.app
- APNs 환경: 
  - 개발: Development (테스트용)
  - 프로덕션: Production (배포용)
```

### 7.3 Android FCM 설정

**1. Firebase Console에서 서버 키 가져오기**

Firebase Console → 프로젝트 설정 → Cloud Messaging:

```
서버 키: AAAA...xxxx (긴 문자열)
발신자 ID: 123456789012
```

**2. Pinpoint에 FCM 등록**

Pinpoint → 설정 → 푸시 알림:

```
플랫폼: Firebase Cloud Messaging (FCM)
API 키: (Firebase 서버 키)
```

### 7.4 푸시 알림 서비스 구현

`src/services/pushService.ts`:

```typescript
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { dynamoService } from './dynamoService';

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } else {
      // Android 13+ 권한 요청
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1;
    }
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return false;
  }
};

// FCM 토큰 가져오기
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log('FCM 토큰:', token);
    return token;
  } catch (error) {
    console.error('FCM 토큰 가져오기 실패:', error);
    return null;
  }
};

// 사용자 FCM 토큰 업데이트
export const updateUserFCMToken = async (userId: string) => {
  const token = await getFCMToken();
  if (token) {
    await dynamoService.updateItem('users', { id: userId }, { fcmToken: token });
  }
};

// 토큰 갱신 리스너
export const onTokenRefresh = (callback: (token: string) => void) => {
  return messaging().onTokenRefresh(callback);
};

// 포그라운드 메시지 리스너
export const onForegroundMessage = (
  callback: (message: any) => void
) => {
  return messaging().onMessage(callback);
};

// 백그라운드 메시지 핸들러 (index.js에서 설정)
export const setBackgroundMessageHandler = (
  handler: (message: any) => Promise<void>
) => {
  messaging().setBackgroundMessageHandler(handler);
};

// 알림 탭 처리
export const onNotificationOpenedApp = (
  callback: (message: any) => void
) => {
  return messaging().onNotificationOpenedApp(callback);
};

// 앱이 종료된 상태에서 알림으로 열린 경우
export const getInitialNotification = async () => {
  return messaging().getInitialNotification();
};

// 로컬 알림 표시 (포그라운드용)
export const displayLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  // Android 알림 채널 생성
  const channelId = await notifee.createChannel({
    id: 'biz_one_channel',
    name: 'Biz One 알림',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
};

// AWS Lambda를 통한 푸시 알림 전송 (서버 측)
// 실제로는 Lambda 함수에서 Pinpoint API를 호출합니다.
export const sendPushNotification = async (
  targetUserId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    // API Gateway를 통해 Lambda 호출
    const response = await fetch(
      'https://YOUR_API_GATEWAY_URL/send-notification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          title,
          body,
          data,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error('푸시 알림 전송 실패:', error);
    return false;
  }
};

export const pushService = {
  requestNotificationPermission,
  getFCMToken,
  updateUserFCMToken,
  onTokenRefresh,
  onForegroundMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  displayLocalNotification,
  sendPushNotification,
};
```

### 7.5 앱 진입점 설정

`index.js`:

```javascript
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayLocalNotification } from './src/services/pushService';

// 백그라운드 메시지 핸들러
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('백그라운드 메시지 수신:', remoteMessage);
  
  // 알림 데이터에 따른 처리
  const { notification, data } = remoteMessage;
  if (notification) {
    // 필요시 로컬 알림으로 표시
  }
});

AppRegistry.registerComponent(appName, () => App);
```

### 7.6 Lambda 함수 (푸시 알림 전송용)

`lambda/sendNotification.js`:

```javascript
const AWS = require('aws-sdk');
const pinpoint = new AWS.Pinpoint({ region: 'ap-northeast-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const APPLICATION_ID = 'YOUR_PINPOINT_APP_ID';

exports.handler = async (event) => {
  const { targetUserId, title, body, data } = JSON.parse(event.body);
  
  // 사용자의 FCM 토큰 조회
  const userResult = await dynamodb.get({
    TableName: 'biz-one-users',
    Key: { id: targetUserId },
  }).promise();
  
  const fcmToken = userResult.Item?.fcmToken;
  if (!fcmToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'FCM 토큰이 없습니다.' }),
    };
  }
  
  // Pinpoint로 푸시 알림 전송
  const params = {
    ApplicationId: APPLICATION_ID,
    MessageRequest: {
      Addresses: {
        [fcmToken]: {
          ChannelType: 'GCM', // FCM
        },
      },
      MessageConfiguration: {
        GCMMessage: {
          Title: title,
          Body: body,
          Data: data || {},
        },
        APNSMessage: {
          Title: title,
          Body: body,
          Data: data || {},
        },
      },
    },
  };
  
  try {
    await pinpoint.sendMessages(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('푸시 알림 전송 실패:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### 7.7 알림 유형별 설정

```typescript
// 알림 유형
const NOTIFICATION_TYPES = {
  // 출퇴근 관련
  CLOCK_IN_REMINDER: 'clock_in_reminder',
  CLOCK_OUT_REMINDER: 'clock_out_reminder',
  
  // 승인 요청
  APPROVAL_REQUEST: 'approval_request',
  APPROVAL_RESULT: 'approval_result',
  
  // 체크리스트
  CHECKLIST_REMINDER: 'checklist_reminder',
  
  // 공지사항
  NEW_ANNOUNCEMENT: 'new_announcement',
  
  // 채팅
  NEW_MESSAGE: 'new_message',
  
  // 급여
  PAYROLL_CONFIRMED: 'payroll_confirmed',
  
  // 계약서
  CONTRACT_SIGN_REQUEST: 'contract_sign_request',
  CONTRACT_SIGNED: 'contract_signed',
  
  // 초대
  WORKPLACE_INVITATION: 'workplace_invitation',
  INVITATION_ACCEPTED: 'invitation_accepted',
};
```

## ✅ 체크리스트

푸시 알림 설정 완료 확인:

- [ ] Pinpoint 프로젝트 생성됨
- [ ] iOS APNs 설정됨
- [ ] Android FCM 설정됨
- [ ] 앱에서 권한 요청 구현됨
- [ ] FCM 토큰 저장 구현됨
- [ ] 백그라운드 메시지 핸들러 설정됨

## 📋 설정 정보 기록

```
Pinpoint App ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APNs Key ID: XXXXXXXXXX
APNs Team ID: XXXXXXXXXX
FCM Server Key: AAAA...xxxx
```

## 🎯 다음 단계

**다음**: [8. IAM 정책 및 보안](./08-iam-security.md)

---

## ❓ 문제 해결

**Q: iOS 푸시가 수신되지 않음**
- A: APNs 인증서/키 만료 확인
- A: Xcode에서 Push Notifications capability 확인
- A: 실제 기기에서 테스트 (시뮬레이터 미지원)

**Q: Android 푸시가 수신되지 않음**
- A: FCM 서버 키 확인
- A: AndroidManifest.xml 서비스 등록 확인
- A: Android 13+ 알림 권한 런타임 요청 확인

**Q: 백그라운드에서 알림이 표시되지 않음**
- A: Background Modes 설정 확인 (iOS)
- A: 알림 채널 생성 확인 (Android)

